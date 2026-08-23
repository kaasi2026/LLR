<script lang="ts">
	import { onMount } from 'svelte';
	import hotkeys from 'hotkeys-js';
	import OptionDeck from './OptionDeck.svelte';
	import ChallengePanel from '../ChallengePanel.svelte';
	import { prepareChallenge } from '$lib/generic';
	import type { AnswerOption } from '../types';

	let {
		currentChallenge,
		alternativeChallenges,
		resolveChallenge,
		registerResult,
		skipChallenge,
		skipAllChallenges
	} = $props();

	let selectedOption = $state(null);
	let submitted = $state(false);

	let options: AnswerOption[] = $derived(
		prepareChallenge({
			currentChallenge,
			alternativeChallenges,
			typeToSelect: 'cards',
			hasFakeOption: true
		})
	);

	const finishChallenge = () => {
		selectedOption = null;
		submitted = false;
		resolveChallenge();
	};

	const submitChallenge = (e?: Event) => {
		e?.preventDefault();
		if (selectedOption === null) return;
		registerResult(options[selectedOption].correct);
		submitted = true;
	};

	onMount(() => {
		hotkeys.unbind('enter');
		hotkeys('enter', () => {
			if (submitted) {
				finishChallenge();
			} else {
				submitChallenge();
			}
		});
	});
</script>

<p class="is-size-1 is-size-2-tablet is-size-4-mobile has-text-centered">
	Which of these is
	<strong data-test="meaning-in-source-language">{currentChallenge.meaningInSourceLanguage}</strong>
	?
</p>

<form onsubmit={submitChallenge}>
	<OptionDeck {options} bind:selectedOption disabled={submitted} />

	{#if selectedOption === null && !submitted}
		<ChallengePanel
			skipAction={skipChallenge}
			skipAllAction={skipAllChallenges}
		/>
	{/if}

	{#if !submitted && selectedOption !== null}
		<ChallengePanel
			message=""
			buttonText="Submit"
			submit
			skipAction={skipChallenge}
			skipAllAction={skipAllChallenges}
		/>
	{/if}

	{#if submitted && selectedOption !== null}
		{#if options[selectedOption].correct}
			<ChallengePanel
				message="Correct solution!"
				buttonText="Continue"
				correct
				buttonAction={finishChallenge}
			/>
		{/if}
		{#if !options[selectedOption].correct}
			<ChallengePanel
				message="Incorrect solution!"
				buttonText="Continue"
				incorrect
				buttonAction={finishChallenge}
			/>
		{/if}
	{/if}
</form>

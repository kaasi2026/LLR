<script lang="ts">
	import { onMount } from 'svelte';
	import hotkeys from 'hotkeys-js';
	import Options from '../Options.svelte';
	import ChallengePanel from '../ChallengePanel.svelte';
	import { prepareChallenge } from '$lib/generic';

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

	let options = $derived(
		prepareChallenge({
			currentChallenge,
			alternativeChallenges,
			typeToSelect: 'options'
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
		registerResult(options[selectedOption]?.correct);
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
	<strong data-test="meaning-in-source-language">
		{currentChallenge.meaningInSourceLanguage}
	</strong>
	?
</p>

<form onsubmit={(e) => e.preventDefault()}>
	<Options {options} bind:selectedOption disabled={submitted} />

	{#if !submitted && selectedOption !== null}
		<ChallengePanel
			message=""
			buttonText="Submit"
			skipAction={skipChallenge}
			skipAllAction={skipAllChallenges}
			buttonAction={submitChallenge}
		/>
	{/if}

	{#if !submitted && selectedOption === null}
		<ChallengePanel
			message=""
			buttonText=""
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
				messageDetail={`Correct answer: ${currentChallenge.formInTargetLanguage}`}
				buttonText="Continue"
				incorrect
				buttonAction={finishChallenge}
			/>
		{/if}
	{/if}
</form>

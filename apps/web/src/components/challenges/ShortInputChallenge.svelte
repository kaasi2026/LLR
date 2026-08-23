<script lang="ts">
	import { onMount } from 'svelte';
	import hotkeys from 'hotkeys-js';
	import ChallengePanel from './ChallengePanel.svelte';
	import Phrase from './Phrase.svelte';
	import InputFieldWithVirtualKeyboard from './InputFieldWithVirtualKeyboard/InputFieldWithVirtualKeyboard.svelte';
	import Column from 'components/Column.svelte';
	import Columns from 'components/Columns.svelte';
	import evaluateAnswer from 'answer-corrector/src/index';

	// TODO: remove this
	function shuffle<T>(array: T[]): T[] {
		const result = [...array];
		for (let i = result.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[result[i], result[j]] = [result[j], result[i]];
		}
		return result;
	}

	let {
		challenge,
		registerResult,
		resolveChallenge,
		languageName,
		languageCode,
		specialCharacters,
		skipChallenge,
		skipAllChallenges
	} = $props();

	let answer: string | null = $state('');
	let submitted = $state(false);
	let correct: boolean | null = $state(null);
	let spellingSuggestion = $state('');
	let picture = $derived(shuffle(challenge.pictures)[0]);

	const submitChallenge = (e?: Event) => {
		e?.preventDefault();
		if (!answer) return;
		if (submitted) return;

		const validationResults = evaluateAnswer({
			validAnswers: challenge.formInTargetLanguage,
			answer: answer
		});

		correct = validationResults.correct;
		spellingSuggestion = validationResults.suggestion;

		registerResult(correct);
		submitted = true;
	};

	const finishChallenge = () => {
		answer = null;
		submitted = false;
		resolveChallenge();
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

<form onsubmit={submitChallenge}>
	<div class="section">
		<p class="is-size-1 is-size-2-tablet is-size-4-mobile has-text-centered">
			Type
			<Phrase phrase={challenge.phrase} />
			in
			{languageName}!
		</p>
	</div>
	<Columns>
		<Column>
			<InputFieldWithVirtualKeyboard
				{specialCharacters}
				{languageCode}
				disabled={submitted}
				bind:value={answer}
			/>
		</Column>
		<Column>
			<div class="card">
				<div class="card-image">
					<figure class="image is-1by1">
						{#if picture}
							<img src={`/images/${picture}`} alt="" data-test="short text input illustrations" />
						{:else}
							<!-- placeholder when no picture available -->
							<div style="width:100%;height:100%;background:#f6f6f8"></div>
						{/if}
					</figure>
				</div>
			</div>
		</Column>
	</Columns>

	{#if answer && !submitted}
		<ChallengePanel
			message=""
			buttonText="Submit"
			submit
			skipAction={skipChallenge}
			skipAllAction={skipAllChallenges}
		/>
	{/if}

	{#if answer === '' && !submitted}
		<ChallengePanel
			skipAction={skipChallenge}
			skipAllAction={skipAllChallenges}
		/>
	{/if}

	{#if submitted}
		{#if !correct}
			<ChallengePanel
				message="Incorrect solution!"
				messageDetail={`Correct answer: ${challenge.formInTargetLanguage[0]}`}
				buttonText="Continue"
				incorrect
				buttonAction={finishChallenge}
			/>
		{/if}
		{#if correct}
			{#if !spellingSuggestion}
				<ChallengePanel
					message="Correct solution!"
					messageDetail=""
					buttonText="Continue"
					correct
					buttonAction={finishChallenge}
				/>
			{/if}

			{#if spellingSuggestion}
				<ChallengePanel
					message="You have a typo!"
					messageDetail={spellingSuggestion}
					buttonText="Continue"
					typo
					buttonAction={finishChallenge}
				/>
			{/if}
		{/if}
	{/if}
</form>

<style>
	.card {
		max-width: 16em;
		margin: auto;
	}
</style>

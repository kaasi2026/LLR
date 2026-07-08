<script lang="ts">
	import ChallengePanel from './ChallengePanel.svelte';

	export let challenge;
	export let registerResult;
	export let resolveChallenge;
	export let skipChallenge;
	export let skipAllChallenges;
	export let specialCharacters = [];

	let userAnswer = '';
	let hasSubmitted = false;
	let isCorrect = false;

	function checkAnswer() {
		if (!userAnswer.trim()) return;

		const cleanUser = userAnswer.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
		const cleanAnswer = challenge.answer.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");

		isCorrect = cleanUser === cleanAnswer;
		registerResult(isCorrect);
		hasSubmitted = true;
	}

	function handleContinue() {
		resolveChallenge();
		userAnswer = '';
		hasSubmitted = false;
		isCorrect = false;
	}

	function insertCharacter(char: string) {
		userAnswer += char;
	}
</script>

<div class="transform-phrase-container">
	<h2 class="instruction">{challenge.instruction}</h2>

	<div class="challenge-text">
		{challenge.challengeText}
	</div>

	<div class="input-container">
		<input
			type="text"
			bind:value={userAnswer}
			placeholder="Type your answer here..."
			disabled={hasSubmitted}
			on:keydown={(e) => e.key === 'Enter' && !hasSubmitted && checkAnswer()}
		/>
	</div>

	{#if !hasSubmitted && specialCharacters.length > 0}
		<div class="special-characters">
			{#each specialCharacters as char}
				<button type="button" on:click={() => insertCharacter(char)}>{char}</button>
			{/each}
		</div>
	{/if}
</div>

{#if !hasSubmitted}
	<ChallengePanel
		buttonText="Check"
		buttonAction={checkAnswer}
		skipAction={skipChallenge}
		skipAllAction={skipAllChallenges}
	/>
{:else}
	<ChallengePanel
		buttonText="Continue"
		buttonAction={handleContinue}
		correct={isCorrect}
		incorrect={!isCorrect}
		message={isCorrect ? "Excellent !" : "Oops, that's not quite right."}
		messageDetail={!isCorrect ? `The correct answer was: ${challenge.answer}` : null}
		skipAllAction={skipAllChallenges}
	/>
{/if}

<style type="text/scss">
	.transform-phrase-container {
		text-align: center;
		max-width: 600_px;
		margin: 0 auto;
		padding: 1em;
	}

	.instruction {
		font-size: 1.4em;
		color: #4a4a4a;
		margin-bottom: 1.5em;
	}

	.challenge-text {
		font-size: 1.8em;
		font-weight: bold;
		color: #2b2b2b;
		background: #f5f5f5;
		padding: 0.8em;
		border-radius: 8_px;
		margin-bottom: 1.5em;
	}

	.input-container input {
		width: 100%;
		font-size: 1.4em;
		padding: 0.6em;
		border: 2_px solid #ccc;
		border-radius: 8_px;
		outline: none;
		transition: border-color 0.2s;

		&:focus {
			border-color: #4a90e2;
		}

		&:disabled {
			background-color: #fafafa;
			color: #777;
		}
	}

	.special-characters {
		margin-top: 1em;
		display: flex;
		justify-content: center;
		gap: 0.5em;

		button {
			padding: 0.5em 0.8em;
			font-size: 1.1em;
			background: #ffffff;
			border: 1_px solid #dbdbdb;
			border-radius: 4_px;
			cursor: pointer;

			&:hover {
				background: #f5f5f5;
			}
		}
	}
</style>
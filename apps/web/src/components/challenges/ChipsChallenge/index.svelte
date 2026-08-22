<script lang="ts">
	import { onMount } from 'svelte';
	import hotkeys from 'hotkeys-js';
	import ChallengePanel from '../ChallengePanel.svelte';
	import Phrase from '../Phrase.svelte';
	import { createSortable } from './sortable';
	import { getNodeType, getChipIndex } from './chips';

	// TODO: remove this
	function shuffle<T>(array: T[]): T[] {
		const result = [...array];
		for (let i = result.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[result[i], result[j]] = [result[j], result[i]];
		}
		return result;
	}

	let { challenge, registerResult, resolveChallenge, skipChallenge, skipAllChallenges } = $props();

	let submitted = $state(false);
	let correct: boolean | null = $state(null);
	let chipsElement: HTMLElement;
	let answerElement: HTMLElement;
	let answer = $state([]);
	let answerToRender = $state([]);
	let chipsToRender = $state(shuffle(challenge.chips));
	const chips = $state(chipsToRender);

	const submitChallenge = (e?: Event) => {
		e?.preventDefault();
		if (!answer) return;
		if (submitted) return;
		correct = false;
		const answerForm = answer.join(' ').toLowerCase();
		challenge.solutions.map((solution: string[]) => {
			correct = correct || answerForm === solution.join(' ').toLowerCase();
		});
		registerResult(correct);
		submitted = true;
	};

	const finishChallenge = () => {
		answer = [];
		submitted = false;
		resolveChallenge();
	};

	const handleChipClick = (event: Event) => {
		if (submitted) return;
		const node = event.target;
		if (!(node instanceof HTMLElement)) return;
		const chipType = getNodeType(node);
		const chipText = node.innerText;
		const chipIndex = getChipIndex(node);

		if (chipType === 'chips') {
			chips.splice(chipIndex, 1);
			answer.push(chipText);
		}

		if (chipType === 'answer') {
			answer.splice(chipIndex, 1);
			chips.push(chipText);
		}

		rerenderSortables();
	};

	const rerenderSortables = () => {
		chipsSortable.destroy();
		answerSortable.destroy();
		answerToRender = $answer;
		chipsToRender = $chips;

		/*
        Need to wait for the re-rendering of the chips
        otherwise the svelte store and the sortable
        store will be out of sync
      */
		setTimeout(initializeDragAndDrop, 0);
	};

	let chipsSortable;
	let answerSortable;

	const initializeSortable1 = () => {
		chipsSortable = createSortable(chipsElement, chips);
	};

	const initializeSortable2 = () => {
		answerSortable = createSortable(answerElement, answer);
	};

	const initializeDragAndDrop = () => {
		initializeSortable1();
		initializeSortable2();
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

		initializeDragAndDrop();
	});
</script>

<form onsubmit={submitChallenge}>
	<div class="section">
		<p class="is-size-1 is-size-2-tablet is-size-4-mobile has-text-centered">
			Translate
			<Phrase phrase={challenge.phrase} />
		</p>
	</div>

	<div>
		<div class="solution">
			<div id="answer" class="chips" bind:this={answerElement}>
				{#each answerToRender as chip, index}
					<span class="chip" data-id={chip} onclick={handleChipClick} onkeypress={handleChipClick}>
						<span class="tag is-medium">{chip}</span>
					</span>
				{/each}
			</div>
		</div>

		<p class="sub-instructions">Use these words:</p>
		<div id="chips" class="chips" bind:this={chipsElement}>
			{#each chipsToRender as chip, index}
				<span class="chip" data-id={chip} onclick={handleChipClick} onkeypress={handleChipClick}>
					<span class="tag is-medium">{chip}</span>
				</span>
			{/each}
		</div>
	</div>

	{#if $answer.length === 0 && !submitted}
		<ChallengePanel skipAction={skipChallenge} skipAllAction={skipAllChallenges} />
	{/if}

	{#if $answer.length > 0 && !submitted}
		<ChallengePanel
			message=""
			buttonText="Submit"
			submit
			skipAction={skipChallenge}
			skipAllAction={skipAllChallenges}
		/>
	{/if}

	{#if submitted}
		{#if !correct}
			<ChallengePanel
				message="Incorrect solution!"
				messageDetail={`Correct answer: ${challenge.formattedSolution}`}
				buttonText="Continue"
				incorrect
				buttonAction={finishChallenge}
			/>
		{/if}
		{#if correct}
			<ChallengePanel
				message="Correct solution!"
				buttonText="Continue"
				correct
				buttonAction={finishChallenge}
			/>
		{/if}
	{/if}
</form>

<style type="text/scss">
	.chip {
		user-select: none;
		margin: 0.5em 0.3em;
		cursor: pointer;
	}

	.solution {
		z-index: 10;
		margin-top: -4em;
		padding-top: 4em;
		border-bottom: 2px solid rgba($blue, 0.1);
		height: 6.2em;
	}

	.sub-instructions {
		margin-top: 3em;
	}

	:global(.chips .sortable-ghost .tag) {
		background: $blue !important;
		color: transparent !important;
		opacity: 0.1;
	}

	:global(.sortable-drag) {
		opacity: 1 !important;
	}
</style>

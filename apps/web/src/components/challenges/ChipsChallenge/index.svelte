<script lang="ts">
	import { onMount, tick } from 'svelte';
	import hotkeys from 'hotkeys-js';
	import ChallengePanel from '../ChallengePanel.svelte';
	import Phrase from '../Phrase.svelte';
	import { createSortable } from './sortable';
	import { getNodeType, getChipIndex } from './chips';
	import type Sortable from 'sortablejs';

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

	type ChipData = {
		id: number;
		text: string;
	};

	let initialChips: string[] = shuffle(challenge.chips);

	let submitted = $state(false);
	let correct: boolean | null = $state(null);
	let chipsElement: HTMLElement | undefined = $state();
	let answerElement: HTMLElement | undefined = $state();
	let answer: string[] = $state([]);
	let answerToRender: ChipData[] = $state([]);
	let chipsToRender: ChipData[] = $state(
		initialChips.map((chip, i, _) => ({ id: i, text: chip as string }))
	);
	let chips = $state(initialChips);

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
			let chip = chipsToRender.splice(chipIndex, 1);
			answer.push(chipText);
			answerToRender.push(chip[0]);
		}

		if (chipType === 'answer') {
			answer.splice(chipIndex, 1);
			let chip = answerToRender.splice(chipIndex, 1);
			chips.push(chipText);
			chipsToRender.push(chip[0]);
		}

		rerenderSortables();
	};

	const rerenderSortables = async () => {
		chipsSortable.destroy();
		answerSortable.destroy();
		await tick();
		/*
        Need to wait for the re-rendering of the chips
        otherwise the svelte store and the sortable
        store will be out of sync
      */
		initializeDragAndDrop();
	};

	let chipsSortable: Sortable;
	let answerSortable: Sortable;

	const initializeDragAndDrop = () => {
		if (chipsElement && answerElement) {
			chipsSortable = createSortable(chipsElement, () => {
				let newChips = chipsSortable.toArray().map((idx) => {
					let i = parseInt(idx);
					return { text: initialChips[i], id: i };
				});
				chips = newChips.map((chip) => chip.text);
				chipsToRender = newChips;
				let newAnswer = answerSortable.toArray().map((idx) => {
					let i = parseInt(idx);
					return { text: initialChips[i], id: i };
				});
				answer = newAnswer.map((chip) => chip.text);
				answerToRender = newAnswer;
			});
			answerSortable = createSortable(answerElement, () => {
				let newChips = chipsSortable.toArray().map((idx) => {
					let i = parseInt(idx);
					return { text: initialChips[i], id: i };
				});
				chips = newChips.map((chip) => chip.text);
				chipsToRender = newChips;
				let newAnswer = answerSortable.toArray().map((idx) => {
					let i = parseInt(idx);
					return { text: initialChips[i], id: i };
				});
				answer = newAnswer.map((chip) => chip.text);
				answerToRender = newAnswer;
			});
		}
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
				{#each answerToRender as chip (chip.id)}
					<span
						class="chip"
						data-id={chip.id}
						onclick={handleChipClick}
						onkeypress={handleChipClick}
					>
						<span class="tag is-medium">{chip.text}</span>
					</span>
				{/each}
			</div>
		</div>

		<p class="sub-instructions">Use these words:</p>
		<div id="chips" class="chips" bind:this={chipsElement}>
			{#each chipsToRender as chip (chip.id)}
				<span class="chip" data-id={chip.id} onclick={handleChipClick} onkeypress={handleChipClick}>
					<span class="tag is-medium">{chip.text}</span>
				</span>
			{/each}
		</div>
	</div>

	{#if answer.length === 0 && !submitted}
		<ChallengePanel skipAction={skipChallenge} skipAllAction={skipAllChallenges} />
	{/if}

	{#if answer.length > 0 && !submitted}
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

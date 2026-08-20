<script lang="ts">
	import sound from '$lib/sounds';
	import DeckChallenge from './DeckChallenge/DeckChallenge.svelte';
	import OptionChallenge from './OptionChallenge/OptionChallenge.svelte';
	import ShortInputChallenge from './ShortInputChallenge.svelte';
	import ListeningChallenge from './ListeningChallenge.svelte';
	import ChipsChallenge from './ChipsChallenge/index.svelte';
	import FanfareScreen from '../FanfareScreen.svelte';
	import ProgressBar from '../ProgressBar.svelte';
	import { fade, scale } from 'svelte/transition';
	import { browser } from '$app/environment';

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
		rawChallenges,
		languageName,
		languageCode,
		specialCharacters,
		sortChallengeGroups,
		courseURL,
		skillId,
		expectedNumberOfChallenges
	} = $props();

	const testChallenge = browser && new URLSearchParams(window.location.search).get('testChallenge');

	type CardChallengeType = {
		id: string;
		type: 'cards';
		pictures: Array<string>;
	};

	type ListeningChallengeType = {
		id: string;
		type: 'listeningExercise';
	};

	type OptionsChallengeType = {
		id: string;
		type: 'options';
	};

	type ShortInputChallengeType = {
		id: string;
		type: 'shortInput';
	};

	type ChipsChallengeType = {
		id: string;
		type: 'chips';
	};

	type ChallengeType =
		| CardChallengeType
		| ListeningChallengeType
		| OptionsChallengeType
		| ShortInputChallengeType
		| ChipsChallengeType;

	let challenges: Array<ChallengeType> = sortChallengeGroups(
		shuffle(rawChallenges),
		expectedNumberOfChallenges
	);

	let remainingChallenges = $state(
		testChallenge
			? [
					...[...challenges].filter((challenge) => challenge.id === testChallenge),
					...[...challenges].filter((challenge) => challenge.id !== testChallenge)
				]
			: [...challenges]
	);

	let currentChallenge = $state(remainingChallenges.shift());
	let solvedChallenges = $state([]);

	let stats = {
		correct: 0,
		incorrect: 0,
		skipped: 0
	};

	const preloadImage = (imageName: string) => {
		if (typeof Image === 'undefined') return;
		new Image().src = `/images/${imageName}`;
	};

	challenges && challenges.map((c: any) => c.pictures && c.pictures.map(preloadImage));

	let alternativeChallenges = $derived(
		currentChallenge &&
			rawChallenges.filter(({ id }: { id: string }) => id !== currentChallenge?.id)
	);

	const registerResult = (isCorrect: boolean) => {
		if (isCorrect) {
			stats.correct++;
			sound.correct.play();
			solvedChallenges.push(currentChallenge);
		} else {
			stats.incorrect++;
			sound.wrong.play();
			if (currentChallenge) {
				remainingChallenges.push(currentChallenge);
			}
		}
	};

	let progress = $derived((solvedChallenges.length + stats.skipped) / challenges.length);

	const resolveChallenge = () => {
		if (remainingChallenges) {
			currentChallenge = remainingChallenges.shift();
		}
	};

	const skipChallenge = () => {
		stats.skipped++;
		resolveChallenge();
	};

	const skipAllChallenges = async () => {
		if (solvedChallenges.length == 0) {
			window.location.replace(courseURL);
			return;
		}
		stats.skipped++;
		remainingChallenges.forEach(() => stats.skipped++);
		remainingChallenges = [];
		currentChallenge = undefined;
	};

	const skipAllVoice = () => {
		let filteredRemainingChallenges = remainingChallenges.filter((challenge) => {
			if (challenge.type === 'listeningExercise') {
				stats.skipped++;
				return false;
			} else {
				return true;
			}
		});

		remainingChallenges.splice(0, remainingChallenges.length, ...filteredRemainingChallenges);
		stats.skipped++;
		resolveChallenge();
	};
</script>

{#if currentChallenge}
	<div class="container" in:scale>
		<section class="section">
			<ProgressBar value={progress} />
			{#each challenges as challenge, i (challenge.id)}
				{#if challenge.id === currentChallenge.id}
					<div
						class="challenge"
						in:fade|local={{ duration: 300, delay: 350 }}
						out:fade|local={{ duration: 300 }}
					>
						{#if challenge.type === 'cards'}
							<DeckChallenge
								{skipChallenge}
								{currentChallenge}
								{alternativeChallenges}
								{resolveChallenge}
								{registerResult}
								{skipAllChallenges}
							/>
						{/if}
						{#if challenge.type === 'options'}
							<OptionChallenge
								{skipChallenge}
								{currentChallenge}
								{alternativeChallenges}
								{resolveChallenge}
								{registerResult}
								{skipAllChallenges}
							/>
						{/if}
						{#if challenge.type === 'shortInput'}
							<ShortInputChallenge
								{skipChallenge}
								{languageName}
								{languageCode}
								{specialCharacters}
								{registerResult}
								{resolveChallenge}
								{challenge}
								{skipAllChallenges}
							/>
						{/if}
						{#if challenge.type === 'listeningExercise'}
							<ListeningChallenge
								{skipChallenge}
								{languageCode}
								{specialCharacters}
								{registerResult}
								{resolveChallenge}
								{challenge}
								{skipAllChallenges}
								{skipAllVoice}
							/>
						{/if}
						{#if challenge.type === 'chips'}
							<ChipsChallenge
								{registerResult}
								{resolveChallenge}
								{challenge}
								{skipChallenge}
								{skipAllChallenges}
							/>
						{/if}
					</div>
				{/if}
			{/each}
		</section>
	</div>
{/if}

{#if !currentChallenge}
	<div class="container">
		<FanfareScreen {courseURL} {skillId} {stats} />
	</div>
{/if}

<style type="text/scss">
	.section {
		padding: 1.5em;
	}
	.challenge {
		padding: 2em 0;
	}
</style>

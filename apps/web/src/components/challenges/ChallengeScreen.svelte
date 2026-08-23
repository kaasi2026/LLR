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

	type CardChallengeData = {
		id: string;
		type: 'cards';
		pictures: Array<string>;
	};

	type ListeningChallengeData = {
		id: string;
		type: 'listeningExercise';
	};

	type OptionsChallengeData = {
		id: string;
		type: 'options';
	};

	type ShortInputChallengeData = {
		id: string;
		type: 'shortInput';
	};

	type ChipsChallengeData = {
		id: string;
		type: 'chips';
	};

	type ChallengeData =
		| CardChallengeData
		| ListeningChallengeData
		| OptionsChallengeData
		| ShortInputChallengeData
		| ChipsChallengeData;

	let rawchallenges: ChallengeData[] = sortChallengeGroups(
		shuffle(rawChallenges),
		expectedNumberOfChallenges
	);
	let challengeCount = rawchallenges.length;

	let challenges: ChallengeData[] = $state([...rawchallenges]);
	let currentChallenge = $state(challenges.shift());
	let solvedChallenges: ChallengeData[] = $state([]);

	let stats: { correct: number; incorrect: number; skipped: number } = $state({
		correct: 0,
		incorrect: 0,
		skipped: 0
	});

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
		if (currentChallenge) {
			if (isCorrect) {
				stats.correct++;
				sound.correct.play();
				solvedChallenges.push(currentChallenge);
			} else {
				stats.incorrect++;
				sound.wrong.play();
				challenges.push(currentChallenge);
			}
		}
	};

	let progress = $derived((solvedChallenges.length + stats.skipped) / challengeCount);

	const resolveChallenge = () => {
		currentChallenge = challenges.shift();
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
		challenges.forEach(() => stats.skipped++);
		challenges = [];
		currentChallenge = undefined;
	};

	const skipAllVoice = () => {
		let filteredRemainingChallenges = challenges.filter((challenge) => {
			if (challenge.type === 'listeningExercise') {
				stats.skipped++;
				return false;
			} else {
				return true;
			}
		});

		challenges.splice(0, challenges.length, ...filteredRemainingChallenges);
		stats.skipped++;
		resolveChallenge();
	};
</script>

{#if currentChallenge}
	<div class="container" in:scale>
		<section class="section">
			<ProgressBar value={progress} />
			{#key currentChallenge.id}
				<div class="challenge" in:fade={{ duration: 300, delay: 350 }} out:fade={{ duration: 300 }}>
					{#if currentChallenge.type === 'cards'}
						<DeckChallenge
							{skipChallenge}
							{currentChallenge}
							{alternativeChallenges}
							{resolveChallenge}
							{registerResult}
							{skipAllChallenges}
						/>
					{/if}
					{#if currentChallenge.type === 'options'}
						<OptionChallenge
							{skipChallenge}
							{currentChallenge}
							{alternativeChallenges}
							{resolveChallenge}
							{registerResult}
							{skipAllChallenges}
						/>
					{/if}
					{#if currentChallenge.type === 'shortInput'}
						<ShortInputChallenge
							{skipChallenge}
							{languageName}
							{languageCode}
							{specialCharacters}
							{registerResult}
							{resolveChallenge}
							challenge={currentChallenge}
							{skipAllChallenges}
						/>
					{/if}
					{#if currentChallenge.type === 'listeningExercise'}
						<ListeningChallenge
							{skipChallenge}
							{languageCode}
							{specialCharacters}
							{registerResult}
							{resolveChallenge}
							challenge={currentChallenge}
							{skipAllChallenges}
							{skipAllVoice}
						/>
					{/if}
					{#if currentChallenge.type === 'chips'}
						<ChipsChallenge
							{registerResult}
							{resolveChallenge}
							challenge={currentChallenge}
							{skipChallenge}
							{skipAllChallenges}
						/>
					{/if}
				</div>
			{/key}
		</section>
	</div>
{/if}

{#if currentChallenge === undefined}
	<div class="container">
		<FanfareScreen {courseURL} {skillId} {stats} />
	</div>
{/if}

<style>
	.section {
		padding: 1.5em;
	}
	.challenge {
		padding: 2em 0;
	}
</style>

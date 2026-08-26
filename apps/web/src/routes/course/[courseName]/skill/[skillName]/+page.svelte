<script lang="ts">
	import ChallengeScreen from 'components/challenges/ChallengeScreen.svelte';
	import NavBar from 'components/NavBar.svelte';
	import { sortChallengeGroups } from './_logic';
	import type { Course, Phrase, Skill, Word } from '$lib/course_loader';

	let { data } = $props();

	let skill: Skill = $derived(data.skill);
	let challenges = $derived(generateChallenges(skill));

	// Challenge generation logic
	// NOTE: This may a bit dirty, while I figure out exactly how challenges were previously generated
	// NOTE: Raw challenges refer to all possible combinations of words/phrases and legal challenge types
	// NOTE: We probably don't want/need to generate all the raw challenges, which is the goal of client-side coursegen in the first place

	// TODO: remove this
	function shuffle<T>(array: T[]): T[] {
		const result = [...array];
		for (let i = result.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[result[i], result[j]] = [result[j], result[i]];
		}
		return result;
	}

	export const removeAlternatives = (challenges) =>
		Object.values(Object.fromEntries(challenges.map((challenge) => [challenge.id, challenge])));

	// NOTE: This seems to be a key part of challenge generation and can probably be simplified
	export const sortChallengeGroups = (challenges, expectedNumberOfChallenges) => {
		// This is a very inefficient sorting algorithm to make sure that random order is preserved
		// as much as possible while also priorities are respected within groups
		// this is useful because some challenges should precede others

		const allGroups = [...new Set(challenges.map(({ group }) => group))];
		const challengesPerGroup = Math.round(challenges.length / allGroups.length);
		const expectedNumberOfGroups = Math.max(
			1,
			Math.round(expectedNumberOfChallenges / challengesPerGroup)
		);
		const acceptedGroups = shuffle(allGroups).slice(0, expectedNumberOfGroups);

		const allowedChallenges = challenges.filter(({ group }) => acceptedGroups.includes(group));
		const challengesWithPosition = removeAlternatives(allowedChallenges).map((item, index) => ({
			item,
			index
		}));

		const isSmallestInGroup = (itemToCheck) =>
			challengesWithPosition.filter(
				({ item }) => item.group === itemToCheck.group && item.priority < itemToCheck.priority
			).length === 0;

		const sortedResults = [];
		let bestItem;
		let bestItemIndex;
		while (challengesWithPosition.length > 0) {
			bestItem = challengesWithPosition[0];
			bestItemIndex = 0;

			// Make sure that we prioritize and element that is the first in its group
			challengesWithPosition.forEach(({ index, item }, position) => {
				if (isSmallestInGroup(item)) {
					bestItem = { index, item };
					bestItemIndex = position;
				}
			});

			// Make sure that we prioritize based on the random sort
			challengesWithPosition.forEach(({ index, item }, position) => {
				if (bestItem.index > index) {
					if (!isSmallestInGroup(item)) return;
					bestItem = { index, item };
					bestItemIndex = position;
				}
			});

			sortedResults.push(bestItem.item);
			challengesWithPosition.splice(bestItemIndex, 1);
		}

		return sortedResults;
	};

	function generateCardsChallenge(word: Word) {
		return {
			type: 'cards',
			pictures: word.images.map((pic) => pic + '.jpg'),
			formInTargetLanguage: word.targetLanguage,
			meaningInSourceLanguage: word.sourceLanguage,
			id: word.sourceLanguage + word.targetLanguage,
			priority: 0,
			group: word.sourceLanguage + word.targetLanguage
		};
	}

	function generateOptionsChallenge(phrase: Phrase) {
		return {
			type: 'options',
			formInTargetLanguage: phrase.targetLanguage,
			meaningInSourceLanguage: phrase.sourceLanguage,
			id: phrase.sourceLanguage + phrase.targetLanguage,
			priority: 0,
			group: phrase.sourceLanguage + phrase.targetLanguage
		};
	}

	function generateShortInputChallenge(word: Word, course: Course) {
		return {
			type: 'shortInput',
			pictures: word.images.map((pic) => pic + '.jpg'),
			formInTargetLanguage: word.targetLanguage,
			id: word.sourceLanguage + word.targetLanguage,
			priority: 1,
			group: word.sourceLanguage + word.targetLanguage
		};
	}

	// Calculates how many levels a skill should have
	// TODO: Figure out what a level is
	function levelCount(nwords: number, nphrases: number) {
		return Math.round(1 + nwords / 7 + nphrases / 5);
	}

	function generateChallenges(skill: Skill) {
		let words = skill.newWords.map((word) => generateCardsChallenge(word));
		let phrases = skill.phrases.map((phrase) => generateOptionsChallenge(phrase));
		return [...words, ...phrases];
	}
	let numLevels = $derived(levelCount(skill.newWords.length, skill.phrases.length));
	const challengesPerLevel = $derived(challenges.length / numLevels);
	let expectedNumberOfChallenges = $derived(Math.max(4, Math.round(challengesPerLevel * 1.2)));
</script>

<svelte:head>
	<title>LibreLingo - learn {skill?.name} in {data.language?.name} for free</title>
</svelte:head>

<NavBar repositoryURL={data.repositoryURL} />

<ChallengeScreen
	expectedNumberOfChallenges={challenges.length}
	skillId={skill.id}
	rawChallenges={challenges}
	languageName={data.language?.name}
	languageCode={data.language?.code}
	specialCharacters={data.specialCharacters}
	{sortChallengeGroups}
	courseURL={data.courseUrl}
/>

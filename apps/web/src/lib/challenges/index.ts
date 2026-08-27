// This is where challenges are generated
// Challenge types probably defined half a million times across the codebase
// TODO: Add some structure or something

import type { Course, Phrase, Skill, Word } from '$lib/course_loader';
import { defineWordsInPhrase, type DefinedPhrase } from './dictionary';

export type CardChallengeData = {
	id: string;
	type: 'cards';
	pictures: string[];
	formInTargetLanguage: string;
	meaningInSourceLanguage: string;
};

export type ListeningChallengeData = {
	id: string;
	type: 'listeningExercise';
};

export type OptionsChallengeData = {
	id: string;
	type: 'options';
	formInTargetLanguage: string;
	meaningInSourceLanguage: string;
};

export type ShortInputChallengeData = {
	id: string;
	type: 'shortInput';
	pictures: string[];
	formInTargetLanguage: string[];
	phrase: DefinedPhrase;
};

export type ChipsChallengeData = {
	id: string;
	type: 'chips';
};

export type ChallengeData =
	| CardChallengeData
	| ListeningChallengeData
	| OptionsChallengeData
	| ShortInputChallengeData
	| ChipsChallengeData;

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

// NOTE: This challenge has priority 0
function generateCardsChallenge(word: Word): CardChallengeData {
	return {
		type: 'cards',
		pictures: word.images.map((pic) => pic + '.jpg'),
		formInTargetLanguage: word.targetLanguage[0],
		meaningInSourceLanguage: word.sourceLanguage[0],
		id: `cards-${word.sourceLanguage[0]}-${word.targetLanguage[0]}`
	};
}

// NOTE: This challenge has priority 0
function generateOptionsChallenge(phrase: Phrase): OptionsChallengeData {
	return {
		type: 'options',
		formInTargetLanguage: phrase.targetLanguage[0],
		meaningInSourceLanguage: phrase.sourceLanguage[0],
		id: `options-${phrase.sourceLanguage[0]}-${phrase.targetLanguage[0]}`
	};
}

// NOTE: This challenge has priority 1
function generateShortInputChallenge(word: Word, course: Course): ShortInputChallengeData {
	return {
		type: 'shortInput',
		pictures: word.images.map((pic) => pic + '.jpg'),
		formInTargetLanguage: word.targetLanguage,
		id: `options-${word.sourceLanguage[0]}-${word.targetLanguage[0]}`,
		phrase: defineWordsInPhrase(course, word.sourceLanguage[0], false)
	};
}

// Calculates how many levels a skill should have
// TODO: Figure out what a level is
export function levelCount(nwords: number, nphrases: number) {
	return Math.round(1 + nwords / 7 + nphrases / 5);
}

export function generateChallenges(skill: Skill): ChallengeData[] {
	let words = skill.newWords.map((word) => generateCardsChallenge(word));
	let phrases = skill.phrases.map((phrase) => generateOptionsChallenge(phrase));
	return [...words, ...phrases];
}

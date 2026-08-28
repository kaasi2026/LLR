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
/**
 * Calculates total levels where word intake decays across the first half (0 to L_words - 1)
 * and hits exactly 0 new words at the midpoint (L_words to L_total - 1).
 */
export function buildSizedSkillLevels<W, P>(
	words: W[],
	phrases: P[],
	targetW0: number = 5,
	decayRate: number = 0.4
) {
	const W = words.length;

	// 1. Calculate how many levels are needed to introduce words
	const wordLevels = calculateWordLevels(W, targetW0, decayRate);

	// 2. Double to set total levels so word intake hits 0 at the midpoint
	const totalLevels = wordLevels * 2;

	// 3. Partition words ONLY across the first half
	const activeWordBatches = partitionWordsByLevel(words, wordLevels, decayRate);

	// 4. Distribute phrases across the active middle window (e.g. Level 1 to totalLevels - 2)
	const phraseBatches = partitionPhrasesEvenly(phrases, totalLevels);

	// 5. Combine into final level structures
	return Array.from({ length: totalLevels }, (_, levelIndex) => {
		const isFirstHalf = levelIndex < wordLevels;

		return {
			levelIndex,
			// Second half receives empty array (0 new words)
			newWords: isFirstHalf ? activeWordBatches[levelIndex] || [] : [],
			newPhrases: phraseBatches[levelIndex] || [],
			// Allow multiple-choice scaffolding only in early levels
			allowOptions: levelIndex <= 1
		};
	});
}

function calculateWordLevels(totalWords: number, targetW0: number, decayRate: number): number {
	if (totalWords <= targetW0) return 1;

	const term = (totalWords / targetW0) * (1 - Math.exp(-decayRate));
	if (term >= 0.95) {
		return Math.max(1, Math.ceil(totalWords / (targetW0 * 0.7)));
	}

	const continuousL = -Math.log(1 - term) / decayRate;
	return Math.max(1, Math.ceil(continuousL));
}

function partitionPhrasesEvenly<P>(phrases: P[], totalLevels: number): P[][] {
	const result: P[][] = Array.from({ length: totalLevels }, () => []);
	if (phrases.length === 0 || totalLevels <= 1) {
		result[0] = phrases;
		return result;
	}

	// Skip Level 0 (pure word intro) and place phrases from Level 1 up to totalLevels - 2
	const startLevel = 1;
	const endLevel = Math.max(1, totalLevels - 2);
	const numActiveLevels = endLevel - startLevel + 1;

	const chunkSize = Math.ceil(phrases.length / numActiveLevels);

	for (let i = 0; i < phrases.length; i++) {
		const targetLevel = startLevel + Math.floor(i / chunkSize);
		if (targetLevel < totalLevels) {
			result[targetLevel].push(phrases[i]);
		}
	}

	return result;
}

/** How many new words the user will learn in a given level. This number decays exponentially, meaning that as the user
 progresses through the skill, less and less new words will be learned. This function guarantees that the user will have
 been exposed to all the skill's new words by the middle of the skill.
 `currentLevel` is the level we compute the new words count for, `totalWords` is the total number of words in the skill,
 `totalLevels` is the total number of levels in the skill, and `decayRate` is how quickly the number of new words decreases with each level. 
 */
export function getNewWordCountForLevel(
	currentLevel: number,
	totalWords: number,
	totalLevels: number,
	decayRate: number = 0.4
): number {
	const wordLevels = Math.max(1, Math.floor(totalLevels / 2)); // The skill's midpoint

	// When we pass the midpoint, the user is no longer learning new vocabulary
	if (currentLevel < 0 || currentLevel >= wordLevels || totalWords <= 0) {
		return 0;
	}

	// Exponential weights for active levels only
	const weights = Array.from({ length: wordLevels }, (_, k) => Math.exp(-decayRate * k));
	const totalWeight = weights.reduce((sum, w) => sum + w, 0);

	// Continuous float targets
	const continuous = weights.map((w) => (totalWords * w) / totalWeight);
	const counts = continuous.map((x) => Math.floor(x));

	// Distribute remainder shortfall deterministically
	const shortfall = totalWords - counts.reduce((sum, c) => sum + c, 0);
	const remainders = continuous
		.map((x, i) => ({ index: i, rem: x - counts[i] }))
		.sort((a, b) => b.rem - a.rem || a.index - b.index);

	for (let i = 0; i < shortfall; i++) {
		counts[remainders[i].index]++;
	}

	return counts[currentLevel];
}

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

export function generateChallenges(skill: Skill, course: Course): ChallengeData[] {
	let words = skill.newWords.map((word) => generateShortInputChallenge(word, course));
	let phrases = skill.phrases.map((phrase) => generateOptionsChallenge(phrase));
	return [...words, ...phrases];
}

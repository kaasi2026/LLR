// Utils for dealing with the mini-dictionary feature

import type { Course, Module, Word } from '$lib/course_loader';

export type DefinedWord = {
	word: string;
	definition: string;
};

export type DefinedPhrase = DefinedWord[];

// Converts a sentence into a list of definition objects.
export function defineWordsInPhrase(
	course: Course,
	sentence: string,
	reverse: boolean
): DefinedPhrase {
	// Split phrase into words
	let words = sentence.split(/\s+/);
	return words.flatMap((word) => defineWord(course, word, reverse) || []);
}

// Find the matching raw dictionary item for a word.
function rawDictItem(course: Course, word: string, is_in_target_language: boolean) {
	// let dictionary_item = list(
	//     filter(
	//         lambda item: clean_word(item.word).lower() == clean_word(word).lower()
	//         and item.is_in_target_language == is_in_target_language,
	//         course.dictionary,
	//     )
	// )

	return course.dictionary.filter((item) => {
		return (
			item.word.toLowerCase() === word.toLowerCase() &&
			item.is_in_target_language === is_in_target_language
		);
	})[0];
}

// Creates the definition object for a word.
export function defineWord(
	course: Course,
	word: string,
	is_in_target_language: boolean
): DefinedWord | null {
	let dictionary_item: DictionaryItem = rawDictItem(course, word, is_in_target_language);
	if (dictionary_item && dictionary_item.definition) {
		return { word: word, definition: dictionary_item.definition };
	} else {
		return null;
	}
}

export type DictionaryItem = {
	word: string;
	definition: string;
	is_in_target_language: boolean;
};

// Generates a dictionary using every skill in every module that is passed in the argument
export function loadCourseDict(modules: Module[]) {
	let items = [];
	for (let [key, definition] of getMergedDictionaryItems(modules)) {
		let [word, is_in_target_language] = key;
		items.push({
			word: word,
			definition: [...definition].sort().join('\n'),
			is_in_target_language: is_in_target_language
		});
	}
	return items;
}

// Handles loading the mini-dictionary form the YAML format
export function loadSkillMiniDict(data: { 'Mini-dictionary'?: any }, course: Course) {
	let dictionary: DictionaryItem[] = [];
	if (!data['Mini-dictionary']) return dictionary;
	let raw_mini_dictionary = data['Mini-dictionary'];
	let configurations: [string, boolean][] = [
		[course.language.name, true],
		[course.sourceLanguage.name, false]
	];
	for (const [language_name, is_in_target_language] of configurations) {
		for (const item of raw_mini_dictionary[language_name]) {
			let word = item.keys()[0];
			let raw_definition = item.values()[0];
			let definition = raw_definition;
			dictionary.push({ word, definition: definition, is_in_target_language });
		}
	}
	return dictionary;
}

function getMergedDictionaryItems(modules: Module[]) {
	return mergeDictionaryDefinitions(getDictionaryItems(modules));
}

function mergeDictionaryDefinitions(itemsGenerator: any) {
	const items = new Map();

	for (const [word, definition, isInTargetLanguage] of itemsGenerator) {
		// Create a unique string key for the Map to mimic the Python tuple key
		const key = JSON.stringify([word, isInTargetLanguage]);

		// Initialize the Set if the key doesn't exist yet
		if (!items.has(key)) {
			items.set(key, new Set());
		}

		// Add the definition to the Set (automatically handles duplicates)
		items.get(key).add(definition);
	}

	// Convert the Map back to the structured format: [ [ [word, isInTargetLanguage], Set(definitions) ], ... ]
	return Array.from(items.entries()).map(([keyStr, valueSet]) => {
		return [JSON.parse(keyStr), valueSet];
	});
}

// Get all the dict items of all the dictionaries of all the skills of a course
function* getDictionaryItems(modules: Module[]) {
	for (const mod of modules) {
		for (const skill of mod.skills) {
			// yield* automatically handles types for nested iterables
			// Get the dict items for new words
			for (const word of skill.newWords) {
				yield [word.targetLanguage, word.sourceLanguage, true];
				yield [word.sourceLanguage, word.targetLanguage, false];
			}

			if (skill.dictionary) {
				for (const item of skill.dictionary) {
					for (const def of item.definition) {
						yield [item.word, def, item.is_in_target_language];
					}
				}
			}
		}
	}
}

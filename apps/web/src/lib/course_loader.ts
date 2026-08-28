import { parse } from 'yaml';
import type { CourseIndexEntry } from './course_index';
import { loadCourseDict, loadSkillMiniDict, type DictionaryItem } from './challenges/dictionary';

export type Course = {
	language: { name: string; code: string };
	sourceLanguage: { name: string; code: string };
	license: { name: string; url: string };
	repositoryUrl: string;
	specialCharacters: string[];
	modules: Module[];
	audioSettings?: { enabled: boolean; ttsProvider: Record<string, any> };
	dictionary: { word: string; definition: string; is_in_target_language: boolean }[];
};

export type Module = {
	name: string;
	skills: Skill[];
};

export type Skill = {
	name: string;
	// Full name is the filename minus the .yaml
	// Used in skill name routes, and in the introduction *.md files
	fullName: string;
	id: number;
	newWords: Word[];
	phrases: Phrase[];
	dictionary: DictionaryItem[];
	// The list of new words and phrases inside the skill
	summary: string[];
	introduction?: string;
	imageSet: string[];
};

export type Word = {
	targetLanguage: string[];
	sourceLanguage: string[];
	images: string[];
};

export type Phrase = {
	targetLanguage: string[];
	sourceLanguage: string[];
};

const courseCache = new Map<string, Course>();

// Convert a YAML word definition into a Word() object
function convert_word(raw_word: {
	Word: string;
	Synonyms?: string;
	Translation: string;
	'Also accepted'?: string[];
	Images: string[];
}): Word {
	return {
		targetLanguage: [raw_word['Word'], ...(raw_word['Synonyms'] ?? [])],
		sourceLanguage: [raw_word['Translation'], ...(raw_word['Also accepted'] ?? [])],
		images: raw_word['Images']
	};
}

function convert_phrase(raw_phrase: {
	Phrase: string;
	Translation: string;
	'Alternative versions': string[];
	'Alternative translations': string[];
}): Phrase {
	return {
		targetLanguage: [raw_phrase['Phrase'], ...(raw_phrase['Alternative versions'] ?? [])],
		sourceLanguage: [raw_phrase['Translation'], ...(raw_phrase['Alternative translations'] ?? [])]
	};
}

async function loadSkill(
	baseUrl: string,
	moduleName: string,
	skillName: string,
	sourceLanguageName: string,
	targetLanguageName: string
): Promise<Skill | null> {
	try {
		let resp = await fetch(`${baseUrl}/${moduleName}/skills/${skillName}.yaml`);

		if (!resp.ok) {
			throw new Error(
				`Failed to load skill ${skillName} from module ${moduleName}: got ${resp.status}`
			);
		}
		let text = await resp.text();
		let skillYaml = parse(text);

		// Try to load the introduction file
		let introduction;
		try {
			let resp = await fetch(`${baseUrl}/${moduleName}/skills/${skillName}.md`);
			if (resp.ok) {
				let text = await resp.text();
				// TODO: Sanitize the markdown
				introduction = text;
			}
		} catch {}

		let newWords: Word[] = skillYaml['New words'].map((word: any) => convert_word(word));

		let phrases: Phrase[] = skillYaml.Phrases.map((phrase: any) => convert_phrase(phrase));
		let summary: string[] = [
			...newWords.map((word) => word.sourceLanguage[0]),
			...phrases.map((phrase) => phrase.sourceLanguage[0])
		];

		return {
			name: skillYaml.Skill.Name,
			fullName: skillName,
			id: skillYaml.Skill.Id,
			introduction,
			newWords,
			phrases,
			dictionary: loadSkillMiniDict(skillYaml, sourceLanguageName, targetLanguageName),
			summary,
			imageSet: skillYaml.Skill.Thumbnails
		};
	} catch (e) {
		console.error(`Failed to load skill ${skillName} from module ${moduleName}`, e);
		return null;
	}
}

export async function loadCourse(courseIndexEntry: CourseIndexEntry): Promise<Course> {
	if (!courseCache.has(courseIndexEntry.name)) {
		console.log(`Loading course ${courseIndexEntry.name}`);
		const baseUrl = courseIndexEntry.url;
		const resp = await fetch(`${baseUrl}/course.yaml`);
		const text = await resp.text();
		const courseYaml = parse(text);

		// Load the course modules
		let modules = courseYaml.Modules.map(async (moduleName: string) => {
			let resp = await fetch(`${baseUrl}/${moduleName}/module.yaml`);
			let text = await resp.text();
			let moduleYaml = parse(text);
			let skills = moduleYaml.Skills.map((fileName: string) =>
				loadSkill(
					baseUrl,
					moduleName,
					fileName.replace('.yaml', ''),
					courseYaml.Course.Language.Name,
					courseYaml.Course['For speakers of'].Name
				)
			);

			return {
				name: moduleYaml.Module.Name,
				skills: await Promise.all(skills)
			};
		});

		let awaitedModules = await Promise.all(modules);

		let course = {
			language: {
				name: courseYaml.Course.Language.Name,
				code: courseYaml.Course.Language['IETF BCP 47']
			},
			sourceLanguage: {
				name: courseYaml.Course['For speakers of'].Name,
				code: courseYaml.Course['For speakers of']['IETF BCP 47']
			},
			license: {
				name: courseYaml.Course.License['Short name'],
				url: courseYaml.Course.License.Link
			},
			repositoryUrl: courseYaml.Course.Repository,
			specialCharacters: courseYaml.Course['Special characters'],
			modules: awaitedModules,
			audioSettings: courseYaml.Settings?.Audio && {
				enabled: courseYaml.Settings.Audio.Enabled,
				ttsProvider: courseYaml.Settings.Audio.TTS
			},
			dictionary: loadCourseDict(awaitedModules)
		};

		courseCache.set(courseIndexEntry.name, course); // Store course in the cache

		return course;
	} else {
		return courseCache.get(courseIndexEntry.name)!;
	}
}

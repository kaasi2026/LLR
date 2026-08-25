import { parse } from 'yaml';

export type Course = {
	language: { name: string; code: string };
	sourceLanguage: { name: string; code: string };
	license: { name: string; url: string };
	repositoryUrl: string;
	specialCharacters: string[];
	modules: Module[];
	audioSettings?: { enabled: boolean; ttsProvider: Record<string, any> };
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
	dictionary: Dictionary[];
	// The list of new words and phrases inside the skill
	summary: string[];
	introduction?: string;
	imageSet: string[];
};

export type Word = {
	word: string;
	translation: string;
	images: string[];
};

export type Phrase = {
	phrase: string;
	translation: string;
};

export type Dictionary = Record<string, any>;

async function loadSkill(baseUrl: string, moduleName: string, skillName: string) {
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

		let newWords: Word[] = skillYaml['New words'].map(
			(word: { Word: string; Translation: string; Images: string[] }) => {
				return {
					word: word.Word,
					translation: word.Translation,
					images: word.Images
				};
			}
		);

		let phrases: Phrase[] = skillYaml.Phrases.map(
			(phrase: { Phrase: string; Translation: string }) => {
				return {
					phrase: phrase.Phrase,
					translation: phrase.Translation
				};
			}
		);
		let summary = [
			...newWords.map((word) => word.translation),
			...phrases.map((phrase) => phrase.translation)
		];

		return {
			name: skillYaml.Skill.Name,
			fullName: skillName,
			id: skillYaml.Skill.Id,
			introduction,
			newWords,
			phrases,
			dictionary: skillYaml['Mini-dictionary'],
			summary,
			imageSet: skillYaml.Skill.Thumbnails
		};
	} catch (e) {
		console.error(`Failed to load skill ${skillName} from module ${moduleName}: ${e}`);
		return null;
	}
}

export async function loadCourse(baseUrl: string): Promise<Course> {
	const resp = await fetch(`${baseUrl}/course.yaml`);
	const text = await resp.text();
	const courseYaml = parse(text);

	// Load the course modules
	let modules = courseYaml.Modules.map(async (moduleName: string) => {
		let resp = await fetch(`${baseUrl}/${moduleName}/module.yaml`);
		let text = await resp.text();
		let moduleYaml = parse(text);
		let skills = moduleYaml.Skills.map((fileName: string) =>
			loadSkill(baseUrl, moduleName, fileName.replace('.yaml', ''))
		);

		return {
			name: moduleYaml.Module.Name,
			skills: await Promise.all(skills)
		};
	});

	return {
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
		modules: await Promise.all(modules),
		audioSettings: courseYaml.Settings.Audio && {
			enabled: courseYaml.Settings.Audio.Enabled,
			ttsProvider: courseYaml.Settings.Audio.TTS
		}
	};
}

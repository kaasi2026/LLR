import parseMarkdown from '../utils/parseMarkdown';

const findFileRecursive = async (dir: string, fileName: string): Promise<string | null> => {
	const { readdir } = await import('fs/promises');
	const { join } = await import('path');
	const entries = await readdir(dir, { withFileTypes: true });
	for (const entry of entries) {
		const candidate = join(dir, entry.name);
		if (entry.isDirectory()) {
			const found = await findFileRecursive(candidate, fileName);
			if (found) {
				return found;
			}
		} else if (entry.isFile() && entry.name === fileName) {
			return candidate;
		}
	}
	return null;
};

const loadMarkdownIntroductionFromSourceCourse = async (
	courseName: string,
	fileName: string
): Promise<string> => {
	const { join } = await import('path');
	const candidateBases = [
		join(process.cwd(), 'courses', courseName),
		join(process.cwd(), '..', 'courses', courseName),
		join(process.cwd(), '..', '..', 'courses', courseName)
	];

	for (const base of candidateBases) {
		try {
			const found = await findFileRecursive(base, fileName);
			if (found) {
				const { readFile } = await import('fs/promises');
				return await readFile(found, 'utf-8');
			}
		} catch (err) {
			// ignore missing base paths
		}
	}

	return '';
};

export type SkillDataType = {
	id: string;
	practiceHref: string;
	title: string;
	levels: number;
	introduction?: string;
	summary: string[];
	imageSet?: string[];
};

export type ModuleDataType = {
	title: string;
	skills: SkillDataType[];
};

export type CourseDataType = {
	courseName: string;
	modules: ModuleDataType[];
	languageName: string;
	repositoryURL: string;
	languageCode: string;
	specialCharacters: string[];
};

const formatCourseData = (rawCourseData, { courseName }) => {
	const { modules, languageName, repositoryURL, languageCode, specialCharacters, uiLanguage } =
		rawCourseData;

	return {
		courseName,
		modules,
		languageName,
		repositoryURL,
		languageCode,
		specialCharacters,
		uiLanguage
	};
};

const normalizeCoursePath = (courseName: string, relativePath: string) => {
	let normalized = relativePath
		.replace(/^\.\.\//, '')
		.replace(/^\.\//, '')
		.replace(/^\//, '');

	// Handle paths that already include an aliased or absolute course path.
	// Examples:
	// - courses/fr-from-en/introduction/legumes-3.md
	// - introduction/courses/fr-from-en/introduction/legumes-3.md
	// We want to normalize both back to introduction/legumes-3.md.
	normalized = normalized.replace(/^introduction\/courses\/[^/]+\//, 'introduction/');
	normalized = normalized.replace(/^courses\/[^/]+\//, '');
	normalized = normalized.replace(new RegExp(`^${courseName}/`), '');

	return normalized;
};

const getCoursePath = async (courseName: string, relativePath: string) => {
	const normalizedPath = normalizeCoursePath(courseName, relativePath);
	// @ts-ignore
	const { readFile } = await import('fs/promises');
	// @ts-ignore
	const { fileURLToPath } = await import('url');
	// @ts-ignore
	const { dirname, join } = await import('path');
	const __dirname = dirname(fileURLToPath(import.meta.url));

	const candidateBases = [
		join(__dirname, '../courses', courseName),
		join(process.cwd(), 'src', 'courses', courseName),
		join(process.cwd(), 'apps', 'web', 'src', 'courses', courseName),
		join(process.cwd(), '..', '..', 'courses', courseName)
	];

	let lastError;
	const attemptedPaths: string[] = [];
	for (const base of candidateBases) {
		const candidatePath = join(base, normalizedPath);
		attemptedPaths.push(candidatePath);
		try {
			return await readFile(candidatePath, 'utf-8');
		} catch (err) {
			lastError = err;
		}
	}

	throw new Error(
		`Could not read ${normalizedPath} for course ${courseName}. Tried paths:\n${attemptedPaths.join('\n')}\nLast error: ${lastError}`
	);
};

const importMaybeDefault = async (path: string) => {
	const module = await import(path);
	const result = (module as any).default ?? module;
	return result;
};

export const loadMarkdownIntroduction = async ({
	courseName,
	introductionPath,
	readFile,
	importModule
}: {
	courseName: string;
	introductionPath: string;
	readFile?: (courseName: string, relativePath: string) => Promise<string>;
	importModule?: (courseName: string, relativePath: string) => Promise<any>;
}) => {
	const loader = readFile ?? getCoursePath;
	const importer =
		importModule ??
		((name: string, path: string) => importMaybeDefault(`../courses/${name}/${path}`));
	let markdown = '';

	if (typeof window === 'undefined') {
		try {
			return await loader(courseName, introductionPath);
		} catch (err) {
			try {
				return await importer(courseName, introductionPath);
			} catch (importError) {
				const { basename } = await import('path');
				const fileName = basename(introductionPath);
				return await loadMarkdownIntroductionFromSourceCourse(courseName, fileName);
			}
		}
	}

	try {
		return await importer(courseName, introductionPath);
	} catch (err) {
		const { basename } = await import('path');
		const fileName = basename(introductionPath);
		if (typeof window !== 'undefined') {
			const fetchResponse = await fetch(`/api/source-course/${courseName}/${fileName}`);
			if (fetchResponse.ok) {
				return await fetchResponse.text();
			}
		}
		return '';
	}
};

export const get_course = async ({
	courseName
}: {
	courseName: string;
}): Promise<CourseDataType> => {
	const errorMessage = `Could not load course "${courseName}". Make sure the course has been exported into apps/web/src/courses and run "npm run prepareCourses" before starting the web app.`;

	if (typeof window === 'undefined') {
		let fileError: unknown;
		try {
			const raw = await getCoursePath(courseName, 'courseData.json');
			const rawCourseData = JSON.parse(raw);
			return formatCourseData(rawCourseData, { courseName });
		} catch (err) {
			fileError = err;
		}

		try {
			const rawCourseData = await importMaybeDefault(`../courses/${courseName}/courseData.json`);
			return formatCourseData(rawCourseData, { courseName });
		} catch (importError) {
			const fileMessage = fileError instanceof Error ? fileError.message : String(fileError);
			const importMessage =
				importError instanceof Error ? importError.message : String(importError);
			throw new Error(
				`${errorMessage}\nFile load error: ${fileMessage}\nImport error: ${importMessage}`
			);
		}
	}

	try {
		const rawCourseData = await importMaybeDefault(`../courses/${courseName}/courseData.json`);
		return formatCourseData(rawCourseData, { courseName });
	} catch (err) {
		const importMessage = err instanceof Error ? err.message : String(err);
		throw new Error(`${errorMessage}\nImport error: ${importMessage}`);
	}
};

const formatSkilldata = async (skillData, { courseName, skillName }) => {
	const { languageName, languageCode, specialCharacters, repositoryURL } = await get_course({
		courseName
	});
	const rawChallenges = skillData.challenges;
	const challengesPerLevel = skillData.challenges.length / skillData.levels;

	const skillId = skillData.id;

	return {
		rawChallenges: Array.from(rawChallenges),
		languageName,
		languageCode,
		specialCharacters,
		repositoryURL,
		skillName,
		skillId,
		challengesPerLevel,
		courseURL: `/course/${courseName}`
	};
};

export const get_skill_data = async ({
	courseName,
	skillName
}: {
	courseName: string;
	skillName: string;
}) => {
	if (typeof window === 'undefined') {
		try {
			const raw = await getCoursePath(courseName, `challenges/${skillName}.json`);
			const skillData = JSON.parse(raw);
			return await formatSkilldata(skillData, { courseName, skillName });
		} catch (err) {
			const skillData = await importMaybeDefault(
				`../courses/${courseName}/challenges/${skillName}.json`
			);
			return await formatSkilldata(skillData, { courseName, skillName });
		}
	}

	const skillData = await importMaybeDefault(
		`../courses/${courseName}/challenges/${skillName}.json`
	);

	return await formatSkilldata(skillData, { courseName, skillName });
};

const formatSkillIntroduction = async (skill, { skillName, courseName, markdown }) => {
	const safeMarkdown = typeof markdown === 'string' ? markdown : '';
	const parsedMarkdown = safeMarkdown.trim() ? parseMarkdown(safeMarkdown) : '';

	return {
		skillName,
		courseName,
		title: skill.title,
		practiceHref: skill.practiceHref,
		readmeHTML: parsedMarkdown
	};
};

export const get_skill_introduction = async ({
	courseName,
	skillName
}: {
	courseName: string;
	skillName: string;
}) => {
	let modules;
	try {
		const course = await get_course({ courseName });
		modules = course.modules;
	} catch (err) {
		modules = null;
	}

	if (modules) {
		for (const module of modules) {
			for (const skill of module.skills) {
				if (skill.practiceHref === skillName) {
					const introductionPath = normalizeCoursePath(
						courseName,
						skill.introduction
							? `introduction/${skill.introduction}`
							: `introduction/${skillName}.md`
					);

					let markdown = await loadMarkdownIntroduction({
						courseName,
						introductionPath
					});

					if ((!markdown || !String(markdown).trim()) && skill.introduction) {
						markdown = await loadMarkdownIntroduction({
							courseName,
							introductionPath: `introduction/${skillName}.md`
						});
					}

					if (!markdown || !String(markdown).trim()) {
						continue;
					}

					return formatSkillIntroduction(skill, { skillName, courseName, markdown });
				}
			}
		}
	}

	const fallbackIntroductionPath = `introduction/${skillName}.md`;
	const fallbackMarkdown = await loadMarkdownIntroduction({
		courseName,
		introductionPath: fallbackIntroductionPath
	});

	if (fallbackMarkdown && String(fallbackMarkdown).trim()) {
		return formatSkillIntroduction(
			{
				title: skillName,
				practiceHref: skillName
			},
			{ skillName, courseName, markdown: fallbackMarkdown }
		);
	}

	throw new Error(`Could not find skill with name "${skillName}" in course "${courseName}".`);
};

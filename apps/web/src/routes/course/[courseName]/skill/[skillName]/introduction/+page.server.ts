// TODO: clean this up

import { get_skill_introduction } from 'course-client';
import parseMarkdown from '../../../../../../utils/parseMarkdown';
import { fileURLToPath } from 'url';
import path from 'path';
import { readdir, readFile } from 'fs/promises';

const findFileRecursive = async (dir, fileName) => {
	const entries = await readdir(dir, { withFileTypes: true });
	for (const entry of entries) {
		const candidate = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			const found = await findFileRecursive(candidate, fileName);
			if (found) return found;
		} else if (entry.isFile() && entry.name === fileName) {
			return candidate;
		}
	}
	return null;
};

const loadSourceMarkdown = async (courseName, skillName) => {
	const __dirname = path.dirname(fileURLToPath(import.meta.url));
	const workspaceRoot = path.resolve(__dirname, '../../../../../../..');
	const courseRoot = path.join(workspaceRoot, 'courses', courseName);
	const found = await findFileRecursive(courseRoot, `${skillName}.md`);
	if (!found) return '';
	return await readFile(found, 'utf-8');
};

export async function load(page) {
	const { courseName, skillName } = page.params;

	if (courseName === 'preview') {
		const skillNameFromQuery = page.url.searchParams.get('skillName');

		return {
			loading: true,
			preview: {
				type: skillName,
				skillName: skillNameFromQuery
			}
		};
	}

	try {
		const skillIntro = await get_skill_introduction({ courseName, skillName });
		if (skillIntro.readmeHTML && String(skillIntro.readmeHTML).trim()) {
			return {
				...skillIntro,
				loading: false,
				preview: null
			};
		}
	} catch {
		// fall back to source markdown
	}

	try {
		const rawMarkdown = await loadSourceMarkdown(courseName, skillName);
		if (rawMarkdown && rawMarkdown.trim()) {
			return {
				courseName,
				skillName,
				title: skillName,
				practiceHref: skillName,
				readmeHTML: parseMarkdown(rawMarkdown),
				loading: false,
				preview: null
			};
		}
	} catch {
		// ignore and fall through
	}

	return {
		loading: false,
		preview: null,
		readmeHTML: '',
		practiceHref: skillName,
		courseName,
		title: skillName
	};
}

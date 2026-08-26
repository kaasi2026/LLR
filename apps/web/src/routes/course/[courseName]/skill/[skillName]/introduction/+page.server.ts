// TODO: clean this up

import { get_skill_introduction } from 'course-client';
import parseMarkdown from '../../../../../../utils/parseMarkdown';
import { fileURLToPath } from 'url';
import path from 'path';
import { readdir, readFile } from 'fs/promises';
import courseIndex from '$lib/course_index';
import { loadCourse } from '$lib/course_loader';

// const findFileRecursive = async (dir, fileName) => {
// 	const entries = await readdir(dir, { withFileTypes: true });
// 	for (const entry of entries) {
// 		const candidate = path.join(dir, entry.name);
// 		if (entry.isDirectory()) {
// 			const found = await findFileRecursive(candidate, fileName);
// 			if (found) return found;
// 		} else if (entry.isFile() && entry.name === fileName) {
// 			return candidate;
// 		}
// 	}
// 	return null;
// };
//
// const loadSourceMarkdown = async (courseName, skillName) => {
// 	const __dirname = path.dirname(fileURLToPath(import.meta.url));
// 	const workspaceRoot = path.resolve(__dirname, '../../../../../../..');
// 	const courseRoot = path.join(workspaceRoot, 'courses', courseName);
// 	const found = await findFileRecursive(courseRoot, `${skillName}.md`);
// 	if (!found) return '';
// 	return await readFile(found, 'utf-8');
// };

export async function load({
	params
}: {
	params: {
		courseName: string;
		skillName: string;
	};
}) {
	// try {
	// 	const skillIntro = await get_skill_introduction({ courseName, skillName });
	// 	if (skillIntro.readmeHTML && String(skillIntro.readmeHTML).trim()) {
	// 		return {
	// 			...skillIntro,
	// 			loading: false,
	// 			preview: null
	// 		};
	// 	}
	// } catch {
	// 	// fall back to source markdown
	// }
	//
	// try {
	// 	const rawMarkdown = await loadSourceMarkdown(courseName, skillName);
	// 	if (rawMarkdown && rawMarkdown.trim()) {
	// 		return {
	// 			courseName,
	// 			skillName,
	// 			title: skillName,
	// 			practiceHref: skillName,
	// 			readmeHTML: parseMarkdown(rawMarkdown),
	// 			loading: false,
	// 			preview: null
	// 		};
	// 	}
	// } catch {
	// 	// ignore and fall through
	// }
	let { courseName, skillName } = params;
	let courseIndexEntry = courseIndex.find((course) => course.name === courseName);
	if (!courseIndexEntry) return { status: 404 }; // Course not found

	let course = await loadCourse(courseIndexEntry);

	let skill = course.modules
		.flatMap((module) => module.skills)
		.find((skill) => skill.fullName === skillName);

	if (!skill) {
		console.log('Skill', skillName, 'not found');
		return { status: 404 };
	} // Skill not found

	if (skill.introduction) {
		return {
			readmeHTML: parseMarkdown(skill.introduction!),
			practiceHref: skillName,
			courseName,
			title: skillName
		};
	} else {
		return {
			readmeHTML: '',
			practiceHref: skillName,
			courseName,
			title: skillName
		};
	}
}

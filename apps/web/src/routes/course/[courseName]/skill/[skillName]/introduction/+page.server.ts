import parseMarkdown from '../../../../../../utils/parseMarkdown';
import courseIndex from '$lib/course_index';
import { loadCourse } from '$lib/course_loader';

export async function load({
	params
}: {
	params: {
		courseName: string;
		skillName: string;
	};
}) {
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

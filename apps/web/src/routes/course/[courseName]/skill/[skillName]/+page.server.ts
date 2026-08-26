import courseIndex from '$lib/course_index';
import { loadCourse } from '$lib/course_loader';
import { error } from '@sveltejs/kit';

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
	if (!courseIndexEntry) error(404, { message: `Course "${courseName}" not found` });

	let course = await loadCourse(courseIndexEntry);

	let skill = course.modules
		.flatMap((module) => module.skills)
		.find((skill) => skill.fullName === skillName);

	if (!skill) {
		console.log('Skill', skillName, 'not found');
		error(404, { message: `Skill "${skillName}" not found` });
	} // Skill not found

	return {
		skill,
		courseUrl: `/course/${courseIndexEntry.name}`,
		language: course.language,
		repositoryURL: course.repositoryUrl,
		specialCharacters: course.specialCharacters
	};
}

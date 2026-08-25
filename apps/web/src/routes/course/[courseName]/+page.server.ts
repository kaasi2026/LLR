import courseIndex from '$lib/course_index';
import { loadCourse } from '$lib/course_loader';

export async function load({ params }) {
	let { courseName } = params;
	// TODO:: Inefficient

	// Linearly search through the course index
	let courseIndexEntry = courseIndex.find((course) => course.name === courseName);
	console.log(courseIndexEntry);
	if (!courseIndexEntry) return { status: 404 }; // Course not found

	let course = await loadCourse(courseIndexEntry);
	console.log(course);
	return { course, courseName };
}

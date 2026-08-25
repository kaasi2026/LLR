// Import the course registry at build time
import courseIndex from '$lib/course_index';

export async function load() {
	let courses = courseIndex;

	return { coursesFs: courses };
}

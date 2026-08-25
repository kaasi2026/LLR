import courseIndex from '$lib/courses.json';

export type CourseIndexEntry = {
	// URL pointing to the RAW course files (eg raw.githubusercontent.com)
	// This URL should contain a course.yml as its direct child to be valid
	url: string;
	// Course repository URL
	repositoryURL: string;
	// TODO: Prolly useless
	paths: {
		yamlFolder: string;
		jsonFolder: string;
	};
	// idk
	deploy: boolean;
	// idk
	devtoolsEnabled: boolean;
	// idk
	inProduction: boolean;
	// idk
	gistId?: string;
	// Name of the course, used in the /couse/[courseName] route
	name: string;
	// Source language
	source: string;
	// Course target language
	target: string;
	// Short description of the course
	description: string;
};

export default courseIndex as CourseIndexEntry[];

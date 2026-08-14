import fs from 'node:fs';
import { readdir } from 'fs/promises';
import path from 'path';
import { readFile } from 'fs/promises';

const getDirectories = async (source: string) => {
	const files = await readdir(source, { withFileTypes: true });
	return files
		.filter((dirent) => dirent.isDirectory())
		.filter((dir) => !dir.name.includes('test'))
		.map((dirent) => dirent.name);
};

export async function load() {
	const testFolder = 'src/courses';
	let verifiedFolderList: Array<{ path: string; language: string }> = [];

	if (fs.existsSync(testFolder)) {
		const folderList = await getDirectories(testFolder);

		for (let folder of folderList) {
			let folderPath = path.join(testFolder, folder);

			try {
				const courseDataPath = path.join(folderPath, 'courseData.json');
				const challengesPath = path.join(folderPath, 'challenges');

				const courseDataFileExists = await fileExists(courseDataPath);
				const challengesFolderExists = await fileExists(challengesPath);

				if (!courseDataFileExists || !challengesFolderExists) continue;

				const files = await readdir(challengesPath);
				const hasJsonFile = files.some((file) => path.extname(file).toLowerCase() === '.json');

				if (!hasJsonFile) continue;

				// Read the JSON file to get the course language
				const jsonData = await readFile(courseDataPath, 'utf-8');
				const courseLanguage = JSON.parse(jsonData);

				// Add the course to the list
				verifiedFolderList.push({
					path: folder,
					language: courseLanguage.languageName.toLowerCase()
				});
			} catch (err) {
				console.error(`Error during folder reading: ${err}`);
				continue;
			}
		}
	}

	return { coursesFs: verifiedFolderList };
}

async function fileExists(filePath: string): Promise<boolean> {
	try {
		await fs.promises.access(filePath);
		return true;
	} catch {
		return false;
	}
}

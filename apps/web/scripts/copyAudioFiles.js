#!/usr/bin/env node
/**
 * Script to copy generated audio files from course directories to static folder
 * This makes them available as HTTP assets
 */

import { readdirSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');
const coursesDir = path.resolve(webRoot, 'src', 'courses');
const staticVoicesDir = path.resolve(webRoot, 'static', 'voice');

function copyAudioFiles() {
	// Create static voices directory
	mkdirSync(staticVoicesDir, { recursive: true });

	let copiedCount = 0;

	// Find all course directories
	const courses = readdirSync(coursesDir, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);

	for (const courseName of courses) {
		const voicesDir = path.resolve(coursesDir, courseName, 'voices');

		if (!existsSync(voicesDir)) {
			continue;
		}

		try {
			const audioFiles = readdirSync(voicesDir).filter(
				(file) => file.endsWith('.mp3') || file.endsWith('.wav') || file.endsWith('.ogg')
			);

			for (const audioFile of audioFiles) {
				const srcPath = path.resolve(voicesDir, audioFile);
				const destPath = path.resolve(staticVoicesDir, audioFile);

				try {
					copyFileSync(srcPath, destPath);
					copiedCount++;
				} catch (err) {
					console.warn(`Failed to copy ${audioFile}:`, err.message);
				}
			}

			if (audioFiles.length > 0) {
				console.log(`Copied ${audioFiles.length} audio files from course "${courseName}"`);
			}
		} catch (err) {
			console.warn(`Error processing course "${courseName}":`, err.message);
		}
	}

	console.log(`Total audio files copied: ${copiedCount}`);
}

try {
	copyAudioFiles();
} catch (error) {
	console.error('Failed to copy audio files:', error.message);
	process.exit(1);
}

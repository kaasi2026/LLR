// TODO: There are waayyyy to many way to look up files within a course
// SECURITY: This might even be a security problem

import { error } from '@sveltejs/kit';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import path from 'path';

const findFileRecursive = async (dir: string, fileName: string): Promise<string | null> => {
	const entries = await import('fs/promises').then((m) => m.readdir(dir, { withFileTypes: true }));
	for (const entry of entries) {
		const candidate = path.join(dir, entry.name);
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

const cleanPath = (rawPath: string) => {
	const parts = rawPath
		.split('/')
		.filter((segment) => segment !== '' && segment !== '.' && segment !== '..');
	return parts.join('/');
};

export const GET = async ({ params }) => {
	const { courseName, path: requestedPath } = params;
	if (!courseName || !requestedPath) {
		throw error(400, 'Missing courseName or path');
	}

	const filePath = Array.isArray(requestedPath) ? requestedPath.join('/') : String(requestedPath);
	const sanitized = cleanPath(filePath);

	const __dirname = path.dirname(fileURLToPath(import.meta.url));
	const workspaceRoot = path.resolve(__dirname, '../../../../..');
	const courseRoot = path.join(workspaceRoot, 'courses', courseName);

	const candidatePath = path.join(courseRoot, sanitized);
	try {
		return new Response(await readFile(candidatePath, 'utf-8'), {
			headers: { 'content-type': 'text/plain; charset=utf-8' }
		});
	} catch (err) {
		const fileName = path.basename(sanitized);
		const found = await findFileRecursive(courseRoot, fileName);
		if (found) {
			return new Response(await readFile(found, 'utf-8'), {
				headers: { 'content-type': 'text/plain; charset=utf-8' }
			});
		}
	}

	throw error(404, `Could not load source markdown for course ${courseName} path ${sanitized}`);
};

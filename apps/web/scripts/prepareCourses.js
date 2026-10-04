import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');

function resolveRepoRoot(webRootPath, explicitRoot = null) {
	const candidates = [];

	if (explicitRoot) {
		candidates.push(path.resolve(explicitRoot));
	}

	candidates.push(path.resolve(webRootPath, '..', '..'));
	candidates.push(path.resolve(webRootPath, '..'));
	candidates.push(path.resolve(webRootPath));
	candidates.push(path.resolve(webRootPath, '..', '..', '..'));

	for (const candidate of [...new Set(candidates)]) {
		if (
			existsSync(path.join(candidate, 'courses')) &&
			existsSync(path.join(candidate, 'src', 'pyproject.toml'))
		) {
			return candidate;
		}
	}

	return path.resolve(webRootPath, '..', '..');
}

const repoRoot = resolveRepoRoot(webRoot, process.env.LIBRELINGO_ROOT || process.env.REPO_ROOT);
const rootCoursesDir = path.resolve(repoRoot, 'courses');
const webCoursesDir = path.resolve(webRoot, 'src', 'courses');

const pythonCommandCandidates = [
	process.env.PYTHON_BIN,
	'python3',
	'python',
	'python3.14',
	'python3.13',
	'python3.12',
	'python3.11',
	'python3.10'
].filter(Boolean);

function parsePythonVersion(output) {
	const match = /Python\s*(\d+)\.(\d+)\.(\d+)/.exec(output);
	if (!match) return null;
	return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) };
}

function isSupportedPythonVersion(version) {
	// The project supports Python 3.10 through 3.14.
	if (!version) return false;
	if (version.major !== 3) return false;
	return version.minor >= 10 && version.minor < 15;
}

function findPython() {
	for (const command of pythonCommandCandidates) {
		try {
			const result = spawnSync(command, ['--version'], { encoding: 'utf8' });
			if (result.status !== 0) continue;
			const output = (result.stdout || result.stderr || '').toString();
			const version = parsePythonVersion(output);
			if (isSupportedPythonVersion(version)) {
				return command;
			}
		} catch (e) {
			// ignore and try next candidate
		}
	}
	return null;
}

function runCommand(command, args, options = {}) {
	const result = spawnSync(command, args, {
		stdio: 'inherit',
		cwd: repoRoot,
		env: {
			...process.env,
			...(options.env || {})
		}
	});

	if (result.error) {
		throw result.error;
	}

	if (result.status !== 0) {
		throw new Error(`Command failed: ${command} ${args.join(' ')}`);
	}
}

function ensurePipInVirtualenv(venvPython) {
	const ensurePipResult = spawnSync(venvPython, ['-m', 'pip', '--version'], {
		stdio: 'inherit',
		cwd: repoRoot,
		env: {
			...process.env,
			PYTHONPATH: path.join(repoRoot, 'src')
		}
	});

	if (ensurePipResult.status !== 0) {
		console.log('pip is not available in the virtual environment yet; bootstrapping it now...');
		runCommand(venvPython, ['-m', 'ensurepip', '--upgrade']);
	}

	runCommand(venvPython, [
		'-m',
		'pip',
		'install',
		'--quiet',
		'--disable-pip-version-check',
		'--upgrade',
		'pip',
		'setuptools',
		'wheel'
	]);
}

function listCourseDirectories(directory) {
	if (!existsSync(directory)) {
		return [];
	}

	return readdirSync(directory, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name)
		.filter((courseName) => existsSync(path.join(directory, courseName, 'course.yaml')));
}

function shouldExportCourse(courseName) {
	const outputCourseDir = path.join(webCoursesDir, courseName);
	const courseDataPath = path.join(outputCourseDir, 'courseData.json');
	const challengesPath = path.join(outputCourseDir, 'challenges');

	return !existsSync(courseDataPath) || !existsSync(challengesPath);
}

function main() {
	const courseDirectories = listCourseDirectories(rootCoursesDir);

	if (courseDirectories.length === 0) {
		console.log(
			'No YAML courses found in the root courses folder. Skipping web course preparation.'
		);
		return;
	}

	if (!existsSync(webCoursesDir)) {
		mkdirSync(webCoursesDir, { recursive: true });
	}

	const pythonCommand = findPython();
	if (!pythonCommand) {
		console.error(
			'Python is required to export YAML courses into the web app. Install python3 or python and try again.'
		);
		process.exit(1);
	}

	if (process.env.PYTHON_BIN) {
		console.log(`Using configured Python interpreter: ${process.env.PYTHON_BIN}`);
	}

	const pythonPath = path.join(repoRoot, 'src');
	const venvDir = path.join(repoRoot, 'tmp', 'prepareCourses-venv');
	const venvPython = path.join(venvDir, 'bin', 'python');

	console.log('Creating temporary Python virtual environment at:', venvDir);
	runCommand(pythonCommand, ['-m', 'venv', '--clear', venvDir]);
	ensurePipInVirtualenv(venvPython);
	console.log('Installing local web course exporter package and dependencies from:', pythonPath);
	runCommand(
		venvPython,
		[
			'-m',
			'pip',
			'install',
			'--quiet',
			'--disable-pip-version-check',
			'--upgrade',
			path.join(repoRoot, 'src')
		],
		{
			env: {
				PYTHONPATH: pythonPath
			}
		}
	);

	let exported = false;
	for (const courseName of courseDirectories) {
		if (!shouldExportCourse(courseName)) {
			console.log(`Course "${courseName}" already exported. Skipping.`);
			continue;
		}

		exported = true;
		const sourceCourseDir = path.join(rootCoursesDir, courseName);
		const targetCourseDir = path.join(webCoursesDir, courseName);

		console.log(`Exporting course "${courseName}" from YAML to web JSON content...`);
		runCommand(venvPython, ['-m', 'librelingo_json_export.cli', sourceCourseDir, targetCourseDir], {
			env: {
				PYTHONPATH: pythonPath
			}
		});

		const courseDataFile = path.join(targetCourseDir, 'courseData.json');
		if (!existsSync(courseDataFile)) {
			throw new Error(`Export completed but expected file is missing: ${courseDataFile}`);
		}
		console.log(`Verified exported file: ${courseDataFile}`);
	}

	if (!exported) {
		console.log('All web courses are already prepared.');
	} else {
		console.log('Course export complete.');
	}
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
	try {
		main();
	} catch (error) {
		console.error(
			'Failed to prepare course content:',
			error instanceof Error ? error.message : error
		);
		process.exit(1);
	}
}

export { resolveRepoRoot };

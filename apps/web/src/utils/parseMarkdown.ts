import showdown from 'showdown';

export default function parseMarkdown(rawMarkdown: any) {
	// Ensure rawMarkdown is a string
	let markdownText: string = '';

	console.log('parseMarkdown input type:', typeof rawMarkdown);
	console.log('parseMarkdown input:', rawMarkdown);

	if (typeof rawMarkdown === 'string') {
		markdownText = rawMarkdown;
	} else if (rawMarkdown && typeof rawMarkdown === 'object') {
		// Handle imported markdown objects from vite-plugin-markdown
		console.log('Markdown is object, keys:', Object.keys(rawMarkdown));

		if ('default' in rawMarkdown && typeof rawMarkdown.default === 'string') {
			console.log('Using rawMarkdown.default');
			markdownText = rawMarkdown.default;
		} else if ('html' in rawMarkdown && typeof rawMarkdown.html === 'string') {
			console.log('Using rawMarkdown.html');
			markdownText = rawMarkdown.html;
		} else if ('content' in rawMarkdown && typeof rawMarkdown.content === 'string') {
			console.log('Using rawMarkdown.content');
			markdownText = rawMarkdown.content;
		} else if ('raw' in rawMarkdown && typeof rawMarkdown.raw === 'string') {
			console.log('Using rawMarkdown.raw');
			markdownText = rawMarkdown.raw;
		} else if ('text' in rawMarkdown && typeof rawMarkdown.text === 'string') {
			console.log('Using rawMarkdown.text');
			markdownText = rawMarkdown.text;
		} else {
			// If no known property found, try to find any string property
			for (const [key, value] of Object.entries(rawMarkdown)) {
				if (typeof value === 'string' && value.length > 0) {
					console.log(`Using rawMarkdown.${key}`);
					markdownText = value;
					break;
				}
			}

			if (!markdownText) {
				console.warn('Could not extract markdown text from object');
			}
		}
	} else {
		console.warn('Invalid markdown input type:', typeof rawMarkdown);
	}

	console.log('Final markdownText (first 100 chars):', markdownText.substring(0, 100));

	if (!markdownText.trim()) {
		console.warn('WARNING: Empty markdown text!');
	}

	const converter = new showdown.Converter();
	const html = converter.makeHtml(markdownText);
	return html;
}

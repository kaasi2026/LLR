// TODO: remove this
function shuffle<T>(array: T[]): T[] {
	const result = [...array];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

// TODO: remove this
function uniqBy<T>(array: T[], iteratee: keyof T | ((item: T) => unknown)): T[] {
	const getKey =
		typeof iteratee === 'function' ? iteratee : (item: T) => item?.[iteratee as keyof T];

	const seen = new Set<unknown>();
	const result: T[] = [];

	for (const item of array) {
		const key = getKey(item);
		if (!seen.has(key)) {
			seen.add(key);
			result.push(item);
		}
	}

	return result;
}

export const prepareChallenge = ({
	currentChallenge,
	alternativeChallenges,
	typeToSelect,
	hasFakeOption = null
}) => {
	const numberOfCards = hasFakeOption ? 4 : 3;
	const correctOption = {
		...currentChallenge,
		correct: true
	};

	const incorrectOptions = alternativeChallenges
		.filter(({ type }) => type === typeToSelect)
		.filter(
			({ formInTargetLanguage }) => formInTargetLanguage !== correctOption.formInTargetLanguage
		)
		.map((challenge) => ({
			...challenge,
			correct: false
		}));

	const incorrectOptionsSample = shuffle(uniqBy(incorrectOptions, 'formInTargetLanguage')).slice(
		0,
		numberOfCards - 1
	);

	const incorrectOptionsWithFake =
		incorrectOptions.length >= 2
			? [
					{
						...incorrectOptionsSample[0],
						fake: true
					},
					...incorrectOptionsSample.slice(1)
				]
			: [];

	return shuffle([correctOption, ...incorrectOptionsWithFake]);
};

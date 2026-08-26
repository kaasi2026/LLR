<script lang="ts">
	import ChallengeScreen from 'components/challenges/ChallengeScreen.svelte';
	import NavBar from 'components/NavBar.svelte';
	import { sortChallengeGroups } from './_logic';
	import type { Phrase, Skill, Word } from '$lib/course_loader';

	let { data } = $props();

	let skill: Skill = $derived(data.skill);
	let challenges = $derived(generateChallenges(skill));

	function generateCardsChallenge(word: Word) {
		return {
			type: 'cards',
			pictures: word.images.map((pic) => pic + '.jpg'),
			formInTargetLanguage: word.targetLanguage,
			meaningInSourceLanguage: word.sourceLanguage,
			id: word.sourceLanguage + word.targetLanguage,
			priority: 0,
			group: word.sourceLanguage + word.targetLanguage
		};
	}

	function generateOptionsChallenge(phrase: Phrase) {
		return {
			type: 'options',
			formInTargetLanguage: phrase.targetLanguage,
			meaningInSourceLanguage: phrase.sourceLanguage,
			id: phrase.sourceLanguage + phrase.targetLanguage,
			priority: 0,
			group: phrase.sourceLanguage + phrase.targetLanguage
		};
	}

	function generateChallenges(skill: Skill) {
		let words = skill.newWords.map((word) => generateCardsChallenge(word));
		let phrases = skill.phrases.map((phrase) => generateOptionsChallenge(phrase));
		return [...words, ...phrases];
	}
</script>

<svelte:head>
	<title>LibreLingo - learn {skill?.name} in {data.language?.name} for free</title>
</svelte:head>

<NavBar repositoryURL={data.repositoryURL} />

<ChallengeScreen
	expectedNumberOfChallenges={challenges.length}
	skillId={skill.id}
	rawChallenges={challenges}
	languageName={data.language?.name}
	languageCode={data.language?.code}
	specialCharacters={data.specialCharacters}
	{sortChallengeGroups}
	courseURL={data.courseUrl}
/>

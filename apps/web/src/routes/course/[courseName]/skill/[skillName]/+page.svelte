<script lang="ts">
	import ChallengeScreen from 'components/challenges/ChallengeScreen.svelte';
	import NavBar from 'components/NavBar.svelte';
	import type { Course, Phrase, Skill, Word } from '$lib/course_loader';
	import { generateChallenges, levelCount } from '$lib/challenges';

	let { data } = $props();

	let skill: Skill = $derived(data.skill);
	let challenges = $derived(generateChallenges(skill, data.course));

	let numLevels = $derived(levelCount(skill.newWords.length, skill.phrases.length));
	const challengesPerLevel = $derived(challenges.length / numLevels);
	let expectedNumberOfChallenges = $derived(Math.max(4, Math.round(challengesPerLevel * 1.2)));
</script>

<svelte:head>
	<title>LibreLingo - learn {skill?.name} in {data.language?.name} for free</title>
</svelte:head>

<NavBar repositoryURL={data.repositoryURL} />

<ChallengeScreen
	skillId={skill.id}
	rawchallenges={challenges}
	languageName={data.language?.name}
	languageCode={data.language?.code}
	specialCharacters={data.specialCharacters}
	courseURL={data.courseUrl}
/>

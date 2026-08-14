<script lang="ts">
	import ChallengeScreen from 'components/challenges/ChallengeScreen.svelte';
	import NavBar from 'components/NavBar.svelte';
	import { sortChallengeGroups } from './_logic';

	let { data } = $props();

	let rawChallenges = $derived(data.rawChallenges);
	let languageName = $derived(data.languageName);
	let languageCode = $derived(data.languageCode);
	let specialCharacters = $derived(data.specialCharacters);
	let repositoryURL = $derived(data.repositoryURL);
	let skillName = $derived(data.skillName);
	let courseURL = $derived(data.courseURL);
	let skillId = $derived(data.skillId);
	let challengesPerLevel = $derived(data.challengesPerLevel);

	// TODO: This looks suspicious
	let expectedNumberOfChallenges = $derived(Math.max(4, Math.round(challengesPerLevel * 1.2)));
</script>

<svelte:head>
	<title>LibreLingo - learn {skillName} in {languageName} for free</title>
</svelte:head>

<NavBar {repositoryURL} />

<ChallengeScreen
	{expectedNumberOfChallenges}
	{skillId}
	{rawChallenges}
	{languageName}
	{languageCode}
	{specialCharacters}
	{sortChallengeGroups}
	{courseURL}
/>

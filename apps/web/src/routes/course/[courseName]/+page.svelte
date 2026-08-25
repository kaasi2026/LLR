<script lang="ts">
	import { locale } from 'svelte-i18n';
	import SkillCard from 'components/SkillCard/SkillCard.svelte';
	import NavBar from 'components/NavBar.svelte';

	import Column from 'components/Column.svelte';
	import Columns from 'components/Columns.svelte';
	import Content from 'components/Content.svelte';
	import Footer from 'components/Footer.svelte';
	import type { Course } from '$lib/course_loader';

	let { data }: { data: { course: Course; courseName: string } } = $props();

	let course = $derived(data.course);
	// let courseName = $derived(course?.courseName);
	// let modules = $derived(course?.modules ?? []);
	// let languageName = $derived(course?.languageName);
	// let repositoryURL = $derived(course?.repositoryURL);
	let uiLanguage = $derived(course.sourceLanguage.code);

	$effect(() => {
		if (uiLanguage) {
			locale.set(uiLanguage);
		}
	});
</script>

<svelte:head>
	<title>LibreLingo - learn {course.language.name ?? 'a language'} for free</title>
</svelte:head>

<main class="course-page app-page">
	<NavBar repositoryURL={course.repositoryUrl} />

	{#each course.modules as { name, skills } (name)}
		<section class="section surface-card surface-block">
			<div class="container surface-container">
				<div class="surface-section-heading">
					<h2 class="is-size-2">{name}</h2>
					<!-- Description removed per design request -->
				</div>
				<Columns multiline class="surface-grid">
					{#each skills as skill (skill.id)}
						<Column sizeDesktop="1/3" sizeTablet="1/2">
							<SkillCard {...skill} practiceHref={`/course/${data.courseName}/skill/${skill.id}`} />
						</Column>
					{/each}
				</Columns>
			</div>
		</section>
	{/each}

	<Footer>
		<Content>
			<p>
				<strong>LibreLingoRelive</strong> is a fork from LibreLingoCommunity, which is a fork from
				<strong>LibreLingo</strong> by Dániel Kántor and various contributors.
			</p>
			<p>
				The source code is licensed <a href="https://opensource.org/licenses/AGPL-3.0">AGPL-3.0</a>.
			</p>
			<p>
				<a href="https://codeberg.org/LibreLingoRelive">Source code available on Codeberg.</a>
			</p>
		</Content>
	</Footer>
</main>

<style>
	:global(.surface-grid) {
		display: flex !important;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1.5rem;
	}

	:global(.surface-grid .column) {
		flex: 0 1 calc(33.333% - 1rem);
		min-width: 250px;
	}

	@media (max-width: 1024px) {
		:global(.surface-grid .column) {
			flex: 0 1 calc(50% - 1rem);
		}
	}

	@media (max-width: 640px) {
		:global(.surface-grid .column) {
			flex: 0 1 100%;
		}
	}
</style>

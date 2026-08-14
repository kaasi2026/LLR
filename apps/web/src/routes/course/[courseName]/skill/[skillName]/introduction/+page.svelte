<script lang="ts">
	import { _ } from 'svelte-i18n';
	import Button from 'components/Button.svelte';
	import MarkDownPage from 'components/MarkDownPage.svelte';

	let { data } = $props();

	let readmeHTML = $derived(data.readmeHTML);
	let title = $derived(data.title);
	let practiceHref = $derived(data.practiceHref);
	let courseName = $derived(data.courseName);

	let homepageLink = $derived(`/course/${courseName}/`);
</script>

<MarkDownPage
	className="intro-page"
	{readmeHTML}
	{title}
	description={$_('about.meta.description')}
>
	<div class="intro-actions">
		<Button style="primary" size="large" href={homepageLink}>Go back to course</Button>
		<Button style="primary" size="large" href={`/course/${courseName}/skill/${practiceHref}`}>
			Practice {title}
		</Button>
	</div>
</MarkDownPage>

<style>
	:global(.intro-actions .lluis-button),
	:global(.intro-actions .lluis-button:hover),
	:global(.intro-actions .lluis-button:focus),
	:global(.intro-actions .lluis-button:visited) {
		color: #fff !important;
	}
</style>

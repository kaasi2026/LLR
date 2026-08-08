<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { get_skill_introduction } from 'course-client';
	import Button from 'components/Button.svelte';
	import MarkDownPage from 'components/MarkDownPage.svelte';
	import isBrowser from 'utils/isBrowser';
	import { page } from '$app/state';

	export let preview = page.data.preview;
	export let loading = page.data.loading;
	export let readmeHTML: string = page.data.readmeHTML;
	export let title: string = page.data.title;
	export let practiceHref: string = page.data.practiceHref;
	export let courseName: string = page.data.courseName;
	let homepageLink = `/course/${courseName}/`;

	// Fetching preview data
	if (preview !== null) {
		let previewParams = preview;
		if (isBrowser()) {
			const urlSearchParams = new URLSearchParams(window.location.search);
			previewParams = Object.fromEntries(urlSearchParams.entries());
		}

		const { skillName } = previewParams;

		get_skill_introduction({ courseName: 'preview', skillName }).then((skillData) => {
			title = skillData.title;
			readmeHTML = skillData.readmeHTML;
			practiceHref = skillData.practiceHref;
			loading = false;
		});
	}
</script>


{#if !loading}
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
{/if}

<style>
	:global(.intro-actions .lluis-button),
	:global(.intro-actions .lluis-button:hover),
	:global(.intro-actions .lluis-button:focus),
	:global(.intro-actions .lluis-button:visited) {
		color: #fff !important;
	}
</style>


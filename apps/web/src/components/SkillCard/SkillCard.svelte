<script lang="ts">
	import { onMount } from 'svelte';

	/* import live from '../../db/live'; */
	/* 	import getSkillStats from '../../db/skill/getSkillStats';
	 */
	import Icon from '../Icon.svelte';
	import Card from '../Card.svelte';
	import Buttons from './Buttons.svelte';
	import ContentLeft from './ContentLeft.svelte';
	import ContentCenter from './ContentCenter.svelte';

	// TODO: Add an id prop when we have the db
	let {
		name,
		practiceHref,
		introduction,
		imageSet,
		summary
	}: {
		name: string;
		practiceHref: string;
		introduction: string;
		imageSet: string[];
		summary: string[];
	} = $props();

	let completed: boolean = $state(false);
	let started: boolean = $state(false);
	let stale: boolean = $state(false);
	let challengeHref = $state(practiceHref);
	let introductionPageHref = $derived(introduction ? `${practiceHref}/introduction` : null);

	let backgroundColor = $derived(
		stale
			? 'var(--deprecated-panel-background-failure)'
			: completed
				? 'var(--deprecated-panel-background-success)'
				: 'white'
	);
	let foregroundColor = $derived(completed || stale ? 'white' : 'black');

	onMount(() => {
		// TODO: Uncomment when we have the db
		/* live((db) =>
			getSkillStats(db, { id })
				.then((stats) => {
					completed = stats.progress >= levels;
					progress = stats.progress;
					started = stats.started;
					stale = stats.stale && completed;
				})
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				.catch(() => {})
		); */
	});
</script>

<Card
	{backgroundColor}
	{foregroundColor}
	data-test="skill card"
	data-started={started}
	data-completed={completed}
	data-stale={stale}
>
	{#snippet icon()}
		<div>
			{#if completed}
				{#if stale}
					<Icon icon="dumbbell" size="large" />
				{:else}
					<Icon icon="check-square" size="large" />
				{/if}
			{/if}
		</div>
	{/snippet}
	{#snippet content()}
		<div>
			<div class="media">
				<ContentLeft {imageSet} {stale} {completed} />
				<ContentCenter {stale} {name} {completed} {summary} />
			</div>
		</div>
	{/snippet}
	{#snippet footer()}
		<footer>
			<div class="card-footer-item">
				<Buttons practiceHref={introductionPageHref || challengeHref} {started} {completed} />
			</div>
		</footer>
	{/snippet}
</Card>

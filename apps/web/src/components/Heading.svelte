<script lang="ts">
	import type { Snippet } from 'svelte';

	// TODO: There's a very handy element named `<h1>` that does *exactly* the same thing
	type HeadingLevel = 1 | 2;

	let { level, children }: { level: HeadingLevel; children: Snippet } = $props();
</script>

{#if level == 1}
	<h1>
		{@render children()}
	</h1>
{/if}

{#if level == 2}
	<h2>
		{@render children()}
	</h2>
{/if}

<style>
	h1 {
		font-size: var(--font-size-xxlarge);
	}

	h2 {
		font-size: var(--font-size-xlarge);
	}

	h1,
	h2 {
		font-weight: 400;
		line-height: 1.4; /* TODO: find multiplier that works with all font sizes */
	}
</style>

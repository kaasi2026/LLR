<script lang="ts">
	import type { Snippet } from 'svelte';

	// NOTE: This is just a standard flexbox layout

	let {
		multiline = false,
		reversed = false,
		children,
		...restProps
	}: { multiline?: boolean; reversed?: boolean; children: Snippet } & Record<
		string,
		any
	> = $props();
</script>

<div class="columns" class:is-multiline={multiline} class:is-reversed={reversed} {...restProps}>
	{@render children()}
</div>

<style type="text/scss">
	@use 'bulma/sass/utilities/_all';

	@include until($tablet) {
		.is-reversed {
			flex-direction: column-reverse;
			display: flex;
		}
	}
</style>

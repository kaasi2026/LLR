<script lang="ts">
	import Button from 'components/Button.svelte';
	import HorizontalScroller from 'components/HorizontalScroller.svelte';
	import type { Snippet } from 'svelte';

	let {
		characters,
		handleVirtualKey,
		children
	}: {
		characters: string[];
		handleVirtualKey: (character: string) => () => void;
		children?: Snippet;
	} = $props();
</script>

<div class="virtual-keyboard">
	<HorizontalScroller>
		{#if children}
			{@render children()}
		{:else}
			<div class="keys">
				{#each characters as character}
					<Button style="key" tabIndex={-1} size="small" onclick={handleVirtualKey(character)}>
						{character}
					</Button>
				{/each}
			</div>
		{/if}
	</HorizontalScroller>
</div>

<style>
	.virtual-keyboard {
		display: flex;
		flex-wrap: wrap;
		margin-top: 2em;
		height: 100%;
	}

	.virtual-keyboard .keys {
		display: flex;
		flex-wrap: wrap;
	}

	@media only screen and (pointer: coarse) {
		.virtual-keyboard .keys {
			display: flex;
			flex-wrap: nowrap;
			padding-left: 12px;
			padding-right: 12px;
		}

		.virtual-keyboard {
			height: 48px;
			position: fixed;
			bottom: 68px;
			left: 0;
			right: 0;
			background-color: white;
			z-index: 100;
		}
	}
</style>

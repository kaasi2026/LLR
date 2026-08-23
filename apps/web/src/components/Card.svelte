<script lang="ts">
	import type { Snippet } from 'svelte';
	type Props = {
		backgroundColor?: string;
		foregroundColor?: string;
		media?: Snippet;
		content?: Snippet;
		footer?: Snippet;
		icon?: Snippet;
	} & Record<string, any>;

	let {
		backgroundColor = 'white',
		foregroundColor = 'black',
		media,
		content,
		footer,
		icon,
		...restProps
	}: Props = $props();
</script>

<div
	class="lluis-card"
	style="--backgroundColor: {backgroundColor}; --foregroundColor: {foregroundColor};"
	{...restProps}
>
	{#if media}
		<div class="lluis-card-media">
			{@render media()}
		</div>
	{/if}

	{#if content}
		<div class="lluis-card-content">
			{@render content()}
		</div>
	{/if}

	{#if footer}
		<div class="lluis-card-footer">
			{@render footer()}
		</div>
	{/if}

	{#if icon}
		<div class="corner-icon">
			{@render icon()}
		</div>
	{/if}
</div>

<style>
	.lluis-card {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		box-shadow: none;
		background-color: var(--backgroundColor);
		color: var(--foregroundColor);
		border-radius: 4px;
		height: 100%;
	}

	.lluis-card-media {
		padding: 0.5rem;
	}

	.lluis-card-content {
		padding: 1.5rem;
	}

	.lluis-card-footer {
		padding: 0.75rem;
	}

	.corner-icon {
		position: absolute;
		right: 0.5em;
		top: 0.5em;
	}
</style>

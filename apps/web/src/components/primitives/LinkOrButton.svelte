<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = {
		href?: string | null;
		type?: 'button' | 'submit';
		target?: string | undefined;
		tabIndex?: number | undefined;
		disabled?: boolean;
		label?: string | null;
		onclick?: (e: MouseEvent) => void;
		children: Snippet;
	} & Record<string, any>

	// TODO: Check if this component is strictly necessary
	let {
		href = null,
		type = 'button',
		target,
		tabIndex,
		disabled = false,
		label,
		onclick,
		children,
		...restProps
	}: Props = $props();
</script>

{#if href !== null}
	<a {href} {target} tabindex={tabIndex} {...restProps} role="button" aria-label={label}>
		{@render children()}
	</a>
{/if}

{#if href === null}
	<button {type} tabindex={tabIndex} {disabled} {onclick} aria-label={label} {...restProps}>
		{@render children()}
	</button>
{/if}

<style>
	button {
		background: transparent;
		border: 0;
		font-size: inherit;
		cursor: pointer;
	}

	a,
	button {
		display: inline-block;
		max-width: 100%;
		text-overflow: ellipsis;

		overflow: hidden;
		white-space: nowrap;
	}

	a[role='button'] {
		text-decoration: none !important;
	}
</style>

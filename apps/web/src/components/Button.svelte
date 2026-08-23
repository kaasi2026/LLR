<script lang="ts">
	import type { Snippet } from 'svelte';

	// TODO: Check if this component is strictly necessary
	import LinkOrButton from './primitives/LinkOrButton.svelte';
	import Spinner from './Spinner.svelte';
	import Stack from './Stack.svelte';

	let {
		href,
		size = 'medium',
		loading = false,
		asHref,
		type = 'button',
		fakePseudoSelector,
		style = 'primary',
		target,
		tabIndex,
		ariaLabel,
		disabled = false,
		onclick,
		children
	}: {
		href?: string | null;
		size?: 'small' | 'medium' | 'large';
		loading?: boolean;
		asHref?: string | null;
		type?: 'button' | 'submit';
		fakePseudoSelector?: null | 'active' | 'hover';
		style?: 'primary' | 'secondary' | 'accent' | 'key' | 'linkButton';
		target?: string | undefined;
		tabIndex?: number | undefined;
		ariaLabel?: string | null;
		disabled?: boolean;
		onclick?: (e: MouseEvent) => void;
		children: Snippet;
	} = $props();
</script>

<LinkOrButton
	class="lluis-button"
	data-size={size}
	data-style={style}
	data-selector={fakePseudoSelector}
	{href}
	{onclick}
	label={ariaLabel}
	{type}
	{target}
	{tabIndex}
	{disabled}
>
	{#if loading}
		<Spinner />
	{:else}
		<Stack>
			{@render children()}
		</Stack>
	{/if}
</LinkOrButton>

{#if asHref != null}
	<a class="hidden-link" aria-label="hidden-link" href={asHref}>&nbsp;</a>
{/if}

<style>
	:global(.lluis-button) {
		font-size: var(--font-size-normal);
		line-height: calc(var(--font-size-normal) * 1.5);
		gap: 0.5rem;
		align-items: center;
		display: inline-flex;
		justify-content: center;
		border-radius: 2.5rem;
		padding: 0 1.5rem;
		height: 2.5rem;
		border: 1px solid;
		white-space: nowrap;
		cursor: pointer;
		transition: all 0.15s;
		text-decoration: none;
		background-color: var(--button-color-accent);
		border-color: var(--button-border-color-accent);
		color: var(--text-color-default);
	}

	/* Primary style */
	:global(.lluis-button[data-style='primary']) {
		background-color: var(--button-color-primary);
		border-color: var(--button-border-color-primary);
		color: var(--text-color-inverted);
	}

	:global(.lluis-button[data-selector='hover']):hover {
		/* placeholder hover state; actual hover colors should be defined by button style variables */
	}

	:global(.lluis-button[data-style='secondary']) {
		background-color: var(--button-color-secondary);
		border-color: var(--button-border-color-secondary);
		color: var(--text-color-default);
	}

	:global(.lluis-button[data-style='primary']),
	:global(.lluis-button[data-style='secondary']),
	:global(.lluis-button[data-style='accent']),
	:global(.lluis-button[data-style='key']) {
		text-decoration: none !important;
	}

	:global(.lluis-button[data-style='linkButton']) {
		background-color: var(--button-color-secondary);
		border-color: var(--button-border-color-link);
		color: var(--button-color-primary);
	}
</style>

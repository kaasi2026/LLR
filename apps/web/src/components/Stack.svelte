<script lang="ts">
	import type { Snippet } from 'svelte';

	type StackAlign =
		| 'normal'
		| 'stretch'
		| 'center'
		| 'start'
		| 'end'
		| 'flex-start'
		| 'flex-end'
		| 'baseline'
		| 'first baseline'
		| 'last baseline'
		| 'safe center'
		| 'unsafe center'
		| 'inherit'
		| 'initial'
		| 'revert'
		| 'revert-layer'
		| 'unset';

	type StackJustify =
		| 'center'
		| 'start'
		| 'end'
		| 'flex-start'
		| 'flex-end'
		| 'left'
		| 'right'
		| 'normal'
		| 'space-between'
		| 'space-around'
		| 'space-evenly'
		| 'stretch'
		| 'safe center'
		| 'unsafe center'
		| 'inherit'
		| 'initial'
		| 'revert'
		| 'revert-layer'
		| 'unset';

	type SpacingSize = 'none' | 'xs' | 's' | 'm' | 'l' | 'xl';
	type StackDirection = 'row' | 'column';

	let {
		direction = 'row',
		directionDesktop = null,
		directionTablet = null,
		align = 'normal',
		justify = 'normal',
		spacing = null,
		shrink = 1,
		fullHeight = false,
		children
	}: {
		direction?: StackDirection;
		directionDesktop?: StackDirection | null;
		directionTablet?: StackDirection | null;
		align?: StackAlign;
		justify?: StackJustify;
		spacing?: SpacingSize | null;
		shrink?: number;
		fullHeight?: boolean;
		children: Snippet;
	} = $props();

	let compiledStyle = $derived(
		[
			spacing ? `--stack-spacing: var(--spacing-${spacing})` : null,
			direction !== 'row' ? `--stack-direction-mobile: ${direction}` : null,
			directionTablet ? `--stack-direction-tablet: ${directionTablet}` : null,
			directionDesktop ? `--stack-direction-desktop: ${directionDesktop}` : null,
			fullHeight ? `--stack-height: 100%` : null,
			align !== 'normal' ? `--stack-align: ${align}` : null,
			justify !== 'normal' ? `--stack-justify: ${justify}` : null,
			shrink !== 1 ? `--stack-shrink: ${shrink}` : null
		]
			.filter(Boolean)
			.join(';')
	);
</script>

<div style={compiledStyle}>
	{@render children()}
</div>

<style>
	div {
		--stack-spacing: 0;
		--stack-shrink: 1;
		--stack-align: normal;
		--stack-justify: normal;
		--stack-height: auto;
		--stack-direction-mobile: row;
		--stack-direction-tablet: var(--stack-direction-mobile);
		--stack-direction-desktop: var(--stack-direction-tablet);

		display: flex;
		gap: var(--stack-spacing);
		align-items: var(--stack-align);
		justify-content: var(--stack-justify);
		flex-shrink: var(--stack-shrink);
		height: var(--stack-height);
		flex-direction: var(--stack-direction-mobile);
	}

	@media screen and (min-width: 577px) {
		div {
			flex-direction: var(--stack-direction-tablet);
		}
	}

	@media screen and (min-width: 993px) {
		div {
			flex-direction: var(--stack-direction-desktop);
		}
	}
</style>

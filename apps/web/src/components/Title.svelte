<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SizeType } from 'types/types';

	let {
		sizeMobile = null,
		sizeTablet = null,
		sizeDesktop = null,
		isSubtitle = false,
		isSpaced = false,
		size = isSubtitle ? 5 : 3,
		textWeight = null,
		align = null,
		multiline = false,
		children
	}: {
		sizeMobile?: null | SizeType;
		sizeTablet?: null | SizeType;
		sizeDesktop?: null | SizeType;
		isSubtitle?: boolean;
		isSpaced?: boolean;
		size?: number;
		textWeight?: null | 'semibold';
		align?: null | 'centered';
		multiline?: boolean;
		children: Snippet;
	} = $props();
</script>

<h1
	class:title={!isSubtitle}
	class:subtitle={isSubtitle}
	class:multiline
	class={`is-size-${size}
  ${sizeMobile ? `is-size-${sizeMobile}-mobile` : ''}
  ${sizeTablet ? `is-size-${sizeTablet}-tablet` : ''}
  ${sizeDesktop ? `is-size-${sizeDesktop}-desktop` : ''}
  ${textWeight ? `has-text-weight-${textWeight}` : ''}
  ${align ? `has-text-${align}` : ''}`}
	class:is-spaced={isSpaced}
>
	{@render children()}
</h1>

<style type="text/scss">
	@use 'bulma/sass/utilities/_all';
	@use 'bulma/sass/elements/title.sass';

	h1 {
		max-width: 100%;
		&:not(.multiline) {
			text-overflow: ellipsis;

			/* Needed to make ellipsis work */
			overflow: hidden;
			white-space: nowrap;
		}

		color: inherit !important;
	}
</style>

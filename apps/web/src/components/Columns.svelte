<script lang="ts">
	// TODO: This is just a standard flexbox layout
	export let multiline = false;
	export let reversed = false;
</script>

<div class="columns" class:is-multiline={multiline} class:is-reversed={reversed} {...$$restProps}>
	<slot />
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

<script>
	import Backdrop from './Backdrop.svelte';

	let { children } = $props();
</script>

<div class="hero">
	<Backdrop />
	<div class="content">
		{@render children()}	
	</div>
</div>

<style>
	.hero {
		position: relative;
		max-width: var(--hero-max-width);
		margin: auto;
		/* aspect-ratio: 17/10; */
		padding-left: 10%;
		padding-right: 10%;
		overflow: hidden;
	}

	@media screen and (max-width: 992px) {
		.hero {
			aspect-ratio: unset;
		}
	}

	.content {
		position: relative;
		width: 100%;
		height: 100%;
		z-index: 1;
	}
</style>

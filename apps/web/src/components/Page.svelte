<script lang="ts">
	let { children } = $props();
</script>

<div>
	{@render children()}
</div>

<style>
	div {
		background: white;
		min-height: 100vh;
		max-width: var(--page-max-width);
		margin: auto;
		padding: 16px;
	}
</style>

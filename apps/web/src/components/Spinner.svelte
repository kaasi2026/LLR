<script>
	import Icon from './Icon.svelte';
</script>

<span class="spinner">
	<Icon icon="spinner" />
</span>

<style>
	.spinner {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		animation: spinner 0.6s linear infinite;
	}

	@keyframes spinner {
		to {
			transform: rotate(360deg);
		}
	}
</style>

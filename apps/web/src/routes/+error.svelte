<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status}</title>
</svelte:head>

<main>
	<h1>{page.status}</h1>

	<p>{page.error?.message ?? 'An unexpected error occurred.'}</p>
</main>

<style>
	h1 {
		font-size: 2.8em;
		font-weight: 700;
	}

	main {
		text-align: center;
	}

	@media (min-width: 480px) {
		h1 {
			font-size: 4em;
		}
	}
</style>

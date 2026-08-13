<script lang="ts">
	import { onMount } from 'svelte';
	import NavBar from 'components/NavBar.svelte';
	import Footer from 'components/Footer.svelte';

	let content = '';

	onMount(async () => {
		try {
			const response = await fetch('/privacy.md');
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			content = await response.text();
		} catch (error) {
			console.error("Error couldn't load privacy site:", error);
			content = 'Error: Privacy site was not loaded.';
		}
	});
</script>

<NavBar />

<section class="page-section">
	<div class="page-container">
		<div class="page-heading">
			<h1>Privacy</h1>
		</div>
		<div class="page-content">
			<pre>{content}</pre>
		</div>
	</div>
</section>

<Footer />

<style type="text/scss">
	.page-section {
		padding: 2.5rem 0;
		border-radius: 20px;
		border: 1px solid rgba(134, 77, 203, 0.06);
		background: rgba(255, 255, 255, 0.9);
		max-width: 1100px;
		margin: 2rem auto;
		box-shadow: 0 20px 45px rgba(75, 40, 120, 0.06);
	}

	.page-container {
		padding: 1.25rem 1.5rem;
	}

	.page-heading h1 {
		margin: 0 0 0.75rem 0;
		color: #3a1f71;
	}

	.page-content pre {
		white-space: pre-wrap;
		word-break: break-word;
		color: #4b3a5d;
	}
</style>

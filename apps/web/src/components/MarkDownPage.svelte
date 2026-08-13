<script lang="ts">
	import NavBar from 'components/NavBar.svelte';
	import Content from 'components/Content.svelte';

	export let readmeHTML: string;
	export let title: string | null;
	export let description: string | null = null;
	export let className: string = '';
</script>

<svelte:head>
	<title>{title}</title>
	{#if description}
		<meta name="description" content={description} />
	{/if}
</svelte:head>

<NavBar />

<!-- Flexibler Container mit voller Höhe -->
<section class={`hero is-primary md-page ${className}`}>
	<div class="hero-body hero-body--column">
		<div class="container container--column">
			<h1 class="title">{title}</h1>
			<div class="section box box--intro">
				<!-- Markdown-Inhalt wird nur hier gerendert -->
				<Content class="markdown-content">
					{@html readmeHTML}
				</Content>
				<!-- Buttons kommen über den Slot -->
				<slot />
			</div>
		</div>
	</div>
</section>

<style lang="scss">
	:global(.intro-page) {
		background: radial-gradient(circle at top left, rgba(134, 77, 203, 0.14), transparent 22%),
			linear-gradient(180deg, rgba(241, 236, 255, 0.95), #f7f2ff 100%);
	}

	:global(.intro-page) .hero-body--column,
	:global(.intro-page) .container--column {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	:global(.intro-page) .hero-body--column {
		padding-top: 2rem;
		padding-bottom: 2rem;
	}

	:global(.intro-page) .box--intro {
		flex: 1;
		display: flex;
		flex-direction: column;
		background: rgba(255, 255, 255, 0.96);
		border-radius: 32px;
		border: 1px solid rgba(134, 77, 203, 0.14);
		box-shadow: 0 28px 90px rgba(110, 65, 195, 0.08);
		padding: 2rem;
	}

	:global(.intro-page) .title {
		color: #4b2f80;
		margin-bottom: 1rem;
	}

	:global(.intro-page) .markdown-content {
		flex: 1;
		padding-bottom: 1rem;
	}

	:global(.intro-page) .markdown-content :global(h1),
	:global(.intro-page) .markdown-content :global(h2),
	:global(.intro-page) .markdown-content :global(h3) {
		color: #4b2f80;
	}

	:global(.intro-page) .markdown-content :global(p),
	:global(.intro-page) .markdown-content :global(li) {
		color: #4b2f80;
	}

	:global(.intro-page) .intro-actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.75rem;
		padding-top: 1.5rem;
		border-top: 1px solid rgba(134, 77, 203, 0.08);
	}

	@media (max-width: 768px) {
		:global(.intro-page) .box--intro {
			padding: 1.5rem;
		}
	}
</style>

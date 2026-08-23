<script>
	// TODO: Check if this component is really necessary
	import { onMount } from 'svelte';
	import Icon from './Icon.svelte';

	let { children } = $props();

	let scroller = $state();
	let scrollPosition = $state(0);
	let scrollWidth = $state(200);
	let containerWidth = $state(100);
	let needsScroll = $derived(scrollWidth > containerWidth);

	const updateScrollPosition = () => {
		scrollPosition = scroller.scrollLeft;
		containerWidth = scroller.offsetWidth;
		scrollWidth = scroller.scrollWidth - containerWidth;
	};

	onMount(() => {
		window.addEventListener('resize', updateScrollPosition);
		updateScrollPosition();

		return () => {
			window.removeEventListener('resize', updateScrollPosition);
		};
	});
</script>

<div class="wrapper">
	<div class="content" bind:this={scroller} onscroll={updateScrollPosition}>
		{@render children()}
	</div>

	{#if scrollPosition > 0}
		<div class="shadow-left"><Icon icon="circle-arrow-left" /></div>
	{/if}

	{#if needsScroll && scrollPosition < scrollWidth}
		<div class="shadow-right"><Icon icon="circle-arrow-right" /></div>
	{/if}
</div>

<style>
	.wrapper {
		width: 100%;
		height: 100%;
		position: relative;
	}

	.content {
		position: relative;
		width: 100%;
		height: 100%;
		overflow-x: auto;
		scrollbar-width: none;
		&::-webkit-scrollbar {
			display: none;
		}
	}

	.shadow-right,
	.shadow-left {
		display: flex;
		position: absolute;
		width: 24px;
		height: 48px;
		top: 0;
		bottom: 0;
		align-items: center;
		bottom: calc(100vh - 68px);
	}

	.shadow-left {
		left: 0;
		background: linear-gradient(270deg, transparent, white, white);
	}

	.shadow-right {
		right: 0;
		background: linear-gradient(90deg, transparent, white, white);
	}
</style>

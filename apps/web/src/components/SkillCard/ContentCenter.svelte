<script lang="ts">
	import Summary from './Summary.svelte';
	import Title from 'components/Title.svelte';

	let { name, completed, summary, stale } = $props();
</script>

<div class="media-content" class:completed class:stale>
	<Title size={4}>{name}</Title>
	<Summary {summary} {stale} {completed} />
</div>

<style type="text/scss">
	.completed,
	.stale {
		color: $white;
	}
</style>

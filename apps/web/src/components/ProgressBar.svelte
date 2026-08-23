<script lang="ts">
	import Progress from './Progress.svelte';
	import { Tween } from 'svelte/motion';

	let { value = 0 } = $props();

	const progress = Tween.of(() => value);
</script>

<div>
	<Progress value={progress.current} />
</div>

<style type="text/scss">
	div {
		padding-bottom: $size-6;
	}
</style>

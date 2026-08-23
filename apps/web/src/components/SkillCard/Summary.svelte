<script lang="ts">
	import ClampedText from 'components/ClampedText.svelte';

	let { summary, stale, completed }: { summary: string[]; stale: boolean; completed: boolean } =
		$props();
</script>

<div class:completed class:stale>
	<ClampedText text={`Learn: ${summary.join(', ')}`} />
</div>

<style type="text/scss">
	.completed,
	.stale {
		color: $white;
	}
</style>

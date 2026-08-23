<script lang="ts">
	// TODO: This is just a CSS wrapper remove
	let { text } = $props();
</script>

<p class="is-6 clamp">{text}</p>

<style type="text/scss">
	.clamp {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}
</style>

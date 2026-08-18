<script lang="ts">
	let { src, alt, link } = $props();
</script>

<a href={link} class="logo">
	<img {src} {alt} />
</a>

<style>
	.logo {
		display: block;

		img {
			height: var(--deprecated-navbar-logo-height);
		}
	}
</style>

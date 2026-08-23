<script lang="ts">
	let { shadow = true, glow = false } = $props();

	let imageURL = $derived(
		shadow === true ? '/images/mascot-jetpack.svg' : '/images/mascot-jetpack-noshadow.svg'
	);
</script>

<img
	data-test="mascot-jetpack"
	src={imageURL}
	alt="LibreLingo Mascot"
	class="mascot"
	class:mascot--glow={glow}
/>

<style>
	img {
		min-width: 200px;
		object-fit: contain;
	}
</style>

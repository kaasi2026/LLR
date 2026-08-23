<script lang="ts">
	let { size = 'medium', prefix = 'fas', icon, left = false } = $props();
</script>

<span class={`icon is-${size}`} class:is-left={left}>
	<i class={`${prefix} fa-${icon} ${size === 'large' ? 'fa-2x' : ''}`}></i>
</span>

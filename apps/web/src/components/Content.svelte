<!-- TODO: Is this necessary? -->
<script lang="ts">
	let { children } = $props();
</script>

<div class="content">
	{@render children()}
</div>

<style type="text/scss">
	@use 'bulma/sass/utilities/initial-variables.sass';
	@use 'bulma/sass/utilities/derived-variables.sass';
	@use 'bulma/sass/utilities/mixins.sass';
	@use 'bulma/sass/elements/content.sass';
</style>

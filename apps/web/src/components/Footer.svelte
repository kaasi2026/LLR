<script lang="typescript">
	import Stack from './Stack.svelte';
	import Translate from './Translate.svelte';
	import LicenseLogo from './LicenseLogo.svelte';
</script>

<div class="main-footer">
	<Stack align="center" direction="column" spacing="s">
		{#if $$slots.default}
			<slot />
		{:else}
			<div class="buttonset">
				<a href="https://codeberg.org/LibreLingoRelive/LibreLingoRelive_Docs">
					<Translate key="index.development_docs_english_only">Development docs (English)</Translate
					>
				</a>
			</div>
			<div>
				<strong>LibreLingoRelive</strong> is a fork from LibreLingoCommunity, which is a fork from
				<strong>LibreLingo</strong>
				was created by
				<a href="https://github.com/kantord">Dániel Kántor</a>
				and
				<a href="https://github.com/LibreLingo/LibreLingo#contributors">various contributors</a>.
				<p></p>
				The
				<a href="https://codeberg.org/LibreLingoRelive">source code</a>
				is licensed
				<a href="https://opensource.org/licenses/AGPL-3.0">AGPL-3.0.</a>
			</div>
			<LicenseLogo />
		{/if}
	</Stack>
</div>

<style>
	.main-footer {
		padding-top: 2rem;
		padding-bottom: 2rem;
	}
</style>

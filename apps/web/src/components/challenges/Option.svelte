<script lang="ts">
	let { active, inactive, correct, formInTargetLanguage } = $props();
</script>

<div class:active class:inactive>
	<div
		class="option"
		data-test={active ? 'active' : inactive ? 'inactive' : 'neutral'}
		data-test-correct={correct}
	>
		<div class="option-content">
			<div class="is-size-5 is-size-6-mobile">{formInTargetLanguage}</div>
		</div>
	</div>
</div>

<style type="text/scss">
	.option {
		padding: 0.75em 0;
		transition:
			opacity 0.15s,
			outline 0.2s;
		cursor: pointer;
	}

	.inactive .option {
		opacity: 0.65;
	}

	@include mobile {
		.option-content {
			padding: $size-7;
		}
	}
</style>

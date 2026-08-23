<script lang="ts">
	let { phrase } = $props();
</script>

<b class="phrase">
	{#each phrase as { word, definition }}
		{#if definition}
			<span class="has-tooltip" data-tooltip={definition}>{word}</span>
		{:else}<span>{word}</span>{/if}
	{/each}
</b>

<style>
	.phrase span {
		margin: 0 0.15em;

		&.has-tooltip {
			text-decoration: dotted underline rgba(50, 115, 220, 0.5);
		}

		&:first-child {
			margin-left: 0;
		}
		&:last-child {
			margin-left: 0;
		}
	}

	/* Standalone Tooltip Logic */
	.has-tooltip {
		position: relative;
		text-decoration: dotted underline rgba(32, 156, 238, 0.6);
		cursor: help;
	}

	/* Tooltip Box */
	.has-tooltip::after {
		content: attr(data-tooltip);
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%) translateY(4px);

		background-color: #2b2b2b;
		color: #ffffff;
		font-weight: normal;
		font-size: 0.75rem;
		line-height: 1.2;
		padding: 0.35rem 0.6rem;
		border-radius: 4px;
		white-space: nowrap;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

		opacity: 0;
		visibility: hidden;
		pointer-events: none;
		transition:
			opacity 0.15s ease-in-out,
			transform 0.15s ease-in-out;
		z-index: 100;
	}

	/* Show on Hover */
	.has-tooltip:hover::after {
		opacity: 1;
		visibility: visible;
		transform: translateX(-50%) translateY(8px);
	}
</style>

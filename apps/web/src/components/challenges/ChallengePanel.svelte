<script lang="ts">
	import Button from 'components/Button.svelte';
	import Panel from 'components/Panel.svelte';

	let {
		buttonText,
		buttonAction,
		correct = false,
		incorrect = false,
		typo = false,
		message,
		messageDetail,
		submit,
		skipAction,
		skipAllAction,
		skipAllVoice
	}: {
		buttonText?: string;
		buttonAction?: (e: Event) => void;
		correct?: boolean;
		incorrect?: boolean;
		typo?: boolean;
		message?: string;
		messageDetail?: string;
		submit?: boolean;
		skipAction?: (e: Event) => void;
		skipAllAction?: (e: Event) => void;
		skipAllVoice?: (e: Event) => void;
	} = $props();

	let background: 'default' | 'success' | 'failure' | 'info' = (() => {
		if (correct) {
			return 'success';
		}
		if (incorrect) {
			return 'failure';
		}
		if (typo) {
			return 'info';
		}

		return 'default';
	})();
</script>

<Panel {background}>
	{#snippet left()}
		<div>
			{#if skipAction}
				<Button onclick={skipAction}>Skip</Button>
			{/if}
			<Button onclick={skipAllAction}>Cancel</Button>
			{#if skipAllVoice}
				<Button onclick={skipAllVoice}>Can't listen now</Button>
			{/if}
			{#if message}<b>{message}</b>{/if}
			{#if messageDetail}
				<p>{messageDetail}</p>
			{/if}
		</div>
	{/snippet}
	{#snippet right()}
		<div>
			{#if buttonAction}
				<Button style="primary" type="submit" onclick={buttonAction}>
					{buttonText}
				</Button>
			{/if}
			{#if submit}
				<Button style="primary" type="submit">Submit</Button>
			{/if}
		</div>
	{/snippet}
</Panel>

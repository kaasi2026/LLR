<script lang="ts">
	import { onMount } from 'svelte';
	import hotkeys from 'hotkeys-js';
	import Option from './Option.svelte';

	let { options, selectedOption = $bindable(null), disabled } = $props();

	onMount(() => {
		hotkeys.unbind('1,2,3');
		hotkeys('1,2,3', (_, { key }) => {
			if (disabled) return;
			selectedOption = parseInt(key) - 1;
		});
	});
</script>

<ul class="options">
	{#each options as { formInTargetLanguage, correct, fake }, i}
		<li>
			<label for={i.toString()} class:fake={fake && true}>
				<input
					type="radio"
					bind:group={selectedOption}
					value={i}
					name={i.toString()}
					id={i.toString()}
					{disabled}
				/>
				<Option
					{correct}
					active={selectedOption === i}
					inactive={selectedOption !== null && selectedOption !== i}
					{formInTargetLanguage}
				/>
			</label>
		</li>
	{/each}
</ul>

<style>
	.options {
		list-style: none;
		padding-top: 1.5em;
		margin: 0;
		margin-left: -0.5em;
		margin-right: -0.5em;
		user-select: none;
	}
	input {
		margin-right: 5px;
		cursor: pointer;
	}
	label {
		display: flex;
		align-items: center;
	}
</style>

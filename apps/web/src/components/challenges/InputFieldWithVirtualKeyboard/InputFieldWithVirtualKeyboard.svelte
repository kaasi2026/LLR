<script lang="ts">
	import VirtualKeyboard from './VirtualKeyboard.svelte';

	let {
		value = $bindable(''),
		specialCharacters,
		languageCode,
		disabled
	}: {
		value: string | null;
		specialCharacters: string[];
		languageCode: string;
		disabled: boolean;
	} = $props();

	let inputFieldRef: HTMLInputElement | null = $state(null);

	$effect(() => {
		if (disabled && inputFieldRef) {
			inputFieldRef.blur();
		}
	});

	const focusMe = (el: HTMLInputElement) => {
		setTimeout(() => {
			if (el.disabled) {
				el.blur();
			} else {
				el.focus();
			}
		}, 1);
	};

	function insertAtCaret(element: HTMLInputElement, text: string) {
		if (element.selectionStart || element.selectionStart === 0) {
			let startPos = element.selectionStart;
			let endPos = element.selectionEnd ?? element.value.length;
			let scrollTop = element.scrollTop;
			element.value =
				element.value.substring(0, startPos) +
				text +
				element.value.substring(endPos, element.value.length);
			element.focus();
			element.selectionStart = startPos + text.length;
			element.selectionEnd = startPos + text.length;
			element.scrollTop = scrollTop;
		} else {
			element.value += text;
			element.focus();
		}
	}

	const handleVirtualKey = (character: string) => () => {
		if (inputFieldRef) {
			inputFieldRef.focus();
			insertAtCaret(inputFieldRef, character);
			value = inputFieldRef.value;
		}
	};
</script>

<!-- TODO: Fix the autofocus -->
<input
	tabindex={0}
	data-test="answer"
	type="text"
	class="input"
	autofocus
	placeholder="Type your answer…"
	{disabled}
	spellcheck="false"
	autocapitalize="none"
	lang={languageCode}
	use:focusMe
	bind:value
	bind:this={inputFieldRef}
/>

{#if !disabled}
	<VirtualKeyboard characters={specialCharacters} {handleVirtualKey} />
{/if}

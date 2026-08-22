export const getNodeType = (node: HTMLElement): 'chips' | 'answer' | null => {
	let parent = node.closest('#answer, #chips');
	if (parent && (parent.id === 'chips' || parent.id === 'answer')) {
		return parent.id;
	} else {
		return null;
	}
};

export const getChipIndex = (node: HTMLElement): number => {
	if (!node.classList.contains('chip') && node.parentElement) {
		return getChipIndex(node.parentElement);
	}

	if (node.previousSibling !== null) {
		return 1 + getChipIndex(node.previousSibling as HTMLElement);
	}

	return 0;
};

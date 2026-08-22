import Sortable from 'sortablejs';

export const createSortable = (element: HTMLElement, onUpdate: () => void): Sortable => {
	let sortable = Sortable.create(element, {
		group: 'chips',
		onEnd: () => {
			onUpdate();
		}
	});
	return sortable;
};

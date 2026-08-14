import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';

export function load(): PageServerLoad {
	redirect(307, '/');
}

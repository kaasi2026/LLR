import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';

// Redirect to homepage
export function load(): PageServerLoad {
	redirect(307, '/');
}

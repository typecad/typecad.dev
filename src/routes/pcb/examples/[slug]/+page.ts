import { error } from '@sveltejs/kit';
import { getExample } from '$lib/examples';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const example = getExample('pcb', params.slug);
	if (!example) error(404, 'Example not found');
	return { example };
};

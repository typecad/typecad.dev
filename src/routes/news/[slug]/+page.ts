import { error } from '@sveltejs/kit';
import { getNewsArticle } from '$lib/news';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const article = getNewsArticle(params.slug);
	if (!article) error(404, 'Article not found');
	return { article };
};

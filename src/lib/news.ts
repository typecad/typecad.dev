import { marked } from 'marked';

export interface NewsArticle {
	slug: string;
	title: string;
	description: string;
	date: string;
	dateFormatted: string;
	published: boolean;
	html: string;
}

function frontmatter(raw: string): { meta: Record<string, string>; body: string } {
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	const meta: Record<string, string> = {};
	if (!match) return { meta, body: raw };
	for (const line of match[1].split(/\r?\n/)) {
		const kv = line.match(/^(\w+):\s*(.*)$/);
		if (kv) meta[kv[1].toLowerCase()] = kv[2].trim().replace(/^['"]|['"]$/g, '');
	}
	return { meta, body: raw.slice(match[0].length) };
}

const files = import.meta.glob('../news/*.md', {
	query: '?raw',
	eager: true,
	import: 'default'
}) as Record<string, string>;

const articles: NewsArticle[] = Object.entries(files)
	.filter(([path]) => !path.includes('_')) // _TEMPLATE.md and other drafts stay out
	.map(([path, raw]) => {
		const slug = path.replace(/^.*\//, '').replace(/\.md$/, '');
		const { meta, body } = frontmatter(raw);
		const date = meta.date ?? '';
		return {
			slug,
			title: meta.title ?? slug,
			description: meta.description ?? '',
			date,
			dateFormatted: date
				? new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})
				: '',
			html: marked.parse(body, { async: false }),
			published: meta.published !== 'false'
		};
	})
	.filter((a) => a.published)
	.sort((a, b) => (a.date < b.date ? 1 : -1));

export function listNews(): NewsArticle[] {
	return articles;
}

export function getNewsArticle(slug: string): NewsArticle | undefined {
	return articles.find((a) => a.slug === slug);
}

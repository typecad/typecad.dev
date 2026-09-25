import { json } from '@sveltejs/kit';

// Search content is bundled at BUILD TIME via import.meta.glob with `?raw`,
// not read off the filesystem at request time (the serverless bundle ships
// only compiled JS — same pattern the typecode website uses for markdown).
// The docs pages here are hand-built Svelte components, so the raw source is
// cleaned into searchable text below: script blocks keep their content (code
// examples and table rows live there), import lines and Svelte control-flow
// are dropped, and tag attribute strings are harvested before tags are stripped.
type RawModule = { default: string };

const halFiles = import.meta.glob('../../hal/docs/**/+page.svelte', {
	query: '?raw',
	eager: true
}) as Record<string, RawModule>;
const pcbFiles = import.meta.glob('../../pcb/docs/**/+page.svelte', {
	query: '?raw',
	eager: true
}) as Record<string, RawModule>;

export interface SearchResult {
	title: string;
	href: string;
	content: string;
	preview: string;
	section: 'pcb' | 'hal';
}

function hrefFromGlobPath(globPath: string): string {
	const slug = globPath.replace(/^(\.\.\/)+/, '').replace(/\/\+page\.svelte$/, '');
	return `/${slug}`;
}

function extractTitle(source: string): string {
	const title = source.match(/<title>([^<]+)<\/title>/)?.[1] ?? '';
	// strip the site suffix: "GPIO & Digital I/O — typeCAD/hal docs"
	return title
		.replace(/\s*—\s*typeCAD.*$/, '')
		.replace(/&amp;/g, '&')
		.trim();
}

function extractText(source: string): string {
	let text = source
		// drop import lines (single-line in these sources)
		.replace(/^\s*import\s.*$/gm, '')
		// drop Svelte control-flow / render lines
		.replace(/^\s*\{#(each|if|snippet).*$/gm, '')
		.replace(/^\s*\{:(else|const).*$/gm, '')
		.replace(/^\s*\{\/(each|if|snippet)\}$/gm, '')
		.replace(/^\s*\{@(render|const).*$/gm, '');

	// harvest string attribute values (purpose="...", signature={"..."}) before
	// the tags they live in are stripped
	const attrs: string[] = [];
	for (const m of text.matchAll(/=(?:"([^"]{2,})"|\{'([^']{2,})'\}|\{"([^"]{2,})"\})/g)) {
		attrs.push(m[1] ?? m[2] ?? m[3] ?? '');
	}

	text = text
		// strip remaining tags
		.replace(/<[^>]*>/g, ' ')
		// template-literal code examples survive as-is; drop backticks
		.replace(/`/g, ' ')
		// collapse leftover brace/bracket syntax noise
		.replace(/[{}[\]]/g, ' ')
		.replace(/\s+/g, ' ');

	return [...attrs, text].join(' ').replace(/\s+/g, ' ').trim();
}

function resultsFromGlob(
	files: Record<string, RawModule>,
	section: SearchResult['section']
): SearchResult[] {
	const results: SearchResult[] = [];
	for (const [globPath, mod] of Object.entries(files)) {
		const href = hrefFromGlobPath(globPath);
		const title = extractTitle(mod.default) || href;
		const content = extractText(mod.default);
		results.push({
			title,
			href,
			content,
			preview: content.slice(0, 200),
			section
		});
	}
	return results;
}

const halIndex = resultsFromGlob(halFiles, 'hal');
const pcbIndex = resultsFromGlob(pcbFiles, 'pcb');

export function GET({ url }) {
	const section = url.searchParams.get('section') === 'pcb' ? pcbIndex : halIndex;
	return json(section, {
		headers: { 'Cache-Control': 'public, max-age=3600' }
	});
}

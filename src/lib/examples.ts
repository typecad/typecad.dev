import { marked } from 'marked';

export type ExampleSection = 'pcb' | 'hal';

export interface Example {
	slug: string;
	section: ExampleSection;
	title: string;
	description: string;
	html: string;
}

export interface ExampleStub {
	/** title of an example that will be written later */
	title: string;
	blurb: string;
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

/** clean up an example's markdown for rendering on this site */
function transform(body: string): string {
	return body
		.replace(/<script[\s\S]*?<\/script>/gi, '') // source-site script blocks
		.replace(/^\s*<Youtube[\s\S]*?\/>\s*$/gim, '') // video embeds from the old site
		.replace(/\s*\[!code[^\]]*\]/g, '') // shiki diff/highlight tokens
		.replace(/@typecad\/typecad/g, '@typecad/pcb')
		.replace(/\(\/docs\/requirements\)/g, '(/pcb/docs/getting-started)')
		.replace(/\(\/docs\//g, '(/pcb/docs/');
}

function plainText(markdown: string): string {
	return markdown
		.replace(/[#>*_`[\]()]/g, '')
		.replace(/<[^>]*>/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function build(
	section: ExampleSection,
	files: Record<string, string>
): Record<string, Example> {
	const out: Record<string, Example> = {};
	for (const [path, raw] of Object.entries(files)) {
		const slug = path.replace(/^.*\//, '').replace(/\.md$/, '');
		const { meta, body } = frontmatter(raw);
		const cleaned = transform(body);

		const heading = cleaned.match(/^#\s+(.+)$/m)?.[1] ?? '';
		const firstPara =
			cleaned
				.split(/\n{2,}/)
				.map((p) => p.trim())
				.find((p) => p && !p.startsWith('#')) ?? '';

		out[slug] = {
			slug,
			section,
			title: meta.title ?? (plainText(heading) || slug),
			description: meta.description ?? plainText(firstPara).slice(0, 160),
			html: marked.parse(cleaned, { async: false })
		};
	}
	return out;
}

const pcbFiles = import.meta.glob('../content/pcb-examples/*.md', {
	query: '?raw',
	eager: true,
	import: 'default'
}) as Record<string, string>;
const halFiles = import.meta.glob('../content/hal-examples/*.md', {
	query: '?raw',
	eager: true,
	import: 'default'
}) as Record<string, string>;

const pcbExamples = build('pcb', pcbFiles);
const halExamples = build('hal', halFiles);

export function listExamples(section: ExampleSection): Example[] {
	const map = section === 'pcb' ? pcbExamples : halExamples;
	return Object.values(map).sort((a, b) => a.title.localeCompare(b.title));
}

export function getExample(section: ExampleSection, slug: string): Example | undefined {
	return (section === 'pcb' ? pcbExamples : halExamples)[slug];
}

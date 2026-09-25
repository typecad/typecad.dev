<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';
	import MethodDoc from '$lib/components/docs/method-doc.svelte';

	const storeExample = `import { Store, UART0 } from '@typecad/hal';

const settings = new Store('app');

const boots = settings.getInt('boots', 1);   // first boot reads the default: 1
if (boots === 1) {
  UART0.writeLine('first run');
}
settings.setInt('boots', boots + 1);

settings.setString('ssid', 'MyNet');
settings.setFloat('offset', -1.25);
settings.setBool('calibrated', true);

UART0.writeLine(settings.getString('ssid', '(none)'));`;

	const storeRemove = `settings.remove('ssid');   // delete one key
settings.clear();          // delete every tc/app/* key this program wrote`;

	const fileExample = `import { File } from '@typecad/hal';

const log = new File('/log.txt');

log.write('boot\\n');              // overwrite (creates the file when absent)
if (log.exists()) {
  UART0.writeLine(log.read());        // 'boot\\n'
  log.remove();
}`;

	const bootCounter = `const boot = new File('/boot-count.txt');
boot.write(String(Number(boot.read() || '0') + 1));`;

	const storeMethods = [
		['new Store(namespace)', "One namespace per store — 'app' becomes the tc/app/ settings subtree"],
		['getInt / getFloat / getString / getBool(key, default)', 'Typed read; the default is required — unset keys read back exactly what you chose'],
		['setInt / setFloat / setString / setBool(key, value)', 'Typed write, committed per key'],
		['remove(key)', 'Delete one key'],
		['clear()', 'Delete every key this program wrote in its namespace']
	];

	const fileMethods = [
		['new File(path)', 'Whole-file text I/O — no open()/close()'],
		['write(text)', 'Overwrite (creates the file when absent); there is no append'],
		['read()', "The whole file — '' for a missing file and an empty file alike"],
		['exists()', 'Distinguish missing from empty'],
		['remove()', 'Delete the file']
	];

	const which = [
		['Shape', 'Many typed keys under a namespace', 'One whole text document per path'],
		['Best at', 'Counters, calibration, flags', 'Notes, exported JSON, logs a person reads'],
		['Writes', 'Per-key commits', 'Whole-file rewrites'],
		['Types', 'Typed pairs, required defaults', "None — it's text"]
	];
</script>

<svelte:head>
	<title>Storage &amp; Persistent Data — typeCAD/hal docs</title>
	<meta
		name="description"
		content="Store for typed key/value settings, File for whole-file text — both live in the storage partition and survive re-flashing the app."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Storage &amp; Persistent Data</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	Two ways to keep data on the board, and one guarantee that covers both:
	<strong>values live in the board's storage partition, not the application image, so they survive
	re-flashing the app.</strong> (Erasing the whole flash wipes them.)
</p>
<ul class="ml-6 mt-3 list-disc space-y-1 text-sm text-muted-foreground">
	<li><strong>Store</strong> — typed key/value settings for device state: counters, calibration, flags. One namespace per store.</li>
	<li><strong>File</strong> — whole-file text I/O for things a person might read or edit: notes, exported JSON, a boot log.</li>
</ul>
<p class="mt-3 text-sm leading-relaxed">
	There is no session on either one — nothing to set up first. Everything is ready the moment your
	program runs.
</p>

<ApiCard
	name="Store"
	purpose="Typed key/value settings. Construct a store with a namespace; every read and write rides
		that namespace, so several stores can coexist without colliding."
	imports={"import { Store } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={storeExample} label="store.ts" />
	{/snippet}
	<Callout>
		The <code>get</code> methods take a <strong>required default</strong>. There is no hidden zero
		or empty-string value for "absent" — an unset key reads back exactly the default you chose,
		which makes first-boot logic explicit.
	</Callout>
	<MethodDoc name="remove / clear" signature="remove(key): void">
		<CodeBlock code={storeRemove} label="cleanup.ts" class="mt-1" />
	</MethodDoc>
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">All methods</h3>
	<DocsTable headers={['Member', 'Description']} rows={storeMethods} monoCols={[0]} />
</ApiCard>

<ApiCard
	name="File"
	purpose="Whole-file text I/O. Construct with the path; write, read, exists, and remove are all
		there is."
	imports={"import { File } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={fileExample} label="file.ts" />
	{/snippet}
	<p class="text-sm leading-relaxed">A boot counter that survives re-flashing is two lines:</p>
	<CodeBlock code={bootCounter} label="boot-counter.ts" class="mt-3" />
	<Callout>
		<ul class="ml-4 list-disc space-y-1">
			<li><code>read()</code> returns <code>""</code> for a missing file and an empty file alike — check <code>exists()</code> first when the difference matters.</li>
			<li><code>write()</code> <strong>overwrites</strong>; there is no append. To append, read, concatenate, write back.</li>
			<li><code>write()</code> creates the <em>file</em> when absent, but not parent directories — keep files at the root of the partition.</li>
			<li>Return buffers are shim-owned until the next read — copy anything you need to keep.</li>
		</ul>
	</Callout>
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">All methods</h3>
	<DocsTable headers={['Member', 'Description']} rows={fileMethods} monoCols={[0]} />
</ApiCard>

<h2 class="mt-12 text-2xl font-bold tracking-tight">Which one to use</h2>
<div class="mt-4">
	<DocsTable headers={['', 'Store', 'File']} rows={which} />
</div>

<Callout label="Advanced — where the data physically lives">
	Both live in the board's storage partition (internal flash). If the board defines none — most
	STM32 boards define only bootloader slots — the build generates one near the top of flash when
	your program uses <code>Store</code> or <code>File</code>. Anything in flash is readable by anyone
	holding the board; neither store is a place for secrets.
</Callout>

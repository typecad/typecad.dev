<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';
	import MethodDoc from '$lib/components/docs/method-doc.svelte';

	const basicConnect = `import { WiFi, UART0 } from '@typecad/hal';

const wifi = new WiFi('MyNetwork', { psk: 'correct-horse-battery-staple' });
if (wifi.join()) {
  UART0.writeLine(wifi.ip());        // the IP address as a string
}`;

	const staticIp = `const lab = new WiFi('LabNet', {
  psk: 'correct-horse-battery-staple',
  timeoutMs: 30000,                                        // 30 s deadline
  ipv4: { addr: '10.0.0.5', gateway: '10.0.0.1', netmask: '255.255.255.0' },
  powerSave: WiFi.PS_OFF,   // disable modem sleep for lower latency
  channel: 6,               // 0 / omitted = any
});`;

	const asyncConnect = `const wifi = new WiFi('MyNetwork', { psk: 'hunter22' });

async function network() {
  wifi.joinStart();                       // fire-and-forget associate
  while (!wifi.linked()) { await Time.sleep(100); }
  UART0.writeLine(wifi.ip());
}`;

	const linkEvents = `wifi.onUp(() => UART0.writeLine('online at ' + wifi.ip()));
wifi.onDrop(() => UART0.writeLine('link lost'));   // safe to call join() from here
wifi.join();`;

	const scanExample = `const results = wifi.scan();
for (let i = 0; i < results.count(); i++) {
  UART0.writeLine(results.ssid(i) + '  ' + results.rssi(i) + ' dBm  ch' + results.channel(i));
}`;

	const apExample = `import { WiFiAP } from '@typecad/hal';

const ap = new WiFiAP('hal-setup', { psk: 'config123', channel: 6 });
ap.start();
// ...provisioning...
ap.stop();`;

	const httpRequest = `import { Request, UART0 } from '@typecad/hal';

const req = new Request('GET', 'http://192.168.2.184:8080/health');
req.header('X-Device', 'typecad-hal');
if (req.send()) {
  UART0.writeLine(req.status());              // 200
  UART0.writeLine(req.ok());                  // true for any 2xx
  UART0.writeLine(req.text());                // the body, until the next send
  UART0.writeLine(req.responseHeader('Content-Type'));
}`;

	const httpPost = `new Request(Request.POST, 'http://api.local/telemetry', {
  body: '{"temp":21.5}',
  json: true,                             // sets Content-Type: application/json
  timeoutMs: 5000,
}).header('Authorization', 'Bearer x').send();`;

	const httpsExample = `const pinned = new Request(Request.GET, 'https://internal.corp/api', { caCert: CORP_CA_PEM });
const lab    = new Request(Request.GET, 'https://lab-server.local', { insecure: true });`;

	const asyncRequest = `async function pollCloud() {
  while (true) {
    const req = new Request(Request.GET, 'http://api.local/health');
    await req.send();
    UART0.writeLine(req.status());
    await Time.sleep(5000);
  }
}`;

	const wifiMethods = [
		['new WiFi(ssid, opts?)', 'Link policy: psk, security, channel, band, timeoutMs (default 15 s), powerSave, ipv4 { addr, gateway, netmask }'],
		['join()', 'Associate and wait for IP connectivity. Awaitable'],
		['joinStart()', 'Fire-and-forget associate — poll linked()'],
		['leave()', 'Disassociate'],
		['linked() / rssi() / ip() / mac()', 'Link state and info'],
		['onUp(fn) / onDrop(fn)', 'Link-up / link-down callbacks'],
		['scan()', 'One blocking scan; results via the returned handle. Awaitable']
	];

	const requestMethods = [
		['new Request(method, url, opts?)', 'timeoutMs (default 10 s), body, json, insecure, caCert'],
		['Request.GET / POST / PUT / DELETE / HEAD / PATCH', 'Method tokens'],
		['header(name, value)', 'Attach a request header; chainable'],
		['send()', 'Perform the request. Awaitable'],
		['status() / ok() / text()', 'Response status, 2xx check, body (until the next send)'],
		['contentLength() / responseHeader(name)', 'Response metadata']
	];
</script>

<svelte:head>
	<title>Networking (WiFi &amp; HTTP) — typeCAD/hal docs</title>
	<meta
		name="description"
		content="WiFi carries the whole link policy, Request carries the whole request. https:// is native. ESP32 targets on the Zephyr framework."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Networking (WiFi &amp; HTTP)</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	WiFi and HTTP each live in one class: <code>new WiFi(...)</code> carries the whole link policy
	(credentials, security, timeout), and <code>new Request(...)</code> carries the whole request
	(method, URL, body, TLS policy). The same calls work three ways — blocking at the top level,
	fire-and-forget with callbacks, or <code>async</code>/<code>await</code>.
</p>

<Callout label="Targets">
	WiFi and HTTP require a networked target — an ESP32 board on the Zephyr framework
	(<code>esp32_devkitc</code>, <code>esp32s3_devkitc</code>). They compile-time-error on boards
	without a radio, including the nRF52840-based XIAO.
</Callout>

<ApiCard
	name="WiFi"
	purpose="The WiFi link. Construct the policy, then join(). The constructor carries the credentials;
		join() associates and waits — bounded by timeoutMs (default 15 s) — until the board has an IP
		address."
	imports={"import { WiFi } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={basicConnect} label="connect.ts" />
	{/snippet}

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Static IP and radio tuning</h3>
	<p class="text-sm leading-relaxed">
		Both are construction facts, set at the same time as the credentials. With static
		<code>ipv4</code> facts the link comes up without DHCP — <code>join()</code> returns as soon as
		the address is applied. Omit <code>psk</code> for an open network; security defaults to WPA2
		when a psk is present and OPEN otherwise — override with the <code>WiFi.WPA3</code> /
		<code>WiFi.WPA2_WPA3</code> tokens.
	</p>
	<CodeBlock code={staticIp} label="static-ip.ts" class="mt-3" />

	<MethodDoc name="joinStart / linked" signature="joinStart(): void">
		<p>
			Inside an <code>async</code> function, the join splits into a non-blocking start plus a poll,
			so other tasks keep running while the station associates:
		</p>
		<CodeBlock code={asyncConnect} label="async-connect.ts" class="mt-3" />
	</MethodDoc>

	<MethodDoc name="onUp / onDrop" signature="onUp(fn): WiFi">
		<CodeBlock code={linkEvents} label="link-events.ts" class="mt-1" />
	</MethodDoc>

	<MethodDoc
		name="scan"
		signature="scan(): Scan"
		returns="read-only handle, fixed pool of 16">
		<CodeBlock code={scanExample} label="scan.ts" class="mt-1" />
	</MethodDoc>

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">All methods</h3>
	<DocsTable headers={['Member', 'Description']} rows={wifiMethods} monoCols={[0]} />
</ApiCard>

<ApiCard
	name="WiFiAP"
	purpose="Access-point mode — bring the radio up as an AP for provisioning."
	imports={"import { WiFiAP } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={apExample} label="ap.ts" />
	{/snippet}
</ApiCard>

<ApiCard
	name="Request"
	purpose="The HTTP/S client. Construction carries method, URL, timeout, body, and TLS policy;
		header() chains request headers; send() performs the request and leaves the response in the
		client until the next send."
	imports={"import { Request } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={httpRequest} label="request.ts" />
	{/snippet}

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Method tokens and chaining</h3>
	<CodeBlock code={httpPost} label="post.ts" />

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">HTTPS and certificate pinning</h3>
	<p class="text-sm leading-relaxed">
		HTTPS is native; the CA policy is a construction fact. <code>caCert</code> pins a specific CA
		(a PEM string — it's converted to binary form at build time, so no PEM parser ships on the
		board). <code>insecure: true</code> encrypts but skips verification; don't ship it in
		production.
	</p>
	<CodeBlock code={httpsExample} label="https.ts" class="mt-3" />

	<MethodDoc name="send (async)" signature="await req.send()">
		<p>
			Inside an <code>async</code> function, <code>await req.send()</code> splits into send-start
			plus done-polling — a slow request never stalls the rest of the program:
		</p>
		<CodeBlock code={asyncRequest} label="poll-cloud.ts" class="mt-3" />
		<Callout>
			Put the <code>await</code> on its own statement. A value-position await
			(<code>const ok = await req.send()</code>) cannot suspend mid-expression and falls back to
			the blocking form.
		</Callout>
	</MethodDoc>

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">All methods</h3>
	<DocsTable headers={['Member', 'Description']} rows={requestMethods} monoCols={[0]} />
</ApiCard>

<h2 class="mt-12 text-2xl font-bold tracking-tight">Build-time checks</h2>
<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
	Two checks run before you flash. Using <code>WiFi</code>, <code>Request</code>, or
	<code>Mqtt</code> on a board with no WiFi radio is a build error naming an ESP32 target. And a
	program that issues HTTP requests without ever bringing a WiFi link up (<code>join()</code> or an
	AP) is flagged with a build-time warning — every request would fail at runtime.
</p>

<Callout label="If the board reboots right after joining">
	Some ESP32-S3 dev kits reboot the moment the radio transmits, with
	<code>E BOD: Brownout detector was triggered</code> in the serial log. The power amplifier draws a
	brief current spike on the first probe frame, and on a marginal USB supply that spike droops the
	3.3 V rail below the brownout threshold. The workaround while diagnosing is lower transmit power.
	The root cause is the power supply, not firmware — for production, fix the rail (shorter cable,
	beefier 5 V source, bulk capacitance near the module).
</Callout>

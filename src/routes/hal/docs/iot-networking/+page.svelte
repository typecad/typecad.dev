<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';
	import MethodDoc from '$lib/components/docs/method-doc.svelte';

	const basic = `import { Mqtt, UART0 } from '@typecad/hal';

const mqtt = new Mqtt('mqtt://broker.local:1883', { clientId: 'esp32-client' });

mqtt.onMessage((topic, payload) => {
  UART0.writeLine(topic + ': ' + payload);   // fires for every subscribed publish
});

mqtt.connect();                 // open the session
mqtt.subscribe('sensors/temperature');
mqtt.subscribe('cmd/#');        // wildcard: all sub-topics under cmd/

// later, publish a reading
mqtt.publish('sensors/temperature', '23.4');`;

	const waiting = `for (let i = 0; i < 10; i++) {
  mqtt.connect();
  for (let j = 0; j < 8; j++) {
    if (mqtt.linked()) { break; }
    Time.sleep(250);
  }
  if (mqtt.linked()) { break; }
}`;

	const publishCheck = `if (mqtt.linked()) {
  mqtt.publish('status', 'online');
}
mqtt.disconnect();   // disconnect and free the client`;

	const mqttMethods = [
		['new Mqtt(uri, { clientId })', 'Broker URI (mqtt:// or mqtts://) and client id'],
		['connect()', 'Open the session — returns immediately; poll linked()'],
		['onMessage(handler)', 'Set a (topic, payload) => void callback for received publishes'],
		['subscribe(topic)', 'Subscribe to a topic filter (supports # / + wildcards)'],
		['publish(topic, data)', 'Publish a message (QoS 1)'],
		['linked()', 'true while the broker session is up'],
		['close()', 'Disconnect and free the client']
	];
</script>

<svelte:head>
	<title>IoT Networking (MQTT) — typeCAD/hal docs</title>
	<meta
		name="description"
		content="MQTT publish/subscribe over the Zephyr networking stack — the session completes on a background poll thread that owns keepalives and acks."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">IoT Networking — MQTT</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	On top of <a href="/hal/docs/networking" class="font-bold text-primary underline">WiFi &amp; HTTP</a>,
	the HAL adds <strong>MQTT</strong> for publish/subscribe messaging. Construction carries the
	broker URI and client id, and the client keeps its session alive in the background — keepalives
	and message acks are handled for you, so messages keep arriving while your main code does other
	work.
</p>

<ApiCard
	name="Mqtt"
	purpose="An MQTT client. Construct with the broker URI and client id, connect, subscribe, publish.
		The background session handling keeps everything alive for you."
	imports={"import { Mqtt } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={basic} label="mqtt.ts" />
	{/snippet}

	<MethodDoc name="connect / linked" signature="connect(): void">
		<p>
			<code>connect()</code> returns immediately — the session finishes connecting in the
			background. Poll <code>linked()</code>, and on a flaky link retry in a loop until it flips:
		</p>
		<CodeBlock code={waiting} label="wait-for-session.ts" class="mt-3" />
	</MethodDoc>

	<MethodDoc name="publish / disconnect" signature="publish(topic, data): void">
		<CodeBlock code={publishCheck} label="publish.ts" class="mt-1" />
	</MethodDoc>

	<Callout>
		<ul class="ml-4 list-disc space-y-1">
			<li>
				<strong>URIs</strong>: <code>mqtt://host:port</code> (plain TCP, default port 1883) and
				<code>mqtts://host:port</code> (TLS, default 8883). Hostnames resolve through Zephyr's DNS
				resolver; numeric IPs work directly.
			</li>
			<li>
				<strong>QoS</strong>: subscriptions and publishes use QoS 1 (at-least-once), with
				acknowledgments handled for you.
			</li>
			<li>
				<strong>Payloads</strong>: topic and payload are only valid until the next message —
				copy what you need inside the handler.
			</li>
			<li>
				<strong>mqtts://</strong> is encrypted but the broker's identity is <strong>not
				verified</strong> (there is no CA-pinning fact on this class yet — the analogue of
				<code>Request</code>'s <code>caCert</code>). Treat it as encrypted-but-unverified until
				that lands.
			</li>
			<li>
				<strong>Targets</strong>: needs a networked target — a board with no WiFi radio is a build
				error naming an ESP32 target.
			</li>
		</ul>
	</Callout>

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">All methods</h3>
	<DocsTable headers={['Method', 'Description']} rows={mqttMethods} monoCols={[0]} />
</ApiCard>

<Callout label="Note">
	mDNS and OTA are not available on Zephyr. For those, use the Zephyr APIs directly via
	<code>rawCpp()</code>.
</Callout>

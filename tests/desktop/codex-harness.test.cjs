const { EventEmitter } = require('node:events');
const test = require('node:test');
const assert = require('node:assert/strict');
const { CodexHarness } = require('../../desktop/codex-harness.cjs');

class FakeProcess extends EventEmitter {
  constructor({ respondTurns = true } = {}) {
    super();
    this.respondTurns = respondTurns;
    this.killed = false;
    this.messages = [];
    this.stdout = new EventEmitter();
    this.stderr = new EventEmitter();
    this.stdin = { writable: true, write: (line) => this.receive(line) };
    this.stdout.setEncoding = () => {};
    this.stderr.setEncoding = () => {};
  }

  receive(line) {
    const message = JSON.parse(line);
    this.messages.push(message);
    if (message.method === 'initialize') this.reply(message.id, { serverInfo: { name: 'fake-codex' } });
    if (message.method === 'thread/start') this.reply(message.id, { thread: { id: 'thread-1' } });
    if (message.method === 'thread/resume') this.reply(message.id, { thread: { id: message.params.threadId } });
    if (message.method === 'turn/start' && this.respondTurns) this.reply(message.id, { turn: { id: 'turn-1' } });
    if (message.method === 'turn/interrupt') this.reply(message.id, {});
  }

  reply(id, result) { process.nextTick(() => this.stdout.emit('data', `${JSON.stringify({ id, result })}\n`)); }
  emitServerRequest(id = 77) { this.stdout.emit('data', `${JSON.stringify({ id, method: 'item/tool/requestApproval', params: { reason: 'Confirm irrigation log' } })}\n`); }
  stop(code = 1) { this.killed = true; this.emit('exit', code); }
  kill() { this.stop(0); }
}

function makeHarness(options = {}) {
  const processes = [];
  const harness = new CodexHarness({
    workspaceRoot: process.cwd(),
    agentRoot: `${process.cwd()}\\agent`,
    pluginRoot: `${process.cwd()}\\codex\\plugins\\kisansathi`,
    pluginLauncher: `${process.cwd()}\\codex\\plugins\\kisansathi\\run_server.py`,
    backendUrl: 'http://127.0.0.1:8000',
    farmerId: 'test-farmer',
    spawnProcess: () => { const child = new FakeProcess(options); processes.push(child); return child; },
  });
  return { harness, processes };
}

test('starts a thread and sends a text turn through the JSONL protocol', async () => {
  const { harness, processes } = makeHarness();
  const ready = [];
  harness.on('event', (event) => ready.push(event));
  assert.deepEqual(await harness.start({ fieldId: 'field-1', language: 'hi' }), { threadId: 'thread-1', reused: false });
  assert.deepEqual(await harness.sendText('Check soil moisture', { field_id: 'field-1' }), { turnId: 'turn-1' });
  assert.equal(ready.some((event) => event.kind === 'ready' && event.threadId === 'thread-1'), true);
  assert.equal(processes[0].messages.some((message) => message.method === 'thread/start'), true);
  assert.equal(processes[0].messages.at(-1).method, 'turn/start');
  harness.close();
});

test('resumes a saved thread and surfaces malformed app-server output', async () => {
  const { harness, processes } = makeHarness();
  const events = [];
  harness.on('event', (event) => events.push(event));
  assert.deepEqual(await harness.resume('saved-thread'), { threadId: 'saved-thread', resumed: true });
  processes[0].stdout.emit('data', 'not-json\n');
  assert.equal(events.some((event) => event.kind === 'diagnostic'), true);
  harness.close();
});

test('answers Codex approval requests without exposing the child process', async () => {
  const { harness, processes } = makeHarness();
  const requests = [];
  harness.on('event', (event) => requests.push(event));
  await harness.start();
  processes[0].emitServerRequest();
  const request = requests.find((event) => event.kind === 'approval');
  assert.equal(request.requestId, 77);
  harness.respond(request.requestId, { decision: 'accept' });
  assert.deepEqual(processes[0].messages.at(-1), { id: 77, result: { decision: 'accept' } });
  harness.close();
});

test('rejects an in-flight request and can recover after app-server exit', async () => {
  const first = makeHarness({ respondTurns: false });
  await first.harness.start();
  const pendingTurn = first.harness.sendText('wait for response');
  first.processes[0].stop(2);
  await assert.rejects(pendingTurn, /Codex app-server stopped/);
  assert.equal(first.harness.status().running, false);

  const second = makeHarness();
  assert.deepEqual(await second.harness.start(), { threadId: 'thread-1', reused: false });
  second.harness.close();
});

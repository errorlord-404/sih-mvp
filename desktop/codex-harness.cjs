const { EventEmitter } = require('node:events');
const { spawn } = require('node:child_process');
const { randomUUID } = require('node:crypto');
const fs = require('node:fs');

/**
 * Private JSONL client for `codex app-server --stdio`.
 * The renderer never receives this object or the child process.
 */
class CodexHarness extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = options;
    this.process = null;
    this.buffer = '';
    this.nextId = 1;
    this.pending = new Map();
    this.tempFiles = new Set();
    this.threadId = null;
    this.turnId = null;
    this.lastStartOptions = null;
    this.lastError = null;
    this.closing = false;
  }

  status() {
    return {
      running: Boolean(this.process && !this.process.killed),
      threadId: this.threadId,
      lastError: this.lastError,
    };
  }

  async start(startOptions = {}) {
    if (this.process && !this.process.killed && this.threadId) {
      return { threadId: this.threadId, reused: true };
    }
    this.lastStartOptions = { ...startOptions };
    this.lastError = null;
    this.closing = false;
    this.#spawnProcess();
    try {
      await this.request('initialize', {
        clientInfo: { name: 'kisansathi-desktop', title: 'KisanSathi Farmer Companion', version: '0.1.0' },
        capabilities: { experimentalApi: true },
      });
      this.notify('initialized', {});
      const response = await this.request('thread/start', {
        cwd: this.options.workspaceRoot,
        approvalPolicy: 'on-request',
        baseInstructions: farmerInstructions(startOptions.fieldId, startOptions.language),
      });
      this.threadId = response.thread.id;
      this.emit('event', { kind: 'ready', threadId: this.threadId });
      return { threadId: this.threadId, reused: false };
    } catch (error) {
      this.lastError = error.message;
      this.close();
      throw error;
    }
  }

  async resume(threadId) {
    if (!threadId) throw new Error('A Codex thread ID is required to resume a session.');
    if (!this.process || this.process.killed) this.#spawnProcess();
    if (!this.pending.size && !this.threadId) {
      await this.request('initialize', {
        clientInfo: { name: 'kisansathi-desktop', title: 'KisanSathi Farmer Companion', version: '0.1.0' },
        capabilities: { experimentalApi: true },
      });
      this.notify('initialized', {});
    }
    const response = await this.request('thread/resume', { threadId });
    this.threadId = response.thread.id;
    this.emit('event', { kind: 'ready', threadId: this.threadId, resumed: true });
    return { threadId: this.threadId, resumed: true };
  }

  async restart() {
    const options = this.lastStartOptions || {};
    this.close();
    return this.start(options);
  }

  async sendText(text, metadata = {}) {
    if (!this.threadId) throw new Error('Start a Codex session before sending a message.');
    return this.#startTurn([{ type: 'text', text, textElements: [] }], metadata);
  }

  async sendImage(filePath, prompt, metadata = {}) {
    if (!this.threadId) throw new Error('Start a Codex session before sending an image.');
    if (!filePath || !fs.existsSync(filePath)) throw new Error('The temporary crop image is no longer available.');
    this.tempFiles.add(filePath);
    return this.#startTurn([{ type: 'text', text: prompt, textElements: [] }, { type: 'localImage', path: filePath }], metadata);
  }

  async interrupt() {
    if (this.threadId && this.turnId) await this.request('turn/interrupt', { threadId: this.threadId, turnId: this.turnId });
  }

  respond(requestId, result) {
    if (requestId == null || !result || typeof result !== 'object') throw new Error('Invalid Codex server response.');
    this.write({ id: requestId, result });
  }

  trackTempFile(filePath) { this.tempFiles.add(filePath); }

  close() {
    this.closing = true;
    this.#rejectPending(new Error('Codex harness closed.'));
    this.process?.kill();
    this.process = null;
    this.threadId = null;
    this.turnId = null;
    this.#cleanupTempFiles();
  }

  async #startTurn(input, metadata) {
    const response = await this.request('turn/start', {
      threadId: this.threadId,
      clientUserMessageId: randomUUID(),
      input,
      approvalPolicy: 'on-request',
      responsesapiClientMetadata: Object.fromEntries(Object.entries(metadata).map(([key, value]) => [key, String(value)])),
    });
    this.turnId = response.turn.id;
    return { turnId: this.turnId };
  }

  #spawnProcess() {
    if (this.process && !this.process.killed) return;
    const command = process.env.CODEX_BINARY || 'codex';
    const python = process.env.KISANSATHI_PYTHON || 'python';
    const pluginArgs = [
      '-c', `mcp_servers.kisansathi.command=${tomlString(python)}`,
      '-c', `mcp_servers.kisansathi.args=[${tomlString(this.options.pluginLauncher)}]`,
      '-c', `mcp_servers.kisansathi.cwd=${tomlString(this.options.pluginRoot)}`,
      '-c', 'mcp_servers.kisansathi.required=true',
      '-c', 'mcp_servers.kisansathi.startup_timeout_sec=10',
      '-c', 'mcp_servers.kisansathi.tool_timeout_sec=30',
      '-c', 'mcp_servers.kisansathi.default_tools_approval_mode="writes"',
      '-c', `mcp_servers.kisansathi.env.KISANSATHI_AGENT_ROOT=${tomlString(this.options.agentRoot)}`,
      '-c', `mcp_servers.kisansathi.env.KISANSATHI_BACKEND_URL=${tomlString(this.options.backendUrl)}`,
      '-c', `mcp_servers.kisansathi.env.KISANSATHI_FARMER_ID=${tomlString(this.options.farmerId)}`,
      'app-server', '--stdio',
    ];
    const spawnOptions = {
      cwd: this.options.workspaceRoot,
      env: {
        ...process.env,
        KISANSATHI_AGENT_ROOT: this.options.agentRoot,
        KISANSATHI_BACKEND_URL: this.options.backendUrl,
        KISANSATHI_FARMER_ID: this.options.farmerId,
        LOG_FORMAT: 'json',
      },
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    };
    const spawnProcess = this.options.spawnProcess || defaultSpawn;
    this.process = spawnProcess(command, pluginArgs, spawnOptions);
    this.process.stdout?.setEncoding?.('utf8');
    this.process.stdout?.on('data', (chunk) => this.#read(chunk));
    this.process.stderr?.setEncoding?.('utf8');
    this.process.stderr?.on('data', (line) => this.emit('event', { kind: 'diagnostic', text: line.trim() }));
    this.process.on('error', (error) => this.#fail(error));
    this.process.on('exit', (code) => {
      const error = new Error(`Codex app-server stopped${code == null ? '' : ` (exit ${code})`}.`);
      this.#rejectPending(error);
      this.process = null;
      this.threadId = null;
      this.turnId = null;
      this.#cleanupTempFiles();
      if (!this.closing) {
        this.lastError = error.message;
        this.emit('event', { kind: 'unavailable', message: error.message, recoverable: true });
      }
    });
  }

  request(method, params) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      try { this.write({ method, id, params }); } catch (error) { this.pending.delete(id); reject(error); }
    });
  }

  notify(method, params) { this.write({ method, params }); }

  write(message) {
    if (!this.process?.stdin?.writable) throw new Error('Codex app-server is not running.');
    this.process.stdin.write(`${JSON.stringify(message)}\n`);
  }

  #read(chunk) {
    this.buffer += chunk;
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop();
    lines.filter(Boolean).forEach((line) => {
      try { this.#dispatch(JSON.parse(line)); }
      catch { this.emit('event', { kind: 'diagnostic', text: 'Codex app-server emitted invalid JSON.' }); }
    });
  }

  #dispatch(message) {
    if (message.id != null && !message.method) {
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message || 'Codex request failed.'));
      else pending.resolve(message.result || {});
      return;
    }
    if (message.id != null && message.method) {
      const kind = message.method.includes('requestApproval') ? 'approval' : message.method === 'item/tool/requestUserInput' ? 'clarification' : 'serverRequest';
      this.emit('event', { kind, requestId: message.id, method: message.method, payload: message.params || {} });
      return;
    }
    const event = normaliseNotification(message.method, message.params || {});
    if (event.kind === 'turnCompleted') this.#cleanupTempFiles();
    this.emit('event', event);
  }

  #rejectPending(error) {
    for (const pending of this.pending.values()) pending.reject(error);
    this.pending.clear();
  }

  #fail(error) {
    this.lastError = error.message;
    this.#rejectPending(error);
    this.emit('event', { kind: 'unavailable', message: `Could not start Codex: ${error.message}`, recoverable: true });
  }

  #cleanupTempFiles() {
    for (const filePath of this.tempFiles) fs.rm(filePath, { force: true, recursive: true }, () => {});
    this.tempFiles.clear();
  }
}

function defaultSpawn(command, args, options) {
  if (process.platform === 'win32') {
    return spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', `& ${powerShellQuote(command)} ${args.map(powerShellQuote).join(' ')}`], options);
  }
  return spawn(command, args, options);
}

function normaliseNotification(method, params) {
  if (method === 'item/agentMessage/delta') return { kind: 'agentMessageDelta', itemId: params.itemId, delta: params.delta || '' };
  if (method === 'item/completed') {
    const item = params.item || {};
    if (item.type === 'agentMessage') return { kind: 'agentMessageCompleted', itemId: item.id, text: itemText(item) };
    if (item.type === 'mcpToolCall') return { kind: 'tool', tool: item.tool, status: item.status, result: item.result, action: toolAction(item.result || item.action), error: item.error, readOnly: item.readOnlyHint };
  }
  if (method === 'item/started' && params.item?.type === 'mcpToolCall') return { kind: 'tool', tool: params.item.tool, status: 'inProgress', action: toolAction(params.item.result || params.item.action), readOnly: params.item.readOnlyHint };
  if (method === 'turn/completed') return { kind: 'turnCompleted', turn: params.turn };
  if (method === 'thread/status/changed') return { kind: 'threadStatus', status: params.status, threadId: params.threadId };
  return { kind: 'raw', method, payload: params };
}

function toolAction(value) {
  if (!value) return undefined;
  if (typeof value === 'object') return value.action || (value.method && value.refresh ? value : undefined);
  if (typeof value !== 'string') return undefined;
  try { return toolAction(JSON.parse(value)); } catch { return undefined; }
}

function itemText(item) {
  if (typeof item.text === 'string') return item.text;
  if (!Array.isArray(item.content)) return '';
  return item.content.map((part) => typeof part === 'string' ? part : part?.text || '').join('');
}

function farmerInstructions(fieldId, language) {
  return `You are KisanSathi, a careful farmer-facing assistant. The active field is ${fieldId || 'not selected'} and the farmer's display language is ${language}. Use KisanSathi MCP tools for farm facts and actions. For a prompt about local machinery, government schemes, or marketplace support, call query_support_catalog first with the known state, district, category, and keywords; use find_nearby_machinery or find_nearby_marketplace_listings for a selected-field radius search. Treat tool results as authoritative and preserve source, time, confidence, warnings, and unavailable states. Do not invent farm data. Directory results are discovery-only: never claim booking, stock, eligibility, price, or availability guarantees. For a persistent action, explain the exact change and ask the farmer for explicit confirmation before calling a write tool. Never control pumps, machinery, payments, or other physical systems. Reply in clear English; the desktop companion translates and speaks the farmer's final answer in the selected language.`;
}

function tomlString(value) { return `'${String(value).replace(/'/g, "''")}'`; }
function powerShellQuote(value) { return `'${String(value).replace(/'/g, "''")}'`; }

module.exports = { CodexHarness, normaliseNotification, itemText };

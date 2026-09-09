const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('node:fs/promises');
const fsSync = require('node:fs');
const path = require('node:path');
const { CodexHarness } = require('./codex-harness.cjs');

const workspaceRoot = path.resolve(__dirname, '..');
const backendUrl = process.env.KISANSATHI_BACKEND_URL || 'http://127.0.0.1:8000';
const farmerId = process.env.KISANSATHI_FARMER_ID || 'demo';
const pluginRoot = path.join(workspaceRoot, 'codex', 'plugins', 'kisansathi');
const harness = new CodexHarness({
  workspaceRoot,
  agentRoot: path.join(workspaceRoot, 'agent'),
  pluginRoot,
  pluginLauncher: path.join(pluginRoot, 'run_server.py'),
  backendUrl,
  farmerId,
});
let windowRef;

function sendEvent(event) { windowRef?.webContents.send('kisansathi:codex-event', event); }
harness.on('event', sendEvent);

function createWindow() {
  windowRef = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  windowRef.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => console.error(`[renderer] failed to load ${validatedURL}: ${errorCode} ${errorDescription}`));
  windowRef.webContents.on('console-message', (_event, level, message, line, sourceId) => console.error(`[renderer:${level}] ${sourceId}:${line} ${message}`));
  windowRef.webContents.on('render-process-gone', (_event, details) => console.error(`[renderer] process gone: ${details.reason}`));
  const devUrl = process.env.ELECTRON_RENDERER_URL;
  if (devUrl) windowRef.loadURL(devUrl);
  else windowRef.loadFile(path.join(workspaceRoot, 'dist', 'index.html'));
}

async function requestBackend(pathname, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 30000);
  try {
    return await fetch(`${backendUrl}${pathname}`, {
      ...options,
      signal: controller.signal,
      headers: { Accept: 'application/json', 'X-Farmer-ID': farmerId, ...(options.headers || {}) },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function postJson(pathname, body) {
  const response = await requestBackend(pathname, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error(`Farm service returned HTTP ${response.status}.`);
  return response.json();
}

async function getStatus() {
  const status = {
    codex: harness.status(),
    backend: { status: 'unreachable', message: 'The local farm service has not responded.' },
    plugin: { status: fsSync.existsSync(pluginRoot) && fsSync.existsSync(path.join(pluginRoot, 'run_server.py')) ? 'available' : 'missing' },
    sarvam: { status: 'unknown', message: 'Sarvam configuration is reported by the backend health endpoint.' },
    farmerBinding: 'configured',
  };
  try {
    const response = await requestBackend('/health', { method: 'GET', timeoutMs: 5000 });
    const payload = await response.json();
    status.backend = { status: response.ok ? payload.status || 'ok' : 'degraded', ...payload };
    status.sarvam = { status: payload.sarvam || 'unknown', message: payload.sarvam_message || '' };
  } catch (error) {
    status.backend.message = error.name === 'AbortError' ? 'The local farm service health check timed out.' : 'The local farm service is unreachable.';
  }
  return status;
}

function bytesFrom(value) {
  if (value instanceof ArrayBuffer) return Buffer.from(value);
  if (ArrayBuffer.isView(value)) return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
  return Buffer.from(value || []);
}

function imageExtension(mimeType) {
  return { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }[mimeType] || null;
}

ipcMain.handle('kisansathi:session-start', (_event, options) => harness.start(options || {}));
ipcMain.handle('kisansathi:session-resume', (_event, threadId) => harness.resume(threadId));
ipcMain.handle('kisansathi:send-text', (_event, text, metadata) => harness.sendText(text, metadata));
ipcMain.handle('kisansathi:send-image', async (_event, bytes, mimeType, prompt, metadata) => {
  const content = bytesFrom(bytes);
  const extension = imageExtension(mimeType);
  if (!extension) throw new Error('Only JPEG, PNG, and WebP crop images are supported.');
  if (!content.length || content.length > 10 * 1024 * 1024) throw new Error('Crop images must be between 1 byte and 10 MB.');
  const directory = await fs.mkdtemp(path.join(app.getPath('temp'), 'kisansathi-image-'));
  const filePath = path.join(directory, `crop${extension}`);
  await fs.writeFile(filePath, content);
  harness.trackTempFile(directory);
  harness.trackTempFile(filePath);
  return harness.sendImage(filePath, prompt, metadata);
});
ipcMain.handle('kisansathi:interrupt', () => harness.interrupt());
ipcMain.handle('kisansathi:respond', (_event, requestId, result) => harness.respond(requestId, result));
ipcMain.handle('kisansathi:status', () => getStatus());
ipcMain.handle('kisansathi:voice-translate', (_event, body) => postJson('/v1/translate', body));
ipcMain.handle('kisansathi:voice-synthesize', (_event, body) => postJson('/v1/voice/synthesize', body));
ipcMain.handle('kisansathi:voice-transcribe', async (_event, bytes, languageCode, mimeType = 'audio/webm') => {
  const content = bytesFrom(bytes);
  if (!content.length || content.length > 10 * 1024 * 1024) throw new Error('Audio must be between 1 byte and 10 MB.');
  const response = await requestBackend(`/v1/voice/transcribe?language_code=${encodeURIComponent(languageCode)}`, {
    method: 'POST',
    headers: { 'Content-Type': mimeType },
    body: content,
    timeoutMs: 30000,
  });
  if (!response.ok) throw new Error(`Farm service returned HTTP ${response.status}.`);
  return response.json();
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('before-quit', () => harness.close());

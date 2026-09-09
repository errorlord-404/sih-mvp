import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { farmStateApi } from '../api/farmStateApi.js';
import { useFarmData } from './FarmDataContext.jsx';
import { useLanguage } from '../hooks/useLanguage.jsx';

const AIConversationContext = createContext(null);
const languageCodes = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' };
const clock = (value = new Date()) => value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const harnessMissing = () => new Error('Open KisanSathi Desktop to use the Codex farm advisor. Manual farm screens remain available in this browser.');

export function AIConversationProvider({ children }) {
  const { language } = useLanguage();
  const { fields, refresh } = useFarmData();
  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [toolEvents, setToolEvents] = useState([]);
  const [voiceState, setVoiceState] = useState('idle');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [harnessStatus, setHarnessStatus] = useState(() => window.kisanHarness ? 'checking' : 'browser');
  const [harnessDetails, setHarnessDetails] = useState(null);
  const [autoPlay, setAutoPlayState] = useState(() => localStorage.getItem('kisansathi-auto-play') !== 'false');
  const recorder = useRef(null);
  const stream = useRef(null);
  const voiceCancelled = useRef(false);
  const voiceAudio = useRef(null);
  const messageCounter = useRef(0);
  const languageRef = useRef(language);
  const selectedFieldRef = useRef('');
  const autoPlayRef = useRef(autoPlay);
  const assistantDrafts = useRef(new Map());
  const activeFieldId = selectedFieldId || fields[0]?.id || '';
  const selectedField = fields.find((field) => field.id === activeFieldId) || fields[0] || null;

  useEffect(() => { languageRef.current = language; selectedFieldRef.current = activeFieldId; }, [activeFieldId, language]);
  useEffect(() => { autoPlayRef.current = autoPlay; }, [autoPlay]);

  const addMessage = useCallback((message) => setMessages((current) => [...current, message]), []);
  const updateMessage = useCallback((id, changes) => setMessages((current) => current.map((message) => message.id === id ? { ...message, ...changes } : message)), []);
  const setAutoPlay = useCallback((value) => { setAutoPlayState(value); localStorage.setItem('kisansathi-auto-play', String(value)); }, []);

  const speakMessage = useCallback(async (message) => {
    try {
      const bridge = window.kisanHarness;
      if (!bridge || !message?.text) throw harnessMissing();
      const response = await bridge.voice.synthesize({ text: message.text, language_code: languageCodes[languageRef.current] || languageCodes.en });
      if (response.status !== 'completed' || !response.audio_base64) throw new Error(response.message || 'Sarvam speech output is unavailable.');
      voiceAudio.current?.pause();
      voiceAudio.current = new Audio(`data:${response.audio_mime_type || 'audio/wav'};base64,${response.audio_base64}`);
      await voiceAudio.current.play();
    } catch (reason) {
      setError(reason);
      throw reason;
    }
  }, []);

  const localizeAndSpeak = useCallback(async (id, english) => {
    const bridge = window.kisanHarness;
    if (!bridge) throw harnessMissing();
    const target = languageCodes[languageRef.current] || languageCodes.en;
    let localized = english;
    if (target !== languageCodes.en) {
      const translated = await bridge.voice.translate({ input: english, source_language_code: languageCodes.en, target_language_code: target });
      if (translated.status === 'completed' && translated.translated_text) localized = translated.translated_text;
    }
    updateMessage(id, { text: localized, englishText: english, translating: false, localizedText: localized });
    if (autoPlayRef.current) {
      try { await speakMessage({ text: localized }); }
      catch (reason) { setError(reason); }
    }
  }, [speakMessage, updateMessage]);

  const refreshHarnessStatus = useCallback(async () => {
    if (!window.kisanHarness) { setHarnessStatus('browser'); return null; }
    try {
      const details = await window.kisanHarness.session.status();
      setHarnessDetails(details);
      setHarnessStatus(details.codex?.running ? 'ready' : 'starting');
      return details;
    } catch (reason) {
      setHarnessStatus('unavailable');
      setError(reason);
      return null;
    }
  }, []);

  useEffect(() => {
    const bridge = window.kisanHarness;
    if (!bridge) return undefined;
    let active = true;
    const statusTimer = window.setTimeout(() => { refreshHarnessStatus(); }, 0);
    const unsubscribe = bridge.onEvent((event) => {
      if (!active) return;
      if (event.kind === 'ready') {
        setSession({ id: event.threadId });
        localStorage.setItem('kisansathi-codex-thread-id', event.threadId);
        setHarnessStatus('ready');
        setHarnessDetails((current) => ({ ...(current || {}), codex: { ...(current?.codex || {}), running: true, threadId: event.threadId } }));
      }
      if (event.kind === 'unavailable') {
        setSession(null);
        setHarnessStatus('unavailable');
        setHarnessDetails((current) => ({ ...(current || {}), codex: { ...(current?.codex || {}), running: false, lastError: event.message } }));
        setProcessing(false);
        setError(new Error(event.message));
      }
      if (event.kind === 'agentMessageDelta') {
        const id = `codex-${event.itemId}`;
        const draft = `${assistantDrafts.current.get(id) || ''}${event.delta}`;
        assistantDrafts.current.set(id, draft);
        setMessages((current) => current.some((message) => message.id === id)
          ? current.map((message) => message.id === id ? { ...message, text: draft } : message)
          : [...current, { id, role: 'assistant', text: draft, time: clock(), streaming: true, provider: 'codex' }]);
      }
      if (event.kind === 'agentMessageCompleted') {
        const id = `codex-${event.itemId}`;
        const english = event.text || assistantDrafts.current.get(id) || '';
        assistantDrafts.current.delete(id);
        setMessages((current) => current.some((message) => message.id === id)
          ? current.map((message) => message.id === id ? { ...message, text: english, streaming: false, translating: true, provider: 'codex' } : message)
          : [...current, { id, role: 'assistant', text: english, englishText: english, time: clock(), translating: true, provider: 'codex' }]);
        localizeAndSpeak(id, english).catch((reason) => { updateMessage(id, { translating: false }); setError(reason); });
      }
      if (event.kind === 'tool') {
        setToolEvents((current) => [...current.slice(-7), { id: `${event.tool}-${Date.now()}`, ...event }]);
        if (event.status === 'completed' && event.readOnly === false) refresh();
      }
      if (event.kind === 'approval' || event.kind === 'clarification') setPendingAction(event);
      if (event.kind === 'turnCompleted') setProcessing(false);
    });
    return () => { active = false; window.clearTimeout(statusTimer); unsubscribe(); };
  }, [localizeAndSpeak, refresh, refreshHarnessStatus, updateMessage]);

  const ensureSession = useCallback(async () => {
    const bridge = window.kisanHarness;
    if (!bridge) throw harnessMissing();
    if (session) return session;
    setHarnessStatus('starting');
    const savedThreadId = localStorage.getItem('kisansathi-codex-thread-id');
    let next;
    if (savedThreadId) {
      try { next = await bridge.session.resume(savedThreadId); }
      catch { localStorage.removeItem('kisansathi-codex-thread-id'); }
    }
    if (!next) next = await bridge.session.start({ fieldId: selectedFieldRef.current, language: languageRef.current });
    const value = { id: next.threadId };
    localStorage.setItem('kisansathi-codex-thread-id', next.threadId);
    setSession(value);
    setHarnessStatus('ready');
    return value;
  }, [session]);

  const sendText = useCallback(async (text, options = {}) => {
    const content = text.trim();
    if (!content || processing) return;
    const id = `local-${messageCounter.current++}`;
    addMessage({ id, role: 'user', text: content, originalText: content, time: clock(), via: options.via });
    setProcessing(true);
    setError(null);
    try {
      await ensureSession();
      const source = languageCodes[languageRef.current] || languageCodes.en;
      let english = content;
      if (source !== languageCodes.en) {
        const translated = await window.kisanHarness.voice.translate({ input: content, source_language_code: source, target_language_code: languageCodes.en });
        if (translated.status !== 'completed' || !translated.translated_text) throw new Error(translated.message || 'Sarvam could not translate this message.');
        english = translated.translated_text;
      }
      updateMessage(id, { englishText: english });
      await window.kisanHarness.chat.sendText(english, { field_id: selectedFieldRef.current || 'none', farmer_language: source, input_via: options.via || 'typed' });
    } catch (reason) { setProcessing(false); setError(reason); }
  }, [addMessage, ensureSession, processing, updateMessage]);

  const finishVoice = useCallback(async (blob) => {
    setVoiceState('processing');
    setError(null);
    try {
      if (!window.kisanHarness) throw harnessMissing();
      const result = await window.kisanHarness.voice.transcribe(await blob.arrayBuffer(), languageCodes[languageRef.current], blob.type || 'audio/webm');
      if (result.status !== 'completed' || !result.transcript) throw new Error(result.message || 'Sarvam could not detect speech.');
      await sendText(result.transcript, { via: 'voice' });
      setVoiceState('responding');
    } catch (reason) { setError(reason); setVoiceState('idle'); }
    finally { window.setTimeout(() => setVoiceState('idle'), 700); }
  }, [sendText]);

  const startVoice = useCallback(async () => {
    if (voiceState !== 'idle') return;
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { setError(new Error('Audio recording is not supported by this browser.')); return; }
    try {
      voiceCancelled.current = false;
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const nextRecorder = new MediaRecorder(stream.current);
      const chunks = [];
      nextRecorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      nextRecorder.onstop = () => {
        stream.current?.getTracks().forEach((track) => track.stop());
        stream.current = null;
        recorder.current = null;
        if (!voiceCancelled.current) finishVoice(new Blob(chunks, { type: nextRecorder.mimeType || 'audio/webm' }));
        else setVoiceState('idle');
      };
      recorder.current = nextRecorder;
      nextRecorder.start();
      setVoiceState('listening');
    } catch (reason) { setError(new Error(`Microphone permission was not granted: ${reason.message}`)); }
  }, [finishVoice, voiceState]);

  const cancelVoice = useCallback(() => { voiceCancelled.current = true; recorder.current?.stop(); stream.current?.getTracks().forEach((track) => track.stop()); recorder.current = null; stream.current = null; setVoiceState('idle'); }, []);
  const resolveConfirmation = useCallback(async (decision) => {
    if (!pendingAction || !window.kisanHarness) return;
    const result = pendingAction.kind === 'clarification' ? { answers: decision.answers || {} } : { decision: decision.value || 'decline' };
    await (pendingAction.kind === 'clarification' ? window.kisanHarness.clarification.respond(pendingAction.requestId, result) : window.kisanHarness.approval.respond(pendingAction.requestId, result));
    setPendingAction(null);
  }, [pendingAction]);

  const submitImage = useCallback(async (file) => {
    if (!file) return;
    const image = URL.createObjectURL(file);
    addMessage({ id: `image-${Date.now()}`, role: 'user', text: 'I uploaded a crop photo for Codex to inspect.', time: clock(), image });
    setProcessing(true);
    setError(null);
    try {
      if (window.kisanHarness) {
        await ensureSession();
        await window.kisanHarness.chat.sendImage(await file.arrayBuffer(), file.type, `Inspect this crop image for the selected field ${selectedFieldRef.current || 'unknown'}. Use available farm context and explain uncertainty. Do not claim a diagnosis unless supported.`, { field_id: selectedFieldRef.current || 'none', input_via: 'image' });
      } else {
        const result = await farmStateApi.createDiagnosis(file, activeFieldId);
        const detail = result.status === 'completed' ? `${result.label || 'Diagnosis completed'}${result.treatment ? ` — ${result.treatment}` : ''}` : result.error || result.message || 'The diagnosis provider returned no conclusive result.';
        addMessage({ id: `diagnosis-${result.id}`, role: 'assistant', text: detail, time: clock(), provider: result.provider, via: 'diagnosis' });
        setProcessing(false);
      }
    } catch (reason) {
      const unsupportedImage = /image|vision|localImage|unsupported/i.test(reason.message || '');
      if (window.kisanHarness && unsupportedImage) {
        try {
          const result = await farmStateApi.createDiagnosis(file, activeFieldId);
          const detail = result.status === 'completed' ? `${result.label || 'Diagnosis completed'}${result.treatment ? ` — ${result.treatment}` : ''}` : result.error || result.message || 'The diagnosis provider returned no conclusive result.';
          addMessage({ id: `diagnosis-${result.id || Date.now()}`, role: 'assistant', text: detail, time: clock(), provider: result.provider, via: 'diagnosis', warning: 'Codex image inspection was unavailable, so the farm diagnosis service was used.' });
          setProcessing(false);
          return;
        } catch (fallbackReason) { setError(fallbackReason); }
      }
      setProcessing(false); setError(reason);
    }
  }, [activeFieldId, addMessage, ensureSession]);

  useEffect(() => () => { voiceCancelled.current = true; voiceAudio.current?.pause(); recorder.current?.stop(); stream.current?.getTracks().forEach((track) => track.stop()); }, []);

  const value = {
    messages, toolEvents, voiceState, processing, error, session, harnessStatus, harnessDetails, autoPlay,
    selectedField, fields, localizedFields: fields, selectedFieldId: activeFieldId, setSelectedFieldId,
    sendText, startVoice, cancelVoice, submitImage, pendingAction, resolveConfirmation, speakMessage,
    setAutoPlay, refreshHarnessStatus, language,
  };
  return <AIConversationContext.Provider value={value}>{children}</AIConversationContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAIConversation() { const context = useContext(AIConversationContext); if (!context) throw new Error('useAIConversation must be used inside AIConversationProvider'); return context; }

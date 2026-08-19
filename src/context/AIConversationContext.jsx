import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { farmStateApi } from '../api/farmStateApi.js';
import { useFarmData } from './FarmDataContext.jsx';
import { useLanguage } from '../hooks/useLanguage.jsx';

const AIConversationContext = createContext(null);

function clock(value = new Date()) {
  return value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function messageFromApi(message) {
  return { id: message.id, role: message.role, text: message.content, content: message.content, time: clock(message.created_at ? new Date(message.created_at) : undefined), citations: message.citations || [], provider: message.provider };
}

export function AIConversationProvider({ children }) {
  const { language } = useLanguage();
  const { fields } = useFarmData();
  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [voiceState, setVoiceState] = useState('idle');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const recorder = useRef(null);
  const stream = useRef(null);
  const voiceCancelled = useRef(false);
  const messageCounter = useRef(0);

  const activeFieldId = selectedFieldId || fields[0]?.id || '';
  const selectedField = fields.find((field) => field.id === activeFieldId) || fields[0] || null;

  useEffect(() => {
    let active = true;
    queueMicrotask(() => { if (active) { setSession(null); setMessages([]); setError(null); } });
    if (!activeFieldId) return () => { active = false; };
    farmStateApi.createAdvisorSession({ field_id: activeFieldId, language }).then((nextSession) => {
      if (active) { setSession(nextSession); setMessages([]); }
    }).catch((reason) => { if (active) setError(reason); });
    return () => { active = false; };
  }, [activeFieldId, language]);

  const addMessage = useCallback((message) => {
    setMessages((current) => [...current, message]);
  }, []);

  const sendText = useCallback(async (text) => {
    const content = text.trim();
    if (!content || !session || processing) return;
    const index = messageCounter.current;
    messageCounter.current += 1;
    addMessage({ id: `local-${index}`, role: 'user', text: content, content, time: clock() });
    setProcessing(true); setError(null);
    try {
      const response = await farmStateApi.sendAdvisorMessage(session.id, { content, idempotency_key: `${session.id}-${index}` });
      addMessage(messageFromApi(response));
    } catch (reason) { setError(reason); }
    finally { setProcessing(false); }
  }, [addMessage, processing, session]);

  const finishVoice = useCallback(async (blob) => {
    setVoiceState('processing'); setError(null);
    try {
      const response = await farmStateApi.sendVoiceTurn(blob);
      if (response.transcript) addMessage({ id: `voice-${Date.now()}`, role: 'user', text: response.transcript, content: response.transcript, time: clock(), via: 'voice' });
      addMessage({ id: `voice-response-${Date.now()}`, role: 'assistant', text: response.response_text || response.message, content: response.response_text || response.message, time: clock(), provider: response.provider, via: 'voice' });
      setVoiceState(response.status === 'completed' ? 'responding' : 'idle');
    } catch (reason) { setError(reason); setVoiceState('idle'); }
    finally { window.setTimeout(() => setVoiceState('idle'), 700); }
  }, [addMessage]);

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
      recorder.current = nextRecorder; nextRecorder.start(); setVoiceState('listening');
    } catch (reason) { setError(new Error(`Microphone permission was not granted: ${reason.message}`)); }
  }, [finishVoice, voiceState]);

  const cancelVoice = useCallback(() => {
    voiceCancelled.current = true;
    recorder.current?.stop();
    stream.current?.getTracks().forEach((track) => track.stop());
    recorder.current = null;
    stream.current = null;
    setVoiceState('idle');
  }, []);

  useEffect(() => () => {
    voiceCancelled.current = true;
    recorder.current?.stop();
    stream.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const submitImage = useCallback(async (file) => {
    if (!file) return;
    const image = URL.createObjectURL(file);
    addMessage({ id: `image-${Date.now()}`, role: 'user', text: language === 'hi' ? 'मैंने फसल की फोटो अपलोड की है।' : language === 'mr' ? 'मी पिकाचा फोटो अपलोड केला आहे.' : 'I uploaded a crop photo.', time: clock(), image });
    setProcessing(true); setError(null);
    try {
      const result = await farmStateApi.createDiagnosis(file, activeFieldId);
      const detail = result.status === 'completed' ? `${result.label || 'Diagnosis completed'}${result.treatment ? ` — ${result.treatment}` : ''}` : result.error || 'The diagnosis provider returned no conclusive result.';
      addMessage({ id: `diagnosis-${result.id}`, role: 'assistant', text: detail, content: detail, time: clock(), provider: result.provider, via: 'diagnosis' });
    } catch (reason) { setError(reason); }
    finally { setProcessing(false); }
  }, [activeFieldId, addMessage, language]);

  const value = { messages, voiceState, processing, error, session, selectedField, fields, localizedFields: fields, selectedFieldId: activeFieldId, setSelectedFieldId, sendText, startVoice, cancelVoice, submitImage, pendingAction: null, resolveConfirmation: () => {}, language };
  return <AIConversationContext.Provider value={value}>{children}</AIConversationContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAIConversation() {
  const context = useContext(AIConversationContext);
  if (!context) throw new Error('useAIConversation must be used inside AIConversationProvider');
  return context;
}

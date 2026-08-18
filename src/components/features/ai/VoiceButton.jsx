import { LoaderCircle, Mic, Volume2 } from 'lucide-react';
import { useAIConversation } from '../../../context/AIConversationContext.jsx';

export default function VoiceButton({ large = false }) {
  const { voiceState, startVoice, cancelVoice } = useAIConversation();
  const active = voiceState !== 'idle';
  const size = large ? 50 : 19;
  const icon = voiceState === 'processing' ? <LoaderCircle className="animate-spin" size={size} /> : voiceState === 'responding' ? <Volume2 size={size} /> : <Mic size={size} className={voiceState === 'listening' ? 'animate-bounce' : ''} />;
  return <button type="button" onClick={active ? cancelVoice : startVoice} aria-label={active ? 'Cancel voice input' : 'Start voice input'} className={`${large ? 'size-36 border-8' : 'size-10'} grid shrink-0 place-items-center rounded-full border-white text-white shadow-xl transition ${voiceState === 'listening' ? 'scale-110 bg-emerald-600 ring-8 ring-emerald-100' : voiceState === 'processing' ? 'bg-amber-500' : voiceState === 'responding' ? 'bg-info' : 'bg-primary-dark hover:scale-105 hover:bg-primary'}`}>{icon}</button>;
}

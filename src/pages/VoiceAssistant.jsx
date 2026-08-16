import { useState } from 'react';
import { Keyboard, Mic, Send, Volume2 } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.jsx';

// Translation dictionary for English and Hindi text copies
const copy = {
  en: {
    badge: 'Voice assistant',
    title: 'Ask KisanSathi',
    intro: 'Speak in Hindi or English. I will use your field context to help.',
    listening: 'Listening… speak now',
    ready: 'Tap the microphone to speak',
    tip: 'Try: “When should I irrigate my wheat?”',
    responseTitle: 'KisanSathi response',
    placeholder: 'Or type your question...',
    send: 'Send',
    sample: 'When should I irrigate my wheat crop?',
    result:
      'Your wheat field has low soil moisture (28%). Irrigate in the next 1–2 days, preferably early in the morning.',
    typed:
      'Based on your current soil moisture and weather forecast, check the field in the morning and irrigate within the next two days.',
  },
  hi: {
    badge: 'वॉइस सहायक',
    title: 'किसानसाथी से पूछें',
    intro:
      'हिंदी या अंग्रेज़ी में बोलें। मैं आपके खेत की जानकारी के आधार पर मदद करूंगा।',
    listening: 'सुन रहा हूं… अब बोलें',
    ready: 'बोलने के लिए माइक्रोफोन दबाएं',
    tip: 'उदाहरण: “मेरी गेहूं की फसल में सिंचाई कब करनी चाहिए?”',
    responseTitle: 'किसानसाथी का उत्तर',
    placeholder: 'या अपना सवाल लिखें...',
    send: 'भेजें',
    sample: 'मेरी गेहूं की फसल में सिंचाई कब करनी चाहिए?',
    result:
      'आपके गेहूं के खेत में मिट्टी की नमी कम (28%) है। अगले 1–2 दिनों में, सुबह जल्दी सिंचाई करें।',
    typed:
      'मौजूदा मिट्टी की नमी और मौसम पूर्वानुमान के अनुसार सुबह खेत की जांच करें और अगले दो दिनों में सिंचाई करें।',
  },
};

export default function VoiceAssistant() {
  const { language } = useLanguage();
  const c = copy[language];

  // Component state management for listening mode, query input, and responses
  const [listening, setListening] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');

  // Handler to toggle voice recording simulation
  const toggleListening = () => {
    setListening((value) => !value);
    setResponse('');
    if (!listening) {
      setTimeout(() => {
        setListening(false);
        setQuery(c.sample);
        setResponse(c.result);
      }, 1200);
    }
  };

  // Handler to submit typed questions
  const submit = (event) => {
    event.preventDefault();
    if (query.trim()) setResponse(c.typed);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100svh-68px)] max-w-2xl flex-col items-center justify-center px-5 py-8 text-center">
      
      {/* Badge Header */}
      <span className="rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary">
        {c.badge}
      </span>

      {/* Title & Subtitle */}
      <h1 className="mt-5 text-3xl font-bold">{c.title}</h1>
      <p className="mt-2 text-sm text-text-secondary">{c.intro}</p>

      {/* Voice Recording Microphone Button */}
      <button
        onClick={toggleListening}
        className={`mt-10 grid size-36 place-items-center rounded-full border-8 border-white text-white shadow-xl transition ${
          listening
            ? 'scale-110 bg-primary animate-pulse'
            : 'bg-primary-dark hover:scale-105'
        }`}
        aria-label={c.ready}
      >
        <Mic size={53} />
      </button>

      {/* Listening Status Text */}
      <p
        className={`mt-5 text-sm font-semibold ${
          listening ? 'text-primary' : 'text-text-secondary'
        }`}
      >
        {listening ? c.listening : c.ready}
      </p>

      {/* Voice Prompt Tip Banner */}
      <div className="mt-8 flex w-full items-start gap-3 rounded-xl bg-primary-50 p-4 text-left">
        <Volume2 size={19} className="mt-0.5 shrink-0 text-primary" />
        <p className="text-sm leading-6 text-primary-dark">{c.tip}</p>
      </div>

      {/* AI Response Card (Conditional Render) */}
      {response && (
        <div className="mt-5 w-full rounded-xl border border-border bg-white p-5 text-left shadow-card">
          <p className="text-xs font-bold text-primary">{c.responseTitle}</p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{response}</p>
        </div>
      )}

      {/* Manual Text Input Form Bar */}
      <form
        onSubmit={submit}
        className="mt-5 flex w-full gap-2 rounded-xl border border-border bg-white p-2 shadow-card"
      >
        <Keyboard size={19} className="m-2 text-text-muted" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={c.placeholder}
          aria-label={c.placeholder}
          className="min-w-0 flex-1 py-2 text-sm outline-none"
        />
        <button
          className="grid size-10 place-items-center rounded-lg bg-primary text-white"
          aria-label={c.send}
        >
          <Send size={17} />
        </button>
      </form>

    </div>
  );
}
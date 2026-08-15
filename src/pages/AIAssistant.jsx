import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  ChevronDown,
  Droplets,
  Leaf,
  MapPin,
  Mic,
  Send,
  Sparkles,
  Sprout,
  TriangleAlert,
  Wheat,
} from 'lucide-react';
import { farmer } from '../data/dashboard.js';
import { fields, localizeField } from '../data/fields.js';
import { initialMessages } from '../data/chat.js';
import { useLanguage } from '../hooks/useLanguage.jsx';

// Translation dictionary for English and Hindi text copies
const copy = {
  en: {
    title: 'KisanSathi Advisor',
    guidance: 'Practical guidance for {{field}} based on your latest field data.',
    updated: 'Data updated today',
    selected: 'Selected field',
    context: 'Farm context',
    signals: 'Field signals',
    moisture: 'Soil moisture',
    health: 'Crop health',
    pest: 'Pest risk',
    price: 'Wheat price',
    attention: 'Needs attention',
    attentionText: 'Plan irrigation within the next 2 days.',
    conversation: 'Conversation',
    conversationHint: 'Ask a question or choose a suggested question below.',
    suggested: 'Suggested questions',
    placeholder: 'Ask about your farm…',
    ask: 'Ask',
    voice: 'Ask by voice',
    choose: 'Choose a field',
    recommendation: 'Recommended for today',
    reply:
      'Based on {{field}}, keep the soil evenly moist and check the crop again after irrigation. I will continue to use your field, weather, and soil information for advice.',
    now: 'Now',
    low: 'Low',
    medium: 'Medium',
  },
  hi: {
    title: 'किसानसाथी सलाहकार',
    guidance: 'आपके {{field}} के लिए नवीनतम खेत जानकारी पर आधारित व्यावहारिक सलाह।',
    updated: 'डेटा आज अपडेट हुआ',
    selected: 'चुना गया खेत',
    context: 'खेत का संदर्भ',
    signals: 'खेत के संकेत',
    moisture: 'मिट्टी की नमी',
    health: 'फसल स्वास्थ्य',
    pest: 'कीट जोखिम',
    price: 'गेहूं का भाव',
    attention: 'ध्यान आवश्यक',
    attentionText: 'अगले 2 दिनों में सिंचाई की योजना बनाएं।',
    conversation: 'बातचीत',
    conversationHint: 'सवाल पूछें या नीचे सुझाए गए सवालों में से चुनें।',
    suggested: 'सुझाए गए सवाल',
    placeholder: 'अपने खेत के बारे में पूछें…',
    ask: 'पूछें',
    voice: 'आवाज़ से पूछें',
    choose: 'खेत चुनें',
    recommendation: 'आज के लिए सुझाव',
    reply:
      '{{field}} की स्थिति के अनुसार मिट्टी में पर्याप्त नमी रखें और सिंचाई के बाद फसल की दोबारा जांच करें। मैं आपके खेत, मौसम और मिट्टी की जानकारी से सलाह देता रहूंगा।',
    now: 'अभी',
    low: 'कम',
    medium: 'मध्यम',
  },
};

// Preset sample questions for both languages
const questions = {
  en: [
    'When should I irrigate my wheat crop?',
    'How can I prevent aphids?',
    'What fertiliser should I use now?',
  ],
  hi: [
    'गेहूं की फसल में सिंचाई कब करूं?',
    'एफिड से बचाव कैसे करूं?',
    'अभी कौन सा उर्वरक उपयोग करूं?',
  ],
};

// Utility function to replace template tags like {{field}} with dynamic values
const fill = (text, values) =>
  Object.entries(values).reduce(
    (result, [key, value]) => result.replace(`{{${key}}}`, value),
    text
  );

// Small metric chip component displaying farm contextual stats
function ContextChip({ icon: Icon, label, value, tone = 'green' }) {
  const colors = {
    green: 'bg-primary-50 text-primary',
    blue: 'bg-blue-50 text-info',
    amber: 'bg-amber-50 text-amber-700',
  };

  return (
    <div className={`rounded-lg px-3 py-2 ${colors[tone]}`}>
      <div className="flex items-center gap-1.5 text-[10px] font-medium">
        <Icon size={13} />
        {label}
      </div>
      <p className="mt-1 text-xs font-bold text-text-primary">{value}</p>
    </div>
  );
}

// Chat message bubble component for user queries and AI replies
function Reply({ message, ui }) {
  return (
    <div className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
      {message.role === 'assistant' && (
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-white">
          <Bot size={16} />
        </span>
      )}
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${
          message.role === 'user'
            ? 'rounded-tr-sm bg-primary text-white'
            : 'rounded-tl-sm bg-surface-muted text-text-primary'
        }`}
      >
        {message.recommendation && (
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-primary">
            <Sparkles size={14} />
            {ui.recommendation}
          </p>
        )}
        <p>{message.text}</p>
        <p
          className={`mt-1 text-[10px] ${
            message.role === 'user' ? 'text-green-100' : 'text-text-muted'
          }`}
        >
          {message.time}
        </p>
      </div>
    </div>
  );
}

// Dropdown picker allowing users to switch between different registered farm fields
function FieldPicker({ selectedField, fieldsForLanguage, onChange, ui }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative mt-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center gap-2 rounded-xl border bg-white p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-primary/30 ${
          open ? 'border-primary shadow-sm' : 'border-border hover:border-primary'
        }`}
      >
        <span className="rounded-lg bg-primary-50 p-2 text-primary">
          <Wheat size={16} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold">{selectedField.name}</span>
          <span className="mt-0.5 block text-[11px] text-text-secondary">
            {selectedField.area} · {selectedField.stage}
          </span>
        </span>
        <ChevronDown
          size={17}
          className={`shrink-0 text-text-muted transition-transform ${
            open ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={ui.selected}
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-border bg-white p-1.5 shadow-lg"
        >
          <p className="px-2.5 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            {ui.choose}
          </p>
          {fieldsForLanguage.map((item) => (
            <button
              type="button"
              role="option"
              aria-selected={item.id === selectedField.id}
              onClick={() => {
                onChange(item.id);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2.5 text-left transition ${
                item.id === selectedField.id
                  ? 'bg-primary-50 text-primary'
                  : 'hover:bg-surface-muted'
              }`}
              key={item.id}
            >
              <span
                className={`grid size-7 place-items-center rounded-md ${
                  item.id === selectedField.id
                    ? 'bg-primary text-white'
                    : 'bg-surface-muted text-text-secondary'
                }`}
              >
                <Wheat size={14} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold">{item.name}</span>
                <span className="mt-0.5 block text-[10px] text-text-secondary">
                  {item.crop} · {item.area}
                </span>
              </span>
              {item.id === selectedField.id && (
                <span className="text-xs font-bold">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Desktop sidebar context panel detailing farmer profile, field selector, signals, and alerts
function ContextPanel({ selectedField, fieldsForLanguage, onChange, ui }) {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-border bg-white p-5 xl:block">
      <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
        {ui.context}
      </p>

      {/* Farmer Profile Card */}
      <div className="mt-4 rounded-xl border border-border p-4">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-full bg-primary text-xs font-bold text-white">
            RC
          </span>
          <div>
            <p className="text-sm font-bold">{farmer.name}</p>
            <p className="flex items-center gap-1 text-[11px] text-text-secondary">
              <MapPin size={12} />
              {farmer.location}
            </p>
          </div>
        </div>
      </div>

      {/* Field Selector Dropdown */}
      <div className="mt-5">
        <p className="text-xs font-bold text-text-secondary">{ui.selected}</p>
        <FieldPicker
          selectedField={selectedField}
          fieldsForLanguage={fieldsForLanguage}
          onChange={onChange}
          ui={ui}
        />
      </div>

      {/* Field Signals Grid */}
      <p className="mt-5 text-xs font-bold text-text-secondary">{ui.signals}</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <ContextChip
          icon={Droplets}
          label={ui.moisture}
          value={`${selectedField.moisture}% · ${ui.low}`}
          tone="blue"
        />
        <ContextChip icon={Sprout} label={ui.health} value={selectedField.status} />
        <ContextChip icon={TriangleAlert} label={ui.pest} value={ui.medium} tone="amber" />
        <ContextChip icon={Leaf} label={ui.price} value="₹ 2,125" />
      </div>

      {/* Attention / Warning Banner */}
      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3">
        <p className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
          <TriangleAlert size={14} />
          {ui.attention}
        </p>
        <p className="mt-1 text-[11px] leading-5 text-amber-800">
          {ui.attentionText}
        </p>
      </div>
    </aside>
  );
}

// Main AI Assistant page component
export default function AIAssistant() {
  const { language } = useLanguage();
  const ui = copy[language];
  const fieldsForLanguage = fields.map((item) => localizeField(item, language));

  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [selectedId, setSelectedId] = useState(fields[0].id);

  const selectedField =
    fieldsForLanguage.find((item) => item.id === selectedId) ||
    fieldsForLanguage[0];

  // Handler to submit new questions and append responses to chat history
  const sendMessage = (question = input) => {
    const content = question.trim();
    if (!content) return;

    setMessages((current) => [
      ...current,
      { id: Date.now(), role: 'user', text: content, time: ui.now },
      {
        id: Date.now() + 1,
        role: 'assistant',
        text: fill(ui.reply, { field: selectedField.name }),
        time: ui.now,
      },
    ]);
    setInput('');
  };

  // Localized initial welcome messages for English and Hindi support
  const localizedInitial = messages.map((message) =>
    message.id === 1
      ? {
          ...message,
          text:
            language === 'hi'
              ? 'नमस्ते रमेश जी! मैं आज आपके गेहूं के खेत के लिए सही निर्णय लेने में मदद कर सकता हूं।'
              : message.text,
        }
      : message.id === 2
        ? {
            ...message,
            text:
              language === 'hi'
                ? 'आपकी मिट्टी की नमी 28% है, जो कम है। मौसम पूर्वानुमान के अनुसार अगले 1–2 दिनों में, सुबह जल्दी सिंचाई करें।'
                : message.text,
          }
        : message
  );

  return (
    <div className="mx-auto flex min-h-[calc(100svh-68px)] max-w-[1440px] bg-background">
      {/* Left Context Panel (Hidden on smaller screens) */}
      <ContextPanel
        selectedField={selectedField}
        fieldsForLanguage={fieldsForLanguage}
        onChange={setSelectedId}
        ui={ui}
      />

      {/* Main Chat Interface Section */}
      <section className="flex min-w-0 flex-1 flex-col px-4 py-5 sm:px-6 lg:px-8">
        
        {/* Header Title & Status Badge */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-primary text-white">
                <Leaf size={19} />
              </span>
              <h1 className="text-xl font-bold">{ui.title}</h1>
            </div>
            <p className="mt-2 text-sm text-text-secondary">
              {fill(ui.guidance, { field: selectedField.name })}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            {ui.updated}
          </span>
        </header>

        {/* Mobile Field Picker Selector */}
        <div className="mt-5 xl:hidden">
          <p className="text-xs font-bold text-text-secondary">{ui.selected}</p>
          <FieldPicker
            selectedField={selectedField}
            fieldsForLanguage={fieldsForLanguage}
            onChange={setSelectedId}
            ui={ui}
          />
        </div>

        {/* Mobile Field Signals Chips Grid */}
        <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:hidden">
          <ContextChip
            icon={Droplets}
            label={ui.moisture}
            value={`${selectedField.moisture}% · ${ui.low}`}
            tone="blue"
          />
          <ContextChip icon={Sprout} label={ui.health} value={selectedField.status} />
          <ContextChip icon={TriangleAlert} label={ui.pest} value={ui.medium} tone="amber" />
        </div>

        {/* Conversation Message History Box */}
        <div className="mt-6 flex min-h-[470px] min-w-0 flex-1 flex-col rounded-card border border-border bg-white shadow-card lg:min-h-[calc(100svh-270px)]">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-semibold">{ui.conversation}</h2>
            <p className="mt-1 text-xs text-text-secondary">
              {ui.conversationHint}
            </p>
          </div>

          {/* Chat Messages List */}
          <div className="flex-1 space-y-4 p-5">
            {localizedInitial.map((message) => (
              <Reply key={message.id} message={message} ui={ui} />
            ))}
          </div>

          {/* Suggested Quick Questions Buttons */}
          <div className="border-t border-border px-5 py-4">
            <p className="mb-3 text-xs font-semibold text-text-secondary">
              {ui.suggested}
            </p>
            <div className="flex flex-wrap gap-2">
              {questions[language].map((question) => (
                <button
                  key={question}
                  onClick={() => sendMessage(question)}
                  className="rounded-lg border border-primary/20 bg-primary-50 px-3 py-2 text-left text-xs font-medium text-primary hover:bg-green-100"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Message Input & Action Bar Form */}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage();
          }}
          className="mt-4 flex gap-2 rounded-xl border border-border bg-white p-2 shadow-card"
        >
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="min-w-0 flex-1 rounded-lg px-3 py-2 text-sm outline-none placeholder:text-text-muted"
            placeholder={ui.placeholder}
            aria-label={ui.placeholder}
          />
          <Link
            to="/voice"
            className="grid size-10 shrink-0 place-items-center rounded-lg border border-primary/20 bg-primary-50 text-primary hover:bg-primary hover:text-white"
            aria-label={ui.voice}
          >
            <Mic size={18} />
          </Link>
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-dark"
            aria-label={ui.ask}
          >
            <span className="hidden sm:inline">{ui.ask}</span>
            <Send size={17} />
          </button>
        </form>

      </section>
    </div>
  );
}
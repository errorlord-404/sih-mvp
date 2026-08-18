import { useRef, useState } from 'react'
import { Sparkles, Droplets, Leaf, TriangleAlert, Send, MapPin, ImagePlus } from 'lucide-react'
import VoiceButton from '../components/features/ai/VoiceButton.jsx'
import ConversationView from '../components/features/ai/ConversationView.jsx'
import { ActionPopups } from '../components/features/ai/ActionPopups.jsx'
import { useAIConversation } from '../context/AIConversationContext.jsx'

const copy = {
  en: {
    title: 'KisanSathi AI Assistant',
    subtitle: 'Voice-first advice for your farm',
    idle: 'Tap microphone to speak',
    listening: 'Listening… speak naturally',
    processing: 'Understanding your question…',
    responding: 'Your answer is ready',
    placeholder: 'Ask anything about your farm...',
    example: 'Try asking: "When should I irrigate my wheat field?"',
  },
  hi: {
    title: 'किसानसाथी AI सहायक',
    subtitle: 'आपके खेत के लिए बोलकर सलाह प्राप्त करें',
    idle: 'बोलने के लिए माइक्रोफोन दबाएं',
    listening: 'सुन रहा हूं… अपनी भाषा में बोलें',
    processing: 'आपकी बात समझ रहा हूं…',
    responding: 'उत्तर तैयार है',
    placeholder: 'अपने खेत के बारे में कुछ भी पूछें...',
    example: 'जैसे: "मेरी गेहूं की फसल में सिंचाई कब करें?"',
  },
  mr: {
    title: 'किसानसाथी AI सल्लागार',
    subtitle: 'तुमच्या शेतासाठी सहजपणे बोलून मार्गदर्शन मिळवा',
    idle: 'बोलण्यासाठी मायक्रोफोनवर टॅप करा',
    listening: 'ऐकत आहे… तुमच्या भाषेत बोला',
    processing: 'तुमचे बोलणे समजून घेत आहे…',
    responding: 'उत्तर तयार आहे',
    placeholder: 'तुमच्या शेताबद्दल काहीही विचारा...',
    example: 'उदा. "माझ्या गव्हाच्या पिकाला सिंचन कधी करावे?"',
  },
}

function CompactFieldContext({ language }) {
  const { selectedField, localizedFields, setSelectedFieldId } = useAIConversation()
  const hi = language === 'hi'
  const mr = language === 'mr'

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-2 sm:px-4 text-xs">
      <div className="flex items-center gap-2">
        <span className="grid size-7 sm:size-8 place-items-center rounded-xl bg-primary text-white font-bold text-xs shrink-0">
          <Leaf size={15} />
        </span>
        <div>
          <select
            aria-label="Select farm field"
            value={selectedField.id}
            onChange={(e) => setSelectedFieldId(e.target.value)}
            className="rounded-xl border border-emerald-300 bg-white px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-bold text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-xs transition"
          >
            {localizedFields.map((field) => (
              <option key={field.id} value={field.id}>
                {field.name} · {field.area}
              </option>
            ))}
          </select>
          <p className="flex items-center gap-1 text-[10px] text-text-secondary mt-0.5 px-1 font-medium">
            <MapPin size={11} className="text-primary" />
            {selectedField.status || (mr ? 'उत्तम आरोग्य' : hi ? 'स्वस्थ फसल' : 'Healthy')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 text-[10px] sm:text-[11px] font-semibold">
        <span className="flex items-center gap-1 rounded-lg bg-blue-50 px-1.5 py-0.5 sm:px-2 sm:py-1 text-blue-800 border border-blue-100">
          <Droplets size={12} /> {selectedField.moisture}%
        </span>
        <span className="flex items-center gap-1 rounded-lg bg-amber-50 px-1.5 py-0.5 sm:px-2 sm:py-1 text-amber-800 border border-amber-100">
          <TriangleAlert size={12} /> {mr ? 'मध्यम धोका' : hi ? 'मध्यम जोखिम' : 'Med Risk'}
        </span>
        <span className="hidden sm:inline-flex rounded-lg bg-emerald-100 px-2 py-1 text-emerald-900 font-bold">
          ₹ 2,125/qtl
        </span>
      </div>
    </div>
  )
}

function TextComposer({ onSend, placeholder, disabled = false }) {
  const { submitImage } = useAIConversation()
  const [input, setInput] = useState('')
  const fileInputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || disabled) return
    onSend(input)
    setInput('')
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      submitImage(file)
      e.target.value = ''
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center gap-1.5 sm:gap-2 rounded-2xl border border-border bg-white px-2.5 py-1.5 sm:px-3.5 sm:py-2 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition"
    >
      {/* Image Upload Button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        title="Upload crop photo"
        aria-label="Upload crop photo"
        className="grid size-7 sm:size-8 shrink-0 place-items-center rounded-xl text-text-secondary hover:bg-emerald-50 hover:text-primary transition"
      >
        <ImagePlus size={17} />
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 bg-transparent text-xs sm:text-sm text-text-primary outline-none placeholder:text-text-muted"
      />

      <button
        type="submit"
        disabled={!input.trim() || disabled}
        aria-label="Send message"
        className="grid size-7 sm:size-8 shrink-0 place-items-center rounded-xl bg-primary text-white hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <Send size={14} />
      </button>
    </form>
  )
}

export default function VoiceAssistant() {
  const { messages, voiceState, language, sendText } = useAIConversation()
  const text = copy[language] || copy.en
  const status = text[voiceState] || text.idle

  const hasConversation = messages.some((m) => m.role === 'user')

  return (
    <div className="mx-auto flex h-[calc(100dvh-64px-76px)] lg:h-[calc(100dvh-68px-32px)] max-w-[1440px] flex-col overflow-hidden px-2.5 py-2.5 sm:px-6 lg:px-8">
      {/* Compact Field Context with 3-Field Selector Dropdown */}
      <div className="shrink-0 mb-2 sm:mb-3">
        <CompactFieldContext language={language} />
      </div>

      {/* Main View Container */}
      {!hasConversation ? (
        /* FIRST VISIT HERO VIEW (Minimal voice-first layout) */
        <div className="flex flex-1 min-h-0 flex-col items-center justify-center rounded-2xl border border-primary/20 bg-[linear-gradient(135deg,#f2fbf4,#fff)] p-4 text-center shadow-card overflow-y-auto sm:p-6">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-primary shadow-xs border border-primary/10">
            Voice-First KisanSathi Assistant
          </span>

          <h1 className="mt-3 text-2xl font-bold text-text-primary sm:text-3xl">
            {text.title}
          </h1>
          <p className="mt-1 text-xs text-text-secondary sm:text-sm max-w-md">
            {text.subtitle}
          </p>

          {/* 1. Large Microphone Orb */}
          <div className="relative my-6 sm:my-8 grid place-items-center">
            {voiceState === 'listening' && (
              <>
                <span className="absolute size-44 animate-ping rounded-full bg-primary/10 sm:size-56" />
                <span className="absolute size-36 animate-pulse rounded-full bg-primary/10 sm:size-44" />
              </>
            )}
            <VoiceButton large />
          </div>

          {/* 2. Voice Status */}
          <p className={`text-xs sm:text-sm font-bold ${voiceState === 'listening' ? 'animate-pulse text-primary' : 'text-text-secondary'}`}>
            {status}
          </p>

          {/* 3. Text Composer directly beneath Microphone */}
          <div className="mt-5 w-full max-w-lg">
            <TextComposer onSend={sendText} placeholder={text.placeholder} />
          </div>

          {/* 4. Subtle Example Question Text below composer */}
          <p className="mt-3 text-xs italic text-text-muted">
            {text.example}
          </p>
        </div>
      ) : (
        /* ACTIVE CONVERSATION VIEW */
        <>
          {/* Mobile Active Conversation Layout */}
          <div className="flex flex-1 min-h-0 flex-col overflow-hidden lg:hidden">
            {/* 1. Scrollable Conversation (Largest area) */}
            <section data-testid="mobile-voice-history" className="flex-1 min-h-0 overflow-hidden">
              <ConversationView compact />
            </section>

            {/* 2. Compact Anchored Control Area at bottom */}
            <section data-testid="mobile-voice-controls" className="shrink-0 mt-2 rounded-2xl border border-primary/20 bg-white p-2.5 shadow-md space-y-2">
              {/* Mic & Status Row */}
              <div className="flex items-center gap-2">
                <VoiceButton />
                <span className={`text-xs font-bold ${voiceState === 'listening' ? 'animate-pulse text-primary' : 'text-text-secondary'}`}>
                  {status}
                </span>
              </div>

              {/* Text Composer directly beneath Mic */}
              <TextComposer onSend={sendText} placeholder={text.placeholder} />
            </section>
          </div>

          {/* Desktop Active Conversation Layout (Spacious 2-column view) */}
          <div className="hidden lg:grid lg:flex-1 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-4 lg:overflow-hidden">
            {/* Independently Scrollable Conversation History Panel */}
            <section data-testid="desktop-voice-history" className="min-h-0 h-full overflow-hidden">
              <ConversationView compact />
            </section>

            {/* Fixed / Anchored Voice & Control Panel */}
            <section
              data-testid="desktop-voice-controls"
              className="flex flex-col items-center justify-center rounded-2xl border border-primary/20 bg-[linear-gradient(135deg,#f4faf5,#fff)] p-6 text-center shadow-card overflow-y-auto space-y-4"
            >
              {/* Top Info Banner */}
              <div className="w-full">
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-primary shadow-xs border border-primary/10">
                  <Sparkles size={13} />
                  Voice-First Assistant
                </span>
              </div>

              {/* 1. Primary Interaction: Large Microphone Orb */}
              <div className="relative my-4 grid place-items-center">
                {voiceState === 'listening' && (
                  <>
                    <span className="absolute size-40 animate-ping rounded-full bg-primary/10" />
                    <span className="absolute size-32 animate-pulse rounded-full bg-primary/10" />
                  </>
                )}
                <VoiceButton large />
              </div>

              {/* 2. Voice Status Indicator */}
              <p className={`text-xs sm:text-sm font-bold ${voiceState === 'listening' ? 'animate-pulse text-primary' : 'text-text-secondary'}`}>
                {status}
              </p>

              {/* 3. Text Input directly beneath Microphone */}
              <div className="w-full">
                <TextComposer onSend={sendText} placeholder={text.placeholder} />
              </div>
            </section>
          </div>
        </>
      )}

      {/* Unified AI Action Popups */}
      <ActionPopups />
    </div>
  )
}

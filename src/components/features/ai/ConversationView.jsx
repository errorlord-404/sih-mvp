import { useEffect, useRef, useState } from 'react'
import { Send, Sparkles, User, Bot, Mic, ImagePlus } from 'lucide-react'
import VoiceButton from './VoiceButton.jsx'
import { useAIConversation } from '../../../context/AIConversationContext.jsx'
import { farmer } from '../../../data/dashboard.js'

const statusCopy = {
  en: {
    idle: 'Tap mic or type a message below',
    listening: 'Listening… speak naturally',
    processing: 'Understanding your question…',
    responding: 'Preparing answer…',
  },
  hi: {
    idle: 'माइक दबाएं या नीचे संदेश लिखें',
    listening: 'सुन रहा हूं… अपनी भाषा में बोलें',
    processing: 'आपकी बात समझ रहा हूं…',
    responding: 'उत्तर तैयार हो रहा है…',
  },
  mr: {
    idle: 'मायक्रोफोन टॅप करा किंवा संदेश लिहा',
    listening: 'ऐकत आहे… तुमच्या भाषेत बोला',
    processing: 'तुमचे बोलणे समजून घेत आहे…',
    responding: 'उत्तर तयार होत आहे…',
  },
}

export default function ConversationView({ compact = false }) {
  const { messages, sendText, voiceState, processing, language, submitImage } = useAIConversation()
  const [inputText, setInputText] = useState('')
  const chatEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const currentStatus = (statusCopy[language] || statusCopy.en)[voiceState] || (statusCopy[language] || statusCopy.en).idle
  const userName = language === 'hi' ? (farmer.nameHi || farmer.name) : language === 'mr' ? (farmer.nameMr || farmer.name) : farmer.name

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, processing, voiceState])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!inputText.trim()) return
    sendText(inputText)
    setInputText('')
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      {/* Scrollable Conversation Messages Section */}
      <div
        data-testid="conversation-messages-list"
        className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 max-w-full"
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user'
          const senderName = isUser ? userName : 'KisanSathi'

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 max-w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                  isUser ? 'bg-primary text-white' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {isUser ? <User size={15} /> : <Bot size={15} />}
              </div>

              <div
                className={`flex max-w-[85%] sm:max-w-[75%] flex-col ${
                  isUser ? 'items-end' : 'items-start'
                }`}
              >
                <span className="mb-1 text-[11px] font-bold text-text-secondary px-1">
                  {senderName}
                </span>

                <div
                  className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed break-words max-w-full ${
                    isUser
                      ? 'bg-primary text-white rounded-tr-none shadow-sm'
                      : 'bg-surface-muted border border-border text-text-primary rounded-tl-none'
                  }`}
                >
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Uploaded crop"
                      className="mb-2 max-h-48 w-full rounded-xl object-cover"
                    />
                  )}

                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>

                  {msg.via === 'voice' && (
                    <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold opacity-80">
                      <Mic size={11} /> Voice message
                    </span>
                  )}
                </div>

                <span className="mt-1 text-[10px] text-text-muted px-1">
                  {msg.time}
                </span>
              </div>
            </div>
          )
        })}

        {processing && (
          <div className="flex items-center gap-2 rounded-xl bg-surface-muted p-3 text-xs text-text-secondary animate-pulse w-fit border border-border">
            <Sparkles size={15} className="text-primary animate-spin" />
            <span>{language === 'hi' ? 'सोच रहा हूँ…' : language === 'mr' ? 'विचार करत आहे…' : 'Advisor is typing…'}</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Fixed/Sticky Voice Controls & Input Bar (Non-compact view) */}
      {!compact && (
        <div
          data-testid="voice-sticky-bottom-bar"
          className="shrink-0 border-t border-border bg-white p-3 sm:p-4 space-y-3"
        >
          {/* Voice Interaction & Text Input Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Primary Voice Interaction Microphone Button */}
            <div className="relative shrink-0 flex items-center justify-center">
              <VoiceButton />
            </div>

            {/* Input Form with Fallback Text Support */}
            <form onSubmit={handleSubmit} className="flex flex-1 items-center gap-2 rounded-2xl border border-border bg-surface-muted/40 px-3 py-1.5 focus-within:border-primary focus-within:bg-white transition">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Upload crop photo"
                aria-label="Upload crop photo"
                className="grid size-7 shrink-0 place-items-center rounded-lg text-text-secondary hover:bg-emerald-50 hover:text-primary transition"
              >
                <ImagePlus size={17} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    submitImage(file)
                    e.target.value = ''
                  }
                }}
                className="hidden"
              />
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={currentStatus}
                className="flex-1 bg-transparent py-1 text-xs sm:text-sm text-text-primary outline-none placeholder:text-text-muted"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                aria-label="Send message"
                className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-dark transition"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

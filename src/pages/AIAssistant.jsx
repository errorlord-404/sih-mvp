import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  Camera,
  CheckCircle2,
  ChevronDown,
  Droplets,
  HelpCircle,
  Image as ImageIcon,
  Leaf,
  MapPin,
  Mic,
  Send,
  Sparkles,
  Sprout,
  Tag,
  TriangleAlert,
  Wheat,
} from 'lucide-react';
import { farmer } from '../data/dashboard.js';
import { fields, localizeField } from '../data/fields.js';
import { useLanguage } from '../hooks/useLanguage.jsx';

export default function AIAssistant() {
  const { language } = useLanguage();
  const hi = language === 'hi';

  const localizedFields = fields.map((f) => localizeField(f, language));
  const [selectedId, setSelectedId] = useState(fields[0].id);
  const activeField = localizedFields.find((f) => f.id === selectedId) || localizedFields[0];

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'user',
      text: hi ? 'मेरे गेहूं में पत्ते पीले हो रहे हैं, क्या करें?' : 'Leaves in my wheat field are turning yellowish, what should I do?',
      time: '10:30 AM',
    },
    {
      id: 2,
      role: 'assistant',
      text: hi
        ? 'यह नाइट्रोजन (N) की कमी या सिंचाई के अभाव का लक्षण हो सकता है। कृपया अपने खेत की एक फोटो भेजें ताकि मैं सटीक जांच कर सकूं।'
        : 'This could indicate nitrogen deficiency or soil moisture stress. Please upload a clear photo of the leaf for exact diagnosis.',
      time: '10:31 AM',
    },
    {
      id: 3,
      role: 'user',
      text: hi ? 'यह देखिए खेत की फोटो।' : 'Here is the crop photo.',
      time: '10:32 AM',
      image: 'https://images.unsplash.com/photo-1599818816949-a2e6f47f2015?auto=format&fit=crop&w=500&q=80',
    },
    {
      id: 4,
      role: 'assistant',
      text: hi
        ? 'फोटो विश्लेषण और आपके खेत की नमी (28%) के आधार पर:\n1. मिट्टी में नमी कम है, पहले 25,000 L/एकड़ सिंचाई करें।\n2. सिंचाई के 24 घंटे बाद 40 kg यूरिया प्रति एकड़ की दर से डालें।\n3. दानों की चमक व वजन बढ़ाने के लिए पोटाश का प्रयोग करें।'
        : 'Based on image analysis and your current soil moisture (28%):\n1. Soil moisture is low, irrigate 25,000 L/acre first.\n2. Top-dress 40 kg/acre Urea (46% N) 24 hours after irrigation.\n3. Apply Potash to boost grain weight and shine.',
      time: '10:33 AM',
      recommendation: {
        product: 'Urea (46% N)',
        productHi: 'यूरिया उर्वरक (46% N)',
        dosage: '40 kg / Acre',
        dosageHi: '40 किग्रा / एकड़ (सिंचाई उपरांत)',
        confidence: '95% Match',
      },
    },
  ]);

  const mr = language === 'mr';

  const quickChips = [
    {
      label: mr ? '🌦️ हवामान अंदाज' : hi ? '🌦️ मौसम कैसा रहेगा?' : '🌦️ Weather Outlook',
      q: mr ? 'पुण्यात पुढील ३ दिवसांत हवामान कसे राहील?' : hi ? 'पुणे में अगले 3 दिन का मौसम कैसा रहेगा?' : 'What is the 3-day weather forecast for Pune?',
    },
    {
      label: mr ? '💧 पाणी नियोजन' : hi ? '💧 सिंचाई कब करें?' : '💧 Irrigation Schedule',
      q: mr ? 'गव्हाच्या पिकाला पुढील पाणी कधी द्यावे?' : hi ? 'गेहूं के खेत में अगली सिंचाई कब करनी है?' : 'When is the next irrigation scheduled for wheat?',
    },
    {
      label: mr ? '🔍 कीड व रोग' : hi ? '🔍 कीट की समस्या' : '🔍 Pest Inspection',
      q: mr ? 'गव्हावरील तांबेरा व मावा किडीपासून संरक्षण कसे करावे?' : hi ? 'पीला रतुआ और एफिड से गेहूं को कैसे बचाएं?' : 'How to prevent yellow rust and aphids in wheat?',
    },
    {
      label: mr ? '⚖️ ताजे बाजार भाव' : hi ? '⚖️ ताज़ा मंडी भाव' : '⚖️ Mandi Rate',
      q: mr ? 'पुणे बाजार समितीत आज गव्हाचा दर काय आहे?' : hi ? 'पुणे मंडी में गेहूं का आज का भाव क्या है?' : 'What is today wheat rate in Pune mandi?',
    },
  ];

  const sendMessage = (textToSend = input) => {
    const query = textToSend.trim();
    if (!query) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    let replyText = mr
      ? `तुमच्या ${activeField.name} (मातीतील ओलावा ${activeField.moisture}%) नुसार: पिकाला योग्य वेळी पाणी द्या आणि पानांचे नियमित निरीक्षण करा. तुमच्या शेतातील सेन्सर आणि हवामानानुसार मी निरंतर मार्गदर्शन करत राहीन.`
      : hi
      ? `आपके ${activeField.name} (नमी ${activeField.moisture}%) के संदर्भ में: खेत में पर्याप्त नमी बनाए रखें और शाम के समय निरीक्षण करें। मैं आपके सेंसर डेटा और मौसम को ध्यान में रखकर निरंतर सलाह देता रहूंगा।`
      : `Based on ${activeField.name} (soil moisture ${activeField.moisture}%): maintain regular moisture levels and inspect during evening hours. I will continue utilizing your IoT telemetry and weather forecasts.`;


    const assistantMsg = {
      id: Date.now() + 1,
      role: 'assistant',
      text: replyText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput('');
  };

  const uploadSamplePhoto = () => {
    const userMsg = {
      id: Date.now(),
      role: 'user',
      text: hi ? 'मैंने यह पत्ती की फोटो अपलोड की है।' : 'I uploaded this crop leaf photo.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      image: 'https://images.unsplash.com/photo-1628170490378-d5677b102b48?auto=format&fit=crop&w=500&q=80',
    };

    const assistantMsg = {
      id: Date.now() + 1,
      role: 'assistant',
      text: hi
        ? 'AI दृष्टि मॉडल ने एफिड कीट (माहू) के लक्षण पहचाने हैं (सटीकता: 92%)। सुबह के समय 1500 PPM नीम के तेल (5ml/लीटर) का छिड़काव करें।'
        : 'AI Vision model detected Aphids infestation (Confidence: 92%). Spray 1500 PPM Neem Oil (5ml/Litre) in early morning.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recommendation: {
        product: 'Neem Oil 1500 PPM',
        productHi: 'नीम का तेल (1500 PPM)',
        dosage: '5 ml / Litre',
        dosageHi: '5 मिली / लीटर पानी',
        confidence: '92% Confidence',
      },
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7 pb-16">
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Left Side: Farm & Sensor Context Panel */}
        <aside className="space-y-4">
          {/* Farmer Profile Card */}
          <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
            <div className="flex items-center gap-3">
              <img
                src={farmer.avatar}
                alt="Farmer"
                className="size-12 rounded-full border-2 border-primary object-cover shadow-xs"
              />
              <div>
                <h3 className="font-bold text-sm text-text-primary">
                  {hi ? farmer.nameHi : farmer.name}
                </h3>
                <p className="flex items-center gap-1 text-[11px] text-text-secondary">
                  <MapPin size={12} className="text-primary" />
                  {hi ? farmer.locationHi : farmer.location}
                </p>
              </div>
            </div>

            {/* Field Picker */}
            <div className="mt-4 border-t border-border pt-4">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                {hi ? 'खेत का संदर्भ चुनें:' : 'Selected Field Context:'}
              </label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-surface-muted p-2 text-xs font-bold outline-none"
              >
                {localizedFields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.crop} · {f.area})
                  </option>
                ))}
              </select>
            </div>

            {/* Real-time Field Telemetry Signals */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-blue-50 p-2.5">
                <p className="text-[10px] text-text-secondary">{hi ? 'मिट्टी नमी' : 'Moisture'}</p>
                <p className="font-bold text-info">{activeField.moisture}% (Low)</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-2.5">
                <p className="text-[10px] text-text-secondary">{hi ? 'स्वास्थ्य' : 'Health'}</p>
                <p className="font-bold text-emerald-800">{activeField.status}</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-2.5">
                <p className="text-[10px] text-text-secondary">{hi ? 'कीट जोखिम' : 'Pest Risk'}</p>
                <p className="font-bold text-amber-800">{hi ? 'मध्यम' : 'Medium'}</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-2.5">
                <p className="text-[10px] text-text-secondary">{hi ? 'गेहूं भाव' : 'Mandi Rate'}</p>
                <p className="font-bold text-emerald-800">₹ 2,125</p>
              </div>
            </div>
          </div>

          {/* Voice Assistant Shortcut */}
          <Link
            to="/voice"
            className="flex items-center justify-between rounded-2xl border border-primary/30 bg-[linear-gradient(135deg,#e8f5e9_0%,#f0fdf4_100%)] p-4 text-xs font-bold text-primary shadow-xs hover:bg-primary-50 transition"
          >
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-primary text-white">
                <Mic size={16} />
              </span>
              <span>{hi ? 'बोलकर पूछें (वॉइस मोड)' : 'Switch to Voice Mode'}</span>
            </div>
            <span>🎙️</span>
          </Link>
        </aside>

        {/* Right Side: Multimodal Chat Container */}
        <section className="flex flex-col h-[calc(100vh-140px)] min-h-[540px] rounded-2xl border border-border bg-white shadow-card overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-border bg-surface-muted px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-primary text-white shadow-xs">
                <Bot size={22} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-base text-text-primary">KisanSathi AI</h2>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary">
                  {hi ? 'हिंदी व अंग्रेज़ी में कृषि सलाहकार' : 'Bilingual Agro Intelligence Assistant'}
                </p>
              </div>
            </div>

            <button
              onClick={uploadSamplePhoto}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-white px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary-50 transition shadow-xs"
            >
              <Camera size={15} />
              <span>{hi ? 'फोटो डायग्नोसिस' : 'Test Photo'}</span>
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-white shadow-xs">
                    <Bot size={16} />
                  </span>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-tr-sm'
                      : 'bg-surface-muted text-text-primary rounded-tl-sm border border-border'
                  }`}
                >
                  {/* Attached photo preview */}
                  {msg.image && (
                    <div className="mb-3 overflow-hidden rounded-xl border border-white/20">
                      <img
                        src={msg.image}
                        alt="Crop upload"
                        className="max-h-48 w-full object-cover"
                      />
                    </div>
                  )}

                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Recommendation Card */}
                  {msg.recommendation && (
                    <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-emerald-950">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs flex items-center gap-1">
                          <Sparkles size={14} className="text-emerald-700" />
                          {hi ? 'सुझाया गया उत्पाद:' : 'Recommended Product:'}
                        </span>
                        <span className="rounded bg-emerald-700 px-2 py-0.5 text-[9px] font-bold text-white">
                          {msg.recommendation.confidence}
                        </span>
                      </div>
                      <p className="mt-1 font-bold text-sm text-emerald-900">
                        {hi ? msg.recommendation.productHi : msg.recommendation.product}
                      </p>
                      <p className="text-[11px] text-emerald-800">
                        {hi ? 'मात्रा:' : 'Dosage:'}{' '}
                        {hi ? msg.recommendation.dosageHi : msg.recommendation.dosage}
                      </p>
                    </div>
                  )}

                  <p
                    className={`mt-1.5 text-[10px] text-right ${
                      msg.role === 'user' ? 'text-green-100' : 'text-text-muted'
                    }`}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Smart Chips */}
          <div className="border-t border-border bg-white px-4 py-2.5 overflow-x-auto flex gap-2">
            {quickChips.map((chip) => (
              <button
                key={chip.label}
                onClick={() => sendMessage(chip.q)}
                className="shrink-0 rounded-lg border border-primary/20 bg-primary-50/70 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary-100 transition"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2 border-t border-border bg-white p-3"
          >
            <button
              type="button"
              onClick={uploadSamplePhoto}
              title={hi ? 'फसल की फोटो अपलोड करें' : 'Attach crop photo'}
              className="grid size-10 place-items-center rounded-xl border border-border text-text-secondary hover:bg-surface-muted"
            >
              <Camera size={18} />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={hi ? 'अपनी खेती या फसल के बारे में पूछें...' : 'Ask about your crops, soil, water or prices...'}
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-xs outline-none focus:border-primary"
            />

            <Link
              to="/voice"
              title={hi ? 'बोलकर पूछें' : 'Voice assistant'}
              className="grid size-10 place-items-center rounded-xl border border-primary/20 bg-primary-50 text-primary hover:bg-primary-100"
            >
              <Mic size={18} />
            </Link>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-dark shadow-sm transition"
            >
              <span>{hi ? 'पूछें' : 'Send'}</span>
              <Send size={14} />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
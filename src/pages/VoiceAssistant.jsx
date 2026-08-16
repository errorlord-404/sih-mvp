import { useState } from 'react';
import {
  ChevronLeft,
  Globe,
  Keyboard,
  Mic,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage.jsx';

export default function VoiceAssistant() {
  const { language, setLanguage } = useLanguage();
  const hi = language === 'hi';
  const mr = language === 'mr';

  const [listening, setListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [speaking, setSpeaking] = useState(false);

  const voicePrompts = [
    {
      icon: '🌦️',
      text: mr ? 'हवामान कसे असेल?' : hi ? 'मौसम कैसा रहेगा?' : 'How is the weather?',
      q: mr ? 'पुण्यात पुढील २ दिवसांत हवामान कसे राहील?' : hi ? 'पुणे में अगले 2 दिन का मौसम कैसा रहेगा?' : 'How will the weather be in Pune for next 2 days?',
      ans: mr
        ? 'आज पुण्यात तापमान २८°C आणि ऊन राहील. २०-२१ मे रोजी मुसळधार पावसाची शक्यता आहे, शेतातील पाण्याचा निचरा तयार ठेवा.'
        : hi
        ? 'आज पुणे में तापमान 28°C और धूप रहेगी। 20-21 मई को तेज बारिश की संभावना है, खेत की जल निकासी तैयार रखें।'
        : 'Today will be partly sunny at 28°C in Pune. Heavy rainfall is predicted on 20-21 May, prepare drainage.',
    },
    {
      icon: '💧',
      text: mr ? 'पाणी द्यावे का?' : hi ? 'पानी देना चाहिए?' : 'Should I irrigate?',
      q: mr ? 'गव्हाच्या पिकाला आज पाणी द्यावे का?' : hi ? 'क्या मुझे आज गेहूं में पानी देना चाहिए?' : 'Should I irrigate my wheat field today?',
      ans: mr
        ? 'तुमच्या गहू शेतातील मातीचा ओलावा २८% (कमी) आहे. पुढील २ दिवसांत सकाळी ६ ते १० दरम्यान २५,००० लिटर/एकर पाणी द्या.'
        : hi
        ? 'आपके गेहूं के खेत में मिट्टी की नमी 28% (कम) है। अगले 2 दिनों में सुबह 6-10 बजे के बीच 25,000 लीटर/एकड़ सिंचाई करें।'
        : 'Soil moisture is low at 28%. Plan 25,000 L/acre irrigation within the next 2 days, preferably early morning.',
    },
    {
      icon: '🌾',
      text: mr ? 'कीड व रोग समस्या' : hi ? 'कीट की समस्या' : 'Pest inspection',
      q: mr ? 'गव्हाच्या पानांवर पिवळे/तपकिरी डाग दिसत आहेत, काय करावे?' : hi ? 'पत्तियों पर भूरे धब्बे दिख रहे हैं, क्या करें?' : 'Brown spots visible on wheat leaves, what to do?',
      ans: mr
        ? 'हा पानांवरील तांबेरा किंवा करपा रोग असू शकतो. कॉपर ऑक्सीक्लोराईड ५० WP २.५ ग्रॅम प्रति लिटर पाण्यात मिसळून फवारणी करा.'
        : hi
        ? 'यह पत्ती धब्बा रोग (Leaf Spot) हो सकता है। कॉपर ऑक्सीक्लोराइड 50 WP का 2.5 ग्राम प्रति लीटर पानी में मिलाकर छिड़काव करें।'
        : 'This may be Leaf Spot disease. Spray Copper Oxychloride 50 WP @ 2.5g per litre of water.',
    },
    {
      icon: '⚖️',
      text: mr ? 'बाजार भाव' : hi ? 'मंडी का भाव' : 'Mandi rate',
      q: mr ? 'पुणे बाजार समितीत आज गव्हाचा भाव काय आहे?' : hi ? 'पुणे मंडी में गेहूं का आज का भाव क्या है?' : 'What is today wheat price in Pune mandi?',
      ans: mr
        ? 'पुणे बाजारात आज गव्हाचा सरासरी भाव ₹ २,१२५ प्रति क्विंटल आहे, जो मागील आठवड्यापेक्षा २.३५% जास्त आहे.'
        : hi
        ? 'पुणे मंडी में आज गेहूं का भाव ₹ 2,125 प्रति क्विंटल है, जो कल से 2.35% अधिक है।'
        : 'Pune mandi wheat rate today is ₹ 2,125 per quintal, up +2.35% from last week.',
    },
  ];

  const handleMicClick = () => {
    if (listening) {
      setListening(false);
      return;
    }

    setListening(true);
    setSpokenText(
      mr
        ? 'ऐकत आहे... कृपया बोला...'
        : hi
        ? 'सुन रहा हूँ... बोलिए...'
        : 'Listening... please speak now...'
    );
    setAiResponse('');

    setTimeout(() => {
      setListening(false);
      const sample = voicePrompts[1];
      setSpokenText(sample.q);
      setAiResponse(sample.ans);
      setSpeaking(true);
    }, 2000);
  };

  const handlePromptSelect = (prompt) => {
    setSpokenText(prompt.q);
    setAiResponse(prompt.ans);
    setSpeaking(true);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100svh-70px)] max-w-3xl flex-col items-center justify-between px-5 py-6 text-center">
      {/* Top Bar with Language Selector */}
      <div className="flex w-full items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-primary transition"
        >
          <ChevronLeft size={16} />
          <span>{mr ? 'मुख्य पानावर जा' : hi ? 'होम पर वापस' : 'Back to Home'}</span>
        </Link>

        <div className="flex items-center gap-2">
          <Globe size={15} className="text-primary" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-lg border border-border bg-white px-2 py-1 text-xs font-bold text-primary outline-none"
          >
            <option value="mr">मराठी (Marathi)</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      {/* Main Voice Assistant Center Section */}
      <div className="my-auto flex flex-col items-center">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
          {mr ? 'बोलून विचारा' : hi ? 'बोलकर पूछें' : 'Voice Assistant'}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {mr
            ? 'मी तुमच्या शेतीसाठी कशी मदत करू शकेन?'
            : hi
            ? 'मैं आपकी क्या मदद कर सकता हूँ?'
            : 'How can I assist your farming today?'}
        </p>


        {/* Pulsing Audio Waves & Big Microphone Orb */}
        <div className="relative mt-10 mb-8 flex items-center justify-center">
          {/* Animated sound ripples */}
          {listening && (
            <>
              <div className="absolute size-56 rounded-full bg-emerald-300/30 animate-ping" />
              <div className="absolute size-48 rounded-full bg-emerald-400/40 animate-pulse" />
            </>
          )}

          <button
            onClick={handleMicClick}
            className={`relative z-10 grid size-36 place-items-center rounded-full border-8 border-white text-white shadow-2xl transition duration-300 ${
              listening
                ? 'bg-emerald-600 scale-110 shadow-emerald-400/50 ring-8 ring-emerald-100'
                : 'bg-primary-dark hover:scale-105 hover:bg-primary shadow-emerald-900/30'
            }`}
          >
            <Mic size={54} className={listening ? 'animate-bounce' : ''} />
          </button>
        </div>

        {/* Status Indicator */}
        <p
          className={`text-sm font-bold ${
            listening ? 'text-primary animate-pulse' : 'text-text-secondary'
          }`}
        >
          {listening
            ? mr
              ? '🎙️ ऐकत आहे… आपल्या भाषेत बोला'
              : hi
              ? '🎙️ सुन रहा हूँ… अपनी भाषा में बोलें'
              : '🎙️ Listening… speak naturally'
            : mr
            ? 'बोलण्यासाठी मायक्रोफोनवर टॅप करा'
            : hi
            ? 'बोलने के लिए माइक्रोफ़ोन दबाएं'
            : 'Tap the microphone to speak'}
        </p>

        {/* Spoken Query & Response Box */}
        {(spokenText || aiResponse) && (
          <div className="mt-6 w-full max-w-lg rounded-2xl border border-emerald-200 bg-white p-5 text-left shadow-card">
            {spokenText && (
              <div className="border-b border-border pb-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  {mr ? 'तुमचा प्रश्न:' : hi ? 'आपका सवाल:' : 'You asked:'}
                </p>
                <p className="mt-0.5 text-xs font-bold text-text-primary">{spokenText}</p>
              </div>
            )}

            {aiResponse && (
              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                    <Sparkles size={12} />
                    {mr ? 'किसानसाथीचे उत्तर:' : hi ? 'किसानसाथी का उत्तर:' : 'KisanSathi Response:'}
                  </p>
                  <button
                    onClick={() => setSpeaking(!speaking)}
                    className="text-primary hover:text-primary-dark"
                  >
                    {speaking ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </button>
                </div>
                <p className="mt-1 text-xs leading-5 text-text-secondary">{aiResponse}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Voice Prompt Chips matching Mockup Screen 5 */}
      <div className="w-full">
        <p className="text-[11px] font-semibold text-text-muted mb-2">
          {mr ? 'किंवा खालीलपैकी एक प्रश्न निवडा:' : hi ? 'या इनमें से कोई सवाल चुनें:' : 'Or tap a popular question:'}
        </p>
        <div className="flex flex-wrap justify-center gap-2.5">
          {voicePrompts.map((p) => (
            <button
              key={p.text}
              onClick={() => handlePromptSelect(p)}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-white px-3.5 py-2 text-xs font-semibold text-text-primary shadow-xs hover:border-primary hover:bg-primary-50 transition"
            >
              <span>{p.icon}</span>
              <span>{p.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Droplets,
  HelpCircle,
  Leaf,
  Sparkles,
  Sprout,
  TrendingUp,
  TriangleAlert,
  Wheat,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { fields, localizeField } from '../data/fields.js';
import { useLanguage } from '../hooks/useLanguage.jsx';

// 7-Stage Lifecycle definition
const stages = [
  { id: 'sowing', name: 'Sowing', nameHi: 'बुवाई', date: '15 Nov', icon: '🌱', status: 'completed' },
  { id: 'germination', name: 'Germination', nameHi: 'अंकुरण', date: '22 Nov', icon: '🌿', status: 'completed' },
  { id: 'tillering', name: 'Tillering', nameHi: 'कल्ले निकलना', date: '10 Dec', icon: '🌾', status: 'completed' },
  { id: 'stem', name: 'Stem Elongation', nameHi: 'तना वृद्धि', date: '05 Jan', icon: '🌾', status: 'completed' },
  { id: 'heading', name: 'Heading', nameHi: 'बालियां आना', date: '20 Jan', icon: '🌾', status: 'completed' },
  { id: 'filling', name: 'Grain Filling', nameHi: 'दाना भराव', date: '10 Feb', icon: '🌾', status: 'active' },
  { id: 'harvest', name: 'Harvest', nameHi: 'कटाई', date: '20 Mar', icon: '🚜', status: 'upcoming' },
];

export default function FieldDetail() {
  const { fieldId } = useParams();
  const { language } = useLanguage();
  const hi = language === 'hi';

  const source = fields.find((f) => f.id === fieldId) || fields[0];
  const currentField = localizeField(source, language);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7 pb-16">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
        <Link to="/fields" className="hover:text-primary transition flex items-center gap-1">
          <ChevronLeft size={16} />
          <span>{hi ? 'मेरी फसलें' : 'My Fields'}</span>
        </Link>
        <span>/</span>
        <span className="text-text-primary font-bold">{currentField.name}</span>
      </div>

      {/* Field Main Header Banner */}
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border bg-white p-6 shadow-card">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary">
              {currentField.name} ({currentField.area})
            </h1>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
              {hi ? '✓ स्वस्थ (Healthy)' : '✓ Healthy'}
            </span>
          </div>
          <p className="mt-1 text-xs text-text-secondary">
            {hi ? 'बुआई की तारीख:' : 'Sowing Date:'} 15 Nov 2024 · {currentField.crop} · Pune, Maharashtra
          </p>

        </div>

        <button
          onClick={() => alert(hi ? 'खेत का सम्पूर्ण रिकॉर्ड लोड हुआ।' : 'Field report ready.')}
          className="rounded-xl border border-border bg-surface-muted px-4 py-2 text-xs font-bold text-text-primary hover:bg-gray-200 transition"
        >
          {hi ? 'खेत विवरण रिपोर्ट' : 'Field Details'}
        </button>
      </div>

      {/* 7-Stage Horizontal Lifecycle Stepper Card */}
      <div className="mt-6 rounded-2xl border border-border bg-white p-6 shadow-card">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="font-bold text-base text-text-primary flex items-center gap-2">
            <Wheat size={18} className="text-primary" />
            <span>{hi ? 'फसल जीवनचक्र टाइमलाइन' : 'Crop Lifecycle Timeline'}</span>
          </h2>
          <span className="text-xs text-text-secondary font-medium">
            {hi ? 'सत्र 2024-25' : 'Season 2024-25'}
          </span>
        </div>

        <div className="mt-6 overflow-x-auto pb-2">
          <div className="flex min-w-[700px] items-start justify-between relative">
            {/* Background connecting bar */}
            <div className="absolute left-8 right-8 top-5 h-1 bg-surface-muted -z-0" />
            <div className="absolute left-8 w-[72%] top-5 h-1 bg-primary -z-0" />

            {stages.map((st, i) => (
              <div key={st.id} className="relative z-10 flex flex-col items-center text-center px-1">
                <span
                  className={`grid size-10 place-items-center rounded-full border-4 text-base shadow-sm ${
                    st.status === 'completed'
                      ? 'border-white bg-primary text-white'
                      : st.status === 'active'
                        ? 'border-emerald-200 bg-emerald-600 text-white ring-4 ring-emerald-100 animate-pulse'
                        : 'border-white bg-gray-200 text-gray-400'
                  }`}
                >
                  {st.status === 'completed' ? '✓' : st.icon}
                </span>

                <p
                  className={`mt-2.5 text-xs font-bold ${
                    st.status === 'active'
                      ? 'text-primary'
                      : st.status === 'completed'
                        ? 'text-text-primary'
                        : 'text-text-muted'
                  }`}
                >
                  {hi ? st.nameHi : st.name}
                </p>
                <p className="text-[11px] text-text-secondary font-medium mt-0.5">{st.date}</p>
                {st.status === 'active' && (
                  <span className="mt-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
                    {hi ? 'सक्रिय' : 'Active'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Detail Two-Column Layout */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Left Column: Current Stage & Recommended Actions */}
        <div className="space-y-6">
          {/* Current Stage Card */}
          <div className="rounded-2xl border border-primary/20 bg-[linear-gradient(135deg,#f0fdf4_0%,#ffffff_100%)] p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-wide">
                  {hi ? 'वर्तमान अवस्था' : 'Current Stage'}
                </p>
                <h3 className="mt-1 text-2xl font-bold text-text-primary">
                  {hi ? 'दाना भराव (Grain Filling)' : 'Grain Filling'}
                </h3>
              </div>
              <span className="grid size-12 place-items-center rounded-2xl bg-white text-2xl shadow-sm border border-emerald-100">
                🌾
              </span>
            </div>

            <div className="mt-5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-text-secondary">{hi ? 'प्रगति' : 'Progress'}</span>
                <span className="text-primary font-bold">60% {hi ? 'पूर्ण' : 'Completed'}</span>
              </div>
              <div className="mt-2 h-3 w-full rounded-full bg-surface-muted overflow-hidden">
                <div className="h-full w-3/5 rounded-full bg-primary" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <Sparkles size={15} />
              <span>{hi ? 'आपकी फसल उत्तम गति से बढ़ रही है ✨' : 'Your crop is growing well ✨'}</span>
            </div>
          </div>

          {/* Recommended Actions Card */}
          <div className="rounded-2xl border border-border bg-white p-6 shadow-card">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                <CheckCircle2 size={18} className="text-primary" />
                <span>{hi ? 'सुझाए गए मुख्य कार्य' : 'Recommended Actions'}</span>
              </h3>
              <span className="rounded bg-primary-50 px-2 py-0.5 text-[11px] font-bold text-primary">
                3 {hi ? 'सुझाव' : 'Actions'}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {[
                {
                  id: 1,
                  icon: '💧',
                  title: 'Irrigate in next 2 days (25,000 L/acre)',
                  titleHi: 'अगले 2 दिनों में सिंचाई करें (25,000 लीटर/एकड़)',
                  urgent: true,
                },
                {
                  id: 2,
                  icon: '🌿',
                  title: 'Apply Potash (MOP) 20 kg/acre for bold grains',
                  titleHi: 'मजबूत दानों के लिए पोटाश (MOP) 20 किग्रा/एकड़ डालें',
                  urgent: false,
                },
                {
                  id: 3,
                  icon: '🔍',
                  title: 'Monitor leaves for brown / yellow rust symptoms',
                  titleHi: 'पत्तियों पर पीले रतुआ रोग के लक्षणों की निगरानी करें',
                  urgent: false,
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-xl border border-border bg-surface-muted p-3.5 transition hover:border-primary"
                >
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-text-primary">
                      {hi ? item.titleHi : item.title}
                    </p>
                  </div>
                  {item.urgent && (
                    <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">
                      {hi ? 'ज़रूरी' : 'Priority'}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-5">
              <Link
                to="/ai"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-bold text-white hover:bg-primary-dark shadow-sm"
              >
                <span>{hi ? 'AI से विस्तृत सलाह प्राप्त करें' : 'View All Recommendations'}</span>
                <ChevronRight size={15} />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Key Metric Cards */}
        <div className="space-y-4">
          {/* Next Irrigation Card */}
          <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-text-secondary">
                  {hi ? 'अगली सिंचाई' : 'Next Irrigation'}
                </p>
                <p className="mt-1 text-2xl font-bold text-info">{hi ? '2 दिन बाद' : 'In 2 Days'}</p>
                <p className="mt-0.5 text-xs text-text-secondary">21 May 2025 · Early Morning</p>
              </div>
              <span className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-info">
                <Droplets size={24} />
              </span>
            </div>
            <Link
              to="/irrigation"
              className="mt-4 block rounded-lg bg-blue-50 py-2 text-center text-xs font-bold text-blue-900 hover:bg-blue-100"
            >
              {hi ? 'सिंचाई अनुसूची देखें' : 'View Water Plan'}
            </Link>
          </div>

          {/* Expected Harvest Card */}
          <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-text-secondary">
                  {hi ? 'अनुमानित कटाई तारीख' : 'Expected Harvest'}
                </p>
                <p className="mt-1 text-xl font-bold text-text-primary">20 March 2025</p>
                <p className="mt-0.5 text-xs text-text-secondary">~32 days remaining</p>
              </div>
              <span className="grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-600">
                <CalendarDays size={24} />
              </span>
            </div>
          </div>

          {/* Estimated Yield Card */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-900">
                  {hi ? 'अनुमानित उपज' : 'Estimated Yield'}
                </p>
                <p className="mt-1 text-2xl font-bold text-emerald-800">
                  22 – 25 {hi ? 'क्विंटल / एकड़' : 'Quintal / Acre'}
                </p>
                <p className="mt-0.5 text-xs text-emerald-700 font-semibold">
                  {hi ? 'कुल: ~55-60 क्विंटल' : 'Total: ~55–60 Quintals'}
                </p>
              </div>
              <span className="grid size-12 place-items-center rounded-2xl bg-white text-emerald-800 shadow-xs">
                <TrendingUp size={24} />
              </span>
            </div>
          </div>

          {/* Alert Box */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-2.5">
              <TriangleAlert size={18} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-950">
                  {hi ? 'खेत अलर्ट: नमी कम है (28%)' : 'Field Alert: Low Moisture'}
                </p>
                <p className="mt-1 text-xs text-amber-800 leading-5">
                  {hi
                    ? 'सिंचाई के तुरंत बाद 40 किग्रा यूरिया डालें ताकि दानों का वजन व चमक बढ़े।'
                    : 'Apply 40 kg urea per acre right after irrigation to boost grain test weight.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
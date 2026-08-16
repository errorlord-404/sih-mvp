import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CloudSun,
  Droplets,
  Leaf,
  MapPin,
  MessageSquare,
  Sparkles,
  Smartphone,
  TrendingUp,
  TriangleAlert,
  Wheat,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  farmer,
  field,
  forecast,
  quickActions,
  todayTasks,
  farmAlerts,
} from '../data/dashboard.js';
import { useLanguage } from '../hooks/useLanguage.jsx';
import { farmImages } from '../data/images.js';

// Reusable card container component
function Card({ children, className = '' }) {
  return (
    <section
      className={`rounded-card border border-border bg-surface shadow-card transition hover:border-primary/40 ${className}`}
    >
      {children}
    </section>
  );
}

// Reusable navigation link button component
function Go({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-primary-dark shadow-sm"
    >
      {children}
      <ArrowRight size={13} />
    </Link>
  );
}

// Reusable metric statistic widget component
function Stat({ icon: Icon, label, value, note, trend, trendColor = 'text-primary' }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-text-secondary">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-text-primary">{value}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-text-secondary">
            {trend && <span className={`font-semibold ${trendColor}`}>{trend}</span>}
            <span>{note}</span>
          </p>
        </div>
        <span className="grid size-11 place-items-center rounded-xl bg-primary-50 text-primary shadow-xs">
          <Icon size={22} />
        </span>
      </div>
    </Card>
  );
}

// Custom 3D-styled AI Mascot illustration component matching the design mockup
function KisanBot() {
  return (
    <div className="relative grid size-28 place-items-center select-none">
      {/* Outer ambient glow */}
      <div className="absolute inset-0 rounded-full bg-emerald-100/60 blur-md animate-pulse" />
      {/* Outer Ring */}
      <div className="absolute inset-1 rounded-full bg-white/90 ring-4 ring-emerald-100 shadow-md" />
      
      {/* Robot Head Structure */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Antenna */}
        <div className="h-2 w-1 rounded-full bg-emerald-600" />
        <div className="-mt-1 size-2.5 rounded-full bg-emerald-400 shadow-sm" />
        
        {/* Head Shell */}
        <div className="relative mt-0.5 h-12 w-16 rounded-[18px] border-2 border-emerald-300 bg-gradient-to-b from-gray-900 to-gray-950 p-1 shadow-inner flex items-center justify-center">
          {/* Cute glowing cyan eyes */}
          <div className="flex w-full items-center justify-around px-1.5">
            <span className="size-2.5 rounded-full bg-[#00f5a0] shadow-[0_0_8px_#00f5a0] animate-pulse" />
            <span className="size-2.5 rounded-full bg-[#00f5a0] shadow-[0_0_8px_#00f5a0] animate-pulse" />
          </div>
        </div>

        {/* Robot Body / Base */}
        <div className="relative -mt-1.5 flex h-7 w-12 items-center justify-center rounded-b-[14px] rounded-t-sm border border-emerald-200 bg-emerald-600 text-white shadow-sm">
          <Leaf size={12} className="text-emerald-100" />
        </div>
      </div>

      {/* Floating Sparkle Badge */}
      <span className="absolute -right-1 top-1 rounded-full bg-amber-400 p-1 text-[11px] shadow-sm">
        ✨
      </span>
    </div>
  );
}

// Field status card component showing crop progress and details
function FieldCard() {
  const { t, language } = useLanguage();
  const mr = language === 'mr';
  const hi = language === 'hi';

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-40 w-full sm:h-auto sm:w-44 shrink-0 overflow-hidden">
          <img
            src={farmImages.wheat}
            alt="Wheat field"
            className="h-full w-full object-cover transition duration-300 hover:scale-105"
          />
          <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
            {mr ? '२.५ एकर' : hi ? '2.5 एकड़' : '2.5 Acres'}
          </span>
        </div>
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <Wheat size={16} className="text-primary" />
                <h2 className="font-bold text-base text-text-primary">
                  {mr ? 'गव्हाचे शेत' : hi ? field.nameHi : field.name}
                </h2>
              </div>
              <p className="mt-1 text-xs text-text-secondary">
                {mr ? 'पेरणी तारीख:' : hi ? 'बुआई की तारीख:' : 'Sowing Date:'} 15 Nov 2024
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
              {mr ? 'उत्तम' : hi ? 'स्वस्थ' : 'Healthy'}
            </span>
          </div>

          <p className="mt-3 text-xs font-semibold text-primary-dark">
            {mr
              ? 'अवस्था: दाणे भरणे (ओंब्या)'
              : hi
              ? 'अवस्था: बाल निकलना / दाना भराव'
              : 'Stage: Grain Filling'}
          </p>

          <div className="mt-2 h-2.5 w-full rounded-full bg-surface-muted overflow-hidden">
            <div className="h-full w-3/5 rounded-full bg-primary" />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-text-secondary">
            <span>{t('cropProgress')}</span>
            <span className="font-bold text-primary">60%</span>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
            <span className="text-[11px] text-text-secondary">
              {mr
                ? 'अनुमानित काढणी: २० मार्च २०२५'
                : hi
                ? 'अनुमानित कटाई: 20 मार्च 2025'
                : 'Harvest: 20 Mar 2025'}
            </span>
            <Go to="/fields/field-1">{mr ? 'तपशील पहा' : hi ? 'विवरण देखें' : 'View Details'}</Go>
          </div>
        </div>
      </div>
    </Card>
  );
}

// AI Advisor summary card component with cute mascot and quick chat link
function Advisor() {
  const { language } = useLanguage();
  const mr = language === 'mr';
  const hi = language === 'hi';

  return (
    <Card className="relative overflow-hidden bg-[linear-gradient(135deg,#f4faf3_0%,#ffffff_70%)] p-6 border-emerald-200">
      <div className="absolute -bottom-16 -right-16 size-56 rounded-full bg-emerald-100/50" />
      <div className="relative max-w-[70%] z-10">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-primary p-1.5 text-white shadow-xs">
            <Leaf size={16} />
          </span>
          <h2 className="font-bold text-base text-primary-dark">
            {mr ? 'AI सल्ला (किसान साथी)' : hi ? 'AI सलाह (किसान साथी)' : 'AI Advice (KisanSathi)'}
          </h2>
        </div>
        <p className="mt-1 text-xs font-medium text-emerald-800">
          {mr ? 'आजचा शेती सल्ला' : hi ? 'आज की सलाह आपके लिए' : "Today's smart advisory for your farm"}
        </p>

        <p className="mt-3 text-xs leading-5 text-text-secondary">
          {mr
            ? 'मातीतील ओलावा कमी (२८%) आहे आणि तापमान वाढत आहे. पुढील २ दिवसांत सिंचन करा आणि नत्रयुक्त खत (युरिया ४० किलो/एकर) द्या.'
            : hi
            ? 'मिट्टी में नमी कम है और तापमान बढ़ रहा है। अगले 2 दिनों में सिंचाई करें और नाइट्रोजन युक्त खाद (यूरिया 40 किग्रा/एकड़) का प्रयोग करें।'
            : 'Soil moisture is low (28%) and temperature is rising. Irrigate in the next 2 days and apply nitrogen-rich fertilizer.'}
        </p>


        <div className="mt-4 flex items-center gap-3">
          <Go to="/ai">{mr ? 'पूर्ण सल्ला पहा' : hi ? 'पूरी सलाह देखें' : 'Ask KisanSathi'}</Go>
          <Link
            to="/voice"
            className="inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-white px-3 py-2 text-xs font-semibold text-primary hover:bg-primary-50"
          >
            {mr ? 'बोलून विचारा 🎙️' : hi ? 'बोलकर पूछें 🎙️' : 'Voice Mode 🎙️'}
          </Link>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-10">
        <KisanBot />
      </div>
    </Card>
  );
}

// Mobile dashboard layout view component matching Image 1
function Mobile() {
  const { language, t } = useLanguage();
  const mr = language === 'mr';
  const hi = language === 'hi';

  return (
    <div className="mx-auto max-w-lg px-4 pt-3 pb-8 lg:hidden">
      {/* Top greeting with avatar & notification pill */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-primary">
            {mr ? 'नमस्कार शेतकरी मित्र! 👋' : hi ? 'नमस्ते किसान भाई! 👋' : 'Hello Farmer! 👋'}
          </h1>
          <p className="flex items-center gap-1 text-xs text-text-secondary mt-0.5">
            <span>📍</span> {farmer.location}
          </p>
        </div>
        <Link
          to="/settings"
          className="flex items-center gap-2 rounded-full border border-border bg-white p-1 pr-2.5 shadow-xs"
        >
          <img
            src={farmer.avatar}
            alt="Profile"
            className="size-7 rounded-full object-cover border border-primary"
          />
          <span className="text-xs font-bold text-text-primary">
            {mr ? farmer.nameHi : hi ? farmer.nameHi : farmer.name}
          </span>
        </Link>
      </div>

      {/* Weather card with Today's advice */}
      <Card className="mt-4 overflow-hidden border-primary/20 bg-[linear-gradient(135deg,#eef9ef_0%,#ffffff_100%)] p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold tracking-tight text-text-primary">28°C</p>
              <span className="mb-1 text-xs text-text-secondary">
                🌤️ {mr ? 'अंशतः ढगाळ' : hi ? 'आंशिक बादल' : 'Partly Sunny'}
              </span>
            </div>
            <p className="text-[11px] text-text-secondary">H: 32°C · L: 22°C · Rain: 20%</p>
          </div>
          <div className="rounded-xl bg-white/80 p-2.5 shadow-xs border border-primary/15 text-center">
            <p className="text-[10px] font-bold text-primary">
              {mr ? 'मातीतील ओलावा' : hi ? 'मिट्टी नमी' : 'Soil Moisture'}
            </p>
            <p className="text-lg font-bold text-info">28%</p>
            <p className="text-[9px] text-danger font-semibold">
              {mr ? 'कमी' : hi ? 'कम' : 'Low'}
            </p>
          </div>
        </div>

        <div className="mt-3 border-t border-primary/15 pt-3">
          <p className="text-[11px] font-bold text-primary-dark">
            {mr ? 'आजचा सल्ला:' : hi ? 'आज का सुझाव:' : "Today's Tip:"}
          </p>
          <p className="mt-0.5 text-xs text-text-secondary leading-snug">
            {mr
              ? 'मातीतील ओलावा कमी आहे, सकाळच्या सत्रात सिंचन करण्याचा सल्ला दिला जातो.'
              : hi
              ? 'मिट्टी में नमी कम है, सिंचाई करने की सलाह दी जाती है।'
              : 'Soil moisture is low. Early morning irrigation is recommended.'}
          </p>
          <Link
            to="/irrigation"
            className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary"
          >
            {mr ? 'संपूर्ण सिंचन सल्ला पहा →' : hi ? 'पूरी सलाह देखें →' : 'View Irrigation Advice →'}
          </Link>
        </div>
      </Card>

      {/* Quick actions grid (6 tiles) */}
      <h2 className="mt-5 text-sm font-bold text-text-primary">
        {mr ? 'जलद सेवा' : hi ? 'त्वरित सुविधाएं' : 'Quick Actions'}
      </h2>
      <div className="mt-2.5 grid grid-cols-3 gap-2.5">
        {quickActions.map((a) => (
          <Link
            key={a.label}
            to={a.to}
            className="flex flex-col items-center justify-center rounded-xl border border-border bg-white p-3 text-center shadow-card transition active:scale-95 hover:border-primary"
          >
            <div className="text-2xl">{a.icon}</div>
            <p className="mt-1 text-[11px] font-bold text-text-primary">
              {mr ? a.labelMr || a.labelHi : hi ? a.labelHi : a.label}
            </p>
            <p className="text-[9px] text-text-muted mt-0.5 line-clamp-1">
              {mr ? a.subMr || a.subHi : hi ? a.subHi : a.sub}
            </p>
          </Link>
        ))}
      </div>

      {/* AI Sathi Banner Card */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-emerald-300 bg-[linear-gradient(135deg,#e8f5e9_0%,#c8e6c9_100%)] p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src={farmer.avatar}
            alt="Farmer"
            className="size-14 rounded-full border-2 border-white object-cover shadow-sm shrink-0"
          />
          <div className="flex-1">
            <h3 className="font-bold text-sm text-emerald-950">
              {mr ? 'तुमचा AI शेती मित्र' : hi ? 'आपका AI साथी' : 'Your AI Farming Partner'}
            </h3>
            <p className="text-xs text-emerald-800 mt-0.5">
              {mr
                ? 'तुमच्या पिकांबद्दल कोणताही प्रश्न विचारा...'
                : hi
                ? 'पूछें कोई भी सवाल अपनी खेती के बारे में...'
                : 'Ask any question about your crops, soil or mandi...'}
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Link
            to="/ai"
            className="flex-1 rounded-xl bg-primary py-2 text-center text-xs font-bold text-white shadow-xs hover:bg-primary-dark"
          >
            {mr ? 'चॅट सुरू करा 💬' : hi ? 'चैट शुरू करें 💬' : 'Start Chat 💬'}
          </Link>
          <Link
            to="/voice"
            className="rounded-xl border border-emerald-600 bg-white px-3 py-2 text-xs font-bold text-primary"
          >
            🎙️
          </Link>
        </div>
      </div>

      {/* Today's Top 3 Tasks (from Screen 1) */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-text-primary">
            {mr ? 'आजची मुख्य ३ कामे' : hi ? 'आज के मुख्य 3 कार्य' : "Today's Top 3 Tasks"}
          </h2>
          <span className="text-[11px] text-primary font-semibold">
            {mr ? '३ शिल्लक' : hi ? '3 लंबित' : '3 Pending'}
          </span>
        </div>
        <div className="mt-2.5 space-y-2">
          {todayTasks.map((task, index) => (
            <div
              key={task.id}
              className="flex items-center justify-between rounded-xl border border-border bg-white p-3 shadow-card"
            >
              <div className="flex items-center gap-2.5">
                <span className="grid size-6 place-items-center rounded-full bg-amber-100 text-xs font-bold text-amber-900">
                  {index + 1}
                </span>
                <span className="text-base">{task.icon}</span>
                <div>
                  <p className="text-xs font-bold text-text-primary">
                    {mr ? task.titleMr || task.titleHi : hi ? task.titleHi : task.title}
                  </p>
                </div>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${task.badge}`}>
                {mr ? task.dueMr || task.dueHi : hi ? task.dueHi : task.due}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Field Card */}
      <div className="mt-5">
        <FieldCard />
      </div>

      {/* Alerts */}
      <div className="mt-5 space-y-2">
        {farmAlerts.map((alt) => (
          <Link
            key={alt.id}
            to={alt.to}
            className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 shadow-xs"
          >
            <TriangleAlert size={16} className="text-amber-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-bold text-amber-950">
                {mr ? alt.titleMr || alt.titleHi : hi ? alt.titleHi : alt.title}
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                {mr ? alt.descMr || alt.descHi : hi ? alt.descHi : alt.desc}
              </p>
            </div>
            <ChevronRight size={15} className="text-amber-700 shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}

// Desktop dashboard layout view component matching Image 1 & 2
function Desktop() {
  const { t, language } = useLanguage();
  const mr = language === 'mr';
  const hi = language === 'hi';
  const days = mr
    ? ['आज', 'उद्या', '२० मे', '२१ मे', '२२ मे']
    : hi
    ? ['आज', 'कल', '20 मई', '21 मई', '22 मई']
    : forecast.map((x) => x.day);

  return (
    <div className="hidden max-w-[1440px] px-8 pt-7 pb-12 lg:block">
      {/* Header Banner */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {mr
              ? 'नमस्कार शेतकरी मित्र! 🌾'
              : hi
              ? 'नमस्ते किसान भाई! 🌾'
              : 'Good Morning, Santosh! 🌾'}
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            {mr
              ? 'तुमच्या शेतीची संपूर्ण माहिती आणि स्मार्ट सल्ला एकाच ठिकाणी'
              : hi
              ? 'आपके खेत की पूरी जानकारी और स्मार्ट सुझाव एक ही जगह'
              : "Here is your real-time farm intelligence and daily advisory."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/voice"
            className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary-50 px-4 py-2 text-xs font-bold text-primary shadow-xs hover:bg-primary-100"
          >
            <span>🎙️</span>
            <span>{mr ? 'व्हॉइस सहाय्यक' : hi ? 'वॉइस असिस्टेंट' : 'Voice Assistant'}</span>
          </Link>
          <Link
            to="/ai"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-dark"
          >
            <Sparkles size={15} />
            <span>{mr ? 'AI सल्लागार' : hi ? 'AI सलाहकार' : 'AI Sathi Chat'}</span>
          </Link>
        </div>
      </div>

      {/* Top 4 Metrics Summary Grid */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <Stat
          icon={CloudSun}
          label={mr ? 'हवामान' : hi ? 'मौसम' : 'Live Weather'}
          value="28°C"
          note={mr ? 'अंशतः ढगाळ · पाऊस: २०%' : hi ? 'आंशिक बादल · बारिश: 20%' : 'Sunny · Humidity: 45%'}
        />
        <Stat
          icon={Droplets}
          label={mr ? 'मातीतील ओलावा' : hi ? 'मिट्टी की नमी' : 'Soil Moisture'}
          value="28%"
          note={mr ? 'कमी (पाणी देण्याचा सल्ला)' : hi ? 'कम (सिंचाई की सलाह)' : 'Low · Needs irrigation'}
          trend="⚠️"
          trendColor="text-warning"
        />
        <Stat
          icon={CalendarDays}
          label={mr ? 'पुढील पाणी' : hi ? 'अगली सिंचाई' : 'Next Irrigation'}
          value={mr ? '२ दिवसांनंतर' : hi ? '2 दिन बाद' : 'In 2 Days'}
          note="21 May 2025"
        />
        <Stat
          icon={TrendingUp}
          label={mr ? 'बाजार भाव (गहू)' : hi ? 'बाज़ार भाव (गेहूं)' : 'Market Price (Wheat)'}
          value="₹ 2,125"
          note={mr ? 'पुणे बाजार समिती' : hi ? 'पुणे मंडी' : 'Pune Mandi'}
          trend="▲ 2.35%"
          trendColor="text-emerald-700"
        />
      </div>

      {/* Field Card and AI Advisor Section */}
      <div className="mt-6 grid grid-cols-2 gap-6">
        <FieldCard />
        <Advisor />
      </div>

      {/* Bottom 3 Cards: Soil Health, Weather Forecast, and Mandi Comparison */}
      <div className="mt-6 grid grid-cols-3 gap-6">
        {/* Soil Health Summary */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-text-primary">
                {mr ? 'माती परीक्षण अहवाल' : hi ? 'मिट्टी की जांच' : 'Soil Health Report'}
              </h2>
              <p className="text-xs text-text-secondary">
                {mr ? 'तपासणी: १० मे २०२५' : hi ? 'जांच: 10 मई 2025' : 'Tested: 10 May 2025'}
              </p>
            </div>
            <Link to="/soil" className="text-xs font-bold text-primary hover:underline">
              {mr ? 'सर्व पहा →' : hi ? 'सुझाव देखें →' : 'View All →'}
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {[
              [mr ? 'सामू (pH)' : hi ? 'pH मान' : 'pH Level', '6.8', mr ? 'उत्तम' : hi ? 'सही' : 'Good', 'text-emerald-700'],
              [mr ? 'ओलावा' : hi ? 'नमी' : 'Moisture', '28%', mr ? 'कमी' : hi ? 'कम' : 'Low', 'text-danger'],
              [mr ? 'नत्र (N)' : hi ? 'नाइट्रोजन (N)' : 'Nitrogen (N)', '215', mr ? 'मध्यम' : hi ? 'मध्यम' : 'Medium', 'text-amber-700'],
              [mr ? 'पलाश (K)' : hi ? 'पोटाश (K)' : 'Potassium (K)', '312', mr ? 'उच्च' : hi ? 'उच्च' : 'High', 'text-emerald-700'],
            ].map((x) => (
              <div className="rounded-xl bg-surface-muted p-3" key={x[0]}>
                <p className="text-[10px] font-medium text-text-secondary">{x[0]}</p>
                <b className="mt-0.5 block text-lg font-bold text-text-primary">{x[1]}</b>
                <span className={`text-[11px] font-semibold ${x[3]}`}>{x[2]}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* 5-day Weather Forecast */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-text-primary">
                {mr ? 'हवामान अंदाज' : hi ? 'मौसम पूर्वानुमान' : 'Weather Forecast'}
              </h2>
              <p className="text-xs text-text-secondary">{farmer.location}</p>
            </div>
            <Link to="/weather" className="text-xs font-bold text-primary hover:underline">
              {mr ? 'सविस्तर →' : hi ? 'विस्तार से →' : 'Radar →'}
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-5 gap-1.5 text-center">
            {forecast.map((x, i) => (
              <div
                className={`rounded-xl p-2 ${
                  i === 0 ? 'bg-primary-50 ring-1 ring-primary/20' : 'bg-surface-muted'
                }`}
                key={x.day}
              >
                <p className="text-[10px] font-semibold text-text-secondary">{days[i]}</p>
                <p className="my-1.5 text-2xl">{x.icon}</p>
                <b className="block text-xs font-bold">{x.high}</b>
                <p className="text-[10px] text-text-muted">{x.low}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs text-amber-900 leading-snug">
              ⚠️{' '}
              {mr
                ? '२०-२१ मे रोजी मुसळधार पावसाची शक्यता आहे! शेतातील पाण्याच्या निचऱ्याची व्यवस्था करा.'
                : hi
                ? '20-21 मई को तेज बारिश की संभावना है! खेत की निकासी की व्यवस्था सुनिश्चित करें।'
                : 'Heavy rain expected on 20-21 May. Ensure drainage paths are clear.'}
            </p>
          </div>
        </Card>

        {/* Mandi Prices */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-text-primary">
                {mr ? 'बाजार भाव' : hi ? 'बाज़ार भाव' : 'Mandi Prices'}
              </h2>
              <p className="text-xs text-text-secondary">
                {mr ? 'गहू · पुणे बाजार समिती' : hi ? 'गेहूं · पुणे मंडी' : 'Wheat · Pune Mandi'}
              </p>
            </div>
            <Link to="/market" className="text-xs font-bold text-primary hover:underline">
              {mr ? 'इतर बाजार →' : hi ? 'और मंडी देखें →' : 'View Mandis →'}
            </Link>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary-dark">₹ 2,125</span>
            <span className="text-xs text-text-secondary">/ {mr ? 'क्विंटल' : hi ? 'क्विंटल' : 'Quintal'}</span>
            <span className="ml-auto rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
              ▲ 2.35%
            </span>
          </div>

          <div className="mt-4 space-y-2 border-t border-border pt-3 text-xs">
            {[
              [mr ? 'बारामती बाजार' : hi ? 'बारामती मंडी' : 'Baramati Mandi', '₹ 2,150', '+2.60%'],
              [mr ? 'शिरूर बाजार' : hi ? 'शिरूर मंडी' : 'Shirur Mandi', '₹ 2,080', '+1.85%'],
              [mr ? 'दौंड बाजार' : hi ? 'दौंड मंडी' : 'Daund Mandi', '₹ 2,050', '+1.20%'],
            ].map((x) => (
              <div className="flex justify-between items-center" key={x[0]}>
                <span className="text-text-secondary font-medium">{x[0]}</span>
                <div className="flex items-center gap-2">
                  <b className="font-bold">{x[1]}</b>
                  <span className="text-[10px] text-emerald-700 font-semibold">{x[2]}</span>
                </div>
              </div>
            ))}
          </div>

        </Card>
      </div>


      {/* App Download Banner (matching Image 1 Mockup) */}
      <div className="mt-7 overflow-hidden rounded-2xl border border-emerald-200 bg-[linear-gradient(135deg,#f0fdf4_0%,#dcfce7_100%)] p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid size-14 place-items-center rounded-2xl bg-white text-3xl shadow-sm">
              🚜
            </span>
            <div>
              <h3 className="text-lg font-bold text-emerald-950">
                {hi
                  ? 'खेती से जुड़ी हर जानकारी, आपके मोबाइल पर'
                  : 'All farm intelligence on your mobile'}
              </h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                {hi
                  ? 'सटीक, आसान और आपकी भाषा में'
                  : 'Accurate, simple and in your local language.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => alert(hi ? 'ऐप डाउनलोड लिंक आपके फोन पर भेजी गई!' : 'App download link sent to your phone!')}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-xs font-bold text-white shadow-md transition hover:bg-emerald-900"
          >
            <Smartphone size={16} />
            <span>{hi ? 'ऐप डाउनलोड करें' : 'Get Mobile App'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Dashboard entry component combining mobile and desktop views
export default function Dashboard() {
  return (
    <>
      <Mobile />
      <Desktop />
    </>
  );
}
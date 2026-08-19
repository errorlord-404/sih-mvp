import { useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  CloudRain,
  CloudSun,
  Droplets,
  HelpCircle,
  MapPin,
  Power,
  Sparkles,
  Sprout,
  Sunrise,
  TestTube2,
  ThermometerSun,
  TrendingUp,
  TriangleAlert,
  Umbrella,
  Wheat,
  Wind,
} from 'lucide-react';
import { forecast } from '../data/dashboard.js';
import { fields, localizeField } from '../data/fields.js';
import { useLanguage } from '../hooks/useLanguage.jsx';
import { HOSTED_MANDI_PRICES, HOSTED_MACHINERY_RENTALS } from '../services/hostedCatalogService.js';

// Reusable card container component
const Card = ({ children, className = '' }) => (
  <section
    className={`rounded-card border border-border bg-white p-5 shadow-card transition hover:border-primary/40 ${className}`}
  >
    {children}
  </section>
);

// Reusable standard page wrapper layout component
function Page({ title, subtitle, children }) {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7 pb-16">
      <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
      <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

// ==========================================
// 1. SOIL HEALTH DASHBOARD
// ==========================================
export function SoilHealth() {
  const { language } = useLanguage();
  const mr = language === 'mr';
  const hi = language === 'hi';
  const [selectedFieldId, setSelectedFieldId] = useState('field-1');

  const localizedFields = fields.map((f) => localizeField(f, language));
  const activeField = localizedFields.find((f) => f.id === selectedFieldId) || localizedFields[0];

  const nutrients = [
    {
      name: mr ? 'सामू मूल्य (pH)' : hi ? 'पीएच मान (pH)' : 'pH Level',
      value: '6.8',
      status: mr ? 'उत्कृष्ट (योग्य)' : hi ? 'सही (उपयुक्त)' : 'Optimal',
      range: '6.0 – 7.5',
      badge: 'bg-emerald-50 text-emerald-800',
    },
    {
      name: mr ? 'सेंद्रिय कर्ब (OC)' : hi ? 'जैविक कार्बन (OC)' : 'Organic Carbon',
      value: '0.56%',
      status: mr ? 'मध्यम' : hi ? 'मध्यम' : 'Medium',
      range: '0.50% – 0.75%',
      badge: 'bg-amber-50 text-amber-800',
    },
    {
      name: mr ? 'नत्र (Nitrogen - N)' : hi ? 'नाइट्रोजन (N)' : 'Nitrogen (N)',
      value: '215 kg/ha',
      status: mr ? 'मध्यम' : hi ? 'मध्यम' : 'Medium',
      range: '280 – 560 kg/ha',
      badge: 'bg-amber-50 text-amber-800',
    },
    {
      name: mr ? 'स्फुरद (Phosphorus - P)' : hi ? 'फॉस्फोरस (P)' : 'Phosphorus (P)',
      value: '18 kg/ha',
      status: mr ? 'कमी (खताची गरज)' : hi ? 'कम (उर्वरक डालें)' : 'Low (Deficient)',
      range: '23 – 56 kg/ha',
      badge: 'bg-red-50 text-red-800',
    },
    {
      name: mr ? 'पालाश (Potash - K)' : hi ? 'पोटाश (K)' : 'Potassium (K)',
      value: '312 kg/ha',
      status: mr ? 'उच्च (उत्कृष्ट)' : hi ? 'उच्च (उत्कृष्ट)' : 'High (Good)',
      range: '140 – 280 kg/ha',
      badge: 'bg-emerald-50 text-emerald-800',
    },
  ];

  return (
    <Page
      title={mr ? 'माती परीक्षण व पोषण घटक' : hi ? 'मिट्टी की जांच एवं पोषक तत्व' : 'Soil Health & Nutrients'}
      subtitle={
        mr
          ? 'प्रयोगशाळेचा तपासणी अहवाल आणि संतुलित खत व्यवस्थापन सल्ला.'
          : hi
          ? 'प्रयोगशाला जांच रिपोर्ट और खाद की संतुलित सलाह।'
          : 'Soil lab test report and balanced nutrient advisory.'
      }
    >
      {/* Field Selector & Report Meta */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-white p-4 shadow-card">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary-50 text-primary">
            <TestTube2 size={20} />
          </span>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              {mr ? 'शेताची निवड करा:' : hi ? 'खेत का चयन करें:' : 'Select Field:'}
            </label>
            <select
              value={selectedFieldId}
              onChange={(e) => setSelectedFieldId(e.target.value)}
              className="mt-0.5 block font-bold text-sm bg-transparent outline-none cursor-pointer"
            >
              {localizedFields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.area}) · {f.crop}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-surface-muted px-4 py-2 text-xs font-semibold text-text-secondary">
          <CalendarDays size={15} />
          <span>{mr ? 'तपासणी अहवाल: १० मे २०२५' : hi ? 'जांच रिपोर्ट: 10 मई 2025' : 'Test Date: 10 May 2025'}</span>
        </div>
      </div>

      {/* Soil Nutrients Grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {nutrients.map((n) => (
          <div key={n.name} className="rounded-2xl border border-border bg-white p-5 shadow-card">
            <p className="text-xs font-medium text-text-secondary">{n.name}</p>
            <p className="mt-2 text-2xl font-bold text-text-primary">{n.value}</p>
            <span className={`mt-2 inline-block rounded px-2 py-0.5 text-[10px] font-bold ${n.badge}`}>
              {n.status}
            </span>
            <p className="mt-2 text-[10px] text-text-muted">
              {mr ? 'योग्य प्रमाण:' : hi ? 'आदर्श स्तर:' : 'Optimal:'} {n.range}
            </p>
          </div>
        ))}
      </div>

      {/* Soil Moisture Meter & Fertilizer Action Plan */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Moisture Meter */}
        <Card className="p-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="font-bold text-base flex items-center gap-2">
              <Droplets size={20} className="text-info" />
              <span>{mr ? 'मातीतील ओलावा पातळी' : hi ? 'मिट्टी की नमी स्तर' : 'Soil Moisture Level'}</span>
            </h2>
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
              {mr ? '२८% (कमी - पाणी द्या)' : hi ? '28% (कम - सिंचाई करें)' : '28% (Low)'}
            </span>
          </div>

          <div className="mt-6">
            <div className="flex items-end justify-between">
              <span className="text-4xl font-bold text-info">28%</span>
              <span className="text-xs text-text-secondary font-medium">
                {mr ? 'लक्ष्य ओलावा: ५०% – ६०%' : hi ? 'लक्ष्य नमी: 50% – 60%' : 'Target: 50% – 60%'}
              </span>
            </div>

            <div className="mt-3 h-4 w-full rounded-full bg-surface-muted overflow-hidden">
              <div className="h-full w-[28%] rounded-full bg-info" />
            </div>

            <div className="mt-2 flex justify-between text-xs text-text-secondary">
              <span>{mr ? 'कोरडे (०-३०%)' : hi ? 'सूखा (0-30%)' : 'Dry (0-30%)'}</span>
              <span>{mr ? 'योग्य (३०-६५%)' : hi ? 'उपयुक्त (30-65%)' : 'Optimal (30-65%)'}</span>
              <span>{mr ? 'ओलसर (>६५%)' : hi ? 'गीला (>65%)' : 'Wet (>65%)'}</span>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-blue-50 border border-blue-200 p-4">
            <p className="text-xs font-bold text-blue-950">
              {mr ? 'पाणी देण्याचा त्वरित सल्ला:' : hi ? 'सिंचाई की त्वरित सलाह:' : 'Immediate Action:'}
            </p>
            <p className="mt-1 text-xs text-blue-800 leading-5">
              {mr
                ? 'पुढील १-२ दिवसांत २५,००० लिटर/एकर पाणी द्या. सकाळी ६ ते १० दरम्यान पाणी देणे सर्वोत्तम राहील.'
                : hi
                ? 'अगले 1-2 दिनों में 25,000 लीटर/एकड़ सिंचाई करें। सुबह 6-10 बजे पानी देना सर्वोत्तम है।'
                : 'Plan irrigation within 1-2 days (25,000 L/acre). Early morning is best.'}
            </p>
          </div>
        </Card>

        {/* Balanced Fertilizer Recommendations */}
        <Card className="p-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="font-bold text-base flex items-center gap-2">
              <Sparkles size={20} className="text-primary" />
              <span>{mr ? 'संतुलित खत व पोषण नियोजन' : hi ? 'संतुलित खाद एवं पोषण सलाह' : 'Fertilizer & Nutrition Plan'}</span>
            </h2>
          </div>

          <ul className="mt-4 space-y-3.5 text-xs text-text-secondary">
            <li className="flex gap-2.5 items-start">
              <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
              <span>
                <strong className="text-text-primary">{mr ? 'स्फुरदाची कमतरता:' : hi ? 'फॉस्फोरस की कमी:' : 'Phosphorus Deficit:'}</strong>{' '}
                {mr
                  ? 'पुढील पाणी देण्यापूर्वी डीएपी (DAP) किंवा एसएसपी (SSP) ३० किलो/एकर टाका.'
                  : hi
                  ? 'अगली सिंचाई से पहले डीएपी (DAP) या एसएसपी (SSP) 30 किग्रा/एकड़ डालें।'
                  : 'Apply DAP or SSP @ 30 kg/acre before next watering.'}
              </span>
            </li>
            <li className="flex gap-2.5 items-start">
              <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
              <span>
                <strong className="text-text-primary">{mr ? 'नत्र व्यवस्थापन:' : hi ? 'नाइट्रोजन प्रबंधन:' : 'Nitrogen Top-Dressing:'}</strong>{' '}
                {mr
                  ? 'दाणे भरण्याच्या अवस्थेत युरिया (Urea 46% N) ४० किलो/एकर पाणी दिल्यानंतर लगेच टाका.'
                  : hi
                  ? 'दाना भराव अवस्था पर यूरिया (Urea 46% N) 40 किग्रा/एकड़ सिंचाई के तुरंत बाद दें।'
                  : 'Top-dress 40 kg/acre Urea (46% N) right after irrigation.'}
              </span>
            </li>
            <li className="flex gap-2.5 items-start">
              <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
              <span>
                <strong className="text-text-primary">{mr ? 'पालाश पातळी:' : hi ? 'पोटाश स्तर:' : 'Potassium Level:'}</strong>{' '}
                {mr
                  ? 'पालाशचे प्रमाण ३१२ kg/ha उत्कृष्ट आहे. दाण्यांच्या चकाकीसाठी ००:५२:३४ ची फवारणी करावी.'
                  : hi
                  ? 'पोटाश का स्तर 312 kg/ha उत्कृष्ट है। दानों की चमक बढ़ाने के लिए 00:52:34 का स्प्रे करें।'
                  : 'Potash is healthy. 1% NPK 00:52:34 foliar spray recommended for grain sheen.'}
              </span>
            </li>
          </ul>
        </Card>
      </div>
    </Page>
  );
}

// ==========================================
// 2. WEATHER FORECAST & RADAR
// ==========================================
export function Weather() {
  const { language } = useLanguage();
  const mr = language === 'mr';
  const hi = language === 'hi';
  const days = mr ? ['आज', 'उद्या', '२० मे', '२१ मे', '२२ मे'] : hi ? ['आज', 'कल', '20 मई', '21 मई', '22 मई'] : forecast.map((f) => f.day);

  return (
    <Page
      title={mr ? 'हवामान अंदाज व कृषी सल्ला' : hi ? 'मौसम पूर्वानुमान एवं कृषि सलाह' : 'Weather Forecast & Agro-Advisory'}
      subtitle={
        mr
          ? 'पुणे, महाराष्ट्र · तुमच्या शेतासाठी अचूक सूक्ष्म हवामान नियोजन.'
          : hi
          ? 'पुणे, महाराष्ट्र · आपके खेत के लिए सटीक मौसम योजना।'
          : 'Pune, Maharashtra · Hyper-local field weather plan.'
      }
    >
      {/* Current Weather Card & Hourly Rain Probability */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Main Live Card */}
        <section className="rounded-2xl border border-emerald-200 bg-[linear-gradient(135deg,#e8f5e9_0%,#f0fdf4_60%,#e0f2fe_100%)] p-6 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <span className="rounded-full bg-emerald-800 px-3 py-1 text-xs font-bold text-white shadow-xs">
                {mr ? 'सध्याचे हवामान' : hi ? 'वर्तमान मौसम' : 'Live Condition'}
              </span>
              <div className="mt-3 flex items-baseline gap-3">
                <p className="text-5xl font-bold tracking-tight text-text-primary">28°C</p>
                <span className="text-sm text-text-secondary">
                  {mr ? 'भासमान: ३०°C' : hi ? 'महसूस: 30°C' : 'Feels like 30°C'}
                </span>
              </div>
              <p className="mt-1 text-base font-semibold text-emerald-950">
                {mr ? '🌤️ निरभ्र ऊन व हलके ढग' : hi ? '🌤️ आंशिक रूप से धूप / बादल' : '🌤️ Partly Sunny & Mild'}
              </p>
            </div>
            <span className="grid size-16 place-items-center rounded-2xl bg-white/80 text-amber-500 shadow-sm">
              <CloudSun size={40} />
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-emerald-200/60 pt-5 sm:grid-cols-4">
            <div className="rounded-xl bg-white/70 p-3">
              <Droplets size={16} className="text-primary" />
              <p className="text-[10px] text-text-secondary mt-1">{mr ? 'हवेतील आर्द्रता' : hi ? 'हवा में नमी' : 'Humidity'}</p>
              <p className="text-sm font-bold">45%</p>
            </div>
            <div className="rounded-xl bg-white/70 p-3">
              <Wind size={16} className="text-primary" />
              <p className="text-[10px] text-text-secondary mt-1">{mr ? 'वाऱ्याचा वेग' : hi ? 'हवा की गति' : 'Wind Speed'}</p>
              <p className="text-sm font-bold">12 km/h</p>
            </div>
            <div className="rounded-xl bg-white/70 p-3">
              <Umbrella size={16} className="text-primary" />
              <p className="text-[10px] text-text-secondary mt-1">{mr ? 'पावसाची शक्यता' : hi ? 'बारिश की संभावना' : 'Rain Chance'}</p>
              <p className="text-sm font-bold">20%</p>
            </div>
            <div className="rounded-xl bg-white/70 p-3">
              <Sunrise size={16} className="text-primary" />
              <p className="text-[10px] text-text-secondary mt-1">{mr ? 'सूर्योदय' : hi ? 'सूर्योदय' : 'Sunrise'}</p>
              <p className="text-sm font-bold">5:42 AM</p>
            </div>
          </div>
        </section>

        {/* Hourly Rainfall Outlook */}
        <Card className="p-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="font-bold text-sm text-text-primary">
                {mr ? 'पुढील २४ तासांत पावसाचा अंदाज' : hi ? 'अगले 24 घंटे में वर्षा की संभावना' : '24h Rainfall Probability'}
              </h2>
              <p className="text-[11px] text-text-secondary">Pune station radar</p>
            </div>
            <CloudRain size={22} className="text-info" />
          </div>

          <div className="mt-6 flex h-20 items-end gap-1.5" aria-label="Hourly rain graph">
            {[10, 15, 10, 20, 25, 45, 65, 50, 35, 25, 15, 10].map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t transition-all ${
                  i >= 5 && i <= 8 ? 'bg-info' : 'bg-blue-100'
                }`}
                style={{ height: `${h}%` }}
                title={`${h}% rain chance`}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-text-muted">
            <span>6 AM</span>
            <span>12 PM</span>
            <span>6 PM</span>
            <span>12 AM</span>
          </div>

          <div className="mt-4 rounded-xl bg-blue-50 p-3 text-xs text-blue-900 leading-snug">
            {mr
              ? 'सकाळच्या सत्रात हवामान कोरडे राहील. संध्याकाळी ४ ते ७ दरम्यान हलक्या सरींची शक्यता आहे.'
              : hi
              ? 'सुबह का समय सूखा रहेगा। शाम को 4-7 बजे हल्की बूंदाबांदी संभव है।'
              : 'Dry through the morning. Light isolated showers possible between 4–7 PM.'}
          </div>
        </Card>
      </div>

      {/* Extreme Weather Alert Banner */}
      <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-card">
        <div className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-amber-500 text-black shrink-0">
            <TriangleAlert size={20} />
          </span>
          <div>
            <h3 className="font-bold text-sm text-amber-950">
              {mr ? 'हवामान इशारा: २०-२१ मे रोजी मुसळधार पावसाची शक्यता' : hi ? 'मौसम अलर्ट: 20-21 मई को तेज बारिश की संभावना' : 'Weather Alert: Heavy Rain on 20-21 May'}
            </h3>
            <p className="mt-1 text-xs text-amber-900 leading-5">
              {mr
                ? 'हवामान विभागानुसार २० व २१ मे रोजी ४०-५० किमी/तास वेगाच्या वाऱ्यासह पाऊस होऊ शकतो. शेतातील पाण्याचा निचरा योग्य ठेवा आणि औषध फवारणी २२ मे नंतरच करावी.'
                : hi
                ? 'मौसम विभाग के अनुसार 20 और 21 मई को 40-50 किमी/घंटा की हवाओं के साथ बारिश हो सकती है। खेत के जल निकास रास्तों को साफ रखें एवं खड़ी फसल पर कीटनाशक का छिड़काव 22 मई के बाद ही करें।'
                : 'Thunderstorms with moderate to heavy rain and gusty winds predicted on 20-21 May. Clear drainage channels and postpone pesticide foliar spray until 22 May.'}
            </p>
          </div>
        </div>
      </div>

      {/* 5-Day Detailed Forecast Grid */}
      <div className="mt-6 rounded-2xl border border-border bg-white p-6 shadow-card">
        <h2 className="font-bold text-base text-text-primary mb-4">
          {mr ? '५ दिवसांचा सविस्तर हवामान अंदाज' : hi ? '5 दिन का विस्तृत पूर्वानुमान' : '5-Day Weather Forecast'}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {forecast.map((f, i) => (
            <div
              key={f.day}
              className={`rounded-xl p-4 text-center border transition ${
                i === 0
                  ? 'border-primary bg-primary-50/70 shadow-xs'
                  : 'border-border bg-surface-muted'
              }`}
            >
              <p className="text-xs font-bold text-text-primary">{days[i]}</p>
              <p className="my-2 text-3xl">{f.icon}</p>
              <b className="text-base font-bold text-text-primary">{f.high}</b>
              <p className="text-xs text-text-secondary">{f.low}</p>
              <span className="mt-2 inline-block rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-info">
                Rain {f.rain}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}

// ==========================================
// 3. SMART IRRIGATION SCHEDULER & ACTUATOR
// ==========================================
export function Irrigation() {
  const { language } = useLanguage();
  const mr = language === 'mr';
  const hi = language === 'hi';
  const [pumpOn, setPumpOn] = useState(false);
  const [selectedField, setSelectedField] = useState('Wheat Field');

  const schedule = [
    {
      field: mr ? 'गव्हाचे शेत' : hi ? 'गेहूं का खेत' : 'Wheat Field',
      date: mr ? '२१ मे २०२५' : '21 May 2025',
      volume: mr ? '२५,००० लि/एकर' : '25,000 L/Acre',
      status: mr ? 'नियोजित (२ दिवसांनंतर)' : hi ? 'नियोजित (2 दिन बाद)' : 'Scheduled (In 2 Days)',
    },
    {
      field: mr ? 'बटाट्याचे शेत' : hi ? 'आलू का खेत' : 'Potato Patch',
      date: mr ? 'आज संध्याकाळी' : hi ? 'आज शाम' : 'Today Evening',
      volume: mr ? '१८,००० लि/एकर' : '18,000 L/Acre',
      status: mr ? 'तातडीने आवश्यक' : hi ? 'तत्काल आवश्यक' : 'Urgent',
    },
    {
      field: mr ? 'मोहरीचे शेत' : hi ? 'सरसों का खेत' : 'Mustard Plot',
      date: mr ? '२४ मे २०२५' : '24 May 2025',
      volume: mr ? '१५,००० लि/एकर' : '15,000 L/Acre',
      status: mr ? 'नियोजित' : hi ? 'नियोजित' : 'Scheduled',
    },
  ];

  return (
    <Page
      title={mr ? 'स्मार्ट सिंचन सल्ला व पंप नियंत्रण' : hi ? 'स्मार्ट सिंचाई सलाह एवं पंप नियंत्रण' : 'Smart Irrigation & Pump Control'}
      subtitle={
        mr
          ? 'मातीतील ओलाव्यावर आधारित पाणी गणना आणि IoT पंप ऑटोमेशन.'
          : hi
          ? 'मिट्टी की नमी आधारित पानी की गणना एवं IoT ऑटोमेशन।'
          : 'Moisture-driven water volume calculation and IoT pump actuation.'
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* Moisture & Advice */}
        <Card className="p-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-info">
                <Droplets size={22} />
              </span>
              <div>
                <h2 className="font-bold text-base text-text-primary">
                  {mr ? 'गहू शेत: पाणी आवश्यकता' : hi ? 'गेहूं का खेत: सिंचाई स्थिति' : 'Wheat Field: Water Need'}
                </h2>
                <p className="text-xs text-text-secondary">{mr ? '२.५ एकर · दाणे भरणे अवस्था' : '2.5 Acres · Grain Filling Stage'}</p>
              </div>
            </div>
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
              {mr ? 'ओलावा कमी (२८%)' : hi ? 'नमी कम (28%)' : 'Low (28%)'}
            </span>
          </div>

          <div className="mt-5 space-y-4 text-xs">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-text-secondary">{mr ? 'पुढील नियोजित पाणी:' : hi ? 'अगली सुझाई गई सिंचाई:' : 'Next Scheduled Watering:'}</span>
              <b className="font-bold text-primary-dark">{mr ? '२१ मे २०२५ (पहाटे)' : '21 May 2025 (Early Morning)'}</b>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-text-secondary">{mr ? 'आवश्यक पाणी प्रमाण:' : hi ? 'आवश्यक पानी की मात्रा:' : 'Water Volume Required:'}</span>
              <b className="font-bold text-info">{mr ? '२५,००० लिटर / एकर' : hi ? '25,000 लीटर / एकड़' : '25,000 L / Acre'}</b>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">{mr ? 'अंदाजे पंप रन वेळ:' : hi ? 'अनुमानित पंप रन टाइम:' : 'Estimated Pump Run Time:'}</span>
              <b className="font-bold">{mr ? '२.५ तास (५ HP पंप)' : hi ? '2.5 घंटे (5 HP पंप)' : '2.5 Hours (5 HP Pump)'}</b>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-primary-50 border border-primary/20 p-4">
            <p className="text-xs font-bold text-primary-dark">
              {mr ? 'पाणी दिल्यानंतरचे कार्य:' : hi ? 'सिंचाई के बाद आवश्यक कार्य:' : 'Post-Irrigation Task:'}
            </p>
            <p className="mt-1 text-xs text-text-secondary leading-5">
              {mr
                ? 'पाणी दिल्यानंतर २४ तासांत युरिया खताची मात्रा (४० किलो/एकर) द्या, ज्यामुळे नत्र शोषण उत्तम होईल.'
                : hi
                ? 'पानी देने के 24 घंटे के अंदर यूरिया की दूसरी खुराक (40 किग्रा/एकड़) डालें।'
                : 'Top dress 40 kg/acre urea within 24 hours of irrigation for maximum nitrogen uptake.'}
            </p>
          </div>
        </Card>

        {/* IoT Smart Pump Relay Actuator Simulator */}
        <Card className="p-6 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_100%)]">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="font-bold text-base text-text-primary">
                {mr ? 'IoT विहीर/बोअरवेल पंप नियंत्रक' : hi ? 'IoT ट्यूबवेल पंप नियंत्रक' : 'IoT Tubewell Controller'}
              </h2>
              <p className="text-xs text-text-secondary">ESP32 Smart Relay #01</p>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                pumpOn ? 'bg-emerald-100 text-emerald-800 animate-pulse' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {pumpOn ? (mr ? 'सुरू (ON)' : hi ? 'चालू (ON)' : 'RUNNING') : (mr ? 'बंद (OFF)' : hi ? 'बंद (OFF)' : 'IDLE')}
            </span>
          </div>

          <div className="mt-6 flex flex-col items-center justify-center text-center">
            <button
              onClick={() => setPumpOn((v) => !v)}
              className={`grid size-24 place-items-center rounded-full border-4 transition shadow-xl ${
                pumpOn
                  ? 'border-emerald-200 bg-emerald-600 text-white ring-8 ring-emerald-100'
                  : 'border-gray-200 bg-gray-700 text-white hover:bg-gray-800'
              }`}
            >
              <Power size={36} />
            </button>
            <p className="mt-4 text-xs font-bold text-text-primary">
              {pumpOn
                ? (mr ? 'पंप सुरू आहे · पाणी प्रवाह: ४५० L/min' : hi ? 'पंप चल रहा है · पानी का प्रवाह: 450 L/min' : 'Pump Active · Flow: 450 L/min')
                : (mr ? 'पंप सुरू करण्यासाठी टॅप करा' : hi ? 'पंप चालू करने के लिए टैप करें' : 'Tap to start irrigation pump')}
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">
              {mr ? 'सुरक्षा कट-ऑफ: ३ तासांनंतर आपोआप बंद' : hi ? 'सुरक्षा कट-ऑफ: 3 घंटे बाद ऑटो बंद' : 'Auto-safety shutoff active (3h timer)'}
            </p>
          </div>
        </Card>
      </div>

      {/* All Fields Irrigation Schedule Table */}
      <div className="mt-6 rounded-2xl border border-border bg-white p-6 shadow-card">
        <h2 className="font-bold text-base text-text-primary mb-4">
          {mr ? 'सर्व शेतांचे सिंचन वेळापत्रक' : hi ? 'सभी खेतों की सिंचाई अनुसूची' : 'Farm-Wide Irrigation Schedule'}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-y border-border bg-surface-muted text-text-secondary">
              <tr>
                <th className="py-3 px-4 font-bold">{mr ? 'शेताचे नाव' : hi ? 'खेत का नाम' : 'Field'}</th>
                <th className="py-3 px-4 font-bold">{mr ? 'नियोजित तारीख' : hi ? 'नियोजित तारीख' : 'Scheduled Date'}</th>
                <th className="py-3 px-4 font-bold">{mr ? 'पाण्याचे प्रमाण' : hi ? 'पानी की मात्रा' : 'Water Volume'}</th>
                <th className="py-3 px-4 font-bold text-right">{mr ? 'स्थिती' : hi ? 'स्थिति' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {schedule.map((row) => (
                <tr key={row.field} className="hover:bg-surface-muted/50">
                  <td className="py-3.5 px-4 font-bold text-text-primary">{row.field}</td>
                  <td className="py-3.5 px-4 text-text-secondary">{row.date}</td>
                  <td className="py-3.5 px-4 text-info font-semibold">{row.volume}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="rounded bg-primary-50 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  );
}

// ==========================================
// 4. MANDI MARKET PRICES & MACHINERY RENTAL DISCOVERY
// ==========================================
export function MarketPrices() {
  const { language } = useLanguage();
  const mr = language === 'mr';
  const hi = language === 'hi';

  const [activeSection, setActiveSection] = useState('mandi'); // 'mandi' | 'machinery'
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [machineryCategory, setMachineryCategory] = useState('ALL');
  const [bookingModalItem, setBookingModalItem] = useState(null);
  const [bookingHours, setBookingHours] = useState(4);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const mandis = HOSTED_MANDI_PRICES;
  const machineryList = HOSTED_MACHINERY_RENTALS;

  const filteredMachinery = machineryList.filter((m) => {
    if (machineryCategory === 'ALL') return true;
    return m.category.toUpperCase() === machineryCategory.toUpperCase();
  });

  const points = '0,111 58,96 116,104 174,76 232,82 290,54 348,38 406,17';

  return (
    <Page
      title={
        activeSection === 'mandi'
          ? mr
            ? 'थेट बाजार भाव व कल (APMC Mandi)'
            : hi
            ? 'ताज़ा मंडी भाव एवं मूल्य रुझान'
            : 'Live Mandi Prices & Agmarknet Trends'
          : mr
          ? 'ट्रॅक्टर व कृषी अवजारे भाडे सेवा'
          : hi
          ? 'ट्रैक्टर एवं कृषि मशीनरी किराया खोज'
          : 'Machinery & Tractor Rental Discovery'
      }
      subtitle={
        activeSection === 'mandi'
          ? mr
            ? 'पुणे व महाराष्ट्रातील बाजार समित्यांचे ताजे भाव (eNAM/Agmarknet द्वारे समक्रमित)'
            : hi
            ? 'पुणे एवं आस-पास की सभी मंडियों के ताज़ा भाव।'
            : 'Real-time Agmarknet commodity prices and 7-day sparkline trends.'
          : mr
          ? 'नजीकच्या शेतकऱ्यांकडून ट्रॅक्टर, रोटाव्हेटर, हार्वेस्टर आणि ड्रोन भाड्याने मिळवा'
          : hi
          ? 'नजदीकी किसानों से ट्रैक्टर, रोटावेटर, हार्वेस्टर एवं ड्रोन किराये पर प्राप्त करें।'
          : 'Discover & book tractors, harvesters, rotavators, and spray drones in Pune district.'
      }
    >
      {/* Top Toggle Switcher: Mandi Rates vs Machinery Rentals */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-white p-4 shadow-card">
        <div className="flex rounded-xl bg-surface-muted p-1 border border-border text-xs">
          <button
            onClick={() => setActiveSection('mandi')}
            className={`rounded-lg px-4 py-2 font-bold transition flex items-center gap-1.5 ${
              activeSection === 'mandi'
                ? 'bg-primary text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>🌾 {mr ? 'बाजार समिती भाव (Mandi Rates)' : hi ? 'मंडी भाव (Mandi Rates)' : 'Live Mandi Rates'}</span>
          </button>
          <button
            onClick={() => setActiveSection('machinery')}
            className={`rounded-lg px-4 py-2 font-bold transition flex items-center gap-1.5 ${
              activeSection === 'machinery'
                ? 'bg-primary text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>🚜 {mr ? 'ट्रॅक्टर व यंत्रसामग्री भाडे' : hi ? 'ट्रैक्टर व मशीनरी किराया' : 'Machinery & Tractor Rentals'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
          <MapPin size={16} className="text-primary" />
          <span>Pune District, Maharashtra</span>
        </div>
      </div>

      {activeSection === 'mandi' ? (
        <>
          {/* Main Today Price & 7-Day Sparkline */}
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <Card className="border-primary/20 bg-[linear-gradient(135deg,#f0fdf4_0%,#ffffff_100%)] p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-wider">
                    {mr ? 'आजचा सरासरी पुणे बाजार समिती भाव' : hi ? 'आज का औसत पुणे मंडी भाव' : "Today's Pune Mandi Rate"}
                  </p>
                  <div className="mt-2 flex items-baseline gap-3">
                    <p className="text-4xl font-bold tracking-tight text-primary-dark">₹ 2,125</p>
                    <span className="text-xs text-text-secondary">/ {mr ? 'क्विंटल' : hi ? 'क्विंटल' : 'Quintal'}</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                    <TrendingUp size={14} />
                    <span>+2.35% {mr ? '(मागील आठवड्यापेक्षा जास्त)' : hi ? '(पिछले सप्ताह से ऊपर)' : '(vs last week)'}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-primary/20 bg-white p-3 text-right text-xs">
                  <p className="text-[10px] text-text-muted">{mr ? 'आठवडा कमाल:' : hi ? 'साप्ताहिक उच्चतम:' : 'Weekly High:'}</p>
                  <b className="font-bold text-text-primary">₹ 2,150</b>
                  <p className="text-[10px] text-text-muted mt-1.5">{mr ? 'आठवडा किमान:' : hi ? 'साप्ताहिक न्यूनतम:' : 'Weekly Low:'}</p>
                  <b className="font-bold text-text-primary">₹ 2,050</b>
                </div>
              </div>
              <p className="mt-4 text-[10px] text-text-muted">
                {mr ? 'शासकीय हमीभाव (MSP २०२४-२५): ₹ २,२७५ / क्विंटल' : hi ? 'सरकारी न्यूनतम समर्थन मूल्य (MSP 2024-25): ₹ 2,275 / क्विंटल' : 'Govt MSP (2024-25): ₹ 2,275 / Quintal'}
              </p>
            </Card>

            {/* 7-Day Trend Chart */}
            <Card className="p-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="font-bold text-sm text-text-primary">
                  {mr ? '७ दिवसांचा भाव कल' : hi ? '7 दिन का भाव रुझान' : '7-Day Price Trend'}
                </h2>
                <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  + ₹49 this week
                </span>
              </div>

              <div className="mt-4 h-24">
                <svg
                  className="h-full w-full overflow-visible"
                  viewBox="0 0 406 128"
                  preserveAspectRatio="none"
                  aria-label="Price trend chart"
                >
                  <defs>
                    <linearGradient id="marketFill2" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#2E7D32" stopOpacity=".25" />
                      <stop offset="100%" stopColor="#2E7D32" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={`M ${points} L 406,128 L 0,128 Z`} fill="url(#marketFill2)" />
                  <polyline
                    points={points}
                    fill="none"
                    stroke="#2E7D32"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="flex justify-between text-[10px] text-text-muted mt-2">
                <span>13 May</span>
                <span>16 May</span>
                <span>19 May (Today)</span>
              </div>
            </Card>
          </div>

          {/* Nearby Mandis Table */}
          <div className="mt-6 rounded-2xl border border-border bg-white p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base text-text-primary">
                {mr ? 'पुणे व नजीकच्या बाजार समित्यांचे ताजे भाव' : hi ? 'आस-पास की मंडियों में ताज़ा भाव' : 'Nearby Mandis Price Comparison'}
              </h2>
              <span className="text-[10px] text-text-muted">Apify Scraped · Updated Daily 05:30 AM</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-y border-border bg-surface-muted text-text-secondary">
                  <tr>
                    <th className="py-3 px-4 font-bold">{mr ? 'बाजार समिती' : hi ? 'मंडी' : 'Mandi Name'}</th>
                    <th className="py-3 px-4 font-bold">{mr ? 'सरासरी भाव (₹/क्विंटल)' : hi ? 'भाव (₹/क्विंटल)' : 'Modal Price'}</th>
                    <th className="py-3 px-4 font-bold">{mr ? 'किमान - कमाल' : 'Min - Max'}</th>
                    <th className="py-3 px-4 font-bold">{mr ? 'बदल' : hi ? 'बदलाव' : 'Change'}</th>
                    <th className="py-3 px-4 font-bold">{mr ? 'अंतर' : hi ? 'दूरी' : 'Distance'}</th>
                    <th className="py-3 px-4 font-bold text-right">{mr ? 'दैनिक आवक' : hi ? 'दैनिक आवक' : 'Daily Arrival'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mandis.map((m) => (
                    <tr key={m.id} className="hover:bg-surface-muted/50 transition">
                      <td className="py-3.5 px-4 font-bold text-text-primary">
                        {mr ? m.mandiMr : hi ? m.mandiHi : m.mandi}
                        {m.distanceKm <= 15 && (
                          <span className="ml-2 rounded bg-primary-50 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                            {mr ? 'जवळचे' : hi ? 'निकटतम' : 'Nearest'}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-primary-dark">₹ {m.modalPrice.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-text-secondary">₹ {m.minPrice} - ₹ {m.maxPrice}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">{m.changePct}</td>
                      <td className="py-3.5 px-4 text-text-secondary">{m.distanceKm} km</td>
                      <td className="py-3.5 px-4 text-right text-text-secondary font-medium">{m.arrivalTodayQtl} Qtl</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* MACHINERY & TRACTOR RENTAL DISCOVERY */
        <div className="mt-6 space-y-6">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'ALL', label: mr ? 'सर्व यंत्रसामग्री' : hi ? 'सभी मशीनरी' : 'All Equipment' },
              { id: 'TRACTOR', label: mr ? 'ट्रॅक्टर (Tractors)' : hi ? 'ट्रैक्टर' : 'Tractors' },
              { id: 'HARVESTER', label: mr ? 'हार्वेस्टर (Harvesters)' : hi ? 'हार्वेस्टर' : 'Combine Harvesters' },
              { id: 'IMPLEMENTS', label: mr ? 'रोटाव्हेटर व नांगर' : hi ? 'रोटावेटर व जुताई' : 'Rotavator & Ploughs' },
              { id: 'DRONE', label: mr ? 'फवारणी ड्रोन' : hi ? 'छिड़काव ड्रोन' : 'Spray Drones' },
              { id: 'THRESHER', label: mr ? 'मळणी यंत्र (Thresher)' : hi ? 'थ्रेशर मशीन' : 'Threshers' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setMachineryCategory(cat.id)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition border ${
                  machineryCategory === cat.id
                    ? 'bg-primary border-primary text-white shadow-xs'
                    : 'bg-white border-border text-text-secondary hover:bg-surface-muted'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Machinery Grid Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMachinery.map((mach) => (
              <Card key={mach.id} className="overflow-hidden p-0 flex flex-col justify-between hover:shadow-lg transition">
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img src={mach.image} alt={mach.name} className="h-full w-full object-cover" />
                    <span className="absolute top-3 right-3 rounded-full bg-emerald-900/90 backdrop-blur-xs px-3 py-1 text-[11px] font-bold text-emerald-200 border border-emerald-400/30">
                      ★ {mach.rating} ({mach.reviewsCount})
                    </span>
                    <span className="absolute bottom-3 left-3 rounded-md bg-black/75 backdrop-blur-xs px-2.5 py-1 text-[10px] font-bold text-white">
                      {mach.hp}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-primary-50 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                        {mr ? mach.categoryMr : hi ? mach.categoryHi : mach.category}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {mr ? mach.availableStatusMr : hi ? mach.availableStatusHi : mach.availableStatus}
                      </span>
                    </div>

                    <h3 className="mt-2 text-base font-bold text-text-primary leading-snug">
                      {mr ? mach.nameMr : hi ? mach.nameHi : mach.name}
                    </h3>
                    <p className="mt-1 text-xs text-text-secondary">
                      {mach.implementsIncluded}
                    </p>

                    <div className="mt-3 flex items-center gap-1.5 text-xs text-text-muted">
                      <MapPin size={13} className="text-primary shrink-0" />
                      <span>{mach.village} ({mach.distanceKm} km)</span>
                    </div>

                    <div className="mt-4 flex items-baseline justify-between border-t border-border pt-3">
                      <div>
                        <span className="text-[10px] text-text-muted">{mr ? 'ताशी दर:' : 'Hourly Rate:'}</span>
                        <p className="text-lg font-bold text-primary-dark">₹ {mach.hourlyRate} <span className="text-xs font-normal text-text-secondary">/ hr</span></p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-text-muted">{mr ? 'दिवसाचा दर:' : 'Full Day:'}</span>
                        <p className="text-sm font-bold text-text-primary">₹ {mach.dailyRate}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border bg-surface-muted/40 p-4 flex gap-2">
                  <a
                    href={`tel:${mach.phone}`}
                    className="flex-1 rounded-xl border border-primary/30 bg-white py-2.5 text-center text-xs font-bold text-primary hover:bg-primary-50 transition"
                  >
                    📞 {mr ? 'कॉल करा' : 'Call Owner'}
                  </a>
                  <button
                    onClick={() => {
                      setBookingModalItem(mach);
                      setBookingSuccess(false);
                    }}
                    className="flex-1 rounded-xl bg-primary py-2.5 text-center text-xs font-bold text-white hover:bg-primary-dark transition shadow-xs"
                  >
                    {mr ? 'बुक करा' : 'Book Rental'}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: BOOK MACHINERY */}
      {bookingModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-text-primary">
                {mr ? 'यंत्रसामग्री भाडे बुकिंग' : 'Book Farm Equipment Rental'}
              </h3>
              <button onClick={() => setBookingModalItem(null)} className="p-1 rounded-lg text-text-muted hover:bg-surface-muted">
                ✕
              </button>
            </div>

            {bookingSuccess ? (
              <div className="py-8 text-center">
                <span className="grid size-12 place-items-center rounded-full bg-emerald-100 text-emerald-800 mx-auto mb-3">
                  ✓
                </span>
                <h4 className="font-bold text-base text-emerald-950">
                  {mr ? 'बुकिंग विनंती यशस्वीरीत्या पाठवली!' : 'Booking Request Sent!'}
                </h4>
                <p className="mt-1 text-xs text-text-secondary">
                  {mr
                    ? `${bookingModalItem.ownerName} लवकरच तुमच्याशी संपर्क साधतील (${bookingModalItem.phone}).`
                    : `Owner ${bookingModalItem.ownerName} will confirm your slot shortly (${bookingModalItem.phone}).`}
                </p>
                <button
                  onClick={() => setBookingModalItem(null)}
                  className="mt-5 rounded-xl bg-primary px-6 py-2 text-xs font-bold text-white"
                >
                  {mr ? 'पूर्ण झाले' : 'Done'}
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3 rounded-xl bg-surface-muted p-3 border border-border">
                  <img src={bookingModalItem.image} alt={bookingModalItem.name} className="size-14 rounded-lg object-cover" />
                  <div>
                    <h4 className="font-bold text-xs text-text-primary">{bookingModalItem.name}</h4>
                    <p className="text-[11px] text-text-secondary mt-0.5">Owner: {bookingModalItem.ownerName} ({bookingModalItem.phone})</p>
                    <p className="text-[11px] font-bold text-primary">₹ {bookingModalItem.hourlyRate} / hour</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>{mr ? 'आवश्यक तास:' : 'Required Duration (Hours):'}</span>
                    <span className="text-primary font-bold">{bookingHours} Hours</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    step="1"
                    value={bookingHours}
                    onChange={(e) => setBookingHours(parseInt(e.target.value, 10))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>

                <div className="rounded-xl border border-primary/20 bg-primary-50 p-4">
                  <div className="flex justify-between text-xs text-text-secondary">
                    <span>{mr ? 'अंदाजे भाडे रक्कम:' : 'Estimated Total Cost:'}</span>
                    <b className="text-base text-primary-dark">₹ {(bookingHours * bookingModalItem.hourlyRate).toLocaleString('en-IN')}</b>
                  </div>
                  <p className="text-[10px] text-text-muted mt-1">
                    {mr ? 'डिझेल व ड्रायव्हर शुल्क समाविष्ट आहे.' : 'Includes operator & diesel allowance.'}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setBookingModalItem(null)}
                    className="px-4 py-2 text-xs font-bold text-text-secondary hover:bg-surface-muted rounded-xl"
                  >
                    {mr ? 'रद्द करा' : 'Cancel'}
                  </button>
                  <button
                    onClick={() => setBookingSuccess(true)}
                    className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-xs"
                  >
                    {mr ? 'बुकिंग निश्चित करा' : 'Confirm Booking'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Page>
  );
}


// ==========================================
// 5. REPORTS GENERATOR
// ==========================================
export function Reports() {
  const { language } = useLanguage();
  const mr = language === 'mr';
  const hi = language === 'hi';

  return (
    <Page
      title={mr ? 'शेती अहवाल व प्रमाणपत्र' : hi ? 'फार्म रिपोर्ट एवं प्रमाण पत्र' : 'Farm Reports & Certificates'}
      subtitle={
        mr
          ? 'पीक चक्र, माती परीक्षण, हवामान इतिहास आणि सिंचन नोंदींचा मासिक अहवाल.'
          : hi
          ? 'फसल चक्र, मिट्टी स्वास्थ्य एवं पानी उपयोग की मासिक रिपोर्ट।'
          : 'Comprehensive monthly agro-intelligence report and Soil Health certificate.'
      }
    >
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-xl bg-primary text-white">
            <Sprout size={24} />
          </span>
          <div>
            <h2 className="font-bold text-base text-text-primary">
              {mr ? 'मे २०२५ संपूर्ण शेती अहवाल (PDF)' : hi ? 'मई 2025 सम्पूर्ण फार्म रिपोर्ट (PDF)' : 'May 2025 Complete Farm Intelligence Report (PDF)'}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              {mr
                ? 'पीक वाढ टाइमलाइन, मातीतील पोषणद्रव्ये, हवामान नोंदी आणि बाजार नफा विश्लेषण.'
                : hi
                ? 'फसल वृद्धि, मिट्टी परीक्षण, मौसम इतिहास और मंडी लाभ का विश्लेषण।'
                : 'Crop health timeline, soil nutrients, weather log, and market arbitrage report.'}
            </p>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={() => alert(mr ? 'अहवाल डाउनलोड सुरू झाला!' : hi ? 'रिपोर्ट डाउनलोड शुरू हुई!' : 'Report downloaded!')}
            className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-dark shadow-sm"
          >
            {mr ? 'डाउनलोड करा (PDF) 📥' : hi ? 'डाउनलोड करें (PDF) 📥' : 'Download PDF Report 📥'}
          </button>
        </div>
      </Card>
    </Page>
  );
}
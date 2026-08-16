import {
  CalendarDays,
  ChevronDown,
  CircleHelp,
  CloudRain,
  CloudSun,
  Droplets,
  MapPin,
  Sprout,
  Sunrise,
  ThermometerSun,
  TrendingUp,
  TriangleAlert,
  Umbrella,
  Wind,
} from 'lucide-react';
import { forecast } from '../data/dashboard.js';
import { useLanguage } from '../hooks/useLanguage.jsx';

// Reusable card container component
const Card = ({ children, className = '' }) => (
  <section
    className={`rounded-card border border-border bg-white p-5 shadow-card ${className}`}
  >
    {children}
  </section>
);

// Reusable metric statistic widget component
const Metric = ({ label, value, note, color = 'text-primary-dark' }) => (
  <div className="rounded-xl bg-surface-muted p-4">
    <p className="text-xs text-text-secondary">{label}</p>
    <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
    <p className="mt-1 text-xs text-text-secondary">{note}</p>
  </div>
);

// Soil Health Page Component
export function SoilHealth() {
  const { isHindi } = useLanguage();
  const c = isHindi
    ? [
        'मिट्टी की जांच',
        'अपने खेत की मिट्टी की स्थिति समझें।',
        'पीएच मान',
        'जैविक कार्बन',
        'नाइट्रोजन (N)',
        'फॉस्फोरस (P)',
        'अच्छी सीमा: 6.0–7.5',
        'मध्यम',
        'कम',
        'मिट्टी की नमी',
        'सूखा',
        'उपयुक्त',
        'गीला',
        'नमी कम है: अगले 1–2 दिनों में सिंचाई की योजना बनाएं।',
        'सुझाव',
        'अगली सिंचाई से पहले फॉस्फोरस उर्वरक डालें।',
        'गेहूं के लिए पीएच 6.0 से 7.5 रखें।',
        'कटाई के बाद जैविक कार्बन की दोबारा जांच करें।',
      ]
    : [
        'Soil Health',
        "Understand your field's soil condition.",
        'pH level',
        'Organic carbon',
        'Nitrogen (N)',
        'Phosphorus (P)',
        'Good range: 6.0–7.5',
        'Medium',
        'Low',
        'Soil moisture',
        'Dry',
        'Optimal',
        'Wet',
        'Low moisture: schedule irrigation in the next 1–2 days.',
        'Recommendations',
        'Apply phosphorus fertiliser before the next irrigation.',
        'Maintain pH between 6.0 and 7.5 for wheat.',
        'Retest organic carbon after harvest.',
      ];

  return (
    <Page title={c[0]} subtitle={c[1]}>
      {/* Soil metrics cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label={c[2]} value="6.8" note={c[6]} />
        <Metric label={c[3]} value="0.56%" note={c[7]} />
        <Metric label={c[4]} value="215" note={`kg/ha · ${c[7]}`} />
        <Metric label={c[5]} value="18" note={`kg/ha · ${c[8]}`} color="text-warning" />
      </div>

      {/* Soil moisture level & recommendations */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="font-bold">{c[9]}</h2>
          <div className="mt-5 flex items-end gap-6">
            <p className="text-5xl font-bold text-info">28%</p>
            <div className="flex-1">
              <div className="h-4 overflow-hidden rounded-full bg-surface-muted">
                <div className="h-full w-[28%] rounded-full bg-info" />
              </div>
              <div className="mt-2 flex justify-between text-xs text-text-secondary">
                <span>{c[10]}</span>
                <span>{c[11]}</span>
                <span>{c[12]}</span>
              </div>
            </div>
          </div>
          <p className="mt-5 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
            {c[13]}
          </p>
        </Card>

        <Card>
          <h2 className="font-bold">{c[14]}</h2>
          <ul className="mt-4 space-y-3 text-sm text-text-secondary">
            {c.slice(15).map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </Card>
      </div>
    </Page>
  );
}

// Weather Forecast Page Component
export function Weather() {
  const { isHindi } = useLanguage();
  const c = isHindi
    ? {
        title: 'मौसम',
        sub: 'इंदौर, मध्य प्रदेश · आपके खेत के लिए मौसम योजना',
        now: 'अभी',
        condition: 'आंशिक धूप',
        feels: 'महसूस',
        humidity: 'नमी',
        wind: 'हवा',
        rain: 'बारिश की संभावना',
        sunrise: 'सूर्योदय',
        rainPlan: 'अगले 24 घंटे में वर्षा',
        dry: 'सुबह सूखी रहेगी',
        wet: 'शाम तक हल्की बारिश संभव',
        advice: 'खेत का काम',
        action:
          'सुबह 6–10 बजे सिंचाई और फसल निरीक्षण के लिए सबसे अच्छा समय है। शाम को बारिश की संभावना से पहले छिड़काव न करें।',
        alert: 'मौसम चेतावनी',
        alertText: '20–21 मई को हल्की बारिश के साथ आंधी की संभावना है।',
        forecast: '5 दिन का पूर्वानुमान',
        selected: 'आज',
      }
    : {
        title: 'Weather',
        sub: 'Indore, Madhya Pradesh · Field-ready weather plan',
        now: 'Right now',
        condition: 'Partly sunny',
        feels: 'Feels like',
        humidity: 'Humidity',
        wind: 'Wind',
        rain: 'Rain chance',
        sunrise: 'Sunrise',
        rainPlan: 'Rainfall outlook',
        dry: 'Dry through the morning',
        wet: 'Light rain possible by evening',
        advice: 'Field work window',
        action:
          '6–10 AM is the best window for irrigation and crop checks. Avoid spraying before the chance of rain later in the day.',
        alert: 'Weather alert',
        alertText: 'Thunderstorms with light rain are possible on 20–21 May.',
        forecast: '5-day forecast',
        selected: 'Today',
      };

  const days = isHindi ? ['आज', 'सोम', 'मंगल', 'बुध', 'गुरु'] : forecast.map((day) => day.day);

  return (
    <Page title={c.title} subtitle={c.sub}>
      {/* Current weather and rainfall outlook card */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,.8fr)]">
        <section className="overflow-hidden rounded-card border border-[#bfe1c3] bg-[linear-gradient(135deg,#e7f6e9_0%,#f8fcf8_58%,#eef7ff_100%)] p-5 shadow-card sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-primary">{c.now}</p>
              <div className="mt-2 flex items-end gap-3">
                <p className="text-5xl font-bold tracking-tight">28°C</p>
                <p className="mb-2 text-sm text-text-secondary">{c.feels} 30°C</p>
              </div>
              <p className="mt-2 text-base font-medium">{c.condition}</p>
            </div>
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white/70 text-amber-500 shadow-sm">
              <CloudSun size={38} />
            </span>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-primary/15 pt-5 sm:grid-cols-4">
            <WeatherMetric icon={Droplets} label={c.humidity} value="45%" />
            <WeatherMetric icon={Wind} label={c.wind} value="12 km/h" />
            <WeatherMetric icon={Umbrella} label={c.rain} value="20%" />
            <WeatherMetric icon={Sunrise} label={c.sunrise} value="5:42 AM" />
          </div>
        </section>

        <section className="rounded-card border border-border bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{c.rainPlan}</p>
              <p className="mt-1 text-xs text-text-secondary">
                {c.selected} · 20% probability
              </p>
            </div>
            <CloudRain size={24} className="text-info" />
          </div>
          <div
            className="mt-6 flex h-16 items-end gap-2"
            aria-label="Hourly rainfall chance chart"
          >
            {[8, 12, 10, 18, 24, 42, 58, 45, 36, 25, 20, 16].map((height, index) => (
              <span
                className={`flex-1 rounded-t ${
                  index >= 5 && index <= 8 ? 'bg-info' : 'bg-blue-100'
                }`}
                style={{ height: `${height}%` }}
                key={index}
              />
            ))}
          </div>
          <div className="mt-3 flex justify-between text-[11px] text-text-muted">
            <span>6 AM</span>
            <span>12 PM</span>
            <span>6 PM</span>
            <span>12 AM</span>
          </div>
          <div className="mt-5 rounded-lg bg-blue-50 p-3">
            <p className="text-sm font-semibold text-blue-900">{c.dry}</p>
            <p className="mt-1 text-xs text-blue-800">{c.wet}</p>
          </div>
        </section>
      </div>

      {/* Field work advice and weather alert boxes */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,.8fr)]">
        <section className="rounded-card border border-primary/20 bg-primary-50 p-5 shadow-card">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-white">
              <ThermometerSun size={20} />
            </span>
            <div>
              <p className="font-semibold text-primary-dark">{c.advice}</p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                {c.action}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-card border border-amber-200 bg-amber-50 p-5 shadow-card">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
            <TriangleAlert size={18} className="text-warning" />
            {c.alert}
          </p>
          <p className="mt-2 text-sm leading-6 text-amber-800">{c.alertText}</p>
        </section>
      </div>

      {/* 5-day weather forecast breakdown */}
      <section className="mt-5 rounded-card border border-border bg-white p-5 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{c.forecast}</h2>
          <p className="text-xs text-text-secondary">High / Low</p>
        </div>
        <div className="mt-5 grid grid-cols-5 gap-2 sm:gap-3">
          {forecast.map((day, index) => (
            <div
              className={`rounded-xl p-2 text-center sm:p-4 ${
                index === 0
                  ? 'bg-primary-50 ring-1 ring-primary/20'
                  : 'bg-surface-muted'
              }`}
              key={day.day}
            >
              <p className="text-xs font-medium text-text-secondary">
                {days[index]}
              </p>
              <p className="my-3 text-3xl">{day.icon}</p>
              <p className="text-base font-bold">{day.high}</p>
              <p className="mt-1 text-xs text-text-secondary">{day.low}</p>
              <p className="mt-3 text-[10px] font-medium text-info">
                {index > 1 ? 'Rain 45%' : 'Rain 20%'}
              </p>
            </div>
          ))}
        </div>
      </section>
    </Page>
  );
}

// Sub-component for individual weather metric items
function WeatherMetric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg bg-white/65 p-3">
      <Icon size={16} className="text-primary" />
      <p className="mt-2 text-[11px] text-text-secondary">{label}</p>
      <p className="mt-0.5 text-sm font-bold">{value}</p>
    </div>
  );
}

// Irrigation Schedule Page Component
export function Irrigation() {
  const { isHindi } = useLanguage();
  const c = isHindi
    ? [
        'सिंचाई सलाह',
        'गेहूं के खेत के लिए पानी की योजना बनाएं।',
        'वर्तमान मिट्टी की नमी',
        'कम',
        'लक्ष्य नमी:',
        'अगली सिंचाई',
        '2 दिन बाद',
        '21 मई 2025 · सुबह जल्दी',
        'रिमाइंडर लगाएं',
        'सिंचाई कार्यक्रम',
        'गेहूं का खेत',
        'आलू का खेत',
        'सरसों का खेत',
        'आज',
        'लीटर/एकड़',
      ]
    : [
        'Irrigation',
        'Plan water use for Wheat Field.',
        'Current soil moisture',
        'Low',
        'Target moisture:',
        'Next irrigation',
        'In 2 Days',
        '21 May 2025 · Early morning',
        'Set reminder',
        'Irrigation schedule',
        'Wheat Field',
        'Potato Patch',
        'Mustard Plot',
        'Today',
        'litres/acre',
      ];

  return (
    <Page title={c[0]} subtitle={c[1]}>
      {/* Current soil moisture status & next irrigation timing cards */}
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Card>
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-blue-50 p-3 text-info">
              <Droplets size={25} />
            </span>
            <div>
              <p className="text-sm text-text-secondary">{c[2]}</p>
              <p className="text-3xl font-bold text-info">
                28% <span className="text-sm text-danger">{c[3]}</span>
              </p>
            </div>
          </div>
          <div className="mt-6 h-4 overflow-hidden rounded-full bg-surface-muted">
            <div className="h-full w-[28%] rounded-full bg-info" />
          </div>
          <p className="mt-4 text-sm text-text-secondary">
            {c[4]} <b className="text-text-primary">50–60%</b>
          </p>
        </Card>

        <Card>
          <p className="flex items-center gap-2 text-sm font-bold">
            <CalendarDays size={18} className="text-primary" />
            {c[5]}
          </p>
          <p className="mt-4 text-4xl font-bold text-primary-dark">{c[6]}</p>
          <p className="mt-1 text-sm text-text-secondary">{c[7]}</p>
          <button className="mt-5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white">
            {c[8]}
          </button>
        </Card>
      </div>

      {/* Comprehensive irrigation schedule table */}
      <Card className="mt-5">
        <h2 className="font-bold">{c[9]}</h2>
        <div className="mt-4 divide-y divide-border text-sm">
          {[
            [c[10], '21 May 2025', `25,000 ${c[14]}`],
            [c[11], c[13], `18,000 ${c[14]}`],
            [c[12], '24 May 2025', `15,000 ${c[14]}`],
          ].map((x) => (
            <div className="grid grid-cols-3 py-4" key={x[0]}>
              <b>{x[0]}</b>
              <span className="text-text-secondary">{x[1]}</span>
              <span className="text-right text-text-secondary">{x[2]}</span>
            </div>
          ))}
        </div>
      </Card>
    </Page>
  );
}

// Market Prices Page Component
export function MarketPrices() {
  const { isHindi } = useLanguage();
  const copy = isHindi
    ? {
        title: 'बाजार भाव',
        subtitle: 'इंदौर के पास गेहूं के ताज़ा भाव और रुझान।',
        crop: 'गेहूं',
        unit: '₹ / क्विंटल',
        today: 'आज का भाव',
        change: 'कल से',
        updated: 'आज, 10:30 AM को अपडेट',
        compare: 'मंडियों की तुलना करें',
        nearby: 'आस-पास की मंडियां',
        rate: 'भाव',
        arrival: 'आवक',
        trend: '7 दिन का भाव रुझान',
        high: 'साप्ताहिक उच्च',
        low: 'साप्ताहिक निम्न',
        insight:
          'भाव लगातार बढ़ रहा है। यदि भंडारण की सुविधा है, तो 2–3 दिन इंतजार करने पर बेहतर भाव मिल सकता है।',
        view: 'मंडी विवरण देखें',
      }
    : {
        title: 'Market prices',
        subtitle: 'Latest wheat prices and trends near Indore.',
        crop: 'Wheat',
        unit: '₹ / quintal',
        today: "Today's price",
        change: 'vs. yesterday',
        updated: 'Updated today at 10:30 AM',
        compare: 'Compare mandis',
        nearby: 'Nearby mandis',
        rate: 'Price',
        arrival: 'Arrival',
        trend: '7-day price trend',
        high: 'Week high',
        low: 'Week low',
        insight:
          'Prices have moved up steadily. If you can store safely, waiting 2–3 days may help you get a better rate.',
        view: 'View mandi details',
      };

  const mandis = [
    ['Indore Mandi', '₹ 2,125', '+2.35%', '1,240 qtl', true],
    ['Ujjain Mandi', '₹ 2,150', '+2.60%', '860 qtl'],
    ['Dewas Mandi', '₹ 2,080', '+1.85%', '1,010 qtl'],
    ['Mhow Mandi', '₹ 2,050', '+1.20%', '720 qtl'],
  ];

  const points = '0,111 58,96 116,104 174,76 232,82 290,54 348,38 406,17';

  return (
    <Page title={copy.title} subtitle={copy.subtitle}>
      {/* Location selector and crop dropdown bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <MapPin size={16} className="text-primary" />
          Indore, Madhya Pradesh
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium hover:border-primary">
          <span>{copy.crop}</span>
          <ChevronDown size={16} />
        </button>
      </div>

      {/* Today's price card and 7-day trend chart */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,1fr)]">
        <Card className="border-primary/15 bg-[linear-gradient(115deg,#f1f8f2_0%,#fff_60%)] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-text-secondary">
                {copy.today}
              </p>
              <div className="mt-2 flex items-end gap-3">
                <p className="text-4xl font-bold tracking-tight text-text-primary">
                  ₹ 2,125
                </p>
                <p className="pb-1 text-sm text-text-secondary">{copy.unit}</p>
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary">
                <TrendingUp size={14} />
                +2.35%{' '}
                <span className="font-normal text-text-secondary">
                  {copy.change}
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-primary/15 bg-white px-4 py-3 text-right">
              <p className="text-xs text-text-muted">{copy.high}</p>
              <p className="mt-1 font-bold">₹ 2,150</p>
              <p className="mt-3 text-xs text-text-muted">{copy.low}</p>
              <p className="mt-1 font-bold">₹ 2,050</p>
            </div>
          </div>
          <p className="mt-5 text-xs text-text-muted">{copy.updated}</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{copy.trend}</h2>
            <span className="rounded-md bg-primary-50 px-2 py-1 text-xs font-semibold text-primary">
              +₹49 this week
            </span>
          </div>
          <div className="mt-4 h-28">
            <svg
              className="h-full w-full overflow-visible"
              viewBox="0 0 406 128"
              preserveAspectRatio="none"
              aria-label="Wheat price trend rising over seven days"
              role="img"
            >
              <defs>
                <linearGradient id="marketFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#2E7D32" stopOpacity=".18" />
                  <stop offset="100%" stopColor="#2E7D32" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={`M ${points} L 406,128 L 0,128 Z`}
                fill="url(#marketFill)"
              />
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
          <div className="flex justify-between text-[11px] text-text-muted">
            <span>13 May</span>
            <span>16 May</span>
            <span>19 May</span>
          </div>
        </Card>
      </div>

      {/* Nearby mandis price table and market insights card */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,1fr)]">
        <Card className="p-0">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="font-semibold">{copy.nearby}</h2>
            <button className="text-sm font-medium text-primary hover:underline">
              {copy.compare}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-y border-border bg-surface-muted text-xs text-text-secondary">
                <tr>
                  <th className="px-5 py-3 font-medium">Mandi</th>
                  <th className="px-4 py-3 font-medium">{copy.rate}</th>
                  <th className="px-4 py-3 font-medium">Change</th>
                  <th className="px-5 py-3 text-right font-medium">
                    {copy.arrival}
                  </th>
                </tr>
              </thead>
              <tbody>
                {mandis.map(([name, price, change, arrival, selected]) => (
                  <tr className="border-b border-border last:border-0" key={name}>
                    <td className="px-5 py-4 font-medium">
                      {name}
                      {selected && (
                        <span className="ml-2 rounded bg-primary-50 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          Selected
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 font-semibold">{price}</td>
                    <td className="px-4 py-4 text-primary">
                      <span className="inline-flex items-center gap-1">
                        <TrendingUp size={14} />
                        {change}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-text-secondary">
                      {arrival}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <aside className="rounded-card border border-amber-200 bg-amber-50 p-5">
          <div className="flex gap-2">
            <CircleHelp size={18} className="mt-0.5 shrink-0 text-amber-700" />
            <div>
              <p className="font-semibold text-amber-950">Market insight</p>
              <p className="mt-2 text-sm leading-6 text-amber-900">
                {copy.insight}
              </p>
              <button className="mt-4 text-sm font-semibold text-amber-800 hover:underline">
                {copy.view} →
              </button>
            </div>
          </div>
        </aside>
      </div>
    </Page>
  );
}

// Reports Page Component
export function Reports() {
  const { isHindi } = useLanguage();
  const c = isHindi
    ? [
        'रिपोर्ट',
        'आपके खेत का सारांश यहां दिखाई देगा।',
        'मई 2025 फार्म रिपोर्ट',
        'फसल स्वास्थ्य, पानी उपयोग और बाजार सारांश।',
        'रिपोर्ट बनाएं',
      ]
    : [
        'Reports',
        'Your farm summary will appear here.',
        'May 2025 Farm Report',
        'Crop health, water use, and market summary.',
        'Generate report',
      ];

  return (
    <Page title={c[0]} subtitle={c[1]}>
      <Card>
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-primary-50 p-3 text-primary">
            <Sprout size={24} />
          </span>
          <div>
            <h2 className="font-bold">{c[2]}</h2>
            <p className="text-sm text-text-secondary">{c[3]}</p>
          </div>
        </div>
        <button className="mt-5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white">
          {c[4]}
        </button>
      </Card>
    </Page>
  );
}

// Reusable standard page wrapper layout component
function Page({ title, subtitle, children }) {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}
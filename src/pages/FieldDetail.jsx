import {
  CalendarDays,
  ChevronLeft,
  Droplets,
  Sprout,
  TriangleAlert,
  Wheat,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { fields, localizeField } from '../data/fields.js';
import { useLanguage } from '../hooks/useLanguage.jsx';

// Static timeline stages for English and Hindi views
const enTimeline = [
  ['Sowing', '15 Nov', true],
  ['Germination', '22 Nov', true],
  ['Tillering', '10 Dec', true],
  ['Stem Extension', '05 Jan', true],
  ['Heading', '20 Jan', true],
  ['Grain Filling', '10 Feb', true],
  ['Harvest', '20 Mar', false],
];

const hiTimeline = [
  ['बुवाई', '15 नव.', true],
  ['अंकुरण', '22 नव.', true],
  ['कल्ले निकलना', '10 दिस.', true],
  ['तना वृद्धि', '05 जन.', true],
  ['बालियां आना', '20 जन.', true],
  ['दाना भराव', '10 फ़र.', true],
  ['कटाई', '20 मार्च', false],
];

export default function FieldDetail() {
  const { fieldId } = useParams();
  const { language } = useLanguage();
  const hi = language === 'hi';

  // Find the selected field data or fallback to the first item
  const source = fields.find((field) => field.id === fieldId) || fields[0];
  const current = localizeField(source, language);

  // Localized text copies for English and Hindi interfaces
  const text = hi
    ? {
        back: 'मेरी फसलें',
        details: 'खेत विवरण',
        sown: 'बुवाई',
        current: 'वर्तमान अवस्था',
        stage: 'दाना भराव',
        actions: 'सुझाए गए कार्य',
        actionList: [
          'अगले 2 दिनों में सिंचाई करें।',
          '20 किग्रा/एकड़ पोटाश उर्वरक डालें।',
          'पत्तियों पर रतुआ के लक्षण देखें।',
        ],
        progress: 'फसल प्रगति',
        complete: '60% पूर्ण',
        harvest: 'अनुमानित कटाई: 20 मार्च 2025',
        next: 'अगली सिंचाई',
        inDays: '2 दिन बाद',
        alert: 'खेत चेतावनी',
        alertText: `मिट्टी की नमी ${current.moisture}% है। सिंचाई से पहले पानी की उपलब्धता जांचें।`,
        yield: 'अनुमानित उपज',
        acre: 'प्रति एकड़',
        quintal: '22–25 क्विंटल',
      }
    : {
        back: 'My Fields',
        details: 'Field Details',
        sown: 'Sown',
        current: 'Current stage',
        stage: 'Grain Filling',
        actions: 'Recommended actions',
        actionList: [
          'Irrigate within the next 2 days.',
          'Apply potash fertiliser at 20 kg/acre.',
          'Monitor leaves for rust symptoms.',
        ],
        progress: 'Crop progress',
        complete: '60% complete',
        harvest: 'Expected harvest: 20 March 2025',
        next: 'Next irrigation',
        inDays: 'In 2 Days',
        alert: 'Field alert',
        alertText: `Soil moisture is ${current.moisture}%. Check water availability before irrigation.`,
        yield: 'Estimated yield',
        acre: 'per acre',
        quintal: '22–25 Quintal',
      };

  const timeline = hi ? hiTimeline : enTimeline;

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      {/* Back button navigation link */}
      <Link
        to="/fields"
        className="inline-flex items-center gap-1 text-sm font-medium text-text-secondary"
      >
        <ChevronLeft size={17} />
        {text.back}
      </Link>

      {/* Header section with field name, status badge, and details button */}
      <header className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{current.name}</h1>
            <span
              className={`rounded-full px-2 py-1 text-[10px] font-bold ${current.tone}`}
            >
              {current.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            {current.crop} · {current.area} · {text.sown} 15 Nov 2024
          </p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white">
          {text.details}
        </button>
      </header>

      {/* Main layout grid */}
      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_290px]">
        <section className="space-y-5">
          {/* Crop growth stage progress timeline card */}
          <div className="rounded-card border border-border bg-white p-5 shadow-card">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-primary-50 p-2 text-primary">
                <Wheat size={19} />
              </span>
              <div>
                <p className="text-xs text-text-secondary">{text.current}</p>
                <h2 className="font-bold">{text.stage}</h2>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <div className="flex min-w-[640px] items-start">
                {timeline.map(([stage, date, complete], i) => (
                  <div
                    className="relative flex flex-1 flex-col items-center text-center"
                    key={stage}
                  >
                    {i !== timeline.length - 1 && (
                      <div
                        className={`absolute left-1/2 top-3 h-1 w-full ${
                          complete ? 'bg-primary' : 'bg-border'
                        }`}
                      />
                    )}
                    <span
                      className={`relative z-10 grid size-7 place-items-center rounded-full border-4 border-white ${
                        complete
                          ? 'bg-primary text-white'
                          : 'bg-border text-text-muted'
                      }`}
                    >
                      {complete ? '✓' : i + 1}
                    </span>
                    <p
                      className={`mt-2 text-[11px] font-semibold ${
                        i === 5 ? 'text-primary' : 'text-text-secondary'
                      }`}
                    >
                      {stage}
                    </p>
                    <p className="mt-1 text-[10px] text-text-muted">{date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended actions and crop progress cards */}
          <div className="grid gap-5 md:grid-cols-2">
            <section className="rounded-card border border-border bg-white p-5 shadow-card">
              <h2 className="font-bold">{text.actions}</h2>
              <ul className="mt-4 space-y-3 text-sm text-text-secondary">
                {text.actionList.map((item) => (
                  <li className="flex gap-2" key={item}>
                    <span className="text-primary">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-card border border-border bg-white p-5 shadow-card">
              <h2 className="font-bold">{text.progress}</h2>
              <div className="mt-5 h-3 rounded-full bg-surface-muted">
                <div className="h-full w-3/5 rounded-full bg-primary" />
              </div>
              <div className="mt-2 flex justify-between text-xs text-text-secondary">
                <span>{text.stage}</span>
                <b>{text.complete}</b>
              </div>
              <div className="mt-5 flex items-center gap-2 rounded-lg bg-primary-50 p-3 text-xs text-primary">
                <CalendarDays size={16} />
                {text.harvest}
              </div>
            </section>
          </div>
        </section>

        {/* Sidebar widgets for irrigation, alerts, and estimated yield */}
        <aside className="space-y-4">
          <div className="rounded-card border border-border bg-white p-5 shadow-card">
            <p className="text-xs text-text-secondary">{text.next}</p>
            <p className="mt-2 text-2xl font-bold">{text.inDays}</p>
            <p className="mt-1 text-xs text-text-secondary">21 May 2025</p>
            <span className="mt-4 grid size-10 place-items-center rounded-full bg-blue-50 text-info">
              <Droplets size={20} />
            </span>
          </div>

          <div className="rounded-card border border-amber-200 bg-amber-50 p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-amber-900">
              <TriangleAlert size={17} />
              {text.alert}
            </p>
            <p className="mt-2 text-xs leading-5 text-amber-800">
              {text.alertText}
            </p>
          </div>

          <div className="rounded-card border border-border bg-white p-5 shadow-card">
            <p className="flex items-center gap-2 text-sm font-bold">
              <Sprout size={17} className="text-primary" />
              {text.yield}
            </p>
            <p className="mt-3 text-xl font-bold text-primary-dark">
              {text.quintal}
            </p>
            <p className="text-xs text-text-secondary">{text.acre}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
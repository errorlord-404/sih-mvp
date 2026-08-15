import { useState } from 'react';
import {
  Camera,
  CheckCircle2,
  ChevronRight,
  ScanSearch,
  Sprout,
  TriangleAlert,
  Upload,
  Wheat,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fields } from '../data/fields.js';
import { useLanguage } from '../hooks/useLanguage.jsx';

// Reusable card container component
const Card = ({ children, className = '' }) => (
  <section
    className={`rounded-card border border-border bg-white p-5 shadow-card ${className}`}
  >
    {children}
  </section>
);

// Reusable page wrapper component with language-aware title translation support
const Page = ({ title, subtitle, children }) => {
  const { isHindi } = useLanguage();
  const copy = {
    'Pest & Disease': ['कीट रोग पहचान', 'अपनी फसल में सामान्य कीट और रोग जांचें।'],
    'Crop Guide': ['फसल सलाह', 'गेहूं के लिए अवस्था-वार सलाह।'],
    'My Farm Map': ['मेरा फार्म मैप', 'एक ही जगह पर हर खेत की स्थिति देखें।'],
  };
  const value = isHindi && copy[title] ? copy[title] : [title, subtitle];

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <h1 className="text-2xl font-bold">{value[0]}</h1>
      <p className="mt-1 text-sm text-text-secondary">{value[1]}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
};

// Farm Map Page Component: Supports switching between interactive map and list views
export function FarmMap() {
  const [selected, setSelected] = useState(fields[0]);
  const [mode, setMode] = useState('map');

  return (
    <Page
      title="My Farm Map"
      subtitle="View the status of every field in one place."
    >
      {/* View Mode Toggle Bar */}
      <div className="mb-5 inline-flex rounded-lg bg-surface-muted p-1">
        <button
          onClick={() => setMode('map')}
          className={`rounded-md px-4 py-2 text-xs font-semibold ${
            mode === 'map' ? 'bg-primary text-white' : 'text-text-secondary'
          }`}
        >
          Map View
        </button>
        <button
          onClick={() => setMode('list')}
          className={`rounded-md px-4 py-2 text-xs font-semibold ${
            mode === 'list' ? 'bg-primary text-white' : 'text-text-secondary'
          }`}
        >
          List View
        </button>
      </div>

      {mode === 'map' ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          {/* Interactive Farm Map Layout */}
          <div className="relative min-h-[430px] overflow-hidden rounded-card border border-border bg-[linear-gradient(135deg,#6a7a39_0%,#839847_35%,#d9ca6e_35%,#b88d42_60%,#6a8038_60%,#97a94b_100%)] shadow-card">
            <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(45deg,transparent_48%,white_49%,transparent_51%)] [background-size:95px_95px]" />
            {fields.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                style={{
                  left: ['22%', '57%', '38%'][index],
                  top: ['20%', '42%', '67%'][index],
                }}
                className={`absolute grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[38%] border-2 border-white/80 text-center text-white shadow-lg transition hover:scale-105 ${
                  item.id === selected.id ? 'ring-4 ring-white/60' : ''
                } ${index === 1 ? 'bg-warning/90' : 'bg-primary/90'}`}
              >
                <span>
                  <b className="block text-lg">{index + 1}</b>
                  <span className="text-[10px]">{item.crop}</span>
                </span>
              </button>
            ))}
            <p className="absolute bottom-4 left-4 rounded-lg bg-black/45 px-3 py-2 text-xs text-white">
              Illustrative farm layout · click a field
            </p>
          </div>
          <FieldInfo field={selected} />
        </div>
      ) : (
        /* List View Grid of Fields */
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {fields.map((item) => (
            <button
              className="rounded-card border border-border bg-white p-5 text-left shadow-card hover:border-primary"
              onClick={() => {
                setSelected(item);
                setMode('map');
              }}
              key={item.id}
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {item.crop} · {item.area}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-bold ${item.tone}`}
                >
                  {item.status}
                </span>
              </div>
              <p className="mt-5 text-sm font-semibold text-primary-dark">
                {item.stage}
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                Moisture: {item.moisture}%
              </p>
            </button>
          ))}
        </div>
      )}
    </Page>
  );
}

// Sidebar widget displaying detailed stats for the selected field on the map
function FieldInfo({ field }) {
  return (
    <Card>
      <span className="grid size-10 place-items-center rounded-xl bg-primary-50 text-primary">
        <Wheat size={21} />
      </span>
      <h2 className="mt-4 text-lg font-bold">{field.name}</h2>
      <p className="mt-1 text-sm text-text-secondary">
        {field.crop} · {field.area}
      </p>
      <span
        className={`mt-4 inline-block rounded-full px-2 py-1 text-[10px] font-bold ${field.tone}`}
      >
        {field.status}
      </span>
      <div className="mt-5 space-y-3 border-y border-border py-4 text-sm">
        <p className="flex justify-between">
          <span className="text-text-secondary">Growth stage</span>
          <b>{field.stage}</b>
        </p>
        <p className="flex justify-between">
          <span className="text-text-secondary">Soil moisture</span>
          <b>{field.moisture}%</b>
        </p>
      </div>
      <Link
        to={`/fields/${field.id}`}
        className="mt-5 flex items-center justify-between rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-white"
      >
        View field details <ChevronRight size={15} />
      </Link>
    </Card>
  );
}

// Pest & Disease Detection Page Component: Allows photo uploads and analysis simulation
export function PestDisease() {
  const [analysed, setAnalysed] = useState(false);

  return (
    <Page
      title="Pest & Disease"
      subtitle="Check your crop for common pests and diseases."
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        {/* Upload box */}
        <Card>
          <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary-light bg-primary-50 p-6 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-white text-primary shadow-card">
              <Camera size={26} />
            </span>
            <h2 className="mt-4 font-bold">Upload a crop photo</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">
              Take a clear photo of the affected leaf or plant. We will identify
              visible symptoms.
            </p>
            <button
              onClick={() => setAnalysed(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Upload size={16} />
              Choose photo
            </button>
            <p className="mt-3 text-[11px] text-text-muted">
              JPG or PNG · frontend demo only
            </p>
          </div>
        </Card>

        {/* Photo guidelines card */}
        <Card>
          <h2 className="font-bold">Photo tips</h2>
          <ul className="mt-4 space-y-4 text-sm text-text-secondary">
            <li className="flex gap-2">
              <CheckCircle2 size={17} className="shrink-0 text-primary" />
              Use natural daylight.
            </li>
            <li className="flex gap-2">
              <CheckCircle2 size={17} className="shrink-0 text-primary" />
              Keep the affected area in focus.
            </li>
            <li className="flex gap-2">
              <CheckCircle2 size={17} className="shrink-0 text-primary" />
              Include leaf edges and both sides if possible.
            </li>
          </ul>
        </Card>
      </div>

      {/* Analysis result card (visible after clicking upload simulation) */}
      {analysed && (
        <Card className="mt-5 border-amber-200">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold">
                <ScanSearch size={18} className="text-primary" />
                Analysis result
              </p>
              <h2 className="mt-4 text-xl font-bold text-amber-800">
                Possible aphid infestation
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                Small clusters of sap-sucking insects are visible. Risk level is
                medium; inspect nearby plants before treating.
              </p>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
              Medium risk
            </span>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <Tip title="Inspect" text="Check the underside of leaves." />
            <Tip
              title="First response"
              text="Use neem oil spray in early morning."
            />
            <Tip title="Escalate" text="Seek local advice if it spreads." />
          </div>
        </Card>
      )}
    </Page>
  );
}

// Reusable tip sub-component for pest analysis results
function Tip({ title, text }) {
  return (
    <div className="rounded-xl bg-surface-muted p-4">
      <p className="font-bold text-primary-dark">{title}</p>
      <p className="mt-1 text-xs leading-5 text-text-secondary">{text}</p>
    </div>
  );
}

// Crop Guide Page Component: Provides stage-wise guidance for wheat farming
export function CropGuide() {
  const { isHindi } = useLanguage();
  const text = isHindi
    ? {
        stages: [
          ['भूमि तैयारी', 'जल निकास वाली भुरभुरी और समतल मिट्टी तैयार करें।'],
          ['बुवाई', 'स्वस्थ प्रमाणित गेहूं के बीज उपयोग करें।'],
          ['कल्ले निकलना', 'नमी बनाए रखें और नाइट्रोजन की पहली खुराक दें।'],
          ['दाना भराव', 'समय पर सिंचाई करें और रतुआ पर नजर रखें।'],
          ['कटाई', 'दाने सख्त और सुनहरे होने पर कटाई करें।'],
        ],
        plan: 'गेहूं फसल योजना',
        progress: 'दाना भराव जारी है',
        intro:
          'मिट्टी में नमी बनाए रखें और सप्ताह में दो बार पत्तियों पर रतुआ के लक्षण देखें।',
        stage: 'अवस्था 4 / 5',
        sowing: 'बुवाई',
        harvest: 'कटाई',
        field: 'गेहूं का खेत',
        rabi: 'रबी फसल · 120–150 दिन',
        current: 'वर्तमान अवस्था',
        filling: 'दाना भराव',
        size: 'खेत का आकार',
        warning: 'अगली सिंचाई से पहले पत्ती रतुआ की जांच करें।',
        currentBadge: 'वर्तमान अवस्था',
        monitor: 'पत्ती रतुआ की निगरानी करें और सिंचाई की योजना बनाएं।',
      }
    : {
        stages: [
          ['Land preparation', 'Prepare fine, level soil with good drainage.'],
          ['Sowing', 'Use healthy certified wheat seeds.'],
          ['Tillering', 'Maintain moisture and add first nitrogen dose.'],
          ['Grain Filling', 'Keep irrigation timely and watch for rust.'],
          ['Harvest', 'Harvest when grains are hard and golden.'],
        ],
        plan: 'Wheat crop plan',
        progress: 'Grain filling is in progress',
        intro:
          'Keep moisture steady and inspect leaves twice a week for rust symptoms.',
        stage: 'Stage 4 of 5',
        sowing: 'Sowing',
        harvest: 'Harvest',
        field: 'Wheat field',
        rabi: 'Rabi crop · 120–150 days',
        current: 'Current stage',
        filling: 'Grain Filling',
        size: 'Field size',
        warning: 'Check for leaf rust before the next irrigation.',
        currentBadge: 'Current stage',
        monitor: 'Monitor for leaf rust and plan irrigation.',
      };

  const stages = text.stages;

  return (
    <Page title="Crop Guide" subtitle="Stage-wise guidance for Wheat.">
      {/* Top progress overview banner */}
      <div className="rounded-card border border-primary/20 bg-[linear-gradient(110deg,#eef8f0,#fff)] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-white">
              <Wheat size={23} />
            </span>
            <div>
              <p className="text-sm font-semibold text-primary">{text.plan}</p>
              <h2 className="mt-1 text-xl font-bold">{text.progress}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                {text.intro}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-primary shadow-sm">
            {text.stage}
          </span>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white">
          <div className="h-full w-4/5 rounded-full bg-primary" />
        </div>
        <div className="mt-2 flex justify-between text-xs text-text-secondary">
          <span>{text.sowing}</span>
          <span>{text.harvest}</span>
        </div>
      </div>

      {/* Stage-wise timeline grid layout */}
      <div className="mt-5 grid gap-5 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit border-primary/15">
          <span className="grid size-11 place-items-center rounded-xl bg-primary-50 text-primary">
            <Sprout size={23} />
          </span>
          <h2 className="mt-4 font-bold">{text.field}</h2>
          <p className="mt-1 text-sm text-text-secondary">{text.rabi}</p>
          <div className="mt-5 space-y-3 border-t border-border pt-4 text-sm">
            <p className="flex justify-between gap-3">
              <span className="text-text-secondary">{text.current}</span>
              <b className="text-right text-primary-dark">{text.filling}</b>
            </p>
            <p className="flex justify-between gap-3">
              <span className="text-text-secondary">{text.size}</span>
              <b>{isHindi ? '2.5 एकड़' : '2.5 Acres'}</b>
            </p>
          </div>
          <div className="mt-5 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">
            <TriangleAlert size={15} className="mr-1 inline text-amber-700" />
            {text.warning}
          </div>
        </Card>

        {/* Vertical step-by-step timeline list */}
        <div className="relative space-y-3 before:absolute before:bottom-8 before:left-6 before:top-8 before:w-px before:bg-border">
          {stages.map(([stage, description], i) => {
            const current = i === 3;
            const complete = i < 3;
            return (
              <Card
                key={stage}
                className={`relative flex gap-4 ${
                  current ? 'border-primary bg-primary-50 shadow-sm' : ''
                }`}
              >
                <span
                  className={`relative z-10 grid size-12 shrink-0 place-items-center rounded-full border-4 border-white text-sm font-bold ${
                    current
                      ? 'bg-primary text-white'
                      : complete
                        ? 'bg-primary-50 text-primary'
                        : 'bg-surface-muted text-text-secondary'
                  }`}
                >
                  {complete ? '✓' : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold">{stage}</h2>
                    {current && (
                      <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-primary">
                        {text.currentBadge}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm leading-6 text-text-secondary">
                    {description}
                  </p>
                  {current && (
                    <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-primary">
                      <TriangleAlert size={14} />
                      {text.monitor}
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </Page>
  );
}
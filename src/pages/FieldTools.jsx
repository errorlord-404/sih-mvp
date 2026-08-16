import { useState, useRef } from 'react';
import {
  Activity,
  AlertTriangle,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Eye,
  Filter,
  Info,
  Layers,
  MapPin,
  Plus,
  RefreshCw,
  Scan,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sprout,
  Tag,
  TriangleAlert,
  Upload,
  Volume2,
  Wheat,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fields, localizeField } from '../data/fields.js';
import { useLanguage } from '../hooks/useLanguage.jsx';
import { farmImages } from '../data/images.js';



// Reusable card container component
const Card = ({ children, className = '' }) => (
  <section
    className={`rounded-2xl border border-border bg-white p-5 shadow-card transition hover:border-primary/40 ${className}`}
  >
    {children}
  </section>
);

// Reusable page wrapper component with language-aware title translation support
const Page = ({ title, subtitle, children }) => {
  const { language } = useLanguage();
  const mr = language === 'mr';
  const hi = language === 'hi';

  const copyHi = {
    'Pest & Disease': ['कीट रोग पहचान (AI Vision)', 'YOLOv11x मॉडल द्वारा फोटो से कीट एवं रोगों की सटीक पहचान एवं उपचार।'],
    'Crop Guide': ['फसल सलाह', 'गेहूं व अन्य फसलों के लिए अवस्था-वार सम्पूर्ण कृषि सलाह।'],
    'My Farm Map': ['मेरा फार्म मैप (GIS)', 'सैटेलाइट व्यू में खेतों की सीमा, नमी और स्वास्थ्य स्थिति।'],
  };

  const copyMr = {
    'Pest & Disease': ['कीड व रोग निदान (AI Vision)', 'YOLOv11x मॉडेलद्वारे फोटोवरून कीड व रोगांचे अचूक निदान आणि फवारणी सल्ला.'],
    'Crop Guide': ['पीक सल्ला', 'गहू व इतर पिकांसाठी टप्प्याटप्प्याने संपूर्ण मार्गदर्शन.'],
    'My Farm Map': ['माझा शेत नकाशा (GIS)', 'सॅटेलाइट दृश्यामध्ये शेताच्या सीमा, ओलावा आणि पिकांची स्थिती.'],
  };

  const value = mr && copyMr[title] ? copyMr[title] : hi && copyHi[title] ? copyHi[title] : [title, subtitle];

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <h1 className="text-2xl font-bold text-text-primary">{value[0]}</h1>
      <p className="mt-1 text-sm text-text-secondary">{value[1]}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
};


// ==========================================
// 1. FARM MAP COMPONENT (GIS / SATELLITE FIELD VIEW)
// ==========================================
export function FarmMap() {
  const { language } = useLanguage();
  const hi = language === 'hi';
  const [selected, setSelected] = useState(fields[0]);
  const [mode, setMode] = useState('map');
  const [filterLayer, setFilterLayer] = useState('moisture'); // moisture | health | crop

  const localizedFields = fields.map((f) => localizeField(f, language));
  const activeField = localizeField(selected, language);

  return (
    <Page
      title="My Farm Map"
      subtitle="View the status and GIS polygon boundaries of every field in one place."
    >
      {/* Top Bar: View Mode & Filter Layer */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl bg-surface-muted p-1 border border-border">
          <button
            onClick={() => setMode('map')}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
              mode === 'map' ? 'bg-primary text-white shadow-xs' : 'text-text-secondary'
            }`}
          >
            {hi ? 'मैप व्यू (सैटेलाइट)' : 'Map View (GIS)'}
          </button>
          <button
            onClick={() => setMode('list')}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
              mode === 'list' ? 'bg-primary text-white shadow-xs' : 'text-text-secondary'
            }`}
          >
            {hi ? 'सूची व्यू' : 'List View'}
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 rounded-xl border border-border bg-white px-4 py-2 text-xs font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
            <span className="text-text-secondary">{hi ? 'उत्तम (Good)' : 'Good'}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-amber-500 ring-2 ring-amber-200" />
            <span className="text-text-secondary">{hi ? 'ध्यान दें (Attention)' : 'Attention'}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-red-500 ring-2 ring-red-200" />
            <span className="text-text-secondary">{hi ? 'गंभीर (Critical)' : 'Critical'}</span>
          </span>
        </div>
      </div>

      {mode === 'map' ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Interactive GIS Satellite Canvas */}
          <div className="relative min-h-[480px] overflow-hidden rounded-2xl border border-border bg-slate-900 shadow-xl">
            {/* Satellite Terrain Texture Background */}
            <img
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80"
              alt="Satellite Farm Imagery"
              className="absolute inset-0 h-full w-full object-cover opacity-60 filter saturate-125"
            />
            
            {/* SVG Interactive Polygon Overlay */}
            <svg
              className="absolute inset-0 h-full w-full cursor-pointer"
              viewBox="0 0 800 500"
              preserveAspectRatio="none"
            >
              {/* Field 1: Wheat (Green Polygon) */}
              <polygon
                points="120,80 380,60 350,260 140,240"
                className={`transition-all duration-200 ${
                  selected.id === 'field-1'
                    ? 'fill-emerald-500/50 stroke-emerald-400 stroke-[4]'
                    : 'fill-emerald-500/30 stroke-emerald-400/80 stroke-[2] hover:fill-emerald-500/40'
                }`}
                onClick={() => setSelected(fields[0])}
              />

              {/* Field 2: Potato (Amber Polygon - Attention) */}
              <polygon
                points="420,70 720,100 680,310 400,280"
                className={`transition-all duration-200 ${
                  selected.id === 'field-2'
                    ? 'fill-amber-500/55 stroke-amber-400 stroke-[4]'
                    : 'fill-amber-500/35 stroke-amber-400/80 stroke-[2] hover:fill-amber-500/45'
                }`}
                onClick={() => setSelected(fields[1])}
              />

              {/* Field 3: Mustard (Green Polygon) */}
              <polygon
                points="160,280 480,310 440,460 180,440"
                className={`transition-all duration-200 ${
                  selected.id === 'field-3'
                    ? 'fill-emerald-500/50 stroke-emerald-400 stroke-[4]'
                    : 'fill-emerald-500/30 stroke-emerald-400/80 stroke-[2] hover:fill-emerald-500/40'
                }`}
                onClick={() => setSelected(fields[2])}
              />
            </svg>

            {/* Field Marker Badges */}
            {/* Field 1 Badge */}
            <div
              onClick={() => setSelected(fields[0])}
              className={`absolute left-[24%] top-[25%] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-xl px-3 py-2 text-center text-white backdrop-blur-md transition hover:scale-105 ${
                selected.id === 'field-1'
                  ? 'bg-emerald-800/90 ring-4 ring-white shadow-xl'
                  : 'bg-emerald-900/75 ring-1 ring-white/50'
              }`}
            >
              <span className="flex items-center justify-center size-6 rounded-full bg-white text-emerald-900 text-xs font-bold mx-auto mb-1">
                1
              </span>
              <p className="text-xs font-bold">{hi ? 'गेहूं (Wheat)' : 'Wheat'}</p>
              <p className="text-[10px] text-emerald-200">2.5 Acres · 28% Moist</p>
            </div>

            {/* Field 2 Badge (Attention) */}
            <div
              onClick={() => setSelected(fields[1])}
              className={`absolute left-[68%] top-[30%] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-xl px-3 py-2 text-center text-white backdrop-blur-md transition hover:scale-105 ${
                selected.id === 'field-2'
                  ? 'bg-amber-800/90 ring-4 ring-white shadow-xl'
                  : 'bg-amber-900/75 ring-1 ring-white/50'
              }`}
            >
              <span className="flex items-center justify-center size-6 rounded-full bg-white text-amber-900 text-xs font-bold mx-auto mb-1">
                2
              </span>
              <p className="text-xs font-bold">{hi ? 'आलू (Potato)' : 'Potato'}</p>
              <p className="text-[10px] text-amber-200">1.2 Acres · 41% Moist</p>
            </div>

            {/* Field 3 Badge */}
            <div
              onClick={() => setSelected(fields[2])}
              className={`absolute left-[38%] top-[72%] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-xl px-3 py-2 text-center text-white backdrop-blur-md transition hover:scale-105 ${
                selected.id === 'field-3'
                  ? 'bg-emerald-800/90 ring-4 ring-white shadow-xl'
                  : 'bg-emerald-900/75 ring-1 ring-white/50'
              }`}
            >
              <span className="flex items-center justify-center size-6 rounded-full bg-white text-emerald-900 text-xs font-bold mx-auto mb-1">
                3
              </span>
              <p className="text-xs font-bold">{hi ? 'सरसों (Mustard)' : 'Mustard'}</p>
              <p className="text-[10px] text-emerald-200">1.0 Acre · 32% Moist</p>
            </div>

            {/* Floating Alert Pill on Map */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl bg-black/75 p-3 text-white backdrop-blur-md sm:left-4 sm:right-auto sm:max-w-md">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-amber-500 text-black">
                  <TriangleAlert size={16} />
                </span>
                <div>
                  <p className="text-xs font-bold">
                    {hi ? 'खेत 2: सिंचाई की आवश्यकता है' : 'Field 2 needs irrigation'}
                  </p>
                  <p className="text-[11px] text-gray-300">
                    {hi ? 'नमी कम है (28%) · अगले 2 दिन में सींचें' : 'Soil moisture is low (28%)'}
                  </p>
                </div>
              </div>
              <Link
                to="/irrigation"
                className="ml-3 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-black hover:bg-gray-100"
              >
                {hi ? 'सुझाव' : 'Details'}
              </Link>
            </div>
          </div>

          {/* Right Sidebar: Selected Field Inspector */}
          <Card className="h-fit">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="grid size-10 place-items-center rounded-xl bg-primary-50 text-primary">
                  <Wheat size={20} />
                </span>
                <div>
                  <h2 className="font-bold text-base">{activeField.name}</h2>
                  <p className="text-xs text-text-secondary">
                    {activeField.crop} · {activeField.area}
                  </p>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${activeField.tone}`}>
                {activeField.status}
              </span>
            </div>

            <div className="mt-5 space-y-3 border-y border-border py-4 text-xs">
              <div className="flex justify-between">
                <span className="text-text-secondary">{hi ? 'विकास अवस्था' : 'Growth stage'}</span>
                <b className="font-bold text-primary-dark">{activeField.stage}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">{hi ? 'मिट्टी की नमी' : 'Soil moisture'}</span>
                <b className="font-bold text-info">{activeField.moisture}%</b>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">{hi ? 'अनुमानित पैदावार' : 'Estimated yield'}</span>
                <b className="font-bold">22–25 Qtl / Acre</b>
              </div>
            </div>

            <Link
              to={`/fields/${selected.id}`}
              className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-xs font-bold text-white hover:bg-primary-dark shadow-sm"
            >
              <span>{hi ? 'खेत का सम्पूर्ण टाइमलाइन देखें' : 'View Field Timeline'}</span>
              <ChevronRight size={15} />
            </Link>
          </Card>
        </div>
      ) : (
        /* List View Grid */
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {localizedFields.map((item) => (
            <div
              key={item.id}
              className="rounded-card border border-border bg-white p-5 shadow-card hover:border-primary cursor-pointer"
              onClick={() => {
                setSelected(fields.find((f) => f.id === item.id) || fields[0]);
                setMode('map');
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-base">{item.name}</h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {item.crop} · {item.area}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${item.tone}`}>
                  {item.status}
                </span>
              </div>
              <div className="mt-4 rounded-lg bg-surface-muted p-3">
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">{hi ? 'अवस्था:' : 'Stage:'}</span>
                  <b className="text-primary-dark">{item.stage}</b>
                </div>
                <div className="mt-2 flex justify-between text-xs">
                  <span className="text-text-secondary">{hi ? 'नमी:' : 'Moisture:'}</span>
                  <b className="text-info">{item.moisture}%</b>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}

// ==========================================
// 2. PEST & DISEASE PHOTO DIAGNOSIS COMPONENT
// ==========================================
export function PestDisease() {
  const { language } = useLanguage();
  const mr = language === 'mr';
  const hi = language === 'hi';


  const [analysing, setAnalysing] = useState(false);
  const [analysed, setAnalysed] = useState(true);
  const [selectedDisease, setSelectedDisease] = useState('rust');
  const [customImage, setCustomImage] = useState(null);
  const [taskAdded, setTaskAdded] = useState(false);
  const fileInputRef = useRef(null);

  const diseaseData = {
    rust: {
      name: mr ? 'गव्हावरील पिवळा / तपकिरी तांबेरा' : hi ? 'गेहूं का पीला रतुआ (Yellow Rust)' : 'Wheat Yellow / Brown Rust',
      scientific: 'Puccinia striiformis / Puccinia triticina',
      confidence: 94,
      severity: mr ? 'मध्यम प्रादुर्भाव (२५% पाने बाधित)' : hi ? 'मध्यम संक्रमण (25% पत्ती प्रभावित)' : 'Moderate (25% Foliage Affected)',
      severityBadge: 'bg-amber-100 text-amber-900 border-amber-300',
      image: 'https://images.unsplash.com/photo-1599818816949-a2e6f47f2015?auto=format&fit=crop&w=800&q=80',
      symptoms: mr
        ? [
            'पानांवर पिवळ्या-नारंगी रंगाचे बारीक पुरळ किंवा रेषा दिसणे',
            'पानांच्या शिरांच्या समांतर पिवळे पट्टे तयार होणे',
            'पाने अकाली वाळल्यामुळे दाण्यांचे वजन घटणे',
          ]
        : hi
        ? [
            'पत्तियों पर पीले-नारंगी रंग के चूर्णयुक्त छोटे-छोटे धब्बे',
            'पत्ती की नसों के समानांतर पीली धारियां बनना',
            'पत्तियों का समय से पहले सूखना जिससे दाने का भराव कम होता है',
          ]
        : [
            'Yellow-orange powdery pustules arranged in parallel stripes along leaf veins',
            'Chlorotic streaks surrounding the lesion clusters',
            'Premature foliar desiccation reducing photosynthetic capacity',
          ],
      chemical: {
        title: mr ? 'प्रोपिकोनाझोल २५% EC (टिल्ट)' : hi ? 'प्रोपिकोनाज़ोल 25% EC (टिल्ट)' : 'Propiconazole 25% EC (Tilt)',
        dosage: mr ? '१.० मिली प्रति लिटर पाणी (२०० मिली प्रति एकर)' : hi ? '1.0 मिली प्रति लीटर पानी (200 मिली प्रति एकड़)' : '1.0 ml per litre of water (200 ml / acre in 200L water)',
        timing: mr ? 'सकाळी ७ ते १० च्या दरम्यान शांत हवेत फवारणी करावी' : hi ? 'सुबह 7 से 10 बजे के बीच शांत मौसम में छिड़काव करें' : 'Spray during morning hours (7:00 AM – 10:00 AM)',
      },
      organic: {
        title: mr ? '५% निंबोळी अर्क + ट्रायकोडर्मा विरिडी' : hi ? '5% नीम बीज अर्क + ट्राइकोडर्मा विरिडी' : '5% Neem Seed Kernel Extract + Trichoderma viride',
        dosage: mr ? '५.० मिली निंबोळी अर्क + २ ग्रॅम ट्रायकोडर्मा प्रति लिटर' : hi ? '5.0 मिली नीम अर्क + 2 ग्राम ट्राइकोडर्मा प्रति लीटर' : '5.0 ml NSKE + 2g Trichoderma per litre of water',
      },
      advisory: mr
        ? 'हवामान सूचना: पुण्यात पुढील २४-३६ तासांत पावसाची शक्यता आहे. पावसामुळे औषध वाहून जाऊ नये म्हणून तत्काळ फवारणी पूर्ण करा.'
        : hi
        ? 'मौसम चेतावनी: पुणे में अगले 24-36 घंटों में बारिश की संभावना है। बारिश से पहले छिड़काव पूरा करें।'
        : 'Weather Alert: Rain forecasted in Pune in the next 24-36 hours. Complete spray application prior to showers.',
    },
    aphids: {
      name: mr ? 'मावा / तुडतुडे कीड (Aphid Infestation)' : hi ? 'माहू / एफिड कीट (Aphid Infestation)' : 'Aphid Colonization',
      scientific: 'Rhopalosiphum padi / Lipaphis erysimi',
      confidence: 91,
      severity: mr ? 'तीव्र प्रादुर्भाव (३५% कोंब बाधित)' : hi ? 'उच्च गंभीरता (35% तने पर कीट)' : 'High Severity (35% Shoot Density)',
      severityBadge: 'bg-red-100 text-red-900 border-red-300',
      image: 'https://images.unsplash.com/photo-1628170490378-d5677b102b48?auto=format&fit=crop&w=800&q=80',
      symptoms: mr
        ? [
            'कोवळ्या ओंब्या आणि पानांमधून रस शोषणाऱ्या लहान किडींचा पुंजका',
            'पानांची गुंडाळी होणे आणि चिकट द्रवाचा थर साचणे',
            'चिकट द्रवावर काळ्या बुरशीची (सूटी मोल्ड) वाढ',
          ]
        : hi
        ? [
            'कोमल बालियों व पत्तियों से रस चूसते हुए हरे-काले छोटे कीटों का समूह',
            'पत्तियों का मुड़ना और पौधों पर चिपचिपा स्राव',
            'चिपचिपे पदार्थ पर काली फफूंद (सूटी मोल्ड) का विकास',
          ]
        : [
            'Dense clusters of tiny sap-sucking insects on tender earheads and foliage',
            'Leaf curling, stunted growth, and honeydew secretions',
            'Development of black sooty mold over honeydew deposits',
          ],
      chemical: {
        title: mr ? 'इमिडाक्लोप्रिड १७.८% SL किंवा थायामेथोक्साम २५% WG' : hi ? 'इमिडाक्लोप्रिड 17.8% SL या थायमेथॉक्सम 25% WG' : 'Imidacloprid 17.8% SL or Thiamethoxam 25% WG',
        dosage: mr ? '०.५ मिली/लिटर (इमिडाक्लोप्रिड) किंवा ०.३ ग्रॅम/लिटर' : hi ? '0.5 मिली/लीटर (इमिडाक्लोप्रिड) या 0.3 ग्राम/लीटर' : '0.5 ml / Litre (Imidacloprid) or 0.3g / Litre (Thiamethoxam)',
        timing: mr ? 'मधमाशांच्या संरक्षणासाठी सकाळी लवकर किंवा संध्याकाळी फवारणी करा' : hi ? 'मधुमक्खियों की सुरक्षा हेतु सुबह जल्दी या शाम को छिड़कें' : 'Early morning or late evening to protect pollinating bees',
      },
      organic: {
        title: mr ? '५% निंबोळी अर्क + पिवळे चिकट सापळे (१० प्रति एकर)' : hi ? '5% नीम बीज अर्क + पीले चिपचिपे ट्रैप (10/एकड़)' : '5% Neem Seed Kernel Extract + Yellow Sticky Traps',
        dosage: mr ? '५० मिली निंबोळी अर्क प्रति लिटर + १० पिवळे सापळे प्रति एकर' : hi ? '50 मिली नीम काढ़ा प्रति लीटर + 10 ट्रैप प्रति एकड़' : '50 ml NSKE per litre of water + Install 10 yellow traps/acre',
      },
      advisory: mr
        ? 'कोरड्या व उष्ण हवामानात मावा किडीचा प्रसार झपाट्याने होतो. पुढील ४८ तासांत नियंत्रण करावे.'
        : hi
        ? 'गर्म और शुष्क मौसम में एफिड तेजी से बढ़ते हैं। 48 घंटे के भीतर नियंत्रण आवश्यक है।'
        : 'Dry and warm weather accelerates aphid reproduction. Initiate control within 48 hours.',
    },
    healthy: {
      name: mr ? 'निरोगी पीक पान (कोणताही रोग नाही)' : hi ? 'स्वस्थ फसल पत्ती (कोई रोग नहीं)' : 'Healthy Crop Leaf',
      scientific: 'Optimal Plant Foliage',
      confidence: 98,
      severity: mr ? 'उत्कृष्ट (०% रोग प्रमाण)' : hi ? 'उत्तम (0% रोग दर)' : 'Optimal (0% Disease Index)',
      severityBadge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80',
      symptoms: mr
        ? [
            'पानांवर एकसमान हिरवागार रंग आणि उत्तम हरितद्रव्य',
            'कोणतीही बुरशी, डाग किंवा कीड नाही',
            'सशक्त पेशी रचना आणि निरोगी वाढ',
          ]
        : hi
        ? [
            'पत्तियों पर एकसमान हरा रंग एवं उत्तम क्लोरोफिल',
            'कोई फफूंद, धब्बा या कीट संक्रमण नहीं',
            'मजबूत कोशिकाएं और स्वस्थ विकास',
          ]
        : [
            'Uniform vibrant green pigmentation with optimal chlorophyll levels',
            'No fungal pustules, necrotic spots, or insect infestation',
            'Robust vascular leaf veins and healthy turgid cell structure',
          ],
      chemical: {
        title: mr ? 'कोणत्याही रासायनिक औषधांची गरज नाही' : hi ? 'किसी रासायनिक कीटनाशक की आवश्यकता नहीं है' : 'No Chemical Spray Required',
        dosage: mr ? 'नियमित पाणी आणि संतुलित खतांचे व्यवस्थापन सुरू ठेवा.' : hi ? 'संतुलित पोषण एवं समय पर सिंचाई जारी रखें।' : 'Maintain regular scheduled irrigation and balanced NPK nutrition.',
        timing: mr ? 'दर ३-४ दिवसांनी शेताची नियमित पाहणी करा.' : hi ? 'हर 3-4 दिन में सामान्य निरीक्षण करते रहें।' : 'Continue routine field scouting every 3-4 days.',
      },
      organic: {
        title: mr ? 'प्रतिबंधक निंबोळी अर्क फवारणी' : hi ? 'प्रतिबंधात्मक हल्का नीम तेल छिड़काव' : 'Prophylactic Neem Oil Spray',
        dosage: mr ? '३.० मिली निंबोळी तेल प्रति लिटर पाणी' : hi ? '3.0 मिली नीम तेल प्रति लीटर पानी' : '3.0 ml Neem Oil (1500 PPM) / Litre of water',
      },
      advisory: mr
        ? 'पीक पूर्णपणे निरोगी आहे. आगामी २०-२१ मे च्या संभाव्य पावसासाठी शेतातील निचरा मोकळा ठेवा.'
        : hi
        ? 'फसल पूरी तरह स्वस्थ है। 20-21 मई की बारिश के लिए जल निकासी साफ रखें।'
        : 'Crop is in prime condition. Keep drainage furrows clear for upcoming 20-21 May rains.',
    },
  };

  const active = diseaseData[selectedDisease] || diseaseData.rust;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomImage(event.target.result);
      setSelectedDisease('rust');
      setAnalysing(true);
      setAnalysed(false);
      setTaskAdded(false);

      setTimeout(() => {
        setAnalysing(false);
        setAnalysed(true);
      }, 700);
    };
    reader.readAsDataURL(file);
  };

  const triggerSample = (key) => {
    setCustomImage(null);
    setSelectedDisease(key);
    setAnalysing(true);
    setAnalysed(false);
    setTaskAdded(false);

    setTimeout(() => {
      setAnalysing(false);
      setAnalysed(true);
    }, 500);
  };

  return (
    <Page
      title="Pest & Disease"
      subtitle="Diagnose crop issues from photos with instant treatment recommendations."
    >
      {/* 2-Column Grid: Upload/Samples on Left, Tips on Right */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Upload Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Camera size={18} className="text-primary" />
              <h3 className="font-bold text-sm text-text-primary">
                {mr ? 'पिकाचा फोटो घ्या किंवा निवडा' : hi ? 'फसल की फोटो लें या चुनें' : 'Capture or Upload Crop Photo'}
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-text-secondary">JPG / PNG / WEBP</span>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/40 bg-primary-50/40 p-5 text-center transition hover:border-primary hover:bg-primary-50/70"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <span className="grid size-12 place-items-center rounded-2xl bg-white text-primary shadow-xs">
              <Upload size={22} />
            </span>
            <p className="mt-3 text-xs font-bold text-text-primary">
              {mr ? 'कॅमेऱ्याने फोटो काढा किंवा फाइल निवडा' : hi ? 'कैमरा से फोटो खींचें या फाइल चुनें' : 'Click to Upload or Snap Photo'}
            </p>
            <p className="text-[11px] text-text-secondary mt-0.5">
              {mr
                ? 'पानांचा स्पष्ट फोटो काढून त्वरित निदान मिळवा'
                : hi
                ? 'पत्तियों का स्पष्ट फोटो लेकर तुरंत जांच परिणाम पाएं'
                : 'Upload clear photo of the infected leaf for instant diagnosis'}
            </p>
          </div>

          {/* Sample Selectors */}
          <div className="mt-5">
            <p className="text-xs font-bold text-text-primary mb-2.5">
              {mr ? 'किंवा नमुना निवडून तपासा:' : hi ? 'या नमूना चुनकर देखें:' : 'Or test with pre-loaded samples:'}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'rust', label: mr ? 'गहू तांबेरा' : hi ? 'गेहूं रतुआ' : 'Wheat Rust', icon: '🌾' },
                { key: 'aphids', label: mr ? 'मावा कीड' : hi ? 'माहू/एफिड' : 'Aphids', icon: '🪲' },
                { key: 'healthy', label: mr ? 'निरोगी पान' : hi ? 'स्वस्थ पत्ती' : 'Healthy Leaf', icon: '✨' },
              ].map((s) => (
                <button
                  key={s.key}
                  onClick={() => triggerSample(s.key)}
                  className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition ${
                    selectedDisease === s.key && !customImage
                      ? 'border-primary bg-primary-50 ring-2 ring-primary/30 font-bold'
                      : 'border-border bg-white hover:bg-surface-muted'
                  }`}
                >
                  <span className="text-xl mb-1">{s.icon}</span>
                  <span className="text-[10px] text-text-primary leading-tight line-clamp-1">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Guidelines Card */}
        <Card className="p-6">
          <h3 className="font-bold text-sm text-text-primary border-b border-border pb-3 flex items-center gap-2">
            <Info size={16} className="text-primary" />
            <span>{mr ? 'अचूक निदानासाठी मार्गदर्शक सूचना' : hi ? 'सटीक जांच के लिए दिशानिर्देश' : 'Photography Guidelines'}</span>
          </h3>
          <ul className="mt-4 space-y-3 text-xs text-text-secondary">
            <li className="flex gap-2.5 items-start">
              <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
              <span>
                {mr
                  ? 'नैसर्गिक सूर्यप्रकाशात पानाचा स्पष्ट आणि फोकस असलेला फोटो घ्या.'
                  : hi
                  ? 'प्राकृतिक दिन के उजाले में पत्ती का स्पष्ट फोटो लें।'
                  : 'Take photos under bright, diffused daylight for maximum clarity.'}
              </span>
            </li>
            <li className="flex gap-2.5 items-start">
              <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
              <span>
                {mr
                  ? 'रोगग्रस्त ठिपक्यांवर कॅमेरा किमान १०-१५ सेमी अंतरावर ठेवा.'
                  : hi
                  ? 'रोगग्रस्त हिस्से पर कैमरा 10-15 सेमी की दूरी पर रखें।'
                  : 'Keep camera 10–15 cm from the leaf to capture fine texture.'}
              </span>
            </li>
            <li className="flex gap-2.5 items-start">
              <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
              <span>
                {mr
                  ? 'पानावर थेट सावली किंवा जास्त चमक नसावी.'
                  : hi
                  ? 'पत्ती पर तेज धूप की चमक या सीधी छाया न पड़ने दें।'
                  : 'Avoid harsh direct shadows or excessive glare on the leaf surface.'}
              </span>
            </li>
          </ul>
        </Card>
      </div>

      {/* Progress */}
      {analysing && (
        <div className="mt-6 rounded-2xl border border-primary/30 bg-primary-50 p-6 text-center shadow-md animate-pulse">
          <div className="mx-auto flex max-w-sm flex-col items-center">
            <Scan size={32} className="text-primary animate-spin" />
            <h4 className="mt-3 text-sm font-bold text-primary-dark">
              {mr ? 'पिकाच्या फोटोचे विश्लेषण होत आहे...' : hi ? 'फसल की फोटो का विश्लेषण हो रहा है...' : 'Analyzing crop photo...'}
            </h4>
          </div>
        </div>
      )}

      {/* Result Card */}
      {analysed && !analysing && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-emerald-300 bg-white shadow-xl">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200 bg-[linear-gradient(110deg,#ecfdf5_0%,#f0fdf4_100%)] px-6 py-4">
            <div>
              <h3 className="text-sm font-bold text-emerald-950">
                {mr
                  ? `निदान निकाल (अचूकता: ${active.confidence}%)`
                  : hi
                  ? `जांच परिणाम (सटीकता: ${active.confidence}%)`
                  : `Diagnosis Result (Confidence: ${active.confidence}%)`}
              </h3>
              <p className="text-[11px] text-emerald-800 italic">{active.scientific}</p>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${active.severityBadge}`}>
              {active.severity}
            </span>
          </div>

          <div className="p-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
              {/* Left Column: Details & Remedies */}
              <div className="space-y-5">
                <div>
                  <h4 className="text-2xl font-bold text-text-primary">{active.name}</h4>
                </div>

                {/* Symptoms */}
                <div className="rounded-xl bg-surface-muted p-4 border border-border">
                  <p className="text-xs font-bold text-text-primary mb-2 flex items-center gap-1.5">
                    <Activity size={15} className="text-primary" />
                    <span>{mr ? 'ओळखलेली लक्षणे:' : hi ? 'पहचाने गए मुख्य लक्षण:' : 'Key Symptoms:'}</span>
                  </p>
                  <ul className="space-y-1.5 text-xs text-text-secondary">
                    {active.symptoms.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary font-bold mt-0.5">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Chemical vs Organic */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
                    <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wide">
                      🧪 {mr ? 'रासायनिक उपचार' : hi ? 'रासायनिक उपचार' : 'Chemical Treatment'}
                    </span>
                    <p className="mt-2 text-sm font-bold text-blue-950">{active.chemical.title}</p>
                    <div className="mt-2 space-y-1 text-xs text-blue-900">
                      <p>
                        <b>{mr ? 'मात्रा:' : hi ? 'मात्रा:' : 'Dosage:'}</b> {active.chemical.dosage}
                      </p>
                      <p className="text-[11px] text-blue-800">
                        <b>{mr ? 'वेळ:' : hi ? 'समय:' : 'Timing:'}</b> {active.chemical.timing}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                    <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide">
                      🌿 {mr ? 'जैविक / सेंद्रिय उपाय' : hi ? 'जैविक विकल्प' : 'Organic Remedy'}
                    </span>
                    <p className="mt-2 text-sm font-bold text-emerald-950">{active.organic.title}</p>
                    <p className="mt-2 text-xs text-emerald-900">
                      <b>{mr ? 'मात्रा:' : hi ? 'मात्रा:' : 'Dosage:'}</b> {active.organic.dosage}
                    </p>
                  </div>
                </div>

                {/* Advisory */}
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5">
                  <div className="flex items-start gap-2.5">
                    <TriangleAlert size={18} className="text-amber-800 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-950 font-medium leading-snug">{active.advisory}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setTaskAdded(true)}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold shadow-sm transition ${
                      taskAdded
                        ? 'bg-emerald-800 text-white'
                        : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                  >
                    {taskAdded ? <Check size={16} /> : <Plus size={16} />}
                    <span>
                      {taskAdded
                        ? mr
                          ? '✓ आजच्या कामात जोडले!'
                          : hi
                          ? '✓ आज के कार्यों में जोड़ा गया!'
                          : '✓ Added to Tasks!'
                        : mr
                        ? 'आजच्या कामात जोडा'
                        : hi
                        ? 'आज के कार्यों में जोड़ें'
                        : 'Add Spraying to Today Tasks'}
                    </span>
                  </button>

                  <Link
                    to="/ai"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-xs font-bold text-text-primary hover:bg-surface-muted transition"
                  >
                    <span>{mr ? 'AI मित्राला विचारा' : hi ? 'AI साथी से पूछें' : 'Ask AI Sathi'}</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Photo */}
              <div className="flex flex-col items-center">
                <div className="w-full overflow-hidden rounded-2xl border border-border bg-slate-100 shadow-md">
                  <img
                    src={customImage || active.image}
                    alt="Diagnosed crop leaf"
                    className="h-64 w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}


// ==========================================
// 3. CROP GUIDE STAGE-WISE TIMELINE COMPONENT
// ==========================================
export function CropGuide() {
  const { language } = useLanguage();
  const mr = language === 'mr';
  const hi = language === 'hi';

  const stages = [
    {
      stage: mr ? '१. जमीन तयार करणे (Land Prep)' : hi ? '1. भूमि तैयारी (Land Prep)' : '1. Land Preparation',
      desc: mr
        ? 'खोल नांगरट करून ढेकळे फोडा आणि जमीन सपाट करा. चांगले कुजलेले शेणखत (FYM) ४-५ टन प्रति एकर मिसळा.'
        : hi
        ? 'गहरी जुताई कर पाटा लगाएं, जल निकास सुनिश्चित करें। गोबर की सड़ी खाद (FYM) 4-5 टन/एकड़ मिलाएं।'
        : 'Deep ploughing followed by planking. Incorporate well-decomposed FYM at 4-5 tons/acre.',
      due: mr ? '१५ ऑक्टो – ०५ नोव्हें' : '15 Oct – 05 Nov',
      done: true,
    },
    {
      stage: mr ? '२. बियाणे पेरणी व बीजप्रक्रिया (Sowing)' : hi ? '2. बुवाई एवं बीजोपचार (Sowing)' : '2. Seed Sowing & Treatment',
      desc: mr
        ? 'प्रमाणित बियाणे (HD-2967 / GW-322) ४० किलो/एकर. पेरणीपूर्वी कार्बेन्डाझिम (२ ग्रॅम/किलो) बुरशीनाशकाची प्रक्रिया करा.'
        : hi
        ? 'प्रमाणित बीज (HD-2967 / GW-322) 40 किग्रा/एकड़। कार्बेन्डाजिम (2 ग्राम/किग्रा) से बीजोपचार करें।'
        : 'Certified seed (HD-2967) @ 40 kg/acre. Seed treatment with Carbendazim @ 2g/kg.',
      due: mr ? '१५ नोव्हेंबर २०२४' : '15 Nov 2024',
      done: true,
    },
    {
      stage: mr ? '३. फुटवे फुटणे / मुकुट मुळे अवस्था (Tillering)' : hi ? '3. कल्ले निकलना (Tillering)' : '3. Tillering Stage',
      desc: mr
        ? 'पहिले महत्त्वाचे पाणी (CRI अवस्था २१ व्या दिवशी). युरियाचा पहिला हप्ता (४० किलो/एकर) द्यावा.'
        : hi
        ? 'पहली सिंचाई (CRI अवस्था 21 दिन पर)। यूरिया की पहली खुराक (40 किग्रा/एकड़) डालें।'
        : 'First critical irrigation (CRI stage). Top-dress first dose of Urea @ 40 kg/acre.',
      due: mr ? '१० डिसेंबर २०२४' : '10 Dec 2024',
      done: true,
    },
    {
      stage: mr ? '४. दाणे भरणे अवस्था (Grain Filling) - सध्या सुरू' : hi ? '4. दाना भराव (Grain Filling) - वर्तमान' : '4. Grain Filling (Active)',
      desc: mr
        ? 'मातीत ओलावा टिकवून ठेवा. पोटॅश (MOP) चा वापर करा. पानांवरील पिवळ्या तांबेरा रोगावर नियमित लक्ष ठेवा.'
        : hi
        ? 'नमी बनाए रखें। पोटाश (MOP) का छिड़काव करें। पीला रतुआ (Yellow Rust) की नियमित निगरानी करें।'
        : 'Maintain adequate moisture. Apply MOP potash. Monitor closely for yellow rust symptoms.',
      due: mr ? '१० फेब्रु – २८ फेब्रु' : '10 Feb – 28 Feb',
      current: true,
    },
    {
      stage: mr ? '५. पक्वता व काढणी (Harvesting & Storage)' : hi ? '5. परिपक्वता एवं कटाई (Harvesting)' : '5. Harvesting & Storage',
      desc: mr
        ? 'दाणे कडक व सोनेरी झाल्यावर कंबाइन हार्वेस्टरने काढणी करावी. साठवणुकीसाठी दाण्यांमधील ओलावा १२% पेक्षा कमी असावा.'
        : hi
        ? 'दाने सख्त और सुनहरे होने पर कंबाइन हार्वेस्टर से कटाई करें। दानों में नमी 12% से कम रखें।'
        : 'Harvest when grains are hard and golden yellow. Ensure grain moisture is below 12% for storage.',
      due: mr ? '२० मार्च २०२५' : '20 March 2025',
      done: false,
    },
  ];

  return (
    <Page title="Crop Guide" subtitle="Comprehensive stage-wise management schedule for Wheat.">
      {/* Top Banner */}
      <div className="rounded-2xl border border-primary/20 bg-[linear-gradient(110deg,#eef9ef_0%,#ffffff_100%)] p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-xl bg-primary text-white shadow-xs">
              <Wheat size={24} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                {mr ? 'गहू पीक व्यवस्थापन वेळापत्रक (HD-2967)' : hi ? 'गेहूं फसल प्रबंधन योजना (HD-2967)' : 'Wheat Crop Lifecycle (HD-2967)'}
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                {mr ? 'रब्बी हंगाम · १२०-१३५ दिवस चक्र · एकूण २.५ एकर' : hi ? 'रबी सत्र · 120-135 दिन चक्र · कुल 2.5 एकड़' : 'Rabi Season · 120-135 Days Cycle · 2.5 Acres'}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-800 px-4 py-1 text-xs font-bold text-white shadow-xs">
            {mr ? 'टप्पा ४ / ५ (सध्या सुरू)' : hi ? 'अवस्था 4 / 5 (सक्रिय)' : 'Stage 4 of 5 (Active)'}
          </span>
        </div>

        <div className="mt-5 h-2.5 w-full rounded-full bg-surface-muted overflow-hidden">
          <div className="h-full w-4/5 rounded-full bg-primary" />
        </div>
      </div>

      {/* Vertical Stepper List */}
      <div className="mt-6 space-y-4">
        {stages.map((item, index) => (
          <div
            key={item.stage}
            className={`flex items-start gap-4 rounded-xl border p-5 transition shadow-card ${
              item.current
                ? 'border-primary bg-primary-50/60 ring-2 ring-primary/20'
                : 'border-border bg-white'
            }`}
          >
            <span
              className={`grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold ${
                item.done
                  ? 'bg-emerald-100 text-emerald-800'
                  : item.current
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              {item.done ? '✓' : index + 1}
            </span>

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold text-sm text-text-primary">{item.stage}</h3>
                <span className="rounded bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-text-secondary">
                  {item.due}
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-text-secondary">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
}
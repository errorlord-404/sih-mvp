import {
  ArrowRight,
  CalendarDays,
  CloudSun,
  Droplets,
  Leaf,
  MapPin,
  TrendingUp,
  TriangleAlert,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { farmer, field, forecast, quickActions } from '../data/dashboard.js';
import { useLanguage } from '../hooks/useLanguage.jsx';
import { farmImages } from '../data/images.js';

// Reusable card container component
function Card({ children, className = '' }) {
  return (
    <section
      className={`rounded-card border border-border bg-surface shadow-card ${className}`}
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
      className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-dark"
    >
      {children}
      <ArrowRight size={13} />
    </Link>
  );
}

// Reusable metric statistic widget component
function Stat({ icon: Icon, label, value, note }) {
  return (
    <Card className="p-4">
      <div className="flex justify-between">
        <div>
          <p className="text-xs font-medium text-text-secondary">{label}</p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
          <p className="mt-1 text-xs text-text-secondary">{note}</p>
        </div>
        <span className="h-fit rounded-xl bg-primary-50 p-3 text-primary">
          <Icon size={22} />
        </span>
      </div>
    </Card>
  );
}

// Custom AI mascot avatar illustration component
function KisanBot() {
  return (
    <div className="relative grid size-24 place-items-center">
      <div className="absolute inset-0 rounded-full bg-primary-50 ring-8 ring-white/80" />
      <div className="relative h-14 w-16 rounded-[22px] border-4 border-[#e7ede6] bg-[#2d5a27] shadow-lg">
        <span className="absolute left-3 top-5 size-2 rounded-full bg-[#65e59a] shadow-[0_0_8px_#65e59a]" />
        <span className="absolute right-3 top-5 size-2 rounded-full bg-[#65e59a] shadow-[0_0_8px_#65e59a]" />
        <span className="absolute left-1/2 top-2 h-1.5 w-5 -translate-x-1/2 rounded-full bg-[#a7d5a7]" />
        <span className="absolute -bottom-4 left-1/2 size-7 -translate-x-1/2 rounded-full border-4 border-[#e7ede6] bg-primary" />
      </div>
      <span className="absolute -right-1 -top-1 rounded-full bg-amber-300 px-1.5 py-0.5 text-[10px]">
        🌾
      </span>
    </div>
  );
}

// Field status card component showing crop progress and details
function FieldCard() {
  const { t, language } = useLanguage();
  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <img
          src={farmImages.wheat}
          alt="Wheat field"
          className="h-32 w-28 shrink-0 object-cover sm:h-auto sm:w-36"
        />
        <div className="flex-1 p-5">
          <div className="flex justify-between">
            <div>
              <h2 className="font-bold">{t('wheatField')}</h2>
              <p className="mt-1 text-xs text-text-secondary">
                {t('area')}: {language === 'hi' ? '2.5 एकड़' : field.area}
              </p>
              <p className="text-xs text-text-secondary">{t('sowing')}: 15 Nov 2024</p>
            </div>
          </div>
          <p className="mt-4 text-sm font-semibold text-primary-dark">
            {language === 'hi' ? 'गेहूं · दाना भराव' : 'Wheat · Grain Filling'}
          </p>
          <div className="mt-2 h-2 rounded-full bg-surface-muted">
            <div className="h-full w-3/5 rounded-full bg-primary" />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-text-secondary">
            <span>{t('cropProgress')}</span>
            <span>60%</span>
          </div>
          <div className="mt-4">
            <Go to="/fields/field-1">{t('fieldDetails')}</Go>
          </div>
        </div>
      </div>
    </Card>
  );
}

// AI Advisor summary card component with quick chat link
function Advisor() {
  const { t } = useLanguage();
  return (
    <Card className="relative overflow-hidden bg-[#f7fbf4] p-5">
      <div className="absolute -bottom-12 -right-12 size-52 rounded-full bg-primary-50" />
      <div className="relative max-w-[74%]">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-primary p-2 text-white">
            <Leaf size={16} />
          </span>
          <h2 className="font-bold text-primary-dark">{t('ai')}</h2>
        </div>
        <p className="mt-4 text-sm leading-6 text-text-secondary">
          {t('lowMoistureAdvice')}
        </p>
        <div className="mt-4">
          <Go to="/ai">{t('askAi')}</Go>
        </div>
      </div>
      <div className="absolute bottom-5 right-6">
        <KisanBot />
      </div>
    </Card>
  );
}

// Mobile dashboard layout view component
function Mobile() {
  const { t } = useLanguage();
  return (
    <div className="px-4 pt-5 lg:hidden">
      <h1 className="text-xl font-bold">{t('greetingMobile')} 👋</h1>
      <p className="mt-1 text-xs text-text-secondary">{t('smartFarming')}</p>

      {/* Weather widget card */}
      <Card className="mt-5">
        <div className="flex">
          <div className="flex-1 p-4">
            <p className="flex items-center gap-1 text-xs text-text-secondary">
              <MapPin size={13} />
              {farmer.location}
            </p>
            <p className="mt-4 text-3xl font-bold">28°C 🌤️</p>
            <p className="text-xs text-text-secondary">Sunny · H: 32°C · L: 22°C</p>
          </div>
          <div className="m-3 w-36 border-l border-border pl-4">
            <p className="text-xs font-bold">Today's Tip</p>
            <p className="mt-2 text-xs leading-5 text-text-secondary">
              Irrigate your wheat early morning for better growth.
            </p>
            <Go to="/irrigation">Learn more</Go>
          </div>
        </div>
      </Card>

      {/* Quick actions grid */}
      <h2 className="mt-6 text-sm font-bold">{t('quickActions')}</h2>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {quickActions.map((a) => (
          <Link
            key={a.label}
            to={a.to}
            className="rounded-xl border border-border bg-white p-3 text-center shadow-card"
          >
            <div className="text-2xl">{a.icon}</div>
            <p className="mt-1 text-[10px] font-medium">{a.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-5">
        <FieldCard />
      </div>
      <div className="mt-5">
        <Advisor />
      </div>

      {/* Moisture alert warning banner */}
      <Card className="mt-5 flex gap-3 border-amber-200 bg-amber-50 p-4">
        <TriangleAlert className="shrink-0 text-warning" />
        <div>
          <p className="text-sm font-bold text-amber-900">Attention needed</p>
          <p className="mt-1 text-xs text-amber-800">
            Field 2 soil moisture is low. Irrigation is recommended.
          </p>
        </div>
      </Card>
    </div>
  );
}

// Desktop dashboard layout view component
function Desktop() {
  const { t, language } = useLanguage();
  const hi = language === 'hi';
  const days = hi ? ['आज', 'सोम', 'मंगल', 'बुध', 'गुरु'] : forecast.map((x) => x.day);

  return (
    <div className="hidden max-w-[1440px] px-8 pt-7 lg:block">
      <h1 className="text-2xl font-bold">{t('greeting')} 🌾</h1>
      <p className="mt-1 text-sm text-text-secondary">{t('subtitle')}</p>

      {/* Top metrics summary grid */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <Stat
          icon={CloudSun}
          label={t('weatherLabel')}
          value="28°C"
          note={hi ? 'धूप · नमी: 45%' : 'Sunny · Humidity: 45%'}
        />
        <Stat
          icon={Droplets}
          label={t('soilMoisture')}
          value="28%"
          note={t('lowNeedsIrrigation')}
        />
        <Stat
          icon={CalendarDays}
          label={t('nextIrrigation')}
          value={t('inTwoDays')}
          note="21 May 2025"
        />
        <Stat
          icon={TrendingUp}
          label={t('marketPrice')}
          value="₹ 2,125"
          note="Indore Mandi · ▲ 2.35%"
        />
      </div>

      {/* Field card and AI advisor section */}
      <div className="mt-5 grid grid-cols-2 gap-5">
        <FieldCard />
        <Advisor />
      </div>

      {/* Soil health, weather forecast, and market prices cards */}
      <div className="mt-5 grid grid-cols-3 gap-5">
        <Card className="p-5">
          <h2 className="font-bold">{t('soil')}</h2>
          <p className="mt-1 text-xs text-text-secondary">{t('lastTest')}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              [hi ? 'पीएच मान' : 'pH Level', '6.8', hi ? 'अच्छा' : 'Good'],
              [hi ? 'जैविक कार्बन' : 'Organic Carbon', '0.56%', hi ? 'मध्यम' : 'Medium'],
              [hi ? 'नाइट्रोजन (N)' : 'Nitrogen (N)', '215', 'kg/ha'],
              [hi ? 'पोटैशियम (K)' : 'Potassium (K)', '312', 'kg/ha'],
            ].map((x) => (
              <div className="rounded-lg bg-surface-muted p-3" key={x[0]}>
                <p className="text-[10px] text-text-secondary">{x[0]}</p>
                <b className="mt-1 block text-lg text-primary-dark">{x[1]}</b>
                <small className="text-primary">{x[2]}</small>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-bold">{t('weatherForecast')}</h2>
          <p className="mt-1 text-xs text-text-secondary">Indore, MP</p>
          <div className="mt-4 grid grid-cols-5">
            {forecast.map((x, i) => (
              <div className="text-center" key={x.day}>
                <p className="text-[10px] text-text-secondary">{days[i]}</p>
                <p className="my-2 text-xl">{x.icon}</p>
                <b className="text-xs">{x.high}</b>
                <p className="text-[10px] text-text-secondary">{x.low}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
            ⚠️{' '}
            {hi
              ? '20–21 मई को हल्की बारिश की संभावना है।'
              : 'Light rainfall likely on 20–21 May.'}
          </p>
        </Card>

        <Card className="p-5">
          <h2 className="font-bold">{t('market')}</h2>
          <p className="mt-1 text-xs text-text-secondary">
            {hi ? 'गेहूं · इंदौर मंडी' : 'Wheat · Indore Mandi'}
          </p>
          <p className="mt-5 text-3xl font-bold text-primary-dark">₹ 2,125</p>
          <p className="mt-1 text-xs text-primary">
            ▲ 2.35% {hi ? 'कल से अधिक' : 'vs yesterday'}
          </p>
          <div className="mt-5 space-y-2 text-xs">
            {[
              ['Dewas', '₹ 2,080'],
              ['Ujjain', '₹ 2,150'],
              ['Ratlam', '₹ 1,980'],
            ].map((x) => (
              <p
                className="flex justify-between border-b border-border-light pb-2"
                key={x[0]}
              >
                <span>{x[0]}</span>
                <b>{x[1]}</b>
              </p>
            ))}
          </div>
          <div className="mt-5">
            <Go to="/market">{hi ? 'और भाव देखें' : 'View More Prices'}</Go>
          </div>
        </Card>
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
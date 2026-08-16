import { Bell, ChevronDown, CloudSun, MapPin, Menu, Search } from 'lucide-react';
import { farmer } from '../../data/dashboard.js';
import { useLanguage } from '../../hooks/useLanguage.jsx';

export default function Header({ onMenuClick }) {
  const { language, setLanguage, t } = useLanguage();
  const mr = language === 'mr';
  const hi = language === 'hi';

  return (
    <header className="hidden h-[68px] items-center justify-between border-b border-border bg-white px-8 lg:flex">
      {/* Left side: Toggle button & Search Bar */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          aria-label={mr ? 'मेनू उघडा/बंद करा' : hi ? 'साइडबार खोलें या बंद करें' : 'Toggle sidebar'}
          className="rounded-xl p-2 hover:bg-surface-muted transition text-text-secondary"
        >
          <Menu size={20} />
        </button>

        {/* Command Center Search Bar */}
        <div className="relative w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder={
              mr
                ? 'शोधा: पिके, बाजार भाव, योजना...'
                : hi
                ? 'खोजें: फसल, मंडी, योजना...'
                : 'Search fields, mandis, schemes...'
            }
            className="w-full rounded-xl border border-border bg-surface-muted/60 py-2 pl-9 pr-3 text-xs outline-none focus:border-primary focus:bg-white transition"
          />
        </div>
      </div>

      {/* Right side: Live Weather, Location, Language & Farmer Profile */}
      <div className="flex items-center gap-5 text-xs text-text-secondary">
        {/* Weather Indicator Pill */}
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 font-bold text-emerald-800 border border-emerald-100">
          <CloudSun size={15} className="text-amber-500" />
          <span>28°C · {mr ? 'निरभ्र ऊन' : hi ? 'धूप' : 'Sunny'}</span>
        </div>

        {/* Location Indicator */}
        <span className="flex items-center gap-1.5 font-medium text-text-secondary">
          <MapPin size={15} className="text-primary" />
          {mr ? farmer.locationMr || 'पुणे, महाराष्ट्र' : hi ? farmer.locationHi : farmer.location}
        </span>

        {/* Language Selector Dropdown */}
        <select
          aria-label={t('language')}
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-bold text-primary outline-none cursor-pointer hover:border-primary transition"
        >
          <option value="en">English (EN)</option>
          <option value="hi">हिंदी (HI)</option>
          <option value="mr">मराठी (MR)</option>
        </select>


        {/* Notification Bell with Badge */}
        <div className="relative cursor-pointer p-1 text-text-secondary hover:text-text-primary">
          <Bell size={19} />
          <span className="absolute right-1 top-1 size-2 rounded-full bg-red-500 ring-2 ring-white" />
        </div>

        {/* Farmer Profile Avatar & Dropdown */}
        <div className="flex items-center gap-2.5 border-l border-border pl-4">
          <img
            src={farmer.avatar}
            alt="Santosh Jadhav"
            className="size-8 rounded-full border border-primary object-cover"
          />

          <div className="text-left">
            <p className="font-bold text-xs text-text-primary">
              {mr ? farmer.nameMr || 'संतोष जाधव' : hi ? farmer.nameHi : farmer.name}
            </p>
            <p className="text-[10px] text-emerald-700 font-semibold">
              {mr ? 'प्रमाणित शेतकरी' : hi ? 'सत्यापित किसान' : 'Verified Farmer'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
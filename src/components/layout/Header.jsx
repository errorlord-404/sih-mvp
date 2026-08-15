import { Bell, MapPin, Menu } from 'lucide-react';
import { farmer } from '../../data/dashboard.js';
import { useLanguage } from '../../hooks/useLanguage.jsx';

export default function Header({ onMenuClick }) {
  // Extract language context and setup a quick boolean for Hindi checks
  const { language, setLanguage, t } = useLanguage();
  const hi = language === 'hi';

  return (
    // Main header container: Hidden on small screens, visible on desktop (lg:flex)
    <header className="hidden h-[68px] items-center justify-between border-b border-border bg-white px-8 lg:flex">
      
      {/* Left side: Sidebar Toggle Button */}
      <button
        onClick={onMenuClick}
        aria-label={hi ? 'साइडबार खोलें या बंद करें' : 'Toggle sidebar'}
        className="rounded-lg p-1 hover:bg-surface-muted"
      >
        <Menu size={20} />
      </button>

      {/* Right side: Actions, Settings, and User Profile */}
      <div className="ml-auto flex items-center gap-6 text-sm text-text-secondary">
        
        {/* Language Selector Dropdown */}
        <select
          aria-label={t('language')}
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="rounded-lg border border-border bg-white px-2 py-1.5 text-xs font-semibold text-primary"
        >
          <option value="en">EN</option>
          <option value="hi">हिंदी</option>
        </select>

        {/* Farmer Location Indicator */}
        <span className="flex items-center gap-1.5">
          <MapPin size={16} className="text-primary" />
          {farmer.location}
        </span>

        {/* Notification Bell */}
        <Bell aria-label={hi ? 'सूचनाएं' : 'Notifications'} size={19} />

        {/* User Avatar (Initials) */}
        <div className="flex size-9 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800">
          RC
        </div>
        
        {/* User Name */}
        <span className="-ml-4 font-medium text-text-primary">
          {farmer.name}
        </span>
        
      </div>
    </header>
  );
}
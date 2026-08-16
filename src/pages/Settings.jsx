import { Bell, ChevronRight, Globe, ShieldCheck } from 'lucide-react';
import { farmer } from '../data/dashboard.js';
import { useLanguage } from '../hooks/useLanguage.jsx';

export default function Settings() {
  const { language, setLanguage, t } = useLanguage();
  const hi = language === 'hi';

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      {/* Page Header */}
      <h1 className="text-2xl font-bold">{t('settings')}</h1>
      <p className="mt-1 text-sm text-text-secondary">
        {t('settingsPage.description')}
      </p>

      {/* Settings Card Container */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-white shadow-card">
        {/* User Profile Section */}
        <div className="flex items-center gap-4 border-b border-border p-5">
          <img
            src={farmer.avatar}
            alt="Farmer Profile"
            className="size-14 rounded-full border-2 border-primary object-cover shadow-sm"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-bold text-base text-text-primary">
                {hi ? farmer.nameHi : farmer.name}
              </p>
              <span className="flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                <ShieldCheck size={12} />
                {hi ? 'सत्यापित किसान' : 'Verified'}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              {hi ? farmer.locationHi : farmer.location} · 2.5 Acres
            </p>
          </div>
        </div>


        {/* Language Preferences Section */}
        <div className="flex items-center gap-3 border-b border-border p-5">
          <span className="grid size-10 place-items-center rounded-xl bg-primary-50 text-primary">
            <Globe size={20} />
          </span>
          <div className="flex-1">
            <p className="font-bold">{t('language')}</p>
            <p className="text-xs text-text-secondary">
              {t('settingsPage.languageDescription')}
            </p>
          </div>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold text-primary"
          >
            <option value="en">English (English)</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="mr">मराठी (Marathi)</option>
          </select>

        </div>

        {/* Notifications Button Option */}
        <button className="flex w-full items-center gap-3 p-5 text-left">
          <span className="grid size-10 place-items-center rounded-xl bg-primary-50 text-primary">
            <Bell size={20} />
          </span>
          <span className="flex-1">
            <span className="block font-bold">
              {t('settingsPage.notifications')}
            </span>
            <span className="block text-xs text-text-secondary">
              {t('settingsPage.notificationsDescription')}
            </span>
          </span>
          <ChevronRight size={19} className="text-text-muted" />
        </button>

      </section>

      {/* Footer Saved Status Note */}
      <p className="mt-4 text-xs text-text-muted">
        {t('settingsPage.saved')}
      </p>

    </div>
  );
}
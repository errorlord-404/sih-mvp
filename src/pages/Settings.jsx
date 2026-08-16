import { Bell, ChevronRight, Globe, UserRound } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.jsx';

export default function Settings() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      
      {/* Page Header */}
      <h1 className="text-2xl font-bold">{t('settings')}</h1>
      <p className="mt-1 text-sm text-text-secondary">
        {t('settingsPage.description')}
      </p>

      {/* Settings Card Container */}
      <section className="mt-6 overflow-hidden rounded-card border border-border bg-white shadow-card">
        
        {/* User Profile Section */}
        <div className="flex items-center gap-3 border-b border-border p-5">
          <span className="grid size-10 place-items-center rounded-xl bg-primary-50 text-primary">
            <UserRound size={20} />
          </span>
          <div>
            <p className="font-bold">Ramesh Chauhan</p>
            <p className="text-xs text-text-secondary">
              Indore, Madhya Pradesh
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
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
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
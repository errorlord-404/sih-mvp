import { ArrowRight, Droplets, Map, Plus, Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fields, localizeField } from '../data/fields.js';
import { farmImages } from '../data/images.js';
import { useLanguage } from '../hooks/useLanguage.jsx';

// Array of crop background images mapped to field items
const cropImages = [farmImages.wheat, farmImages.potato, farmImages.mustard];

export default function MyFields() {
  const { language } = useLanguage();
  const hi = language === 'hi';

  // Localized text copies for English and Hindi interfaces
  const label = hi
    ? {
        title: 'मेरी फसलें',
        subtitle: 'अपने हर खेत की स्थिति और प्रगति देखें।',
        add: 'खेत जोड़ें',
        moisture: 'मिट्टी की नमी',
        details: 'खेत का विवरण देखें',
        mapTitle: 'अपने सभी खेत फार्म मैप पर देखें',
        mapText: 'एक ही जगह पर खेत की सीमा और स्वास्थ्य स्थिति देखें।',
        mapAction: 'फार्म मैप खोलें',
      }
    : {
        title: 'My Fields',
        subtitle: 'Track the health and progress of every field.',
        add: 'Add field',
        moisture: 'Soil moisture',
        details: 'View field details',
        mapTitle: 'See all fields on your farm map',
        mapText: 'View field boundaries and health status in one place.',
        mapAction: 'Open Farm Map',
      };

  // Map and localize all available fields based on active language
  const visibleFields = fields.map((item) => localizeField(item, language));

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      
      {/* Page Header with title, subtitle, and add field action button */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{label.title}</h1>
          <p className="mt-1 text-sm text-text-secondary">{label.subtitle}</p>
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white">
          <Plus size={15} />
          {label.add}
        </button>
      </header>

      {/* Grid of field cards */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleFields.map((item, index) => (
          <article
            className="overflow-hidden rounded-card border border-border bg-white shadow-card"
            key={item.id}
          >
            <img
              className="h-32 w-full object-cover"
              src={cropImages[index]}
              alt={`${item.crop} crop`}
            />
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-primary-50 p-1.5 text-primary">
                      <Sprout size={15} />
                    </span>
                    <h2 className="font-bold">{item.name}</h2>
                  </div>
                  <p className="mt-2 text-xs text-text-secondary">
                    {item.crop} · {item.area}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-bold ${item.tone}`}
                >
                  {item.status}
                </span>
              </div>

              <p className="mt-4 text-sm font-semibold text-primary-dark">
                {item.stage}
              </p>

              <div className="mt-2 flex items-center justify-between text-xs text-text-secondary">
                <span className="flex items-center gap-1">
                  <Droplets size={14} className="text-info" />
                  {label.moisture}
                </span>
                <b>{item.moisture}%</b>
              </div>

              <div className="mt-2 h-2 rounded-full bg-surface-muted">
                <div
                  className={`h-full rounded-full ${item.color}`}
                  style={{ width: `${item.moisture}%` }}
                />
              </div>

              <Link
                to={`/fields/${item.id}`}
                className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs font-semibold text-primary"
              >
                {label.details}
                <ArrowRight size={15} />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Farm map promotional banner section */}
      <section className="mt-6 rounded-card border border-border bg-primary-50 p-5">
        <div className="flex items-start gap-3">
          <span className="rounded-lg bg-white p-2 text-primary">
            <Map size={21} />
          </span>
          <div>
            <h2 className="font-bold text-primary-dark">{label.mapTitle}</h2>
            <p className="mt-1 text-sm text-text-secondary">{label.mapText}</p>
            <Link
              className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary"
              to="/map"
            >
              {label.mapAction}
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
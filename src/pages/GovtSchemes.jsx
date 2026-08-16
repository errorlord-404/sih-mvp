import { useState } from 'react';
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Landmark,
  PhoneCall,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.jsx';

export default function GovtSchemes() {
  const { language } = useLanguage();
  const mr = language === 'mr';
  const hi = language === 'hi';
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScheme, setSelectedScheme] = useState(null);

  const categories = [
    { id: 'all', name: 'All Schemes', nameHi: 'सभी योजनाएं', nameMr: 'सर्व योजना' },
    { id: 'income', name: 'Income Support', nameHi: 'आय सहायता', nameMr: 'थेट अर्थसहाय्य' },
    { id: 'insurance', name: 'Crop Insurance', nameHi: 'फसल बीमा', nameMr: 'पीक विमा' },
    { id: 'solar', name: 'Solar & Energy', nameHi: 'सौर ऊर्जा', nameMr: 'सौर कृषी पंप' },
    { id: 'machinery', name: 'Machinery Subsidy', nameHi: 'कृषि यंत्र अनुदान', nameMr: 'कृषी यांत्रिकीकरण' },
    { id: 'soil', name: 'Soil & Irrigation', nameHi: 'उर्वरक व मृदा', nameMr: 'मृदा व ठिबक सिंचन' },
  ];

  const schemes = [
    {
      id: 'pm-kisan',
      category: 'income',
      title: 'PM-KISAN Samman Nidhi',
      titleMr: 'प्रधानमंत्री किसान सन्मान निधी (PM-KISAN)',
      titleHi: 'प्रधानमंत्री किसान सम्मान निधि',
      benefit: '₹ 6,000 / year',
      benefitMr: '₹ ६,००० प्रति वर्ष (३ समान हप्त्यांमध्ये)',
      benefitHi: '₹ 6,000 प्रति वर्ष (3 किस्तों में)',
      status: 'Active · 16th Installment Received',
      statusMr: 'सक्रिय · १६ वा हप्ता थेट जमा',
      statusHi: 'सक्रिय · 16वीं किस्त प्राप्त',
      badge: 'Direct Cash Transfer',
      badgeMr: 'थेट बँक खात्यात (DBT)',
      badgeHi: 'सीधे बैंक खाते में',
      desc: 'Financial support of ₹6,000 per year in three equal installments to eligible landholding farmer families.',
      descMr: 'पात्र शेतकरी कुटुंबांना दर ४ महिन्यांनी ₹२,००० याप्रमाणे वर्षाला ₹६,००० चे थेट आर्थिक सहाय्य.',
      descHi: 'पात्र किसान परिवारों को हर 4 महीने में ₹2,000 की तीन समान किस्तों में ₹6,000 सालाना वित्तीय सहायता।',
      eligibility: ['Small and marginal landholding farmers', 'Valid Aadhaar-linked bank account'],
      eligibilityMr: ['लहान व अल्पभूधारक शेतकरी', 'आधार लिंक केलेले बँक खाते व ७/१२ उतारा'],
      eligibilityHi: ['छोटे एवं सीमांत किसान', 'आधार से लिंक बैंक खाता एवं खसरा/खतौनी'],
      docs: ['Aadhaar Card', 'Land Records (7/12 & 8A)', 'Bank Passbook'],
      docsMr: ['आधार कार्ड', '७/१२ व ८-अ उतारा', 'बँक पासबुक'],
      docsHi: ['आधार कार्ड', 'खसरा/खतौनी नकल', 'बैंक पासबुक'],
      helpline: '155261 / 011-24300606',
    },
    {
      id: 'pmfby',
      category: 'insurance',
      title: 'PM Fasal Bima Yojana (PMFBY)',
      titleMr: 'प्रधानमंत्री पीक विमा योजना (१ रुपयात पीक विमा)',
      titleHi: 'प्रधानमंत्री फसल बीमा योजना (PMFBY)',
      benefit: 'Up to ₹ 40,000 / Acre Cover',
      benefitMr: '₹ ४०,००० प्रति एकर पर्यंत विमा संरक्षण',
      benefitHi: '₹ 40,000 प्रति एकड़ तक सुरक्षा',
      status: 'Enrolled · Wheat Crop 2024–25',
      statusMr: 'नोंदणीकृत · रब्बी गहू २०२४-२५',
      statusHi: 'नामांकित · गेहूं फसल 2024-25',
      badge: 'Crop Risk Shield',
      badgeMr: 'पीक नुकसान सुरक्षा',
      badgeHi: 'फसल सुरक्षा कवच',
      desc: 'Comprehensive crop insurance coverage against non-preventable natural risks like drought, flood, pests, and unseasonal rains at minimal premium.',
      descMr: 'दुष्काळ, अवकाळी पाऊस, गारपीट व किडींच्या प्रादुर्भावामुळे होणाऱ्या पीक नुकसानीपासून संपूर्ण आर्थिक संरक्षण.',
      eligibility: ['All farmers growing notified crops in notified areas', 'Sharecroppers and tenant farmers eligible'],
      eligibilityMr: ['अधिसूचित पिके घेणारे सर्व शेतकरी', 'कुळ व भाडेतत्त्वावरील शेतकरी देखील पात्र'],
      eligibilityHi: ['अधिसूचित क्षेत्रों में अधिसूचित फसल उगाने वाले सभी किसान', 'बटाईदार किसान भी पात्र'],
      docs: ['Sowing Certificate (Pik Pahani)', '7/12 Utara', 'Aadhaar Card'],
      docsMr: ['ई-पीक पाहणी नोंद', '७/१२ व ८-अ उतारा', 'आधार कार्ड'],
      docsHi: ['बुवाई प्रमाण पत्र / पटवारी रिपोर्ट', 'जमीन के दस्तावेज', 'आधार कार्ड'],
      helpline: '1800-180-1551',
    },
    {
      id: 'kusum',
      category: 'solar',
      title: 'PM-KUSUM Solar Pump Scheme (Maha Vitaran)',
      titleMr: 'मागेल त्याला सौर कृषी पंप योजना (महावितरण)',
      titleHi: 'प्रधानमंत्री कुसुम योजना (सोलर पंप)',
      benefit: 'Up to 90% Subsidy for SC/ST, 90% for Gen',
      benefitMr: '९०% ते ९५% पर्यंत शासकीय अनुदान',
      benefitHi: '60% तक सरकारी अनुदान',
      status: 'Applications Open (MahaDBT)',
      statusMr: 'अर्ज सुरू आहेत (MahaDBT पोर्टल)',
      statusHi: 'आवेदन खुले हैं',
      badge: 'Clean Irrigation',
      badgeMr: 'सौर सिंचन',
      badgeHi: 'सस्ती सौर सिंचाई',
      desc: 'Subsidy for standalone solar agriculture pumps (3 HP to 7.5 HP) to eliminate diesel and electricity bills.',
      descMr: 'दिवसा सिंचनाची सोय उपलब्ध करून देण्यासाठी ३ HP, ५ HP व ७.५ HP क्षमतेचे सौर कृषी पंप नाममात्र शेतकरी हिश्श्यावर.',
      eligibility: ['Individual farmers with cultivable land', 'Water source availability on farm'],
      eligibilityMr: ['शेतात विहीर किंवा बोअरवेल असणारे शेतकरी', 'पारंपारिक वीज जोडणी नसलेले शेतकरी'],
      eligibilityHi: ['कृषि भूमि के स्वामी किसान', 'खेत में बोरवेल या जल स्रोत उपलब्ध होना चाहिए'],
      docs: ['Aadhaar Card', '7/12 with Water Source Entry', 'Bank Details'],
      docsMr: ['आधार कार्ड', '७/१२ जलस्रोत नोंद', 'बँक पासबुक'],
      docsHi: ['आधार कार्ड', 'खतौनी की प्रति', 'बैंक पासबुक'],
      helpline: '1800-180-3333 / 1912',
    },
    {
      id: 'mahadbt-machinery',
      category: 'machinery',
      title: 'MahaDBT Krishi Yantrikikaran (Farm Machinery)',
      titleMr: 'महाडीबीटी कृषी यांत्रिकीकरण योजना (ट्रॅक्टर व अवजारे अनुदान)',
      titleHi: 'महाडीबीटी कृषि यंत्रीकरण योजना',
      benefit: 'Up to ₹ 1.25 Lakh Subsidy on Tractors & Rotavators',
      benefitMr: 'ट्रॅक्टर व रोटाव्हेटरवर ५०% पर्यंत अनुदान',
      benefitHi: 'ट्रैक्टर एवं रोटावेटर पर 50% तक अनुदान',
      status: 'Lottery System Active',
      statusMr: 'लॉटरी प्रक्रिया सुरू',
      statusHi: 'लॉटरी प्रक्रिया सक्रिय',
      badge: 'Mechanization',
      badgeMr: 'यांत्रिकीकरण',
      badgeHi: 'कृषि यंत्रीकरण',
      desc: 'Financial subsidy for purchasing new tractors, power tillers, rotavators, seed drills, and threshers through MahaDBT portal.',
      descMr: 'शेतकऱ्यांना ट्रॅक्टर, पॉवर टिलर, रोटाव्हेटर, टोकन यंत्र व मळणी यंत्र खरेदीसाठी थेट ५०% पर्यंत शासकीय अनुदान.',
      eligibility: ['Farmers with registered 7/12 in Maharashtra'],
      eligibilityMr: ['महाराष्ट्रातील सर्व खातेदार शेतकरी (लहान शेतकऱ्यांना प्राधान्य)'],
      eligibilityHi: ['महाराष्ट्र के पंजीकृत किसान'],
      docs: ['MahaDBT Profile', '7/12 & 8A', 'Quotation from Authorized Dealer'],
      docsMr: ['महाडीबीटी शेतकरी प्रोफाइल', '७/१२ व ८-अ', 'अधिकृत डीलर कोटेशन'],
      docsHi: ['महाडीबीटी प्रोफाइल', 'जमीन दस्तावेज', 'डीलर कोटेशन'],
      helpline: '020-25537038',
    },
    {
      id: 'pmksy',
      category: 'soil',
      title: 'PM Krishi Sinchayee Yojana (Drip & Sprinkler)',
      titleMr: 'ठिबक व तुषार सिंचन योजना (८०% अनुदान)',
      titleHi: 'प्रधानमंत्री कृषि सिंचाई योजना (ड्रिप व स्प्रिंकलर)',
      benefit: 'Up to 80% Subsidy on Drip Irrigation',
      benefitMr: 'अल्पभूधारकांसाठी ८०% पर्यंत अनुदान',
      benefitHi: 'ड्रिप व फव्वारा सिंचाई पर 55% तक अनुदान',
      status: 'Pre-Sanction Active for Pune',
      statusMr: 'पुणे जिल्ह्यासाठी पूर्वसंमती सुरू',
      statusHi: 'पुणे जिले के लिए पात्र',
      badge: 'Water Efficiency',
      badgeMr: 'पाण्याची ७०% बचत',
      badgeHi: 'जल बचत तकनीक',
      desc: 'Financial assistance for installing micro-irrigation systems to maximize water conservation and crop output.',
      descMr: 'कमी पाण्यात जास्तीत जास्त उत्पादन घेण्यासाठी शेतात ठिबक किंवा तुषार सिंचन संच बसविण्यासाठी शासकीय अर्थसहाय्य.',
      eligibility: ['Farmers with assured water source and landholding'],
      eligibilityMr: ['शाश्वत पाणीपुरवठा असलेले सर्व शेतकरी'],
      eligibilityHi: ['सिंचाई जल स्रोत वाले सभी किसान'],
      docs: ['Aadhaar', '7/12 with Water Source', 'Electricity Bill / Water source proof'],
      docsMr: ['आधार कार्ड', '७/१२ उतारा', 'विजेचे बिल / पाणी उपलब्धतेचा दाखला'],
      docsHi: ['आधार कार्ड', 'खसरा नक्शा', 'बिजली बिल / जल स्रोत प्रमाण'],
      helpline: '020-25537038',
    },
  ];

  const filteredSchemes = schemes.filter((s) => {
    const matchCat = activeCategory === 'all' || s.category === activeCategory;
    const title = mr ? s.titleMr : hi ? s.titleHi : s.title;
    const matchSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-white shadow-xs">
              <Landmark size={22} />
            </span>
            <div>
              <h1 className="text-2xl font-bold">
                {mr ? 'शासकीय योजना व थेट अनुदान (MahaDBT)' : hi ? 'सरकारी योजनाएं एवं सब्सिडी' : 'Government Schemes & Subsidies'}
              </h1>
              <p className="mt-0.5 text-xs text-text-secondary">
                {mr
                  ? 'तुमच्या शेतीसाठी केंद्र व महाराष्ट्र शासनाच्या सर्व सक्रिय योजना व अनुदान'
                  : hi
                  ? 'आपके खेत और फसल के लिए मान्य केंद्र व राज्य सरकार की कल्याणकारी योजनाएं'
                  : 'Verified central and Maharashtra state welfare & subsidy programs'}
              </p>
            </div>
          </div>
        </div>

        {/* Support Pill */}
        <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary-50 px-4 py-2 text-xs font-semibold text-primary">
          <PhoneCall size={16} />
          <span>{mr ? 'किसान कॉल सेंटर: १८००-१८०-१५५१' : hi ? 'किसान कॉल सेंटर: 1800-180-1551' : 'Kisan Call Center: 1800-180-1551'}</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition border ${
                activeCategory === cat.id
                  ? 'bg-primary border-primary text-white shadow-xs'
                  : 'border-border bg-white text-text-secondary hover:bg-surface-muted'
              }`}
            >
              {mr ? cat.nameMr : hi ? cat.nameHi : cat.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={mr ? 'योजना शोधा...' : hi ? 'योजना खोजें...' : 'Search scheme...'}
            className="w-full rounded-xl border border-border bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-primary shadow-xs"
          />
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredSchemes.map((s) => (
          <div
            key={s.id}
            className="rounded-2xl border border-border bg-white p-6 shadow-card flex flex-col justify-between hover:shadow-lg transition"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-primary-50 px-2 py-0.5 text-[10px] font-bold text-primary">
                  {mr ? s.badgeMr : hi ? s.badgeHi : s.badge}
                </span>
                <span className="text-[10px] font-semibold text-emerald-700">
                  {mr ? s.statusMr : hi ? s.statusHi : s.status}
                </span>
              </div>

              <h3 className="mt-3 text-base font-bold text-text-primary leading-snug">
                {mr ? s.titleMr : hi ? s.titleHi : s.title}
              </h3>
              <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                {mr ? s.descMr : hi ? s.descHi : s.desc}
              </p>

              {/* Benefit Callout */}
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  {mr ? 'अनुदान / लाभ:' : hi ? 'मुख्य लाभ:' : 'Scheme Benefit:'}
                </p>
                <p className="mt-0.5 text-sm font-bold text-emerald-950">
                  {mr ? s.benefitMr : hi ? s.benefitHi : s.benefit}
                </p>
              </div>

              {/* Eligibility List */}
              <div className="mt-4 space-y-1.5">
                <p className="text-[11px] font-bold text-text-primary">
                  {mr ? 'पात्रता निकष:' : hi ? 'पात्रता:' : 'Eligibility:'}
                </p>
                {(mr ? s.eligibilityMr : hi ? s.eligibilityHi : s.eligibility).map((e, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-xs text-text-secondary">
                    <CheckCircle2 size={13} className="text-primary shrink-0 mt-0.5" />
                    <span>{e}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-5 border-t border-border pt-4 flex items-center justify-between">
              <span className="text-[10px] text-text-muted">📞 {s.helpline}</span>
              <button
                onClick={() => setSelectedScheme(s)}
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-dark"
              >
                <span>{mr ? 'कागदपत्रे व अर्ज करा' : hi ? 'दस्तावेज एवं आवेदन' : 'View Details'}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Scheme Detail Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <span className="rounded bg-primary-50 px-2 py-0.5 text-[10px] font-bold text-primary">
                  {mr ? selectedScheme.badgeMr : selectedScheme.badge}
                </span>
                <h3 className="mt-1.5 font-bold text-lg text-text-primary">
                  {mr ? selectedScheme.titleMr : hi ? selectedScheme.titleHi : selectedScheme.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedScheme(null)}
                className="p-1 rounded-lg text-text-muted hover:bg-surface-muted"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <p className="font-bold text-text-primary mb-1">
                  {mr ? 'योजनेचा तपशील:' : 'Description:'}
                </p>
                <p className="text-text-secondary leading-relaxed">
                  {mr ? selectedScheme.descMr : hi ? selectedScheme.descHi : selectedScheme.desc}
                </p>
              </div>

              <div>
                <p className="font-bold text-text-primary mb-1.5">
                  {mr ? 'आवश्यक कागदपत्रे (Required Documents):' : 'Required Documents:'}
                </p>
                <div className="space-y-1.5">
                  {(mr ? selectedScheme.docsMr : hi ? selectedScheme.docsHi : selectedScheme.docs).map((d, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg bg-surface-muted p-2 text-text-secondary">
                      <FileText size={14} className="text-primary" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary-50 p-3.5">
                <p className="font-bold text-primary-dark mb-1">
                  {mr ? 'अधिकृत पोर्टलवर अर्ज कसा करावा:' : 'Application Instructions:'}
                </p>
                <p className="text-text-secondary">
                  {mr
                    ? 'MahaDBT (https://mahadbt.maharashtra.gov.in) किंवा पीएम किसान पोर्टलवर लॉग इन करून आधार प्रमाणीकरण पूर्ण करा.'
                    : 'Log in to MahaDBT or PM-KISAN portal using Aadhaar OTP and submit online application.'}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-border pt-4">
              <button
                onClick={() => setSelectedScheme(null)}
                className="px-4 py-2 text-xs font-bold text-text-secondary hover:bg-surface-muted rounded-xl"
              >
                {mr ? 'बंद करा' : 'Close'}
              </button>
              <a
                href="https://mahadbt.maharashtra.gov.in"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-xs"
              >
                <ExternalLink size={14} />
                <span>{mr ? 'MahaDBT वर अर्ज करा' : 'Apply on Official Portal'}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

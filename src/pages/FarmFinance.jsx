import { useState, useEffect } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Calculator,
  CheckCircle2,
  Coins,
  DollarSign,
  Download,
  Filter,
  HardDrive,
  Lock,
  PieChart as PieIcon,
  Plus,
  Receipt,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  TrendingDown,
  TrendingUp,
  Truck,
  Warehouse,
  X,
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.jsx';
import { localDB } from '../db/localDatabase.js';

export default function FarmFinance() {
  const { language } = useLanguage();
  const mr = language === 'mr';
  const hi = language === 'hi';

  const [activeTab, setActiveTab] = useState('ledger'); // 'ledger' | 'simulator' | 'arbitrage'
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState('ALL');

  // New Transaction Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'EXPENSE',
    category: 'Fertilizers',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    crop: 'Wheat',
    notes: '',
  });

  // Simulator State
  const [acres, setAcres] = useState(2.5);
  const [expectedYieldPerAcre, setExpectedYieldPerAcre] = useState(24); // Quintal/Acre
  const [expectedPrice, setExpectedPrice] = useState(2125); // ₹/Quintal

  // Load Transactions from Local Database
  const loadLocalTransactions = async () => {
    try {
      setLoading(true);
      const data = await localDB.getAllTransactions();
      setTransactions(data);
    } catch (err) {
      console.error('Error reading local database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocalTransactions();
  }, []);

  // Handle Add Transaction
  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;

    try {
      await localDB.addTransaction({
        title: formData.title,
        type: formData.type,
        category: formData.category,
        amount: Number(formData.amount),
        date: formData.date,
        crop: formData.crop,
        notes: formData.notes,
      });

      // Reset & Refresh
      setFormData({
        title: '',
        type: 'EXPENSE',
        category: 'Fertilizers',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        crop: 'Wheat',
        notes: '',
      });
      setShowAddModal(false);
      await loadLocalTransactions();
    } catch (err) {
      console.error('Failed to save to local DB:', err);
    }
  };

  // Handle Delete
  const handleDeleteTransaction = async (id) => {
    if (window.confirm(mr ? 'ही नोंद स्थानिक डेटाबेसमधून हटवायची आहे का?' : hi ? 'क्या आप इस प्रविष्टि को हटाना चाहते हैं?' : 'Delete this transaction from local database?')) {
      await localDB.deleteTransaction(id);
      await loadLocalTransactions();
    }
  };

  // Calculate Real Ledger Totals
  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const netBalance = totalIncome - totalExpense;

  // Simulator Calculations
  const totalYield = Math.round(acres * expectedYieldPerAcre);
  const grossRevenue = totalYield * expectedPrice;
  const costPerAcre = 8200;
  const totalCost = Math.round(acres * costPerAcre);
  const simNetProfit = grossRevenue - totalCost;
  const simProfitMargin = Math.round((simNetProfit / grossRevenue) * 100);

  const costBreakdown = [
    {
      item: mr ? 'प्रमाणित बियाणे (HD-2967)' : hi ? 'प्रमाणित बीज (HD-2967)' : 'Seeds (Certified HD-2967)',
      cost: 1280 * acres,
      percent: 15,
      color: 'bg-emerald-500',
    },
    {
      item: mr ? 'खते व पोषण (युरिया + पोटॅश + डीएपी)' : hi ? 'खाद व उर्वरक (यूरिया + पोटाश + डीएपी)' : 'Fertilizers & Nutrients',
      cost: 2560 * acres,
      percent: 31,
      color: 'bg-green-600',
    },
    {
      item: mr ? 'सिंचन व वीज/डिझेल खर्च' : hi ? 'सिंचाई एवं बिजली/डीजल खर्च' : 'Irrigation & Power Charges',
      cost: 1000 * acres,
      percent: 12,
      color: 'bg-blue-500',
    },
    {
      item: mr ? 'ट्रॅक्टर मशागत, पेरणी व मळणी' : hi ? 'ट्रैक्टर जुताई, बुआई व थ्रेशिंग' : 'Tractor & Machinery Rental',
      cost: 1920 * acres,
      percent: 23,
      color: 'bg-amber-500',
    },
    {
      item: mr ? 'मजुरी, खुरपणी व औषध फवारणी' : hi ? 'मजदूरी, निंदाई व कीटनाशक छिड़काव' : 'Labor & Plant Protection',
      cost: 1440 * acres,
      percent: 19,
      color: 'bg-orange-500',
    },
  ];

  const mandiArbitrage = [
    {
      mandi: mr ? 'पुणे कृषी उत्पन्न बाजार समिती' : hi ? 'पुणे मंडी (नजदीकी)' : 'Pune APMC (Nearest)',
      rate: 2125,
      distance: '14 km',
      transportCost: 1200,
      netRevenue: totalYield * 2125 - 1200,
      badge: mr ? 'कमी अंतर व त्वरित पेमेंट' : hi ? 'कम दूरी व तुरंत भुगतान' : 'Best Convenience',
    },
    {
      mandi: mr ? 'बारामती बाजार समिती' : hi ? 'बारामती मंडी' : 'Baramati Mandi',
      rate: 2150,
      distance: '78 km',
      transportCost: 2800,
      netRevenue: totalYield * 2150 - 2800,
      badge: mr ? 'सर्वोच्च दर' : hi ? 'उच्चतम भाव' : 'Highest Rate',
    },
    {
      mandi: mr ? 'शिरूर बाजार समिती' : hi ? 'शिरूर मंडी' : 'Shirur Mandi',
      rate: 2080,
      distance: '64 km',
      transportCost: 2100,
      netRevenue: totalYield * 2080 - 2100,
      badge: mr ? 'पर्यायी बाजारपेठ' : hi ? 'वैकल्पिक मंडी' : 'Alternate Option',
    },
  ];

  // Filtered Transactions
  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'ALL') return true;
    return t.type === filterType;
  });

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-white shadow-xs">
              <Coins size={22} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">
                  {mr ? 'फार्म वित्त व नफा व्यवस्थापन' : hi ? 'फार्म लाभ व वित्तीय योजना' : 'Farm Finance & Private Ledger'}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-300">
                  <HardDrive size={11} className="text-emerald-600" />
                  {mr ? 'स्थानिक डेटाबेस (Offline)' : hi ? 'लोकल डेटाबेस (Offline)' : 'Local Client DB'}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-text-secondary">
                {mr
                  ? 'संतोष जाधव · पुणे, महाराष्ट्र · सर्व खाजगी आर्थिक नोंदी फक्त तुमच्या डिव्हाइसवर सुरक्षित'
                  : hi
                  ? 'संतोष जाधव · पुणे, महाराष्ट्र · सभी निजी वित्तीय प्रविष्टियां केवल आपके डिवाइस पर सुरक्षित'
                  : 'Santosh Jadhav · Pune, Maharashtra · Private financial ledger stored securely on local device'}
              </p>
            </div>
          </div>
        </div>

        {/* Action & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-surface-muted p-1 border border-border">
            <button
              onClick={() => setActiveTab('ledger')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'ledger' ? 'bg-white text-primary shadow-xs' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {mr ? 'खर्चाची वही (Ledger)' : hi ? 'खाता बही (Ledger)' : 'Local Ledger'}
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'simulator' ? 'bg-white text-primary shadow-xs' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {mr ? 'नफा सिम्युलेटर' : hi ? 'लाभ सिम्युलेटर' : 'Profit Simulator'}
            </button>
            <button
              onClick={() => setActiveTab('arbitrage')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'arbitrage' ? 'bg-white text-primary shadow-xs' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {mr ? 'मंडी तुलना' : hi ? 'मंडी तुलना' : 'Mandi Comparison'}
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary-dark transition"
          >
            <Plus size={16} />
            <span>{mr ? '+ नवीन नोंद जोडा' : hi ? '+ नई प्रविष्टि जोड़ें' : '+ Record Entry'}</span>
          </button>
        </div>
      </div>

      {/* Top 4 Live Financial Stat Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Expense */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 shadow-card">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-800">
            <span>{mr ? 'एकूण शेती खर्च' : hi ? 'कुल वास्तविक खर्च' : 'Total Farm Expenses'}</span>
            <ArrowDownRight size={16} className="text-rose-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-rose-950">₹ {totalExpense.toLocaleString('en-IN')}</p>
          <p className="mt-1 text-[11px] text-rose-700">
            {mr ? 'स्थानिक डेटाबेसमधील सर्व नोंदी' : hi ? 'लोकल डेटाबेस की कुल प्रविष्टियां' : 'All recorded input expenses'}
          </p>
        </div>

        {/* Total Income */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-card">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
            <span>{mr ? 'एकूण शेती उत्पन्न' : hi ? 'कुल प्राप्त आय / सब्सिडी' : 'Total Farm Inflow'}</span>
            <ArrowUpRight size={16} className="text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-950">₹ {totalIncome.toLocaleString('en-IN')}</p>
          <p className="mt-1 text-[11px] text-emerald-700">
            {mr ? 'पीक विक्री व सरकारी डीबीटी' : hi ? 'फसल बिक्री व सरकारी अनुदान' : 'Crop sales & DBT subsidies'}
          </p>
        </div>

        {/* Net Current Balance */}
        <div className="rounded-2xl border border-primary/30 bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_100%)] p-5 shadow-card">
          <div className="flex items-center justify-between text-xs font-semibold text-primary-dark">
            <span>{mr ? 'सध्याची निव्वळ शिल्लक' : hi ? 'शुद्ध वर्तमान स्थिति' : 'Net Farm Balance'}</span>
            <TrendingUp size={16} className="text-primary" />
          </div>
          <p className={`mt-2 text-3xl font-bold ${netBalance >= 0 ? 'text-emerald-800' : 'text-rose-700'}`}>
            ₹ {netBalance.toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-[11px] text-text-secondary">
            {netBalance >= 0
              ? mr
                ? 'नफा स्थितीत (Positive Balance)'
                : 'Surplus Balance'
              : mr
              ? 'हंगामी गुंतवणूक टप्पा'
              : 'Seasonal Investment Phase'}
          </p>
        </div>

        {/* Total Ledger Records */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
          <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
            <span>{mr ? 'नोंदी संख्या' : hi ? 'दर्ज प्रविष्टियां' : 'Ledger Entries'}</span>
            <Receipt size={16} className="text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold text-text-primary">{transactions.length}</p>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
            <Lock size={12} />
            <span>{mr ? 'डिव्हाइसवर एन्क्रिप्टेड' : '100% On-Device'}</span>
          </div>
        </div>
      </div>

      {/* TAB 1: LOCAL PRIVATE LEDGER */}
      {activeTab === 'ledger' && (
        <div className="mt-6 space-y-6">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-card">
            {/* Table Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h2 className="text-base font-bold text-text-primary">
                  {mr ? 'स्थानिक आर्थिक वहीवाट (Private Ledger)' : hi ? 'निजी खाता बही' : 'Private Transaction Ledger'}
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  {mr
                    ? 'खते, बियाणे, ट्रॅक्टर भाडे, मजुरी आणि पीक विक्रीची अचूक नोंद'
                    : hi
                    ? 'खाद, बीज, ट्रैक्टर जुताई, मजदूरी और फसल बिक्री का रीयल-टाइम हिसाब'
                    : 'Real-time record of seeds, fertilizers, tractor rental, labor, and crop sales'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Filter Buttons */}
                <div className="flex rounded-lg bg-surface-muted p-1 border border-border text-xs">
                  <button
                    onClick={() => setFilterType('ALL')}
                    className={`rounded px-2.5 py-1 font-bold transition ${
                      filterType === 'ALL' ? 'bg-white text-text-primary shadow-xs' : 'text-text-secondary'
                    }`}
                  >
                    {mr ? 'सर्व' : 'All'}
                  </button>
                  <button
                    onClick={() => setFilterType('EXPENSE')}
                    className={`rounded px-2.5 py-1 font-bold transition ${
                      filterType === 'EXPENSE' ? 'bg-rose-100 text-rose-900 shadow-xs' : 'text-text-secondary'
                    }`}
                  >
                    {mr ? 'खर्च' : 'Expenses'}
                  </button>
                  <button
                    onClick={() => setFilterType('INCOME')}
                    className={`rounded px-2.5 py-1 font-bold transition ${
                      filterType === 'INCOME' ? 'bg-emerald-100 text-emerald-900 shadow-xs' : 'text-text-secondary'
                    }`}
                  >
                    {mr ? 'उत्पन्न' : 'Income'}
                  </button>
                </div>
              </div>
            </div>

            {/* Transaction List / Table */}
            {loading ? (
              <div className="py-12 text-center text-xs text-text-muted">
                {mr ? 'स्थानिक डेटाबेसमधून नोंदी लोड होत आहेत...' : 'Loading transactions from local database...'}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="py-12 text-center">
                <Receipt size={36} className="mx-auto text-text-muted/40 mb-2" />
                <p className="text-sm font-bold text-text-secondary">
                  {mr ? 'अद्याप कोणतीही नोंद नाही' : hi ? 'कोई प्रविष्टि नहीं मिली' : 'No transactions recorded yet'}
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-xs"
                >
                  <Plus size={14} />
                  <span>{mr ? 'पहिली नोंद जोडा' : 'Record First Entry'}</span>
                </button>
              </div>
            ) : (
              <div className="mt-4 divide-y divide-border overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-text-secondary border-b border-border">
                      <th className="pb-3 font-semibold">{mr ? 'तारीख' : 'Date'}</th>
                      <th className="pb-3 font-semibold">{mr ? 'तपशील' : 'Description'}</th>
                      <th className="pb-3 font-semibold">{mr ? 'प्रवर्ग' : 'Category'}</th>
                      <th className="pb-3 font-semibold">{mr ? 'पीक' : 'Crop'}</th>
                      <th className="pb-3 text-right font-semibold">{mr ? 'रक्कम' : 'Amount'}</th>
                      <th className="pb-3 text-center font-semibold">{mr ? 'क्रिया' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-surface-muted/50 transition">
                        <td className="py-3 text-text-secondary whitespace-nowrap">{tx.date}</td>
                        <td className="py-3">
                          <p className="font-bold text-text-primary">{tx.title}</p>
                          {tx.notes && <p className="text-[11px] text-text-muted mt-0.5">{tx.notes}</p>}
                        </td>
                        <td className="py-3">
                          <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-[10px] font-bold text-text-secondary border border-border">
                            {tx.category}
                          </span>
                        </td>
                        <td className="py-3 text-text-secondary">{tx.crop || 'General'}</td>
                        <td className="py-3 text-right font-bold whitespace-nowrap">
                          <span
                            className={
                              tx.type === 'INCOME' ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'
                            }
                          >
                            {tx.type === 'INCOME' ? '+ ' : '- '}₹ {Number(tx.amount).toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() => handleDeleteTransaction(tx.id)}
                            className="p-1.5 text-text-muted hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                            title="Delete entry"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PROFIT SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-card">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <Calculator size={20} className="text-primary" />
                <h2 className="font-bold text-base">
                  {mr ? 'परस्परसंवादी नफा सिम्युलेटर' : hi ? 'इंटरएक्टिव लाभ कैलकुलेटर' : 'Interactive Profit Simulator'}
                </h2>
              </div>
              <span className="rounded bg-primary-50 px-2 py-1 text-[11px] font-semibold text-primary">
                {mr ? 'रिअल-टाइम अंदाज' : 'Live Simulation'}
              </span>
            </div>

            <div className="mt-5 space-y-5">
              {/* Slider 1: Acres */}
              <div>
                <div className="flex justify-between text-xs font-semibold">
                  <span>{mr ? 'शेताचे क्षेत्रफळ (एकर)' : hi ? 'खेत का क्षेत्रफल (एकड़)' : 'Field Area (Acres)'}</span>
                  <span className="text-primary font-bold">{acres} Acres</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={acres}
                  onChange={(e) => setAcres(parseFloat(e.target.value))}
                  className="mt-2 w-full accent-primary cursor-pointer"
                />
              </div>

              {/* Slider 2: Yield */}
              <div>
                <div className="flex justify-between text-xs font-semibold">
                  <span>{mr ? 'अपेक्षित उत्पादन (क्विंटल/एकर)' : hi ? 'अनुमानित पैदावार (क्विंटल/एकड़)' : 'Expected Yield (Quintal/Acre)'}</span>
                  <span className="text-primary font-bold">{expectedYieldPerAcre} Qtl/Acre</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="35"
                  step="1"
                  value={expectedYieldPerAcre}
                  onChange={(e) => setExpectedYieldPerAcre(parseInt(e.target.value, 10))}
                  className="mt-2 w-full accent-primary cursor-pointer"
                />
              </div>

              {/* Slider 3: Price */}
              <div>
                <div className="flex justify-between text-xs font-semibold">
                  <span>{mr ? 'अपेक्षित बाजार भाव (₹/क्विंटल)' : hi ? 'अनुमानित मंडी भाव (₹/क्विंटल)' : 'Expected Selling Price (₹/Quintal)'}</span>
                  <span className="text-primary font-bold">₹ {expectedPrice}</span>
                </div>
                <input
                  type="range"
                  min="1800"
                  max="2800"
                  step="25"
                  value={expectedPrice}
                  onChange={(e) => setExpectedPrice(parseInt(e.target.value, 10))}
                  className="mt-2 w-full accent-primary cursor-pointer"
                />
              </div>
            </div>

            {/* Output Summary Box */}
            <div className="mt-6 rounded-xl border border-primary/20 bg-primary-50/50 p-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] text-text-muted">{mr ? 'एकूण उत्पादन' : 'Total Yield'}</p>
                  <p className="mt-1 text-base font-bold text-text-primary">{totalYield} Qtl</p>
                </div>
                <div>
                  <p className="text-[10px] text-text-muted">{mr ? 'अपेक्षित महसूल' : 'Gross Revenue'}</p>
                  <p className="mt-1 text-base font-bold text-primary-dark">₹ {grossRevenue.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-[10px] text-text-muted">{mr ? 'अपेक्षित नफा' : 'Net Margin'}</p>
                  <p className="mt-1 text-base font-bold text-emerald-800">{simProfitMargin}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="rounded-2xl border border-border bg-white p-6 shadow-card">
            <h2 className="font-bold text-base border-b border-border pb-4 flex items-center gap-2">
              <PieIcon size={18} className="text-primary" />
              <span>{mr ? 'लागत खर्च विभागणी (२.५ एकर)' : 'Estimated Cost Breakdown'}</span>
            </h2>
            <div className="mt-4 space-y-4">
              {costBreakdown.map((c, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>{c.item}</span>
                    <span>₹ {c.cost.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-muted overflow-hidden">
                    <div className={`h-full ${c.color}`} style={{ width: `${c.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MANDI ARBITRAGE */}
      {activeTab === 'arbitrage' && (
        <div className="mt-6 rounded-2xl border border-border bg-white p-6 shadow-card">
          <div className="border-b border-border pb-4">
            <h2 className="text-base font-bold text-text-primary">
              {mr ? 'मंडी दर व वाहतूक खर्च तुलना (पुणे विभाग)' : 'APMC Mandi Arbitrage & Transport Net Returns'}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              {mr
                ? 'कोणत्या बाजार समितीत माल विकल्यास प्रत्यक्ष खिशात सर्वाधिक नफा राहील याचे विश्लेषण'
                : 'Net revenue after deducting diesel/transportation freight costs'}
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {mandiArbitrage.map((m, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-surface-muted/30 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-primary-50 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {m.badge}
                    </span>
                    <span className="text-xs text-text-muted">{m.distance}</span>
                  </div>
                  <h3 className="mt-3 font-bold text-base text-text-primary">{m.mandi}</h3>
                  <div className="mt-3 space-y-1.5 text-xs text-text-secondary">
                    <div className="flex justify-between">
                      <span>{mr ? 'मंडी भाव:' : 'Mandi Rate:'}</span>
                      <b>₹ {m.rate} / Qtl</b>
                    </div>
                    <div className="flex justify-between">
                      <span>{mr ? 'वाहतूक खर्च:' : 'Freight Cost:'}</span>
                      <span className="text-rose-600 font-semibold">- ₹ {m.transportCost}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 border-t border-border pt-3">
                  <p className="text-[10px] text-text-muted">{mr ? 'निव्वळ नफा (६० क्विंटल माल):' : 'Net Revenue (60 Qtl):'}</p>
                  <p className="mt-1 text-xl font-bold text-emerald-800">
                    ₹ {m.netRevenue.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD TRANSACTION */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-text-primary">
                {mr ? 'नवीन आर्थिक नोंद करा' : hi ? 'नई वित्तीय प्रविष्टि जोड़ें' : 'Record Financial Transaction'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-text-muted hover:bg-surface-muted"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="mt-4 space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">
                  {mr ? 'प्रकार निवडा:' : 'Transaction Type:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'EXPENSE' })}
                    className={`py-2 rounded-xl text-xs font-bold transition border ${
                      formData.type === 'EXPENSE'
                        ? 'bg-rose-100 border-rose-300 text-rose-900 shadow-xs'
                        : 'bg-surface-muted text-text-secondary border-border'
                    }`}
                  >
                    {mr ? '🔻 खर्च (Expense)' : '🔻 Expense'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'INCOME' })}
                    className={`py-2 rounded-xl text-xs font-bold transition border ${
                      formData.type === 'INCOME'
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-900 shadow-xs'
                        : 'bg-surface-muted text-text-secondary border-border'
                    }`}
                  >
                    {mr ? '🔺 उत्पन्न (Income)' : '🔺 Income'}
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">
                  {mr ? 'नोंदीचे नाव / तपशील:' : 'Title / Description:'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={mr ? 'उदा. युरिया खरेदी किंवा गहू विक्री' : 'e.g. Urea fertilizer purchase'}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-border bg-surface-muted p-2.5 text-xs outline-none focus:border-primary"
                />
              </div>

              {/* Amount & Date Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-text-secondary block mb-1">
                    {mr ? 'रक्कम (₹):' : 'Amount (₹):'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="₹ 1500"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full rounded-xl border border-border bg-surface-muted p-2.5 text-xs outline-none focus:border-primary font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-text-secondary block mb-1">
                    {mr ? 'तारीख:' : 'Date:'}
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-xl border border-border bg-surface-muted p-2.5 text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Category & Crop Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-text-secondary block mb-1">
                    {mr ? 'प्रवर्ग:' : 'Category:'}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-border bg-surface-muted p-2.5 text-xs outline-none focus:border-primary font-medium"
                  >
                    <option value="Seeds">{mr ? 'बियाणे' : 'Seeds'}</option>
                    <option value="Fertilizers">{mr ? 'खते व पोषण' : 'Fertilizers'}</option>
                    <option value="Pesticides">{mr ? 'कीटकनाशके' : 'Pesticides'}</option>
                    <option value="Machinery">{mr ? 'ट्रॅक्टर व अवजारे भाडे' : 'Machinery & Tractor'}</option>
                    <option value="Labor">{mr ? 'मजुरी' : 'Labor'}</option>
                    <option value="Crop Sale">{mr ? 'पीक विक्री' : 'Crop Sale'}</option>
                    <option value="Subsidy">{mr ? 'सरकारी अनुदान (DBT)' : 'Govt Subsidy'}</option>
                    <option value="Other">{mr ? 'इतर खर्च' : 'Other'}</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-secondary block mb-1">
                    {mr ? 'पीक:' : 'Crop:'}
                  </label>
                  <select
                    value={formData.crop}
                    onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                    className="w-full rounded-xl border border-border bg-surface-muted p-2.5 text-xs outline-none focus:border-primary font-medium"
                  >
                    <option value="Wheat">Wheat (गहू)</option>
                    <option value="Mustard">Mustard (मोहरी)</option>
                    <option value="Potato">Potato (बटाटा)</option>
                    <option value="General">General / All Farm</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">
                  {mr ? 'टिप्पणी (पर्यायी):' : 'Notes (Optional):'}
                </label>
                <input
                  type="text"
                  placeholder={mr ? 'उदा. पावती क्रमांक किंवा दुकान' : 'e.g. Receipt #104'}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-xl border border-border bg-surface-muted p-2.5 text-xs outline-none focus:border-primary"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-muted"
                >
                  {mr ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-xs font-bold text-white shadow-xs hover:bg-primary-dark transition"
                >
                  {mr ? 'स्थानिक जतन करा' : 'Save to Local DB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

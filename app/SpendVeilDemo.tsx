"use client";

import { useMemo, useRef, useState } from "react";

type DemoTab =
  | "overview"
  | "expenses"
  | "receipt"
  | "reports"
  | "recurring"
  | "ask"
  | "settings";

type Expense = {
  id: number;
  merchant: string;
  amount: number;
  category: string;
  person: string;
  date: string;
  month: "August 2026" | "July 2026";
  note?: string;
  receiptText?: string;
  tax?: boolean;
};

type RecurringItem = {
  id: number;
  merchant: string;
  amount: number;
  cadence: "Weekly" | "Monthly" | "Yearly";
  next: string;
  active: boolean;
};

const starterExpenses: Expense[] = [
  { id: 1, merchant: "Fresh Market", amount: 148.72, category: "Groceries", person: "Alex", date: "Aug 21", month: "August 2026", note: "Weekly groceries", receiptText: "milk apples bread vegetables" },
  { id: 2, merchant: "Office Supply Co.", amount: 134.6, category: "Work", person: "Me", date: "Aug 17", month: "August 2026", note: "Printer ink and paper", tax: true },
  { id: 3, merchant: "Fibre Internet", amount: 89.99, category: "Bills", person: "Me", date: "Aug 11", month: "August 2026", note: "Monthly internet" },
  { id: 4, merchant: "Home Hardware", amount: 82.49, category: "Home", person: "Me", date: "Aug 5", month: "August 2026", receiptText: "kitchen supplies" },
  { id: 5, merchant: "Metro Transit", amount: 36, category: "Transport", person: "Alex", date: "Aug 3", month: "August 2026" },
  { id: 6, merchant: "Client Lunch", amount: 56.8, category: "Dining", person: "Me", date: "Aug 2", month: "August 2026", tax: true, note: "Project meeting" },
  { id: 7, merchant: "Park Pharmacy", amount: 27.4, category: "Health", person: "Alex", date: "Aug 1", month: "August 2026" },
  { id: 8, merchant: "Fresh Market", amount: 119, category: "Groceries", person: "Me", date: "Jul 18", month: "July 2026" },
  { id: 9, merchant: "Household Bills", amount: 149, category: "Bills", person: "Me", date: "Jul 14", month: "July 2026" },
  { id: 10, merchant: "Local Dining", amount: 76, category: "Dining", person: "Alex", date: "Jul 7", month: "July 2026" },
];

const categories = ["All", "Groceries", "Work", "Bills", "Home", "Transport", "Dining", "Health"];
const categoryColors: Record<string, string> = {
  Groceries: "#17bca9",
  Work: "#22c7d5",
  Bills: "#0ea5e9",
  Home: "#7367f0",
  Transport: "#4387f5",
  Dining: "#ff922b",
  Health: "#ff5d68",
  Other: "#8994a5",
};

const tabMeta: Array<{ id: DemoTab; label: string; icon: string }> = [
  { id: "overview", label: "Overview", icon: "◔" },
  { id: "expenses", label: "Expenses", icon: "≡" },
  { id: "receipt", label: "Receipt", icon: "⌑" },
  { id: "reports", label: "Reports", icon: "⌁" },
  { id: "recurring", label: "Recurring", icon: "↻" },
  { id: "ask", label: "Ask", icon: "✦" },
  { id: "settings", label: "Privacy", icon: "◇" },
];

const tabTitles: Record<DemoTab, string> = {
  overview: "Overview",
  expenses: "Expenses",
  receipt: "Add expense",
  reports: "Reports",
  recurring: "Recurring",
  ask: "Ask SpendVeil",
  settings: "Privacy & settings",
};

const moreTabs = tabMeta.filter((tab) => ["recurring", "ask", "settings"].includes(tab.id));

const money = (value: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(value);

function groupTotals(items: Expense[]) {
  const totals = new Map<string, number>();
  items.forEach((item) => totals.set(item.category, (totals.get(item.category) ?? 0) + item.amount));
  return [...totals.entries()].sort((a, b) => b[1] - a[1]);
}

export function SpendVeilDemo() {
  const [activeTab, setActiveTab] = useState<DemoTab>("overview");
  const [moreOpen, setMoreOpen] = useState(false);
  const demoScrollRef = useRef<HTMLDivElement>(null);
  const [expenses, setExpenses] = useState(starterExpenses);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [reportCategory, setReportCategory] = useState("All");
  const [receiptReady, setReceiptReady] = useState(false);
  const [receiptAdded, setReceiptAdded] = useState(false);
  const [question, setQuestion] = useState("How much did I spend this month?");
  const [answer, setAnswer] = useState("Type a supported spending question or choose an example.");
  const [storageCleared, setStorageCleared] = useState(false);
  const [veilAssist, setVeilAssist] = useState(false);
  const [recurring, setRecurring] = useState<RecurringItem[]>([
    { id: 1, merchant: "Fibre Internet", amount: 89.99, cadence: "Monthly", next: "Sep 1, 2026", active: true },
    { id: 2, merchant: "Music Subscription", amount: 12.99, cadence: "Monthly", next: "Sep 6, 2026", active: true },
    { id: 3, merchant: "Home Insurance", amount: 720, cadence: "Yearly", next: "Nov 12, 2026", active: false },
  ]);

  const augustExpenses = expenses.filter((item) => item.month === "August 2026");
  const augustTotal = augustExpenses.reduce((sum, item) => sum + item.amount, 0);
  const filteredExpenses = expenses.filter((item) => {
    const haystack = [item.merchant, item.category, item.person, item.note, item.receiptText]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return (category === "All" || item.category === category) && haystack.includes(search.toLowerCase());
  });

  const reportExpenses = augustExpenses.filter(
    (item) => reportCategory === "All" || item.category === reportCategory,
  );
  const reportTotal = reportExpenses.reduce((sum, item) => sum + item.amount, 0);
  const reportTotals = groupTotals(reportExpenses);
  const categoryTotals = groupTotals(augustExpenses);
  const budget = 1800;
  const recurringMonthly = recurring
    .filter((item) => item.active)
    .reduce((sum, item) => {
      if (item.cadence === "Weekly") return sum + (item.amount * 52) / 12;
      if (item.cadence === "Yearly") return sum + item.amount / 12;
      return sum + item.amount;
    }, 0);

  const donut = useMemo(() => {
    if (!reportTotal) return "conic-gradient(#d7dddf 0 100%)";
    let cursor = 0;
    const stops = reportTotals.map(([name, total]) => {
      const start = cursor;
      cursor += (total / reportTotal) * 100;
      return `${categoryColors[name] ?? categoryColors.Other} ${start}% ${cursor}%`;
    });
    return `conic-gradient(${stops.join(",")})`;
  }, [reportTotal, reportTotals]);

  function scrollToDemo(tab: DemoTab) {
    selectDemoTab(tab);
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function selectDemoTab(tab: DemoTab) {
    setActiveTab(tab);
    setMoreOpen(false);
    requestAnimationFrame(() => demoScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function addReceipt() {
    if (receiptAdded) return;
    setExpenses((items) => [
      { id: 99, merchant: "Northside Café", amount: 18.75, category: "Dining", person: "Me", date: "Aug 24", month: "August 2026", receiptText: "latte sandwich total 18.75", note: "Imported from demo receipt" },
      ...items,
    ]);
    setReceiptAdded(true);
  }

  function askSpendVeil(nextQuestion = question) {
    const normalized = nextQuestion.toLowerCase();
    const julyExpenses = expenses.filter((item) => item.month === "July 2026");
    const julyTotal = julyExpenses.reduce((sum, item) => sum + item.amount, 0);
    const largest = categoryTotals[0];
    const taxTotal = augustExpenses.filter((item) => item.tax).reduce((sum, item) => sum + item.amount, 0);

    if (normalized.includes("largest") || normalized.includes("top category")) {
      setAnswer(largest ? `${largest[0]} is the largest category at ${money(largest[1])}.` : "No matching expenses.");
    } else if (normalized.includes("last month") || normalized.includes("july")) {
      setAnswer(`July spending was ${money(julyTotal)} across ${julyExpenses.length} expenses.`);
    } else if (normalized.includes("budget") || normalized.includes("left")) {
      setAnswer(`${money(Math.max(0, budget - augustTotal))} remains from the ${money(budget)} monthly budget.`);
    } else if (normalized.includes("tax")) {
      setAnswer(`${money(taxTotal)} is marked tax-deductible across ${augustExpenses.filter((item) => item.tax).length} expenses.`);
    } else if (normalized.includes("month") || normalized.includes("spend") || normalized.includes("total")) {
      setAnswer(`August spending is ${money(augustTotal)} across ${augustExpenses.length} expenses.`);
    } else {
      setAnswer("Try asking about this month, last month, the largest category, your budget, or tax-labelled expenses.");
    }
  }

  function exportSample() {
    const rows = [
      ["Date", "Merchant", "Category", "Paid by", "Amount", "Currency"],
      ...reportExpenses.map((item) => [item.date, item.merchant, item.category, item.person, item.amount.toFixed(2), "CAD"]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "spendveil-demo-export.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="SpendVeil home">
          <img src="app-icon.png" alt="" width="42" height="42" />
          <span>SpendVeil</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#demo">Demo</a>
          <a href="#features">Features</a>
          <a href="#privacy">Privacy</a>
          <a href="#included">Included</a>
        </nav>
        <a className="header-cta" href="#demo">Try the demo</a>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <div className="hero-copy">
            <div className="eyebrow"><span /> Private by design · Built for iPhone</div>
            <h1>See your spending.<br /><em>Keep it yours.</em></h1>
            <p>Track expenses, scan receipts, organize family spending, and understand every month—without linking a bank account or sending your financial history to an advertising cloud.</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => scrollToDemo("overview")}>Explore the live demo <span>↘</span></button>
              <a className="secondary-button" href="#privacy">How privacy works <span>→</span></a>
            </div>
            <ul className="trust-row" aria-label="SpendVeil principles">
              <li>✓ No account</li>
              <li>✓ No bank connection</li>
              <li>✓ On-device OCR</li>
            </ul>
          </div>

          <div className="hero-product" aria-label="SpendVeil app preview">
            <div className="veil veil-one" /><div className="veil veil-two" />
            <div className="hero-phone">
              <div className="phone-island" />
              <div className="phone-heading"><span>SpendVeil</span><b>＋</b></div>
              <div className="spend-card">
                <div><span>August 2026</span><small>{augustExpenses.length} expenses</small></div>
                <p>Spent this month</p>
                <strong>{money(augustTotal)}</strong>
                <small>Private, local records</small>
              </div>
              <div className="mini-budget"><b>Monthly budget</b><span>{Math.round((augustTotal / budget) * 100)}% used</span><i><em style={{ width: `${Math.min(100, (augustTotal / budget) * 100)}%` }} /></i></div>
              <div className="mini-categories">
                <b>Top categories</b>
                {categoryTotals.slice(0, 3).map(([name, total]) => (
                  <div key={name}><span>{name}</span><i><em style={{ width: `${(total / augustTotal) * 100}%`, background: categoryColors[name] }} /></i><strong>{money(total)}</strong></div>
                ))}
              </div>
            </div>
            <div className="hero-float hero-float-receipt"><span>⌑</span><div><small>Receipt recognized</small><b>Northside Café · $18.75</b></div></div>
            <div className="hero-float hero-float-private"><span>✓</span> Processed on device</div>
          </div>
        </section>

        <section className="proof-strip" aria-label="Product facts">
          <div><strong>0</strong><span>accounts required</span></div>
          <div><strong>Local</strong><span>expense storage</span></div>
          <div><strong>7</strong><span>interactive demo areas</span></div>
          <div><strong>All</strong><span>features included</span></div>
        </section>

        <section className="demo-section" id="demo">
          <div className="section-heading centered">
            <span className="kicker">Interactive iPhone experience</span>
            <h2>Use it like the app.</h2>
            <p>Tap the iPhone controls, move between tabs, and scroll inside the screen. The demo uses sample data only and never touches the app on your phone.</p>
          </div>

          <div className="iphone-demo-stage">
            <aside className="iphone-demo-guide" aria-label="How to use the iPhone demo">
              <span className="kicker">A real app-shaped tour</span>
              <h3>Every feature lives inside the phone.</h3>
              <p>The frame behaves like SpendVeil on iPhone: a compact navigation bar, scrollable screens, a central add button, and an iOS-style More sheet.</p>
              <ol>
                <li><b>Tap Add</b><span>Process and review a sample receipt.</span></li>
                <li><b>Use the tab bar</b><span>Explore expenses and visual reports.</span></li>
                <li><b>Open More</b><span>Try recurring, Ask SpendVeil, and privacy controls.</span></li>
              </ol>
              <div className="iphone-demo-privacy"><span>✓</span><p><b>Safe product demo</b><small>Sample data stays in this browser tab.</small></p></div>
            </aside>

            <div className="iphone-device" aria-label="Interactive SpendVeil iPhone demo">
              <i className="iphone-button iphone-silent" aria-hidden="true" />
              <i className="iphone-button iphone-volume-up" aria-hidden="true" />
              <i className="iphone-button iphone-volume-down" aria-hidden="true" />
              <i className="iphone-button iphone-power" aria-hidden="true" />
              <div className="iphone-screen">
                <div className="iphone-statusbar" aria-hidden="true"><b>9:41</b><span className="dynamic-island" /><span className="iphone-signals">▮▮▮ ◔ ▰</span></div>
                <div className="iphone-appbar">
                  <div><img src="app-icon.png" alt="" width="34" height="34" /><span><small>Private · On device</small><b>{tabTitles[activeTab]}</b></span></div>
                  <button type="button" aria-label="Open Ask SpendVeil" onClick={() => selectDemoTab("ask")} className={activeTab === "ask" ? "active" : ""}>✦</button>
                </div>

                <div className="demo-workspace" ref={demoScrollRef}>
                  <div className="demo-topbar"><span className="demo-live"><i /> SAMPLE MODE</span><span>CAD · Aug 2026</span></div>

              {activeTab === "overview" && (
                <div className="demo-panel overview-panel">
                  <div className="panel-title"><div><span>OVERVIEW</span><h3>Your month at a glance</h3></div><button onClick={() => selectDemoTab("receipt")}>＋ Add expense</button></div>
                  <div className="overview-grid">
                    <div className="overview-total"><span>Spent this month</span><strong>{money(augustTotal)}</strong><small>{augustExpenses.length} expenses · August 2026</small></div>
                    <div className="overview-budget"><div><span>Budget remaining</span><strong>{money(Math.max(0, budget - augustTotal))}</strong></div><div className="budget-ring" style={{ background: `conic-gradient(#17bca9 0 ${Math.min(100, (augustTotal / budget) * 100)}%, #e7ecec 0 100%)` }}><i>{Math.round((augustTotal / budget) * 100)}%</i></div></div>
                  </div>
                  <div className="data-card"><div className="card-heading"><h4>Top categories</h4><button onClick={() => selectDemoTab("reports")}>Open reports →</button></div>{categoryTotals.slice(0, 5).map(([name, total]) => <div className="category-bar" key={name}><span>{name}</span><i><em style={{ width: `${(total / augustTotal) * 100}%`, background: categoryColors[name] }} /></i><b>{Math.round((total / augustTotal) * 100)}%</b><strong>{money(total)}</strong></div>)}</div>
                </div>
              )}

              {activeTab === "expenses" && (
                <div className="demo-panel">
                  <div className="panel-title"><div><span>EXPENSES</span><h3>Find any purchase</h3></div><b className="result-count">{filteredExpenses.length} results</b></div>
                  <div className="expense-controls"><label><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Merchant, receipt, category…" aria-label="Search demo expenses" /></label><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter category">{categories.map((item) => <option key={item}>{item}</option>)}</select></div>
                  {["August 2026", "July 2026"].map((month) => {
                    const monthItems = filteredExpenses.filter((item) => item.month === month);
                    if (!monthItems.length) return null;
                    return <div className="month-group" key={month}><div className="month-divider"><h4>{month}</h4><span>{money(monthItems.reduce((sum, item) => sum + item.amount, 0))} · {monthItems.length} expenses</span></div>{monthItems.map((item) => <div className="expense-row" key={item.id}><span className="expense-icon" style={{ color: categoryColors[item.category], background: `${categoryColors[item.category]}18` }}>{item.category.slice(0, 1)}</span><div><b>{item.merchant}</b><small>{item.category} · {item.person}{item.receiptText ? " · Receipt saved" : ""}</small></div><strong>{money(item.amount)}</strong><time>{item.date}</time></div>)}</div>;
                  })}
                  {!filteredExpenses.length && <div className="empty-demo"><span>⌕</span><b>No matching sample expenses</b><small>Try “market,” “receipt,” “Alex,” or another category.</small></div>}
                </div>
              )}

              {activeTab === "receipt" && (
                <div className="demo-panel">
                  <div className="panel-title"><div><span>RECEIPT CAPTURE</span><h3>Turn paper into a record</h3></div><span className="on-device-pill">ON DEVICE</span></div>
                  <div className="receipt-flow">
                    <div className={`receipt-paper ${receiptReady ? "scanned" : ""}`}><div className="receipt-logo">NORTHSIDE CAFÉ</div><small>24 AUG 2026</small><i /><i /><div><span>Latte</span><b>$6.25</b></div><div><span>Lunch</span><b>$12.50</b></div><hr /><div className="receipt-total"><span>TOTAL</span><b>$18.75</b></div>{receiptReady && <em className="scan-line" />}</div>
                    <div className="receipt-result">
                      {!receiptReady ? <><span className="receipt-step">STEP 1</span><h4>Scan or upload a receipt</h4><p>The iPhone app accepts the document camera, a photo, or a file. Apple Vision reads text locally.</p><button className="primary-button compact" onClick={() => setReceiptReady(true)}>Process sample receipt</button></> : <><span className="receipt-step success">✓ DRAFT READY</span><h4>Review before saving</h4><div className="draft-grid"><label>Merchant<input readOnly value="Northside Café" /></label><label>Amount<input readOnly value="$18.75 CAD" /></label><label>Category<input readOnly value="Dining" /></label><label>Paid by<input readOnly value="Me" /></label></div><button className="primary-button compact" onClick={addReceipt} disabled={receiptAdded}>{receiptAdded ? "Added to this demo ✓" : "Add to demo expenses"}</button><p className="microcopy">SpendVeil never saves an AI suggestion without your review.</p></>}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "reports" && (
                <div className="demo-panel">
                  <div className="panel-title"><div><span>REPORTS</span><h3>Understand the total</h3></div><button className="export-button" onClick={exportSample}>⇱ Export sample CSV</button></div>
                  <div className="report-controls"><div><button className="active">Month</button><button>Year</button><button>All</button></div><select value={reportCategory} onChange={(event) => setReportCategory(event.target.value)} aria-label="Report category"><option>All</option>{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></div>
                  <div className="report-grid"><div className="report-summary"><span>August 2026</span><strong>{money(reportTotal)}</strong><small>{reportExpenses.length} matching expenses · Budget {money(budget)}</small><div className="trend-bars" aria-label="Six month spending trend"><i style={{ height: "42%" }} /><i style={{ height: "58%" }} /><i style={{ height: "48%" }} /><i style={{ height: "69%" }} /><i style={{ height: "54%" }} /><i className="active" style={{ height: "76%" }} /></div></div><div className="donut-card"><div className="donut" style={{ background: donut }}><i><b>{reportExpenses.length}</b><small>expenses</small></i></div><div className="donut-legend">{reportTotals.slice(0, 5).map(([name, total]) => <div key={name}><i style={{ background: categoryColors[name] }} /><span>{name}</span><b>{money(total)}</b></div>)}</div></div></div>
                  <p className="demo-note">Filters also support currency, family member, tax status, and searchable receipt text in the iPhone app.</p>
                </div>
              )}

              {activeTab === "recurring" && (
                <div className="demo-panel">
                  <div className="panel-title"><div><span>RECURRING</span><h3>Plan what comes next</h3></div><span className="free-pill">FREE FEATURE</span></div>
                  <div className="recurring-forecast"><span>Estimated monthly</span><strong>{money(recurringMonthly)}</strong><small>{recurring.filter((item) => item.active).length} active schedules · Next: Fibre Internet on Sep 1</small></div>
                  <div className="recurring-list">{recurring.map((item) => <div key={item.id}><span className="recurring-icon">↻</span><p><b>{item.merchant}</b><small>{item.cadence} · next {item.next}</small></p><strong>{money(item.amount)}</strong><button aria-label={`${item.active ? "Pause" : "Resume"} ${item.merchant}`} aria-pressed={item.active} className={`switch ${item.active ? "on" : ""}`} onClick={() => setRecurring((items) => items.map((entry) => entry.id === item.id ? { ...entry, active: !entry.active } : entry))}><i /></button></div>)}</div>
                  <p className="demo-note">In the app, tap a row to change the amount, cadence, next date, category, payer, or tax label. Swipe to delete a schedule.</p>
                </div>
              )}

              {activeTab === "ask" && (
                <div className="demo-panel">
                  <div className="panel-title"><div><span>ASK SPENDVEIL</span><h3>Ask exact questions locally</h3></div><span className="on-device-pill">ON DEVICE</span></div>
                  <div className="ask-card"><label>What do you want to know?<textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows={2} /></label><div className="question-chips">{["How much did I spend last month?", "What was my largest category?", "How much is left in my budget?", "How much is marked for taxes?"].map((item) => <button key={item} onClick={() => { setQuestion(item); askSpendVeil(item); }}>{item}</button>)}</div><button className="primary-button compact" onClick={() => askSpendVeil()}>Answer from sample data</button><div className="ask-answer" role="status" aria-live="polite"><span>✦</span><p><b>SpendVeil answer</b>{answer}</p></div></div>
                  <div className="guardrail-row"><div><b>Swift calculates</b><span>Totals, counts, budgets, and percentages are deterministic.</span></div><div><b>AI cannot edit</b><span>Optional Veil Assist can explain facts, never save or delete records.</span></div><div><b>No cloud fallback</b><span>Questions and answers are not uploaded or saved.</span></div></div>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="demo-panel">
                  <div className="panel-title"><div><span>PRIVACY & SETTINGS</span><h3>Control every boundary</h3></div><span className="personal-pill">FREE FULL VERSION</span></div>
                  <div className="settings-grid"><div className="settings-card"><h4>Veil Assist</h4><div><span><b>Optional Apple Intelligence</b><small>Off by default · no cloud fallback</small></span><button className={`switch ${veilAssist ? "on" : ""}`} aria-pressed={veilAssist} onClick={() => setVeilAssist(!veilAssist)}><i /></button></div><p>{veilAssist ? "Demo enabled. The iPhone feature still follows SpendVeil’s review-before-save guardrails." : "Standard search, OCR, categories, reports, and Ask SpendVeil do not require Veil Assist."}</p></div><div className="settings-card"><h4>On-device storage</h4><div><span><b>Receipt images</b><small>{storageCleared ? "0 KB" : "8.4 MB sample"}</small></span><button className="text-button danger" onClick={() => setStorageCleared(true)} disabled={storageCleared}>{storageCleared ? "Removed ✓" : "Remove images"}</button></div><p>Removing images keeps amounts, notes, categories, and recognized receipt text searchable.</p></div><div className="settings-card"><h4>Family organization</h4><div><span><b>Me, Alex</b><small>Local labels—not accounts</small></span><button className="text-button">Edit</button></div><p>Organize household spending without inviting anyone or creating an online profile.</p></div><div className="settings-card"><h4>Export boundaries</h4><div><span><b>CSV and Excel-compatible</b><small>Created only when requested</small></span><button className="text-button" onClick={exportSample}>Demo CSV</button></div><p>Temporary export files are protected and removed after sharing in the iPhone app.</p></div></div>
                </div>
              )}
                </div>

                {moreOpen && (
                  <div className="iphone-more-layer">
                    <button className="iphone-sheet-backdrop" type="button" aria-label="Close More menu" onClick={() => setMoreOpen(false)} />
                    <div className="iphone-more-sheet" role="dialog" aria-label="More SpendVeil features">
                      <div className="iphone-sheet-handle" />
                      <div className="iphone-sheet-title"><span><small>SPENDVEIL</small><b>More</b></span><button type="button" onClick={() => setMoreOpen(false)} aria-label="Close More menu">×</button></div>
                      {moreTabs.map((tab) => (
                        <button key={tab.id} type="button" onClick={() => selectDemoTab(tab.id)}>
                          <span>{tab.icon}</span><p><b>{tab.label}</b><small>{tab.id === "recurring" ? "Schedules and upcoming expenses" : tab.id === "ask" ? "Exact local answers with guardrails" : "Storage, family, exports, and AI controls"}</small></p><i>›</i>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <nav className="iphone-tabbar" role="tablist" aria-label="SpendVeil app tabs">
                  {tabMeta.filter((tab) => ["overview", "expenses"].includes(tab.id)).map((tab) => (
                    <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} className={activeTab === tab.id ? "active" : ""} onClick={() => selectDemoTab(tab.id)}><span>{tab.icon}</span><small>{tab.label}</small></button>
                  ))}
                  <button type="button" role="tab" aria-selected={activeTab === "receipt"} className={`iphone-add-tab ${activeTab === "receipt" ? "active" : ""}`} onClick={() => selectDemoTab("receipt")}><span>＋</span><small>Add</small></button>
                  {tabMeta.filter((tab) => tab.id === "reports").map((tab) => (
                    <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} className={activeTab === tab.id ? "active" : ""} onClick={() => selectDemoTab(tab.id)}><span>{tab.icon}</span><small>{tab.label}</small></button>
                  ))}
                  <button type="button" role="tab" aria-selected={moreTabs.some((tab) => tab.id === activeTab)} className={moreTabs.some((tab) => tab.id === activeTab) || moreOpen ? "active" : ""} onClick={() => setMoreOpen(!moreOpen)}><span>•••</span><small>More</small></button>
                </nav>
                <div className="iphone-home-indicator" aria-hidden="true" />
              </div>
            </div>
          </div>
        </section>

        <section className="features-section" id="features">
          <div className="section-heading"><div><span className="kicker">One private workspace</span><h2>Less bookkeeping.<br />More clarity.</h2></div><p>SpendVeil covers the daily path from capture to search to reports, with no required account and no automatic bank feed.</p></div>
          <div className="feature-grid">
            <article className="feature-card feature-wide"><span>⌑</span><small>CAPTURE</small><h3>Receipt scanning with review built in.</h3><p>Scan with the document camera or choose a photo or file. Apple Vision recognizes text on-device, and you approve the draft before it becomes an expense.</p><button onClick={() => scrollToDemo("receipt")}>Try receipt demo →</button></article>
            <article className="feature-card"><span>⌕</span><small>FIND</small><h3>Search what you remember.</h3><p>Merchant, receipt text, category, payer, notes, and tax labels are all searchable.</p><button onClick={() => scrollToDemo("expenses")}>Try search →</button></article>
            <article className="feature-card"><span>↻</span><small>REPEAT</small><h3>Plan recurring expenses.</h3><p>Create weekly, monthly, or yearly schedules. Edit, pause, resume, or delete them anytime.</p><button onClick={() => scrollToDemo("recurring")}>Try schedules →</button></article>
            <article className="feature-card"><span>◔</span><small>UNDERSTAND</small><h3>Charts without mystery math.</h3><p>Monthly, yearly, or all-time reports with category, trend, budget, payer, currency, and tax filters.</p><button onClick={() => scrollToDemo("reports")}>Try reports →</button></article>
            <article className="feature-card"><span>✦</span><small>ASK</small><h3>Answers with hard guardrails.</h3><p>Offline Ask SpendVeil calculates exact facts. Optional Veil Assist can explain precomputed results on compatible iPhones.</p><button onClick={() => scrollToDemo("ask")}>Try questions →</button></article>
          </div>
        </section>

        <section className="privacy-section" id="privacy">
          <div className="privacy-orbit"><i /><i /><span>✓</span></div>
          <div><span className="kicker">Privacy is the architecture</span><h2>Your financial life<br />stays yours.</h2><p>SpendVeil stores expense records and receipt images locally. Data leaves only when you explicitly export or share it.</p><div className="privacy-list"><article><b>01</b><div><strong>No required identity</strong><span>No app account, household invitations, or bank credentials.</span></div></article><article><b>02</b><div><strong>Protected local storage</strong><span>Receipt files use iOS file protection and are excluded from backup.</span></div></article><article><b>03</b><div><strong>On-device intelligence</strong><span>OCR, deterministic questions, and optional Apple Intelligence stay local.</span></div></article><article><b>04</b><div><strong>Explicit sharing</strong><span>Exports exist only when you ask for them and use the iOS share sheet.</span></div></article></div></div>
        </section>

        <section className="pricing-section" id="included">
          <div className="section-heading centered"><span className="kicker">Fully free</span><h2>Everything included. Nothing to unlock.</h2><p>No purchase, subscription, advertising, external payment, or bank connection. The public App Store release is being prepared.</p></div>
          <div className="pricing-grid"><article className="full-card free-full-card"><span>FREE FULL VERSION</span><h3>$0</h3><p>The complete private expense toolkit is included for everyone.</p><ul><li>✓ Manual entry and automatic categories</li><li>✓ Receipt scanning, storage, and search</li><li>✓ Recurring expenses and budgets</li><li>✓ Advanced charts, filters, and tax-labelled summaries</li><li>✓ Custom categories and family labels</li><li>✓ CSV and Excel-compatible export</li><li>✓ Ask SpendVeil and optional Veil Assist</li></ul><a href="mailto:ashkijiji@gmail.com?subject=SpendVeil%20launch">Ask about launch →</a></article></div>
        </section>

        <section className="compatibility"><div><span className="kicker">Compatibility</span><h2>Useful on every supported screen.</h2></div><div><article><b>iOS 17+</b><span>Core tracking, receipt OCR, recurring expenses, reports, and offline Ask SpendVeil.</span></article><article><b>Apple Intelligence devices</b><span>Optional Veil Assist on compatible iPhones running iOS 26 or later.</span></article><article><b>Accessibility first</b><span>Responsive layouts, Dynamic Type, VoiceOver labels, light mode, and dark mode.</span></article></div></section>

        <section className="faq-section"><div className="section-heading centered"><span className="kicker">Straight answers</span><h2>Before you ask.</h2></div><div className="faq-grid"><details><summary>Does SpendVeil connect to my bank or Apple Wallet?</summary><p>No. Expenses are entered manually or created from a receipt you choose to scan or upload. iOS does not provide a general real-time Wallet purchase feed to third-party expense apps.</p></details><details><summary>Does the website use my real data?</summary><p>No. This interactive tour uses a small fixed sample dataset inside your browser tab. It is separate from the iPhone app.</p></details><details><summary>Is Veil Assist required?</summary><p>No. It is optional and off by default. The standard search, receipt OCR, categorization, reports, and deterministic Ask SpendVeil features do not depend on generative AI.</p></details><details><summary>Can I delete receipt images?</summary><p>Yes. The app can remove stored receipt images while keeping the expense fields and recognized text searchable.</p></details><details><summary>Is tax output tax advice?</summary><p>No. SpendVeil organizes expenses you label for tax purposes and shows explicit disclaimers. Confirm decisions with a qualified professional.</p></details><details><summary>When can I download it?</summary><p>The fully free App Store release is being prepared and still requires Apple review before public availability.</p></details></div></section>

        <section className="final-cta"><img src="app-icon.png" alt="SpendVeil app icon" width="82" height="82" /><span className="kicker">SpendVeil for iPhone</span><h2>Clarity without surrender.</h2><p>Explore the complete sample flow now, or contact the developer about launch access.</p><div><button className="primary-button" onClick={() => scrollToDemo("overview")}>Open interactive demo</button><a className="secondary-button" href="mailto:ashkijiji@gmail.com?subject=SpendVeil">Contact support</a></div></section>
      </main>

      <footer><div className="footer-brand"><img src="app-icon.png" alt="" width="34" height="34" /><b>SpendVeil</b><span>Private expense tracking for iPhone.</span></div><div><a href="privacy-policy.html">Privacy policy</a><a href="support.html">Support</a><a href="mailto:ashkijiji@gmail.com">Email</a></div><small>© 2026 Ash Moobed. SpendVeil is not financial or tax advice.</small></footer>
    </>
  );
}

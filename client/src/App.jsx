import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, CalendarDays, Check, ChevronDown,
  CirclePlus, Coffee, CreditCard, Download, Edit3, Filter, IndianRupee,
  LayoutDashboard, LoaderCircle, MoreHorizontal, ReceiptText, Search,
  ShoppingBag, Sparkles, Trash2, TrendingUp, Wallet, X
} from "lucide-react";
import { createExpense, deleteExpense, getExpenses, getSummary, updateExpense } from "./api";

const CATEGORIES = ["Food", "Travel", "Books", "Entertainment", "Bills", "Other"];
const ICONS = { Food: Coffee, Travel: ArrowUpRight, Books: ReceiptText, Entertainment: Sparkles, Bills: CreditCard, Other: ShoppingBag };
const today = new Date().toISOString().slice(0, 10);
const currentMonth = today.slice(0, 7);
const money = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n || 0));
const prettyDate = (value) => new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const emptyForm = { title: "", amount: "", category: "Food", date: today, note: "" };

function App() {
  const [month, setMonth] = useState(currentMonth);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ total: 0, categories: [] });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [items, totals] = await Promise.all([getExpenses(month), getSummary(month)]);
      setExpenses(items);
      setSummary(totals);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { loadData(); }, [loadData]);

  const visibleExpenses = useMemo(() => expenses.filter((item) => {
    const matchesQuery = `${item.title} ${item.note || ""}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (categoryFilter === "All" || item.category === categoryFilter);
  }), [expenses, query, categoryFilter]);

  const maxCategory = Math.max(1, ...(summary.categories || []).map((c) => c.total));

  function updateField(event) {
    const { name, value } = event.target;
    setForm((old) => ({ ...old, [name]: value }));
  }

  function startEdit(item) {
    setEditingId(item._id);
    setForm({
      title: item.title,
      amount: String(item.amount),
      category: item.category,
      date: item.date.slice(0, 10),
      note: item.note || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice("");
    setError("");
    const payload = { ...form, amount: Number(form.amount) };
    if (!payload.title.trim()) return setError("Please enter an expense title.");
    if (!Number.isFinite(payload.amount) || payload.amount <= 0) return setError("Amount must be greater than zero.");
    if (!payload.date) return setError("Please choose an expense date.");

    setSaving(true);
    try {
      if (editingId) await updateExpense(editingId, payload);
      else await createExpense(payload);
      setNotice(editingId ? "Expense updated successfully." : "Expense added successfully.");
      resetForm();
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this expense? This action cannot be undone.")) return;
    setError("");
    try {
      await deleteExpense(id);
      setNotice("Expense deleted.");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  function exportCsv() {
    const rows = [["Title", "Amount (INR)", "Category", "Date", "Note"],
      ...visibleExpenses.map((e) => [e.title, e.amount, e.category, e.date.slice(0, 10), e.note || ""])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `spendwise-${month}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  const monthLabel = new Date(`${month}-01T00:00:00`).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Wallet size={22} /></div><span>spend<span className="brand-light">wise</span></span></div>
        <div className="side-label">WORKSPACE</div>
        <div className="nav-item active"><LayoutDashboard size={18} /> Overview</div>
        <div className="side-note"><div className="note-icon"><Sparkles size={17}/></div><strong>Small steps,<br/>smarter spending.</strong><p>Keep an eye on every rupee and make your money count.</p></div>
        <div className="sidebar-bottom"><div className="avatar">SS</div><div><strong>Student account</strong><span>Personal workspace</span></div><MoreHorizontal size={18} className="muted"/></div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> <strong>Overview</strong></div>
          <div className="top-actions"><span className="today-pill"><span className="online-dot"></span> Expense tracker</span><div className="avatar small">SS</div></div>
        </header>

        <section className="page-heading">
          <div><div className="eyebrow"><Activity size={14}/> YOUR FINANCIAL SNAPSHOT</div><h1>Good to see you.</h1><p>Here’s where your money is going this month.</p></div>
          <label className="month-picker"><CalendarDays size={17}/><input type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></label>
        </section>

        {error && <div className="alert error"><X size={17}/>{error}<button onClick={() => setError("")}><X size={15}/></button></div>}
        {notice && <div className="alert success"><Check size={17}/>{notice}<button onClick={() => setNotice("")}><X size={15}/></button></div>}

        <section className="stats-grid">
          <div className="stat-card total-card"><div className="stat-top"><span>Total spent</span><span className="stat-icon dark"><Wallet size={18}/></span></div><div className="stat-value">{money(summary.total)}</div><div className="stat-foot"><span className="trend neutral"><TrendingUp size={14}/> Monthly total</span><span>{monthLabel}</span></div><div className="card-decoration"></div></div>
          <div className="stat-card"><div className="stat-top"><span>Transactions</span><span className="stat-icon mint"><ReceiptText size={18}/></span></div><div className="stat-value">{expenses.length}</div><div className="stat-foot"><span className="trend positive"><ArrowUpRight size={14}/> Recorded entries</span><span>This month</span></div></div>
          <div className="stat-card"><div className="stat-top"><span>Average expense</span><span className="stat-icon peach"><IndianRupee size={18}/></span></div><div className="stat-value">{money(expenses.length ? summary.total / expenses.length : 0)}</div><div className="stat-foot"><span className="trend neutral"><Activity size={14}/> Per transaction</span><span>Calculated</span></div></div>
        </section>

        <section className="content-grid">
          <div className="panel add-panel">
            <div className="panel-heading"><div><div className="eyebrow">QUICK ENTRY</div><h2>{editingId ? "Edit expense" : "Add an expense"}</h2></div><span className="panel-icon"><CirclePlus size={19}/></span></div>
            <form onSubmit={handleSubmit} className="expense-form">
              <label>Expense title<input name="title" value={form.title} onChange={updateField} placeholder="e.g. Lunch with friends" maxLength="80" /></label>
              <div className="form-row">
                <label>Amount (₹)<input name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={updateField} placeholder="0.00" /></label>
                <label>Date<input name="date" type="date" value={form.date} onChange={updateField} /></label>
              </div>
              <label>Category<select name="category" value={form.category} onChange={updateField}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select><ChevronDown className="select-chevron" size={15}/></label>
              <label>Note <span className="optional">(optional)</span><textarea name="note" value={form.note} onChange={updateField} placeholder="Add a little detail..." rows="2" maxLength="240"/></label>
              <div className="form-actions"><button className="primary-btn" type="submit" disabled={saving}>{saving ? <LoaderCircle className="spin" size={17}/> : <CirclePlus size={17}/>} {saving ? "Saving..." : editingId ? "Update expense" : "Add expense"}</button>{editingId && <button type="button" className="cancel-btn" onClick={resetForm}>Cancel</button>}</div>
            </form>
          </div>

          <div className="panel breakdown-panel">
            <div className="panel-heading"><div><div className="eyebrow">SPENDING HABITS</div><h2>Category breakdown</h2></div><span className="subtle-label">{monthLabel}</span></div>
            {(summary.categories || []).length === 0 ? <div className="empty-breakdown"><div className="empty-icon"><Activity size={22}/></div><strong>No spending yet</strong><span>Add your first expense to see the breakdown.</span></div> :
              <div className="category-list">{summary.categories.map((item) => {
                const Icon = ICONS[item.category] || ShoppingBag;
                return <div className="category-row" key={item.category}><div className="category-meta"><span className={`category-icon ${item.category.toLowerCase()}`}><Icon size={16}/></span><div className="category-name">{item.category}<span>{Math.round(item.total / (summary.total || 1) * 100)}% of spending</span></div><strong>{money(item.total)}</strong></div><div className="progress-track"><div className="progress-fill" style={{ width: `${item.total / maxCategory * 100}%` }} /></div></div>;
              })}</div>}
            <div className="breakdown-footer"><span><span className="online-dot"></span> Based on recorded expenses</span><span>{(summary.categories || []).length} categories</span></div>
          </div>
        </section>

        <section className="panel transactions-panel">
          <div className="transactions-heading"><div><div className="eyebrow">YOUR ACTIVITY</div><h2>Recent transactions <span className="count-badge">{visibleExpenses.length}</span></h2></div><button className="export-btn" onClick={exportCsv} disabled={!visibleExpenses.length}><Download size={16}/> Export CSV</button></div>
          <div className="filters"><div className="search-box"><Search size={16}/><input placeholder="Search expenses..." value={query} onChange={(e) => setQuery(e.target.value)}/></div><label className="filter-select"><Filter size={15}/><select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}><option>All</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label></div>
          <div className="table-wrap"><table><thead><tr><th>DESCRIPTION</th><th>CATEGORY</th><th>DATE</th><th>AMOUNT</th><th className="actions-head">ACTIONS</th></tr></thead><tbody>
            {loading ? <tr><td colSpan="5" className="table-state"><LoaderCircle className="spin" size={20}/> Loading expenses...</td></tr> :
             visibleExpenses.length === 0 ? <tr><td colSpan="5"><div className="empty-table"><div className="empty-icon"><ReceiptText size={22}/></div><strong>No transactions found</strong><span>Try another month or add a new expense.</span></div></td></tr> :
             visibleExpenses.map((item) => { const Icon = ICONS[item.category] || ShoppingBag; return <tr key={item._id}><td><div className="description-cell"><span className={`category-icon ${item.category.toLowerCase()}`}><Icon size={16}/></span><div><strong>{item.title}</strong><span>{item.note || "No additional note"}</span></div></div></td><td><span className={`category-tag ${item.category.toLowerCase()}`}>{item.category}</span></td><td className="date-cell">{prettyDate(item.date)}</td><td className="amount-cell">{money(item.amount)}</td><td><div className="row-actions"><button title="Edit expense" onClick={() => startEdit(item)}><Edit3 size={15}/></button><button title="Delete expense" onClick={() => handleDelete(item._id)}><Trash2 size={15}/></button></div></td></tr>; })}
          </tbody></table></div>
          <div className="table-footer"><span>Showing {visibleExpenses.length} of {expenses.length} transactions</span><span>All amounts in Indian Rupees (₹)</span></div>
        </section>
        <footer className="footer"><span>© {new Date().getFullYear()} SpendWise</span><span>Built to make student spending simpler <span className="footer-heart">♥</span></span></footer>
      </main>
    </div>
  );
}

export default App;

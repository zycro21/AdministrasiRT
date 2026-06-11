import { useEffect, useState, useCallback } from 'react'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts'
import api from '../lib/axios'
import { useAuth } from '../context/AuthContext'

// Helpers

function formatCurrency(val) {
  if (val == null) return '—'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0
  }).format(val)
}

function formatCurrencyShort(val) {
  if (val == null) return '—'
  if (Math.abs(val) >= 1_000_000) return `Rp ${(val / 1_000_000).toFixed(1)}jt`
  if (Math.abs(val) >= 1_000) return `Rp ${(val / 1_000).toFixed(0)}rb`
  return `Rp ${val}`
}

function formatMonth(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

// Custom Tooltip for Chart

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-xs">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-semibold text-slate-800">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

//  Stat Card 

function StatCard({ label, value, sub, icon, accent }) {
  const accents = {
    blue:   { bg: 'bg-blue-50',   border: 'border-blue-100',   icon: 'bg-blue-100 text-blue-600',   text: 'text-blue-700' },
    green:  { bg: 'bg-emerald-50',border: 'border-emerald-100',icon: 'bg-emerald-100 text-emerald-600', text: 'text-emerald-700' },
    red:    { bg: 'bg-red-50',    border: 'border-red-100',    icon: 'bg-red-100 text-red-500',     text: 'text-red-600' },
    amber:  { bg: 'bg-amber-50',  border: 'border-amber-100',  icon: 'bg-amber-100 text-amber-600', text: 'text-amber-700' },
    slate:  { bg: 'bg-white',     border: 'border-slate-200',  icon: 'bg-slate-100 text-slate-500', text: 'text-slate-700' },
  }
  const c = accents[accent] ?? accents.slate
  return (
    <div className={`rounded-2xl border p-5 ${c.bg} ${c.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">{label}</p>
          <p className={`text-2xl font-bold truncate ${c.text}`}>{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

// Section Header 

function SectionHeader({ title, sub, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <div>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  )
}

// Skeleton Block 

function SkeletonBlock({ h = 'h-64' }) {
  return <div className={`${h} bg-slate-100 rounded-2xl animate-pulse`} />
}

// Main Page

export default function DashboardPage() {
  const { user } = useAuth()

  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(true)

  const currentYear = new Date().getFullYear()
  const [chartYear, setChartYear] = useState(currentYear)
  const [monthlyData, setMonthlyData] = useState([])
  const [monthlyLoading, setMonthlyLoading] = useState(true)

  const currentMonth = `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  const [detailMonth, setDetailMonth] = useState(currentMonth)
  const [detailData, setDetailData] = useState(null)
  const [detailLoading, setDetailLoading] = useState(true)

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true)
    try {
      const res = await api.get('/dashboard/summary')
      setSummary(res.data)
    } catch { /* silent */ }
    finally { setSummaryLoading(false) }
  }, [])

  // Fetch yearly chart
  const fetchMonthly = useCallback(async (year) => {
    setMonthlyLoading(true)
    try {
      const res = await api.get('/dashboard/monthly-report', { params: { year } })
      // Ganti nama bulan Inggris ke Indonesia
      const mapped = (res.data.data ?? []).map((item, i) => ({
        ...item,
        month: MONTHS_ID[i] ?? item.month,
      }))
      setMonthlyData(mapped)
    } catch { /* silent */ }
    finally { setMonthlyLoading(false) }
  }, [])

  //  Fetch monthly detail (bills report + expenses) 
  const fetchDetail = useCallback(async (month) => {
    setDetailLoading(true)
    try {
      const [billRes, expRes] = await Promise.all([
        api.get('/monthly-bills/report', { params: { month: month + '-01' } }),
        api.get('/expenses', { params: { month: month + '-01', per_page: 100 } }),
      ])
      setDetailData({
        bills: billRes.data,
        expenses: expRes.data?.data ?? [],
      })
    } catch { /* silent */ }
    finally { setDetailLoading(false) }
  }, [])

  useEffect(() => { fetchSummary() }, [fetchSummary])
  useEffect(() => { fetchMonthly(chartYear) }, [chartYear, fetchMonthly])
  useEffect(() => { fetchDetail(detailMonth) }, [detailMonth, fetchDetail])

  // Derived
  const totalExpenseDetail = detailData?.expenses?.reduce((s, e) => s + Number(e.amount), 0) ?? 0
  const totalIncomeDetail = Number(detailData?.bills?.total_income ?? 0)
  const balanceDetail = totalIncomeDetail - totalExpenseDetail

  // Year options
  const yearOptions = []
  for (let y = currentYear; y >= currentYear - 4; y--) yearOptions.push(y)

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">
          Selamat datang, {user?.name} 👋
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Ringkasan administrasi perumahan hari ini.
        </p>
      </div>

      {/* Stat Cards */}
      {summaryLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonBlock key={i} h="h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Pemasukan"
            value={formatCurrency(summary?.total_income)}
            sub="Semua waktu"
            accent="green"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
              </svg>
            }
          />
          <StatCard
            label="Total Pengeluaran"
            value={formatCurrency(summary?.total_expense)}
            sub="Semua waktu"
            accent="red"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181" />
              </svg>
            }
          />
          <StatCard
            label="Saldo Kas"
            value={formatCurrency(summary?.balance)}
            sub="Pemasukan − Pengeluaran"
            accent={summary?.balance >= 0 ? 'blue' : 'amber'}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33" />
              </svg>
            }
          />
          <StatCard
            label="Tagihan Belum Lunas"
            value={summary?.unpaid_bills ?? 0}
            sub={`Dihuni: ${summary?.occupied_houses ?? 0} | Kosong: ${summary?.vacant_houses ?? 0}`}
            accent="amber"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            }
          />
        </div>
      )}

      {/* Grafik Tahunan */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <SectionHeader
          title="Pemasukan & Pengeluaran"
          sub="Perbandingan per bulan dalam satu tahun"
        >
          <select
            value={chartYear}
            onChange={e => setChartYear(Number(e.target.value))}
            className="text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-400 text-slate-700 bg-white"
          >
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </SectionHeader>

        {monthlyLoading ? <SkeletonBlock h="h-72" /> : (
          <>
            {/* Legend manual */}
            <div className="flex items-center gap-5 mb-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block bg-blue-500" />Pemasukan</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block bg-red-400" />Pengeluaran</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block bg-emerald-400" />Saldo</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData} barGap={4} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={formatCurrencyShort} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={64} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="income" name="Pemasukan" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="expense" name="Pengeluaran" fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Line dataKey="balance" name="Saldo" type="monotone" stroke="#34d399" strokeWidth={2} dot={{ r: 3, fill: '#34d399' }} />
              </BarChart>
            </ResponsiveContainer>

            {/* Ringkasan total tahun */}
            <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
              {(() => {
                const totInc = monthlyData.reduce((s, d) => s + d.income, 0)
                const totExp = monthlyData.reduce((s, d) => s + d.expense, 0)
                const totBal = totInc - totExp
                return [
                  { label: `Total Pemasukan ${chartYear}`, val: totInc, color: 'text-blue-600' },
                  { label: `Total Pengeluaran ${chartYear}`, val: totExp, color: 'text-red-500' },
                  { label: `Saldo ${chartYear}`, val: totBal, color: totBal >= 0 ? 'text-emerald-600' : 'text-amber-600' },
                ].map(item => (
                  <div key={item.label} className="text-center">
                    <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                    <p className={`text-sm font-bold ${item.color}`}>{formatCurrency(item.val)}</p>
                  </div>
                ))
              })()}
            </div>
          </>
        )}
      </div>

      {/* Detail Bulan */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <SectionHeader
          title="Detail Keuangan Bulanan"
          sub="Rincian pemasukan dan pengeluaran untuk bulan tertentu"
        >
          <input
            type="month"
            value={detailMonth}
            onChange={e => setDetailMonth(e.target.value)}
            className="text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-400 text-slate-700"
          />
        </SectionHeader>

        {detailLoading ? (
          <div className="space-y-3">
            <SkeletonBlock h="h-20" />
            <SkeletonBlock h="h-40" />
          </div>
        ) : (
          <div className="space-y-4">

            {/* Ringkasan bulan */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                <p className="text-xs text-blue-500 font-medium mb-1">Pemasukan</p>
                <p className="text-base font-bold text-blue-700">{formatCurrency(totalIncomeDetail)}</p>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                <p className="text-xs text-red-500 font-medium mb-1">Pengeluaran</p>
                <p className="text-base font-bold text-red-600">{formatCurrency(totalExpenseDetail)}</p>
              </div>
              <div className={`rounded-xl p-4 text-center border ${balanceDetail >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                <p className={`text-xs font-medium mb-1 ${balanceDetail >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>Saldo</p>
                <p className={`text-base font-bold ${balanceDetail >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>{formatCurrency(balanceDetail)}</p>
              </div>
            </div>

            {/* Grafik mini donat / bar bulanan */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Pemasukan — status tagihan */}
              <div className="border border-slate-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">Status Tagihan — {formatMonth(detailMonth)}</p>
                {(() => {
                  const paid = Number(detailData?.bills?.total_income ?? 0)
                  const partial = Number(detailData?.bills?.total_partially_paid ?? 0)
                  const pending = Number(detailData?.bills?.total_pending ?? 0)
                  const total = paid + partial + pending || 1
                  const items = [
                    { label: 'Lunas', val: paid, color: 'bg-emerald-500', text: 'text-emerald-700', pct: Math.round(paid / total * 100) },
                    { label: 'Sebagian', val: partial, color: 'bg-amber-400', text: 'text-amber-700', pct: Math.round(partial / total * 100) },
                    { label: 'Belum', val: pending, color: 'bg-red-400', text: 'text-red-600', pct: Math.round(pending / total * 100) },
                  ]
                  return (
                    <div className="space-y-3">
                      {/* Progress bar */}
                      <div className="flex rounded-full overflow-hidden h-2.5 gap-0.5">
                        {items.map(it => it.pct > 0 && (
                          <div key={it.label} className={`${it.color} transition-all`} style={{ width: `${it.pct}%` }} />
                        ))}
                      </div>
                      {items.map(it => (
                        <div key={it.label} className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full inline-block ${it.color}`} />
                            <span className="text-slate-500">{it.label}</span>
                          </span>
                          <span className={`font-semibold ${it.text}`}>{formatCurrency(it.val)}</span>
                        </div>
                      ))}
                      <p className="text-xs text-slate-400 pt-1 border-t border-slate-100">
                        Total tagihan: <span className="font-medium text-slate-600">{detailData?.bills?.bills_count ?? 0} tagihan</span>
                      </p>
                    </div>
                  )
                })()}
              </div>

              {/* Pengeluaran — daftar */}
              <div className="border border-slate-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">Pengeluaran — {formatMonth(detailMonth)}</p>
                {detailData?.expenses?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <svg className="w-8 h-8 text-slate-200 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75" />
                    </svg>
                    <p className="text-xs text-slate-400">Tidak ada pengeluaran bulan ini</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {detailData.expenses.map((exp) => (
                      <div key={exp.id} className="flex items-center justify-between gap-2 text-xs py-1.5 border-b border-slate-50 last:border-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                          <span className="text-slate-700 font-medium truncate">{exp.title}</span>
                        </div>
                        <span className="font-semibold text-red-600 whitespace-nowrap shrink-0">{formatCurrency(exp.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {detailData?.expenses?.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between text-xs">
                    <span className="text-slate-400">{detailData.expenses.length} item</span>
                    <span className="font-bold text-red-600">{formatCurrency(totalExpenseDetail)}</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Status Rumah */}
      {!summaryLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Status Hunian Rumah</p>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 shrink-0">
                <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
                  {(() => {
                    const occ = summary?.occupied_houses ?? 0
                    const vac = summary?.vacant_houses ?? 0
                    const total = occ + vac || 1
                    const pct = occ / total
                    const circ = 2 * Math.PI * 15.9
                    return (
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6"
                        strokeWidth="3.5" strokeDasharray={`${circ * pct} ${circ * (1 - pct)}`} strokeLinecap="round" />
                    )
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-base font-bold text-slate-800">{summary?.occupied_houses ?? 0}</span>
                  <span className="text-xs text-slate-400">dihuni</span>
                </div>
              </div>
              <div className="flex-1 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />Dihuni</span>
                  <span className="font-bold text-slate-700">{summary?.occupied_houses ?? 0} rumah</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" />Kosong</span>
                  <span className="font-bold text-slate-700">{summary?.vacant_houses ?? 0} rumah</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Kondisi Kas Keseluruhan</p>
            <div className="space-y-3">
              {[
                { label: 'Total Pemasukan', val: summary?.total_income ?? 0, color: 'bg-blue-500' },
                { label: 'Total Pengeluaran', val: summary?.total_expense ?? 0, color: 'bg-red-400' },
              ].map(item => {
                const max = Math.max(summary?.total_income ?? 1, summary?.total_expense ?? 1)
                const pct = Math.min(100, Math.round((item.val / max) * 100))
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">{item.label}</span>
                      <span className="font-semibold text-slate-700">{formatCurrency(item.val)}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
              <div className="pt-2 border-t border-slate-100 flex justify-between text-xs">
                <span className="text-slate-500">Saldo Kas</span>
                <span className={`font-bold ${(summary?.balance ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {formatCurrency(summary?.balance ?? 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
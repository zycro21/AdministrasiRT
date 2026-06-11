import { useEffect, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import api from '../../lib/axios'
import { useToast } from '../../components/ui/Toast'

// Helpers
function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatMonth(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

function formatCurrency(val) {
  if (val == null) return '—'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

//Skeleton

function SkeletonRow({ cols }) {
  return (
    <tr className="border-b border-slate-100">
      {[...Array(cols)].map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-4 bg-slate-100 rounded animate-pulse" style={{ width: `${50 + (i * 13) % 45}%` }} />
        </td>
      ))}
    </tr>
  )
}

// Pagination

function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null
  const { current_page, last_page } = meta
  const pages = []
  const delta = 1
  for (let i = 1; i <= last_page; i++) {
    if (i === 1 || i === last_page || (i >= current_page - delta && i <= current_page + delta)) pages.push(i)
    else if (i === current_page - delta - 1 || i === current_page + delta + 1) pages.push('...')
  }
  const deduped = pages.filter((p, i) => !(p === '...' && pages[i - 1] === '...'))
  return (
    <div className="flex items-center justify-between px-1 pt-4">
      <p className="text-xs text-slate-500">Halaman {current_page} dari {last_page}</p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(current_page - 1)} disabled={current_page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
        {deduped.map((p, i) =>
          p === '...' ? (
            <span key={`e-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-slate-400">…</span>
          ) : (
            <button key={p} onClick={() => onPageChange(p)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors
                ${p === current_page ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
              {p}
            </button>
          )
        )}
        <button onClick={() => onPageChange(current_page + 1)} disabled={current_page === last_page}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
        </button>
      </div>
    </div>
  )
}

// Action Menu

function ActionMenu({ items }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, right: 0 })
  const btnRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    const h = (e) => {
      if (btnRef.current && !btnRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleOpen = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      const menuHeight = 185
      const spaceBelow = window.innerHeight - rect.bottom
      const openUpward = spaceBelow < menuHeight + 8
      if (openUpward) {
        setPos({ bottom: window.innerHeight - rect.top + 4, top: undefined, right: window.innerWidth - rect.right })
      } else {
        setPos({ top: rect.bottom + window.scrollY + 4, bottom: undefined, right: window.innerWidth - rect.right })
      }
    }
    setOpen(v => !v)
  }

  return (
    <div ref={btnRef}>
      <button onClick={handleOpen}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>
      {open && createPortal(
        <div ref={menuRef}
          style={{ position: 'fixed', top: pos.top, bottom: pos.bottom, right: pos.right, zIndex: 9999 }}
          className="w-44 bg-white rounded-xl border border-slate-200 shadow-lg py-1 overflow-hidden">
          {items.map((item, i) => (
            <button key={i} onClick={() => { setOpen(false); item.onClick() }}
              className={`flex items-start gap-2.5 w-full px-4 py-2 text-sm text-left transition-colors
                ${item.danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50'}`}>
              <span className="mt-0.5 shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}

// Field

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ─── Modal Shell ──────────────────────────────────────────────────────────────

function Modal({ title, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-base font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">{children}</div>
        {footer && <div className="flex gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0">{footer}</div>}
      </div>
    </div>
  )
}

// Expense Form Modal

function ExpenseModal({ expense, onClose, onSuccess }) {
  const toast = useToast()
  const isEdit = !!expense
  const [form, setForm] = useState({
    title: expense?.title ?? '',
    description: expense?.description ?? '',
    amount: expense?.amount ?? '',
    expense_date: expense?.expense_date ? expense.expense_date.slice(0, 10) : '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: null }))
  }

  const handleSubmit = async () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Judul pengeluaran wajib diisi'
    if (!form.amount || isNaN(form.amount) || Number(form.amount) < 1) e.amount = 'Nominal wajib diisi dan lebih dari 0'
    if (!form.expense_date) e.expense_date = 'Tanggal wajib diisi'
    if (Object.keys(e).length) { setErrors(e); return }

    setSubmitting(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        amount: Number(form.amount),
        expense_date: form.expense_date,
      }
      if (isEdit) {
        await api.put(`/expenses/${expense.id}`, payload)
        toast.success('Pengeluaran berhasil diperbarui')
      } else {
        await api.post('/expenses', payload)
        toast.success('Pengeluaran berhasil ditambahkan')
      }
      onSuccess(); onClose()
    } catch (err) {
      const data = err?.response?.data
      if (data?.errors) {
        const mapped = {}
        Object.entries(data.errors).forEach(([k, v]) => { mapped[k] = v[0] })
        setErrors(mapped)
      } else {
        toast.error(data?.message || 'Terjadi kesalahan')
      }
    } finally { setSubmitting(false) }
  }

  const inputCls = (field) => `w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 outline-none transition-colors bg-white
    ${errors[field] ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-400'}`

  return (
    <Modal
      title={isEdit ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}
      onClose={onClose}
      footer={<>
        <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Batal</button>
        <button onClick={handleSubmit} disabled={submitting}
          className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors">
          {submitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah'}
        </button>
      </>}
    >
      <Field label="Judul Pengeluaran" error={errors.title}>
        <input type="text" name="title" value={form.title} onChange={handleChange}
          placeholder="Contoh: Beli cat tembok, Servis pompa air..."
          className={inputCls('title')} />
      </Field>
      <Field label="Nominal (Rp)" error={errors.amount}>
        <input type="number" name="amount" value={form.amount} onChange={handleChange}
          placeholder="Contoh: 150000" min={1}
          className={inputCls('amount')} />
      </Field>
      <Field label="Tanggal" error={errors.expense_date}>
        <input type="date" name="expense_date" value={form.expense_date} onChange={handleChange}
          className={inputCls('expense_date')} />
      </Field>
      <Field label="Deskripsi (opsional)" error={errors.description}>
        <textarea name="description" value={form.description} onChange={handleChange}
          rows={3} placeholder="Keterangan tambahan..."
          className={`${inputCls('description')} resize-none`} />
      </Field>
    </Modal>
  )
}

// Delete Confirm Modal

function DeleteConfirmModal({ title, description, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false)
  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
  }
  return (
    <Modal title={title} onClose={onClose}
      footer={<>
        <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Batal</button>
        <button onClick={handleConfirm} disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors">
          {loading ? 'Menghapus...' : 'Hapus'}
        </button>
      </>}>
      <p className="text-sm text-slate-600">{description}</p>
    </Modal>
  )
}

// Stat Card

function StatCard({ label, value, colorClass, bgClass, borderClass }) {
  return (
    <div className={`rounded-2xl border p-5 ${bgClass} ${borderClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">{label}</p>
      <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
    </div>
  )
}

// Main Page 

export default function ExpensesPage() {
  const toast = useToast()

  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [monthFilter, setMonthFilter] = useState('')

  const [showCreate, setShowCreate] = useState(false)
  const [editExpense, setEditExpense] = useState(null)
  const [deleteExpense, setDeleteExpense] = useState(null)

  // ── Fetch ──
  const fetchExpenses = useCallback(async (pg = 1, month = '') => {
    setLoading(true)
    try {
      const params = { page: pg }
      if (month) params.month = month + '-01'
      const res = await api.get('/expenses', { params })
      const d = res.data
      setExpenses(d.data ?? [])
      setMeta({ current_page: d.current_page, last_page: d.last_page, total: d.total, per_page: d.per_page })
    } catch {
      toast.error('Gagal memuat data pengeluaran')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchExpenses(page, monthFilter) }, [page, monthFilter, fetchExpenses])

  // ── Stats dari data yang sudah di-load ──
  const totalAmount = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const totalCount = meta?.total ?? 0

  // ── Handlers ──
  const handleDelete = async () => {
    try {
      await api.delete(`/expenses/${deleteExpense.id}`)
      toast.success('Pengeluaran berhasil dihapus')
      setDeleteExpense(null)
      const isLast = expenses.length === 1 && page > 1
      const pg = isLast ? page - 1 : page
      if (isLast) setPage(pg)
      fetchExpenses(pg, monthFilter)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal menghapus pengeluaran')
      setDeleteExpense(null)
    }
  }

  const handleMonthChange = (e) => {
    setMonthFilter(e.target.value)
    setPage(1)
  }
  const clearMonthFilter = () => { setMonthFilter(''); setPage(1) }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Pengeluaran</h2>
          <p className="text-sm text-slate-500 mt-0.5">Kelola data pengeluaran RT</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total Pengeluaran"
          value={totalCount}
          colorClass="text-blue-600"
          bgClass="bg-slate-50"
          borderClass="border-slate-200"
        />
        <StatCard
          label={monthFilter ? `Total Nominal (${formatMonth(monthFilter + '-01')})` : 'Total Nominal (Halaman Ini)'}
          value={formatCurrency(totalAmount)}
          colorClass="text-red-600"
          bgClass="bg-red-50/60"
          borderClass="border-red-100"
        />
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Table header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Daftar Pengeluaran</h3>
            <p className="text-xs text-slate-400 mt-0.5">Riwayat pengeluaran operasional RT</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="month"
              value={monthFilter}
              onChange={handleMonthChange}
              className="pl-3.5 pr-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors text-slate-700"
            />
            {monthFilter && (
              <button onClick={clearMonthFilter}
                className="text-xs text-slate-500 hover:text-slate-700 px-2.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-12">No</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Judul</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Deskripsi</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nominal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => <SkeletonRow key={i} cols={6} />)
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400 text-sm">
                    {monthFilter
                      ? `Tidak ada pengeluaran untuk bulan ${formatMonth(monthFilter + '-01')}`
                      : 'Belum ada data pengeluaran'}
                  </td>
                </tr>
              ) : expenses.map((exp, idx) => {
                const rowNum = ((meta?.current_page ?? 1) - 1) * (meta?.per_page ?? 20) + idx + 1
                return (
                  <tr key={exp.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-slate-500 text-xs">{rowNum}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">{exp.title}</td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs max-w-xs">
                      {exp.description
                        ? <span className="line-clamp-2">{exp.description}</span>
                        : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-red-600 whitespace-nowrap">{formatCurrency(exp.amount)}</td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">{formatDate(exp.expense_date)}</td>
                    <td className="px-4 py-3.5">
                      <ActionMenu items={[
                        {
                          label: 'Edit',
                          onClick: () => setEditExpense(exp),
                          icon: <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                        },
                        {
                          label: 'Hapus',
                          onClick: () => setDeleteExpense(exp),
                          danger: true,
                          icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                        },
                      ]} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {!loading && expenses.length > 0 && (
          <div className="px-5 py-4">
            <Pagination meta={meta} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <ExpenseModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setPage(1); fetchExpenses(1, monthFilter) }}
        />
      )}
      {editExpense && (
        <ExpenseModal
          expense={editExpense}
          onClose={() => setEditExpense(null)}
          onSuccess={() => fetchExpenses(page, monthFilter)}
        />
      )}
      {deleteExpense && (
        <DeleteConfirmModal
          title="Hapus Pengeluaran"
          description={`Yakin ingin menghapus pengeluaran "${deleteExpense.title}" senilai ${formatCurrency(deleteExpense.amount)}?`}
          onClose={() => setDeleteExpense(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}
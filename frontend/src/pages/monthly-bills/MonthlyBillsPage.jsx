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

// Badges 
function BillStatusBadge({ status }) {
  if (status === 'paid') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Lunas
    </span>
  )
  if (status === 'partially_paid') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />Sebagian
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />Belum Lunas
    </span>
  )
}

// Skeleton

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

// ─── Pagination ───────────────────────────────────────────────────────────────

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

// ─── Action Menu ──────────────────────────────────────────────────────────────

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
        setPos({
          bottom: window.innerHeight - rect.top + 4,
          top: undefined,
          right: window.innerWidth - rect.right,
        })
      } else {
        setPos({
          top: rect.bottom + window.scrollY + 4,
          bottom: undefined,
          right: window.innerWidth - rect.right,
        })
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

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

// --- SelectPortal ---------------------------------------------------------------

// Custom select yang render dropdown-nya via portal sehingga tidak terpotong modal.
// options: [{ value, label }]
function SelectPortal({ value, onChange, options, placeholder, disabled, error, name }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
  const triggerRef = useRef(null)
  const listRef = useRef(null)

  const selected = options.find(o => String(o.value) === String(value))

  useEffect(() => {
    const h = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        listRef.current && !listRef.current.contains(e.target)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleOpen = () => {
    if (disabled) return
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const maxHeight = 240
      const spaceBelow = window.innerHeight - rect.bottom
      const openUpward = spaceBelow < maxHeight + 8
      setPos({
        top: openUpward ? undefined : rect.bottom + 4,
        bottom: openUpward ? window.innerHeight - rect.top + 4 : undefined,
        left: rect.left,
        width: rect.width,
      })
    }
    setOpen(v => !v)
  }

  const handleSelect = (val) => {
    onChange({ target: { name, value: val } })
    setOpen(false)
  }

  const borderCls = error
    ? 'border-red-300 bg-red-50'
    : open
    ? 'border-blue-400 bg-white'
    : 'border-slate-200 bg-white'

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        onClick={handleOpen}
        disabled={disabled}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-left flex items-center justify-between gap-2 outline-none transition-colors
          ${borderCls} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-slate-300'}`}
      >
        <span className={selected ? 'text-slate-800' : 'text-slate-400'}>
          {disabled && !selected ? 'Memuat...' : selected ? selected.label : placeholder}
        </span>
        <svg className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && createPortal(
        <div
          ref={listRef}
          style={{
            position: 'fixed',
            top: pos.top,
            bottom: pos.bottom,
            left: pos.left,
            width: pos.width,
            zIndex: 9999,
            maxHeight: 240,
          }}
          className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-y-auto py-1"
        >
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-400">{placeholder}</div>
          ) : (
            options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                  ${String(opt.value) === String(value)
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-slate-700 hover:bg-slate-50'}`}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>,
        document.body
      )}
    </>
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

// ─── Payment Type Modal ───────────────────────────────────────────────────────

function PaymentTypeModal({ paymentType, onClose, onSuccess }) {
  const toast = useToast()
  const isEdit = !!paymentType
  const [form, setForm] = useState({ name: paymentType?.name ?? '', default_amount: paymentType?.default_amount ?? '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: null }))
  }

  const handleSubmit = async () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Nama jenis iuran wajib diisi'
    if (!form.default_amount || isNaN(form.default_amount) || Number(form.default_amount) < 0) e.default_amount = 'Nominal default wajib diisi'
    if (Object.keys(e).length) { setErrors(e); return }
    setSubmitting(true)
    try {
      const payload = { name: form.name.trim(), default_amount: Number(form.default_amount) }
      if (isEdit) {
        await api.put(`/payment-types/${paymentType.id}`, payload)
        toast.success('Jenis iuran berhasil diperbarui')
      } else {
        await api.post('/payment-types', payload)
        toast.success('Jenis iuran berhasil ditambahkan')
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

  return (
    <Modal title={isEdit ? 'Edit Jenis Iuran' : 'Tambah Jenis Iuran'} onClose={onClose}
      footer={<>
        <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Batal</button>
        <button onClick={handleSubmit} disabled={submitting}
          className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors">
          {submitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah'}
        </button>
      </>}>
      <Field label="Nama Jenis Iuran" error={errors.name}>
        <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Contoh: Satpam, Kebersihan..."
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 outline-none transition-colors
            ${errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-400 bg-white'}`} />
      </Field>
      <Field label="Nominal Default (Rp)" error={errors.default_amount}>
        <input type="number" name="default_amount" value={form.default_amount} onChange={handleChange} placeholder="Contoh: 100000" min={0}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 outline-none transition-colors
            ${errors.default_amount ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-400 bg-white'}`} />
      </Field>
    </Modal>
  )
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

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

// ─── Create Bill Modal ────────────────────────────────────────────────────────

function CreateBillModal({ onClose, onSuccess }) {
  const toast = useToast()
  const [form, setForm] = useState({ house_id: '', resident_id: '', payment_type_id: '', bill_month: '', notes: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const [houses, setHouses] = useState([])
  const [residents, setResidents] = useState([])
  const [paymentTypes, setPaymentTypes] = useState([])
  const [loadingHouses, setLoadingHouses] = useState(true)
  const [loadingResidents, setLoadingResidents] = useState(false)

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [hRes, ptRes] = await Promise.all([
          api.get('/houses', { params: { per_page: 100 } }),
          api.get('/payment-types', { params: { per_page: 100 } }),
        ])
        setHouses(hRes.data.data ?? [])
        setPaymentTypes(ptRes.data.data ?? [])
      } catch {
        toast.error('Gagal memuat data')
      } finally { setLoadingHouses(false) }
    }
    fetchInitial()
  }, [])

  // Fetch residents when house changes
  useEffect(() => {
    if (!form.house_id) { setResidents([]); return }
    const fetchResidents = async () => {
      setLoadingResidents(true)
      setForm(prev => ({ ...prev, resident_id: '' }))
      try {
        const res = await api.get(`/houses/${form.house_id}/detail`)
        const activeResidents = (res.data.current_residents ?? []).map(hr => hr.resident).filter(Boolean)
        setResidents(activeResidents)
      } catch { setResidents([]) }
      finally { setLoadingResidents(false) }
    }
    fetchResidents()
  }, [form.house_id])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: null }))
  }

  const handleSubmit = async () => {
    const e = {}
    if (!form.house_id) e.house_id = 'Pilih rumah'
    if (!form.resident_id) e.resident_id = 'Pilih penghuni'
    if (!form.payment_type_id) e.payment_type_id = 'Pilih jenis iuran'
    if (!form.bill_month) e.bill_month = 'Pilih bulan tagihan'
    if (Object.keys(e).length) { setErrors(e); return }
    setSubmitting(true)
    try {
      await api.post('/monthly-bills', {
        house_id: Number(form.house_id),
        resident_id: Number(form.resident_id),
        payment_type_id: Number(form.payment_type_id),
        bill_month: form.bill_month + '-01',
        notes: form.notes || undefined,
      })
      toast.success('Tagihan berhasil dibuat')
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
    <Modal title="Buat Tagihan Baru" onClose={onClose}
      footer={<>
        <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Batal</button>
        <button onClick={handleSubmit} disabled={submitting}
          className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors">
          {submitting ? 'Menyimpan...' : 'Buat Tagihan'}
        </button>
      </>}>
      <Field label="Rumah" error={errors.house_id}>
        <SelectPortal
          name="house_id"
          value={form.house_id}
          onChange={handleChange}
          disabled={loadingHouses}
          error={errors.house_id}
          placeholder={loadingHouses ? 'Memuat...' : '— Pilih Rumah —'}
          options={houses.map(h => ({ value: h.id, label: h.house_number + (h.address ? ' — ' + h.address : '') }))}
        />
      </Field>
      <Field label="Penghuni" error={errors.resident_id}>
        <SelectPortal
          name="resident_id"
          value={form.resident_id}
          onChange={handleChange}
          disabled={!form.house_id || loadingResidents}
          error={errors.resident_id}
          placeholder={loadingResidents ? 'Memuat...' : !form.house_id ? '— Pilih rumah dulu —' : residents.length === 0 ? '— Tidak ada penghuni aktif —' : '— Pilih Penghuni —'}
          options={residents.map(r => ({ value: r.id, label: r.full_name }))}
        />
      </Field>
      <Field label="Jenis Iuran" error={errors.payment_type_id}>
        <SelectPortal
          name="payment_type_id"
          value={form.payment_type_id}
          onChange={handleChange}
          error={errors.payment_type_id}
          placeholder="— Pilih Jenis Iuran —"
          options={paymentTypes.map(pt => ({ value: pt.id, label: pt.name + ' (' + formatCurrency(pt.default_amount) + ')' }))}
        />
      </Field>
      <Field label="Bulan Tagihan" error={errors.bill_month}>
        <input type="month" name="bill_month" value={form.bill_month} onChange={handleChange} className={inputCls('bill_month')} />
      </Field>
      <Field label="Catatan (opsional)" error={errors.notes}>
        <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder="Catatan tambahan..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 text-sm text-slate-800 placeholder-slate-400 outline-none transition-colors resize-none bg-white" />
      </Field>
    </Modal>
  )
}

// ─── Edit Bill Modal ──────────────────────────────────────────────────────────

function EditBillModal({ bill, onClose, onSuccess }) {
  const toast = useToast()
  const [form, setForm] = useState({ amount: bill.amount ?? '', status: bill.status ?? 'pending', notes: bill.notes ?? '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: null }))
  }

  const handleSubmit = async () => {
    const e = {}
    if (!form.amount || isNaN(form.amount) || Number(form.amount) < 0) e.amount = 'Nominal wajib diisi'
    if (Object.keys(e).length) { setErrors(e); return }
    setSubmitting(true)
    try {
      await api.put(`/monthly-bills/${bill.id}`, { amount: Number(form.amount), status: form.status, notes: form.notes || null })
      toast.success('Tagihan berhasil diperbarui')
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
    <Modal title="Edit Tagihan" onClose={onClose}
      footer={<>
        <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Batal</button>
        <button onClick={handleSubmit} disabled={submitting}
          className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors">
          {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </>}>
      <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 space-y-1">
        <p><span className="font-medium text-slate-700">Penghuni:</span> {bill.resident?.full_name ?? '—'}</p>
        <p><span className="font-medium text-slate-700">Rumah:</span> {bill.house?.house_number ?? '—'}</p>
        <p><span className="font-medium text-slate-700">Periode:</span> {formatMonth(bill.bill_month)}</p>
      </div>
      <Field label="Nominal (Rp)" error={errors.amount}>
        <input type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="Nominal tagihan" min={0} className={inputCls('amount')} />
      </Field>
      <Field label="Status" error={errors.status}>
        <SelectPortal
          name="status"
          value={form.status}
          onChange={handleChange}
          error={errors.status}
          placeholder="— Pilih Status —"
          options={[
            { value: 'pending', label: 'Belum Lunas' },
            { value: 'partially_paid', label: 'Sebagian Terbayar' },
            { value: 'paid', label: 'Lunas' },
          ]}
        />
      </Field>
      <Field label="Catatan (opsional)" error={errors.notes}>
        <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder="Catatan tambahan..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 text-sm text-slate-800 placeholder-slate-400 outline-none transition-colors resize-none bg-white" />
      </Field>
    </Modal>
  )
}

// ─── Pay Bill Modal ───────────────────────────────────────────────────────────

function PayBillModal({ bill, onClose, onSuccess }) {
  const toast = useToast()
  const [form, setForm] = useState({ amount: '', notes: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: null }))
  }

  const handleSubmit = async () => {
    const e = {}
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = 'Nominal pembayaran wajib diisi'
    if (Object.keys(e).length) { setErrors(e); return }
    setSubmitting(true)
    try {
      await api.post('/payments', { monthly_bill_id: bill.id, amount: Number(form.amount), notes: form.notes || null })
      toast.success('Pembayaran berhasil dicatat')
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

  // Hitung sisa
  const totalPaid = bill.payments ? bill.payments.reduce((s, p) => s + Number(p.amount), 0) : 0
  const remaining = Number(bill.amount) - totalPaid

  return (
    <Modal title="Catat Pembayaran" onClose={onClose}
      footer={<>
        <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Batal</button>
        <button onClick={handleSubmit} disabled={submitting || bill.status === 'paid'}
          className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 transition-colors">
          {submitting ? 'Menyimpan...' : 'Catat Pembayaran'}
        </button>
      </>}>
      <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 space-y-1">
        <p><span className="font-medium text-slate-700">Penghuni:</span> {bill.resident?.full_name ?? '—'}</p>
        <p><span className="font-medium text-slate-700">Rumah:</span> {bill.house?.house_number ?? '—'}</p>
        <p><span className="font-medium text-slate-700">Periode:</span> {formatMonth(bill.bill_month)}</p>
        <p><span className="font-medium text-slate-700">Jenis:</span> {bill.payment_type?.name ?? '—'}</p>
        <p><span className="font-medium text-slate-700">Total Tagihan:</span> {formatCurrency(bill.amount)}</p>
        <p><span className="font-medium text-slate-700">Sudah Dibayar:</span> {formatCurrency(totalPaid)}</p>
        <p><span className="font-medium text-emerald-700">Sisa:</span> <span className="font-semibold text-emerald-700">{formatCurrency(remaining)}</span></p>
      </div>
      {bill.status === 'paid' ? (
        <p className="text-sm text-center text-emerald-600 font-medium py-2">Tagihan ini sudah lunas.</p>
      ) : (
        <>
          <Field label="Jumlah Pembayaran (Rp)" error={errors.amount}>
            <input type="number" name="amount" value={form.amount} onChange={handleChange}
              placeholder={`Maks. ${formatCurrency(remaining)}`} min={1} max={remaining}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 outline-none transition-colors bg-white
                ${errors.amount ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-400'}`} />
          </Field>
          <button type="button" onClick={() => setForm(prev => ({ ...prev, amount: remaining }))}
            className="text-xs text-blue-600 hover:underline">
            Isi penuh sisa tagihan ({formatCurrency(remaining)})
          </button>
          <Field label="Catatan (opsional)" error={errors.notes}>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder="Catatan pembayaran..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 text-sm text-slate-800 placeholder-slate-400 outline-none transition-colors resize-none bg-white" />
          </Field>
        </>
      )}
    </Modal>
  )
}

// ─── Bill Detail Modal ────────────────────────────────────────────────────────

function BillDetailModal({ bill, onClose }) {
  const payments = bill.payments ?? []
  const totalPaid = payments.reduce((s, p) => s + Number(p.amount), 0)
  const remaining = Number(bill.amount) - totalPaid

  return (
    <Modal title="Detail Tagihan" onClose={onClose}>
      {/* Info tagihan */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
          </svg>
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Informasi Tagihan</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          <span className="text-slate-500">Penghuni</span>
          <span className="font-medium text-slate-800 text-right">{bill.resident?.full_name ?? '—'}</span>
          <span className="text-slate-500">Rumah</span>
          <span className="font-medium text-slate-800 text-right">{bill.house?.house_number ?? '—'}</span>
          <span className="text-slate-500">Periode</span>
          <span className="font-medium text-slate-800 text-right">{formatMonth(bill.bill_month)}</span>
          <span className="text-slate-500">Jenis Iuran</span>
          <span className="font-medium text-slate-800 text-right">{bill.payment_type?.name ?? '—'}</span>
          <span className="text-slate-500">Status</span>
          <span className="text-right"><BillStatusBadge status={bill.status} /></span>
        </div>
      </div>

      {/* Ringkasan nominal */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-400 mb-1">Total Tagihan</p>
          <p className="text-sm font-bold text-slate-800">{formatCurrency(bill.amount)}</p>
        </div>
        <div className="bg-white border border-emerald-200 rounded-xl p-3 text-center">
          <p className="text-xs text-emerald-500 mb-1">Sudah Dibayar</p>
          <p className="text-sm font-bold text-emerald-700">{formatCurrency(totalPaid)}</p>
        </div>
        <div className={`rounded-xl p-3 text-center border ${remaining > 0 ? 'bg-white border-red-200' : 'bg-white border-slate-200'}`}>
          <p className={`text-xs mb-1 ${remaining > 0 ? 'text-red-400' : 'text-slate-400'}`}>Sisa</p>
          <p className={`text-sm font-bold ${remaining > 0 ? 'text-red-600' : 'text-slate-400'}`}>{formatCurrency(remaining)}</p>
        </div>
      </div>

      {/* Riwayat pembayaran */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
          </svg>
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
            Riwayat Pembayaran
            {payments.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 font-semibold normal-case tracking-normal">
                {payments.length}x
              </span>
            )}
          </span>
        </div>

        {payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-7 rounded-xl border border-dashed border-slate-200 bg-slate-50/60">
            <svg className="w-8 h-8 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-xs text-slate-400">Belum ada pembayaran yang dicatat</p>
          </div>
        ) : (
          <div className="space-y-2">
            {payments.map((p, idx) => (
              <div key={p.id ?? idx} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-white hover:border-blue-100 hover:bg-blue-50/30 transition-colors">
                {/* Nomor urut cicilan */}
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-blue-700">{formatCurrency(p.amount)}</span>
                    <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                      {p.paid_at
                        ? new Date(p.paid_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </span>
                  </div>
                  {p.notes && (
                    <p className="mt-1 text-xs text-slate-500 truncate">
                      <span className="text-slate-400">Catatan:</span> {p.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Catatan tagihan */}
      {bill.notes && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
          <p className="text-xs font-semibold text-amber-700 mb-1">Catatan Tagihan</p>
          <p className="text-xs text-amber-800">{bill.notes}</p>
        </div>
      )}
    </Modal>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MonthlyBillsPage() {
  const toast = useToast()

  // ── Payment Types state ──
  const [paymentTypes, setPaymentTypes] = useState([])
  const [ptLoading, setPtLoading] = useState(true)
  const [ptMeta, setPtMeta] = useState(null)
  const [ptPage, setPtPage] = useState(1)
  const [showAddPT, setShowAddPT] = useState(false)
  const [editPT, setEditPT] = useState(null)
  const [deletePT, setDeletePT] = useState(null)

  // ── Bills state ──
  const [bills, setBills] = useState([])
  const [billsLoading, setBillsLoading] = useState(true)
  const [billsMeta, setBillsMeta] = useState(null)
  const [billsPage, setBillsPage] = useState(1)
  const [monthFilter, setMonthFilter] = useState('')
  const [showCreateBill, setShowCreateBill] = useState(false)
  const [editBill, setEditBill] = useState(null)
  const [payBill, setPayBill] = useState(null)
  const [deleteBill, setDeleteBill] = useState(null)
  const [detailBill, setDetailBill] = useState(null)

  // ── Fetch payment types ──
  const fetchPaymentTypes = useCallback(async (pg = 1) => {
    setPtLoading(true)
    try {
      const res = await api.get('/payment-types', { params: { page: pg } })
      const d = res.data
      setPaymentTypes(d.data ?? [])
      setPtMeta({ current_page: d.current_page, last_page: d.last_page, total: d.total, per_page: d.per_page })
    } catch { toast.error('Gagal memuat jenis iuran') }
    finally { setPtLoading(false) }
  }, [toast])

  // ── Fetch bills ──
  const fetchBills = useCallback(async (pg = 1, month = '') => {
    setBillsLoading(true)
    try {
      const params = { page: pg }
      if (month) params.month = month + '-01'
      const res = await api.get('/monthly-bills', { params })
      const d = res.data
      setBills(d.data ?? [])
      setBillsMeta({ current_page: d.current_page, last_page: d.last_page, total: d.total, per_page: d.per_page })
    } catch { toast.error('Gagal memuat data tagihan') }
    finally { setBillsLoading(false) }
  }, [toast])

  useEffect(() => { fetchPaymentTypes(ptPage) }, [ptPage, fetchPaymentTypes])
  useEffect(() => { fetchBills(billsPage, monthFilter) }, [billsPage, monthFilter, fetchBills])

  // ── Delete handlers ──
  const handleDeletePT = async () => {
    try {
      await api.delete(`/payment-types/${deletePT.id}`)
      toast.success('Jenis iuran berhasil dihapus')
      setDeletePT(null)
      fetchPaymentTypes(ptPage)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal menghapus jenis iuran')
      setDeletePT(null)
    }
  }

  const handleDeleteBill = async () => {
    try {
      await api.delete(`/monthly-bills/${deleteBill.id}`)
      toast.success('Tagihan berhasil dihapus')
      setDeleteBill(null)
      const isLast = bills.length === 1 && billsPage > 1
      const pg = isLast ? billsPage - 1 : billsPage
      if (isLast) setBillsPage(pg)
      fetchBills(pg, monthFilter)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal menghapus tagihan')
      setDeleteBill(null)
    }
  }

  const handleMonthChange = (e) => {
    setMonthFilter(e.target.value)
    setBillsPage(1)
  }
  const clearMonthFilter = () => { setMonthFilter(''); setBillsPage(1) }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Tagihan Pembayaran</h2>
          <p className="text-sm text-slate-500 mt-0.5">Kelola jenis iuran dan tagihan bulanan penghuni</p>
        </div>
        <button onClick={() => setShowCreateBill(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Buat Tagihan
        </button>
      </div>

      {/* ── Tabel Jenis Iuran ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Jenis Iuran</h3>
            <p className="text-xs text-slate-400 mt-0.5">Daftar jenis iuran yang berlaku</p>
          </div>
          <button onClick={() => setShowAddPT(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl hover:bg-slate-700 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Tambah Jenis
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-12">No</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Iuran</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nominal Default</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Dibuat</th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {ptLoading ? (
                [...Array(3)].map((_, i) => <SkeletonRow key={i} cols={5} />)
              ) : paymentTypes.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400 text-sm">Belum ada jenis iuran</td></tr>
              ) : paymentTypes.map((pt, idx) => {
                const rowNum = ((ptMeta?.current_page ?? 1) - 1) * (ptMeta?.per_page ?? 20) + idx + 1
                return (
                  <tr key={pt.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-slate-500 text-xs">{rowNum}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">{pt.name}</td>
                    <td className="px-4 py-3.5 text-slate-700">{formatCurrency(pt.default_amount)}</td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs">{formatDate(pt.created_at)}</td>
                    <td className="px-4 py-3.5">
                      <ActionMenu items={[
                        {
                          label: 'Edit', onClick: () => setEditPT(pt),
                          icon: <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                        },
                        {
                          label: 'Hapus', onClick: () => setDeletePT(pt), danger: true,
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
        {!ptLoading && paymentTypes.length > 0 && (
          <div className="px-5 py-4"><Pagination meta={ptMeta} onPageChange={setPtPage} /></div>
        )}
      </div>

      {/* ── Tabel Tagihan ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Daftar Tagihan</h3>
            <p className="text-xs text-slate-400 mt-0.5">Riwayat tagihan iuran bulanan seluruh penghuni</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input type="month" value={monthFilter} onChange={handleMonthChange}
                className="pl-3.5 pr-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors text-slate-700" />
            </div>
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Periode</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Penghuni</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rumah</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Jenis Iuran</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nominal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {billsLoading ? (
                [...Array(8)].map((_, i) => <SkeletonRow key={i} cols={8} />)
              ) : bills.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16 text-slate-400 text-sm">
                  {monthFilter ? `Tidak ada tagihan untuk bulan ${formatMonth(monthFilter + '-01')}` : 'Belum ada data tagihan'}
                </td></tr>
              ) : bills.map((bill, idx) => {
                const rowNum = ((billsMeta?.current_page ?? 1) - 1) * (billsMeta?.per_page ?? 20) + idx + 1
                const menuItems = []
                menuItems.push({
                  label: 'Detail', onClick: () => setDetailBill(bill),
                  icon: <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>
                })
                if (bill.status !== 'paid') {
                  menuItems.push({
                    label: 'Pembayaran', onClick: () => setPayBill(bill),
                    icon: <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
                  })
                }
                menuItems.push({
                  label: 'Edit', onClick: () => setEditBill(bill),
                  icon: <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                })
                menuItems.push({
                  label: 'Hapus', onClick: () => setDeleteBill(bill), danger: true,
                  icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                })
                return (
                  <tr key={bill.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-slate-500 text-xs">{rowNum}</td>
                    <td className="px-4 py-3.5 text-slate-600 text-xs whitespace-nowrap">{formatMonth(bill.bill_month)}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">{bill.resident?.full_name ?? '—'}</td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs">{bill.house?.house_number ?? '—'}</td>
                    <td className="px-4 py-3.5 text-slate-600">{bill.payment_type?.name ?? '—'}</td>
                    <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">{formatCurrency(bill.amount)}</td>
                    <td className="px-4 py-3.5"><BillStatusBadge status={bill.status} /></td>
                    <td className="px-4 py-3.5"><ActionMenu items={menuItems} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {!billsLoading && bills.length > 0 && (
          <div className="px-5 py-4"><Pagination meta={billsMeta} onPageChange={setBillsPage} /></div>
        )}
      </div>

      {/* Modals */}
      {showAddPT && <PaymentTypeModal onClose={() => setShowAddPT(false)} onSuccess={() => fetchPaymentTypes(ptPage)} />}
      {editPT && <PaymentTypeModal paymentType={editPT} onClose={() => setEditPT(null)} onSuccess={() => fetchPaymentTypes(ptPage)} />}
      {deletePT && (
        <DeleteConfirmModal
          title="Hapus Jenis Iuran"
          description={`Yakin ingin menghapus jenis iuran "${deletePT.name}"? Jika sudah digunakan di tagihan, penghapusan akan ditolak.`}
          onClose={() => setDeletePT(null)}
          onConfirm={handleDeletePT}
        />
      )}

      {detailBill && <BillDetailModal bill={detailBill} onClose={() => setDetailBill(null)} />}
      {showCreateBill && <CreateBillModal onClose={() => setShowCreateBill(false)} onSuccess={() => { setBillsPage(1); fetchBills(1, monthFilter) }} />}
      {editBill && <EditBillModal bill={editBill} onClose={() => setEditBill(null)} onSuccess={() => fetchBills(billsPage, monthFilter)} />}
      {payBill && <PayBillModal bill={payBill} onClose={() => setPayBill(null)} onSuccess={() => fetchBills(billsPage, monthFilter)} />}
      {deleteBill && (
        <DeleteConfirmModal
          title="Hapus Tagihan"
          description={`Yakin ingin menghapus tagihan ${deleteBill.payment_type?.name ?? ''} bulan ${formatMonth(deleteBill.bill_month)} atas nama ${deleteBill.resident?.full_name ?? ''}?`}
          onClose={() => setDeleteBill(null)}
          onConfirm={handleDeleteBill}
        />
      )}
    </div>
  )
}
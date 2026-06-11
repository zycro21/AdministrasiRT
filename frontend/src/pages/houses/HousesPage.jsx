import { useEffect, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import api from '../../lib/axios'
import { useToast } from '../../components/ui/Toast'

//Helper

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatCurrency(val) {
  if (val == null) return '—'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

// Stat Card

function StatCard({ label, value, loading, accent }) {
  const accents = {
    blue:  'border-blue-100 bg-blue-50/40',
    green: 'border-emerald-100 bg-emerald-50/40',
    amber: 'border-amber-100 bg-amber-50/40',
  }
  const textAccents = {
    blue:  'text-blue-700',
    green: 'text-emerald-700',
    amber: 'text-amber-700',
  }
  return (
    <div className={`rounded-2xl border p-5 flex flex-col gap-2 ${accents[accent] ?? 'bg-white border-slate-200'}`}>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      {loading ? (
        <div className="h-8 w-12 bg-slate-100 rounded animate-pulse" />
      ) : (
        <p className={`text-2xl font-bold ${textAccents[accent] ?? 'text-slate-800'}`}>{value}</p>
      )}
    </div>
  )
}

// Occupancy Badge 

function OccupancyBadge({ status }) {
  if (status === 'occupied') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
        Dihuni
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
      Tidak Dihuni
    </span>
  )
}

// Payment Status Badge

function PaymentStatusBadge({ payments }) {
  const paid = payments && payments.length > 0
  if (paid) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
        Lunas
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
      Belum Lunas
    </span>
  )
}

// Skeleton Row 

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100">
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-4 bg-slate-100 rounded animate-pulse" style={{ width: `${55 + (i * 12) % 40}%` }} />
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
  const left = current_page - delta
  const right = current_page + delta
  for (let i = 1; i <= last_page; i++) {
    if (i === 1 || i === last_page || (i >= left && i <= right)) pages.push(i)
    else if (i === left - 1 || i === right + 1) pages.push('...')
  }
  const deduped = pages.filter((p, i) => !(p === '...' && pages[i - 1] === '...'))
  return (
    <div className="flex items-center justify-between px-1 pt-4">
      <p className="text-xs text-slate-500">Halaman {current_page} dari {last_page}</p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(current_page - 1)} disabled={current_page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
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
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Action Menu 

function ActionMenu({ onDetail, onEdit, onAssign, onDelete }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, right: 0 })
  const btnRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    const h = (e) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) setOpen(false)
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

  const Item = ({ label, icon, onClick, danger }) => (
    <button onClick={() => { setOpen(false); onClick() }}
      className={`flex items-start gap-2.5 w-full px-4 py-2 text-sm text-left transition-colors
        ${danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50'}`}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span>{label}</span>
    </button>
  )

  return (
    <div ref={btnRef}>
      <button onClick={handleOpen}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>
      {open && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: pos.top, bottom: pos.bottom, right: pos.right, zIndex: 9999 }}
          className="w-48 bg-white rounded-xl border border-slate-200 shadow-lg py-1 overflow-hidden"
        >
          <Item label="Detail" onClick={onDetail} icon={
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          } />
          <Item label="Edit" onClick={onEdit} icon={
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
          } />
          <Item label="Assign / Ganti Penghuni" onClick={onAssign} icon={
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          } />
          <div className="border-t border-slate-100 my-1" />
          <Item label="Hapus" onClick={onDelete} danger icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          } />
        </div>,
        document.body
      )}
    </div>
  )
}

//Field 

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

// Add / Edit House Modal 

function HouseFormModal({ house, onClose, onSuccess }) {
  const toast = useToast()
  const isEdit = !!house
  const [form, setForm] = useState({
    house_number: house?.house_number ?? '',
    address: house?.address ?? '',
    occupancy_status: house?.occupancy_status ?? 'vacant',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: null }))
  }

  const handleSubmit = async () => {
    const e = {}
    if (!form.house_number.trim()) e.house_number = 'Nomor rumah wajib diisi'
    if (Object.keys(e).length) { setErrors(e); return }
    setSubmitting(true)
    try {
      if (isEdit) {
        await api.put(`/houses/${house.id}`, form)
        toast.success('Data rumah berhasil diperbarui')
      } else {
        await api.post('/houses', form)
        toast.success('Rumah berhasil ditambahkan')
      }
      onSuccess()
      onClose()
    } catch (err) {
      const data = err?.response?.data
      if (data?.errors) {
        const mapped = {}
        Object.entries(data.errors).forEach(([k, v]) => { mapped[k] = v[0] })
        setErrors(mapped)
      } else {
        toast.error(data?.message || 'Terjadi kesalahan')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">{isEdit ? 'Edit Rumah' : 'Tambah Rumah Baru'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <Field label="Nomor Rumah" error={errors.house_number}>
            <input type="text" name="house_number" value={form.house_number} onChange={handleChange}
              placeholder="Contoh: A-01"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 outline-none transition-colors
                ${errors.house_number ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-400 bg-white'}`} />
          </Field>
          <Field label="Alamat (opsional)" error={errors.address}>
            <textarea name="address" value={form.address} onChange={handleChange}
              placeholder="Masukkan alamat lengkap..." rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 text-sm text-slate-800 placeholder-slate-400 outline-none transition-colors resize-none bg-white" />
          </Field>
          <Field label="Status Hunian" error={errors.occupancy_status}>
            <select name="occupancy_status" value={form.occupancy_status} onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 bg-white text-sm text-slate-800 outline-none transition-colors">
              <option value="vacant">Tidak Dihuni</option>
              <option value="occupied">Dihuni</option>
            </select>
          </Field>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Batal</button>
          <button onClick={handleSubmit} disabled={submitting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors">
            {submitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Rumah'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Assign / Replace Residents Modal 

function AssignResidentModal({ house, onClose, onSuccess }) {
  const toast = useToast()
  const [allResidents, setAllResidents] = useState([])
  const [loadingResidents, setLoadingResidents] = useState(true)
  const [selectedIds, setSelectedIds] = useState([])
  const [startDate, setStartDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const fetchAll = async () => {
      setLoadingResidents(true)
      try {
        let pg = 1, collected = []
        while (true) {
          const res = await api.get('/residents', { params: { page: pg, per_page: 100 } })
          const d = res.data
          collected = [...collected, ...(d.data ?? [])]
          if (d.current_page >= d.last_page) break
          pg++
        }
        setAllResidents(collected)
      } catch {
        toast.error('Gagal memuat data penghuni')
      } finally {
        setLoadingResidents(false)
      }
    }
    fetchAll()
  }, [toast])

  const toggleResident = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    setErrors(prev => ({ ...prev, resident_ids: null }))
  }

  const handleSubmit = async () => {
    const e = {}
    if (selectedIds.length === 0) e.resident_ids = 'Pilih minimal 1 penghuni'
    if (!startDate) e.start_date = 'Tanggal mulai wajib diisi'
    if (Object.keys(e).length) { setErrors(e); return }
    setSubmitting(true)
    try {
      await api.post(`/houses/${house.id}/replace-residents`, {
        resident_ids: selectedIds,
        start_date: startDate,
      })
      toast.success('Penghuni rumah berhasil diperbarui')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal memperbarui penghuni')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">Assign / Ganti Penghuni</h2>
            <p className="text-xs text-slate-500 mt-0.5">Rumah {house.house_number}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5 space-y-4">
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
            Penghuni aktif saat ini akan digantikan. Pilih semua penghuni baru yang akan menempati rumah ini.
          </p>
          <Field label="Tanggal Mulai Tinggal" error={errors.start_date}>
            <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setErrors(p => ({ ...p, start_date: null })) }}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 outline-none transition-colors
                ${errors.start_date ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-400 bg-white'}`} />
          </Field>
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">
              Pilih Penghuni <span className="text-slate-400 font-normal">(bisa lebih dari 1)</span>
            </p>
            {loadingResidents ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                {allResidents.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">Tidak ada penghuni tersedia</p>
                ) : (
                  allResidents.map(r => {
                    const checked = selectedIds.includes(r.id)
                    return (
                      <label key={r.id}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-slate-100 last:border-0
                          ${checked ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                        <input type="checkbox" checked={checked} onChange={() => toggleResident(r.id)} className="w-4 h-4 rounded accent-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-slate-800">{r.full_name}</p>
                          <p className="text-xs text-slate-400">{r.phone_number} · {r.resident_status === 'permanent' ? 'Tetap' : 'Kontrak'}</p>
                        </div>
                      </label>
                    )
                  })
                )}
              </div>
            )}
            {errors.resident_ids && <p className="mt-1 text-xs text-red-500">{errors.resident_ids}</p>}
            {selectedIds.length > 0 && (
              <p className="mt-1.5 text-xs text-blue-600 font-medium">{selectedIds.length} penghuni dipilih</p>
            )}
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Batal</button>
          <button onClick={handleSubmit} disabled={submitting || loadingResidents}
            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors">
            {submitting ? 'Menyimpan...' : 'Simpan Penghuni'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Delete Confirm Modal 

function DeleteConfirmModal({ house, onClose, onSuccess }) {
  const toast = useToast()
  const [deleting, setDeleting] = useState(false)
  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/houses/${house.id}`)
      toast.success('Rumah berhasil dihapus')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal menghapus rumah')
    } finally {
      setDeleting(false)
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Hapus Rumah</h3>
            <p className="text-sm text-slate-500 mt-1">
              Apakah kamu yakin ingin menghapus rumah <span className="font-semibold text-slate-700">{house.house_number}</span>? Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Batal</button>
          <button onClick={handleDelete} disabled={deleting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors">
            {deleting ? 'Menghapus...' : 'Ya, Hapus'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Detail Modal

function DetailModal({ house, onClose }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('info')

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/houses/${house.id}/detail`)
        setDetail(res.data)
      } catch {
        // keep null
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [house.id])

  const tabs = [
    { key: 'info', label: 'Informasi' },
    { key: 'history', label: 'Riwayat Penghuni' },
    { key: 'payments', label: 'Riwayat Pembayaran' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">Detail Rumah {house.house_number}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{house.address || 'Tanpa alamat'}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`py-3 px-1 mr-6 text-sm font-medium border-b-2 transition-colors
                ${tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-5 bg-slate-100 rounded animate-pulse" style={{ width: `${50 + (i * 15) % 40}%` }} />
              ))}
            </div>
          ) : !detail ? (
            <p className="text-sm text-slate-400 text-center py-12">Gagal memuat data detail.</p>
          ) : (
            <>
              {/* Tab: Info */}
              {tab === 'info' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      ['Nomor Rumah', detail.house.house_number],
                      ['Status', detail.house.occupancy_status === 'occupied' ? 'Dihuni' : 'Tidak Dihuni'],
                      ['Alamat', detail.house.address || '—'],
                      ['Dibuat', formatDate(detail.house.created_at)],
                    ].map(([l, v]) => (
                      <div key={l}>
                        <p className="text-xs text-slate-400 mb-0.5">{l}</p>
                        <p className="text-sm font-medium text-slate-800">{v}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-3">Penghuni Saat Ini</p>
                    {detail.current_residents.length === 0 ? (
                      <p className="text-sm text-slate-400 py-4 text-center bg-slate-50 rounded-xl">Tidak ada penghuni aktif</p>
                    ) : (
                      <div className="space-y-2">
                        {detail.current_residents.map(hr => (
                          <div key={hr.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-800">{hr.resident?.full_name ?? '—'}</p>
                              <p className="text-xs text-slate-400">Mulai: {formatDate(hr.start_date)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Riwayat Penghuni */}
              {tab === 'history' && (
                detail.resident_history.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-12">Belum ada riwayat penghuni.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/60">
                          <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500">Penghuni</th>
                          <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500">Mulai</th>
                          <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500">Selesai</th>
                          <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.resident_history.map(hr => (
                          <tr key={hr.id} className="border-b border-slate-100">
                            <td className="px-3 py-3 font-medium text-slate-800">{hr.resident?.full_name ?? '—'}</td>
                            <td className="px-3 py-3 text-slate-500 text-xs">{formatDate(hr.start_date)}</td>
                            <td className="px-3 py-3 text-slate-500 text-xs">{hr.end_date ? formatDate(hr.end_date) : '—'}</td>
                            <td className="px-3 py-3">
                              {hr.is_active
                                ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">Aktif</span>
                                : <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">Selesai</span>
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}

              {/* Tab: Riwayat Pembayaran */}
              {tab === 'payments' && (
                detail.monthly_bills.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-12">Belum ada tagihan pembayaran.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/60">
                          <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500">Periode</th>
                          <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500">Jenis Iuran</th>
                          <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500">Penghuni</th>
                          <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500">Nominal</th>
                          <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.monthly_bills.map(bill => (
                          <tr key={bill.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                            <td className="px-3 py-3 text-slate-600 text-xs whitespace-nowrap">
                              {formatDate(bill.bill_month)}
                            </td>
                            <td className="px-3 py-3 text-slate-700">{bill.payment_type?.name ?? '—'}</td>
                            <td className="px-3 py-3 font-medium text-slate-800">{bill.resident?.full_name ?? '—'}</td>
                            <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{formatCurrency(bill.amount)}</td>
                            <td className="px-3 py-3"><PaymentStatusBadge payments={bill.payments} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100">
          <button onClick={onClose}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

// Main Page
export default function HousePage() {
  const toast = useToast()

  const [houses, setHouses] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, occupied: 0, vacant: 0 })

  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [assignTarget, setAssignTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [detailTarget, setDetailTarget] = useState(null)

  const fetchStats = useCallback(async () => {
  setStatsLoading(true)
  try {
    const res = await api.get('/houses/stats')
    setStats({
      total:    res.data.total    ?? 0,
      occupied: res.data.occupied ?? 0,
      vacant:   res.data.vacant   ?? 0,
    })
  } catch {
    // silent
  } finally {
    setStatsLoading(false)
  }
}, [])

  const fetchHouses = useCallback(async (pg = 1, q = '') => {
    setLoading(true)
    try {
      const params = { page: pg }
      if (q) params.search = q
      const res = await api.get('/houses', { params })
      const d = res.data
      setHouses(d.data ?? [])
      setMeta({
        current_page: d.current_page,
        last_page: d.last_page,
        total: d.total,
        per_page: d.per_page,
      })
    } catch {
      toast.error('Gagal memuat data rumah')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchStats() }, [fetchStats])
  useEffect(() => { fetchHouses(page, search) }, [page, search, fetchHouses])

  const handleSearch = (e) => { e.preventDefault(); setPage(1); setSearch(searchInput) }
  const handleSearchClear = () => { setSearchInput(''); setSearch(''); setPage(1) }
  const handlePageChange = (p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const handleMutationSuccess = () => { fetchHouses(page, search); fetchStats() }
  const handleAddSuccess = () => { setPage(1); setSearch(''); setSearchInput(''); fetchHouses(1, ''); fetchStats() }
  const handleDeleteSuccess = () => {
    const isLastOnPage = houses.length === 1 && page > 1
    const targetPage = isLastOnPage ? page - 1 : page
    if (isLastOnPage) setPage(targetPage)
    fetchHouses(targetPage, search)
    fetchStats()
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Rumah</h2>
          <p className="text-sm text-slate-500 mt-0.5">Kelola data rumah perumahan</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Rumah" value={stats.total} loading={statsLoading} accent="blue" />
        <StatCard label="Dihuni" value={stats.occupied} loading={statsLoading} accent="green" />
        <StatCard label="Tidak Dihuni" value={stats.vacant} loading={statsLoading} accent="amber" />
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl mb-10 border border-slate-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Daftar Rumah</h3>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
                placeholder="Cari nomor atau alamat..."
                className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors w-52" />
              {searchInput && (
                <button type="button" onClick={handleSearchClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button type="submit" className="px-3.5 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors">Cari</button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-12">No</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">No Rumah</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Alamat</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
              ) : houses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-400 text-sm">
                    {search ? `Tidak ada rumah dengan kata kunci "${search}"` : 'Belum ada data rumah'}
                  </td>
                </tr>
              ) : (
                houses.map((h, idx) => {
                  const rowNum = ((meta?.current_page ?? 1) - 1) * (meta?.per_page ?? 10) + idx + 1
                  return (
                    <tr key={h.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 text-slate-500 text-xs">{rowNum}</td>
                      <td className="px-4 py-3.5 font-semibold text-slate-800">{h.house_number}</td>
                      <td className="px-4 py-3.5 text-slate-500 text-xs max-w-xs truncate">{h.address || '—'}</td>
                      <td className="px-4 py-3.5"><OccupancyBadge status={h.occupancy_status} /></td>
                      <td className="px-4 py-3.5">
                        <ActionMenu
                          onDetail={() => setDetailTarget(h)}
                          onEdit={() => setEditTarget(h)}
                          onAssign={() => setAssignTarget(h)}
                          onDelete={() => setDeleteTarget(h)}
                        />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && houses.length > 0 && (
          <div className="px-5 py-4">
            <Pagination meta={meta} onPageChange={handlePageChange} />
          </div>
        )}
      </div>

      {showAdd && <HouseFormModal onClose={() => setShowAdd(false)} onSuccess={handleAddSuccess} />}
      {editTarget && <HouseFormModal house={editTarget} onClose={() => setEditTarget(null)} onSuccess={handleMutationSuccess} />}
      {assignTarget && <AssignResidentModal house={assignTarget} onClose={() => setAssignTarget(null)} onSuccess={handleMutationSuccess} />}
      {deleteTarget && <DeleteConfirmModal house={deleteTarget} onClose={() => setDeleteTarget(null)} onSuccess={handleDeleteSuccess} />}
      {detailTarget && <DetailModal house={detailTarget} onClose={() => setDetailTarget(null)} />}
    </div>
  )
}
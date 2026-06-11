import { useEffect, useState, useCallback, useRef } from 'react'
import api from '../../lib/axios'
import { useToast } from '../../components/ui/Toast'

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL ?? ''

function storageUrl(path) {
  if (!path) return null
  return `${STORAGE_URL}/${path}`
}

// Stat Card 
function StatCard({ label, value, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-2">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      {loading ? (
        <div className="h-8 w-16 bg-slate-100 rounded animate-pulse" />
      ) : (
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      )}
    </div>
  )
}

// Add Resident Modal 
function AddResidentModal({ onClose, onSuccess }) {
  const toast = useToast()
  const [form, setForm] = useState({
    full_name: '',
    phone_number: '',
    resident_status: 'permanent',
    marital_status: '0',
  })
  const [ktpFile, setKtpFile] = useState(null)
  const [ktpPreview, setKtpPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: null }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setKtpFile(file)
    setKtpPreview(URL.createObjectURL(file))
    setErrors((prev) => ({ ...prev, ktp_photo: null }))
  }

  const handleRemoveFile = () => {
    setKtpFile(null)
    setKtpPreview(null)
  }

  const validate = () => {
    const e = {}
    if (!form.full_name.trim()) e.full_name = 'Nama lengkap wajib diisi'
    if (!form.phone_number.trim()) e.phone_number = 'Nomor HP wajib diisi'
    if (!ktpFile) e.ktp_photo = 'Foto KTP wajib diunggah'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('full_name', form.full_name)
      fd.append('phone_number', form.phone_number)
      fd.append('resident_status', form.resident_status)
      fd.append('marital_status', form.marital_status)
      fd.append('ktp_photo', ktpFile)

      await api.post('/residents', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      toast.success('Penghuni berhasil ditambahkan')
      onSuccess()
      onClose()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Gagal menambahkan penghuni'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Tambah Penghuni Baru</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-5">

          {/* KTP Photo */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Foto KTP</p>
            <div className="flex items-center gap-3">
              {/* Preview box */}
              <div className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                {ktpPreview ? (
                  <img src={ktpPreview} alt="KTP preview" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                  </svg>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/jpg,image/jpeg,image/png"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      Upload foto KTP
                    </span>
                  </label>
                  {ktpFile && (
                    <button
                      onClick={handleRemoveFile}
                      className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors"
                    >
                      Hapus
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-400">File jpg atau png, maks 2MB</p>
              </div>
            </div>
            {errors.ktp_photo && (
              <p className="mt-1.5 text-xs text-red-500">{errors.ktp_photo}</p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 outline-none transition-colors
                ${errors.full_name
                  ? 'border-red-300 focus:border-red-400 bg-red-50'
                  : 'border-slate-200 focus:border-blue-400 bg-white'
                }`}
            />
            {errors.full_name && (
              <p className="mt-1 text-xs text-red-500">{errors.full_name}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nomor HP
            </label>
            <input
              type="text"
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              placeholder="Contoh: 08123456789"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 outline-none transition-colors
                ${errors.phone_number
                  ? 'border-red-300 focus:border-red-400 bg-red-50'
                  : 'border-slate-200 focus:border-blue-400 bg-white'
                }`}
            />
            {errors.phone_number && (
              <p className="mt-1 text-xs text-red-500">{errors.phone_number}</p>
            )}
          </div>

          {/* Status Penghuni & Status Menikah */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Status Penghuni
              </label>
              <select
                name="resident_status"
                value={form.resident_status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 bg-white text-sm text-slate-800 outline-none transition-colors"
              >
                <option value="permanent">Tetap</option>
                <option value="contract">Kontrak</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Status Menikah
              </label>
              <select
                name="marital_status"
                value={form.marital_status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 bg-white text-sm text-slate-800 outline-none transition-colors"
              >
                <option value="0">Belum Menikah</option>
                <option value="1">Menikah</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Kembali
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {submitting ? 'Menyimpan...' : 'Tambah Penghuni'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Edit Resident Modal 
function EditResidentModal({ resident, onClose, onSuccess }) {
  const toast = useToast()
  const [form, setForm] = useState({
    full_name: resident.full_name ?? '',
    phone_number: resident.phone_number ?? '',
    resident_status: resident.resident_status ?? 'permanent',
    marital_status: String(resident.marital_status ? '1' : '0'),
  })
  const [ktpFile, setKtpFile] = useState(null)
  const [ktpPreview, setKtpPreview] = useState(storageUrl(resident.ktp_photo))
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: null }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setKtpFile(file)
    setKtpPreview(URL.createObjectURL(file))
    setErrors((prev) => ({ ...prev, ktp_photo: null }))
  }

  const handleRemoveFile = () => {
    setKtpFile(null)
    setKtpPreview(null)
  }

  const handleSubmit = async () => {
    const e = {}
    if (!form.full_name.trim()) e.full_name = 'Nama lengkap wajib diisi'
    if (!form.phone_number.trim()) e.phone_number = 'Nomor HP wajib diisi'
    if (Object.keys(e).length) { setErrors(e); return }

    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('_method', 'PUT')
      fd.append('full_name', form.full_name)
      fd.append('phone_number', form.phone_number)
      fd.append('resident_status', form.resident_status)
      fd.append('marital_status', form.marital_status)
      if (ktpFile) fd.append('ktp_photo', ktpFile)

      await api.post(`/residents/${resident.id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      toast.success('Data penghuni berhasil diperbarui')
      onSuccess()
      onClose()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Gagal memperbarui data penghuni'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Edit Penghuni</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-5">

          {/* KTP Photo */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Foto KTP</p>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                {ktpPreview ? (
                  <img src={ktpPreview} alt="KTP preview" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                  </svg>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/jpg,image/jpeg,image/png"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      Ganti foto KTP
                    </span>
                  </label>
                  {ktpFile && (
                    <button
                      onClick={handleRemoveFile}
                      className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors"
                    >
                      Hapus
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-400">Kosongkan jika tidak ingin mengganti foto</p>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Lengkap</label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 outline-none transition-colors
                ${errors.full_name ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-400 bg-white'}`}
            />
            {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nomor HP</label>
            <input
              type="text"
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              placeholder="Contoh: 08123456789"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 outline-none transition-colors
                ${errors.phone_number ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-400 bg-white'}`}
            />
            {errors.phone_number && <p className="mt-1 text-xs text-red-500">{errors.phone_number}</p>}
          </div>

          {/* Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status Penghuni</label>
              <select
                name="resident_status"
                value={form.resident_status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 bg-white text-sm text-slate-800 outline-none transition-colors"
              >
                <option value="permanent">Tetap</option>
                <option value="contract">Kontrak</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status Menikah</label>
              <select
                name="marital_status"
                value={form.marital_status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 bg-white text-sm text-slate-800 outline-none transition-colors"
              >
                <option value="0">Belum Menikah</option>
                <option value="1">Menikah</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Delete Confirm Modal

function DeleteConfirmModal({ resident, onClose, onSuccess }) {
  const toast = useToast()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/residents/${resident.id}`)
      toast.success('Penghuni berhasil dihapus')
      onSuccess()
      onClose()
    } catch (err) {
      const msg = err?.response?.data?.message || 'Gagal menghapus penghuni'
      toast.error(msg)
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
            <h3 className="text-sm font-bold text-slate-800">Hapus Penghuni</h3>
            <p className="text-sm text-slate-500 mt-1">
              Apakah kamu yakin ingin menghapus <span className="font-semibold text-slate-700">{resident.full_name}</span>? Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors"
          >
            {deleting ? 'Menghapus...' : 'Ya, Hapus'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Action Menu (titik tiga) 

function ActionMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-20 w-36 bg-white rounded-xl border border-slate-200 shadow-lg py-1 overflow-hidden">
          <button
            onClick={() => { setOpen(false); onEdit() }}
            className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
            </svg>
            Edit
          </button>
          <button
            onClick={() => { setOpen(false); onDelete() }}
            className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Hapus
          </button>
        </div>
      )}
    </div>
  )
}

function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null

  const { current_page, last_page } = meta

  const pages = []
  const delta = 1
  const left = current_page - delta
  const right = current_page + delta

  for (let i = 1; i <= last_page; i++) {
    if (i === 1 || i === last_page || (i >= left && i <= right)) {
      pages.push(i)
    } else if (i === left - 1 || i === right + 1) {
      pages.push('...')
    }
  }

  // Deduplicate consecutive ellipsis
  const dedupedPages = pages.filter(
    (p, idx) => !(p === '...' && pages[idx - 1] === '...')
  )

  return (
    <div className="flex items-center justify-between px-1 pt-4">
      <p className="text-xs text-slate-500">
        Halaman {current_page} dari {last_page}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        {dedupedPages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-slate-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors
                ${p === current_page
                  ? 'bg-blue-600 text-white'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page === last_page}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Status Badge

function ResidentStatusBadge({ status }) {
  const map = {
    permanent: { label: 'Tetap', className: 'bg-blue-50 text-blue-700 border-blue-100' },
    contract:  { label: 'Kontrak', className: 'bg-amber-50 text-amber-700 border-amber-100' },
  }
  const s = map[status] ?? { label: status, className: 'bg-slate-100 text-slate-600 border-slate-200' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${s.className}`}>
      {s.label}
    </span>
  )
}

// Skeleton Row 

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100">
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-4 bg-slate-100 rounded animate-pulse" style={{ width: `${60 + (i * 10) % 40}%` }} />
        </td>
      ))}
    </tr>
  )
}

// Main Page

export default function ResidentPage() {
  const toast = useToast()

  const [residents, setResidents] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
  })

  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const res = await api.get('/residents/stats')
      setStats({
        total: res.data.total ?? 0,
        active: res.data.active ?? 0,
      })
    } catch {
      // silent
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const fetchResidents = useCallback(async (pg = 1, q = '') => {
    setLoading(true)
    try {
      const params = { page: pg }
      if (q) params.search = q
      const res = await api.get('/residents', { params })
      const d = res.data
      setResidents(d.data ?? [])
      setMeta({
        current_page: d.current_page,
        last_page: d.last_page,
        total: d.total,
        per_page: d.per_page,
      })
    } catch {
      toast.error('Gagal memuat data penghuni')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    fetchResidents(page, search)
  }, [page, search, fetchResidents])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  const handleSearchClear = () => {
    setSearchInput('')
    setSearch('')
    setPage(1)
  }

  const handlePageChange = (p) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAddSuccess = () => {
    setPage(1)
    setSearch('')
    setSearchInput('')
    fetchResidents(1, '')
    fetchStats()
  }

  const handleEditSuccess = () => {
    fetchResidents(page, search)
    fetchStats()
  }

  const handleDeleteSuccess = () => {
    // Jika halaman sekarang jadi kosong setelah delete, kembali ke halaman sebelumnya
    const isLastOnPage = residents.length === 1 && page > 1
    const targetPage = isLastOnPage ? page - 1 : page
    if (isLastOnPage) setPage(targetPage)
    fetchResidents(targetPage, search)
    fetchStats()
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Penghuni</h2>
          <p className="text-sm text-slate-500 mt-0.5">Kelola data penghuni perumahan</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard label="Jumlah Penghuni" value={stats.total} loading={statsLoading} />
        <StatCard label="Penghuni Aktif (Menempati Rumah)" value={stats.active} loading={statsLoading} />
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Table header: title + search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Daftar Penghuni</h3>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari nama, nomor HP..."
                className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-colors w-52"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleSearchClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors"
            >
              Cari
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-12">No</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Lengkap</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nomor HP</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status Nikah</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
              ) : residents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400 text-sm">
                    {search ? `Tidak ada penghuni dengan kata kunci "${search}"` : 'Belum ada data penghuni'}
                  </td>
                </tr>
              ) : (
                residents.map((r, idx) => {
                  const rowNum = ((meta?.current_page ?? 1) - 1) * (meta?.per_page ?? 10) + idx + 1
                  return (
                    <tr
                      key={r.id}
                      className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-slate-500 text-xs">{rowNum}</td>
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-slate-800">{r.full_name}</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{r.phone_number}</td>
                      <td className="px-4 py-3.5">
                        <ResidentStatusBadge status={r.resident_status} />
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {r.marital_status ? 'Menikah' : 'Belum Menikah'}
                      </td>
                      <td className="px-4 py-3.5">
                        <ActionMenu
                          onEdit={() => setEditTarget(r)}
                          onDelete={() => setDeleteTarget(r)}
                        />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && residents.length > 0 && (
          <div className="px-5 py-4">
            <Pagination meta={meta} onPageChange={handlePageChange} />
          </div>
        )}
      </div>

      {/* Modal Tambah */}
      {showModal && (
        <AddResidentModal
          onClose={() => setShowModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      {/* Modal Edit */}
      {editTarget && (
        <EditResidentModal
          resident={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Modal Hapus */}
      {deleteTarget && (
        <DeleteConfirmModal
          resident={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  )
}
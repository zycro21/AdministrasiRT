import { createContext, useContext, useEffect, useState } from 'react'

// ─── Icons ───────────────────────────────────────────────────────────────────
const icons = {
  success: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  ),
}

const styles = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error:   'bg-red-50 border-red-200 text-red-800',
  info:    'bg-blue-50 border-blue-200 text-blue-800',
}

const iconStyles = {
  success: 'text-emerald-500',
  error:   'text-red-500',
  info:    'text-blue-500',
}

// ─── Single Toast Item ────────────────────────────────────────────────────────
function ToastItem({ id, type = 'info', message, onRemove }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 10)
    const t2 = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onRemove(id), 300)
    }, 3500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [id, onRemove])

  const dismiss = () => {
    setVisible(false)
    setTimeout(() => onRemove(id), 300)
  }

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium
        transition-all duration-300 ease-out
        ${styles[type]}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
      style={{ minWidth: '260px', maxWidth: '360px' }}
    >
      <span className={iconStyles[type]}>{icons[type]}</span>
      <span className="flex-1">{message}</span>
      <button
        onClick={dismiss}
        className="ml-1 opacity-50 hover:opacity-100 transition-opacity"
        aria-label="Tutup notifikasi"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

// ─── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext(null)

let _id = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  const toast = {
    success: (msg) => setToasts((prev) => [...prev, { id: ++_id, message: msg, type: 'success' }]),
    error:   (msg) => setToasts((prev) => [...prev, { id: ++_id, message: msg, type: 'error' }]),
    info:    (msg) => setToasts((prev) => [...prev, { id: ++_id, message: msg, type: 'info' }]),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 items-end">
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} onRemove={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
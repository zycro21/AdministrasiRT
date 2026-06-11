import { useAuth } from '../context/AuthContext'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">
          Selamat datang, {user?.name} 👋
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Berikut ringkasan administrasi perumahan hari ini.
        </p>
      </div>

      {/* Placeholder cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Penghuni', value: '—', color: 'blue' },
          { label: 'Total Rumah', value: '—', color: 'indigo' },
          { label: 'Tagihan Bulan Ini', value: '—', color: 'violet' },
          { label: 'Pengeluaran Bulan Ini', value: '—', color: 'sky' },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-2"
          >
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {card.label}
            </p>
            <p className="text-2xl font-bold text-slate-800">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-400 text-sm">
        Konten dashboard akan ditambahkan di sini.
      </div>
    </div>
  )
}
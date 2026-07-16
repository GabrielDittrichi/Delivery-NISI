'use client'

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6faf7] p-4">
      <div className="max-w-md rounded-lg border border-emerald-100 bg-white p-8 text-center shadow-sm">
        <h2 className="mb-2 text-xl font-bold text-gray-950">Erro no admin</h2>
        <p className="mb-6 text-gray-600">Não foi possível carregar esta página. Tente novamente.</p>
        <button
          onClick={reset}
          className="rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white transition-colors hover:bg-emerald-800"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}

'use client'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8fbf8] p-4 text-center">
      <div className="max-w-md rounded-lg border border-emerald-100 bg-white p-8 shadow-sm">
        <h2 className="mb-2 text-xl font-bold text-gray-950">Algo deu errado</h2>
        <p className="mb-6 text-gray-600">Nao foi possivel carregar esta pagina. Tente novamente.</p>
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

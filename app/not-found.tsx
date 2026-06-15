import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8fbf8] p-4 text-center">
      <div className="max-w-md rounded-lg border border-emerald-100 bg-white p-8 shadow-sm">
        <h2 className="mb-2 text-xl font-bold text-gray-950">Pagina nao encontrada</h2>
        <p className="mb-6 text-gray-600">O produto ou pagina que voce procura nao existe.</p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white transition-colors hover:bg-emerald-800"
        >
          Voltar para o cardapio
        </Link>
      </div>
    </div>
  )
}

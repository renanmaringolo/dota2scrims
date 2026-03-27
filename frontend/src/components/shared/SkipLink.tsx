export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only fixed top-4 left-4 z-[100] rounded-lg bg-primary-400 px-4 py-2 text-sm font-semibold text-bg-primary shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-400/50"
    >
      Pular para o conteúdo principal
    </a>
  )
}

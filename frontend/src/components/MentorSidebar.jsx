const credentials = [
  'BITS Pilani',
  'Ex-Morgan Stanley',
  'Ex-Barclays Capital',
  'Ex-RBS',
  '20+ years experience',
  '2 lakh+ learners',
]

const socialLinks = ['LinkedIn', 'Twitter / X', 'Facebook', 'Instagram', 'Quora']

function MentorSidebar() {
  return (
    <aside className="hidden w-full max-w-[290px] flex-col bg-slate-950 px-8 py-10 text-white lg:flex">
      <div className="flex flex-col items-center border-b border-white/10 pb-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-amber-200/80 bg-slate-800 text-2xl font-bold text-amber-100">
          KK
        </div>
        <h1 className="mt-4 text-xl font-semibold">Kundan Kishore</h1>
        <p className="mt-1 text-xs uppercase tracking-[0.3em] text-amber-300/80">
          Options Trading Mentor
        </p>
      </div>

      <div className="pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Credentials
        </p>
        <ul className="mt-5 space-y-3 text-sm text-slate-200">
          {credentials.map((item) => (
            <li key={item} className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Follow Kundan
        </p>
        <div className="mt-5 space-y-3">
          {socialLinks.map((item) => (
            <button
              key={item}
              type="button"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-white/10"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-6 text-slate-400">
        Profit is a by-product. Logic, neutrality, and discipline come first.
      </div>
    </aside>
  )
}

export default MentorSidebar

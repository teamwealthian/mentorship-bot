function QuickReplyButtons({ options, onSelect }) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onSelect(option)}
          className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {option}
        </button>
      ))}
    </div>
  )
}

export default QuickReplyButtons

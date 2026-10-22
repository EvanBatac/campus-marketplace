export default function Input({
  as: Component = "input",
  className = "",
  ...props
}) {
  return (
    <Component
      className={`w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 aria-invalid:border-red-400 disabled:cursor-not-allowed disabled:opacity-60 ${props.readOnly ? "bg-slate-50 text-slate-500" : "bg-white text-slate-900"} ${className}`}
      {...props}
    />
  );
}

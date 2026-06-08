import { cn } from "../lib/utils";

type SettingsToggleProps = {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function SettingsToggle({ label, description, checked, onChange }: SettingsToggleProps) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-white/30 bg-white/20 p-4 transition hover:bg-white/30">
      <div>
        <p className="text-sm font-semibold text-slate-950">{label}</p>
        {description ? <p className="mt-1 text-xs text-slate-600">{description}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-11 flex-shrink-0 rounded-full transition",
          checked ? "bg-emerald-600" : "bg-slate-300"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
            checked ? "left-[22px]" : "left-0.5"
          )}
        />
      </button>
    </label>
  );
}

import { cn } from "@/lib/utils";

// Segmented sign in / sign up control. Squared to match the registry corners in
// the token set, not a pill. The sliding block is the only verde on the card
// besides the primary action.
export default function AuthSwitch({ mode, onChange, labels }) {
  const items = [
    { key: "signin", label: labels.signin },
    { key: "signup", label: labels.signup },
  ];

  return (
    <div className="relative flex w-full rounded border border-border bg-secondary p-1">
      <div
        className={cn(
          "absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] rounded-[calc(var(--radius)-0.375rem)] bg-primary transition-transform duration-300",
          mode === "signup" && "translate-x-[calc(100%+4px)]"
        )}
        style={{ transitionTimingFunction: "var(--ease-house)" }}
        aria-hidden="true"
      />
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange(item.key)}
          aria-pressed={mode === item.key}
          className={cn(
            "relative z-10 min-h-[40px] flex-1 rounded-[calc(var(--radius)-0.375rem)] text-sm font-semibold transition-colors duration-300",
            mode === item.key ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

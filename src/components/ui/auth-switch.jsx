import { cn } from "@/lib/utils";

export default function AuthSwitch({ mode, onChange, labels = { login: "Autentificare", register: "Înregistrare" } }) {
  return (
    <div className="relative flex w-full rounded-full bg-secondary p-1">
      <div
        className={cn(
          "absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-emerald shadow-soft transition-transform duration-300 ease-out",
          mode === "register" && "translate-x-[calc(100%+4px)]"
        )}
      />
      <button
        type="button"
        onClick={() => onChange("login")}
        className={cn(
          "relative z-10 flex-1 py-2 text-sm font-semibold transition-colors duration-300",
          mode === "login" ? "text-white" : "text-muted-foreground"
        )}
      >
        {labels.login}
      </button>
      <button
        type="button"
        onClick={() => onChange("register")}
        className={cn(
          "relative z-10 flex-1 py-2 text-sm font-semibold transition-colors duration-300",
          mode === "register" ? "text-white" : "text-muted-foreground"
        )}
      >
        {labels.register}
      </button>
    </div>
  );
}
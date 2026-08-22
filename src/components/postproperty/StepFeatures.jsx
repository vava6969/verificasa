import React from "react";
import { Chip } from "./wizardUi";
import { CHIP_OPTS, FACILITY_OPTS, OPTION_OPTS, optLabel } from "@/lib/propertyPayload";
import { useWiz } from "./wizardCopy";

const Group = ({ title, note, children }) => (
  <div>
    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{title}</p>
    <div className="flex flex-wrap gap-2">{children}</div>
    {note && <p className="mt-1.5 text-[11px] text-muted-foreground/80">{note}</p>}
  </div>
);

export default function StepFeatures({ form, set, chips, setChips, facilities, setFacilities }) {
  const { w, en } = useWiz();

  return (
    <div className="space-y-6">
      <Group title={w.f_verified} note={w.f_verified_note}>
        {CHIP_OPTS.map((c) => (
          <Chip key={c.key} icon={c.icon} label={optLabel(c, en)} active={!!chips[c.key]} onClick={() => setChips((s) => ({ ...s, [c.key]: !s[c.key] }))} />
        ))}
      </Group>

      <Group title={w.f_amenities}>
        {FACILITY_OPTS.map((c) => (
          <Chip key={c.key} icon={c.icon} label={optLabel(c, en)} active={!!facilities[c.key]} onClick={() => setFacilities((s) => ({ ...s, [c.key]: !s[c.key] }))} />
        ))}
      </Group>

      <Group title={w.f_options} note={w.f_options_note}>
        {OPTION_OPTS.map((c) => (
          <Chip key={c.key} icon={c.icon} label={optLabel(c, en)} active={!!form[c.key]} onClick={() => set({ [c.key]: !form[c.key] })} />
        ))}
      </Group>
    </div>
  );
}

import { useMemo, useRef, useState } from "react";
import { createBackupPayload, parseBackupPayload } from "../lib/storage";
import type { ProgressState, UserSettings, WorkoutSession } from "../types";

export function SettingsTab({
  settings,
  history,
  progress,
  onOpenSetup,
  onImport
}: {
  settings: UserSettings;
  history: WorkoutSession[];
  progress: ProgressState;
  onOpenSetup: () => void;
  onImport: (data: { settings: UserSettings; history: WorkoutSession[]; progress: ProgressState }) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importStatus, setImportStatus] = useState<{ tone: "error" | "success"; message: string } | null>(null);

  const exportFileName = useMemo(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `getinshape-backup-${yyyy}-${mm}-${dd}.json`;
  }, []);

  function exportBackup() {
    const payload = createBackupPayload(settings, history, progress);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = exportFileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function handleImportFile(file: File) {
    setImportStatus(null);

    let text = "";
    try {
      text = await file.text();
    } catch {
      setImportStatus({ tone: "error", message: "Could not read the selected file." });
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      setImportStatus({ tone: "error", message: "That file does not look like valid JSON." });
      return;
    }

    const backup = parseBackupPayload(parsed);
    if (!backup) {
      setImportStatus({ tone: "error", message: "Unsupported backup format. Export a backup from this app first." });
      return;
    }

    const confirmed = window.confirm("Importing will overwrite your current history and settings on this device. Continue?");
    if (!confirmed) return;

    onImport(backup);
    setImportStatus({ tone: "success", message: "Import complete. Your data is now restored on this device." });
  }

  return (
    <section className="space-y-4">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-5">
        <p className="text-xs uppercase tracking-[0.24em] text-mist/60">Settings</p>
        <h2 className="mt-3 font-display text-2xl">Backup &amp; restore</h2>
        <p className="mt-2 text-sm text-mist/75">
          Your workouts are stored locally on this device. Export a backup file occasionally so you can restore your data if your browser
          storage gets cleared.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            className="w-full rounded-full bg-accent px-5 py-4 font-semibold text-slate-950 transition hover:brightness-110"
            type="button"
            onClick={exportBackup}
          >
            Export backup
          </button>
          <button
            className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-4 font-medium text-white transition hover:bg-white/10"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            Import backup
          </button>
          <input
            ref={fileInputRef}
            className="hidden"
            type="file"
            accept="application/json,.json"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              void handleImportFile(file);
            }}
          />
        </div>

        {importStatus ? (
          <div
            className={`mt-4 rounded-[1.25rem] border px-4 py-3 text-sm ${
              importStatus.tone === "success"
                ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
                : "border-rose-400/25 bg-rose-400/10 text-rose-200"
            }`}
          >
            {importStatus.message}
          </div>
        ) : null}
      </div>

      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-5">
        <p className="text-xs uppercase tracking-[0.22em] text-mist/55">Plan</p>
        <h3 className="mt-2 font-display text-xl">Setup</h3>
        <p className="mt-2 text-sm text-mist/75">
          Need to change workout days, equipment, or phases? Open setup from here (it&apos;s not needed very often).
        </p>
        <button
          className="mt-4 w-full rounded-full border border-white/10 bg-white/5 px-5 py-4 font-medium text-white transition hover:bg-white/10"
          type="button"
          onClick={onOpenSetup}
        >
          Open setup
        </button>
      </div>
    </section>
  );
}

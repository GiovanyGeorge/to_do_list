import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Settings,
  Languages,
  Database,
  Download,
  ShieldCheck,
  HardDrive,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Info,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { usePreferencesStore } from "@/store/usePreferencesStore";
import type { BackupMetadata } from "../../electron/services/backupService";

export const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const {
    animationsEnabled, setAnimationsEnabled,
    reducedMotion, setReducedMotion,
    soundEnabled, setSoundEnabled,
    soundVolume, setSoundVolume,
  } = usePreferencesStore();

  // Language state
  const currentLang = i18n.language || "en";

  const handleLanguageChange = (lang: "en" | "ar") => {
    i18n.changeLanguage(lang);
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    localStorage.setItem("lifeflow_lang", lang);
  };

  // Backups state
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);
  const [selectedBackupForRestore, setSelectedBackupForRestore] = useState<string | null>(null);

  // Database integrity state
  const [dbHealth, setDbHealth] = useState<{ status: "ok" | "error" | "unchecked"; details: string }>({
    status: "unchecked",
    details: "Click check to verify SQLite database integrity.",
  });
  const [isCheckingDb, setIsCheckingDb] = useState(false);

  // Export state
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const fetchBackups = async () => {
    if (window.electronAPI?.listBackups) {
      try {
        const list = await window.electronAPI.listBackups();
        setBackups(list || []);
      } catch (err) {
        console.error("Failed to list backups:", err);
      }
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    if (!window.electronAPI?.createBackup) return;
    setIsCreatingBackup(true);
    setRestoreStatus(null);
    try {
      await window.electronAPI.createBackup("manual");
      await fetchBackups();
      setRestoreStatus("Manual backup created successfully!");
    } catch (err: unknown) {
      setRestoreStatus(`Failed to create backup: ${(err as Error).message}`);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestore = async (filepath: string) => {
    if (!window.electronAPI?.restoreBackup) return;
    try {
      const res = await window.electronAPI.restoreBackup(filepath);
      setSelectedBackupForRestore(null);
      if (res.success) {
        setRestoreStatus("Database restored successfully! A safety point was saved before restoring.");
        await fetchBackups();
      } else {
        setRestoreStatus(`Restore failed: ${res.message}`);
      }
    } catch (err: unknown) {
      setRestoreStatus(`Restore error: ${(err as Error).message}`);
    }
  };

  const handleCheckIntegrity = async () => {
    if (!window.electronAPI?.checkDatabaseIntegrity) return;
    setIsCheckingDb(true);
    try {
      const res = await window.electronAPI.checkDatabaseIntegrity();
      setDbHealth({
        status: res.status,
        details: res.details,
      });
    } catch (err: unknown) {
      setDbHealth({
        status: "error",
        details: (err as Error).message,
      });
    } finally {
      setIsCheckingDb(false);
    }
  };

  const triggerDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async (type: "tasks" | "projects" | "notes") => {
    if (!window.electronAPI) return;
    setIsExporting(type);
    try {
      const dateStr = new Date().toISOString().slice(0, 10);
      let csvData = "";
      if (type === "tasks" && window.electronAPI.exportTasksCSV) {
        csvData = await window.electronAPI.exportTasksCSV();
        triggerDownload(csvData, `lifeflow_tasks_${dateStr}.csv`);
      } else if (type === "projects" && window.electronAPI.exportProjectsCSV) {
        csvData = await window.electronAPI.exportProjectsCSV();
        triggerDownload(csvData, `lifeflow_projects_${dateStr}.csv`);
      } else if (type === "notes" && window.electronAPI.exportNotesCSV) {
        csvData = await window.electronAPI.exportNotesCSV();
        triggerDownload(csvData, `lifeflow_notes_${dateStr}.csv`);
      }
    } catch (err) {
      console.error(`Export ${type} failed:`, err);
    } finally {
      setIsExporting(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-8 max-w-4xl pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand-purple" />
          {t("nav.settings")}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage language, database health, automated safety backups, and CSV data export.
        </p>
      </div>

      {/* Language & Interface Settings */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-background-elevated border border-border-subtle">
            <Languages className="w-5 h-5 text-brand-purple" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">{t("settings.language")}</h2>
            <p className="text-xs text-text-secondary">
              Toggle between English and Arabic (supports full Right-to-Left layout).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => handleLanguageChange("en")}
            className={`p-4 rounded-xl border text-left transition-all ${
              currentLang.startsWith("en")
                ? "bg-brand-purple/10 border-brand-purple text-text-primary"
                : "bg-background-elevated border-border-subtle text-text-secondary hover:border-brand-purple/30"
            }`}
          >
            <div className="font-semibold text-sm">English</div>
            <div className="text-xs text-text-muted mt-1">Left-to-right default layout</div>
          </button>

          <button
            onClick={() => handleLanguageChange("ar")}
            className={`p-4 rounded-xl border text-right transition-all font-arabic ${
              currentLang.startsWith("ar")
                ? "bg-brand-purple/10 border-brand-purple text-text-primary"
                : "bg-background-elevated border-border-subtle text-text-secondary hover:border-brand-purple/30"
            }`}
          >
            <div className="font-semibold text-sm">العربية (Arabic)</div>
            <div className="text-xs text-text-muted mt-1">واجهة من اليمين إلى اليسار (RTL)</div>
          </button>
        </div>
      </Card>

      {/* Motion & Sound Preferences */}
      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-background-elevated border border-border-subtle">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">Motion & Sound</h2>
            <p className="text-xs text-text-secondary">
              Control animations, transitions, and UI sound effects.
            </p>
          </div>
        </div>

        {/* Animations toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-background-elevated border border-border-subtle">
          <div className="flex items-center gap-3">
            <Eye className="w-4 h-4 text-accent" />
            <div>
              <div className="text-sm font-medium text-text-primary">Enable Animations</div>
              <div className="text-xs text-text-muted">Page transitions, sidebar motion, hover effects</div>
            </div>
          </div>
          <button
            onClick={() => setAnimationsEnabled(!animationsEnabled)}
            className={`w-10 h-5 rounded-full transition-colors relative ${
              animationsEnabled ? "bg-accent" : "bg-background-card border border-border-subtle"
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
                animationsEnabled ? "left-5" : "left-0.5"
              }`}
            />
          </button>
        </div>

        {/* Reduced motion */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-background-elevated border border-border-subtle">
          <div className="flex items-center gap-3">
            <Eye className="w-4 h-4 text-text-muted" />
            <div>
              <div className="text-sm font-medium text-text-primary">Reduce Motion</div>
              <div className="text-xs text-text-muted">Respect accessibility preferences, minimize all motion</div>
            </div>
          </div>
          <button
            onClick={() => setReducedMotion(!reducedMotion)}
            className={`w-10 h-5 rounded-full transition-colors relative ${
              reducedMotion ? "bg-accent" : "bg-background-card border border-border-subtle"
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
                reducedMotion ? "left-5" : "left-0.5"
              }`}
            />
          </button>
        </div>

        {/* Sound toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-background-elevated border border-border-subtle">
          <div className="flex items-center gap-3">
            {soundEnabled ? <Volume2 className="w-4 h-4 text-accent" /> : <VolumeX className="w-4 h-4 text-text-muted" />}
            <div>
              <div className="text-sm font-medium text-text-primary">Sound Effects</div>
              <div className="text-xs text-text-muted">Task completion, navigation, and modal sounds</div>
            </div>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-10 h-5 rounded-full transition-colors relative ${
              soundEnabled ? "bg-accent" : "bg-background-card border border-border-subtle"
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
                soundEnabled ? "left-5" : "left-0.5"
              }`}
            />
          </button>
        </div>

        {/* Volume slider */}
        {soundEnabled && (
          <div className="p-4 rounded-xl bg-background-elevated border border-border-subtle space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-text-primary">Volume</div>
              <span className="text-xs text-text-muted font-mono">{Math.round(soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(soundVolume * 100)}
              onChange={(e) => setSoundVolume(parseInt(e.target.value, 10) / 100)}
              className="w-full accent-accent h-1.5 bg-background-card rounded-full appearance-none cursor-pointer"
            />
          </div>
        )}
      </Card>

      {/* Database & System Integrity */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-background-elevated border border-border-subtle">
              <Database className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">Database Health & Storage</h2>
              <p className="text-xs text-text-secondary">
                Verify SQLite WAL integrity and check for any local corruption.
              </p>
            </div>
          </div>

          <Button variant="secondary" size="sm" onClick={handleCheckIntegrity} disabled={isCheckingDb}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isCheckingDb ? "animate-spin" : ""}`} />
            Run Integrity Check
          </Button>
        </div>

        <div className="p-4 rounded-xl bg-background-elevated border border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            {dbHealth.status === "ok" ? (
              <CheckCircle2 className="w-5 h-5 text-state-success" />
            ) : dbHealth.status === "error" ? (
              <AlertTriangle className="w-5 h-5 text-priority-urgent" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-text-muted" />
            )}
            <div>
              <div className="text-xs font-semibold text-text-primary">
                SQLite Engine: {dbHealth.status.toUpperCase()}
              </div>
              <div className="text-xs text-text-muted">{dbHealth.details}</div>
            </div>
          </div>

          <Badge variant={dbHealth.status === "ok" ? "success" : dbHealth.status === "error" ? "danger" : "neutral"}>
            {dbHealth.status === "ok" ? "Healthy" : dbHealth.status === "error" ? "Issues Detected" : "Ready"}
          </Badge>
        </div>
      </Card>

      {/* Backup & Recovery */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-background-elevated border border-border-subtle">
              <HardDrive className="w-5 h-5 text-brand-purple" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">Backups & Disaster Recovery</h2>
              <p className="text-xs text-text-secondary">
                Safe atomic backups via SQLite online backup API. A pre-restore checkpoint is always created.
              </p>
            </div>
          </div>

          <Button onClick={handleCreateBackup} disabled={isCreatingBackup}>
            <HardDrive className={`w-4 h-4 mr-1.5 ${isCreatingBackup ? "animate-pulse" : ""}`} />
            {isCreatingBackup ? "Backing up..." : "Create Backup Now"}
          </Button>
        </div>

        {restoreStatus && (
          <div className="p-3 rounded-lg bg-background-elevated border border-brand-purple/40 text-xs text-brand-purple flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>{restoreStatus}</span>
          </div>
        )}

        {/* Backups List */}
        <div className="space-y-2 pt-2">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Available Backups ({backups.length})
          </div>

          {backups.length === 0 ? (
            <div className="text-center py-6 text-xs text-text-muted">
              No backups created yet. Click "Create Backup Now" to capture your database snapshot.
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {backups.map((b) => (
                <div
                  key={b.filepath}
                  className="p-3 rounded-xl bg-background-elevated border border-border-subtle flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-text-primary truncate">{b.filename}</span>
                      <Badge
                        variant={b.type === "pre_restore" ? "danger" : b.type === "automatic" ? "accent" : "default"}
                        size="sm"
                      >
                        {b.type.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-text-muted mt-0.5 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {new Date(b.createdAt).toLocaleString()} · {formatBytes(b.sizeBytes)}
                    </div>
                  </div>

                  {selectedBackupForRestore === b.filepath ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRestore(b.filepath)}
                      >
                        Confirm Restore
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedBackupForRestore(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedBackupForRestore(b.filepath)}
                    >
                      Restore
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* CSV Data Export */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-background-elevated border border-border-subtle">
            <Download className="w-5 h-5 text-state-success" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">Data Export (CSV)</h2>
            <p className="text-xs text-text-secondary">
              Export your data offline at any time. Compatible with Excel, Google Sheets, and Notion.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={() => handleExport("tasks")}
            disabled={isExporting !== null}
            className="p-4 rounded-xl bg-background-elevated border border-border-subtle hover:border-brand-purple/40 text-left transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between w-full">
              <FileSpreadsheet className="w-5 h-5 text-brand-purple" />
              <Download className="w-4 h-4 text-text-muted" />
            </div>
            <div className="mt-4">
              <div className="font-semibold text-sm text-text-primary">Export Tasks</div>
              <div className="text-xs text-text-muted mt-0.5">Tasks, priorities, projects, statuses</div>
            </div>
          </button>

          <button
            onClick={() => handleExport("projects")}
            disabled={isExporting !== null}
            className="p-4 rounded-xl bg-background-elevated border border-border-subtle hover:border-brand-blue/40 text-left transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between w-full">
              <FileSpreadsheet className="w-5 h-5 text-brand-blue" />
              <Download className="w-4 h-4 text-text-muted" />
            </div>
            <div className="mt-4">
              <div className="font-semibold text-sm text-text-primary">Export Projects</div>
              <div className="text-xs text-text-muted mt-0.5">Projects, task counts, progress</div>
            </div>
          </button>

          <button
            onClick={() => handleExport("notes")}
            disabled={isExporting !== null}
            className="p-4 rounded-xl bg-background-elevated border border-border-subtle hover:border-state-success/40 text-left transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between w-full">
              <FileSpreadsheet className="w-5 h-5 text-state-success" />
              <Download className="w-4 h-4 text-text-muted" />
            </div>
            <div className="mt-4">
              <div className="font-semibold text-sm text-text-primary">Export Notes</div>
              <div className="text-xs text-text-muted mt-0.5">Notes, pins, tags, markdown text</div>
            </div>
          </button>
        </div>
      </Card>

      {/* About LifeFlow */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-background-elevated border border-border-subtle">
            <Info className="w-5 h-5 text-text-muted" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">About LifeFlow</h2>
            <p className="text-xs text-text-muted">Desktop Architecture & Specifications</p>
          </div>
        </div>

        <div className="text-xs text-text-secondary space-y-2 pt-2 border-t border-border-subtle">
          <div className="flex justify-between">
            <span className="text-text-muted">Application Version:</span>
            <span className="font-mono text-text-primary">1.0.0 (Windows Native)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Architecture:</span>
            <span className="text-text-primary">Offline-First · SQLite 3 (WAL) · Electron · React 19</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Data Ownership:</span>
            <span className="text-text-primary">100% Local (Zero cloud trackers, zero remote calls)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">RTL & Multilingual:</span>
            <span className="text-text-primary">Native Arabic & English Support</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
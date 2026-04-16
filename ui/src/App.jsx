import { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:8000").replace(/\/$/, "");
const LS_KEYS = {
  apiBase: "cdsco_api_base",
  apiToken: "cdsco_api_token",
  reviewer: "cdsco_reviewer",
  activeNav: "cdsco_active_nav",
  selectedCase: "cdsco_selected_case",
};

const Icons = {
  Shield: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  Files: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7h-8a2 2 0 0 1-2-2V3" /><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M8 13h8" /><path d="M8 17h5" /></svg>,
  Clipboard: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg>,
  Activity: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
  Queue: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18" /><path d="M3 6h18" /><path d="M3 18h12" /></svg>,
  Gear: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.36.36.58.85.6 1.36V10a2 2 0 1 1 0 4h-.09c-.51.02-1 .24-1.36.6Z" /></svg>,
  Upload: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5" /><path d="M12 3v12" /></svg>,
  Search: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>,
  Refresh: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /></svg>,
  Play: () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="m8 5 11 7-11 7z" /></svg>,
  Check: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6 9 17l-5-5" /></svg>,
  Alert: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>,
  User: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="8" r="4" /></svg>,
  X: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>,
  Sparkles: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3 1.9 4.6L18.5 9l-4.6 1.4L12 15l-1.9-4.6L5.5 9l4.6-1.4L12 3Z" /><path d="M5 19l.9 2 .9-2 2-.9-2-.9L5 15l-.9 2.1-2 .9 2 .9z" /><path d="M19 15l.9 2 .9-2 2-.9-2-.9L19 11l-.9 2.1-2 .9 2 .9z" /></svg>,
  Trash: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>,
};

const styles = `
:root {
  --bg: #f5f7fb;
  --panel: #ffffff;
  --panel-soft: #f8fafc;
  --border: #dbe3ee;
  --text: #122033;
  --muted: #617086;
  --blue: #1d4ed8;
  --blue-soft: rgba(29, 78, 216, 0.08);
  --green: #0f766e;
  --green-soft: rgba(15, 118, 110, 0.08);
  --amber: #b45309;
  --amber-soft: rgba(180, 83, 9, 0.08);
  --rose: #be123c;
  --rose-soft: rgba(190, 18, 60, 0.08);
  --violet: #7c3aed;
  --violet-soft: rgba(124, 58, 237, 0.08);
  --shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  --radius: 18px;
  --radius-sm: 12px;
}
* { box-sizing: border-box; }
body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif; color: var(--text); background: var(--bg); }
button, input, select, textarea { font: inherit; }
button { cursor: pointer; }
svg { width: 18px; height: 18px; }
.app-shell { min-height: 100vh; display: grid; grid-template-columns: 300px 1fr; }
.sidebar { background: #0f172a; color: #e5eefb; padding: 22px 18px; display: flex; flex-direction: column; gap: 18px; }
.brand { padding: 6px 6px 14px; border-bottom: 1px solid rgba(226,232,240,.12); }
.brand-top { display: flex; align-items: center; gap: 12px; }
.brand-badge { width: 40px; height: 40px; border-radius: 14px; display: grid; place-items: center; background: linear-gradient(135deg, #2563eb, #0f766e); }
.brand h1 { font-size: 20px; margin: 0; }
.brand p { margin: 4px 0 0; color: #94a3b8; font-size: 13px; }
.nav-group { display: flex; flex-direction: column; gap: 8px; }
.nav-label { font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: #94a3b8; padding: 0 8px; }
.nav-item { width: 100%; border: 1px solid transparent; background: transparent; color: inherit; display: flex; align-items: center; gap: 10px; padding: 12px 12px; border-radius: 14px; text-align: left; }
.nav-item:hover { background: rgba(148, 163, 184, 0.12); }
.nav-item.active { background: rgba(37,99,235,.18); border-color: rgba(96,165,250,.28); }
.nav-item .pill { margin-left: auto; background: rgba(148,163,184,.14); color: #cbd5e1; padding: 2px 8px; border-radius: 999px; font-size: 11px; }
.sidebar-card { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07); border-radius: 16px; padding: 14px; }
.sidebar-card h4 { margin: 0 0 10px; font-size: 13px; }
.sidebar-card p { margin: 0; font-size: 12px; color: #cbd5e1; line-height: 1.5; }
.main { display: flex; flex-direction: column; min-width: 0; }
.topbar { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 22px 26px; border-bottom: 1px solid var(--border); background: rgba(255,255,255,.85); backdrop-filter: blur(8px); position: sticky; top: 0; z-index: 5; }
.topbar h2 { margin: 0; font-size: 24px; }
.topbar p { margin: 4px 0 0; color: var(--muted); font-size: 14px; }
.topbar-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
.dot { width: 9px; height: 9px; border-radius: 50%; background: var(--green); display: inline-block; margin-right: 6px; }
.page { padding: 24px 26px 40px; }
.grid { display: grid; gap: 18px; }
.grid.cols-2 { grid-template-columns: 320px minmax(0, 1fr); align-items: start; }
.grid.cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.card { background: var(--panel); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); padding: 18px; }
.card h3, .card h4 { margin: 0; }
.card-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.card-title { display: flex; align-items: center; gap: 10px; }
.icon-wrap { width: 34px; height: 34px; border-radius: 12px; display: grid; place-items: center; background: var(--blue-soft); color: var(--blue); }
.stack { display: flex; flex-direction: column; gap: 12px; }
.row { display: flex; gap: 12px; flex-wrap: wrap; }
.row > * { min-width: 0; }
.input, .select, .textarea { width: 100%; background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 10px 12px; color: var(--text); }
 .textarea { min-height: 96px; resize: vertical; }
.label { font-size: 12px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .08em; margin-bottom: 6px; display: block; }
.btn { border: 1px solid var(--border); background: #fff; color: var(--text); border-radius: 12px; padding: 10px 14px; display: inline-flex; align-items: center; gap: 8px; }
.btn:hover { border-color: #b7c5d8; }
.btn.primary { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border-color: transparent; }
.btn.success { background: linear-gradient(135deg, #0f766e, #0d9488); color: white; border-color: transparent; }
.btn.warn { background: linear-gradient(135deg, #d97706, #b45309); color: white; border-color: transparent; }
.btn.danger { background: linear-gradient(135deg, #e11d48, #be123c); color: white; border-color: transparent; }
.btn.ghost { background: transparent; }
.btn.small { padding: 8px 11px; font-size: 13px; }
.btn:disabled { opacity: .55; cursor: not-allowed; }
.badge { display: inline-flex; align-items: center; gap: 6px; border-radius: 999px; padding: 4px 10px; font-size: 12px; font-weight: 700; }
.badge.blue { background: var(--blue-soft); color: var(--blue); }
.badge.green { background: var(--green-soft); color: var(--green); }
.badge.amber { background: var(--amber-soft); color: var(--amber); }
.badge.rose { background: var(--rose-soft); color: var(--rose); }
.badge.violet { background: var(--violet-soft); color: var(--violet); }
.badge.gray { background: #eef2f7; color: var(--muted); }
.stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px,1fr)); gap: 12px; }
.stat { background: var(--panel-soft); border: 1px solid var(--border); border-radius: 16px; padding: 14px; }
.stat .k { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: .08em; }
.stat .v { margin-top: 8px; font-size: 24px; font-weight: 800; }
.case-list { display: flex; flex-direction: column; gap: 10px; max-height: calc(100vh - 310px); overflow: auto; }
.case-item { border: 1px solid var(--border); background: #fff; border-radius: 14px; padding: 12px; text-align: left; }
.case-item.active { border-color: rgba(37,99,235,.35); box-shadow: inset 0 0 0 1px rgba(37,99,235,.12); }
.case-item-actions { display: flex; gap: 8px; align-items: center; justify-content: flex-end; margin-top: 12px; }
.case-select-btn { width: 100%; border: 0; background: transparent; padding: 0; text-align: left; }
.case-delete-btn { flex: 0 0 auto; }
.case-item-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.case-item h4 { margin: 0; font-size: 15px; }
.case-item p { margin: 4px 0 0; color: var(--muted); font-size: 13px; }
.muted { color: var(--muted); }
.empty { padding: 26px; text-align: center; color: var(--muted); border: 1px dashed var(--border); border-radius: 16px; }
.file-drop { border: 1.5px dashed #b9c7d8; background: var(--panel-soft); border-radius: 16px; padding: 18px; text-align: center; }
.file-drop input { display: none; }
.file-list { display: flex; flex-direction: column; gap: 10px; }
.file-row, .result-row, .audit-row, .queue-row { border: 1px solid var(--border); border-radius: 14px; padding: 12px; background: #fff; }
.file-row-top, .result-row-top, .audit-row-top, .queue-row-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.file-row h4, .result-row h4, .queue-row h4 { margin: 0; font-size: 15px; }
.kv { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; }
.kv-box { background: var(--panel-soft); border: 1px solid var(--border); border-radius: 12px; padding: 12px; }
.kv-box .k { font-size: 12px; color: var(--muted); margin-bottom: 6px; }
.kv-box .v { font-size: 14px; font-weight: 600; word-break: break-word; }
.pre { background: #0f172a; color: #d7e3f4; border-radius: 14px; padding: 14px; white-space: pre-wrap; word-break: break-word; overflow: auto; max-height: 420px; font-size: 13px; }
.tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
.tab-btn { background: var(--panel-soft); border: 1px solid var(--border); border-radius: 12px; padding: 8px 12px; }
.tab-btn.active { color: var(--blue); border-color: rgba(37,99,235,.3); background: var(--blue-soft); }
.alert { border-radius: 14px; padding: 12px 14px; border: 1px solid rgba(225,29,72,.16); background: var(--rose-soft); color: var(--rose); }
.success-note { border-radius: 14px; padding: 12px 14px; border: 1px solid rgba(15,118,110,.16); background: var(--green-soft); color: var(--green); }
.split { display: grid; grid-template-columns: 1.1fr .9fr; gap: 18px; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.small { font-size: 12px; }
.tight { line-height: 1.45; }
.loading { display: inline-flex; align-items: center; gap: 8px; color: var(--muted); }
.loading::before { content: ''; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #c8d4e5; border-top-color: var(--blue); animation: spin .8s linear infinite; }
.result-shell { display: flex; flex-direction: column; gap: 14px; }
.result-section { border: 1px solid var(--border); background: var(--panel-soft); border-radius: 16px; padding: 14px; }
.result-section > .label { margin-bottom: 10px; }
.result-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; }
.result-stat { border: 1px solid var(--border); background: white; border-radius: 16px; padding: 14px; position: relative; overflow: hidden; }
.result-stat::before { content: ''; position: absolute; inset: 0 auto 0 0; width: 4px; background: var(--blue); opacity: .9; }
.result-stat.tone-blue::before { background: var(--blue); }
.result-stat.tone-green::before { background: var(--green); }
.result-stat.tone-amber::before { background: var(--amber); }
.result-stat.tone-rose::before { background: var(--rose); }
.result-stat.tone-violet::before { background: var(--violet); }
.result-stat.tone-gray::before { background: #94a3b8; }
.result-stat .k { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: .08em; }
.result-stat .v { margin-top: 8px; font-size: 26px; font-weight: 800; line-height: 1.1; }
.result-stat .s { margin-top: 6px; color: var(--muted); font-size: 12px; line-height: 1.45; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.entity-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.entity-table th, .entity-table td { padding: 10px 12px; border-bottom: 1px solid var(--border); text-align: left; vertical-align: top; }
.entity-table th { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: .08em; }
.entity-val { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; white-space: normal; word-break: break-word; }
.result-columns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.text-block { white-space: pre-wrap; line-height: 1.6; background: white; border: 1px solid var(--border); border-radius: 14px; padding: 14px; max-height: 380px; overflow: auto; }
.kv-table { width: 100%; border-collapse: collapse; }
.kv-table td { padding: 9px 10px; border-bottom: 1px solid var(--border); vertical-align: top; }
.kv-table td:first-child { width: 180px; font-weight: 700; color: var(--text); }
.muted-block { color: var(--muted); line-height: 1.6; }

.finding-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; }
.finding-card { background: white; border: 1px solid var(--border); border-radius: 16px; padding: 14px; display: flex; gap: 12px; align-items: flex-start; }
.finding-index { width: 32px; height: 32px; border-radius: 999px; display: grid; place-items: center; background: var(--blue-soft); color: var(--blue); font-weight: 800; flex: 0 0 32px; }
.doc-block { background: white; border: 1px solid var(--border); border-radius: 16px; padding: 16px; }
.doc-block p { margin: 0; line-height: 1.7; }
.metric-note { color: var(--muted); font-size: 12px; line-height: 1.5; }
.checklist-table { width: 100%; border-collapse: collapse; }
.checklist-table th, .checklist-table td { padding: 10px 12px; border-bottom: 1px solid var(--border); vertical-align: top; text-align: left; }
.checklist-table th { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: .08em; }
.checklist-item { font-weight: 700; color: var(--text); margin-bottom: 4px; }
.checklist-sub { color: var(--muted); font-size: 12px; line-height: 1.5; }
.report-grid { display: grid; gap: 14px; }
.report-grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.report-list { margin: 0; padding-left: 18px; }
.report-list li { line-height: 1.65; }
.report-subgroup { border: 1px solid var(--border); border-radius: 16px; background: white; padding: 14px; }
.report-subgroup h5 { margin: 0 0 10px; font-size: 14px; color: var(--text); }
.inline-note { display: inline-flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 999px; background: #eef4ff; color: var(--blue); font-size: 12px; font-weight: 700; }
.strip-list { display: grid; gap: 10px; }
.strip-row { display: flex; justify-content: space-between; gap: 14px; align-items: flex-start; border: 1px solid var(--border); border-radius: 14px; background: white; padding: 12px 14px; }
.strip-row-main { min-width: 0; }
.strip-row-title { font-weight: 700; margin-bottom: 4px; }
.strip-row-sub { color: var(--muted); font-size: 13px; line-height: 1.5; }

.raw-toggle { margin-top: 4px; }
.raw-toggle summary { cursor: pointer; color: var(--blue); font-weight: 600; }
.raw-toggle .pre { margin-top: 10px; }
.utility-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; padding: 16px 18px; border: 1px solid var(--border); border-radius: 18px; background: linear-gradient(135deg, rgba(37,99,235,.08), rgba(15,118,110,.06)); }
.utility-header h4 { margin: 0; font-size: 18px; }
.utility-header p { margin: 6px 0 0; color: var(--muted); line-height: 1.55; font-size: 14px; max-width: 760px; }
.section-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; flex-wrap: wrap; }
.section-note { color: var(--muted); font-size: 12px; line-height: 1.5; }
.hl { font-weight: 800; border-radius: 8px; padding: 1px 4px; box-decoration-break: clone; -webkit-box-decoration-break: clone; }
.hl.entity { background: rgba(217, 119, 6, 0.16); color: #92400e; }
.hl.token { background: rgba(29, 78, 216, 0.14); color: #1d4ed8; border: 1px solid rgba(29, 78, 216, 0.14); }
.diff-block { background: #0f172a; color: #dbeafe; border-radius: 14px; overflow: auto; max-height: 420px; border: 1px solid rgba(15, 23, 42, 0.08); }
.diff-line { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; padding: 6px 10px; white-space: pre-wrap; word-break: break-word; }
.diff-line.added { background: rgba(15, 118, 110, 0.16); color: #d1fae5; }
.diff-line.removed { background: rgba(190, 24, 93, 0.16); color: #ffe4e6; }
.diff-line.meta { background: rgba(148, 163, 184, 0.12); color: #cbd5e1; }
.diff-line.plain { background: transparent; }

.inspection-detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
.inspection-detail-card { background: white; border: 1px solid var(--border); border-radius: 14px; padding: 14px; }
.inspection-detail-card .k { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: .08em; margin-bottom: 8px; }
.inspection-detail-card .v { font-size: 14px; font-weight: 600; line-height: 1.5; }
.inspection-observation-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.inspection-panel { border-radius: 16px; border: 1px solid var(--border); background: white; padding: 14px; }
.inspection-panel.tone-rose { background: linear-gradient(180deg, rgba(190, 24, 93, 0.04), #fff); border-color: rgba(190, 24, 93, 0.18); }
.inspection-panel.tone-amber { background: linear-gradient(180deg, rgba(217, 119, 6, 0.05), #fff); border-color: rgba(217, 119, 6, 0.18); }
.inspection-panel.tone-blue { background: linear-gradient(180deg, rgba(29, 78, 216, 0.04), #fff); border-color: rgba(29, 78, 216, 0.16); }
.inspection-panel-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
.inspection-list { margin: 0; padding-left: 20px; display: grid; gap: 10px; }
.inspection-list.compact { gap: 6px; }
.inspection-list.numbered { padding-left: 22px; }
.inspection-list li { line-height: 1.6; }
.inspection-callout { border-radius: 16px; padding: 16px 18px; line-height: 1.65; font-weight: 500; }
.inspection-callout.tone-rose { background: rgba(190, 24, 93, 0.08); border: 1px solid rgba(190, 24, 93, 0.16); color: #9f1239; }
.inspection-callout.tone-amber { background: rgba(217, 119, 6, 0.08); border: 1px solid rgba(217, 119, 6, 0.16); color: #92400e; }
.inspection-callout.tone-green { background: rgba(15, 118, 110, 0.08); border: 1px solid rgba(15, 118, 110, 0.16); color: #115e59; }
.inspection-capa-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
.inspection-capa-card { background: white; border: 1px solid var(--border); border-radius: 14px; padding: 14px; display: flex; gap: 12px; align-items: flex-start; }
/* ── Compare tool rich styles ────────────────────────────────────────── */
.compare-analysis-card { border: 1px solid var(--border); border-radius: 16px; background: white; padding: 18px; }
.rich-change-analysis { display: flex; flex-direction: column; gap: 14px; }
.rca-section { display: flex; flex-direction: column; gap: 8px; }
.rca-heading { font-size: 13px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: #0f172a; padding: 6px 10px; background: #f1f5f9; border-radius: 8px; border-left: 3px solid var(--blue); }
.rca-items { display: flex; flex-direction: column; gap: 6px; }
.rca-item { display: flex; align-items: flex-start; gap: 8px; padding: 8px 12px; border-radius: 10px; border: 1px solid transparent; line-height: 1.6; font-size: 14px; }
.rca-item.rca-toned { border-width: 1px; border-style: solid; }
.rca-item.rca-para-item { font-size: 14px; }
.rca-item.rca-bullet-item { font-size: 14px; }
.rca-dot { width: 8px; height: 8px; border-radius: 50%; flex: 0 0 8px; margin-top: 6px; }
.rca-plain-dot { width: 6px; height: 6px; border-radius: 50%; flex: 0 0 6px; background: var(--muted); margin-top: 7px; }

.compare-diff-grid { display: flex; flex-direction: column; gap: 14px; }
.compare-diff-group { border-radius: 14px; padding: 14px; border: 1px solid var(--border); }
.compare-diff-group.tone-amber { background: rgba(217,119,6,.04); border-color: rgba(217,119,6,.2); }
.compare-diff-group.tone-green  { background: rgba(15,118,110,.04); border-color: rgba(15,118,110,.2); }
.compare-diff-group.tone-rose   { background: rgba(190,18,60,.04);  border-color: rgba(190,18,60,.2); }
.compare-diff-group-head { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); margin-bottom: 10px; }
.compare-diff-icon { font-size: 15px; }
.compare-diff-count { margin-left: auto; background: rgba(0,0,0,.06); border-radius: 999px; padding: 2px 8px; font-size: 11px; color: var(--text); }
.compare-diff-row { display: flex; flex-direction: column; gap: 4px; padding: 8px 10px; border-top: 1px solid rgba(0,0,0,.05); }
.compare-diff-row:first-of-type { border-top: none; }
.compare-diff-field { font-size: 12px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; }
.compare-diff-vals { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 13px; }
.compare-val { border-radius: 8px; padding: 3px 8px; font-family: ui-monospace, monospace; font-size: 12px; }
.removed-val { background: rgba(190,18,60,.1); color: #9f1239; text-decoration: line-through; }
.added-val   { background: rgba(15,118,110,.1); color: #115e59; }
.compare-arrow { color: var(--muted); font-size: 14px; }
.compare-legend-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; }
.compare-legend-dot.tone-green { background: var(--green); }
.compare-legend-dot.tone-rose  { background: var(--rose); }
.compare-legend-dot.tone-gray  { background: #94a3b8; }

/* ── Benchmark panel ─────────────────────────────────────────────────── */
.benchmark-row { border: 1px solid var(--border); border-radius: 14px; background: #fff; overflow: hidden; }
.benchmark-row-head { width: 100%; background: transparent; border: none; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px; text-align: left; cursor: pointer; }
.benchmark-row-head:hover { background: var(--panel-soft); }
.benchmark-row-meta { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.benchmark-row-id { font-weight: 700; font-size: 14px; font-family: ui-monospace, monospace; }
.benchmark-expand { padding: 0 14px 14px; border-top: 1px solid var(--border); margin-top: 0; }

.inspection-capa-index { width: 30px; height: 30px; flex: 0 0 30px; display: grid; place-items: center; border-radius: 999px; background: var(--green-soft); color: var(--green); font-weight: 800; }


.structured-block { background: white; border: 1px solid var(--border); border-radius: 16px; padding: 16px 18px; display: flex; flex-direction: column; gap: 14px; }
.structured-block.tone-blue { background: linear-gradient(180deg, rgba(37,99,235,.03), #fff 28%); }
.structured-block.tone-violet { background: linear-gradient(180deg, rgba(124,58,237,.035), #fff 28%); }
.structured-block.tone-amber { background: linear-gradient(180deg, rgba(217,119,6,.04), #fff 28%); }
.structured-section-title { display: flex; flex-direction: column; gap: 8px; padding-bottom: 10px; border-bottom: 1px solid #edf2f7; }
.structured-section-title:last-child { border-bottom: 0; padding-bottom: 0; }
.structured-section-title > :first-child { font-size: 12px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #0f172a; }
.structured-subsection { display: flex; flex-direction: column; gap: 8px; }
.structured-subtitle { font-size: 14px; font-weight: 800; color: var(--text); }
.structured-paragraph, .structured-section-title p, .structured-subsection p { margin: 0; line-height: 1.75; color: #1f2937; }
.structured-list { margin: 0; padding-left: 22px; }
.structured-list li { line-height: 1.7; color: #1f2937; }
.ol.structured-list { padding-left: 24px; }
.structured-list.ordered { padding-left: 24px; }
.structured-list li::marker { color: #2563eb; font-weight: 700; }
.structured-block strong { color: #0f172a; font-weight: 800; }
.inline-callout { border-radius: 14px; padding: 12px 14px; font-weight: 700; line-height: 1.55; border: 1px solid var(--border); }
.inline-callout.tone-green { background: rgba(15,118,110,.08); color: var(--green); border-color: rgba(15,118,110,.18); }
.inline-callout.tone-amber { background: rgba(217,119,6,.08); color: var(--amber); border-color: rgba(217,119,6,.16); }
.inline-callout.tone-blue { background: rgba(37,99,235,.08); color: var(--blue); border-color: rgba(37,99,235,.16); }
.section-label-strong { font-weight: 800; color: #111827; }
.text-block { white-space: pre-wrap; line-height: 1.72; background: white; border: 1px solid var(--border); border-radius: 16px; padding: 16px; max-height: 420px; overflow: auto; }
.utility-header { box-shadow: 0 8px 18px rgba(37,99,235,.05); }

@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 1120px) {
  .result-columns { grid-template-columns: 1fr; }
  .inspection-observation-grid { grid-template-columns: 1fr; }
  .app-shell { grid-template-columns: 1fr; }
  .sidebar { position: static; }
  .grid.cols-2, .split, .grid.cols-3 { grid-template-columns: 1fr; }
}
`;

function readLocal(key, fallback = "") {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function useStoredState(key, fallback) {
  const [value, setValue] = useState(() => readLocal(key, fallback));
  useEffect(() => {
    try {
      localStorage.setItem(key, value);
    } catch {}
  }, [key, value]);
  return [value, setValue];
}

function niceDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function pretty(value) {
  if (value == null) return "—";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

function statusTone(value = "") {
  const v = value.toUpperCase();
  if (["APPROVED", "READY_FOR_REVIEW", "PROCESSED"].includes(v)) return "green";
  if (["FLAGGED", "ESCALATED", "CRITICAL", "HIGH", "INCOMPLETE", "HOSPITALISATION"].includes(v)) return "amber";
  if (["REJECTED", "DUPLICATE_CONFIRMED", "DEATH", "LIFE_THREATENING", "MISSING"].includes(v)) return "rose";
  if (["SAE_REPORT", "REGULATORY_APPLICATION", "SUMMARY"].includes(v)) return "blue";
  if (["MEETING_TRANSCRIPT", "INSPECTION_REPORT"].includes(v)) return "violet";
  return "gray";
}

function Badge({ children, tone }) {
  return <span className={`badge ${tone || statusTone(String(children))}`}>{children}</span>;
}

function SectionTitle({ icon: Icon, title, hint }) {
  return (
    <div className="card-head">
      <div className="card-title">
        <div className="icon-wrap">{Icon ? <Icon /> : null}</div>
        <div>
          <h3>{title}</h3>
          {hint ? <div className="muted small">{hint}</div> : null}
        </div>
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder }) {
  return (
    <div style={{ flex: 1 }}>
      <label className="label">{label}</label>
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div style={{ flex: 1 }}>
      <label className="label">{label}</label>
      <select className="select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="label">{label}</label>
      <textarea className="textarea" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function FilePicker({ files, setFiles, multiple = false, label = "Drop files or click to browse" }) {
  const ref = useRef(null);
  const normalized = multiple ? files : files ? [files] : [];

  const accept = (list) => {
    if (!list || list.length === 0) return;
    const picked = multiple ? Array.from(list) : list[0];
    setFiles(picked);
  };

  return (
    <div className="file-drop" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); accept(e.dataTransfer.files); }}>
      <input ref={ref} type="file" multiple={multiple} onChange={(e) => accept(e.target.files)} />
      <div className="stack" style={{ alignItems: "center" }}>
        <div className="icon-wrap"><Icons.Upload /></div>
        <div style={{ fontWeight: 600 }}>{label}</div>
        <div className="muted small">PDF, DOCX, text, images, CSV, XLSX, audio</div>
        <button className="btn small" onClick={() => ref.current?.click()} type="button">Choose file</button>
        {normalized.length > 0 ? (
          <div className="file-list" style={{ width: "100%", marginTop: 8 }}>
            {normalized.map((file, index) => (
              <div className="file-row" key={`${file.name}-${index}`}>
                <div className="file-row-top">
                  <div>
                    <h4>{file.name}</h4>
                    <div className="muted small">{(file.size / 1024).toFixed(1)} KB</div>
                  </div>
                  <button
                    className="btn ghost small"
                    type="button"
                    onClick={() => setFiles(multiple ? normalized.filter((_, i) => i !== index) : null)}
                  >
                    <Icons.X /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}


function ResultStat({ label, value, tone = "blue", note = "" }) {
  const safeTone = ["blue", "green", "amber", "rose", "violet", "gray"].includes(tone) ? tone : "blue";
  return (
    <div className={`result-stat tone-${safeTone}`}>
      <div className="k">{label}</div>
      <div className="v" style={{ color: `var(--${safeTone === "gray" ? "muted" : safeTone})` }}>{value ?? "—"}</div>
      {note ? <div className="s">{note}</div> : null}
    </div>
  );
}

function EntityTypeSummary({ data }) {
  const items = Object.entries(data || {});
  if (!items.length) return null;
  return (
    <div className="chips">
      {items.map(([key, value]) => <Badge key={key} tone="blue">{key}: {value}</Badge>)}
    </div>
  );
}

function EntityTable({ entities }) {
  if (!entities?.length) return <div className="muted-block">No entities detected.</div>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="entity-table">
        <thead>
          <tr><th>Type</th><th>Value</th><th>Confidence</th><th>Method</th></tr>
        </thead>
        <tbody>
          {entities.slice(0, 15).map((entity, idx) => (
            <tr key={`${entity.type}-${idx}`}>
              <td><Badge tone="blue">{entity.type}</Badge></td>
              <td className="entity-val">{entity.value || "—"}</td>
              <td>{entity.confidence || "—"}</td>
              <td>{entity.detection_method || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function mergeRanges(ranges = []) {
  if (!ranges.length) return [];
  const sorted = [...ranges].sort((a, b) => a.start - b.start || b.end - a.end);
  const merged = [sorted[0]];
  for (let i = 1; i < sorted.length; i += 1) {
    const current = sorted[i];
    const last = merged[merged.length - 1];
    if (current.start <= last.end) {
      last.end = Math.max(last.end, current.end);
      last.kind = last.kind === "token" || current.kind === "token" ? "token" : "entity";
    } else {
      merged.push({ ...current });
    }
  }
  return merged;
}

function buildHighlightRanges(text, entities = [], highlightTokens = false) {
  const input = String(text || "");
  if (!input) return [];
  const ranges = [];

  if (highlightTokens) {
    const tokenRegex = /\[[^\]]+\]/g;
    let tokenMatch;
    while ((tokenMatch = tokenRegex.exec(input)) !== null) {
      ranges.push({ start: tokenMatch.index, end: tokenMatch.index + tokenMatch[0].length, kind: "token" });
    }
  }

  (entities || []).forEach((entity) => {
    const value = String(entity?.value || "").trim();
    if (!value || value.length < 3) return;
    const regex = new RegExp(escapeRegExp(value), "gi");
    let match;
    while ((match = regex.exec(input)) !== null) {
      ranges.push({ start: match.index, end: match.index + match[0].length, kind: "entity" });
      if (regex.lastIndex === match.index) regex.lastIndex += 1;
    }
  });

  return mergeRanges(ranges);
}

function HighlightedText({ text, entities = [], highlightTokens = false }) {
  const input = String(text || "");
  const ranges = buildHighlightRanges(input, entities, highlightTokens);
  if (!ranges.length) return <>{input}</>;

  const nodes = [];
  let cursor = 0;
  ranges.forEach((range, idx) => {
    if (range.start > cursor) {
      nodes.push(<span key={`plain-${idx}-${cursor}`}>{input.slice(cursor, range.start)}</span>);
    }
    nodes.push(
      <mark key={`mark-${idx}-${range.start}`} className={`hl ${range.kind === "token" ? "token" : "entity"}`}>
        {input.slice(range.start, range.end)}
      </mark>
    );
    cursor = range.end;
  });
  if (cursor < input.length) {
    nodes.push(<span key={`tail-${cursor}`}>{input.slice(cursor)}</span>);
  }
  return <>{nodes}</>;
}

function normalizeMdLine(line) {
  return String(line || "").replace(/\r/g, "").trim();
}

function parseStructuredMarkdown(text) {
  const lines = String(text || "").replace(/\r/g, "").split("\n");
  const blocks = [];
  let current = null;

  const pushCurrent = () => {
    if (!current) return;
    if (current.type === "list") current.items = current.items.filter(Boolean);
    if (current.type === "paragraph") current.text = current.text.trim();
    if (current.type === "callout") current.text = current.text.trim();
    if ((current.type === "section" || current.type === "subsection") && current.text) current.text = current.text.trim();
    blocks.push(current);
    current = null;
  };

  const ensureSectionText = (type, title) => {
    pushCurrent();
    current = { type, title, text: "" };
  };

  lines.forEach((raw) => {
    const line = normalizeMdLine(raw);
    if (!line) {
      if (current && current.type === "paragraph") pushCurrent();
      return;
    }

    const h3 = line.match(/^###\s*(.+)$/);
    if (h3) {
      ensureSectionText("section", h3[1].trim());
      return;
    }

    if (/^[A-Z][A-Z\s/&()-]{3,}$/.test(line) && line === line.toUpperCase()) {
      ensureSectionText("section", line);
      return;
    }

    const numberedHeading = line.match(/^\d+\.\s+(.+)$/);
    if (numberedHeading && numberedHeading[1] === numberedHeading[1].toUpperCase() && !/^[A-Z][a-z]/.test(numberedHeading[1])) {
      ensureSectionText("section", numberedHeading[1]);
      return;
    }

    const boldHeading = line.match(/^\*\*(.+?)\*\*:?\s*$/);
    if (boldHeading) {
      ensureSectionText("subsection", boldHeading[1].trim());
      return;
    }

    const bullet = line.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      if (!current || current.type !== "list" || current.ordered) {
        pushCurrent();
        current = { type: "list", ordered: false, items: [] };
      }
      current.items.push(bullet[1].trim());
      return;
    }

    const numberedItem = line.match(/^\d+\.\s+(.+)$/);
    if (numberedItem) {
      if (!current || current.type !== "list" || !current.ordered) {
        pushCurrent();
        current = { type: "list", ordered: true, items: [] };
      }
      current.items.push(numberedItem[1].trim());
      return;
    }

    if (/^No critical alerts\.?$/i.test(line) || /^No alerts\.?$/i.test(line)) {
      pushCurrent();
      current = { type: "callout", tone: "green", text: line };
      pushCurrent();
      return;
    }

    if (!current) {
      current = { type: "paragraph", text: line };
      return;
    }

    if (["section", "subsection", "paragraph", "callout"].includes(current.type)) {
      current.text = `${current.text ? current.text + "\n" : ""}${line}`;
      return;
    }

    pushCurrent();
    current = { type: "paragraph", text: line };
  });

  pushCurrent();
  return blocks;
}

function formatInlineStrong(text) {
  const input = String(text || "");
  const parts = [];
  const regex = /\*\*(.+?)\*\*/g;
  let last = 0;
  let match;
  while ((match = regex.exec(input)) !== null) {
    if (match.index > last) parts.push(input.slice(last, match.index));
    parts.push(<strong key={`strong-${match.index}`}>{match[1]}</strong>);
    last = match.index + match[0].length;
  }
  if (last < input.length) parts.push(input.slice(last));
  return parts.length ? parts : input;
}

function StructuredTextSection({ title, text, note = "", tone = "blue" }) {
  if (!text) return null;
  const blocks = parseStructuredMarkdown(text);
  return (
    <div className="result-section">
      <div className="section-head">
        <div className="label section-label-strong">{title}</div>
        {note ? <div className="section-note">{note}</div> : null}
      </div>
      <div className={`structured-block tone-${tone}`}>
        {blocks.map((block, idx) => {
          if (block.type === "section") {
            return (
              <div className="structured-section-title" key={`sec-${idx}`}>
                <div>{block.title}</div>
                {block.text ? <p>{formatInlineStrong(block.text)}</p> : null}
              </div>
            );
          }
          if (block.type === "subsection") {
            return (
              <div className="structured-subsection" key={`sub-${idx}`}>
                <div className="structured-subtitle">{block.title}</div>
                {block.text ? <p>{formatInlineStrong(block.text)}</p> : null}
              </div>
            );
          }
          if (block.type === "list") {
            const Tag = block.ordered ? "ol" : "ul";
            return (
              <Tag className={block.ordered ? "structured-list ordered" : "structured-list"} key={`list-${idx}`}>
                {block.items.map((item, itemIdx) => <li key={`item-${idx}-${itemIdx}`}>{formatInlineStrong(item)}</li>)}
              </Tag>
            );
          }
          if (block.type === "callout") {
            return <div className={`inline-callout tone-${block.tone || tone}`} key={`call-${idx}`}>{formatInlineStrong(block.text)}</div>;
          }
          return <p className="structured-paragraph" key={`p-${idx}`}>{formatInlineStrong(block.text)}</p>;
        })}
      </div>
    </div>
  );
}

function TextSection({ title, text, tone = "blue", entities = [], highlightTokens = false, note = "" }) {
  if (!text) return null;
  return (
    <div className="result-section">
      <div className="section-head">
        <div className="label section-label-strong">{title}</div>
        {note ? <div className="section-note">{note}</div> : null}
      </div>
      <div className="text-block" style={{ borderColor: `var(--border)` }}>
        <HighlightedText text={text} entities={entities} highlightTokens={highlightTokens} />
      </div>
    </div>
  );
}

function KeyValueTable({ rows }) {
  const items = rows.filter(([, value]) => value != null && value !== "" && !(Array.isArray(value) && value.length === 0));
  if (!items.length) return <div className="muted-block">No structured fields available.</div>;
  return (
    <table className="kv-table">
      <tbody>
        {items.map(([key, value]) => (
          <tr key={key}>
            <td>{key}</td>
            <td>{Array.isArray(value) ? value.join(", ") : String(value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}


function DocumentText({ text }) {
  if (!text) return <div className="muted-block">No content available.</div>;
  const lines = String(text).split("\n").map((line) => line.trim()).filter(Boolean);
  const bullets = lines.filter((line) => /^[-*]\s+/.test(line));
  if (bullets.length && bullets.length === lines.length) {
    return <ul className="report-list">{bullets.map((line, idx) => <li key={idx}>{line.replace(/^[-*]\s+/, "")}</li>)}</ul>;
  }
  return (
    <div className="doc-block">
      {lines.map((line, idx) => <p key={idx} style={{ marginTop: idx ? 10 : 0 }}>{line}</p>)}
    </div>
  );
}

function ChecklistTable({ items = [] }) {
  if (!items.length) return <div className="muted-block">No checklist output returned.</div>;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="checklist-table">
        <thead>
          <tr>
            <th style={{ width: '34%' }}>Checklist item</th>
            <th style={{ width: '16%' }}>Status</th>
            <th style={{ width: '25%' }}>Evidence</th>
            <th>Consistency / note</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={`${item.item || 'item'}-${idx}`}>
              <td>
                <div className="checklist-item">{item.item || `Item ${idx + 1}`}</div>
              </td>
              <td><Badge tone={statusTone(String(item.status || ''))}>{item.status || '—'}</Badge></td>
              <td><div className="checklist-sub">{item.evidence || '—'}</div></td>
              <td><div className="checklist-sub">{item.consistency_issue || '—'}</div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DiffPreview({ text }) {
  if (!text) return null;
  return (
    <div className="diff-block">
      {String(text).split("\n").map((line, idx) => {
        const cls = line.startsWith("+") && !line.startsWith("+++")
          ? "added"
          : line.startsWith("-") && !line.startsWith("---")
            ? "removed"
            : line.startsWith("@@")
              ? "meta"
              : "plain";
        return <div key={`${cls}-${idx}`} className={`diff-line ${cls}`}>{line || " "}</div>;
      })}
    </div>
  );
}

function UtilityResultHeader({ title, subtitle, badge }) {
  return (
    <div className="utility-header">
      <div>
        <h4>{title}</h4>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {badge ? <Badge tone="blue">{badge}</Badge> : null}
    </div>
  );
}


function parseLabeledLines(content) {
  const map = [];
  String(content || "").split("\n").map((line) => line.trim()).filter(Boolean).forEach((line) => {
    const boldMatch = line.match(/^\*\*(.+?)\*\*\s*:?\s*(.*)$/);
    if (boldMatch) {
      map.push([boldMatch[1].replace(/:$/, "").trim(), boldMatch[2].trim()]);
      return;
    }
    const plainMatch = line.match(/^([^:]{2,40}):\s*(.+)$/);
    if (plainMatch) {
      map.push([plainMatch[1].trim(), plainMatch[2].trim()]);
    }
  });
  return map;
}

function parseBulletList(content) {
  return String(content || "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "").trim())
    .filter(Boolean);
}

function parseInspectionReport(text) {
  const raw = String(text || "").replace(/\r/g, "").trim();
  if (!raw) return null;

  const titleMatch = raw.match(/^#\s+(.+)$/m) || raw.match(/^\*\*([^*]+REPORT)\*\*$/im);
  const title = titleMatch ? titleMatch[1].trim() : "CDSCO Inspection Report";

  const lines = raw.split("\n");
  const sectionEntries = [];
  const headingMatchers = [
    /^##\s*(?:\d+\.?\s*)?(.+?)\s*$/i,
    /^\*\*(?:\d+\.?\s*)?(.+?)\*\*\s*$/i,
    /^(?:\d+\.?\s*)(INSPECTION DETAILS|SCOPE|AREAS INSPECTED|OBSERVATIONS|OVERALL ASSESSMENT|RECOMMENDATION)\s*$/i,
  ];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    for (const matcher of headingMatchers) {
      const m = trimmed.match(matcher);
      if (m) {
        const heading = m[1].replace(/^[#*\s]+|[#*\s]+$/g, "").trim();
        if (/INSPECTION DETAILS|SCOPE|AREAS INSPECTED|OBSERVATIONS|OVERALL ASSESSMENT|RECOMMENDATION/i.test(heading)) {
          sectionEntries.push({ heading, lineIndex: idx });
          break;
        }
      }
    }
  });

  const sections = {};
  sectionEntries.forEach((entry, index) => {
    const start = entry.lineIndex + 1;
    const end = index + 1 < sectionEntries.length ? sectionEntries[index + 1].lineIndex : lines.length;
    sections[entry.heading] = lines.slice(start, end).join("\n").trim();
  });

  const findSection = (term) => {
    const key = Object.keys(sections).find((section) => section.toUpperCase().includes(term));
    return key ? sections[key] : "";
  };

  const rawObs = findSection("OBSERVATIONS");
  const observationGroups = [];
  if (rawObs) {
    const obsLines = rawObs.split("\n").map((line) => line.trim()).filter(Boolean);
    let current = { title: "Key findings", items: [] };
    const pushCurrent = () => {
      if (current.items.length) observationGroups.push(current);
    };

    obsLines.forEach((line) => {
      let cleaned = line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "").trim();
      if (!cleaned) return;
      const sectionMatch = cleaned.match(/^\*\*(.+?)\*\*:?$/) || cleaned.match(/^([A-Za-z][A-Za-z0-9 ()/,&-]{2,40}):$/);
      if (sectionMatch) {
        pushCurrent();
        current = { title: sectionMatch[1].replace(/:$/, '').trim(), items: [] };
        return;
      }
      const inlineGroup = cleaned.match(/^\*\*(.+?)\*\*\s*:\s*(.+)$/);
      if (inlineGroup) {
        pushCurrent();
        current = { title: inlineGroup[1].trim(), items: [inlineGroup[2].trim()] };
        return;
      }
      current.items.push(cleaned.replace(/^\*\*(.+?)\*\*\s*:\s*/, ""));
    });
    pushCurrent();
  }

  return {
    title,
    details: parseLabeledLines(findSection("INSPECTION DETAILS")),
    scope: findSection("SCOPE"),
    areas: parseBulletList(findSection("AREAS INSPECTED")),
    observationGroups,
    overallAssessment: findSection("OVERALL ASSESSMENT"),
    recommendation: findSection("RECOMMENDATION"),
    raw,
  };
}

function InspectionReportView({ report }) {
  const parsed = parseInspectionReport(report);
  if (!parsed) return null;

  return (
    <div className="result-shell">
      <UtilityResultHeader
        title={parsed.title}
        subtitle="Converted from unstructured or handwritten inspection observations into a standardised formal report draft for reviewer refinement."
        badge="Inspection report"
      />

      {parsed.details?.length ? (
        <div className="result-section">
          <div className="section-head">
            <div className="label">Inspection details</div>
            <div className="inline-note">Administrative fields organised into formal report structure</div>
          </div>
          <div className="inspection-detail-grid">
            {parsed.details.map(([key, value]) => (
              <div className="inspection-detail-card" key={key}>
                <div className="k">{key}</div>
                <div className="v">{value || "[TO BE COMPLETED]"}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="report-grid two">
        {parsed.scope ? (
          <div className="result-section">
            <div className="section-head"><div className="label">Scope</div></div>
            <DocumentText text={parsed.scope} />
          </div>
        ) : null}
        {parsed.areas?.length ? (
          <div className="result-section">
            <div className="section-head"><div className="label">Areas inspected</div></div>
            <div className="doc-block"><ul className="report-list">{parsed.areas.map((item, idx) => <li key={`area-${idx}`}>{item}</li>)}</ul></div>
          </div>
        ) : null}
      </div>

      {parsed.observationGroups?.length ? (
        <div className="result-section">
          <div className="section-head">
            <div className="label">Observations</div>
            <div className="section-note">Standardised findings prepared from the source notes for reviewer refinement.</div>
          </div>
          <div className="report-grid">
            {parsed.observationGroups.map((group, idx) => (
              <div className="report-subgroup" key={`${group.title}-${idx}`}>
                <h5>{group.title}</h5>
                <ul className="report-list">
                  {group.items.map((item, itemIdx) => <li key={`${group.title}-${itemIdx}`}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {parsed.overallAssessment ? (
        <div className="result-section">
          <div className="section-head"><div className="label">Overall assessment</div></div>
          <div className="inspection-callout tone-amber">{parsed.overallAssessment}</div>
        </div>
      ) : null}

      {parsed.recommendation ? (
        <div className="result-section">
          <div className="section-head"><div className="label">Recommendation</div></div>
          <div className="inspection-callout tone-green">{parsed.recommendation}</div>
        </div>
      ) : null}
    </div>
  );
}


function OverviewPanel({ overview }) {
  if (!overview) {
    return <div className="empty">Run the case pipeline to generate an overview.</div>;
  }

  const snapshot = overview.review_snapshot || {};
  const latest = overview.latest_results || {};
  const reviewCount = Array.isArray(overview.reviews) ? overview.reviews.length : 0;
  const docCount = snapshot.document_count ?? (Array.isArray(overview.documents) ? overview.documents.length : 0);

  const latestRows = Object.entries(latest).map(([key, value]) => {
    const label = key.replace(/_/g, ' ').toLowerCase().replace(/\w/g, (m) => m.toUpperCase());
    let summary = 'Available';
    if (value && typeof value === 'object') {
      if (typeof value.document_type === 'string') summary = value.document_type;
      else if (typeof value.severity === 'string') summary = value.severity;
      else if (typeof value.pct !== 'undefined') summary = `${value.pct}% complete`;
      else if (typeof value.entity_count !== 'undefined') summary = `${value.entity_count} entities`;
      else if (typeof value.similarity_pct !== 'undefined') summary = `${value.similarity_pct}% similar`;
      else if (typeof value.summary === 'string') summary = value.summary.slice(0, 96) + (value.summary.length > 96 ? '…' : '');
    }
    return [label, summary];
  });

  return (
    <div className="result-shell">
      <div className="result-grid">
        <ResultStat label="Documents" value={docCount} tone="blue" />
        <ResultStat label="Queue priority" value={overview.queue_priority || '—'} tone="amber" />
        <ResultStat label="Summary" value={snapshot.summary_available ? 'Ready' : 'Pending'} tone={snapshot.summary_available ? 'green' : 'gray'} />
        <ResultStat label="Reviews" value={reviewCount} tone="violet" />
      </div>

      <div className="result-grid">
        <ResultStat label="Completeness" value={snapshot.completeness_pct != null ? `${snapshot.completeness_pct}%` : '—'} tone="blue" />
        <ResultStat label="Severity" value={snapshot.severity || '—'} tone={statusTone(String(snapshot.severity || ''))} />
        <ResultStat label="Duplicate" value={snapshot.duplicate_flag == null ? '—' : snapshot.duplicate_flag ? 'Possible duplicate' : 'No duplicate'} tone={snapshot.duplicate_flag ? 'amber' : 'green'} />
        <ResultStat label="Case status" value={overview.case?.status || '—'} tone={statusTone(String(overview.case?.status || ''))} />
      </div>

      <div className="result-columns">
        <div className="result-section">
          <div className="section-head">
            <div className="label">Current case snapshot</div>
            <div className="section-note">Latest case-level rollup from stored pipeline outputs.</div>
          </div>
          <KeyValueTable rows={[
            ['Case title', overview.case?.title],
            ['Case type', overview.case?.case_type],
            ['Priority', overview.queue_priority],
            ['Status', overview.case?.status],
            ['Created by', overview.case?.created_by],
            ['Created at', niceDate(overview.case?.created_at)],
            ['Last updated', niceDate(overview.case?.updated_at)],
          ]} />
        </div>

        <div className="result-section">
          <div className="section-head">
            <div className="label">Latest outputs</div>
            <div className="section-note">Most recent available result for each analysis type.</div>
          </div>
          <KeyValueTable rows={latestRows} />
        </div>
      </div>
    </div>
  );
}


function titleCase(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\w/g, (m) => m.toUpperCase());
}

// ── Change-analysis color tokens ──────────────────────────────────────────────
const CHANGE_CATEGORY_COLORS = {
  SUBSTANTIVE:    { bg: "#fef2f2", border: "#fecaca", text: "#991b1b", dot: "#ef4444" },
  ADMINISTRATIVE: { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af", dot: "#3b82f6" },
  ADDED:          { bg: "#f0fdf4", border: "#bbf7d0", text: "#14532d", dot: "#22c55e" },
  REMOVED:        { bg: "#fff7ed", border: "#fed7aa", text: "#7c2d12", dot: "#f97316" },
  DATA:           { bg: "#faf5ff", border: "#e9d5ff", text: "#581c87", dot: "#a855f7" },
  INCONSISTENCY:  { bg: "#fffbeb", border: "#fde68a", text: "#78350f", dot: "#f59e0b" },
};

const CHANGE_KEYWORDS = {
  SUBSTANTIVE:    [/\bsubstantive\b/i,/\bsignificant\b/i,/\bcritical\b/i,/\bmajor\b/i,/\bclinical\b/i,/\bprotocol\b/i,/\befficacy\b/i,/\bsafety\b/i],
  REMOVED:        [/\bremov(e[sd]?|al)\b/i,/\bdelet(e[sd]?|ion)\b/i,/\bdropped?\b/i,/\bomitted?\b/i],
  ADDED:          [/\badd(ed|ition)?\b/i,/\bnew(ly)?\b/i,/\binserted?\b/i,/\bincluded?\b/i],
  DATA:           [/\bdata\b/i,/\btable\b/i,/\bfigure\b/i,/\bnumber\b/i,/\bstatistic\b/i,/\bdose\b/i],
  INCONSISTENCY:  [/\binconsisten(t|cy)\b/i,/\bmismatch\b/i,/\bconflict\b/i,/\bdiscrepan(t|cy)\b/i],
  ADMINISTRATIVE: [/\badministrative\b/i,/\bformatting?\b/i,/\btypo\b/i,/\bwording\b/i,/\bminor\b/i],
};

function detectLineTone(line) {
  for (const [cat, patterns] of Object.entries(CHANGE_KEYWORDS)) {
    if (patterns.some((p) => p.test(line))) return cat;
  }
  return null;
}

function RichChangeAnalysis({ text }) {
  if (!text) return null;
  const lines = String(text).trim().split("\n").map((l) => l.trim()).filter(Boolean);
  const blocks = [];
  let cur = null;

  for (const rawLine of lines) {
    // Strip markdown heading markers (### / ####) before any other check
    const line = rawLine.replace(/^#{1,6}\s+/, "").trim();
    if (!line) continue;

    const h1 = line.match(/^(\d+)\.\s+(.+)$/);
    const h2 = line.match(/^\*\*(.+?)\*\*:?\s*$/);
    const wasHash = /^#{1,6}\s+/.test(rawLine);         // was a markdown heading
    const allCaps = /^[A-Z][A-Z\s/&():,\-]{3,}$/.test(line);
    const isHeading = wasHash || (h1 && h1[2] === h1[2].toUpperCase()) || h2 || allCaps;

    if (isHeading) {
      const heading = h1 ? h1[1] + ". " + h1[2] : h2 ? h2[1] : line;
      cur = { heading, items: [] };
      blocks.push(cur);
      continue;
    }

    const bulletMatch = line.match(/^[-*•]\s+(.+)$/);
    const content = bulletMatch ? bulletMatch[1] : line;
    const tone = detectLineTone(content);
    if (!cur) { cur = { heading: null, items: [] }; blocks.push(cur); }
    cur.items.push({ text: content, tone, isBullet: !!bulletMatch });
  }

  return (
    <div className="rich-change-analysis">
      {blocks.map((block, bi) => (
        <div className="rca-section" key={bi}>
          {block.heading && <div className="rca-heading">{formatInlineStrong(block.heading)}</div>}
          <div className="rca-items">
            {block.items.map((item, ii) => {
              const c = CHANGE_CATEGORY_COLORS[item.tone] || null;
              return (
                <div
                  className={"rca-item " + (c ? "rca-toned " : "") + (item.isBullet ? "rca-bullet-item" : "rca-para-item")}
                  key={ii}
                  style={c ? { background: c.bg, borderColor: c.border } : {}}
                >
                  {c
                    ? <span className="rca-dot" style={{ background: c.dot }} />
                    : item.isBullet
                      ? <span className="rca-plain-dot" />
                      : null
                  }
                  <span style={c ? { color: c.text } : {}}>{formatInlineStrong(item.text)}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}


function renderUtilityResult(tool, result) {
  const data = result || {};

  if (tool === "anonymise") {
    const entities = data.entities_found || [];
    return (
      <div className="result-shell">
        <UtilityResultHeader
          title="Anonymisation result"
          subtitle="Sensitive data found in the uploaded content, grouped into readable reviewer sections."
          badge={`${data.entity_count || 0} entities`}
        />
        <div className="result-grid">
          <ResultStat label="Entities found" value={data.entity_count ?? 0} tone="blue" note="Detected sensitive spans in the source" />
          <ResultStat label="Unique types" value={Object.keys(data.entity_types_summary || {}).length} tone="violet" />
          <ResultStat label="Rule-based" value={data.detection_methods?.rule_based ?? 0} tone="amber" />
          <ResultStat label="NLP" value={data.detection_methods?.nlp ?? 0} tone="green" />
        </div>
        {Object.keys(data.entity_types_summary || {}).length ? (
          <div className="result-section">
            <div className="section-head">
              <div className="label">Entity type summary</div>
            </div>
            <EntityTypeSummary data={data.entity_types_summary} />
          </div>
        ) : null}
        <div className="result-section">
          <div className="section-head">
            <div className="label">Detected entities</div>
            <div className="section-note">First 15 findings shown for quick review.</div>
          </div>
          <EntityTable entities={entities} />
        </div>
        {data.compliance_note ? (
          <div className="result-section">
            <div className="section-head"><div className="label">Compliance note</div></div>
            <div className="muted-block">{data.compliance_note}</div>
          </div>
        ) : null}
        <TextSection title="Pseudonymised text" text={data.pseudonymised_text} entities={entities} highlightTokens note="Detected values and generated tokens are highlighted." />
        <TextSection title="Generalised text" text={data.generalised_text} entities={entities} highlightTokens note="Generalised values are shown in place of direct identifiers." />
        <TextSection title="Anonymised text" text={data.anonymised_text} entities={entities} highlightTokens note="Irreversible replacements generated for protected review workflows." />
      </div>
    );
  }

  if (tool === "summarise") {
    const metrics = data.eval_metrics || {};
    return (
      <div className="result-shell">
        <UtilityResultHeader
          title="Document summary"
          subtitle="Structured summary prepared for reviewer consumption from the uploaded document."
          badge={data.document_type || "Summary"}
        />
        <div className="result-grid">
          <ResultStat label="ROUGE-1 F1" value={metrics.rouge?.rouge1?.f1 ?? "—"} tone="blue" note="Unigram overlap (CNN/DailyMail benchmark)" />
          <ResultStat label="ROUGE-2 F1" value={metrics.rouge?.rouge2?.f1 ?? "—"} tone="green" note="Bigram overlap" />
          <ResultStat label="ROUGE-L F1" value={metrics.rouge?.rougeL?.f1 ?? "—"} tone="violet" note="Longest common subsequence" />
          <ResultStat label="BERTScore F1" value={metrics.bert_score?.f1 ?? "—"} tone="amber" note="Semantic similarity (XSum equivalent)" />
          <ResultStat label="Compression ratio" value={metrics.compression_ratio ?? "—"} tone="gray" note="Lower = more concise summary" />
        </div>
        <StructuredTextSection title="Summary" text={data.summary} tone="blue" note="Standardised summary generated for the detected document type." />
        <StructuredTextSection title="Recommendations" text={data.recommendations} tone="violet" note="Suggested next reviewer actions." />
        <StructuredTextSection title="Alerts" text={data.alerts} tone="amber" note="Important review flags found during analysis." />
      </div>
    );
  }

  if (tool === "completeness") {
    return (
      <div className="result-shell">
        <UtilityResultHeader
          title="Completeness review"
          subtitle="Checklist-based review of the uploaded document for missing, incomplete, or unclear information."
          badge={data.doc_type || data.checklist || "Checklist"}
        />
        <div className="result-grid">
          <ResultStat label="Present" value={data.present ?? 0} tone="green" />
          <ResultStat label="Missing" value={data.missing ?? 0} tone="rose" />
          <ResultStat label="Incomplete" value={data.incomplete ?? 0} tone="amber" />
          <ResultStat label="Completion" value={data.pct != null ? `${data.pct}%` : "—"} tone="blue" />
        </div>
        <div className="result-section">
          <div className="section-head">
            <div className="label">Checklist results</div>
            <div className="section-note">Each row shows status, supporting evidence, and any consistency issue returned by the backend.</div>
          </div>
          <ChecklistTable items={data.items || []} />
        </div>
      </div>
    );
  }

  if (tool === "compare") {
    const structuredDiff = data.structured_diff || {};
    const changedFields = structuredDiff.changed_fields || [];
    const addedFields = structuredDiff.added_fields || [];
    const removedFields = structuredDiff.removed_fields || [];
    const hasDiff = changedFields.length || addedFields.length || removedFields.length;

    const simPct = data.similarity_pct;
    const simTone = simPct == null ? "gray" : simPct >= 90 ? "green" : simPct >= 70 ? "amber" : "rose";
    const simNote = simPct >= 90 ? "Minor differences only" : simPct >= 70 ? "Moderate divergence" : simPct != null ? "Significant divergence" : "";

    return (
      <div className="result-shell">
        <UtilityResultHeader
          title="Version comparison"
          subtitle="Substantive, administrative, and structured-field changes between the two uploaded document versions. Flagged for reviewer triage per CDSCO guidelines."
          badge="Comparison"
        />

        {/* — Stats row — */}
        <div className="result-grid">
          <ResultStat label="Similarity" value={simPct != null ? `${simPct}%` : "—"} tone={simTone} note={simNote} />
          <ResultStat label="Added lines" value={data.added_lines ?? 0} tone="green" note="Lines present in V2 but not V1" />
          <ResultStat label="Removed lines" value={data.removed_lines ?? 0} tone="rose" note="Lines present in V1 but not V2" />
          <ResultStat
            label="Field changes"
            value={changedFields.length + addedFields.length + removedFields.length}
            tone={hasDiff ? "amber" : "gray"}
            note="Structured field-level delta"
          />
        </div>

        {/* — Rich change analysis — */}
        {data.change_analysis ? (
          <div className="result-section">
            <div className="section-head">
              <div className="label section-label-strong">Change analysis</div>
              <div className="section-note">Narrative breakdown of substantive vs administrative changes, flagged per CDSCO document-review guidelines.</div>
            </div>
            <div className="compare-analysis-card">
              <RichChangeAnalysis text={data.change_analysis} />
            </div>
          </div>
        ) : null}

        {/* — Structured field diff — */}
        {hasDiff ? (
          <div className="result-section">
            <div className="section-head">
              <div className="label section-label-strong">Structured field delta</div>
              <div className="section-note">Field-level additions, removals, and value changes extracted from both versions.</div>
            </div>
            <div className="compare-diff-grid">
              {changedFields.length > 0 && (
                <div className="compare-diff-group tone-amber">
                  <div className="compare-diff-group-head">
                    <span className="compare-diff-icon">⇄</span>
                    <span>Modified fields</span>
                    <span className="compare-diff-count">{changedFields.length}</span>
                  </div>
                  {changedFields.map((item, idx) => (
                    <div className="compare-diff-row" key={`changed-${idx}`}>
                      <div className="compare-diff-field">{item.field}</div>
                      <div className="compare-diff-vals">
                        <span className="compare-val removed-val">{String(item.old_value ?? "—")}</span>
                        <span className="compare-arrow">→</span>
                        <span className="compare-val added-val">{String(item.new_value ?? "—")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {addedFields.length > 0 && (
                <div className="compare-diff-group tone-green">
                  <div className="compare-diff-group-head">
                    <span className="compare-diff-icon">＋</span>
                    <span>Added in V2</span>
                    <span className="compare-diff-count">{addedFields.length}</span>
                  </div>
                  {addedFields.map((item, idx) => (
                    <div className="compare-diff-row" key={`added-${idx}`}>
                      <div className="compare-diff-field">{item.field}</div>
                      <div className="compare-diff-vals">
                        <span className="compare-val added-val">{String(item.new_value ?? "—")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {removedFields.length > 0 && (
                <div className="compare-diff-group tone-rose">
                  <div className="compare-diff-group-head">
                    <span className="compare-diff-icon">−</span>
                    <span>Removed in V2</span>
                    <span className="compare-diff-count">{removedFields.length}</span>
                  </div>
                  {removedFields.map((item, idx) => (
                    <div className="compare-diff-row" key={`removed-${idx}`}>
                      <div className="compare-diff-field">{item.field}</div>
                      <div className="compare-diff-vals">
                        <span className="compare-val removed-val">{String(item.old_value ?? "—")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* — Raw unified diff — */}
        <div className="result-section">
          <div className="section-head">
            <div className="label">Line-level diff</div>
            <div className="section-note">
              <span className="compare-legend-dot tone-green" /> Added &nbsp;
              <span className="compare-legend-dot tone-rose" /> Removed &nbsp;
              <span className="compare-legend-dot tone-gray" /> Context
            </div>
          </div>
          <DiffPreview text={data.diff_preview} />
        </div>
      </div>
    );
  }

  if (tool === "classify") {
    return (
      <div className="result-shell">
        <UtilityResultHeader
          title="Severity classification"
          subtitle="SAE-style case triage result generated from the uploaded document."
          badge={data.recommended_priority || data.severity || "Classification"}
        />
        <div className="result-grid">
          <ResultStat label="Severity" value={data.severity || "—"} tone={statusTone(String(data.severity || ""))} />
          <ResultStat label="Priority" value={data.recommended_priority || "—"} tone={statusTone(String(data.recommended_priority || ""))} />
          <ResultStat label="Score" value={data.severity_score ?? "—"} tone="violet" />
        </div>
        <div className="result-columns">
          <div className="result-section">
            <div className="section-head"><div className="label">Classification details</div></div>
            <KeyValueTable rows={[
              ["Suspect product", data.suspect_drug],
              ["Patient outcome", data.patient_outcome],
              ["Expectedness", data.expectedness],
              ["Causality", data.causality],
              ["SAE terms", data.sae_terms],
            ]} />
          </div>
          <div className="result-section">
            <div className="section-head"><div className="label">Reasoning</div></div>
            <div className="muted-block">{data.severity_reason || "No detailed reason returned."}</div>
          </div>
        </div>
      </div>
    );
  }

  if (tool === "classify-batch") {
    const severityData = data.severity_distribution || data.severity_dist || {};
    const queueItems = data.queue || [];
    const duplicates = data.duplicates || [];
    const normQueue = queueItems.map((item, idx) => ({
      idx: item.idx || item.case_index + 1 || idx + 1,
      case_label: item.case_label || `Case ${item.idx || item.case_index + 1 || idx + 1}`,
      severity: item.severity || item.guideline_severity || item.sev || item.raw_severity || 'OTHER',
      priority: item.priority || item.recommended_priority || item.pri || 'LOW',
      suspect_drug: item.suspect_drug || item.drug || 'Not specified',
      patient_outcome: item.patient_outcome || 'UNKNOWN',
      reason: item.reason || item.severity_reason || '',
    }));
    return (
      <div className="result-shell">
        <UtilityResultHeader
          title="Batch classification"
          subtitle="Cases grouped by severity, duplicate hints, and reviewer priority for SAE-style review."
          badge={`${data.total || normQueue.length || 0} cases`}
        />
        <div className="result-grid">
          <ResultStat label="Death" value={severityData.DEATH ?? 0} tone="rose" />
          <ResultStat label="Disability" value={severityData.DISABILITY ?? 0} tone="violet" />
          <ResultStat label="Hospitalisation" value={severityData.HOSPITALISATION ?? 0} tone="amber" />
          <ResultStat label="Others" value={severityData.OTHER ?? 0} tone="teal" />
        </div>
        <div className="result-section">
          <div className="section-head"><div className="label">Priority queue</div></div>
          <div className="strip-list">
            {normQueue.map((item, idx) => (
              <div className="strip-row" key={`queue-${idx}`}>
                <div className="strip-row-main">
                  <div className="strip-row-title">{item.case_label}</div>
                  <div className="strip-row-sub">{item.suspect_drug}</div>
                  {item.reason ? <div className="strip-row-sub" style={{marginTop: 6}}>{item.reason}</div> : null}
                </div>
                <div className="row" style={{flexWrap: 'wrap', justifyContent: 'flex-end'}}>
                  <Badge tone={statusTone(String(item.severity || ''))}>{item.severity || '—'}</Badge>
                  <Badge tone={statusTone(String(item.priority || ''))}>{item.priority || '—'}</Badge>
                  <Badge tone="slate">Outcome: {item.patient_outcome || 'UNKNOWN'}</Badge>
                </div>
              </div>
            ))}
            {normQueue.length === 0 ? <div className="empty">No batch classification results returned.</div> : null}
          </div>
        </div>
        <div className="result-section">
          <div className="section-head"><div className="label">Duplicate detection</div></div>
          {duplicates.length ? (
            <div className="strip-list">
              {duplicates.map((dup, idx) => (
                <div className="strip-row" key={`dup-${idx}`}>
                  <div className="strip-row-main">
                    <div className="strip-row-title">Case {dup.case} ↔ Case {dup.dup_of}</div>
                    <div className="strip-row-sub">Possible duplicate based on narrative and structured field similarity.</div>
                    {dup.reasons?.length ? <div className="strip-row-sub" style={{marginTop: 6}}>{dup.reasons.join(' • ')}</div> : null}
                  </div>
                  <div className="row" style={{flexWrap: 'wrap', justifyContent: 'flex-end'}}>
                    <Badge tone="amber">Score {dup.duplicate_score ?? '—'}</Badge>
                    <Badge tone="slate">Similarity {dup.text_similarity_pct ?? '—'}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="muted-block">No possible duplicates detected in the uploaded batch.</div>
          )}
        </div>
      </div>
    );
  }

  if (tool === "inspection") {
    return <InspectionReportView report={data.report} />;
  }

  return <div className="pre">{pretty(data)}</div>;
}

function ResultViewer({ result }) {
  const type = String(result?.result_type || "");
  const data = result?.result_json || {};
  const badge = `${titleCase(type)}${result?.created_at ? ` · ${niceDate(result.created_at)}` : ""}`;

  let content = null;
  if (type === "SUMMARY") content = renderUtilityResult("summarise", data);
  else if (type === "COMPLETENESS") content = renderUtilityResult("completeness", data);
  else if (type === "SEVERITY") content = renderUtilityResult("classify", data);
  else if (type === "INSPECTION_REPORT") content = renderUtilityResult("inspection", data);
  else if (type === "ALERTS") content = <TextSection title="Alerts" text={data.alerts} note="Important flags raised by the pipeline for this document." />;
  else if (type === "RECOMMENDATIONS") content = <TextSection title="Recommendations" text={data.recommendations} note="Suggested next actions for the reviewer." />;
  else if (type === "DUPLICATE_CHECK") {
    content = (
      <div className="result-shell">
        <UtilityResultHeader title="Duplicate check" subtitle="Similarity check against other saved case documents." badge={data.is_duplicate ? "Possible duplicate" : "No duplicate"} />
        <div className="result-grid">
          <ResultStat label="Duplicate" value={data.is_duplicate ? "Yes" : "No"} tone={data.is_duplicate ? "amber" : "green"} />
          <ResultStat label="Matched case" value={data.matched_case_id || "—"} tone="blue" />
          <ResultStat label="Matched document" value={data.matched_document_id || "—"} tone="violet" />
        </div>
        <TextSection title="Reason" text={data.reason} />
        {(data.candidates || []).length ? (
          <div className="result-section">
            <div className="section-head"><div className="label">Candidates</div></div>
            <KeyValueTable rows={data.candidates.map((c, idx) => [`Candidate ${idx + 1}`, `${c.case_id || "—"} · ${c.document_id || "—"} · ${c.similarity_pct || c.sim || "—"}%`])} />
          </div>
        ) : null}
      </div>
    );
  } else if (type === "STRUCTURED_FIELDS") {
    const fields = data.structured_fields || {};
    content = (
      <div className="result-shell">
        <UtilityResultHeader title="Structured fields" subtitle="Field-level extraction saved from the current document." badge={Object.keys(fields).length ? `${Object.keys(fields).length} fields` : "No fields"} />
        <div className="result-section">
          <KeyValueTable rows={Object.entries(fields).map(([k, v]) => [titleCase(k), Array.isArray(v) ? v.join(', ') : (typeof v === 'object' ? JSON.stringify(v) : v)])} />
        </div>
      </div>
    );
  } else {
    content = <div className="pre">{pretty(data)}</div>;
  }

  return (
    <div className="result-row">
      <div className="result-row-top">
        <div>
          <h4>{titleCase(type)}</h4>
          <div className="muted small">{result?.document_id ? `Document ${result.document_id}` : "Case-level result"}</div>
        </div>
        <Badge tone={statusTone(type)}>{badge}</Badge>
      </div>
      <div style={{ marginTop: 12 }}>{content}</div>
    </div>
  );
}

function AuditPanel({ audit }) {
  const auditLogs = audit?.audit_logs || [];
  const reviewActions = audit?.review_actions || [];
  if (!auditLogs.length && !reviewActions.length) {
    return <div className="empty">No audit history recorded yet.</div>;
  }

  return (
    <div className="stack">
      {reviewActions.length ? (
        <div className="result-section">
          <div className="section-head">
            <div className="label">Reviewer actions</div>
            <div className="section-note">Manual case decisions and overrides recorded in the system.</div>
          </div>
          <div className="stack">
            {reviewActions.map((item) => (
              <div className="audit-row" key={item.id}>
                <div className="audit-row-top">
                  <div>
                    <h4>{titleCase(item.action_type)}</h4>
                    <div className="muted small">{item.reviewer || "Reviewer"} · {niceDate(item.created_at)}</div>
                  </div>
                  <Badge tone={statusTone(String(item.action_type || ""))}>{item.action_type}</Badge>
                </div>
                {item.payload ? <div className="pre" style={{ marginTop: 10 }}>{pretty(item.payload)}</div> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {auditLogs.length ? (
        <div className="result-section">
          <div className="section-head">
            <div className="label">System audit log</div>
            <div className="section-note">Case, document, and pipeline events saved by the backend.</div>
          </div>
          <div className="stack">
            {auditLogs.map((log) => (
              <div className="audit-row" key={log.id}>
                <div className="audit-row-top">
                  <div>
                    <h4>{titleCase(log.action)}</h4>
                    <div className="muted small">{log.actor || "system"} · {niceDate(log.created_at)}</div>
                  </div>
                  <div className="row" style={{ justifyContent: 'flex-end' }}>
                    <Badge tone="gray">{log.entity_type || 'event'}</Badge>
                    {log.entity_id ? <Badge tone="blue">{log.entity_id}</Badge> : null}
                  </div>
                </div>
                {log.payload_json ? <div className="pre" style={{ marginTop: 10 }}>{pretty(log.payload_json)}</div> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function UtilitiesPanel({ api }) {
  const [tool, setTool] = useState("anonymise");
  const [file, setFile] = useState(null);
  const [file2, setFile2] = useState(null);
  const [files, setFiles] = useState([]);
  const [mode, setMode] = useState("both");
  const [translate, setTranslate] = useState(false);
  const [docType, setDocType] = useState("auto");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function run() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const fd = new FormData();
      if (tool === "anonymise") {
        fd.append("file", file);
        fd.append("mode", mode);
        setResult(await api.postForm("/api/anonymise", fd));
      } else if (tool === "summarise") {
        fd.append("file", file);
        fd.append("translate", translate ? "true" : "false");
        setResult(await api.postForm("/api/summarise", fd));
      } else if (tool === "completeness") {
        fd.append("file", file);
        fd.append("doc_type", docType);
        setResult(await api.postForm("/api/completeness", fd));
      } else if (tool === "compare") {
        fd.append("file_v1", file);
        fd.append("file_v2", file2);
        setResult(await api.postForm("/api/compare", fd));
      } else if (tool === "classify") {
        fd.append("file", file);
        setResult(await api.postForm("/api/classify", fd));
      } else if (tool === "classify-batch") {
        files.forEach((f) => fd.append("files", f));
        setResult(await api.postForm("/api/classify-batch", fd));
      } else if (tool === "inspection") {
        fd.append("file", file);
        setResult(await api.postForm("/api/inspection-report", fd));
      }
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  const canRun = useMemo(() => {
    if (tool === "compare") return !!file && !!file2;
    if (tool === "classify-batch") return Array.isArray(files) && files.length > 0;
    return !!file;
  }, [tool, file, file2, files]);

  return (
    <div className="card">
      <SectionTitle icon={Icons.Sparkles} title="Standalone utilities" hint="Legacy-compatible tools on the updated backend" />
      <div className="tabs">
        {[
          ["anonymise", "Anonymise"],
          ["summarise", "Summarise"],
          ["completeness", "Completeness"],
          ["compare", "Compare"],
          ["classify", "Classify"],
          ["classify-batch", "Batch classify"],
          ["inspection", "Inspection"],
        ].map(([id, label]) => (
          <button key={id} className={`tab-btn ${tool === id ? "active" : ""}`} onClick={() => { setTool(id); setResult(null); setError(""); }}>
            {label}
          </button>
        ))}
      </div>

      <div className="stack">
        {tool === "compare" ? (
          <>
            <FilePicker files={file} setFiles={setFile} label="Choose version 1" />
            <FilePicker files={file2} setFiles={setFile2} label="Choose version 2" />
          </>
        ) : tool === "classify-batch" ? (
          <FilePicker files={files} setFiles={setFiles} multiple label="Choose multiple SAE files" />
        ) : (
          <FilePicker files={file} setFiles={setFile} label="Choose a file" />
        )}

        {tool === "anonymise" ? (
          <SelectField label="Mode" value={mode} onChange={setMode} options={[
            { value: "both", label: "Both" },
            { value: "pseudonymise", label: "Pseudonymise" },
            { value: "anonymise", label: "Anonymise" },
          ]} />
        ) : null}

        {tool === "summarise" ? (
          <label className="btn ghost small" style={{ width: "fit-content" }}>
            <input type="checkbox" checked={translate} onChange={(e) => setTranslate(e.target.checked)} style={{ marginRight: 8 }} />
            Auto-translate before summarising
          </label>
        ) : null}

        {tool === "completeness" ? (
          <SelectField label="Document type" value={docType} onChange={setDocType} options={[
            { value: "auto", label: "Auto" },
            { value: "SAE_REPORT", label: "SAE report" },
            { value: "REGULATORY_APPLICATION", label: "Regulatory application" },
          ]} />
        ) : null}

        <div className="row">
          <button className="btn primary" onClick={run} disabled={!canRun || loading}>
            <Icons.Play /> {loading ? "Running..." : "Run utility"}
          </button>
        </div>

        {error ? <div className="alert">{error}</div> : null}
        {result ? <div className="stack"><div className="label">Styled result</div>{renderUtilityResult(tool, result)}</div> : null}
      </div>
    </div>
  );
}

function BenchmarkPanel({ api }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);

  async function run() {
    setLoading(true);
    setError("");
    setData(null);
    try {
      setData(await api.get("/api/metrics/summarisation-benchmark"));
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  const avg = data?.macro_avg || {};
  const samples = data?.per_sample || [];

  const scoreColor = (v) => {
    if (v == null || v === "—") return "gray";
    const n = parseFloat(v);
    if (n >= 0.45) return "green";
    if (n >= 0.25) return "amber";
    return "rose";
  };

  return (
    <div className="stack">
      <div className="utility-header">
        <div>
          <h4>Summarisation benchmark</h4>
          <p>
            Runs the live summarisation pipeline on <strong>{data?.total_samples ?? 5}</strong> curated
            CNN/DailyMail + XSum-style regulatory domain samples, then evaluates
            ROUGE-1, ROUGE-2, ROUGE-L, and BERTScore against <strong>gold reference summaries</strong>.
            Scores are dynamic — recomputed on every run against fixed gold references.
          </p>
        </div>
        <Badge tone="violet">CNN/DailyMail · XSum</Badge>
      </div>

      <div className="row">
        <button className="btn primary" onClick={run} disabled={loading}>
          <Icons.Play /> {loading ? "Running benchmark…" : "Run benchmark"}
        </button>
        {loading ? <div className="loading">Summarising {data?.total_samples ?? 5} samples against gold references</div> : null}
      </div>

      {error ? <div className="alert">{error}</div> : null}

      {data && (
        <div className="stack">
          {/* Macro averages */}
          <div className="result-section">
            <div className="section-head">
              <div className="label section-label-strong">Macro-average scores ({data.evaluated}/{data.total_samples} samples)</div>
              <div className="section-note">Averaged across all evaluated samples vs gold reference summaries</div>
            </div>
            <div className="result-grid">
              <ResultStat label="ROUGE-1 F1" value={avg.rouge1_f1 ?? "—"} tone={scoreColor(avg.rouge1_f1)} note="Unigram overlap vs gold (CNN/DM)" />
              <ResultStat label="ROUGE-2 F1" value={avg.rouge2_f1 ?? "—"} tone={scoreColor(avg.rouge2_f1)} note="Bigram overlap vs gold" />
              <ResultStat label="ROUGE-L F1" value={avg.rougeL_f1 ?? "—"} tone={scoreColor(avg.rougeL_f1)} note="LCS F1 vs gold (XSum)" />
              <ResultStat label="BERTScore F1" value={avg.bert_score_f1 ?? "—"} tone={scoreColor(avg.bert_score_f1)} note="Semantic similarity vs gold" />
            </div>
          </div>

          {/* Per-sample breakdown */}
          <div className="result-section">
            <div className="section-head">
              <div className="label section-label-strong">Per-sample breakdown</div>
              <div className="section-note">Click a row to see generated vs gold summary</div>
            </div>
            <div className="stack">
              {samples.map((s, idx) => (
                <div key={s.id} className="benchmark-row">
                  <button
                    className="benchmark-row-head"
                    onClick={() => setExpanded(expanded === idx ? null : idx)}
                  >
                    <div className="benchmark-row-meta">
                      <div className="benchmark-row-id">{s.id}</div>
                      <div className="muted small">{s.source} · {s.document_type || "—"}</div>
                    </div>
                    {s.error ? (
                      <Badge tone="rose">Error</Badge>
                    ) : (
                      <div className="row" style={{ gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        <Badge tone={scoreColor(s.rouge1_f1)}>R1 {s.rouge1_f1 ?? "—"}</Badge>
                        <Badge tone={scoreColor(s.rouge2_f1)}>R2 {s.rouge2_f1 ?? "—"}</Badge>
                        <Badge tone={scoreColor(s.rougeL_f1)}>RL {s.rougeL_f1 ?? "—"}</Badge>
                        <Badge tone={scoreColor(s.bert_score_f1)}>BERT {s.bert_score_f1 ?? "—"}</Badge>
                      </div>
                    )}
                  </button>
                  {expanded === idx && !s.error && (
                    <div className="benchmark-expand">
                      <div className="result-columns">
                        <div>
                          <div className="label" style={{ marginBottom: 6 }}>Generated summary</div>
                          <div className="text-block" style={{ fontSize: 13 }}>{s.generated_summary}</div>
                        </div>
                        <div>
                          <div className="label" style={{ marginBottom: 6 }}>Gold reference</div>
                          <div className="text-block" style={{ fontSize: 13, borderColor: "rgba(15,118,110,.3)", background: "rgba(15,118,110,.03)" }}>{s.gold_summary}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  {expanded === idx && s.error && (
                    <div className="benchmark-expand"><div className="alert">{s.error}</div></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricsPanel({ api }) {
  const [tab, setTab] = useState("latency");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      setData(await api.get("/api/metrics/latency"));
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (tab === "latency") load(); }, [tab]);

  return (
    <div className="card">
      <SectionTitle icon={Icons.Activity} title="Metrics" hint="Latency timings and live summarisation benchmark scores" />
      <div className="tabs" style={{ marginBottom: 18 }}>
        <button className={"tab-btn " + (tab === "latency" ? "active" : "")} onClick={() => setTab("latency")}>Latency</button>
        <button className={"tab-btn " + (tab === "benchmark" ? "active" : "")} onClick={() => setTab("benchmark")}>Summarisation benchmark</button>
      </div>

      {tab === "latency" && (
        <>
          <div className="row" style={{ marginBottom: 14 }}>
            <button className="btn primary" onClick={load}><Icons.Refresh /> Refresh</button>
            {loading ? <div className="loading">Loading metrics</div> : null}
          </div>
          {error ? <div className="alert">{error}</div> : null}
          {data?.message ? <div className="empty">{data.message}</div> : null}
          {data ? (
            <div className="stack">
              <div className="stat-grid">
                <div className="stat"><div className="k">Total ops</div><div className="v">{data.total_ops ?? 0}</div></div>
              </div>
              <div className="stack">
                {Object.entries(data.by_function || {}).map(([name, stats]) => (
                  <div className="queue-row" key={name}>
                    <div className="queue-row-top">
                      <div>
                        <h4 className="mono">{name}</h4>
                        <div className="muted small">count {stats.count}</div>
                      </div>
                      <Badge tone="blue">avg {stats.avg_ms} ms</Badge>
                    </div>
                    <div className="kv" style={{ marginTop: 10 }}>
                      <div className="kv-box"><div className="k">Min</div><div className="v">{stats.min_ms} ms</div></div>
                      <div className="kv-box"><div className="k">Max</div><div className="v">{stats.max_ms} ms</div></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}

      {tab === "benchmark" && <BenchmarkPanel api={api} />}
    </div>
  );
}

function QueuePanel({ api, onOpenCase }) {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/queue/reviewer");
      setQueue(res.queue || []);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="card">
      <SectionTitle icon={Icons.Queue} title="Reviewer queue" hint="Priority-sorted cases ready for officer review" />
      <div className="row" style={{ marginBottom: 14 }}>
        <button className="btn primary" onClick={load}><Icons.Refresh /> Refresh queue</button>
        {loading ? <div className="loading">Refreshing queue</div> : null}
      </div>
      {error ? <div className="alert">{error}</div> : null}
      <div className="stack">
        {queue.length === 0 ? <div className="empty">No queued cases found.</div> : queue.map((item) => (
          <div className="queue-row" key={item.id}>
            <div className="queue-row-top">
              <div>
                <h4>{item.title}</h4>
                <div className="muted small">{item.case_type} · Updated {niceDate(item.updated_at)}</div>
              </div>
              <div className="row" style={{ justifyContent: "flex-end" }}>
                <Badge>{item.priority}</Badge>
                <Badge tone="violet">{item.status}</Badge>
              </div>
            </div>
            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn small" onClick={() => onOpenCase(item.id)}><Icons.Search /> Open case</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPanel({ apiBase, setApiBase, apiToken, setApiToken, reviewer, setReviewer, status, refreshStatus }) {
  return (
    <div className="grid cols-2">
      <div className="card">
        <SectionTitle icon={Icons.Gear} title="Connection settings" hint="Stored locally in your browser" />
        <div className="stack">
          <TextField label="API base URL" value={apiBase} onChange={setApiBase} placeholder="http://localhost:8000" />
          <TextField label="API token" value={apiToken} onChange={setApiToken} placeholder="Optional X-API-Token" />
          <TextField label="Reviewer name" value={reviewer} onChange={setReviewer} placeholder="e.g. CDSCO Officer 1" />
          <div className="row">
            <button className="btn primary" onClick={refreshStatus}><Icons.Refresh /> Test connection</button>
          </div>
        </div>
      </div>
      <div className="card">
        <SectionTitle icon={Icons.Activity} title="Backend status" hint="Live response from /api/status" />
        {status.loading ? <div className="loading">Checking backend</div> : null}
        {status.error ? <div className="alert">{status.error}</div> : null}
        {status.data ? (
          <div className="stack">
            <div className="kv">
              <div className="kv-box"><div className="k">App</div><div className="v">{status.data.app}</div></div>
              <div className="kv-box"><div className="k">Version</div><div className="v">{status.data.version}</div></div>
              <div className="kv-box"><div className="k">LLM enabled</div><div className="v">{String(status.data.llm_enabled)}</div></div>
              <div className="kv-box"><div className="k">Time</div><div className="v">{niceDate(status.data.time)}</div></div>
            </div>
            <div className="pre">{pretty(status.data)}</div>
          </div>
        ) : <div className="empty">No status loaded yet.</div>}
      </div>
    </div>
  );
}

function CaseWorkbench({ api, reviewer, selectedCaseId, setSelectedCaseId, jumpToQueue }) {
  const [cases, setCases] = useState([]);
  const [casesLoading, setCasesLoading] = useState(false);
  const [caseError, setCaseError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [createTitle, setCreateTitle] = useState("");
  const [createType, setCreateType] = useState("REGULATORY_APPLICATION");
  const [createBy, setCreateBy] = useState(reviewer || "Team Medixcel");
  const [createTags, setCreateTags] = useState("");
  const [createNotes, setCreateNotes] = useState("");
  const [selectedCase, setSelectedCase] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [results, setResults] = useState([]);
  const [overview, setOverview] = useState(null);
  const [audit, setAudit] = useState(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [workspaceMessage, setWorkspaceMessage] = useState("");
  const [workspaceError, setWorkspaceError] = useState("");
  const [uploadFiles, setUploadFiles] = useState([]);
  const [translateCase, setTranslateCase] = useState(false);
  const [resultsTab, setResultsTab] = useState("all");
  const [reviewAction, setReviewAction] = useState("APPROVED");
  const [reviewNotes, setReviewNotes] = useState("");
  const [overrideSeverity, setOverrideSeverity] = useState("DEATH");
  const [overrideReason, setOverrideReason] = useState("");
  const [dupFlag, setDupFlag] = useState(false);
  const [dupCaseId, setDupCaseId] = useState("");
  const [dupReason, setDupReason] = useState("");

  async function loadCases({ keepSelection = true } = {}) {
    setCasesLoading(true);
    setCaseError("");
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set("status", filterStatus);
      if (filterType) params.set("case_type", filterType);
      const res = await api.get(`/api/cases${params.toString() ? `?${params.toString()}` : ""}`);
      const list = res.cases || [];
      setCases(list);
      if (!keepSelection && list.length > 0 && !selectedCaseId) {
        setSelectedCaseId(list[0].id);
      }
      if (selectedCaseId && !list.find((c) => c.id === selectedCaseId)) {
        setSelectedCaseId(list[0]?.id || "");
      }
    } catch (e) {
      setCaseError(e.message || String(e));
    } finally {
      setCasesLoading(false);
    }
  }

  async function loadCaseWorkspace(caseId) {
    if (!caseId) {
      setSelectedCase(null);
      setDocuments([]);
      setResults([]);
      setOverview(null);
      setAudit(null);
      return;
    }
    setWorkspaceLoading(true);
    setWorkspaceError("");
    try {
      const [caseData, docsData, resultsData, overviewData, auditData] = await Promise.all([
        api.get(`/api/cases/${caseId}`),
        api.get(`/api/cases/${caseId}/documents`),
        api.get(`/api/cases/${caseId}/results`),
        api.get(`/api/cases/${caseId}/overview`),
        api.get(`/api/cases/${caseId}/audit`),
      ]);
      setSelectedCase(caseData);
      setDocuments(docsData.documents || []);
      setResults(resultsData.results || []);
      setOverview(overviewData);
      setAudit(auditData);
    } catch (e) {
      setWorkspaceError(e.message || String(e));
    } finally {
      setWorkspaceLoading(false);
    }
  }

  useEffect(() => { loadCases(); }, [filterStatus, filterType]);
  useEffect(() => {
    if (selectedCaseId) {
      loadCaseWorkspace(selectedCaseId);
    } else {
      setSelectedCase(null);
      setDocuments([]);
      setResults([]);
      setOverview(null);
      setAudit(null);
    }
  }, [selectedCaseId]);
  useEffect(() => { if (!createBy && reviewer) setCreateBy(reviewer); }, [reviewer]);

  async function createCase() {
    if (!createTitle.trim()) return;
    setWorkspaceError("");
    setWorkspaceMessage("");
    try {
      const payload = {
        title: createTitle,
        case_type: createType,
        created_by: createBy || reviewer || "Team Medixcel",
        tags: createTags.split(",").map((x) => x.trim()).filter(Boolean),
        notes: createNotes,
      };
      const created = await api.postJson("/api/cases", payload);
      setWorkspaceMessage("Case created successfully.");
      setCreateTitle("");
      setCreateTags("");
      setCreateNotes("");
      await loadCases({ keepSelection: false });
      setSelectedCaseId(created.id);
    } catch (e) {
      setWorkspaceError(e.message || String(e));
    }
  }

  async function deleteCase(caseId) {
    if (!caseId) return;
    const caseTitle = cases.find((item) => item.id === caseId)?.title || "this case";
    const ok = window.confirm(`Delete ${caseTitle}? This will remove the case, its uploaded files, saved results, and audit history.`);
    if (!ok) return;
    setWorkspaceError("");
    setWorkspaceMessage("");
    setWorkspaceLoading(true);
    try {
      await api.delete(`/api/cases/${caseId}`);
      if (selectedCaseId === caseId) {
        setSelectedCaseId("");
        setSelectedCase(null);
        setDocuments([]);
        setResults([]);
        setOverview(null);
        setAudit(null);
      }
      setWorkspaceMessage("Case deleted successfully.");
      await loadCases();
    } catch (e) {
      setWorkspaceError(e.message || String(e));
    } finally {
      setWorkspaceLoading(false);
    }
  }

  async function uploadDocuments() {
    if (!selectedCaseId || uploadFiles.length === 0) return;
    setWorkspaceError("");
    setWorkspaceMessage("");
    setWorkspaceLoading(true);
    try {
      for (const file of uploadFiles) {
        const fd = new FormData();
        fd.append("file", file);
        await api.postForm(`/api/cases/${selectedCaseId}/documents`, fd);
      }
      setWorkspaceMessage(`${uploadFiles.length} document(s) uploaded.`);
      setUploadFiles([]);
      await loadCaseWorkspace(selectedCaseId);
      await loadCases();
    } catch (e) {
      setWorkspaceError(e.message || String(e));
    } finally {
      setWorkspaceLoading(false);
    }
  }

  async function runCasePipeline() {
    if (!selectedCaseId) return;
    setWorkspaceError("");
    setWorkspaceMessage("");
    setWorkspaceLoading(true);
    try {
      await api.postJson(`/api/cases/${selectedCaseId}/run-pipeline?translate=${translateCase ? "true" : "false"}`, {});
      setWorkspaceMessage("Case pipeline completed.");
      await loadCaseWorkspace(selectedCaseId);
      await loadCases();
      jumpToQueue();
    } catch (e) {
      setWorkspaceError(e.message || String(e));
    } finally {
      setWorkspaceLoading(false);
    }
  }

  async function runSingleDocumentPipeline(docId) {
    if (!selectedCaseId || !docId) return;
    setWorkspaceError("");
    setWorkspaceMessage("");
    setWorkspaceLoading(true);
    try {
      await api.postJson(`/api/cases/${selectedCaseId}/documents/${docId}/run-pipeline?translate=${translateCase ? "true" : "false"}`, {});
      setWorkspaceMessage("Document pipeline completed.");
      await loadCaseWorkspace(selectedCaseId);
      await loadCases();
    } catch (e) {
      setWorkspaceError(e.message || String(e));
    } finally {
      setWorkspaceLoading(false);
    }
  }

  async function submitReviewerAction() {
    if (!selectedCaseId || !reviewer.trim()) return;
    setWorkspaceError("");
    setWorkspaceMessage("");
    try {
      await api.postJson(`/api/cases/${selectedCaseId}/reviewer-feedback`, {
        reviewer,
        action_type: reviewAction,
        payload: { notes: reviewNotes },
      });
      setWorkspaceMessage("Reviewer action saved.");
      setReviewNotes("");
      await loadCaseWorkspace(selectedCaseId);
      await loadCases();
    } catch (e) {
      setWorkspaceError(e.message || String(e));
    }
  }

  async function submitOverrideSeverity() {
    if (!selectedCaseId || !reviewer.trim() || !overrideReason.trim()) return;
    setWorkspaceError("");
    setWorkspaceMessage("");
    try {
      await api.postJson(`/api/cases/${selectedCaseId}/override-severity`, {
        reviewer,
        new_severity: overrideSeverity,
        reason: overrideReason,
      });
      setWorkspaceMessage("Severity override recorded.");
      setOverrideReason("");
      await loadCaseWorkspace(selectedCaseId);
      await loadCases();
    } catch (e) {
      setWorkspaceError(e.message || String(e));
    }
  }

  async function submitDuplicateDecision() {
    if (!selectedCaseId || !reviewer.trim() || !dupReason.trim()) return;
    setWorkspaceError("");
    setWorkspaceMessage("");
    try {
      await api.postJson(`/api/cases/${selectedCaseId}/duplicate-decision`, {
        reviewer,
        is_duplicate: dupFlag,
        duplicate_of_case_id: dupFlag ? dupCaseId || null : null,
        reason: dupReason,
      });
      setWorkspaceMessage("Duplicate decision saved.");
      setDupReason("");
      setDupCaseId("");
      await loadCaseWorkspace(selectedCaseId);
      await loadCases();
    } catch (e) {
      setWorkspaceError(e.message || String(e));
    }
  }

  const filteredResults = resultsTab === "all" ? results : results.filter((r) => r.document_id === resultsTab);

  return (
    <div className="grid cols-2">
      <div className="stack">
        <div className="card">
          <SectionTitle icon={Icons.Clipboard} title="Create new case" hint="Case shell before documents are uploaded" />
          <div className="stack">
            <TextField label="Case title" value={createTitle} onChange={setCreateTitle} placeholder="e.g. SAE - Drug X - Hospital Y" />
            <SelectField label="Case type" value={createType} onChange={setCreateType} options={[
              { value: "REGULATORY_APPLICATION", label: "Regulatory application" },
              { value: "SAE_REPORT", label: "SAE report" },
              { value: "MEETING_TRANSCRIPT", label: "Meeting transcript" },
              { value: "INSPECTION_REPORT", label: "Inspection report" },
            ]} />
            <TextField label="Created by" value={createBy} onChange={setCreateBy} placeholder="Team or owner name" />
            <TextField label="Tags" value={createTags} onChange={setCreateTags} placeholder="comma,separated,tags" />
            <TextAreaField label="Notes" value={createNotes} onChange={setCreateNotes} placeholder="Optional internal notes" />
            <button className="btn primary" onClick={createCase}><Icons.Check /> Create case</button>
          </div>
        </div>

        <div className="card">
          <SectionTitle icon={Icons.Files} title="Cases" hint="Filter, select, and manage submissions" />
          <div className="row">
            <SelectField label="Status" value={filterStatus} onChange={setFilterStatus} options={[
              { value: "", label: "All statuses" },
              { value: "NEW", label: "New" },
              { value: "READY_FOR_REVIEW", label: "Ready for review" },
              { value: "FLAGGED", label: "Flagged" },
              { value: "APPROVED", label: "Approved" },
              { value: "REJECTED", label: "Rejected" },
              { value: "ESCALATED", label: "Escalated" },
              { value: "DUPLICATE_CONFIRMED", label: "Duplicate confirmed" },
            ]} />
            <SelectField label="Type" value={filterType} onChange={setFilterType} options={[
              { value: "", label: "All types" },
              { value: "REGULATORY_APPLICATION", label: "Regulatory" },
              { value: "SAE_REPORT", label: "SAE" },
              { value: "MEETING_TRANSCRIPT", label: "Meeting" },
              { value: "INSPECTION_REPORT", label: "Inspection" },
            ]} />
          </div>
          <div className="row" style={{ marginBottom: 12 }}>
            <button className="btn small" onClick={() => loadCases()}><Icons.Refresh /> Refresh cases</button>
            {casesLoading ? <div className="loading">Loading cases</div> : null}
          </div>
          {caseError ? <div className="alert">{caseError}</div> : null}
          <div className="case-list">
            {cases.length === 0 ? <div className="empty">No cases found yet.</div> : cases.map((item) => (
              <div key={item.id} className={`case-item ${selectedCaseId === item.id ? "active" : ""}`}>
                <button className="case-select-btn" onClick={() => setSelectedCaseId(item.id)}>
                  <div className="case-item-head">
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.case_type}</p>
                    </div>
                    <Badge>{item.priority}</Badge>
                  </div>
                  <div className="row" style={{ marginTop: 10 }}>
                    <Badge tone="violet">{item.status}</Badge>
                  </div>
                  <div className="muted small" style={{ marginTop: 8 }}>Updated {niceDate(item.updated_at)}</div>
                </button>
                <div className="case-item-actions">
                  <button className="btn small" onClick={() => setSelectedCaseId(item.id)}><Icons.Search /> Open</button>
                  <button className="btn small danger case-delete-btn" onClick={() => deleteCase(item.id)}><Icons.Trash /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="stack">
        <div className="card">
          <SectionTitle icon={Icons.Search} title={selectedCase ? selectedCase.title : "Case workspace"} hint={selectedCase ? `${selectedCase.case_type} · ${selectedCase.id}` : "Select a case to view details"} />
          {workspaceLoading ? <div className="loading">Loading workspace</div> : null}
          {workspaceError ? <div className="alert">{workspaceError}</div> : null}
          {workspaceMessage ? <div className="success-note">{workspaceMessage}</div> : null}
          {!selectedCase ? <div className="empty">Choose a case from the left to start uploading, running, and reviewing.</div> : (
            <div className="stack">
              <div className="kv">
                <div className="kv-box"><div className="k">Status</div><div className="v"><Badge tone="violet">{selectedCase.status}</Badge></div></div>
                <div className="kv-box"><div className="k">Priority</div><div className="v"><Badge>{selectedCase.priority}</Badge></div></div>
                <div className="kv-box"><div className="k">Created by</div><div className="v">{selectedCase.created_by || "—"}</div></div>
                <div className="kv-box"><div className="k">Tags</div><div className="v">{(selectedCase.tags || []).join(", ") || "—"}</div></div>
              </div>
              <FilePicker files={uploadFiles} setFiles={setUploadFiles} multiple label="Upload one or more files to this case" />
              <div className="row">
                <button className="btn primary" onClick={uploadDocuments} disabled={uploadFiles.length === 0 || workspaceLoading}><Icons.Upload /> Upload documents</button>
                <label className="btn ghost small">
                  <input type="checkbox" checked={translateCase} onChange={(e) => setTranslateCase(e.target.checked)} style={{ marginRight: 8 }} />
                  Translate before pipeline
                </label>
                <button className="btn success" onClick={runCasePipeline} disabled={documents.length === 0 || workspaceLoading}><Icons.Play /> Run case pipeline</button>
                <button className="btn danger" onClick={() => deleteCase(selectedCase.id)} disabled={workspaceLoading}><Icons.Trash /> Delete case</button>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <SectionTitle icon={Icons.Files} title="Documents" hint={`${documents.length} uploaded`} />
          {documents.length === 0 ? <div className="empty">No documents uploaded yet.</div> : (
            <div className="stack">
              {documents.map((doc) => (
                <div className="file-row" key={doc.id}>
                  <div className="file-row-top">
                    <div>
                      <h4>{doc.original_filename}</h4>
                      <div className="muted small">{doc.extension} · {Math.round((doc.file_size_bytes || 0) / 1024)} KB · Uploaded {niceDate(doc.created_at)}</div>
                    </div>
                    <div className="row" style={{ justifyContent: "flex-end" }}>
                      {doc.document_type ? <Badge tone="blue">{doc.document_type}</Badge> : null}
                      <Badge tone={doc.upload_status === "PROCESSED" ? "green" : "gray"}>{doc.upload_status}</Badge>
                    </div>
                  </div>
                  <div className="row" style={{ marginTop: 12 }}>
                    <button className="btn small" onClick={() => runSingleDocumentPipeline(doc.id)} disabled={workspaceLoading}><Icons.Play /> Run document</button>
                    {doc.detected_language ? <Badge tone="gray">{doc.detected_language}</Badge> : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <SectionTitle icon={Icons.Activity} title="Overview" hint="Latest case-level rollup" />
          <OverviewPanel overview={overview} />
        </div>

        <div className="card">
          <SectionTitle icon={Icons.Sparkles} title="Analysis results" hint={`${results.length} stored outputs`} />
          <div className="tabs">
            <button className={`tab-btn ${resultsTab === "all" ? "active" : ""}`} onClick={() => setResultsTab("all")}>All results</button>
            {documents.map((doc) => (
              <button key={doc.id} className={`tab-btn ${resultsTab === doc.id ? "active" : ""}`} onClick={() => setResultsTab(doc.id)}>{doc.original_filename}</button>
            ))}
          </div>
          {filteredResults.length === 0 ? <div className="empty">No analysis results yet.</div> : (
            <div className="stack">
              {filteredResults.map((result) => <ResultViewer key={result.id} result={result} />)}
            </div>
          )}
        </div>

        <div className="card">
          <SectionTitle icon={Icons.User} title="Reviewer actions" hint="Approve, reject, escalate, override, and mark duplicates" />
          {!selectedCase ? <div className="empty">Select a case first.</div> : (
            <div className="stack">
              <div className="grid cols-2">
                <div className="card" style={{ boxShadow: "none" }}>
                  <SectionTitle icon={Icons.Check} title="Case decision" hint="Updates case status and logs a review action" />
                  <div className="stack">
                    <SelectField label="Action" value={reviewAction} onChange={setReviewAction} options={[
                      { value: "APPROVED", label: "Approved" },
                      { value: "REJECTED", label: "Rejected" },
                      { value: "ESCALATED", label: "Escalated" },
                      { value: "CASE_APPROVED", label: "Case approved" },
                    ]} />
                    <TextAreaField label="Notes" value={reviewNotes} onChange={setReviewNotes} placeholder="Why this decision was taken" />
                    <button className="btn primary" onClick={submitReviewerAction}><Icons.Check /> Save decision</button>
                  </div>
                </div>
                <div className="card" style={{ boxShadow: "none" }}>
                  <SectionTitle icon={Icons.Alert} title="Severity override" hint="For SAE cases when officer judgement differs" />
                  <div className="stack">
                    <SelectField label="New severity" value={overrideSeverity} onChange={setOverrideSeverity} options={[
                      { value: "DEATH", label: "Death" },
                      { value: "LIFE_THREATENING", label: "Life threatening" },
                      { value: "HOSPITALISATION", label: "Hospitalisation" },
                      { value: "DISABILITY", label: "Disability" },
                      { value: "OTHER", label: "Other" },
                    ]} />
                    <TextAreaField label="Reason" value={overrideReason} onChange={setOverrideReason} placeholder="Evidence for manual override" />
                    <button className="btn warn" onClick={submitOverrideSeverity}><Icons.Alert /> Override severity</button>
                  </div>
                </div>
              </div>
              <div className="card" style={{ boxShadow: "none" }}>
                <SectionTitle icon={Icons.Files} title="Duplicate decision" hint="Confirms or dismisses suspected duplicate cases" />
                <div className="stack">
                  <label className="btn ghost small" style={{ width: "fit-content" }}>
                    <input type="checkbox" checked={dupFlag} onChange={(e) => setDupFlag(e.target.checked)} style={{ marginRight: 8 }} />
                    Mark as duplicate
                  </label>
                  {dupFlag ? <TextField label="Duplicate of case ID" value={dupCaseId} onChange={setDupCaseId} placeholder="Target case UUID" /> : null}
                  <TextAreaField label="Reason" value={dupReason} onChange={setDupReason} placeholder="Why this is or is not a duplicate" />
                  <button className="btn danger" onClick={submitDuplicateDecision}><Icons.Files /> Save duplicate decision</button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <SectionTitle icon={Icons.Clipboard} title="Audit trail" hint="Case history and reviewer actions" />
          <AuditPanel audit={audit} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [apiBase, setApiBase] = useStoredState(LS_KEYS.apiBase, DEFAULT_API_BASE);
  const [apiToken, setApiToken] = useStoredState(LS_KEYS.apiToken, "");
  const [reviewer, setReviewer] = useStoredState(LS_KEYS.reviewer, "CDSCO Reviewer");
  const [activeNav, setActiveNav] = useStoredState(LS_KEYS.activeNav, "workbench");
  const [selectedCaseId, setSelectedCaseId] = useStoredState(LS_KEYS.selectedCase, "");
  const [status, setStatus] = useState({ loading: false, data: null, error: "" });

  const api = useMemo(() => {
    const cleanBase = (apiBase || DEFAULT_API_BASE).replace(/\/$/, "");
    async function request(path, options = {}) {
      const headers = new Headers(options.headers || {});
      if (apiToken.trim()) headers.set("X-API-Token", apiToken.trim());
      const response = await fetch(`${cleanBase}${path}`, { ...options, headers });
      const text = await response.text();
      const json = text ? (() => { try { return JSON.parse(text); } catch { return null; } })() : null;
      if (!response.ok) {
        const detail = json?.detail || text || `${response.status}`;
        throw new Error(detail);
      }
      return json;
    }
    return {
      get: (path) => request(path),
      postJson: (path, payload) => request(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }),
      patchJson: (path, payload) => request(path, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }),
      delete: (path) => request(path, { method: "DELETE" }),
      postForm: (path, formData) => request(path, { method: "POST", body: formData }),
      base: cleanBase,
    };
  }, [apiBase, apiToken]);

  async function refreshStatus() {
    setStatus({ loading: true, data: null, error: "" });
    try {
      const data = await api.get("/api/status");
      setStatus({ loading: false, data, error: "" });
    } catch (e) {
      setStatus({ loading: false, data: null, error: e.message || String(e) });
    }
  }

  useEffect(() => { refreshStatus(); }, [api.base, apiToken]);

  const navItems = [
    { id: "workbench", label: "Case Workbench", icon: Icons.Files, badge: "core", desc: "Create cases, upload files, run the pipeline, and review outputs." },
    { id: "queue", label: "Reviewer Queue", icon: Icons.Queue, badge: "triage", desc: "Officer-facing queue sorted by priority and readiness." },
    { id: "utilities", label: "Utilities", icon: Icons.Sparkles, badge: "tools", desc: "Standalone anonymise, summarise, compare, classify, and inspection tools." },
    { id: "metrics", label: "Metrics", icon: Icons.Activity, badge: "ops", desc: "Latency and runtime metrics from the backend." },
    { id: "settings", label: "Settings", icon: Icons.Gear, badge: "config", desc: "API base URL, token, reviewer name, and live backend status." },
  ];
  const current = navItems.find((item) => item.id === activeNav) || navItems[0];

  function openCase(caseId) {
    setSelectedCaseId(caseId);
    setActiveNav("workbench");
  }

  return (
    <>
      <style>{styles}</style>
      <div className="app-shell">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-top">
              <div className="brand-badge"><Icons.Shield /></div>
              <div>
                <h1>Nirikshan AI</h1>
                <p>Regulatory workflow cockpit</p>
              </div>
            </div>
          </div>

          <div className="nav-group">
            <div className="nav-label">Workspace</div>
            {navItems.map((item) => (
              <button key={item.id} className={`nav-item ${activeNav === item.id ? "active" : ""}`} onClick={() => setActiveNav(item.id)}>
                <item.icon />
                <span>{item.label}</span>
                <span className="pill">{item.badge}</span>
              </button>
            ))}
          </div>

          <div className="sidebar-card">
            <h4>Connection</h4>
            <p><span className="dot" />{status.error ? "Backend error" : status.data ? "Backend connected" : "Checking backend"}</p>
            <p className="small tight" style={{ marginTop: 8 }}>{api.base}</p>
          </div>

          <div className="sidebar-card">
            <h4>Current reviewer</h4>
            <p>{reviewer || "Not set"}</p>
          </div>
        </aside>

        <main className="main">
          <div className="topbar">
            <div>
              <h2>{current.label}</h2>
              <p>{current.desc}</p>
            </div>
            <div className="topbar-right">
              {selectedCaseId ? <Badge tone="blue">Case {selectedCaseId.slice(0, 8)}</Badge> : null}
              <Badge tone={status.error ? "rose" : "green"}>{status.error ? "Disconnected" : "Connected"}</Badge>
            </div>
          </div>

          <div className="page">
            {activeNav === "workbench" ? (
              <CaseWorkbench
                api={api}
                reviewer={reviewer}
                selectedCaseId={selectedCaseId}
                setSelectedCaseId={setSelectedCaseId}
                jumpToQueue={() => setActiveNav("queue")}
              />
            ) : null}

            {activeNav === "queue" ? <QueuePanel api={api} onOpenCase={openCase} /> : null}
            {activeNav === "utilities" ? <UtilitiesPanel api={api} /> : null}
            {activeNav === "metrics" ? <MetricsPanel api={api} /> : null}
            {activeNav === "settings" ? (
              <SettingsPanel
                apiBase={apiBase}
                setApiBase={setApiBase}
                apiToken={apiToken}
                setApiToken={setApiToken}
                reviewer={reviewer}
                setReviewer={setReviewer}
                status={status}
                refreshStatus={refreshStatus}
              />
            ) : null}
          </div>
        </main>
      </div>
    </>
  );
}
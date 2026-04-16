# Nirikshan AI
### CDSCO-IndiaAI Health Innovation Acceleration Hackathon
**AI-Driven Regulatory Workflow Automation & Data Anonymisation — Stage 1**

![Stack](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square)
![Stack](https://img.shields.io/badge/Frontend-React_18-61dafb?style=flat-square)
![Stack](https://img.shields.io/badge/LLM-OpenAI_GPT--4o--mini-412991?style=flat-square)
![Stack](https://img.shields.io/badge/DB-SQLite-003B57?style=flat-square)
![Compliance](https://img.shields.io/badge/Compliance-DPDP_2023_%C2%B7_NDHM_%C2%B7_ICMR_%C2%B7_CDSCO-0f766e?style=flat-square)
![Version](https://img.shields.io/badge/version-4.0.0-1d4ed8?style=flat-square)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Core Features](#2-core-features)
3. [Architecture](#3-architecture)
4. [Setup & Installation](#4-setup--installation)
5. [Environment Variables](#5-environment-variables)
6. [API Reference](#6-api-reference)
7. [Evaluation Metrics](#7-evaluation-metrics)
8. [Anonymisation Detail](#8-anonymisation-detail)
9. [Document Pipeline](#9-document-pipeline)
10. [Compliance & Data Governance](#10-compliance--data-governance)
11. [Limitations & Roadmap](#11-limitations--roadmap)
12. [Project Structure](#12-project-structure)

---

## 1. Overview

Nirikshan AI is a full-stack regulatory workflow automation platform built for the CDSCO-IndiaAI Health Innovation Acceleration Hackathon. It digitises and accelerates the CDSCO document review cycle using a **hybrid rule-based + LLM pipeline**, addressing all five Stage 1 problem statement features.

The system handles the complete lifecycle of a regulatory submission:

```
upload → anonymisation → AI summarisation → completeness audit
       → version comparison → SAE classification → duplicate detection
       → inspection report generation → reviewer queue → audit logging
```

Without `OPENAI_API_KEY` set, all features degrade gracefully to keyword-based heuristics — the system remains fully functional with reduced quality.

---

## 2. Core Features

### i. Data Anonymisation
- **Hybrid detection:** regex rule-based layer (Aadhaar, PAN, ABHA ID, MRN, phone, email, dates, PIN codes) + NLP/LLM layer (names, addresses, diagnoses, medications, hospital names)
- **Two-step process:**
  - *Pseudonymisation* — reversible token replacement, persistent `token_vault` table ensures same PII always maps to the same token across sessions
  - *Irreversible anonymisation* — one-way hashed tags (e.g. `[EMAIL_3a9f2b1c]`) with generalisation (ages → decade ranges `30–39`, dates → years, PIN codes → `110XXX`)
- **Structured data support:** CSV/XLSX column-level anonymisation with auto-detected PII columns
- **Privacy metrics:** k-anonymity, l-diversity, t-closeness computed on anonymised output
- **Compliance:** DPDP Act 2023, NDHM, ICMR, CDSCO

### ii. Document Summarisation
- Auto-detects document type: `REGULATORY_APPLICATION`, `SAE_REPORT`, `MEETING_TRANSCRIPT`, `INSPECTION_REPORT`, `CLINICAL_REPORT`
- Applies type-specific structured prompts (e.g. SAE format includes Case ID, Patient Details, Suspect Product, Severity, Causality, Action Taken)
- Handles audio files via speech-to-text transcription before summarisation
- **Evaluation:** ROUGE-1, ROUGE-2, ROUGE-L, BERTScore computed dynamically against CNN/DailyMail + XSum-style gold reference summaries (see [Section 7](#7-evaluation-metrics))

### iii. Completeness Assessment & Document Comparison
- **Completeness:** validates against CDSCO CT Checklist (17 items) or SAE Checklist (17 items) with cross-field consistency checks
- **Comparison:** unified diff, text similarity %, structured field delta (added/changed/removed), LLM-generated change analysis with semantic colour-coding by category (Substantive / Administrative / Added / Removed / Data / Inconsistency)

### iv. Classification Tool
- SAE severity classification: `DEATH` / `LIFE_THREATENING` / `HOSPITALISATION` / `DISABILITY` / `OTHER`
- Weighted duplicate detection combining structured field matching + narrative similarity (SequenceMatcher)
- Batch classification with priority queue and severity distribution
- Reviewer severity override with full audit trail

### v. Inspection Report Generation
- Converts unstructured or handwritten inspection observations into CDSCO-compliant formal reports
- Output sections: Inspection Details, Scope, Areas Inspected, Observations, Overall Assessment, Recommendation
- Missing fields marked `[TO BE COMPLETED]`

---

## 3. Architecture

### Backend (`backend.py`)
Single-file FastAPI application.

| Component | Library |
|---|---|
| REST API | FastAPI + Uvicorn |
| Database | SQLite via `sqlite3` (auto-init on startup) |
| LLM | LangChain + OpenAI (`ChatOpenAI`) |
| PDF extraction | PyMuPDF (`fitz`) + Tesseract OCR fallback |
| DOCX parsing | `python-docx` |
| XLSX parsing | `openpyxl` |
| Language detection | `langdetect` + `googletrans` |
| NLP evaluation | `rouge-score` + `bert-score` |
| Latency tracking | `@track_latency` decorator on all core functions |

### Frontend (`src/App.jsx`)
Single-file React 18 application (Vite). No external UI library — inline CSS-in-JS.

| Panel | Purpose |
|---|---|
| Case Workbench | Create cases, upload files, run pipeline, review all outputs |
| Reviewer Queue | Priority-sorted triage queue (CRITICAL → HIGH → MEDIUM → LOW) |
| Utilities | Standalone tools for all 5 features |
| Metrics | Latency timings + live summarisation benchmark |
| Settings | API base URL, token, reviewer name |

### Database Schema (SQLite)

| Table | Purpose |
|---|---|
| `cases` | Top-level records: status, priority, type, tags, structured_data, duplicate_of_case_id |
| `documents` | Files: extracted_text, language, document_type, structured_fields |
| `analysis_results` | Pipeline outputs: SUMMARY, COMPLETENESS, SEVERITY, DUPLICATE_CHECK, ALERTS, RECOMMENDATIONS, INSPECTION_REPORT, STRUCTURED_FIELDS |
| `review_actions` | Manual decisions: APPROVED, REJECTED, ESCALATED, SEVERITY_OVERRIDE, DUPLICATE_DECISION |
| `audit_logs` | Immutable system event log for all case, document, and pipeline actions |
| `token_vault` | Persistent pseudonymisation map — same PII value always yields the same token |

---

## 4. Setup & Installation

### Backend

**Prerequisites:** Python 3.10+, Tesseract OCR, Poppler (required for `pdf2image`)

```bash
# 1. Create and activate a virtual environment
python -m venv venv && source venv/bin/activate

# 2. Install dependencies
pip install fastapi uvicorn python-multipart pymupdf pytesseract pdf2image
pip install python-docx langchain langchain-openai langchain-text-splitters
pip install langdetect rouge-score bert-score openpyxl pydantic python-dotenv

# 3. Create a .env file (see Section 5)
cp .env.example .env

# 4. Start the server
uvicorn backend:app --reload --port 8000
```

The SQLite database and upload directories are created automatically on first start.

### Frontend

```bash
npm create vite@latest nirikshan-ai -- --template react
cd nirikshan-ai

# Replace src/App.jsx with the provided App.jsx
# Add to .env:
echo "VITE_API_BASE=http://localhost:8000" >> .env

npm install && npm run dev
```

---

## 5. Environment Variables

| Variable | Default | Description |
|---|---|---|
| `OPENAI_API_KEY` | *(none)* | Required for LLM features. Without it, system falls back to keyword heuristics. |
| `OPENAI_MODEL` | `gpt-4o-mini` | OpenAI model string. Swap for `gpt-4o` or any compatible model. |
| `API_TOKEN` | *(empty)* | Optional `X-API-Token` header auth. Leave empty to disable authentication. |
| `CDSCO_DATA_DIR` | `./cdsco_data` | Root directory for SQLite database and uploaded file storage. |
| `CDSCO_DB_PATH` | `cdsco_data/cdsco.db` | Explicit SQLite file path override. |
| `MAX_FILE_SIZE_MB` | `25` | Maximum upload size per file in megabytes. |
| `PORT` | `8000` | Uvicorn port when running as `__main__`. |

**Supported file formats:** `.txt` `.docx` `.pdf` `.jpg` `.jpeg` `.png` `.csv` `.xlsx` `.mp3` `.wav` `.m4a`

---

## 6. API Reference

All endpoints accept `X-API-Token` header when `API_TOKEN` is configured.
Base URL: `http://localhost:8000`

### Case Workflow

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/status` | Health check — app name, version, LLM enabled, UTC timestamp |
| `POST` | `/api/cases` | Create case (`title`, `case_type`, `created_by`, `tags`, `notes`) |
| `GET` | `/api/cases` | List cases — optional `?status=` `?case_type=` `?priority=` filters |
| `GET` | `/api/cases/{case_id}` | Get a single case record |
| `PATCH` | `/api/cases/{case_id}` | Update case: title, status, priority, notes, tags |
| `DELETE` | `/api/cases/{case_id}` | Delete case + all documents, results, and uploaded files |
| `GET` | `/api/cases/{case_id}/overview` | Full overview: snapshot, documents, latest results, reviews |
| `POST` | `/api/cases/{case_id}/documents` | Upload a file to a case (`multipart/form-data`) |
| `GET` | `/api/cases/{case_id}/documents` | List documents for a case |
| `POST` | `/api/cases/{case_id}/run-pipeline` | Run full AI pipeline on all case documents (`?translate=true`) |
| `POST` | `/api/cases/{case_id}/documents/{doc_id}/run-pipeline` | Run pipeline on a single document |
| `GET` | `/api/cases/{case_id}/results` | List stored analysis results (`?document_id=` optional) |
| `GET` | `/api/queue/reviewer` | Priority-sorted reviewer queue |
| `POST` | `/api/cases/{case_id}/reviewer-feedback` | Submit action: `APPROVED` / `REJECTED` / `ESCALATED` |
| `POST` | `/api/cases/{case_id}/override-severity` | Reviewer override of SAE severity with reason |
| `POST` | `/api/cases/{case_id}/duplicate-decision` | Confirm or reject a duplicate finding |
| `GET` | `/api/cases/{case_id}/audit` | Full audit log and reviewer actions for a case |

### Standalone Utilities

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/anonymise` | Anonymise a file (`mode`: `both` \| `pseudonymise` \| `anonymise`) |
| `POST` | `/api/summarise` | Summarise with auto document type detection (`translate=true` optional) |
| `POST` | `/api/completeness` | Completeness check vs CDSCO CT or SAE checklist (`doc_type=auto`) |
| `POST` | `/api/compare` | Compare two versions: diff, similarity %, structured field delta |
| `POST` | `/api/classify` | Single SAE severity classification |
| `POST` | `/api/classify-batch` | Batch SAE classification with duplicates and priority queue |
| `POST` | `/api/inspection-report` | Generate formal inspection report from unstructured notes |

### Metrics & Evaluation

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/metrics/latency` | Per-function latency log: count, avg, min, max ms |
| `GET` | `/api/metrics/summarisation-benchmark` | Dynamic ROUGE-1/2/L + BERTScore vs gold references |
| `POST` | `/api/metrics/classification` | Confusion matrix + Macro-F1 + accuracy from `y_true`/`y_pred` |
| `POST` | `/api/metrics/summary-eval` | ROUGE + BERTScore for an arbitrary reference/hypothesis pair |

---

## 7. Evaluation Metrics

### Summarisation Benchmark *(Annexure I — Technical Robustness)*

`GET /api/metrics/summarisation-benchmark` evaluates the **live summarisation pipeline** dynamically against 5 curated regulatory domain samples, each with a hand-written gold reference summary modelled on CNN/DailyMail and XSum test sets.

Scores are **recomputed on every call** against these fixed gold references — they change if the LLM, prompts, or temperature change.

| Metric | Benchmark Alignment | What it measures |
|---|---|---|
| ROUGE-1 F1 | CNN/DailyMail standard | Unigram overlap vs gold reference summary |
| ROUGE-2 F1 | CNN/DailyMail standard | Bigram overlap — phrase-level fidelity |
| ROUGE-L F1 | XSum standard | Longest common subsequence — sentence fluency |
| BERTScore F1 | XSum equivalent (semantic) | Contextual embedding similarity vs gold |
| Compression ratio | Supporting metric | `len(summary) / len(source)` |

**Benchmark samples cover all CDSCO document types:**
- CNN/DailyMail style: pharma FDA approval, SAE pharmacovigilance signal, GMP inspection
- XSum style: Indian clinical trial (RESIST-INDIA), Drug Technical Advisory Board meeting

**Why this is genuinely dynamic:** the gold reference summaries are fixed human-written texts; the pipeline re-runs the LLM on each article at call time. The score reflects actual model performance, not a self-comparison.

### Classification *(Annexure I)*

`POST /api/metrics/classification` accepts `y_true` and `y_pred` JSON arrays and returns:
- Per-class: TP, FP, FN, TN, Precision, Recall, F1
- Macro-F1, Accuracy, full confusion matrix

Aligns with the **Macro-F1 and MCC** requirement in Annexure I Technical Robustness criteria.

### Anonymisation Privacy Metrics *(Annexure I)*

`POST /api/anonymise` on CSV/XLSX files returns **k-anonymity**, **l-diversity**, and **t-closeness** computed against auto-detected quasi-identifier columns (age, gender, location) and sensitive attribute columns (diagnosis, disease, drug).

### Latency

Every core function is wrapped with `@track_latency`. `GET /api/metrics/latency` returns per-function operation count, avg, min, max in milliseconds since last server restart.

---

## 8. Anonymisation Detail

### PII / PHI Detection

| Layer | Detected entities |
|---|---|
| Rule-based (regex) | Aadhaar, PAN, Indian mobile (+91), email, date of birth, general dates, PIN codes, MRN/UHID, ABHA ID, age expressions |
| NLP (LLM) | Person names, doctor/patient names, addresses, hospital names, diagnoses, medications, lab IDs, gender — contextual detection not possible with regex alone |

### Two-Step Process

```
Original text: "Patient Ramesh Kumar, DOB 12/05/1978, UHID MRN-4521, admitted for pneumonia"

Step 1 — Pseudonymisation (reversible):
"Patient [PERSON_NAME_a3f9b2c1], DOB [PERSON_NAME_d7e2a1b3], UHID [MRN_c4f8d2e1], admitted for [DIAGNOSIS_b2e9a3f1]"

Step 2 — Irreversible anonymisation + generalisation:
"Patient [PERSON_NAME_3a9f2b1c4d], DOB 1978, UHID [MRN_c4f8d2e1], admitted for [DIAGNOSIS_b2e9a3f1]"
```

- **Token vault:** stored in `token_vault` table — same PII always maps to same token across sessions and documents
- **Generalisation rules:** ages → decade range (e.g. `45` → `40–49`), dates → year only, PIN codes → regional prefix (`110021` → `110XXX`)

---

## 9. Document Pipeline

`POST /api/cases/{case_id}/run-pipeline` processes every document through these stages in sequence:

| Step | Stage | Output stored |
|---|---|---|
| 1 | Text extraction | PyMuPDF native text; Tesseract OCR fallback; python-docx for DOCX; row preview for CSV/XLSX; speech_recognition for audio |
| 2 | Language detection | ISO code; optional auto-translate to English via googletrans |
| 3 | Document type detection | `REGULATORY_APPLICATION` / `SAE_REPORT` / `MEETING_TRANSCRIPT` / `INSPECTION_REPORT` / `CLINICAL_REPORT` / `UNKNOWN` |
| 4 | Structured field extraction | case_id, patient_id, product_name, protocol_number, report_date, patient_age, patient_gender, seriousness_indicators |
| 5 | Summarisation | Type-specific structured summary + ROUGE/BERTScore metrics |
| 6 | Completeness audit | 17-item checklist + cross-field consistency validation |
| 7 | Alert flagging | LLM scan for red flags, missing critical fields, safety concerns |
| 8 | Severity *(SAE only)* | `DEATH` / `LIFE_THREATENING` / `HOSPITALISATION` / `DISABILITY` / `OTHER` + causality + priority |
| 9 | Duplicate detection *(SAE only)* | Weighted similarity score vs all other SAE documents in the database |
| 10 | Priority inference | `CRITICAL` / `HIGH` / `MEDIUM` / `LOW` from severity + completeness gaps + alert content |
| 11 | Persistence | All outputs stored in `analysis_results`; retrievable via `GET /api/cases/{id}/results` |

---

## 10. Compliance & Data Governance

| Regulation / Guideline | How the system addresses it |
|---|---|
| **DPDP Act 2023** | Two-step anonymisation (pseudonymisation + irreversible). Token vault for consistent de-identification. No raw PII stored after processing. |
| **NDHM Health Data Mgmt Policy** | ABHA ID detection in regex patterns. Generalisation of health identifiers. Structured audit log for full data lineage. |
| **ICMR Ethical Guidelines** | Patient identifiers (MRN, UHID, age, gender) flagged and anonymised. k-anonymity metric computed for structured data. |
| **CDSCO Standards** | CT Checklist (17 items) and SAE Checklist (17 items) built into completeness engine. SAE severity per CDSCO pharmacovigilance guidelines. Inspection report format follows CDSCO template structure. |

---

## 11. Limitations & Roadmap

### Current Limitations

- **LLM dependency:** without `OPENAI_API_KEY`, all NLP features fall back to keyword heuristics with significantly lower quality
- **Benchmark sample size:** 5 curated samples; a larger holdout set from full CNN/DailyMail or XSum test splits would give more reliable macro scores
- **Audio transcription:** quality depends on audio clarity; not evaluated against a CER benchmark
- **Duplicate detection:** operates within the current database only; cross-system deduplication requires SUGAM/MD Online integration

### Stage 2 Roadmap

- Integration with SUGAM and MD Online portals via secure API connectors
- Fine-tuning on CDSCO-provided anonymised datasets for improved domain accuracy
- Expanded benchmark evaluation on full CNN/DailyMail and XSum test splits
- Multi-language support for Hindi, Tamil, and other scheduled languages via IndicTrans
- CAPA tracking module linked to inspection report observations
- Role-based access control (RBAC) for CDSCO officer hierarchy

---

## 12. Project Structure

```
nirikshan-ai/
├── backend.py            # Single-file FastAPI backend (all 5 features, ~2500 lines)
├── src/
│   ├── App.jsx           # Single-file React frontend (~2500 lines)
│   ├── main.jsx          # React entry point
│   ├── App.css           # Component styles
│   └── index.css         # Global reset / body styles
├── .env                  # Environment variables (not committed to git)
├── .env.example          # Template for environment variables
├── vite.config.js        # Vite build configuration
├── package.json
├── cdsco_data/           # Auto-created on first server start
│   ├── cdsco.db          # SQLite database (6 tables)
│   └── uploads/          # Uploaded files (per case_id subdirectories)
└── static/               # Optional: built frontend served by FastAPI
```

---

*Nirikshan AI — built for the CDSCO-IndiaAI Health Innovation Acceleration Hackathon*

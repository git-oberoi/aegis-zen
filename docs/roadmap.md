# 🗺️ Aegis Zen Product Roadmap

This document outlines the planned evolutionary stages for Aegis Zen. Our roadmap transitions the platform from a client-side sandbox into a fully integrated, multi-modal productivity sanctuary.

---

## Current Release Capabilities (V1.0)
- **Aegis Flow Planner**: Generates calendar timelines containing alternating task slots and resting breaks.
- **Aegis Guardian (Smart Recovery)**: Reschedules overdue and running-late task blocks with single-click options (*move*, *delay*, *preserve*).
- **Cognitive Load Gauge**: Active dashboard calculating cumulative daily effort against a strict **15 cognitive unit budget**.
- **Chaos Brain Dump Parser**: Extracts structured lists from unformatted blocks of text.
- **Future Self Simulation**: Generates 3-month narratives outlining career and wellness stress scenarios.
- **Voice Accountability Coach**: Checks progress using Web Speech APIs and provides voice coaching feedback.
- **Box-Breathing Breathing Widget**: Guide for cortisol reduction.
- **Heuristic Engine**: Deterministic fallback systems for all routes.

---

## Phase 1: Polish & Integration (Short-Term: Q3 2026)

### 📅 External Calendar Integrations
- Import/Export bidirectional synchronization with **Google Calendar**, **Outlook**, and **Apple iCal**.
- Auto-detect calendar events and sync them as schedule blockers inside the Aegis timeline.

### 🔔 Smart Native Notifications
- Push notifications via Service Workers reminding the user of upcoming breaks.
- Cortisol-reduction warnings when real-time actions raise the burnout score.

### ⚙️ Customizable Configuration
- Custom category settings (e.g., tags, color themes).
- Configurable daily energy budget threshold sliders (allowing users to set daily limits higher or lower than the 15-unit baseline).

---

## Phase 2: Persistence & Multi-Device Analytics (Medium-Term: Q4 2026)

### 🗄️ Backend DB Engine (Prisma + SQLite/PostgreSQL)
- Optional user accounts (Google OAuth, Passkeys).
- Server-side workspace persistence replacing standard `localStorage` to allow sync between mobile devices and desktop.

### 📈 Deep Analytics Dashboard
- Aggregated weekly/monthly reports on cognitive load metrics.
- Multi-dimensional charts visualizing productivity trends alongside completed habits and stress streaks.

### 🌐 Browser Companion Extension
- Chrome and Firefox extension supporting quick brain-dump captures.
- Highlight text on any page and right-click to instantly convert it into a task in your Aegis inbox.

### 👥 Privacy-Focused Team Balancing
- "Aegis Workspace" sharing. Allows team leads to view their members' cumulative cognitive loads.
- Obfuscates task titles for privacy, only displaying warning levels (e.g., "John is at Critical (90%) load today") to prevent managers from overallocating sprint work.

---

## Phase 3: Hardware & Local Intelligence (Long-Term: H1 2027)

### 🧠 Fully Client-Side LLMs (WebLLM / Gemma 2B)
- Deploy quantized Google Gemma models running inside the client sandbox using WebGPU.
- Removes the requirement for external API keys and internet access, executing all conversational features and plans fully local.

### ⌚ Biometric Synchronization
- Integration with wearable health devices (Apple Watch, Garmin, Oura, Fitbit).
- Dynamically recalculates the user's daily cognitive energy budget. For instance, if sleep tracking indicates a poor night's rest or high baseline stress (HRV), the daily budget drops from 15 to 8 units.

### 👁️ Multi-Modal Presence & Focus
- Optional webcam-based fatigue indicators (blink rate, posture analysis).
- Automatically triggers a box-breathing session when visual fatigue or high physical strain is detected during work blocks.

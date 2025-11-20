# About the Product - AI Usage Guide

This document defines the product vision, audience, purpose, and evolving direction of the application.  
It provides **contextual memory** for the AI to ensure all code and features align with the product's goals and identity.

---

## 🚦 AI Interaction Rules

1. **Always review this document before implementing, refactoring, or suggesting new features.**  
   Use this file to align development choices with the product's intent, tone, and audience.

2. **When updating or refining product details:**
   - Edit only the relevant sections (Purpose, Target Audience, etc.).  
   - Maintain the existing Markdown heading structure.  
   - Avoid removing historical context unless it's outdated or replaced with updated data.  
   - When a major change occurs (like a new direction or rebrand), summarize it in the "Product Evolution Log."

3. **When adding new information:**
   - Place it under the correct section heading.  
   - Use clear, concise, human-readable language.  
   - Maintain professional tone and formatting consistency.

4. **Do not change section titles or structure.**
   - Keep this format intact so the AI can reliably read and update fields.

5. **Use dates for all updates.**
   - Include timestamps in "Product Evolution Log" whenever meaningful updates occur.

---

## 🧭 Product Information Schema

Use the following structure to describe the product.  
Each section contains reserved comment blocks (`<!-- -->`) that signal where to write or edit content.

---

## 🛠 Product Name
<!--
    Insert the official name of the product here.
-->
DevOps Control Plane (Deploy & Observe)

---

## 🎯 Purpose / Mission
<!--
    Describe what the product is designed to accomplish and the core problem it solves.
-->
Provide DevOps and SRE teams with a unified hub to deploy, track, and roll back applications rapidly while maintaining real-time awareness of infrastructure health, reducing downtime and detection time.

---

## 👥 Target Audience
<!--
    Describe the intended users or market segments this product serves.
-->
DevOps, SRE, and Platform Engineering teams managing multi-environment applications (dev/staging/prod) and Kubernetes-based services.

---

## 💡 Core Value Proposition
<!--
    Summarize what makes the product valuable or unique compared to alternatives.
-->
- One-click rollbacks that cut recovery time to under 2 minutes.  
- Centralized deployment history with live environment status.  
- Unified infrastructure health, SLI/SLO tracking, and alert feed to cut MTTD by 50%.  
- Simple CI/CD webhook integration to keep records accurate without heavy setup.

---

## 🚀 MVP Objective
<!--
    Define the minimal feature set required for a viable launch.
    This should correspond to the MVP features in implementation-plan.md.
-->
Deliver two primary modules:  
1) Deployment & Rollback Manager with deployment history, environment status, and one-click rollback.  
2) Infrastructure Health Dashboard with health grid, SLI/SLO tracking, and alert feed.  
Success targets: rollback time < 2 minutes; MTTD reduced by 50%.

---

## 🛣 Long-Term Vision
<!--
    Describe future expansion goals, potential features, integrations, or business directions.
-->
- Auto-remediation and runbooks tied to alerts.  
- Change risk scoring and policy-as-code for safer deploys.  
- Broader CI/CD and cloud provider integrations.  
- Anomaly detection on metrics/logs; deeper SLO management.  
- Role-based access, audit exports, and compliance reporting.

---

## 🎨 Design & Experience Principles
<!--
    Define key design guidelines and user experience philosophies.
    Examples: simplicity, clarity, accessibility, modern UI, responsive layout, etc.
-->
- Clarity with color-coded status and concise alerts.  
- Real-time feedback on deployments and health.  
- Safe defaults with confirmations for destructive actions (deploy/rollback).  
- Responsive layouts for dashboards; low cognitive load.  
- Auditability and traceability of actions.

---

## 🧰 Technical Overview
<!--
    List core technologies, frameworks, and platforms used (frontend, backend, database, hosting, etc.).
    Example: "Frontend: React + Vite | Backend: Flask | Database: Supabase | Deployment: Vercel MCP"
-->
Frontend: Next.js + TypeScript + Tailwind UI.  
Backend: Next.js API routes or Fastify (TypeScript).  
Data: PostgreSQL (deployments, environments, alerts, SLI/SLO targets), Redis/BullMQ for webhook/event processing.  
Real-time: WebSockets/SSE for status updates.  
Integrations: CI/CD webhooks (GitHub Actions/GitLab/ArgoCD), Kubernetes API, Prometheus/OpenTelemetry for metrics, OpenSearch/Elastic for logs.  
Hosting: Vercel (web/API) plus Render/Fly/Railway for workers; managed Postgres/Redis.

---

## 🧱 Product Structure Overview
<!--
    Optionally, summarize major app sections or components at a high level (e.g., Dashboard, Profile, Reports).
    This helps the AI understand the architecture contextually.
-->
- Deployment Dashboard: history, status, actions per environment.  
- One-Click Rollback: revert to last successful version with confirmation.  
- Environment Status: current version and health per env.  
- Infrastructure Health Grid: color-coded components and services.  
- SLI/SLO View: uptime/latency/error-rate vs targets.  
- Alert Feed: incidents, warnings, resolutions with links to detail.

---

## 📜 Product Evolution Log
> _Chronological updates describing how the product concept, goals, or positioning have changed over time._

<!--
    Example:
    - 2025-10-08 - Initial concept defined.
    - 2025-10-20 - Added analytics and trend visualization to MVP scope.
-->
- 2025-11-19 - Defined dual MVPs: Deployment & Rollback Manager and Infrastructure Health Dashboard; selected Next.js + Postgres + webhook/metrics/log stack.

---

## 🧾 File Integrity Notes
- Preserve Markdown headings and section order.  
- Keep whitespace between sections.  
- Avoid embedding raw code here - this file is conceptual, not technical.  
- AI should write clear, concise, descriptive English.  
- Always timestamp meaningful updates.

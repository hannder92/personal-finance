# Functional Spec — Sprint 1: Personal Finance App Improvements

**Feature:** `20260516-sprint1-mejoras-finanzas`  
**Status:** Draft  
**Author:** Johann Medina

---

## Overview

Five targeted improvements addressing reliability (silent data-loss on load failure), usability (financial term explanations, empty-state onboarding), and Colombian payroll completeness (mandatory solidarity fund, legal transport allowance). All five items were identified through user testing and financial-domain analysis of the existing app.

---

## User Stories

### US-1: Data Load Error Notification

**As a** returning user who has previously saved financial data,  
**I want** to be informed when my saved data cannot be loaded,  
**So that** I understand why my information appears missing and can decide how to proceed.

**Acceptance Criteria**

**AC-1.1:** Given the user has previously saved data that is now unreadable or invalid, when the user opens the app, then a visible error notification appears explaining that their saved data could not be loaded — the app does NOT start silently with empty defaults.

**AC-1.2:** Given the load-error notification is visible, when the user has not yet dismissed it, then the notification remains on screen (it is not automatically hidden after a timeout).

**AC-1.3:** Given a save operation fails (e.g. storage is full), when any data change triggers a save, then a visible notification appears with a retry option.

**AC-1.4:** Given a load or save error notification is visible, when the user dismisses it, then the app continues in a fully usable state.

---

### US-2: Financial Terms Glossary (Tooltips)

**As a** user unfamiliar with financial metrics,  
**I want** a brief explanation to appear when I interact with any metric label,  
**So that** I understand what each number means and whether my situation is healthy or risky.

**Acceptance Criteria**

**AC-2.1:** Given the DTI metric is displayed, when the user hovers or taps its label, then a tooltip appears that defines DTI as the share of net income used to pay debts, and states that ≤20% is healthy and >36% is high-risk.

**AC-2.2:** Given the housing ratio metric is displayed, when the user hovers or taps its label, then a tooltip appears explaining it as the share of income spent on housing, with ≤30% as the recommended ceiling.

**AC-2.3:** Given the emergency fund component is displayed in the health breakdown, when the user hovers or taps its label, then a tooltip appears explaining it as the number of months of essential expenses covered by liquid savings, with 3–6 months as the recommended range.

**AC-2.4:** Given the savings rate component is displayed, when the user hovers or taps its label, then a tooltip appears explaining it as the share of net income being directed toward financial goals.

**AC-2.5:** Given the overall health score is displayed, when the user hovers or taps the score label or its section title, then a tooltip appears explaining the 0–100 scale and naming the four components that determine it.

**AC-2.6:** Given any tooltip is triggered on a 375 px wide screen, when the tooltip renders, then it is fully visible within the viewport — no horizontal overflow or clipping.

**AC-2.7:** Given a metric label is reachable via keyboard navigation, when the label receives focus, then the tooltip appears with the same content as on hover or tap.

---

### US-3: Empty-State Guidance for New Users

**As a** new user who has just completed the initial setup,  
**I want** the dashboard to guide me toward entering my first data,  
**So that** my metrics reflect my real financial situation as quickly as possible.

**Acceptance Criteria**

**AC-3.1:** Given no income has been registered, when the user views the dashboard, then a prominent call-to-action is visible directing them to register their income first.

**AC-3.2:** Given income is registered but no fixed expenses have been added, when the user views the dashboard, then a call-to-action is visible directing them to add their fixed expenses.

**AC-3.3:** Given an empty-state call-to-action is visible, when the user adds the missing data and returns to the dashboard, then the call-to-action is no longer shown.

**AC-3.4:** Given some data sections are filled and others are empty, when the user views the dashboard, then metrics that can be calculated are shown normally alongside the prompt for the missing data.

---

### US-4: Solidarity Fund in Colombia Presets

**As a** Colombian employee whose salary exceeds the solidarity fund threshold,  
**I want** the Colombia presets to include the solidarity fund deduction automatically,  
**So that** my net income is accurate without requiring me to know and manually enter this legal deduction.

**Acceptance Criteria**

**AC-4.1:** Given the registered gross salary is strictly above $5,694,000 (4 × SMMLV 2025), when the user applies the Colombia presets, then a "Fondo de Solidaridad Pensional" deduction of 1% is included among the applied deductions.

**AC-4.2:** Given the registered gross salary is $5,694,000 or below, when the user applies the Colombia presets, then no solidarity fund deduction is added.

**AC-4.3:** Given the Colombia presets have already been applied and the solidarity fund is present, when the user applies the presets again, then the solidarity fund deduction is not duplicated.

**AC-4.4:** Given the solidarity fund deduction is present from a previous preset application, when the gross salary is later changed to $5,694,000 or below, then the solidarity fund entry is NOT automatically removed — the user must remove it manually.

---

### US-5: Transport Allowance Suggestion

**As a** Colombian employee whose salary is at or below 2 SMMLV,  
**I want** the app to prompt me to add the legal transport allowance,  
**So that** my net income includes this legal benefit without requiring me to know its current value.

**Acceptance Criteria**

**AC-5.1:** Given the gross salary is set to $2,847,000 or below and the transport allowance is not already in the non-salary benefits list, when the user views the income section, then a suggestion banner appears offering to add the legal transport allowance ($200,000 for 2025) as a non-salary benefit.

**AC-5.2:** Given the transport allowance suggestion banner is visible, when the user accepts it, then "Auxilio de transporte" with a value of $200,000 is added to non-salary benefits and the banner disappears.

**AC-5.3:** Given "Auxilio de transporte" is already present in non-salary benefits (added manually or via the suggestion), when the gross salary is at or below $2,847,000, then the suggestion banner does NOT appear again.

**AC-5.4:** Given the transport allowance suggestion banner is visible, when the user dismisses it, then the banner does not reappear for the remainder of the session.

**AC-5.5:** Given the transport allowance was added via the suggestion and is still present, when the gross salary is changed to above $2,847,000, then a one-time informational notice appears indicating that the transport allowance may no longer apply at the new salary level.

---

## Edge Cases

**EC-1:** Gross salary equals exactly $5,694,000 — solidarity fund is NOT added (threshold is strictly above, not at).

**EC-2:** Gross salary equals exactly $2,847,000 — transport allowance suggestion IS shown (threshold is inclusive ≤).

**EC-3:** Load error and save error occur in the same session — each generates its own notification independently; neither cancels the other.

**EC-4:** User dismisses the empty-state income CTA, navigates to another section, and returns to the dashboard — the CTA reappears (session dismissal applies only while the dashboard is continuously in view, not across navigations).

---

## Out of Scope

- Additional solidarity fund rates for salaries above 16 SMMLV (>$22.7M) — future payroll sprint.
- Automatic removal of the solidarity fund deduction when salary drops below threshold.
- Automatic removal of the transport allowance benefit when salary rises above threshold.
- Tooltip content in English (Spanish only for this sprint).
- Calculation of a prorated transport allowance for partial months.

---

## Success Metrics

1. Any load or save failure surfaces a visible notification — zero silent data-loss incidents after this sprint.
2. A new user can reach a meaningful dashboard (income entered, health score visible) within 2 minutes of completing onboarding.
3. Colombian employees with salary in the 4 × SMMLV range have the solidarity fund deduction available via presets without manual lookup.

---

## Open Questions

None — all requirements are sufficiently specified for implementation.

---

## Sign-off

- [x] Author: Johann Medina — 2026-05-16

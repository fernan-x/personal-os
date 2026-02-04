# Module: Budget

## 1. Purpose (Why this exists)

Remove budget anxiety and provide clear financial visibility. Each month follows a two-phase cycle: **plan** everything upfront so every euro has a purpose, then **track** variable spending in real time. At any moment you know how much to transfer to the joint account, how much goes to savings, and how each envelope is doing.

---

## 2. Jobs To Be Done

- When **a new month approaches**, I want to **plan all incomes and expenses** so that I know exactly how much to transfer and save
- When **I plan the month**, I want **recurring expenses pre-filled from last month** so that I only adjust what changed
- When **we have common expenses**, I want the system to **compute each user's share and joint account transfer** so that we split fairly without manual math
- When **we have a shared exceptional expense**, I want to **set a custom split** so that each person pays their fair share
- When **I buy groceries**, I want to **log it against the food envelope in seconds** so that I see the remaining balance
- When **a fixed expense gets debited**, I want to **mark it as paid** so that I know what's settled
- When **the month ends**, I want to **see a full breakdown and trends** so that I understand our spending patterns

---

## 3. Core Concepts (Domain)

### Entities

- **Budget Group** — a set of users sharing a budget (household, roommates, etc.). A user can belong to multiple groups.
- **Monthly Plan** — a snapshot for a given month: all incomes, planned expenses, and envelope allocations for a group. Created during the planning phase.
- **Income** — money coming in for a specific user in a given month (salary, freelance, etc.).
- **Planned Expense** — a line item in the monthly plan:
  - **Scope**: _personal_ (one user) or _common_ (joint account, split equally across group members).
  - **Recurrence**: _recurring_ (pre-filled each month, adjustable) or _exceptional_ (one-time).
  - **Shared exceptional**: an exceptional expense with a custom split ratio between users.
  - Has a status: _pending_ or _paid_ (for marking when it actually gets debited).
- **Expense Category** — predefined categories (food, transport, leisure, etc.). Some become trackable envelopes.
- **Envelope** — a predefined spending category with a planned monthly amount. Tracked daily during the expense phase.
- **Envelope Entry** — an actual expense logged against an envelope during the month: amount, date, optional note.

### Invariants

- A monthly plan must exist before tracking expenses for that month.
- Every envelope entry belongs to exactly one envelope.
- Envelope entries can exceed the allocation (no hard block), but the envelope shows as **overspent** with an alert.
- Common expenses are always split equally across group members (total / number of members).
- Shared exceptional expenses have a custom split that must sum to 100%.
- Currency is EUR everywhere — no conversion logic.
- Envelopes reset monthly (calendar month). No rollover.
- Recurring expenses carry their last values into the next month's plan as defaults.
- A planned expense's _paid_ status is independent of envelope tracking — fixed costs are marked paid, variable costs are tracked via envelopes.

### Computed Values (per user, per month)

- **Personal expenses total** = sum of personal planned expenses
- **Common share** = sum of all common expenses / number of group members
- **Shared exceptional share** = sum of (exceptional amount * user's split %)
- **Joint account transfer** = common share + shared exceptional share (for common items paid from joint account)
- **Total outflow** = personal expenses + joint account transfer
- **Savings** = income - total outflow

---

## 4. Inputs

### Planning phase (once per month)

1. **Incomes** per user — amount + source
2. **Personal recurring expenses** per user — pre-filled from last month, editable (some fixed, some variable)
3. **Common recurring expenses** — pre-filled from last month, editable. Paid from joint account.
4. **Exceptional expenses** per user — one-time items. Can be personal or shared with custom split.

### Expense phase (daily)

- **Envelope entry**: amount + envelope + optional note. Date defaults to today.
- **Mark as paid**: toggle on any planned expense when it gets debited.

### Frequency

- Planning: once per month (end of previous month)
- Envelope entries: multiple times daily
- Mark as paid: a few times per month

---

## 5. Outputs

### Planning summary (after planning phase)

Per-user breakdown:
- Income
- Personal recurring expenses (itemized)
- Common expenses share (itemized + total / N)
- Shared exceptional expenses (itemized with split)
- **Amount to transfer to joint account**
- **Amount to savings**

Group totals:
- Total income (all users)
- Total common expenses
- Total planned outflow

### Real-time envelope status (during expense phase)

- Progress bars showing spent / remaining per envelope
- Color coding: green (on track), amber (>75% used), red (overspent)

### Fixed expense checklist

- List of all planned expenses with paid/pending status
- Quick toggle to mark as paid

### Monthly overview dashboard

- Planned vs actual comparison per envelope
- Total income vs total expenses
- Per-category breakdown

### Trends over time

- Month-over-month spending comparison
- Per-envelope trend lines
- Savings rate over time

### Alerts

- Envelope crosses 75% and 100% of allocation

---

## 6. Automations

- **Pre-fill recurring expenses**: when creating a new monthly plan, carry over all recurring expenses (personal + common) from the previous month with their last values
- **Envelope allocation reset**: reset envelope spent counters at month boundary
- **Overspend alerts**: triggered when an envelope entry pushes past threshold

---

## 7. UI Flavor

**Motivating** — encourage good spending habits without guilt.

- Progress bars on envelopes: "You have 120 EUR left for food (8 days remaining)"
- Positive reinforcement: highlight envelopes that came in under budget at month end
- Planning phase feels like a structured form — step by step, not overwhelming
- Summary screen after planning is the payoff: clear numbers, clear action ("Transfer 850 EUR to joint account")
- Paid/pending checklist feels satisfying to check off
- Shared envelopes visually distinct from personal ones (icon or badge)
- Warm, confident colors. Green for under budget, soft amber for caution, muted red for overspent

---

## 8. Edge Cases & Failure Modes

- **No plan created yet**: prompt to start planning. No envelope tracking available until a plan exists.
- **User skips planning**: can create a minimal plan mid-month. Recurring items still pre-fill.
- **Recurring expense no longer needed**: remove it from this month's plan. It won't carry to next month.
- **New recurring expense**: add it to this month's plan and it carries forward automatically.
- **Envelope overspent**: the entry still logs. The bar goes past 100% with a visual alert. No blocking.
- **Group member leaves**: their personal expenses go with them. Past common expense history remains. Common split recalculates for remaining members going forward.
- **Mid-month plan adjustment**: recalculates all computed values (transfer amount, savings) immediately.
- **Income changes mid-month**: update the plan, savings recalculate.

---

## 9. Non-goals

- **Investment / asset tracking**: no stocks, crypto, or net worth
- **Automatic bank sync**: no Plaid or bank API connections
- **Receipt scanning / OCR**: not in scope
- **Multi-currency**: everything is EUR
- **Envelope transfers**: no moving budget between envelopes mid-month
- **Envelope rollover**: unspent amounts don't carry to next month
- **Debt management**: no loan tracking or repayment plans
- **Unequal common expense splits**: common expenses are always split equally (use shared exceptional for custom splits)

---

## 10. Mental Load Check

- **Removes decisions?** Yes — planning phase front-loads all decisions. During the month, you only log and check balances.
- **Reduces anxiety?** Yes — you know your transfer amount and savings before the month even starts. Envelopes give real-time confidence.
- **Stays useful on low-energy days?** Yes — fixed expenses just need a "paid" tap. Envelope logging is amount + category. Planning is guided and pre-filled.

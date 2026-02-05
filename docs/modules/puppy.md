# Module: Puppy Tracker

## 1. Purpose (Why this exists)

Remove the mental load of coordinating puppy care between two people. At any moment, both co-owners know what's been done today, what still needs doing, and how the puppy is progressing — without texting each other "did you feed him?"

---

## 2. Jobs To Be Done

- When **I wake up**, I want to **see today's care checklist** so that I know what the puppy needs without thinking
- When **I feed or walk the puppy**, I want to **log it in seconds** so that my co-owner sees it was done
- When **I'm not home**, I want to **check the activity log** so that I know the puppy is taken care of
- When **the puppy learns a new command**, I want to **record the milestone** so that we can track training progress over time
- When **a vet appointment is coming up**, I want to **get a reminder** so that I don't miss vaccinations or checkups
- When **I weigh the puppy**, I want to **log the weight** so that I can see the growth curve
- When **the puppy hasn't been walked in a while**, I want to **see that at a glance** so that someone takes action
- When **we get a second pet**, I want to **add them to the household** so that we track all pets in one place

---

## 3. Core Concepts (Domain)

### Entities

- **Household** — a group of up to 2 co-owners sharing one or more pets. Both users have equal full access.
- **Pet** — a dog/puppy belonging to a household. Has a name, breed, birth date, photo, and profile info.
- **Routine Template** — a repeating daily care schedule for a pet: defines what tasks are expected and when (e.g., "Morning meal at 8:00", "Evening walk at 18:00"). Configurable per pet.
- **Daily Checklist** — auto-generated each day from the routine template. Each item can be checked off by either co-owner.
- **Activity Log Entry** — a timestamped event logged against a pet: type (meal, walk, potty, sleep, grooming, medication, other), optional duration, optional note, logged-by user.
- **Weight Entry** — a weight measurement with date. Used for growth charts.
- **Vet Visit** — a scheduled or past vet appointment: date, reason, notes, next visit date.
- **Vaccination Record** — vaccine name, date administered, next due date.
- **Medication** — name, dosage, frequency, start/end dates.
- **Training Milestone** — a command or behavior goal with status (not started / in progress / learned), date achieved, optional notes.

### Invariants

- A household has exactly 2 co-owners with equal permissions.
- Every pet belongs to exactly one household.
- A daily checklist is generated fresh each day from the routine template — unchecked items don't roll over.
- Activity log entries are immutable once created (can be deleted, not edited).
- Weight entries must have a positive value and a date.
- Vaccination and medication reminders are tied to a specific pet.
- All timestamps include which user performed the action.

---

## 4. Inputs

### Setup (once per pet)

1. **Pet profile** — name, breed, birth date, photo
2. **Routine template** — define daily recurring tasks with optional time slots (morning meal, evening walk, etc.)

### Daily logging

- **Check off routine item** — tap to complete a checklist item. Auto-records who and when.
- **Log activity** — freeform entry: type + optional duration + optional note. Date defaults to now.
- **Log weight** — weight value + date.

### Periodic

- **Add vet visit** — date, reason, notes, optional next visit date.
- **Update vaccinations** — vaccine name, date, next due.
- **Add/update medication** — name, dosage, frequency, dates.
- **Record training milestone** — command/behavior, status change, notes.

### Frequency

- Checklist: multiple times daily (quick taps)
- Activity log: a few times daily
- Weight: weekly or biweekly
- Vet/vaccinations: every few months
- Training: as milestones happen

---

## 5. Outputs

### Today view (main screen)

- Daily checklist with completion status and who did what
- Recent activity log (chronological)
- "Last walked X hours ago" / "Last fed at HH:MM" quick status

### Pet dashboard

- Growth chart (weight over time)
- Age / developmental stage indicator
- Upcoming reminders (vet, vaccinations, medications)
- Training progress overview (X of Y commands learned)

### Activity history

- Filterable log by type, date range, and user
- "Who did what" breakdown (e.g., walks per person this week)

### Health record

- Vaccination timeline with upcoming due dates
- Medication schedule with active/completed status
- Vet visit history

### Training board

- List of commands/behaviors with status badges
- Progress bar (learned / total goals)
- Timeline of when each milestone was achieved

### Alerts & reminders

- Scheduled care reminders (meal time, walk time) based on routine template
- Vaccination due date reminders (1 week before, day of)
- Vet appointment reminders (1 day before)
- Medication reminders (at scheduled times)
- Inactivity nudge: "No walk logged today" in the evening

---

## 6. Automations

- **Daily checklist generation**: create today's checklist from the routine template at midnight (or first app open)
- **Care reminders**: push/notify at scheduled times from the routine template
- **Health reminders**: notify before vaccination due dates, vet appointments, and medication times
- **Inactivity nudge**: if a critical routine item (walk, meal) hasn't been checked off by a configurable time, send a reminder to both co-owners
- **Growth stage update**: automatically update developmental stage label based on birth date (puppy → adolescent → adult)

---

## 7. UI Flavor

**Practical daily use, playful milestones** — fast and functional for the 10x daily logging, warm and celebratory for progress moments.

- Today view is a clean checklist — big tap targets, instant feedback, who-did-it avatars
- Activity log is compact and scannable (icons per type, timestamps, user indicators)
- Milestone achievements get a small celebration animation (confetti, badge unlock)
- Growth chart is visual and satisfying — "your puppy gained 2kg this month!"
- Pet profile has a prominent photo — this is emotional, lean into it
- Empty states are encouraging: "No walks yet today — time for an adventure?"
- Color palette: warm and soft. Greens for completed, gentle amber for pending, muted indicators for overdue
- Each pet has its own tab/section when multiple pets exist

---

## 8. Edge Cases & Failure Modes

- **No routine template set**: prompt to set one up. Allow freeform logging without a checklist.
- **Both co-owners log the same thing**: show a duplicate warning if the same checklist item is tapped within 5 minutes by both users. Allow override.
- **Missed checklist items**: no guilt — items simply show as unchecked. No carry-over to next day.
- **Pet profile incomplete**: allow gradual filling. Only name is required to start.
- **Weight not logged in a while**: gentle nudge on the dashboard, not blocking.
- **Co-owner leaves household**: their past activity log entries remain. Household continues with one user.
- **Second pet added**: each pet has independent routines, checklists, health records, and training boards.
- **Puppy grows into adult dog**: the module works the same — "puppy tracker" is the name, but it's a lifelong pet tracker.

---

## 9. Non-goals

- **Automatic health diagnosis**: no symptom checker or medical advice
- **Food/nutrition planning**: no calorie tracking or diet optimization
- **Breed-specific guidance**: no tailored advice based on breed
- **Social features**: no sharing with friends, no public pet profiles
- **Pet marketplace**: no shopping, product recommendations, or vet directory
- **GPS / location tracking**: no live location of the pet or walker
- **Photo gallery / journal**: no dedicated photo storage (profile photo only, notes can describe moments)
- **More than 2 co-owners**: household is capped at 2 users

---

## 10. Mental Load Check

- **Removes decisions?** Yes — the daily checklist tells you exactly what needs doing. No need to remember feeding times or wonder if the other person walked the dog.
- **Reduces anxiety?** Yes — you can check the app and instantly see the puppy's day, even when you're away. Health records and reminders mean nothing slips through the cracks.
- **Stays useful on low-energy days?** Yes — worst case, you just tap checkboxes. No typing required for routine care. Freeform logging is optional.

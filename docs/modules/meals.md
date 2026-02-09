# Module: Meal Planner

## 1. Purpose (Why this exists)

Remove the mental load of deciding "what do we eat?" every day. Build a personal recipe book, plan meals for the week in minutes, and generate a ready-to-use grocery list — so grocery shopping, cooking, and meal prep become a streamlined routine instead of a daily decision.

---

## 2. Jobs To Be Done

- When **I find a good recipe** (online, on Instagram, from a friend), I want to **save it with all details** so that I never lose it and can cook it again easily
- When **I plan the week**, I want to **browse my recipes and assign them to days/meals** so that I know exactly what to cook every day
- When **I'm short on time**, I want to **auto-generate a meal plan** so that I get a balanced week without thinking
- When **my plan is ready**, I want to **generate a grocery list** so that I buy exactly what I need — nothing more, nothing less
- When **I'm at the store**, I want to **check off items** so that I don't miss anything
- When **I cook for more or fewer people**, I want to **adjust servings** so that quantities scale automatically
- When **I want inspiration**, I want to **browse public recipes from other users** so that I discover new ideas
- When **I have a recipe I'm proud of**, I want to **share it publicly** so that others can use it too
- When **I find a great public recipe**, I want to **favorite it** so that I can quickly find it again later

---

## 3. Core Concepts (Domain)

### Entities

- **Recipe** — a saved recipe belonging to a user (the author). Contains title, description, photo, source link (Instagram/blog), difficulty, prep/cook time, servings, macros (calories, protein, carbs, fat per serving), and visibility (public/private).
- **Recipe Ingredient** — a single ingredient line: name, quantity, unit (g, kg, ml, l, piece, tbsp, tsp, cup, pinch). Ordered within a recipe.
- **Recipe Instruction** — a single step in the cooking process. Numbered and ordered.
- **Recipe Tag** — a shared label for categorizing recipes (e.g., "Rapide", "Végétarien", "Batch cooking"). Tags are global (reused across users).
- **Recipe Favorite** — a user's bookmark on any recipe (own or public). One favorite per user per recipe.
- **Meal Plan** — a user's plan for a date range (typically a week). Has a name and start/end dates.
- **Meal Plan Entry** — a single meal assignment: a recipe placed on a specific date and slot (breakfast, lunch, dinner, snack) within a meal plan. Includes a servings count for scaling. Slots are configurable — users pick which slots to use.
- **Grocery List** — computed (not stored) from a meal plan. Aggregates all ingredients across planned meals, merging same-ingredient-same-unit items and scaling by servings.

### Invariants

- Every recipe belongs to exactly one user (the author).
- Public recipes are visible to all authenticated users. Private recipes are only visible to their author.
- Only the author can edit or delete a recipe.
- Any user can add a public recipe (or their own) to their meal plan.
- Any user can favorite any public recipe or their own private recipes.
- A meal plan entry assigns one recipe per date+slot combination.
- Macros are stored per serving. Scaling is computed, never stored.
- Ingredient quantities must be positive. Ingredient names are required.
- Instructions are ordered by step number, starting at 1.
- The grocery list is always computed on-the-fly from the current state of the meal plan — never cached or stored.
- Tags are unique by name. A recipe can have up to 10 tags.

### Computed Values

- **Total time** = prep time + cook time
- **Scaled macros** = base macros × (target servings / recipe servings)
- **Grocery list** = for each plan entry: scale ingredients by (entry servings / recipe servings), then merge by ingredient name + unit, summing quantities

---

## 4. Inputs

### Setup (once per recipe)

1. **Recipe details** — title, description, photo, source URL, visibility, difficulty
2. **Timing** — prep time (minutes), cook time (minutes)
3. **Servings** — base number of servings
4. **Macros** — calories, protein, carbs, fat (all per serving, all optional)
5. **Ingredients** — ordered list: name + quantity + unit
6. **Instructions** — ordered list of steps
7. **Tags** — select from existing or create new

### Weekly planning

- **Assign recipe to slot** — pick a recipe, place it on a day + meal slot
- **Adjust servings** — change serving count per meal entry
- **Auto-generate** — specify days, pick which slots (breakfast/lunch/dinner/snack), optional tag/time filters → system fills the plan

### At the store

- **Check off grocery items** — local UI state (not persisted)

### Frequency

- Recipe creation: occasional (when you find a good recipe)
- Meal planning: once per week
- Grocery list: once per week (generated from plan)
- Grocery checking: once per shopping trip

---

## 5. Outputs

### Recipe book

- Browsable, searchable grid of recipes with photo, title, difficulty, time, macros
- Filter by: difficulty, tags, prep time, favorites
- Tabs: all recipes (public + own), my recipes, favorites

### Recipe detail

- Full recipe view: hero photo, source link, macros summary, scaled ingredients, step-by-step instructions
- Servings adjuster that scales macros and ingredients in real time

### Weekly plan view

- Calendar grid: days as columns, meal slots (user-selected) as rows
- Each cell shows recipe thumbnail + title, or empty "+" to add
- Quick stats: total macros for the day/week

### Grocery list

- Alphabetically sorted ingredient list with total quantities and units
- "Used in: Recipe A, Recipe B" subtitle per item
- Checkboxes to mark items as bought
- Checked items move to bottom

### Dashboard widgets (future)

- "Repas du jour" — today's planned meals
- "Plan de la semaine" — compact weekly overview

---

## 6. Automations

- **Auto-generate meal plan**: randomly fill selected slots from eligible recipes (own + public), avoiding consecutive duplicates. User picks which slots to fill.
- **Grocery list computation**: aggregate and merge all ingredients from the plan, scaled by servings
- **Tag suggestions**: when creating a recipe, suggest existing tags via autocomplete
- **Servings scaling**: all macros and ingredient quantities scale automatically when servings change

---

## 7. UI Flavor

**Warm & appetizing** — this is a recipe book, it should feel inviting and practical.

- Recipe cards are visual — big photo, clean typography, subtle difficulty/time badges
- Recipe detail page is magazine-like — hero image, clean sections
- Meal plan calendar is minimal and scannable — glance at the week in seconds
- Grocery list is utilitarian — fast checkboxes, clear quantities
- Empty states are inviting: "Pas encore de recettes — ajoutez votre première !"
- Create/edit recipe is a full page (not a modal) — respect the amount of content
- Tags as colored badges for visual scanning
- Warm color palette: cream backgrounds, appetizing accent colors

---

## 8. Edge Cases & Failure Modes

- **No recipes yet**: empty state with prompt to create first recipe. Meal plan generation unavailable until recipes exist.
- **Not enough recipes for generation**: if fewer eligible recipes than needed slots, allow duplicates with a warning.
- **Recipe deleted while in a meal plan**: cascade delete removes the entry. Plan shows a gap that can be refilled.
- **Ingredient unit mismatch**: same ingredient with different units (e.g., "100g butter" + "2 tbsp butter") appears as separate grocery items. No unit conversion in v1.
- **Public recipe edited by author**: changes reflect everywhere, including other users' plans and favorites.
- **Public recipe made private**: remains in existing plans but disappears from other users' browse results. Favorites are kept.
- **No macros provided**: macros section shows "Non renseigné" — not blocking.
- **Very long ingredient list**: capped at 50 ingredients, 30 instructions.
- **Photo not provided**: show a default placeholder image.

---

## 9. Non-goals

- **Nutrition optimization**: no daily calorie targets or macro balancing across the week
- **Meal kit / delivery integration**: no ordering from services
- **AI recipe generation**: no LLM-generated recipes
- **Cooking timer / step-by-step mode**: no interactive cooking assistant
- **Unit conversion**: no automatic g↔tbsp conversion in v1
- **Social features**: no comments, ratings, or follower system on public recipes
- **Import from URL**: no automatic scraping of recipe websites
- **Multi-language recipes**: recipes are stored as entered (presumably French)
- **Cost estimation**: no ingredient pricing or meal cost calculation

---

## 10. Mental Load Check

- **Removes decisions?** Yes — "what do we eat?" is answered for the whole week in one planning session. Auto-generation means you don't even have to think about it.
- **Reduces anxiety?** Yes — the grocery list is exhaustive and computed. No forgotten ingredients, no guessing quantities.
- **Stays useful on low-energy days?** Yes — auto-generate a plan, generate the grocery list, go shop. Minimal effort for a full week of meals.

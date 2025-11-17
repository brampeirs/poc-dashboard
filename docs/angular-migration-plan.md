# Dashboard Angular Migration Plan

## Goals
- Provide a future-proof Angular implementation of the existing React-based dashboard widgets.
- Preserve current data visualizations (net worth over time, account distribution, bank distribution, cashflow, goals).
- Adopt Angular 18+ best practices: standalone components, functional providers, Angular signals for state, typed forms, and on-push style change detection by default.
- Keep styling lightweight with SCSS utilities that mirror the existing Tailwind aesthetic.
- Ensure charts leverage a maintained Angular-friendly charting library (ng2-charts + Chart.js) with accessibility and responsive behavior.

## Current State Summary
- React + Vite single page with Tailwind-based cards and Recharts for visualizations.
- Widgets include: net worth timeline with notes, cashflow summary, distribution pies, runway & savings KPIs, editable income and savings target forms, fixed cost table, and bank/account breakdowns.

## Migration Strategy
1. **Workspace Setup**
   - Generate a new Angular workspace (`dashboard-ng/`) using the standalone application option and SCSS styling.
   - Enable strict TypeScript options and include ESLint (via default Angular CLI config).
   - Add `ng2-charts` + `chart.js` for visualizations and configure global Chart.js defaults via `provideCharts`.

2. **Domain Modeling**
   - Translate existing TypeScript types (`FixedCost`, `MonthNote`, `Range`) into shared Angular interfaces (`src/app/models`).
   - Move static fixture data (net worth, notes, accounts, banks) into dedicated data files for reuse/testing.

3. **State Management with Signals**
   - Replace React `useState`/`useMemo` with Angular `signal`, `computed`, and `effect` primitives.
   - Keep derived metrics (filtered datasets, deltas, KPIs) inside `computed` signals to memoize automatically.
   - Use component-level signals for UI toggles (range selection, modal visibility, inline editing states).

4. **Componentization**
   - Create reusable standalone components: e.g., `cashflow-card`, `range-toggle`, `fixed-cost-table`, `goal-card`.
   - Define `input()` signal bindings for passing data into these components and emit events for user updates.
   - Compose components in `AppComponent` to mirror the React layout while keeping each widget isolated.

5. **Styling**
   - Recreate the card grid layout using CSS Grid and Flexbox within `app.component.scss` plus component-scoped styles.
   - Define SCSS variables/mixins for colors, spacing, typography to keep styling consistent.
   - Use utility classes (`.text-muted`, `.card`, `.chip`) to minimize duplication.

6. **Charts**
   - Implement the net worth area chart as a `line` chart with `fill` and responsive options.
   - Implement account/bank distribution as `doughnut` charts with legends and optional percentage toggles.
   - Bind chart datasets directly to computed signals so they update automatically when range or data changes.

7. **Forms & Interactivity**
   - Use Angular `FormControl`/`ReactiveFormsModule` or `NgModel` for editable fields (income, savings targets, emergency fund months).
   - Validate numeric inputs and clamp values before updating the associated signals.

8. **Testing & Verification**
   - Use `ng test` (Karma) for future unit specs and `ng e2e` if required.
   - For now ensure `ng build` succeeds and optionally add Cypress/Playwright if UI automation is needed later.

9. **Deployment Considerations**
   - Build output lives in `dashboard-ng/dist/dashboard-ng` and can be hosted via static hosting or integrated into a larger workspace.
   - Document commands in README for building both React (legacy) and Angular versions during transition.

## Incremental Migration Approach
- **Phase 1 (this change):** Create Angular app with core widgets (net worth chart, KPIs, distribution pies, cashflow card, fixed costs) backed by signals.
- **Phase 2:** Add advanced interactions (notes timeline, editing modals, FI target visualizations) and gradually sunset React version.
- **Phase 3:** Remove React code once parity is reached and update deployment pipeline to Angular-only.

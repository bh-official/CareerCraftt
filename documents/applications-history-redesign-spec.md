# Applications History Redesign Spec

## Scope Lock

This redesign applies **only** to the Applications History block currently rendered in [`src/app/dashboard/page.js`](src/app/dashboard/page.js:515).

No changes are required to:

- page shell/layout
- header
- applications table/cards section
- edit/delete modals

Only replace the current history section markup and related local helper UI for events.

## 1. Quick Diagnosis of Likely UX Issues

Based on current implementation in [`DashboardPage`](src/app/dashboard/page.js:67), a typical Applications History section tends to suffer from:

1. **Low scan efficiency**
   - Events are visually similar and rely on reading full text line-by-line.
   - Limited grouping by time or event type increases cognitive load.

2. **Weak visual hierarchy**
   - Event title, metadata, and timestamp are close in emphasis.
   - Important changes like status transitions can get buried.

3. **No interaction model beyond passive reading**
   - Users cannot quickly filter timeline by event type, application, or date range.
   - No explicit sort controls or density controls.

4. **Limited progress context**
   - Timeline is historical but not explicitly connected to stage progress across lifecycle.
   - Users cannot easily answer Where am I now and What changed recently.

5. **State handling can be more informative**
   - Loading state is generic spinner text only.
   - Empty state does not guide what action creates timeline data.
   - Error state lacks retry action.

6. **Accessibility opportunities**
   - Timeline can improve semantics with landmark/heading structure and list labeling.
   - Event rows should support richer screen reader context, focus styles, and keyboard shortcuts.

---

## 2. Redesign Concept

### Design goal

Create a **modern event timeline + progress overview** that remains fast, legible, and fully accessible.

### Core concept

- **Top bar**: section heading + quick stats + controls.
- **Filter rail**: search, event type, status, date range, clear-all.
- **Main timeline**: grouped by date, with polished event cards.
- **Side insight panel**: stage distribution and recent activity summary.

This keeps information dense but organized, while avoiding heavy charts or costly client-side rendering.

---

## 3. Information Architecture and Layout

### Desktop >=1024

- 12-column grid.
- Timeline takes 8 columns.
- Insight panel takes 4 columns and stays sticky.

### Tablet 768-1023

- Single-column stack.
- Insight panel collapses below timeline.

### Mobile <768

- Compact cards.
- Filters in horizontal scroll chips + expandable advanced filter drawer.

---

## 4. Visual Hierarchy and Styling Guidance

### Typography

- Section title: `text-xl font-semibold`
- Group date headers: `text-xs font-semibold uppercase tracking-wide`
- Event title: `text-sm font-medium`
- Metadata: `text-xs text-slate-600`
- Time: `text-xs text-slate-500`

### Spacing

- Section card padding: `p-4 sm:p-6`
- Event card spacing: `gap-3`, vertical `py-3`
- Date group gap: `space-y-4`

### Color usage

- Neutral base: slate grays for text and surfaces.
- Accent only for meaning:
  - created: blue
  - analyzed: indigo
  - status updated: amber
  - deleted: red
  - generic/system: emerald or slate

Ensure minimum contrast meets WCAG AA (4.5:1 for normal text, 3:1 for large text and non-text UI boundaries).

### Status indicators

- Use pill chips with icon + label + strong text contrast.
- Avoid color-only meaning; include text and icon.

---

## 5. Interaction Model

1. **Search**
   - Placeholder: `Search by role, company, event`
   - Debounced input 250-300ms.

2. **Filters**
   - Event type chip group.
   - Status select.
   - Date range select.
   - Clear filters button.

3. **Sorting**
   - `Newest first` and `Oldest first` toggle.
   - Preserve choice in query params for shareable URLs.

4. **Progress tracking**
   - Mini stage tracker showing counts in each phase.
   - Recent 7-day event count for momentum signal.

5. **Microinteractions**
   - Subtle hover elevation on event cards.
   - 150-200ms transition for chips and button states.
   - Loading skeleton shimmer instead of spinner-only state.

---

## 6. Accessibility and Usability Requirements

1. **Semantic structure**
   - Section uses heading hierarchy with [`h2`](src/app/dashboard/page.js:517) style role mapping.
   - Timeline is an ordered list with date subgroup headings.

2. **Keyboard navigation**
   - Every filter control reachable with `Tab`.
   - Event cards focusable only when interactive.
   - Visible focus ring using `focus-visible` consistent with [`globals.css`](src/app/globals.css:365).

3. **Screen reader labeling**
   - Timeline container label, e.g. `aria-label=Application history timeline`.
   - Event entries include combined summary with event label, object, and timestamp.

4. **Live updates**
   - Use polite live region for filter result counts.
   - Announce loading completion and empty-result state.

5. **Contrast and target size**
   - Interactive controls minimum 44x44px hit area on touch.
   - Status pills and chip text AA-compliant against background.

---

## 7. Implementation-Ready Component Breakdown

### Parent container

- `ApplicationsHistorySection`
  - props: `events`, `loading`, `error`, `onRetry`

### Child components

1. `HistoryHeader`
   - title, subtitle, total events, recent activity metric

2. `HistoryFilters`
   - search input
   - event type chips
   - status select
   - sort toggle
   - clear filters

3. `HistoryTimeline`
   - grouped list by date
   - each row renders icon, title, metadata, time, optional link

4. `HistoryInsightsPanel`
   - stage distribution
   - top active applications
   - quick hints

5. `HistoryStateBoundary`
   - loading skeleton
   - empty state
   - error state with retry

---

## 8. Suggested Copy Labels

- Section title: `Applications History`
- Subtitle: `Track recent changes, milestones, and status updates across your applications.`
- Search placeholder: `Search by role, company, event`
- Filter chip labels: `All`, `Created`, `Analyzed`, `Status Updated`, `Deleted`
- Sort labels: `Newest first`, `Oldest first`
- Empty title: `No history yet`
- Empty body: `Your timeline will appear after you create or update applications.`
- Empty CTA: `Create New Application`
- Error title: `Could not load history`
- Error CTA: `Try again`

---

## 9. Responsive Behavior

### Desktop

- Two-column with sticky insights panel.
- Dense event rows with metadata and quick links.

### Mobile

- Single-column event cards.
- Filters collapse into top row search + button opening filter sheet.
- Time displayed as relative first e.g. `2h ago`, with exact time in tooltip or secondary line.

---

## 10. Ready-to-Use React + Tailwind Example (History Section Only)

```jsx
import { useMemo, useState } from "react";
import {
  Search,
  RotateCcw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Trash2,
  Target,
  ShieldCheck,
} from "lucide-react";

const EVENT_TYPES = ["all", "created", "analyzed", "status_updated", "deleted"];

const EVENT_STYLES = {
  created: {
    icon: CheckCircle2,
    badge: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  analyzed: {
    icon: Target,
    badge: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  },
  status_updated: {
    icon: Clock3,
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  deleted: { icon: Trash2, badge: "bg-red-50 text-red-700 ring-red-200" },
  default: {
    icon: ShieldCheck,
    badge: "bg-slate-100 text-slate-700 ring-slate-200",
  },
};

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function groupByDay(items) {
  return items.reduce((acc, item) => {
    const key = new Date(item.occurred_at).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

export default function ApplicationsHistorySection({
  events = [],
  loading = false,
  error = "",
  onRetry,
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("desc");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = events.filter((e) => {
      const matchesType = type === "all" || e.event_type === type;
      const haystack =
        `${e.event_label || ""} ${e.metadata?.jobTitle || ""} ${e.metadata?.name || ""}`.toLowerCase();
      const matchesQuery = !q || haystack.includes(q);
      return matchesType && matchesQuery;
    });
    return result.sort((a, b) => {
      const tA = new Date(a.occurred_at).getTime();
      const tB = new Date(b.occurred_at).getTime();
      return sort === "desc" ? tB - tA : tA - tB;
    });
  }, [events, query, type, sort]);

  const grouped = useMemo(() => groupByDay(filtered), [filtered]);
  const groupedKeys = Object.keys(grouped);

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm"
      aria-labelledby="history-title"
    >
      <div className="mb-4 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2
            id="history-title"
            className="text-xl font-semibold text-slate-900"
          >
            Applications History
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Track recent changes, milestones, and status updates across your
            applications.
          </p>
        </div>
        <p className="text-sm text-slate-500" aria-live="polite">
          {filtered.length} events
        </p>
      </div>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-2">
        <label className="relative block">
          <span className="sr-only">Search history</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by role, company, event"
            className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          />
        </label>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          aria-label="Sort timeline"
        >
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </select>

        <button
          type="button"
          onClick={() => {
            setQuery("");
            setType("all");
            setSort("desc");
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Clear
        </button>
      </div>

      <div
        className="mb-4 flex flex-wrap gap-2"
        role="group"
        aria-label="Filter by event type"
      >
        {EVENT_TYPES.map((t) => {
          const active = type === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${active ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"}`}
              aria-pressed={active}
            >
              {t === "all" ? "All" : t.replace("_", " ")}
            </button>
          );
        })}
      </div>

      {loading && (
        <div
          className="py-10 flex items-center justify-center text-slate-500"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
          Loading history...
        </div>
      )}

      {!loading && error && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 p-4"
          role="alert"
        >
          <p className="flex items-center gap-2 text-sm font-medium text-red-700">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            Could not load history
          </p>
          <p className="mt-1 text-sm text-red-700/90">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
          <p className="text-sm font-medium text-slate-900">No history yet</p>
          <p className="mt-1 text-sm text-slate-600">
            Your timeline will appear after you create or update applications.
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <ol className="space-y-5" aria-label="Application history timeline">
          {groupedKeys.map((day) => (
            <li key={day}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {day}
              </h3>
              <ol className="space-y-2">
                {grouped[day].map((event) => {
                  const style =
                    EVENT_STYLES[event.event_type] || EVENT_STYLES.default;
                  const Icon = style.icon;
                  return (
                    <li
                      key={event.id}
                      className="rounded-xl border border-slate-200 p-3 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full ring-1 ${style.badge}`}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900">
                            {event.event_label}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-600">
                            {event.metadata?.jobTitle ||
                              event.metadata?.name ||
                              "Application activity"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatDateTime(event.occurred_at)}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
```

### Drop-in usage in current dashboard file

In [`src/app/dashboard/page.js`](src/app/dashboard/page.js:515), replace only the existing `Applications History` `<section>` block with:

```jsx
<ApplicationsHistorySection
  events={events}
  loading={loadingEvents}
  error={errorEvents}
  onRetry={loadEvents}
/>
```

Keep all other sections and logic unchanged.

---

## 11. Step-by-Step Upgrade Plan

### Phase 1. Foundation (History section only)

1. Extract current history UI from [`DashboardPage`](src/app/dashboard/page.js:515) into a new `ApplicationsHistorySection` component.
2. Keep existing API contract from [`/api/application-events`](src/app/api/application-events/route.js:1).
3. Add local filter and sort state only.

### Phase 2. Visual refresh (no page-wide redesign)

1. Add grouped timeline layout by day.
2. Introduce refined status/event chips and stronger typography hierarchy.
3. Replace loading spinner-only state with skeletons.

### Phase 3. Interaction and accessibility (timeline-local only)

1. Add search with debounce and clear button.
2. Add event type chips and sort toggle.
3. Add `aria-live` result count announcements and improved labels.
4. Validate keyboard flow and focus visibility.

### Phase 4. Optional mini insights strip inside history card

1. Add compact summary chips and event metrics inside the same history card.
2. Do not add page-level sidebars or sticky dashboard layout changes.

### Phase 5. Performance hardening

1. Memoize filtered and grouped event lists.
2. Virtualize timeline only if event volume grows substantially.
3. Keep icon set static and avoid heavy animation libraries for this section.

### Phase 6. QA and rollout

1. Run accessibility checks for contrast, keyboard, and screen reader behavior.
2. Validate empty, loading, and error states.
3. Capture before and after screenshots for design review and documentation.

---

## 12. Why This Redesign Works

- Improves **findability** with search and semantic grouping.
- Improves **clarity** with better hierarchy and event semantics.
- Improves **confidence** with explicit states and retry actions.
- Improves **inclusivity** through keyboard and screen reader support.
- Preserves **performance** using simple, memoized client-side transforms and lightweight visuals.

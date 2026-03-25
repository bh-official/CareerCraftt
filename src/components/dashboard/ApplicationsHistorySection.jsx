import Link from "next/link";
import { AlertCircle, Plus, RotateCcw, Search } from "lucide-react";
import { EVENT_BADGE_STYLES, EVENT_FILTER_OPTIONS } from "./constants";
import { formatDate, formatEventType } from "./utils";

export default function ApplicationsHistorySection({
  loadingEvents,
  errorEvents,
  filteredEvents,
  groupedEventKeys,
  groupedEvents,
  historySearch,
  setHistorySearch,
  historySort,
  setHistorySort,
  historyTypeFilter,
  setHistoryTypeFilter,
  onClearFilters,
  onRetry,
  mapEventTypeToIcon,
}) {
  return (
    <section
      className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm"
      aria-labelledby="applications-history-title"
    >
      <div className="mb-4 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2
            id="applications-history-title"
            className="text-lg font-semibold text-gray-900"
          >
            Applications History
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Track milestones and recent activity across your applications.
          </p>
        </div>
        <span className="text-sm text-gray-500" aria-live="polite">
          {filteredEvents.length} events
        </span>
      </div>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-2">
        <label className="relative block">
          <span className="sr-only">Search application history</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
            aria-hidden="true"
          />
          <input
            type="text"
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
            placeholder="Search by role, company, event"
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </label>

        <select
          value={historySort}
          onChange={(e) => setHistorySort(e.target.value)}
          aria-label="Sort history"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </select>

        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          Clear
        </button>
      </div>

      <div
        className="mb-4 flex flex-wrap gap-2"
        role="group"
        aria-label="Filter history by type"
      >
        {EVENT_FILTER_OPTIONS.map((option) => {
          const active = historyTypeFilter === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setHistoryTypeFilter(option.value)}
              aria-pressed={active}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {loadingEvents && (
        <div
          className="py-4"
          role="status"
          aria-live="polite"
          aria-label="Loading application history"
        >
          <div className="space-y-2 animate-pulse">
            <div className="h-14 rounded-lg bg-gray-100" />
            <div className="h-14 rounded-lg bg-gray-100" />
            <div className="h-14 rounded-lg bg-gray-100" />
          </div>
        </div>
      )}

      {!loadingEvents && errorEvents && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 p-4"
          role="alert"
        >
          <p className="flex items-center gap-2 text-sm font-medium text-red-700">
            <AlertCircle className="w-4 h-4" aria-hidden="true" />
            Could not load history
          </p>
          <p className="mt-1 text-sm text-red-700/90">{errorEvents}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          >
            Try again
          </button>
        </div>
      )}

      {!loadingEvents && !errorEvents && filteredEvents.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <p className="text-sm font-medium text-gray-900">No history yet</p>
          <p className="mt-1 text-sm text-gray-600">
            Your timeline will appear after you create or update applications.
          </p>
          <Link
            href="/analysis?new=1"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create New Application
          </Link>
        </div>
      )}

      {!loadingEvents && !errorEvents && filteredEvents.length > 0 && (
        <ol className="space-y-4" aria-label="Application history timeline">
          {groupedEventKeys.map((day) => (
            <li key={day}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {day}
              </h3>
              <ol className="space-y-2">
                {groupedEvents[day].map((event) => {
                  const EventIcon = mapEventTypeToIcon(event.event_type);
                  const badgeStyle =
                    EVENT_BADGE_STYLES[event.event_type] ||
                    EVENT_BADGE_STYLES.default;

                  return (
                    <li
                      key={event.id}
                      className="rounded-lg border border-gray-200 p-3 transition-shadow hover:shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full ring-1 ${badgeStyle}`}
                        >
                          <EventIcon className="h-4 w-4" aria-hidden="true" />
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-gray-900">
                              {event.event_label}
                            </p>
                            <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                              {formatEventType(event.event_type)}
                            </span>
                          </div>

                          <p className="mt-0.5 text-xs text-gray-600">
                            {event.metadata?.jobTitle ||
                              event.metadata?.name ||
                              "Application activity"}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {formatDate(event.occurred_at)}
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

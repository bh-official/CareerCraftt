"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FolderOpen,
  Loader2,
  AlertCircle,
  Search,
  RotateCcw,
  ArrowRight,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock3,
  Target,
  ShieldCheck,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";

const STATUS_OPTIONS = [
  "draft",
  "analyzed",
  "applied",
  "interviewing",
  "offer",
  "rejected",
  "archived",
];

const STATUS_STYLES = {
  draft: "bg-gray-100 text-gray-700",
  analyzed: "bg-blue-100 text-blue-700",
  applied: "bg-indigo-100 text-indigo-700",
  interviewing: "bg-amber-100 text-amber-700",
  offer: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  archived: "bg-slate-100 text-slate-700",
};

const EVENT_FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "created", label: "Created" },
  { value: "analyzed", label: "Analyzed" },
  { value: "status_updated", label: "Status Updated" },
  { value: "deleted", label: "Deleted" },
];

const EVENT_BADGE_STYLES = {
  created: "bg-blue-50 text-blue-700 ring-blue-200",
  analyzed: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  status_updated: "bg-amber-50 text-amber-700 ring-amber-200",
  deleted: "bg-red-50 text-red-700 ring-red-200",
  default: "bg-slate-100 text-slate-700 ring-slate-200",
};

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatStatus(value) {
  if (!value) return "Unknown";
  return value
    .split("_")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function mapEventTypeToIcon(eventType) {
  if (eventType === "created") return CheckCircle2;
  if (eventType === "analyzed") return Target;
  if (eventType === "deleted") return Trash2;
  if (eventType === "status_updated") return Clock3;
  return ShieldCheck;
}

function formatEventType(eventType) {
  if (!eventType) return "Activity";
  return eventType
    .split("_")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function groupEventsByDay(items) {
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

export default function DashboardPage() {
  const [applications, setApplications] = useState([]);
  const [events, setEvents] = useState([]);

  const [loadingApps, setLoadingApps] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [errorApps, setErrorApps] = useState("");
  const [errorEvents, setErrorEvents] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [historyTypeFilter, setHistoryTypeFilter] = useState("all");
  const [historySort, setHistorySort] = useState("desc");

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    companyName: "",
    jobTitle: "",
    status: "draft",
  });
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, app: null });

  const loadApplications = async () => {
    try {
      setLoadingApps(true);
      setErrorApps("");

      const query = new URLSearchParams({ limit: "200", offset: "0" });
      if (search.trim()) query.set("search", search.trim());
      if (statusFilter) query.set("status", statusFilter);

      const response = await fetch(`/api/applications?${query.toString()}`, {
        cache: "no-store",
        credentials: "include",
      });

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Failed to load applications");
      }

      setApplications(
        Array.isArray(data.applications) ? data.applications : [],
      );
    } catch (err) {
      setErrorApps(err.message || "Unable to load applications");
    } finally {
      setLoadingApps(false);
    }
  };

  const loadEvents = async () => {
    try {
      setLoadingEvents(true);
      setErrorEvents("");

      const response = await fetch(
        "/api/application-events?limit=100&offset=0",
        {
          cache: "no-store",
          credentials: "include",
        },
      );
      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Failed to load application history");
      }

      setEvents(Array.isArray(data.events) ? data.events : []);
    } catch (err) {
      setErrorEvents(err.message || "Unable to load application history");
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  useEffect(() => {
    loadEvents();
  }, []);

  const totalApplications = useMemo(() => applications.length, [applications]);

  const filteredEvents = useMemo(() => {
    const q = historySearch.trim().toLowerCase();
    const sorted = [...events]
      .filter((event) => {
        const typeMatch =
          historyTypeFilter === "all" || event.event_type === historyTypeFilter;
        const haystack =
          `${event.event_label || ""} ${event.metadata?.jobTitle || ""} ${event.metadata?.name || ""}`.toLowerCase();
        const searchMatch = !q || haystack.includes(q);
        return typeMatch && searchMatch;
      })
      .sort((a, b) => {
        const timeA = new Date(a.occurred_at).getTime();
        const timeB = new Date(b.occurred_at).getTime();
        return historySort === "desc" ? timeB - timeA : timeA - timeB;
      });

    return sorted;
  }, [events, historySearch, historyTypeFilter, historySort]);

  const groupedEvents = useMemo(
    () => groupEventsByDay(filteredEvents),
    [filteredEvents],
  );

  const groupedEventKeys = useMemo(
    () => Object.keys(groupedEvents),
    [groupedEvents],
  );

  const openEdit = (app) => {
    setEditingId(app.id);
    setEditError("");
    setEditForm({
      name: app.name || "",
      companyName: app.company_name || "",
      jobTitle: app.job_title || "",
      status: app.status || "draft",
    });
  };

  const closeEdit = () => {
    setEditingId(null);
    setEditError("");
  };

  const validateEdit = () => {
    if (!editForm.name.trim()) return "Application name is required";
    if (editForm.companyName.trim().length > 120)
      return "Company name is too long";
    if (editForm.jobTitle.trim().length > 120) return "Job title is too long";
    if (!STATUS_OPTIONS.includes(editForm.status)) return "Invalid status";
    return "";
  };

  const saveEdit = async () => {
    const validationError = validateEdit();
    if (validationError) {
      setEditError(validationError);
      return;
    }

    const previous = [...applications];
    const optimistic = applications.map((app) =>
      app.id === editingId
        ? {
            ...app,
            name: editForm.name.trim(),
            company_name: editForm.companyName.trim(),
            job_title: editForm.jobTitle.trim(),
            status: editForm.status,
            updated_at: new Date().toISOString(),
          }
        : app,
    );

    setApplications(optimistic);
    setSavingEdit(true);
    setEditError("");

    try {
      const response = await fetch("/api/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          name: editForm.name.trim(),
          companyName: editForm.companyName.trim(),
          jobTitle: editForm.jobTitle.trim(),
          status: editForm.status,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Failed to update application");
      }

      setApplications((prev) =>
        prev.map((app) =>
          app.id === editingId ? { ...app, ...data.application } : app,
        ),
      );
      closeEdit();
      loadEvents();
    } catch (err) {
      setApplications(previous);
      setEditError(err.message || "Failed to update application");
    } finally {
      setSavingEdit(false);
    }
  };

  const askDelete = (app) => {
    setDeleteModal({ open: true, app });
  };

  const cancelDelete = () => {
    setDeleteModal({ open: false, app: null });
  };

  const confirmDelete = async () => {
    if (!deleteModal.app) return;

    const id = deleteModal.app.id;
    const previous = [...applications];

    setDeletingId(id);
    setApplications((prev) => prev.filter((app) => app.id !== id));
    cancelDelete();

    try {
      const response = await fetch(`/api/applications?id=${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Failed to delete application");
      }
      loadEvents();
    } catch (err) {
      setApplications(previous);
      setErrorApps(err.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main id="main-content" className="pt-20 pb-10" tabIndex={-1}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <section className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                My Applications
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your full application lifecycle and track activity in one
                place.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/analysis?new=1"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Application
              </Link>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-lg font-semibold text-gray-900">
                Applications
              </h2>
              <span className="text-sm text-gray-500">
                {totalApplications} total
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or company"
                className="md:col-span-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </select>
            </div>

            {loadingApps && (
              <div className="py-14 flex items-center justify-center text-gray-500">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Loading applications...
              </div>
            )}

            {!loadingApps && errorApps && (
              <div className="py-8 rounded-lg border border-red-200 bg-red-50 text-red-700 flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errorApps}
              </div>
            )}

            {!loadingApps && !errorApps && applications.length === 0 && (
              <div className="py-14 text-center text-gray-600">
                <FolderOpen className="w-8 h-8 mx-auto mb-3 text-gray-400" />
                <p className="font-medium">No applications found</p>
                <p className="text-sm mt-1">
                  Create one from the analysis flow.
                </p>
              </div>
            )}

            {!loadingApps && !errorApps && applications.length > 0 && (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-gray-500">
                        <th className="py-3 pr-4 font-medium">Application</th>
                        <th className="py-3 pr-4 font-medium">Status</th>
                        <th className="py-3 pr-4 font-medium">Score</th>
                        <th className="py-3 pr-4 font-medium">Updated</th>
                        <th className="py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app.id} className="border-b border-gray-100">
                          <td className="py-3 pr-4">
                            <p className="font-medium text-gray-900">
                              {app.name || "Untitled"}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {(app.job_title || "-") +
                                " · " +
                                (app.company_name || "-")}
                            </p>
                          </td>
                          <td className="py-3 pr-4">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[app.status] || STATUS_STYLES.draft}`}
                            >
                              {formatStatus(app.status)}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-gray-700">
                            {app.overall_score == null
                              ? "-"
                              : `${app.overall_score}%`}
                          </td>
                          <td className="py-3 pr-4 text-gray-700">
                            {formatDate(app.updated_at)}
                          </td>
                          <td className="py-3 text-right">
                            <div className="inline-flex items-center gap-2">
                              <Link
                                href={`/sessions/${app.id}`}
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                              >
                                Open
                                <ArrowRight className="w-4 h-4" />
                              </Link>
                              <button
                                type="button"
                                onClick={() => openEdit(app)}
                                className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                              </button>
                              <button
                                type="button"
                                disabled={deletingId === app.id}
                                onClick={() => askDelete(app)}
                                className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-60"
                              >
                                {deletingId === app.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden space-y-3">
                  {applications.map((app) => (
                    <article
                      key={app.id}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {app.name || "Untitled"}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {(app.job_title || "-") +
                              " · " +
                              (app.company_name || "-")}
                          </p>
                        </div>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[app.status] || STATUS_STYLES.draft}`}
                        >
                          {formatStatus(app.status)}
                        </span>
                      </div>

                      <div className="mt-3 text-xs text-gray-600">
                        <p>
                          Score:{" "}
                          {app.overall_score == null
                            ? "-"
                            : `${app.overall_score}%`}
                        </p>
                        <p>Updated: {formatDate(app.updated_at)}</p>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link
                          href={`/sessions/${app.id}`}
                          className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs text-white"
                        >
                          Open
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEdit(app)}
                          className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-700"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === app.id}
                          onClick={() => askDelete(app)}
                          className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-700"
                        >
                          {deletingId === app.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>

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
                onClick={() => {
                  setHistorySearch("");
                  setHistoryTypeFilter("all");
                  setHistorySort("desc");
                }}
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
                  onClick={loadEvents}
                  className="mt-3 rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                >
                  Try again
                </button>
              </div>
            )}

            {!loadingEvents && !errorEvents && filteredEvents.length === 0 && (
              <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
                <p className="text-sm font-medium text-gray-900">
                  No history yet
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Your timeline will appear after you create or update
                  applications.
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
              <ol
                className="space-y-4"
                aria-label="Application history timeline"
              >
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
                                <EventIcon
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
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
        </div>
      </main>

      {editingId && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-end sm:items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Edit Application
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Update details and status.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label
                  className="text-sm font-medium text-gray-700"
                  htmlFor="edit-name"
                >
                  Application name
                </label>
                <input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((s) => ({ ...s, name: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  maxLength={140}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    className="text-sm font-medium text-gray-700"
                    htmlFor="edit-company"
                  >
                    Company
                  </label>
                  <input
                    id="edit-company"
                    value={editForm.companyName}
                    onChange={(e) =>
                      setEditForm((s) => ({
                        ...s,
                        companyName: e.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    maxLength={120}
                  />
                </div>

                <div>
                  <label
                    className="text-sm font-medium text-gray-700"
                    htmlFor="edit-job-title"
                  >
                    Role
                  </label>
                  <input
                    id="edit-job-title"
                    value={editForm.jobTitle}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, jobTitle: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    maxLength={120}
                  />
                </div>
              </div>

              <div>
                <label
                  className="text-sm font-medium text-gray-700"
                  htmlFor="edit-status"
                >
                  Status
                </label>
                <select
                  id="edit-status"
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm((s) => ({ ...s, status: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {formatStatus(status)}
                    </option>
                  ))}
                </select>
              </div>

              {editError && (
                <p className="text-sm text-red-600" role="alert">
                  {editError}
                </p>
              )}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeEdit}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                disabled={savingEdit}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                disabled={savingEdit}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {savingEdit ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal.open && deleteModal.app && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Delete Application?
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              This will permanently remove{" "}
              <strong>{deleteModal.app.name || "this application"}</strong> and
              related analysis artifacts.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={cancelDelete}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

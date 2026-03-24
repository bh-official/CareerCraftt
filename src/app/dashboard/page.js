"use client"; 

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FolderOpen,
  Loader2,
  AlertCircle,
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

export default function DashboardPage() {
  const [applications, setApplications] = useState([]);
  const [events, setEvents] = useState([]);

  const [loadingApps, setLoadingApps] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [errorApps, setErrorApps] = useState("");
  const [errorEvents, setErrorEvents] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

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
    
  }, [search, statusFilter]);

  useEffect(() => {
    loadEvents();
  }, []);

  const totalApplications = useMemo(() => applications.length, [applications]);

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

      <main id="main-content" className="pt-20 pb-10" tabIndex={-1} role="main">
        <a href="#main-content" className="sr-only focus:not-sr-only">
          Skip to main content
        </a>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <section
            className="flex items-center justify-between gap-4 flex-wrap"
            aria-labelledby="dashboard-title"
          >
            <div>
              <h1 id="dashboard-title" className="text-2xl font-bold text-gray-900">
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
                aria-label="Create a new application"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                New Application
              </Link>
            </div>
          </section>

          
          <section
            className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm"
            aria-labelledby="applications-title"
          >
            <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
              <h2 id="applications-title" className="text-lg font-semibold text-gray-900">
                Applications
              </h2>
              <span className="text-sm text-gray-500">
                {totalApplications} total
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <label htmlFor="search-applications" className="sr-only">
                Search applications
              </label>
              <input
                id="search-applications"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or company"
                className="md:col-span-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />

              <label htmlFor="filter-status" className="sr-only">
                Filter by status
              </label>
              <select
                id="filter-status"
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
              <div className="py-14 flex items-center justify-center text-gray-500" role="status" aria-live="polite">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Loading applications...
              </div>
            )}
            

            {!loadingApps && errorApps && (
              <div
                className="py-8 rounded-lg border border-red-200 bg-red-50 text-red-700 flex items-center justify-center gap-2"
                role="alert"
              >
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                {errorApps}
              </div>
            )}

            {!loadingApps && !errorApps && applications.length === 0 && (
              <div className="py-14 text-center text-gray-600">
                <FolderOpen className="w-8 h-8 mx-auto mb-3 text-gray-400" aria-hidden="true" />
                <p className="font-medium">No applications found</p>
                <p className="text-sm mt-1">
                  Create one from the analysis flow.
                </p>
              </div>
            )}

            {!loadingApps && !errorApps && applications.length > 0 && (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full text-sm" aria-label="Applications table">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-gray-500">
                        <th scope="col" className="py-3 pr-4 font-medium">Application</th>
                        <th scope="col" className="py-3 pr-4 font-medium">Status</th>
                        <th scope="col" className="py-3 pr-4 font-medium">Score</th>
                        <th scope="col" className="py-3 pr-4 font-medium">Updated</th>
                        <th scope="col" className="py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app.id} className="border-b border-gray-100">
                          <td className="py-3 pr-4">
                            <p className="font-medium text-gray-900">{app.name || "Untitled"}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {(app.job_title || "-") + " · " + (app.company_name || "-")}
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
                            {app.overall_score == null ? "-" : `${app.overall_score}%`}
                          </td>
                          <td className="py-3 pr-4 text-gray-700">{formatDate(app.updated_at)}</td>
                          <td className="py-3 text-right">
                            <div className="inline-flex items-center gap-2">
                              <Link
                                href={`/sessions/${app.id}`}
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                                aria-label={`Open ${app.name || "Untitled"} application`}
                              >
                                Open
                                <ArrowRight className="w-4 h-4" aria-hidden="true" />
                              </Link>
                              <button
                                type="button"
                                onClick={() => openEdit(app)}
                                className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                                aria-label={`Edit ${app.name || "Untitled"} application`}
                              >
                                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                Edit
                              </button>
                              <button
                                type="button"
                                disabled={deletingId === app.id}
                                onClick={() => askDelete(app)}
                                className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-60"
                                aria-label={`Delete ${app.name || "Untitled"} application`}
                              >
                                {deletingId === app.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
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
              </>
            )}
          </section>

          
          <section
            className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm"
            aria-labelledby="history-title"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id="history-title" className="text-lg font-semibold text-gray-900">
                Applications History
              </h2>
              <span className="text-sm text-gray-500">Newest first</span>
            </div>

            {loadingEvents && (
              <div className="py-10 flex items-center justify-center text-gray-500" role="status" aria-live="polite">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Loading history...
              </div>
            )}

            {!loadingEvents && errorEvents && (
              <div className="py-8 rounded-lg border border-red-200 bg-red-50 text-red-700 flex items-center justify-center gap-2" role="alert">
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                {errorEvents}
              </div>
            )}

            {!loadingEvents && !errorEvents && events.length === 0 && (
              <p className="text-sm text-gray-500">No timeline events yet.</p>
            )}

            {!loadingEvents && !errorEvents && events.length > 0 && (
              <ol className="space-y-3" aria-label="Application events timeline">
                {events.map((event) => {
                  const EventIcon = mapEventTypeToIcon(event.event_type);
                  return (
                    <li
                      key={event.id}
                      className="flex items-start gap-3 rounded-lg border border-gray-100 p-3"
                    >
                      <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <EventIcon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {event.event_label}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {event.metadata?.jobTitle || event.metadata?.name || "Application activity"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(event.occurred_at)}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>
      </main>

     
    </div>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Target,
  Trash2,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import ApplicationsSection from "@/components/dashboard/ApplicationsSection";
import ApplicationsHistorySection from "@/components/dashboard/ApplicationsHistorySection";
import DeleteConfirmationModal from "@/components/dashboard/DeleteConfirmationModal";
import EditApplicationModal from "@/components/dashboard/EditApplicationModal";
import { STATUS_OPTIONS } from "@/components/dashboard/constants";
import { groupEventsByDay } from "@/components/dashboard/utils";

// Map event type strings to icon components for history timeline rows.
function mapEventTypeToIcon(eventType) {
  if (eventType === "created") return CheckCircle2;
  if (eventType === "analyzed") return Target;
  if (eventType === "deleted") return Trash2;
  if (eventType === "status_updated") return Clock3;
  return ShieldCheck;
}

export default function DashboardPage() {
  // Core datasets for dashboard widgets.
  const [applications, setApplications] = useState([]);
  const [events, setEvents] = useState([]);

  // Loading + error state for independent requests.
  const [loadingApps, setLoadingApps] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [errorApps, setErrorApps] = useState("");
  const [errorEvents, setErrorEvents] = useState("");

  // Filter + search controls for applications and history views.
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [historyTypeFilter, setHistoryTypeFilter] = useState("all");
  const [historySort, setHistorySort] = useState("desc");

  // Edit modal state and form values.
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    companyName: "",
    jobTitle: "",
    status: "draft",
  });
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete confirmation state.
  const [deletingId, setDeletingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, app: null });

  const loadApplications = async () => {
    try {
      // Reset state for a fresh fetch.
      setLoadingApps(true);
      setErrorApps("");

      // Build query parameters based on current filters.
      const query = new URLSearchParams({ limit: "200", offset: "0" });
      if (search.trim()) query.set("search", search.trim());
      if (statusFilter) query.set("status", statusFilter);

      // Fetch the user's applications list.
      const response = await fetch(`/api/applications?${query.toString()}`, {
        cache: "no-store",
        credentials: "include",
      });

      // Redirect to login if session expired.
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
      // Fetch recent activity events for the history timeline.
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
    // Reload applications when search or status filters change.
    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  useEffect(() => {
    // Load history events once on mount.
    loadEvents();
  }, []);

  // Total count used for summary display.
  const totalApplications = useMemo(() => applications.length, [applications]);

  // Filter and sort events using the current history controls.
  const filteredEvents = useMemo(() => {
    const q = historySearch.trim().toLowerCase();
    return [...events]
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
  }, [events, historySearch, historyTypeFilter, historySort]);

  // Group events into date buckets for timeline rendering.
  const groupedEvents = useMemo(
    () => groupEventsByDay(filteredEvents),
    [filteredEvents],
  );
  // Cache the day keys to avoid recalculating on re-render.
  const groupedEventKeys = useMemo(
    () => Object.keys(groupedEvents),
    [groupedEvents],
  );

  // Open the edit modal and populate form fields.
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

  // Close the edit modal and clear errors.
  const closeEdit = () => {
    setEditingId(null);
    setEditError("");
  };

  // Validate edit form before submitting.
  const validateEdit = () => {
    if (!editForm.name.trim()) return "Application name is required";
    if (editForm.companyName.trim().length > 120)
      return "Company name is too long";
    if (editForm.jobTitle.trim().length > 120) return "Job title is too long";
    if (!STATUS_OPTIONS.includes(editForm.status)) return "Invalid status";
    return "";
  };

  // Persist application edits with optimistic UI updates.
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
      // Submit update to API.
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
      // Roll back on failure.
      setApplications(previous);
      setEditError(err.message || "Failed to update application");
    } finally {
      setSavingEdit(false);
    }
  };

  // Open confirmation modal for delete action.
  const askDelete = (app) => {
    setDeleteModal({ open: true, app });
  };

  // Dismiss delete confirmation modal.
  const cancelDelete = () => {
    setDeleteModal({ open: false, app: null });
  };

  // Delete application with optimistic removal.
  const confirmDelete = async () => {
    if (!deleteModal.app) return;

    const id = deleteModal.app.id;
    const previous = [...applications];

    // Remove immediately for snappy UI and restore on error.
    setDeletingId(id);
    setApplications((prev) => prev.filter((app) => app.id !== id));
    cancelDelete();

    try {
      // Issue delete request to API.
      const response = await fetch(`/api/applications?id=${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Failed to delete application");
      }
      loadEvents();
    } catch (err) {
      // Restore list and surface error.
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
                New Application
              </Link>
            </div>
          </section>

          <ApplicationsSection
            totalApplications={totalApplications}
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            loadingApps={loadingApps}
            errorApps={errorApps}
            applications={applications}
            deletingId={deletingId}
            onEdit={openEdit}
            onAskDelete={askDelete}
          />

          <ApplicationsHistorySection
            loadingEvents={loadingEvents}
            errorEvents={errorEvents}
            filteredEvents={filteredEvents}
            groupedEventKeys={groupedEventKeys}
            groupedEvents={groupedEvents}
            historySearch={historySearch}
            setHistorySearch={setHistorySearch}
            historySort={historySort}
            setHistorySort={setHistorySort}
            historyTypeFilter={historyTypeFilter}
            setHistoryTypeFilter={setHistoryTypeFilter}
            onClearFilters={() => {
              setHistorySearch("");
              setHistoryTypeFilter("all");
              setHistorySort("desc");
            }}
            onRetry={loadEvents}
            mapEventTypeToIcon={mapEventTypeToIcon}
          />
        </div>
      </main>

      <EditApplicationModal
        open={Boolean(editingId)}
        editForm={editForm}
        setEditForm={setEditForm}
        editError={editError}
        savingEdit={savingEdit}
        onClose={closeEdit}
        onSave={saveEdit}
      />

      <DeleteConfirmationModal
        open={deleteModal.open}
        app={deleteModal.app}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

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


export default function DashboardPage() {
  
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
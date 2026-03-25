import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  FolderOpen,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { STATUS_OPTIONS, STATUS_STYLES } from "./constants";
import { formatDate, formatStatus } from "./utils";

export default function ApplicationsSection({
  totalApplications,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  loadingApps,
  errorApps,
  applications,
  deletingId,
  onEdit,
  onAskDelete,
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-semibold text-gray-900">Applications</h2>
        <span className="text-sm text-gray-500">{totalApplications} total</span>
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
          <p className="text-sm mt-1">Create one from the analysis flow.</p>
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
                          onClick={() => onEdit(app)}
                          className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === app.id}
                          onClick={() => onAskDelete(app)}
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
                    {app.overall_score == null ? "-" : `${app.overall_score}%`}
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
                    onClick={() => onEdit(app)}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-700"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={deletingId === app.id}
                    onClick={() => onAskDelete(app)}
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
  );
}

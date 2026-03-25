import { Loader2 } from "lucide-react";
import { STATUS_OPTIONS } from "./constants";
import { formatStatus } from "./utils";

export default function EditApplicationModal({
  open,
  editForm,
  setEditForm,
  editError,
  savingEdit,
  onClose,
  onSave,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-end sm:items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">
          Edit Application
        </h3>
        <p className="text-sm text-gray-600 mt-1">Update details and status.</p>

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
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            disabled={savingEdit}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={savingEdit}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

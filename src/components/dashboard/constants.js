export const STATUS_OPTIONS = [
  "draft",
  "analyzed",
  "applied",
  "interviewing",
  "offer",
  "rejected",
  "archived",
];

export const STATUS_STYLES = {
  draft: "bg-gray-100 text-gray-700",
  analyzed: "bg-blue-100 text-blue-700",
  applied: "bg-indigo-100 text-indigo-700",
  interviewing: "bg-amber-100 text-amber-700",
  offer: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  archived: "bg-slate-100 text-slate-700",
};

export const EVENT_FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "created", label: "Created" },
  { value: "analyzed", label: "Analyzed" },
  { value: "status_updated", label: "Status Updated" },
  { value: "deleted", label: "Deleted" },
];

export const EVENT_BADGE_STYLES = {
  created: "bg-blue-50 text-blue-700 ring-blue-200",
  analyzed: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  status_updated: "bg-amber-50 text-amber-700 ring-amber-200",
  deleted: "bg-red-50 text-red-700 ring-red-200",
  default: "bg-slate-100 text-slate-700 ring-slate-200",
};

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FolderOpen,
  Loader2,
  AlertCircle,
  ArrowRight,
  Plus,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch("/api/sessions?limit=100&offset=0", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok || !data?.success) {
          throw new Error(data?.error || "Failed to load applications");
        }

        setSessions(data.sessions || []);
      } catch (err) {
        setError(err.message || "Unable to load applications");
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  const totalApplications = useMemo(() => sessions.length, [sessions]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main id="main-content" className="pt-20 pb-10" tabIndex={-1}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                View and manage all your job applications.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Application
            </Link>
          </div>

          <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Your Applications
              </h2>
              <span className="text-sm text-gray-500">
                {totalApplications} total
              </span>
            </div>

            {loading && (
              <div className="py-14 flex items-center justify-center text-gray-500">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Loading applications...
              </div>
            )}

            {!loading && error && (
              <div className="py-10 rounded-lg border border-red-200 bg-red-50 text-red-700 flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {!loading && !error && sessions.length === 0 && (
              <div className="py-14 text-center text-gray-600">
                <FolderOpen className="w-8 h-8 mx-auto mb-3 text-gray-400" />
                <p className="font-medium">No applications yet</p>
                <p className="text-sm mt-1">
                  Create your first application from the current landing page.
                </p>
              </div>
            )}

            {!loading && !error && sessions.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-500">
                      <th className="py-3 pr-4 font-medium">Application</th>
                      <th className="py-3 pr-4 font-medium">Role</th>
                      <th className="py-3 pr-4 font-medium">Score</th>
                      <th className="py-3 pr-4 font-medium">Updated</th>
                      <th className="py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-3 pr-4">
                          <p className="font-medium text-gray-900">
                            {item.name || "Untitled"}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {item.company_name || "-"}
                          </p>
                        </td>
                        <td className="py-3 pr-4 text-gray-700">
                          {item.job_title || "-"}
                        </td>
                        <td className="py-3 pr-4 text-gray-700">
                          {item.overall_score == null
                            ? "-"
                            : `${item.overall_score}%`}
                        </td>
                        <td className="py-3 pr-4 text-gray-700">
                          {formatDate(item.updated_at)}
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            href={`/sessions/${item.id}`}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Open
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

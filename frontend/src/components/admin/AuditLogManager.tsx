"use client";

import React, { useState, useMemo } from "react";
import { AuditLog } from "@/types";
import {
  Activity,
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  Clock,
  User,
  RefreshCw,
  FileText,
  Boxes,
  Package,
  Ticket,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

interface AuditLogManagerProps {
  auditLogs: AuditLog[];
  onRefresh: () => Promise<void>;
  onNotify: (msg: string, type?: "success" | "error") => void;
}

export default function AuditLogManager({
  auditLogs,
  onRefresh,
  onNotify,
}: AuditLogManagerProps) {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        log.action?.toLowerCase().includes(q) ||
        (log.entity_type || log.entity)?.toLowerCase().includes(q) ||
        log.user_email?.toLowerCase().includes(q) ||
        log.details?.toLowerCase().includes(q) ||
        log.ip_address?.toLowerCase().includes(q);

      const matchAction = actionFilter === "ALL" || log.action?.includes(actionFilter);
      return matchSearch && matchAction;
    });
  }, [auditLogs, search, actionFilter]);

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, page, pageSize]);

  const getActionBadge = (action: string) => {
    if (action.includes("CREATE")) {
      return "bg-emerald-100 text-emerald-900 border-emerald-300";
    }
    if (action.includes("UPDATE")) {
      return "bg-blue-100 text-blue-900 border-blue-300";
    }
    if (action.includes("DELETE")) {
      return "bg-red-100 text-red-900 border-red-300";
    }
    if (action.includes("STOCK")) {
      return "bg-purple-100 text-purple-900 border-purple-300";
    }
    return "bg-neutral-100 text-neutral-800 border-neutral-300";
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h2 className="text-xl font-medium tracking-tight text-neutral-900 font-serif">
            Journal d'Activité & Traçabilité
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Piste d'audit de sécurité des actions administratives (stocks, commandes, promotions, catalogues)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onRefresh()}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-neutral-300 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 border border-neutral-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher dans les journaux (action, utilisateur, détails, IP)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 focus:outline-none focus:border-black transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {[
            { key: "ALL", label: "Toutes" },
            { key: "UPDATE", label: "Modifications" },
            { key: "CREATE", label: "Créations" },
            { key: "DELETE", label: "Suppressions" },
            { key: "STOCK", label: "Mouvements Stock" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setActionFilter(f.key);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs whitespace-nowrap transition-colors ${
                actionFilter === f.key
                  ? "bg-black text-white font-medium"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-neutral-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/80 uppercase text-[10px] font-semibold tracking-wider text-neutral-600">
                <th className="py-3 px-4">Date & Heure</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entité Ciblée</th>
                <th className="py-3 px-4">Opérateur</th>
                <th className="py-3 px-4">Détails de l'opération</th>
                <th className="py-3 px-4">Adresse IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Aucune entrée dans le journal d'activité.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 text-neutral-500 whitespace-nowrap font-mono text-[11px]">
                      {log.created_at
                        ? new Date(log.created_at).toLocaleString("fr-FR")
                        : "—"}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 border text-[10px] font-bold font-mono uppercase tracking-wider ${getActionBadge(
                          log.action || ""
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-medium text-neutral-800 whitespace-nowrap">
                      {log.entity_type || log.entity}{" "}
                      {log.entity_id && (
                        <span className="text-neutral-400 font-mono text-[10px]">
                          #{log.entity_id}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-neutral-700 whitespace-nowrap font-mono text-[11px]">
                      {log.user_email || "Système"}
                    </td>

                    <td className="py-3 px-4 text-neutral-600 max-w-md truncate">
                      {log.details || "—"}
                    </td>

                    <td className="py-3 px-4 text-neutral-400 font-mono text-[10px] whitespace-nowrap">
                      {log.ip_address || "127.0.0.1"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 bg-neutral-50/50 text-xs">
          <span className="text-neutral-500">
            Affichage de <span className="font-medium text-neutral-900">{filteredLogs.length === 0 ? 0 : (page - 1) * pageSize + 1}</span> à{" "}
            <span className="font-medium text-neutral-900">
              {Math.min(page * pageSize, filteredLogs.length)}
            </span>{" "}
            sur <span className="font-medium text-neutral-900">{filteredLogs.length}</span> événements
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 border border-neutral-200 bg-white text-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-neutral-700 font-medium">
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 border border-neutral-200 bg-white text-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

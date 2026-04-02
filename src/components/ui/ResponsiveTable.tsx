"use client";

// ─── src/components/ui/MobileCard.tsx ────────────────────────────────────────
//
// A universal component that:
// - On DESKTOP (md+): renders a normal <Table> (you pass it as children)
// - On MOBILE (<md):  renders a card-list instead of a table
//
// Usage:
//
// <ResponsiveTable
//   columns={["Name", "Created At", "Actions"]}
//   rows={departments.map(dept => ({
//     key: dept.id,
//     cells: [
//       dept.name,
//       new Date(dept.createdAt).toLocaleDateString(),
//       <div className="flex gap-2">
//         <EditDepartmentDialog ... />
//         <DeleteDepartmentDialog ... />
//       </div>
//     ]
//   }))}
//   loading={loading}
//   empty="No departments found"
//   action={<CreateDepartmentDialog ... />}
//   title="Departments List"
// />

import { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Inbox } from "lucide-react";

type Row = {
  key: string;
  cells: ReactNode[];
  // Optional: badge shown in top-right of mobile card
  badge?: ReactNode;
  // Optional: click handler for the whole card
  onClick?: () => void;
};

type Props = {
  columns: string[];
  rows: Row[];
  loading?: boolean;
  empty?: string;
  title?: string;
  action?: ReactNode;
  skeletonRows?: number;
};

export default function ResponsiveTable({
  columns,
  rows,
  loading = false,
  empty = "No data found",
  title,
  action,
  skeletonRows = 4,
}: Props) {
  return (
    <Card className="border shadow-sm">
      {(title || action) && (
        <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
          {title && <CardTitle className="text-base font-semibold">{title}</CardTitle>}
          {action && <div className="flex-shrink-0">{action}</div>}
        </CardHeader>
      )}

      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(skeletonRows)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
            <Inbox className="h-8 w-8 opacity-40" />
            <p className="text-sm">{empty}</p>
          </div>
        ) : (
          <>
            {/* ── Desktop table (md and above) ── */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/60">
                    {columns.map((col) => (
                      <TableHead
                        key={col}
                        className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3"
                      >
                        {col}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.key}
                      className="hover:bg-gray-50 transition-colors"
                      onClick={row.onClick}
                      style={row.onClick ? { cursor: "pointer" } : {}}
                    >
                      {row.cells.map((cell, i) => (
                        <TableCell key={i} className="py-3 text-sm">
                          {cell}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* ── Mobile cards (below md) ── */}
            <div className="md:hidden divide-y divide-gray-100">
              {rows.map((row) => (
                <div
                  key={row.key}
                  className="p-4 hover:bg-gray-50 transition-colors"
                  onClick={row.onClick}
                  style={row.onClick ? { cursor: "pointer" } : {}}
                >
                  {/* First cell is always the "title" on mobile */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="font-semibold text-gray-900 text-sm leading-tight">
                      {row.cells[0]}
                    </div>
                    {row.badge && <div className="flex-shrink-0">{row.badge}</div>}
                  </div>

                  {/* Middle cells become label-value pairs */}
                  {columns.slice(1, -1).map((col, i) => (
                    <div key={col} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                      <span className="text-xs text-gray-400 font-medium">{col}</span>
                      <div className="text-xs text-gray-700 text-right max-w-[60%]">
                        {row.cells[i + 1]}
                      </div>
                    </div>
                  ))}

                  {/* Last cell = actions row */}
                  {row.cells.length > 1 && columns.length > 1 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                      {row.cells[row.cells.length - 1]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

import React, { useState } from 'react';
import {
  Search,
  Download,
  Filter,
  Columns,
  ArrowUpDown,
  Printer,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  accessor: (item: T) => React.ReactNode;
  sortable?: boolean;
  isNumeric?: boolean;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  title?: string;
  searchPlaceholder?: string;
  onAddNew?: () => void;
  addNewLabel?: string;
  totalRowFormatter?: (data: T[]) => React.ReactNode;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  title,
  searchPlaceholder = 'Filter records...',
  onAddNew,
  addNewLabel = 'Add New Record',
  totalRowFormatter
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [visibleColumns, setVisibleColumns] = useState<string[]>(columns.map(c => c.key));
  const [showColMenu, setShowColMenu] = useState(false);

  // Search filtering
  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    const str = JSON.stringify(item).toLowerCase();
    return str.includes(searchTerm.toLowerCase());
  });

  // Sort logic
  const sortedData = [...filteredData].sort((a: any, b: any) => {
    if (!sortKey) return 0;
    const valA = a[sortKey];
    const valB = b[sortKey];
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const exportCSV = () => {
    if (data.length === 0) return;
    const activeCols = columns.filter(c => visibleColumns.includes(c.key));
    const headers = activeCols.map(c => `"${c.header}"`).join(',');
    const rows = sortedData.map(item => {
      return activeCols.map(c => {
        const val = (item as any)[c.key];
        return `"${String(val ?? '').replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title || 'export'}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {title && (
          <h3 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">
            {title}
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-slate-700">
              {data.length} records
            </span>
          </h3>
        )}

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Columns toggle */}
          <div className="relative">
            <button
              onClick={() => setShowColMenu(!showColMenu)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1"
            >
              <Columns className="w-4 h-4 text-cyan-400" />
              <span className="hidden md:inline">Columns</span>
            </button>

            {showColMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50">
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 border-b border-slate-800 uppercase tracking-wider mb-1">
                  Toggle Columns
                </div>
                {columns.map(col => (
                  <label key={col.key} className="flex items-center gap-2 px-2 py-1 hover:bg-slate-800 rounded text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleColumns.includes(col.key)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setVisibleColumns([...visibleColumns, col.key]);
                        } else {
                          setVisibleColumns(visibleColumns.filter(k => k !== col.key));
                        }
                      }}
                      className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    {col.header}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Export CSV */}
          <button
            onClick={exportCSV}
            className="p-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">CSV Export</span>
          </button>

          {/* Add New Button */}
          {onAddNew && (
            <button
              onClick={onAddNew}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all"
            >
              + {addNewLabel}
            </button>
          )}
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-300 font-semibold uppercase tracking-wider">
              {columns
                .filter(col => visibleColumns.includes(col.key))
                .map(col => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={`p-3 select-none ${col.sortable ? 'cursor-pointer hover:text-cyan-400' : ''} ${
                      col.isNumeric ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div className={`flex items-center gap-1.5 ${col.isNumeric ? 'justify-end' : 'justify-start'}`}>
                      <span>{col.header}</span>
                      {col.sortable && <ArrowUpDown className="w-3 h-3 text-slate-500" />}
                    </div>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length}
                  className="p-8 text-center text-slate-500 font-medium italic"
                >
                  No matching records found.
                </td>
              </tr>
            ) : (
              sortedData.map((item, idx) => (
                <tr
                  key={item.id || idx}
                  className="hover:bg-slate-800/40 transition-colors text-slate-200"
                >
                  {columns
                    .filter(col => visibleColumns.includes(col.key))
                    .map(col => (
                      <td
                        key={col.key}
                        className={`p-3 align-middle ${col.isNumeric ? 'text-right font-mono' : 'text-left'}`}
                      >
                        {col.accessor(item)}
                      </td>
                    ))}
                </tr>
              ))
            )}
          </tbody>
          {totalRowFormatter && (
            <tfoot>
              <tr className="bg-slate-800/90 font-bold border-t-2 border-slate-700 text-slate-100">
                {totalRowFormatter(sortedData)}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

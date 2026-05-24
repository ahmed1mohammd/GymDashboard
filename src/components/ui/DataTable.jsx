import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import CyberButton from './CyberButton';

export const DataTable = ({ columns, data = [], emptyMessage = 'لا توجد بيانات متاحة', actions }) => {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-[var(--color-cyber-border)] bg-[rgba(16,18,27,0.4)]">
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-cyber-border)] bg-[rgba(10,10,15,0.6)]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-3.5 py-2 text-[11px] lg:text-xs font-bold text-gray-400 uppercase tracking-wider select-none whitespace-nowrap"
                >
                  {column.label}
                </th>
              ))}
              {actions && (
                <th className="px-3.5 py-2 text-[11px] lg:text-xs font-bold text-gray-400 uppercase tracking-wider text-left select-none whitespace-nowrap">
                  الإجراءات
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-cyber-border)]">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-6 py-6 text-center text-xs lg:text-sm text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className="hover:bg-[rgba(16,185,129,0.02)] transition-colors duration-150"
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-3.5 py-1.5 text-xs lg:text-[13px] text-gray-300 whitespace-nowrap leading-normal">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-3.5 py-1.5 text-xs lg:text-[13px] text-left whitespace-nowrap">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;

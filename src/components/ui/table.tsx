// src/components/ui/table.tsx
import React from 'react';

export const Table: React.FC<{ children: React.ReactNode; className?: string }> = ({ className, children }) => (
  <div className={`relative w-full overflow-auto ${className || ''}`}>
    <table className="w-full caption-bottom text-sm">
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ className, children }) => (
  <thead className={`[&_tr]:border-b ${className || ''}`}>
    {children}
  </thead>
);

export const TableBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ className, children }) => (
  <tbody className={`[&_tr:last-child]:border-0 ${className || ''}`}>
    {children}
  </tbody>
);

export const TableFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ className, children }) => (
  <tfoot className={`border-t bg-gray-100/50 font-medium [&_tr]:last:h-px dark:bg-gray-800/50 ${className || ''}`}>
    {children}
  </tfoot>
);

export const TableRow: React.FC<{ children: React.ReactNode; className?: string }> = ({ className, children }) => (
  <tr className={`border-b transition-colors hover:bg-gray-100/50 data-[state=selected]:bg-gray-100 dark:hover:bg-gray-800/50 dark:data-[state=selected]:bg-gray-800 ${className || ''}`}>
    {children}
  </tr>
);

export const TableHead: React.FC<{ children: React.ReactNode; className?: string }> = ({ className, children }) => (
  <th className={`h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0 dark:text-gray-400 ${className || ''}`}>
    {children}
  </th>
);

export const TableCell: React.FC<{ children: React.ReactNode; className?: string; colSpan?: number }> = ({ className, children, colSpan }) => (
  <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className || ''}`} colSpan={colSpan}>
    {children}
  </td>
);

export const TableCaption: React.FC<{ children: React.ReactNode; className?: string }> = ({ className, children }) => (
  <caption className={`mt-4 text-sm text-gray-500 dark:text-gray-400 ${className || ''}`}>
    {children}
  </caption>
);

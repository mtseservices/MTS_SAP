import React from 'react';
import { ReportFormRegistry } from '../../config/reportFormRegistry';
import { DataTable } from './DataTable';

interface EnterpriseReportTableProps {
  reportId: string;
  data: any[];
  title?: string;
}

export const EnterpriseReportTable: React.FC<EnterpriseReportTableProps> = ({ reportId, data, title }) => {
  const config = ReportFormRegistry[reportId];
  if (!config) return <div>Report configuration not found.</div>;

  const columns = config.defaultColumns.map(col => ({
    key: col.key,
    header: col.header,
    accessor: (row: any) => row[col.key] || '-',
    sortable: true
  }));

  return (
    <DataTable
      title={title || config.title}
      data={data}
      columns={columns}
    />
  );
};

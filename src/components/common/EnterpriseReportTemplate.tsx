import React from 'react';
import { DataTable } from './DataTable';

interface EnterpriseReportTemplateProps {
  reportName: string;
  columns: any[];
  data: any[];
  filters: React.ReactNode;
}

export const EnterpriseReportTemplate: React.FC<EnterpriseReportTemplateProps> = ({
  reportName,
  columns,
  data,
  filters
}) => {
  return (
    <div className="p-6 bg-white rounded shadow-md border border-gray-200">
      <h2 className="text-xl font-bold mb-4">{reportName}</h2>
      <div className="mb-4 flex gap-4 bg-gray-50 p-4 rounded">
        {filters}
      </div>
      <DataTable columns={columns} data={data} />
      <div className="mt-4 text-right font-bold">
        Grand Total: {data.length} records
      </div>
    </div>
  );
};

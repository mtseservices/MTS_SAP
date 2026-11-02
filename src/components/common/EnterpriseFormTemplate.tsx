import React, { useState } from 'react';
import { auditLogger } from '../../services/auditLogger';
import { UserRole } from '../../types/erp';

interface EnterpriseFormTemplateProps {
  moduleName: string;
  tenantId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  children: React.ReactNode;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
}

export const EnterpriseFormTemplate: React.FC<EnterpriseFormTemplateProps> = ({
  moduleName,
  tenantId,
  userId,
  userName,
  userRole,
  children,
  onSubmit,
  initialData
}) => {
  const [status, setStatus] = useState(initialData?.status || 'Draft');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ status });
    await auditLogger.logAction({
      tenantId,
      userId,
      userName,
      userRole,
      actionType: 'DATA_CREATE',
      module: moduleName,
      details: `Created record in ${moduleName} with status ${status}`
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded shadow-md border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{moduleName} Form</h2>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border p-2 rounded">
          <option value="Draft">Draft</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
      {children}
      <div className="mt-6 flex justify-end gap-4">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
        <button type="button" className="bg-green-600 text-white px-4 py-2 rounded">Submit for Approval</button>
      </div>
    </form>
  );
};

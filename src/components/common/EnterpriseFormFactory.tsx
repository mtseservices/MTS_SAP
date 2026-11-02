import React from 'react';
import { ReportFormRegistry } from '../../config/reportFormRegistry';

interface EnterpriseFormFactoryProps {
  formId: string;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const EnterpriseFormFactory: React.FC<EnterpriseFormFactoryProps> = ({ formId, onClose, onSubmit }) => {
  const config = ReportFormRegistry[formId];
  if (!config) return <div>Form configuration not found.</div>;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-lg font-bold mb-4">{config.title}</h2>
        {/* Render fields dynamically based on config.fields */}
        <div className="space-y-4">
          {config.fields.map(field => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-700">{field.label}</label>
              <input type={field.type} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button onClick={() => onSubmit({})} className="px-4 py-2 bg-blue-600 text-white rounded">View</button>
        </div>
      </div>
    </div>
  );
};

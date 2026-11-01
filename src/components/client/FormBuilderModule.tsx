import React, { useState } from 'react';
import { FileCheck2, Plus, Trash2, Eye, Save, Settings2 } from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { INITIAL_CUSTOM_FORMS } from '../../services/mockData';
import { CustomForm, CustomFormField, FormFieldType } from '../../types/erp';
import { DataTable } from '../common/DataTable';
import { TTSButton } from '../common/TTSButton';

export const FormBuilderModule: React.FC = () => {
  const { currentCompany } = useAuthTenant();
  const [forms, setForms] = useState<CustomForm[]>(INITIAL_CUSTOM_FORMS);
  const [activeTab, setActiveTab] = useState<'list' | 'builder'>('list');

  // Builder Form State
  const [formTitle, setFormTitle] = useState('Safety & Environmental HSE Inspection Form');
  const [formDept, setFormDept] = useState('Health, Safety & Environment');
  const [formDesc, setFormDesc] = useState('Factory floor safety and compliance checklist');
  const [fields, setFields] = useState<CustomFormField[]>([
    { id: 'f1', label: 'Inspector Full Name', type: 'text', required: true, placeholder: 'Enter name' },
    { id: 'f2', label: 'Inspection Date', type: 'date', required: true },
    { id: 'f3', label: 'PPE Gear Compliance', type: 'dropdown', required: true, options: ['Fully Compliant', 'Non-Compliant - Minor', 'Critical Violation'] }
  ]);

  const handleAddField = () => {
    const newField: CustomFormField = {
      id: `f_${Date.now()}`,
      label: 'New Custom Field',
      type: 'text',
      required: false,
      placeholder: 'Enter response'
    };
    setFields([...fields, newField]);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const newCustomForm: CustomForm = {
      id: `form_${Date.now()}`,
      title: formTitle,
      department: formDept,
      description: formDesc,
      fields,
      tenantId: currentCompany.tenantId,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setForms([newCustomForm, ...forms]);
    setActiveTab('list');
  };

  const formSpeech = `Dynamic Universal Form Builder for ${currentCompany.name}. Custom created operational forms: ${forms.length}. Build tailored transaction forms for any department with custom fields.`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-purple-400" />
            Universal Dynamic Form Builder
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Design custom operational forms, inspection checklists, auto-numbered vouchers, and department-specific transaction entries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TTSButton text={formSpeech} label="Form Builder Voice" />
          <button
            onClick={() => setActiveTab(activeTab === 'list' ? 'builder' : 'list')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all"
          >
            {activeTab === 'list' ? <Plus className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {activeTab === 'list' ? 'Build New Custom Form' : 'View Form Library'}
          </button>
        </div>
      </div>

      {activeTab === 'list' && (
        <DataTable
          title="Tenant Custom Forms Library"
          data={forms}
          columns={[
            { key: 'title', header: 'Form Title', accessor: (f) => <span className="font-bold text-slate-100">{f.title}</span>, sortable: true },
            { key: 'department', header: 'Department', accessor: (f) => <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-purple-300 font-semibold">{f.department}</span> },
            { key: 'description', header: 'Description', accessor: (f) => <span className="text-slate-400 text-xs">{f.description}</span> },
            { key: 'fields', header: 'Fields Count', accessor: (f) => <span className="font-mono text-cyan-400 font-bold">{f.fields.length} Fields</span>, isNumeric: true },
            { key: 'createdAt', header: 'Created Date', accessor: (f) => f.createdAt }
          ]}
        />
      )}

      {activeTab === 'builder' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-w-3xl mx-auto space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider text-purple-400">
              Custom Form Designer
            </h2>
            <p className="text-xs text-slate-400">Add custom fields and options to build a personalized business form.</p>
          </div>

          <form onSubmit={handleSaveForm} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Form Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Department</label>
                <input
                  type="text"
                  value={formDept}
                  onChange={(e) => setFormDept(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Guidelines</label>
              <input
                type="text"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
              />
            </div>

            {/* Fields Configurator */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Configured Form Fields ({fields.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddField}
                  className="px-3 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-semibold border border-purple-500/30 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Field
                </button>
              </div>

              {fields.map((field, idx) => (
                <div key={field.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => {
                        const updated = [...fields];
                        updated[idx].label = e.target.value;
                        setFields(updated);
                      }}
                      placeholder="Field Label Name"
                      className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100"
                    />

                    <select
                      value={field.type}
                      onChange={(e) => {
                        const updated = [...fields];
                        updated[idx].type = e.target.value as FormFieldType;
                        setFields(updated);
                      }}
                      className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100"
                    >
                      <option value="text">Text Input</option>
                      <option value="number">Number</option>
                      <option value="decimal">Decimal</option>
                      <option value="currency">Currency (PKR)</option>
                      <option value="date">Date</option>
                      <option value="dropdown">Dropdown List</option>
                      <option value="checkbox">Checkbox / Yes-No</option>
                    </select>

                    <div className="flex items-center justify-between gap-2">
                      <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => {
                            const updated = [...fields];
                            updated[idx].required = e.target.checked;
                            setFields(updated);
                          }}
                          className="rounded border-slate-700 text-purple-500"
                        />
                        Required
                      </label>

                      <button
                        type="button"
                        onClick={() => setFields(fields.filter((_, i) => i !== idx))}
                        className="p-1 text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Save Custom Form Template
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

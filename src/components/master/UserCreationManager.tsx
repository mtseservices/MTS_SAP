import React, { useState } from 'react';
import { Users, Mail, Shield, Plus, KeyRound, Copy, Eye, EyeOff } from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';

export const UserCreationManager: React.FC = () => {
  const { allCompanies } = useAuthTenant();
  const [selectedCompany, setSelectedCompany] = useState(allCompanies[0]?.id || '');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('CLIENT_ADMIN');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [autoGeneratePassword, setAutoGeneratePassword] = useState(true);
  const [invitationLink, setInvitationLink] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const company = allCompanies.find(c => c.id === selectedCompany);
    if (!company) {
      alert('Please select a valid company.');
      setIsSaving(false);
      return;
    }

    const userId = `user_${Date.now()}`;
    const token = `inv_${Math.random().toString(36).substr(2, 9)}`;
    const finalPassword = autoGeneratePassword ? `TempPass_${Math.random().toString(36).substr(2, 8)}` : password;
    
    const user = {
      userId,
      tenantId: company.tenantId,
      name,
      email,
      role,
      password: finalPassword, // In production, hash this!
      invitationToken: token
    };

    try {
      await setDoc(doc(db, 'tenants', company.tenantId, 'users', userId), user);
      setInvitationLink(`https://mts-sap.vercel.app/login/${company.slug}?token=${token}`);
      alert(`User created! Password: ${finalPassword}`);
    } catch (err) {
      console.error('Error creating user:', err);
      alert('Failed to create user. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
        <Users className="w-6 h-6 text-cyan-400" />
        Master User Creation Portal
      </h1>

      <form onSubmit={handleCreateUser} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 max-w-lg">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Company Tenant</label>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
          >
            {allCompanies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">User Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white">
            <option value="CLIENT_ADMIN">Admin</option>
            <option value="DEPARTMENT_MANAGER">Manager</option>
            <option value="SALES_OFFICER">Sales Officer</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
            <input type="checkbox" checked={autoGeneratePassword} onChange={() => setAutoGeneratePassword(!autoGeneratePassword)} />
            Auto-generate password
          </label>
          {!autoGeneratePassword && (
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required className="w-full px-3 py-2 pr-10 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>

        <button type="submit" disabled={isSaving} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs">
          <KeyRound className="w-4 h-4" /> {isSaving ? 'Generating...' : 'Generate User & Invite'}
        </button>
      </form>

      {invitationLink && (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl space-y-3 max-w-lg">
          <h2 className="text-sm font-bold text-emerald-400">Invitation Generated</h2>
          <div className="flex items-center gap-2 bg-slate-800 p-3 rounded-lg text-xs font-mono text-cyan-300 break-all">
            {invitationLink}
            <button onClick={() => navigator.clipboard.writeText(invitationLink)} className="p-1 hover:text-white">
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

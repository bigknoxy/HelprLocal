import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User } from '../../../../packages/types/index';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'volunteer' | 'org_admin'>('volunteer');
  const [organizationId, setOrganizationId] = useState('');
  const [skills, setSkills] = useState<string>('');
  const { loading, error } = useAuth();
  const navigate = useNavigate();

  // Import register API directly for now
  const { register } = require('../api/client');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user: User = await register(
        name,
        email,
        password,
        role,
        organizationId || undefined,
        skills ? skills.split(',').map((s) => s.trim()) : undefined,
      );
      if (user) navigate('/login');
    } catch (err: any) {
      // error handled by context
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form className="w-full max-w-sm" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input mb-2 w-full border p-2 rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input mb-2 w-full border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input mb-2 w-full border p-2 rounded"
          required
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'volunteer' | 'org_admin')}
          className="input mb-2 w-full border p-2 rounded"
        >
          <option value="volunteer">Volunteer</option>
          <option value="org_admin">Organization Admin</option>
        </select>
        <input
          type="text"
          placeholder="Organization ID (optional)"
          value={organizationId}
          onChange={(e) => setOrganizationId(e.target.value)}
          className="input mb-2 w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Skills (comma separated, optional)"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          className="input mb-2 w-full border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </div>
  );
};

export default Register;

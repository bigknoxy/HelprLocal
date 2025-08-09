import React from 'react';
import LogoutButton from './LogoutButton';

const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between p-4 bg-gray-100 shadow">
        <h1 className="text-xl font-bold">HelprLocal</h1>
        <LogoutButton />
      </header>
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
};

export default AuthenticatedLayout;

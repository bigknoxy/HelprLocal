import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchNotifications } from '../api/client';
import type { Notification } from '../../../../packages/types/index';

const Notifications: React.FC = () => {
  const {
    data: notifications,
    isLoading,
    error,
  } = useQuery<Notification[], Error>({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      {isLoading && <p>Loading notifications...</p>}
      {error && <p className="text-red-500">Error loading notifications</p>}
      {notifications && notifications.length > 0 ? (
        <ul className="w-full max-w-lg">
          {notifications.map((n) => (
            <li key={n.id} className="border p-4 mb-2 rounded shadow">
              <p>{n.message}</p>
              <p className="text-sm text-gray-500">{new Date(n.date).toLocaleString()}</p>
              <span className={n.read ? 'text-green-600' : 'text-yellow-600'}>
                {n.read ? 'Read' : 'Unread'}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        !isLoading && <p>No notifications found.</p>
      )}
    </div>
  );
};

export default Notifications;

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchEvents } from '../api/client';
import type { Event } from '../../../../packages/types/index';
import LogoutButton from '../components/LogoutButton';

const Events: React.FC = () => {
  const {
    data: events,
    isLoading,
    error,
  } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: fetchEvents,
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Events</h1>

      {isLoading && <p>Loading events...</p>}
      {error && <p className="text-red-500">Error loading events</p>}
      {events && events.length > 0 ? (
        <ul className="w-full max-w-lg">
          {events.map((event) => (
            <li key={event.id} className="border p-4 mb-2 rounded shadow">
              <h2 className="font-semibold text-lg">{event.title}</h2>
              <p>{event.description}</p>
              <p className="text-sm text-gray-500">
                {event.date.toString()} @ {event.location}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        !isLoading && <p>No events found.</p>
      )}
    </div>
  );
};

export default Events;

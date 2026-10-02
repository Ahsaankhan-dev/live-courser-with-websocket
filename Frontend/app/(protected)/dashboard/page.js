'use client';

import { useAuth } from '@/hooks/useAuth';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useDashboardUsers } from '@/hooks/useDashboardUsers';
import PeopleSidebar from '@/components/dashboard/PeopleSidebar';
import DashboardOverview from '@/components/dashboard/DashboardOverview';

export default function DashboardPage() {
  const { user } = useAuth();
  const { status, onlineUserIds } = useWebSocket();
  const { users, loading, error } = useDashboardUsers();

  const onlineCount = users.filter((person) =>
    onlineUserIds.includes(String(person.id)),
  ).length;

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f5f4f0] font-sans text-[#282821]">
      <div className="mx-auto grid min-h-[calc(100vh-72px)] max-w-[1440px] lg:grid-cols-[290px_minmax(0,1fr)]">
        <PeopleSidebar
          user={user}
          users={users}
          loading={loading}
          error={error}
          socketStatus={status}
          onlineUserIds={onlineUserIds}
        />
        <DashboardOverview
          user={user}
          onlineCount={onlineCount}
          socketStatus={status}
        />
      </div>
    </div>
  );
}

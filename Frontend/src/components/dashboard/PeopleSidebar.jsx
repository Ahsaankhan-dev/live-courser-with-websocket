function Avatar({ name, large = false }) {
  const initials = (name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  const size = large ? 'size-11 text-sm' : 'size-9 text-xs';

  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-[#e9e5dc] font-semibold text-[#574d3e] ${size}`}>
      {initials}
    </span>
  );
}

function PersonRow({ person, isOnline, statusText }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-[#f0efe9]">
      <div className="relative">
        <Avatar name={person.name} />
        <span
          title={statusText}
          className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-[#fbfaf7] ${isOnline ? 'bg-[#49a66b]' : 'bg-[#aaa99f]'}`}
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium text-[#36362f]">{person.name}</p>
        <p className={`text-[11px] ${isOnline ? 'text-[#4b8d62]' : 'text-[#929087]'}`}>
          {statusText}
        </p>
      </div>
    </div>
  );
}

export default function PeopleSidebar({
  user,
  users,
  loading,
  error,
  socketStatus,
  onlineUserIds,
}) {
  const isConnected = socketStatus === 'connected';

  return (
    <aside className="flex flex-col border-b border-[#e8e6df] bg-[#fbfaf7] px-5 py-6 lg:min-h-[calc(100vh-72px)] lg:border-b-0 lg:border-r lg:px-6">
      <div className="mb-9 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-2xl bg-[#28352f] text-sm font-semibold text-white">A</span>
        <div>
          <p className="text-[15px] font-semibold">Gather</p>
          <p className="text-xs text-[#8a887f]">Your people, together</p>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a887f]">People</h2>
        <span className="rounded-full bg-[#eeede7] px-2 py-0.5 text-[11px] text-[#77766e]">{users.length}</span>
      </div>

      <p className="mb-4 px-1 text-xs text-[#8a887f]" aria-live="polite">
        {isConnected ? 'Live availability' : socketStatus === 'connecting' ? 'Connecting…' : 'Presence unavailable'}
      </p>

      <div className="max-h-72 space-y-1 overflow-y-auto lg:max-h-[calc(100vh-310px)]">
        {loading && <p className="px-2 py-4 text-sm text-[#8a887f]">Loading people…</p>}
        {error && <p className="px-2 py-4 text-sm text-[#9a554c]">{error}</p>}
        {!loading && !error && users.length === 0 && (
          <p className="px-2 py-4 text-sm text-[#8a887f]">No other members yet.</p>
        )}

        {users.map((person) => {
          const isOnline = isConnected && onlineUserIds.includes(String(person.id));
          const statusText = isOnline
            ? 'Online'
            : isConnected ? 'Offline' : 'Status unavailable';

          return (
            <PersonRow
              key={person.id}
              person={person}
              isOnline={isOnline}
              statusText={statusText}
            />
          );
        })}
      </div>

      <div className="mt-6 border-t border-[#e8e6df] pt-5 lg:mt-auto">
        <p className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a887f]">Your account</p>
        <div className="flex items-center gap-3 rounded-xl bg-[#f1f0ea] p-3">
          <Avatar name={user?.name} large />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user?.name || 'Your profile'}</p>
            <p className="truncate text-xs text-[#85837a]">{user?.email}</p>
          </div>
          <span
            title={isConnected ? 'You are online' : 'Presence unavailable'}
            className={`ml-auto size-2.5 rounded-full ${isConnected ? 'bg-[#49a66b]' : 'bg-[#c5a75d]'}`}
          />
        </div>
      </div>
    </aside>
  );
}

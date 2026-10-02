export default function DashboardOverview({ user, onlineCount, socketStatus }) {
  const firstName = user?.name?.trim().split(/\s+/)[0];
  const isConnected = socketStatus === 'connected';

  return (
    <main className="px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
      <div className="mx-auto max-w-3xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.19em] text-[#8a887f]">Your space</p>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Good to see you{firstName ? `, ${firstName}` : ''}.
        </h1>
        <p className="mt-4 max-w-lg text-[15px] leading-7 text-[#77766e]">
          Keep up with your people. Their live availability is in the sidebar.
        </p>

        <section className="mt-12 rounded-[26px] border border-[#e9e6de] bg-[#fbfaf7] p-6 shadow-sm sm:p-8">
          <p className="text-sm text-[#77766e]">Community</p>
          <h2 className="mt-2 text-2xl font-semibold">A little more connected.</h2>

          <div className="mt-8 flex items-end justify-between gap-5 border-t border-[#eeece5] pt-6">
            <div>
              <p className="text-3xl font-semibold">{onlineCount}</p>
              <p className="mt-1 text-sm text-[#85837a]">
                {onlineCount === 1 ? 'person online' : 'people online'}
              </p>
            </div>
            <p className={`max-w-xs text-sm leading-6 ${isConnected ? 'text-[#85837a]' : 'text-[#ccc]'}`}>
              {isConnected ? 'Availability updates as people connect and leave.' : 'Connecting to live availability…'}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

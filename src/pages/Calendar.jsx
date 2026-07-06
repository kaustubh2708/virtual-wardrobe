export default function Calendar() {
  return (
    <div className="flex flex-col min-h-screen lg:min-h-0 bg-bg lg:rounded-2xl lg:overflow-hidden lg:border lg:border-border lg:shadow-sm">
      <div className="bg-primary text-white px-5 pt-12 pb-4 lg:pt-8 lg:rounded-t-2xl">
        <h1 className="text-xl font-bold">Calendar</h1>
      </div>
      <div className="flex flex-col items-center justify-center flex-1 px-6 text-center">
        <span className="text-6xl mb-4">📅</span>
        <h3 className="text-base font-bold text-primary mb-2">Outfit Calendar</h3>
        <p className="text-sm text-muted">Plan your outfits for the week ahead. Coming in Phase 2.</p>
      </div>
    </div>
  );
}

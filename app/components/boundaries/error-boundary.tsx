export function errorBoundary({ error }: { error: Error }) {
  return (
    <div className="bg-rose-50 border-rose-400 border-2 rounded-lg p-1 border-dashed grow max-w-[33vw]">
      <p className="font-semibold">Beehive UI Error: {error.message}</p>
      <button
        onClick={() => window.location.reload()}
        className="m-2 p-1 bg-rose-100 border-rose-400 border rounded-lg drop-shadow-md hover:drop-shadow-lg transition-all"
      >
        Refresh Page
      </button>
      <p className="font-light">{error.stack}</p>
    </div>
  );
}

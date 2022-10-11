export function errorBoundary({ error }: { error: Error }) {
  console.log(error);
  return (
    <div className="bg-red-50 border-red-500 border-2 rounded-lg p-1 border-dashed grow max-w-[33vw]">
      <p className="font-semibold">Beehive UI Error: {error.message}</p>
      <button
        onClick={() => window.location.reload()}
        className="m-2 p-1 bg-red-100 border-red-500 border rounded-lg drop-shadow-md hover:drop-shadow-lg transition-all"
      >
        Refresh Page
      </button>
      <p className="font-light">{error.stack}</p>
    </div>
  );
}

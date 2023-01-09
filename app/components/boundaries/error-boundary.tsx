export function errorBoundary({ error }: { error: Error }) {
  console.log(error);
  return (
    <div className="bg-color-error-bg border-color-error-border text-color-body-text border-2 rounded-lg p-1 border-dashed grow max-w-[33vw]">
      <p className="font-semibold">Beehive UI Error: {error.message}</p>
      <button
        onClick={() => window.location.reload()}
        className="m-2 p-1 bg-color-error-button border-color-error-border border rounded-lg drop-shadow-md hover:drop-shadow-lg transition-all"
      >
        Refresh Page
      </button>
      <p className="font-light">{error.stack}</p>
    </div>
  );
}

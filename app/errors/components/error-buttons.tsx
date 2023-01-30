export const ReloadButton: React.FunctionComponent = () => (
  <button
    onClick={() =>
      // https://developer.mozilla.org/en-US/docs/Web/API/Location/reload#parameters
      // @ts-ignore
      window.location.reload(true)
    }
    className="m-2 p-1 bg-color-error-button border-color-error-border border rounded-lg drop-shadow-md hover:drop-shadow-lg transition-all"
  >
    Refresh Page
  </button>
);

export const BackButton: React.FunctionComponent = () => (
  <button
    onClick={() => {
      if ("referrer" in document) {
        location.replace(document.referrer);
      } else {
        window.history.back();
      }
    }}
    className="m-2 p-1 bg-color-error-button border-color-error-border border rounded-lg drop-shadow-md hover:drop-shadow-lg transition-all"
  >
    Go Back
  </button>
);

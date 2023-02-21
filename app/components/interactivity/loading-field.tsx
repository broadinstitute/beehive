import { BeehiveIcon } from "../assets/beehive-icon";

// A component that looks like a field that's currently loading. Useful as a SSR fallback for when a field can only rendered on the client.
export const LoadingField = () => (
  <div
    aria-disabled
    className="w-full flex justify-center items-center shadow-md rounded-2xl mt-2 h-12 border border-color-text-box-border/50 bg-color-nearest-bg pointer-events-none cursor-wait"
  >
    <BeehiveIcon className="h-7 w-7" loading />
  </div>
);

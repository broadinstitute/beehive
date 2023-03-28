import { BeehiveIcon } from "~/components/assets/beehive-icon";

export const SuspenseBeehiveFallback: React.FunctionComponent = () => (
  <div className="grow w-full h-full flex items-center justify-center">
    <BeehiveIcon className="h-20 w-20" loading />
  </div>
);

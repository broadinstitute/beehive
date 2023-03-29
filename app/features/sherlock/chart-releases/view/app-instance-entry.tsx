import { EnvironmentColors } from "~/features/sherlock/environments/environment-colors";

export const AppInstanceEntry: React.FunctionComponent<{
  prod?: boolean;
  promoteButton?: React.ReactNode;
  children: React.ReactNode;
}> = ({ prod, promoteButton, children }) => (
  <div
    data-theme-prod={prod}
    className={`${
      promoteButton ? "mb-10" : ""
    } relative bg-color-near-bg w-full rounded-2xl shadow-md border-2 ${
      EnvironmentColors.borderClassName
    } flex flex-col gap-2 p-3 text-color-body-text`}
  >
    {children}
    {promoteButton && (
      <div className="w-[70vw] laptop:w-[22vw] ultrawide:w-[13vw] absolute -bottom-10 right-5">
        {promoteButton}
      </div>
    )}
  </div>
);

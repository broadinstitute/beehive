import { EnvironmentColors } from "~/features/sherlock/environments/environment-colors";
import { panelSizeToInnerClassName } from "~/helpers/panel-size";

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
      <div
        className={`${panelSizeToInnerClassName(
          "one-fourth"
        )} absolute -bottom-10 right-5`}
      >
        {promoteButton}
      </div>
    )}
  </div>
);

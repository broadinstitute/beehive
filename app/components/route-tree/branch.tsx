import { InsetPanelProps } from "../layout/inset-panel";
import { OutsetPanelProps } from "../layout/outset-panel";

interface BranchProps {
  children:
    | React.ReactElement<InsetPanelProps | OutsetPanelProps>
    | [
        // InsetPanel or OutsetPanel
        React.ReactElement<InsetPanelProps | OutsetPanelProps>,
        // Outlet
        React.ReactElement | null
      ];
  prod?: boolean;
}

export const Branch: React.FunctionComponent<BranchProps> = ({
  children,
  prod,
}) => (
  <div
    data-theme-prod={prod}
    className="flex flex-row h-full grow bg-color-far-bg"
  >
    {children}
  </div>
);

import { InsetPanelProps } from "../layout/inset-panel";
import { OutsetPanelProps } from "../layout/outset-panel";

interface BranchProps {
  children: [
    // InsetPanel or OutsetPanel
    React.ReactElement<InsetPanelProps | OutsetPanelProps>,
    // Outlet
    React.ReactElement | null
  ];
}

export const Branch: React.FunctionComponent<BranchProps> = ({ children }) => (
  <div className="flex flex-row h-full grow">{children}</div>
);

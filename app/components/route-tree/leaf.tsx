import { InsetPanelProps } from "../layout/inset-panel";
import { OutsetPanelProps } from "../layout/outset-panel";

interface LeafProps {
  children: React.ReactElement<InsetPanelProps | OutsetPanelProps>;
}

export const Leaf: React.FunctionComponent<LeafProps> = ({ children }) => (
  <div className="h-full grow hidden lg:block">{children}</div>
);

import { Form } from "@remix-run/react";
import { FunctionComponent, ReactNode } from "react";
import { AuthenticityTokenInput, ClientOnly } from "remix-utils";
import ActionButton from "../components/interactivity/action-button";

interface EditPanelProps {
  name?: string;
  borderClassName: string;
  backgroundClassName: string;
  children: ReactNode;
}

const EditPanel: FunctionComponent<EditPanelProps> = ({
  name,
  borderClassName,
  backgroundClassName,
  children,
}) => (
  <div className="w-[33vw] flex flex-col items-center space-y-4 pb-4 bg-white">
    <div className="w-[30vw] p-3 pt-4">
      <h1 className="text-3xl font-medium">Now Editing {name}</h1>
    </div>
    <Form
      method="post"
      className={`w-[30vw] rounded-2xl border-2 shadow-sm p-8 flex flex-col space-y-4 ${borderClassName} ${backgroundClassName}`}
    >
      {children}
      <br />
      <AuthenticityTokenInput />
      <ActionButton borderClassName={borderClassName} type="submit">
        <h2 className="font-medium">Click to Save Edits</h2>
      </ActionButton>
    </Form>
  </div>
);

export default EditPanel;

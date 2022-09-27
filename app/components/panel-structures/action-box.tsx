import { Form } from "@remix-run/react";
import { AuthenticityTokenInput } from "remix-utils";
import ActionButton from "../interactivity/action-button";

export interface ActionBoxProps {
  children: React.ReactNode;
  title: string;
  submitText: string;
  borderClassName: string;
  backgroundClassName: string;
}

export const ActionBox: React.FunctionComponent<ActionBoxProps> = ({
  children,
  title,
  submitText,
  borderClassName,
  backgroundClassName,
}) => (
  <div className="flex flex-col items-center space-y-4 pb-4">
    <div className="w-[30vw] p-3 pt-4">
      <h1 className="text-3xl font-medium">{title}</h1>
    </div>
    <Form
      reloadDocument
      method="post"
      className={`w-[30vw] flex flex-col space-y-4 rounded-2xl p-8 border-2 ${borderClassName} ${backgroundClassName}`}
    >
      {children}
      <br />
      <ActionButton borderClassName={borderClassName} type="submit">
        <h2 className="font-medium">{submitText}</h2>
      </ActionButton>
      <AuthenticityTokenInput />
    </Form>
  </div>
);

import { Form, useTransition } from "@remix-run/react";
import ActionButton from "../interactivity/action-button";
import { CsrfTokenInput } from "../logic/csrf-token";

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
}) => {
  const transition = useTransition();
  return (
    <div className="flex flex-col items-center space-y-4 pb-4">
      <div className="w-[30vw] p-3 pt-4">
        <h1 className="text-3xl font-medium">{title}</h1>
      </div>
      <Form
        method="post"
        className={`w-[30vw] flex flex-col space-y-4 rounded-2xl p-8 border-2 ${borderClassName} ${backgroundClassName}`}
      >
        <fieldset
          disabled={transition.state === "submitting"}
          className="flex flex-col space-y-4"
        >
          {children}
        </fieldset>
        <br />
        <ActionButton
          sizeClassName="w-full"
          borderClassName={borderClassName}
          type="submit"
          isLoading={transition.state === "submitting"}
        >
          <h2 className="font-medium">{submitText}</h2>
        </ActionButton>
        <CsrfTokenInput />
      </Form>
    </div>
  );
};

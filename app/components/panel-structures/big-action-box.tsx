import { Form, useTransition } from "@remix-run/react";
import { AuthenticityTokenInput } from "remix-utils";
import ActionButton from "../interactivity/action-button";
import { NavButton } from "../interactivity/nav-button";
import { ActionBoxProps } from "./action-box";

export interface BigActionBoxProps extends ActionBoxProps {
  returnURL: string;
  returnText: string;
  hideButton?: boolean;
}

export const BigActionBox: React.FunctionComponent<BigActionBoxProps> = ({
  returnURL,
  returnText,
  children,
  title,
  submitText,
  borderClassName,
  backgroundClassName,
  hideButton,
}) => {
  const transition = useTransition();
  return (
    <div className="w-[33vw] h-full flex flex-col space-y-8 p-8 pt-4">
      <div>
        <h1 className="text-5xl font-medium">{title}</h1>
      </div>
      <Form
        method="post"
        className={`flex flex-col space-y-4 rounded-2xl p-8 border-2 ${borderClassName} ${backgroundClassName}`}
      >
        <fieldset
          disabled={transition.state === "submitting"}
          className="flex flex-col space-y-4"
        >
          {children}
        </fieldset>
        {hideButton || (
          <>
            <br />
            <ActionButton
              sizeClassName="w-full"
              borderClassName={borderClassName}
              type="submit"
              isLoading={transition.state === "submitting"}
            >
              <h2 className="font-medium">{submitText}</h2>
            </ActionButton>
            <AuthenticityTokenInput />
            {returnURL && (
              <input type="hidden" name="return" value={returnURL} />
            )}
          </>
        )}
      </Form>
      <NavButton to={returnURL} borderClassName={borderClassName} sizeClassName>
        <h2 className="font-light">{returnText}</h2>
      </NavButton>
    </div>
  );
};

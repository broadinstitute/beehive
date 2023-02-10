import { Form, useNavigation } from "@remix-run/react";
import { safeRedirectPath } from "~/helpers/validate";
import { ActionButton } from "../interactivity/action-button";
import { NavButton } from "../interactivity/nav-button";
import { CsrfTokenInput } from "../logic/csrf-token";
import { ActionBoxProps } from "./action-box";

export interface BigActionBoxProps extends ActionBoxProps {
  returnPath: string;
  returnText: string;
  hideButton?: boolean;
}

export const BigActionBox: React.FunctionComponent<BigActionBoxProps> = ({
  returnPath,
  returnText,
  children,
  title,
  submitText,
  borderClassName,
  beforeBorderClassName,
  backgroundClassName,
  hideButton,
}) => {
  const safeReturnPath = safeRedirectPath(returnPath);
  const transition = useNavigation();
  return (
    <div className="w-screen lg:w-[33vw] h-full flex flex-col space-y-8 p-8 pt-4 text-color-body-text">
      <div>
        <h1 className="text-5xl font-medium text-color-header-text">{title}</h1>
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
              beforeBorderClassName={beforeBorderClassName}
              type="submit"
              isLoading={transition.state === "submitting"}
            >
              <h2 className="font-medium">{submitText}</h2>
            </ActionButton>
            <CsrfTokenInput />
            {safeReturnPath && (
              <input type="hidden" name="return" value={safeReturnPath} />
            )}
          </>
        )}
      </Form>
      <NavButton
        to={safeReturnPath}
        beforeBorderClassName={beforeBorderClassName}
      >
        <h2 className="font-light">{returnText}</h2>
      </NavButton>
      <br />
    </div>
  );
};

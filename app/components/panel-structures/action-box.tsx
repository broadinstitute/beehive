import { Form, useNavigation } from "@remix-run/react";
import { Rocket } from "lucide-react";
import { PanelSize, panelSizeToInnerClassName } from "~/helpers/panel-size";
import { ActionButton } from "../interactivity/action-button";
import { CsrfTokenInput } from "../logic/csrf-token";

export interface ActionBoxProps {
  size?: PanelSize;
  children: React.ReactNode;
  title: string;
  submitText: string;
  borderClassName: string;
  beforeBorderClassName: string;
  backgroundClassName: string;
}

export const ActionBox: React.FunctionComponent<ActionBoxProps> = ({
  size = "one-third",
  children,
  title,
  submitText,
  borderClassName,
  beforeBorderClassName,
  backgroundClassName,
}) => {
  const transition = useNavigation();
  return (
    <div className="flex flex-col items-center space-y-4 pb-4 text-color-body-text">
      <div className={`${panelSizeToInnerClassName(size)} p-3 pt-4`}>
        <h1 className="text-3xl font-medium text-color-header-text">{title}</h1>
      </div>
      <Form
        method="post"
        className={`${panelSizeToInnerClassName(
          size
        )} flex flex-col space-y-4 rounded-2xl p-8 border-2 ${borderClassName} ${backgroundClassName}`}
      >
        <fieldset
          disabled={transition.state === "submitting"}
          className="flex flex-col space-y-4"
        >
          {children}
        </fieldset>
        <br />
        <ActionButton
          size="fill"
          beforeBorderClassName={beforeBorderClassName}
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

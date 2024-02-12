import type { SummarizedErrorInfo } from "../helpers/summarize-response-error";
import { ReloadButton } from "./error-buttons";

export const FormErrorDisplay: React.FunctionComponent<SummarizedErrorInfo> = ({
  title,
  body,
  reloadRecommended,
}) => (
  <div className="bg-color-error-bg border-color-error-border border-2 rounded-lg p-1 border-dashed grow">
    <h3 className="font-semibold text-color-header-text">{title}</h3>
    {reloadRecommended && <ReloadButton />}
    <p className="font-light text-color-body-text">{body}</p>
  </div>
);

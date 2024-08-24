import { createContext, useContext } from "react";

export const CsrfTokenContext = createContext("");

export const csrfTokenInputName = "csrf-token";

export const CsrfTokenInput: React.FunctionComponent = () => (
  <CsrfTokenContext.Consumer>
    {(token) => <input type="hidden" name={csrfTokenInputName} value={token} />}
  </CsrfTokenContext.Consumer>
);

export function useCsrfToken() {
  return useContext(CsrfTokenContext);
}

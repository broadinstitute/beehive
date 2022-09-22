import { ErrorsErrorResponse } from "@sherlock-js-client/sherlock";

export interface ActionErrorInfo<T> extends DerivedErrorInfo {
  faultyRequest: T;
}

export interface DerivedErrorInfo {
  title: string;
  message: string;
  reloadRequired: boolean;
}

export async function deriveErrorInfoFromResponse(
  response: Response
): Promise<DerivedErrorInfo> {
  return deriveErrorInfo(response.status, await response.json());
}

export function deriveErrorInfo(status: number, data: any): DerivedErrorInfo {
  let subject = "Beehive Backend";
  let message: string | undefined = (data as ErrorsErrorResponse).message;

  if (message !== undefined) {
    subject = "Sherlock";
    message = `Error directly from Sherlock: ${message}`;
  } else {
    try {
      const parsed = JSON.parse(data as string);
      if (parsed.message !== undefined) {
        message = parsed.message;
      } else if (parsed !== undefined) {
        message = String(parsed);
      }
    } catch (error) {}
  }
  if (message === undefined) {
    message = JSON.stringify(data);
  }
  return {
    title: `${subject} Error: ${status} ${
      (data as ErrorsErrorResponse).type || "Response"
    }`,
    message: message,
    reloadRequired:
      (data as ErrorsErrorResponse).toBlame == "server" ||
      subject === "Beehive Backend",
  };
}

export function displayErrorInfo({
  title,
  message,
}: DerivedErrorInfo): JSX.Element {
  return (
    <div className="bg-rose-50 border-rose-400 border-2 rounded-lg p-1 border-dashed grow">
      <p className="font-semibold">{title}</p>
      <p className="font-light">{message}</p>
    </div>
  );
}

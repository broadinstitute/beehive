import { isErrorResponseFromSherlock } from "./is-error-response-from-sherlock";

export interface SummarizedErrorInfo {
  title: string;
  body: string;
  reloadRecommended?: boolean;
}

export async function summarizeResponseError(
  response: Response
): Promise<SummarizedErrorInfo> {
  const text = await response.text();
  try {
    const json = JSON.parse(text);
    if (isErrorResponseFromSherlock(json)) {
      return {
        title: `Error directly from Sherlock: ${response.status} ${json.type}`,
        body: json.message || "(no message)",
        reloadRecommended: response.status === 422,
      };
    } else {
      return {
        title: `Error from ${new URL(response.url).hostname}: ${
          response.status
        } ${response.statusText}`,
        body: JSON.stringify(json),
      };
    }
  } catch (error) {
    return {
      title: `Non-JSON Error from ${new URL(response.url).hostname}: ${
        response.status
      } ${response.statusText}`,
      body: text,
    };
  }
}

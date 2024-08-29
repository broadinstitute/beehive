import { expect, test } from "vitest";
import { IapJwtHeader, handleIAP } from "./sherlock.server";

test("handleIAP should forward the normal IAP header", () => {
  let request = new Request("https://example.com", {
    headers: {
      [IapJwtHeader]: "test",
      "some-other-header": "value",
    },
  });

  let result = handleIAP(request);

  expect(result.headers).toEqual({ [IapJwtHeader]: "test" });
});

test("handleIAP should send IAP token as bearer in development", () => {
  let prevBaseURL = process.env.SHERLOCK_BASE_URL;
  let prevIAPToken = process.env.IAP_TOKEN;
  process.env.SHERLOCK_BASE_URL = "https://example.com";
  process.env.IAP_TOKEN = "test";
  let request = new Request("https://example.com");
  let result = handleIAP(request);
  process.env.SHERLOCK_BASE_URL = prevBaseURL;
  process.env.IAP_TOKEN = prevIAPToken;
  expect(result.headers).toEqual({ Authorization: "Bearer test" });
});

test("handle IAP should not send IAP token in production", () => {
  let prevBaseURL = process.env.SHERLOCK_BASE_URL;
  let prevIAPToken = process.env.IAP_TOKEN;
  let prevNodeEnv = process.env.NODE_ENV;
  process.env.SHERLOCK_BASE_URL = "https://example.com";
  process.env.IAP_TOKEN = "test";
  process.env.NODE_ENV = "production";
  let request = new Request("https://example.com");
  let result = handleIAP(request);
  process.env.SHERLOCK_BASE_URL = prevBaseURL;
  process.env.IAP_TOKEN = prevIAPToken;
  process.env.NODE_ENV = prevNodeEnv;
  expect(result).toEqual({});
});

test("handleIAP should not send IAP token if the URL is not secure", () => {
  let prevBaseURL = process.env.SHERLOCK_BASE_URL;
  let prevIAPToken = process.env.IAP_TOKEN;
  process.env.SHERLOCK_BASE_URL = "http://example.com";
  process.env.IAP_TOKEN = "test";
  let request = new Request("http://example.com");
  let result = handleIAP(request);
  process.env.SHERLOCK_BASE_URL = prevBaseURL;
  process.env.IAP_TOKEN = prevIAPToken;
  expect(result).toEqual({});
});

test("handleIAP should not send IAP token if there isn't one provided", () => {
  let prevBaseURL = process.env.SHERLOCK_BASE_URL;
  let prevIAPToken = process.env.IAP_TOKEN;
  process.env.SHERLOCK_BASE_URL = "https://example.com";
  process.env.IAP_TOKEN = "";
  let request = new Request("https://example.com");
  let result = handleIAP(request);
  process.env.SHERLOCK_BASE_URL = prevBaseURL;
  process.env.IAP_TOKEN = prevIAPToken;
  expect(result).toEqual({});
});

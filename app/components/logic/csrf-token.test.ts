import { createSession } from "@remix-run/node";
import { sessionFields } from "~/session.server";
import { csrfTokenInputName, verifySessionCsrfToken } from "./csrf-token";

test("verifySessionCsrfToken should error if body can't be read", async () => {
  let formData = new FormData();
  formData.append(csrfTokenInputName, "token");
  formData.append("blah", "blah");
  let request = new Request("https://example.com", {
    method: "POST",
    body: formData,
  });

  let session = createSession(
    {
      [sessionFields.csrfToken]: "token",
      blah: "blah",
    },
    "test-session",
  );

  // Break the request body
  await request.text();

  expect(verifySessionCsrfToken(request, session)).rejects.toThrow(
    "Request body consumed before validating CSRF token - this indicates a Beehive source code issue",
  );
});

test("verifySessionCsrfToken should error if session lacks token", async () => {
  let formData = new FormData();
  formData.append(csrfTokenInputName, "token");
  formData.append("blah", "blah");
  let request = new Request("https://example.com", {
    method: "POST",
    body: formData,
  });

  let session = createSession(
    {
      blah: "blah",
    },
    "test-session",
  );

  expect(verifySessionCsrfToken(request, session)).rejects.toThrow(
    "Session did not contain a CSRF token - this indicates an issue on Beehive's end setting the cookie",
  );
});

test("verifySessionCsrfToken should error if the formdata doesn't contain the token", async () => {
  let formData = new FormData();
  formData.append("blah", "blah");
  let request = new Request("https://example.com", {
    method: "POST",
    body: formData,
  });

  let session = createSession(
    {
      [sessionFields.csrfToken]: "token",
      blah: "blah",
    },
    "test-session",
  );

  expect(verifySessionCsrfToken(request, session)).rejects.toThrow(
    "Request body did not contain a CSRF token - this indicates an issue on Beehive's end constructing the form",
  );
});

test("verifySessionCsrfToken should error if tokens are inconsistent", async () => {
  let formData = new FormData();
  formData.append(csrfTokenInputName, "token1");
  formData.append("blah", "blah");
  let request = new Request("https://example.com", {
    method: "POST",
    body: formData,
  });

  let session = createSession(
    {
      [sessionFields.csrfToken]: "token2",
      blah: "blah",
    },
    "test-session",
  );

  expect(verifySessionCsrfToken(request, session)).rejects.toBeInstanceOf(
    Response,
  );
});

test("verifySessionCsrfToken should not error if it matches", async () => {
  let formData = new FormData();
  formData.append(csrfTokenInputName, "token");
  formData.append("blah", "blah");
  let request = new Request("https://example.com", {
    method: "POST",
    body: formData,
  });

  let session = createSession(
    {
      [sessionFields.csrfToken]: "token",
      blah: "blah",
    },
    "test-session",
  );

  expect(verifySessionCsrfToken(request, session)).resolves.toBeUndefined();
});

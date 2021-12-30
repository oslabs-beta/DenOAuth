import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.71.0/testing/asserts.ts";
import {
  AuthorizationResponseError,
  OAuth2ResponseError,
  TokenResponseError,
} from "./errors.ts";

Deno.test("OAuth2ResponseError constructor works", () => {
  const fullError = new OAuth2ResponseError({
    error: "invalid_request",
    error_description: "test description",
    error_uri: "error://uri",
    state: "some state",
  });
  assertEquals(fullError.message, "test description");
  assertEquals(fullError.error, "invalid_request");
  assertEquals(fullError.errorDescription, "test description");
  assertEquals(fullError.errorUri, "error://uri");
  assertEquals(fullError.state, "some state");

  const noDescription = new OAuth2ResponseError({
    error: "test error",
  });
  assertEquals(noDescription.message, "test error");
});

Deno.test("OAuth2ResponseError.fromURLSearchParams, URL without error parameter throws error", () => {
  assertThrows(
    () => {
      OAuth2ResponseError.fromURLSearchParams(new URLSearchParams());
    },
    TypeError,
    "error URL parameter must be set",
  );
});

Deno.test("OAuth2ResponseError.fromURLSearchParams works when only the error parameter is set", () => {
  const onlyError = OAuth2ResponseError.fromURLSearchParams(
    new URLSearchParams({
      error: "test error",
    }),
  );
  assertEquals(onlyError.error, "test error");
  assertEquals(onlyError.errorDescription, undefined);
  assertEquals(onlyError.errorUri, undefined);
  assertEquals(onlyError.state, undefined);
  assertEquals(onlyError.message, "test error");
});

Deno.test("OAuth2ResponseError.fromURLSearchParams works when error and error_description are set", () => {
  const withDescription = OAuth2ResponseError.fromURLSearchParams(
    new URLSearchParams({
      error: "test error",
      error_description: "description",
    }),
  );
  assertEquals(withDescription.errorDescription, "description");
  assertEquals(withDescription.message, "description");
});

Deno.test("OAuth2ResponseError.fromURLSearchParams works when error and error_uri are set", () => {
  const withErrorUri = OAuth2ResponseError.fromURLSearchParams(
    new URLSearchParams({
      error: "test error",
      error_uri: "error://uri",
    }),
  );
  assertEquals(withErrorUri.errorUri, "error://uri");
  assertEquals(withErrorUri.message, "test error");
});

Deno.test("OAuth2ResponseError.fromURLSearchParams works when error and state are set", () => {
  const withState = OAuth2ResponseError.fromURLSearchParams(
    new URLSearchParams({
      error: "test error",
      state: "some state",
    }),
  );
  assertEquals(withState.state, "some state");
  assertEquals(withState.message, "test error");
});

Deno.test("OAuth2ResponseError.fromURLSearchParams works when error, error_description, error_uri and state are set", () => {
  const fullError = OAuth2ResponseError.fromURLSearchParams(
    new URLSearchParams({
      error: "invalid_request",
      error_description: "test description",
      error_uri: "error://uri",
      state: "some state",
    }),
  );
  assertEquals(fullError.message, "test description");
  assertEquals(fullError.error, "invalid_request");
  assertEquals(fullError.errorDescription, "test description");
  assertEquals(fullError.errorUri, "error://uri");
  assertEquals(fullError.state, "some state");
});

Deno.test("AuthorizationResponseError constructor works", () => {
  const error = new AuthorizationResponseError("description");

  assertEquals(error.message, "Invalid authorization response: description");
});

Deno.test("TokenResponseError constructor works", () => {
  const response = new Response("body", {
    headers: { "Test-Header": "is set" },
    status: 418,
    statusText: "I'm a teapot",
  });
  const error = new TokenResponseError("description", response);

  assertEquals(error.message, "Invalid token response: description");
  assertEquals(error.response, response);
});
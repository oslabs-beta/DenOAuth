import {
  assertEquals,
  assertMatch,
  assertNotMatch,
  assertThrowsAsync,
} from "https://deno.land/std@0.71.0/testing/asserts.ts";
import { spy } from "https://deno.land/x/mock@v0.9.5/mod.ts";

import {
  AuthorizationResponseError,
  OAuth2ResponseError,
  TokenResponseError,
} from "./errors.ts";
import {
  buildAccessTokenCallback,
  getOAuth2Client,
  mockATResponse,
} from "./test_utils.ts";

//#region AuthorizationCodeGrant.getAuthorizationUri successful paths

Deno.test("AuthorizationCodeGrant.getAuthorizationUri works without additional options", () => {
  assertMatchesUrl(
    getOAuth2Client().code.getAuthorizationUri(),
    "https://auth.server/auth?response_type=code&client_id=clientId",
  );
});

Deno.test("AuthorizationCodeGrant.getAuthorizationUri works when passing a single scope", () => {
  assertMatchesUrl(
    getOAuth2Client().code.getAuthorizationUri({
      scope: "singleScope",
    }),
    "https://auth.server/auth?response_type=code&client_id=clientId&scope=singleScope",
  );
});

Deno.test("AuthorizationCodeGrant.getAuthorizationUri works when passing multiple scopes", () => {
  assertMatchesUrl(
    getOAuth2Client().code.getAuthorizationUri({
      scope: ["multiple", "scopes"],
    }),
    "https://auth.server/auth?response_type=code&client_id=clientId&scope=multiple+scopes",
  );
});

Deno.test("AuthorizationCodeGrant.getAuthorizationUri works when passing a state parameter", () => {
  assertMatchesUrl(
    getOAuth2Client().code.getAuthorizationUri({
      state: "someState",
    }),
    "https://auth.server/auth?response_type=code&client_id=clientId&state=someState",
  );
});

Deno.test("AuthorizationCodeGrant.getAuthorizationUri works with redirectUri", () => {
  assertMatchesUrl(
    getOAuth2Client({
      redirectUri: "https://example.app/redirect",
    }).code.getAuthorizationUri(),
    "https://auth.server/auth?response_type=code&client_id=clientId&redirect_uri=https%3A%2F%2Fexample.app%2Fredirect",
  );
});

Deno.test("AuthorizationCodeGrant.getAuthorizationUri works with redirectUri and a single scope", () => {
  assertMatchesUrl(
    getOAuth2Client({
      redirectUri: "https://example.app/redirect",
    }).code.getAuthorizationUri({
      scope: "singleScope",
    }),
    "https://auth.server/auth?response_type=code&client_id=clientId&redirect_uri=https%3A%2F%2Fexample.app%2Fredirect&scope=singleScope",
  );
});

Deno.test("AuthorizationCodeGrant.getAuthorizationUri works with redirectUri and multiple scopes", () => {
  assertMatchesUrl(
    getOAuth2Client({
      redirectUri: "https://example.app/redirect",
    }).code.getAuthorizationUri({
      scope: ["multiple", "scopes"],
    }),
    "https://auth.server/auth?response_type=code&client_id=clientId&redirect_uri=https%3A%2F%2Fexample.app%2Fredirect&scope=multiple+scopes",
  );
});

Deno.test("AuthorizationCodeGrant.getAuthorizationUri uses default scopes if no scope was specified", () => {
  assertMatchesUrl(
    getOAuth2Client({
      defaults: { scope: ["default", "scopes"] },
    }).code.getAuthorizationUri(),
    "https://auth.server/auth?response_type=code&client_id=clientId&scope=default+scopes",
  );
});

Deno.test("AuthorizationCodeGrant.getAuthorizationUri uses specified scopes over default scopes", () => {
  assertMatchesUrl(
    getOAuth2Client({
      defaults: { scope: ["default", "scopes"] },
    }).code.getAuthorizationUri({
      scope: "notDefault",
    }),
    "https://auth.server/auth?response_type=code&client_id=clientId&scope=notDefault",
  );
});

//#endregion

//#region TODO: AuthorizationCodeGrant.getAuthorization error paths

//#endregion

//#region AuthorizationCodeGrant.getToken
//#region AuthorizationCodeGrant.getToken error paths

Deno.test("AuthorizationCodeGrant.getToken throws if the received redirectUri does not match the configured one", async () => {
  await assertThrowsAsync(
    () =>
      getOAuth2Client({
        redirectUri: "https://example.com/redirect",
      }).code.getToken(
        buildAccessTokenCallback(
          { baseUrl: "https://example.com/invalid-redirect" },
        ),
      ),
    AuthorizationResponseError,
    "Redirect path should match configured path",
  );
});

Deno.test("AuthorizationCodeGrant.getToken throws if the callbackUri does not contain any parameters", async () => {
  await assertThrowsAsync(
    () =>
      getOAuth2Client().code.getToken(
        buildAccessTokenCallback(),
      ),
    AuthorizationResponseError,
    "URI does not contain callback parameters",
  );
});

Deno.test("AuthorizationCodeGrant.getToken throws if the callbackUri contains an error parameter", async () => {
  await assertThrowsAsync(
    () =>
      getOAuth2Client().code.getToken(
        buildAccessTokenCallback({
          params: { error: "invalid_request" },
        }),
      ),
    OAuth2ResponseError,
    "invalid_request",
  );
});

Deno.test("AuthorizationCodeGrant.getToken throws if the callbackUri contains the error, error_description and error_uri parameters and adds them to the error object", async () => {
  const error = await assertThrowsAsync(
    () =>
      getOAuth2Client().code.getToken(
        buildAccessTokenCallback({
          params: {
            error: "invalid_request",
            error_description: "Error description",
            error_uri: "error://uri",
          },
        }),
      ),
    OAuth2ResponseError,
    "Error description",
  ) as OAuth2ResponseError;
  assertEquals(error.error, "invalid_request");
  assertEquals(error.errorDescription, "Error description");
  assertEquals(error.errorUri, "error://uri");
});

Deno.test("AuthorizationCodeGrant.getToken throws if the callbackUri doesn't contain a code", async () => {
  await assertThrowsAsync(
    () =>
      getOAuth2Client().code.getToken(
        buildAccessTokenCallback({
          // some parameter has to be set or we'll get "URI does not contain callback parameters" instead
          params: { empty: "" } as any,
        }),
      ),
    AuthorizationResponseError,
    "Missing code, unable to request token",
  );
});

Deno.test("AuthorizationCodeGrant.getToken throws if it didn't receive a state and the state validator fails", async () => {
  await assertThrowsAsync(
    () =>
      getOAuth2Client().code.getToken(
        buildAccessTokenCallback({
          params: { code: "code" },
        }),
        { stateValidator: () => false },
      ),
    AuthorizationResponseError,
    "Missing state",
  );
});

Deno.test("AuthorizationCodeGrant.getToken throws if it didn't receive a state but a state was expected", async () => {
  await assertThrowsAsync(
    () =>
      getOAuth2Client().code.getToken(
        buildAccessTokenCallback({
          params: { code: "code" },
        }),
        { state: "expected_state" },
      ),
    AuthorizationResponseError,
    "Missing state",
  );
});

Deno.test("AuthorizationCodeGrant.getToken throws if it received a state that does not match the given state parameter", async () => {
  await assertThrowsAsync(
    () =>
      getOAuth2Client().code.getToken(
        buildAccessTokenCallback({
          params: { code: "code", state: "invalid_state" },
        }),
        { state: "expected_state" },
      ),
    AuthorizationResponseError,
    "Invalid state: invalid_state",
  );
});

Deno.test("AuthorizationCodeGrant.getToken throws if the stateValidator returns false", async () => {
  await assertThrowsAsync(
    () =>
      getOAuth2Client().code.getToken(
        buildAccessTokenCallback({
          params: { code: "code", state: "invalid_state" },
        }),
        { stateValidator: () => false },
      ),
    AuthorizationResponseError,
    "Invalid state: invalid_state",
  );
});

Deno.test("AuthorizationCodeGrant.getToken throws if the server responded with a Content-Type other than application/json", async () => {
  await assertThrowsAsync(
    () =>
      mockATResponse(
        () =>
          getOAuth2Client().code.getToken(buildAccessTokenCallback({
            params: { code: "authCode" },
          })),
        { body: "not json" },
      ),
    TokenResponseError,
    "Invalid token response: Response is not JSON encoded",
  );
});

Deno.test("AuthorizationCodeGrant.getToken throws if the server responded with a correctly formatted error", async () => {
  await assertThrowsAsync(
    () =>
      mockATResponse(
        () =>
          getOAuth2Client().code.getToken(buildAccessTokenCallback({
            params: { code: "authCode" },
          })),
        { status: 401, body: { error: "invalid_client" } },
      ),
    OAuth2ResponseError,
    "invalid_client",
  );
});

Deno.test("AuthorizationCodeGrant.getToken throws if the server responded with a 4xx or 5xx and the body doesn't contain an error parameter", async () => {
  await assertThrowsAsync(
    () =>
      mockATResponse(
        () =>
          getOAuth2Client().code.getToken(buildAccessTokenCallback({
            params: { code: "authCode" },
          })),
        { status: 401, body: {} },
      ),
    TokenResponseError,
    "Invalid token response: Server returned 401 and no error description was given",
  );
});

Deno.test("AuthorizationCodeGrant.getToken throws if the server's response is not a JSON object", async () => {
  await assertThrowsAsync(
    () =>
      mockATResponse(
        () =>
          getOAuth2Client().code.getToken(buildAccessTokenCallback({
            params: { code: "authCode" },
          })),
        { body: '""' },
      ),
    TokenResponseError,
    "Invalid token response: body is not a JSON object",
  );
  await assertThrowsAsync(
    () =>
      mockATResponse(
        () =>
          getOAuth2Client().code.getToken(buildAccessTokenCallback({
            params: { code: "authCode" },
          })),
        { body: '["array values?!!"]' },
      ),
    TokenResponseError,
    "Invalid token response: body is not a JSON object",
  );
});

Deno.test("AuthorizationCodeGrant.getToken throws if the server's response does not contain a token_type", async () => {
  await assertThrowsAsync(
    () =>
      mockATResponse(
        () =>
          getOAuth2Client().code.getToken(buildAccessTokenCallback({
            params: { code: "authCode" },
          })),
        { body: { access_token: "at" } },
      ),
    TokenResponseError,
    "Invalid token response: missing token_type",
  );
});

Deno.test("AuthorizationCodeGrant.getToken throws if the server response's token_type is not a string", async () => {
  await assertThrowsAsync(
    () =>
      mockATResponse(
        () =>
          getOAuth2Client().code.getToken(buildAccessTokenCallback({
            params: { code: "authCode" },
          })),
        {
          body: {
            access_token: "at",
            token_type: 1337 as any,
          },
        },
      ),
    TokenResponseError,
    "Invalid token response: token_type is not a string",
  );
});

Deno.test("AuthorizationCodeGrant.getToken throws if the server's response does not contain an access_token", async () => {
  await assertThrowsAsync(
    () =>
      mockATResponse(
        () =>
          getOAuth2Client().code.getToken(buildAccessTokenCallback({
            params: { code: "authCode" },
          })),
        { body: { token_type: "tt" } },
      ),
    TokenResponseError,
    "Invalid token response: missing access_token",
  );
});

Deno.test("AuthorizationCodeGrant.getToken throws if the server response's access_token is not a string", async () => {
  await assertThrowsAsync(
    () =>
      mockATResponse(
        () =>
          getOAuth2Client().code.getToken(buildAccessTokenCallback({
            params: { code: "authCode" },
          })),
        {
          body: {
            access_token: 1234 as any,
            token_type: "tt",
          },
        },
      ),
    TokenResponseError,
    "Invalid token response: access_token is not a string",
  );
});

Deno.test("AuthorizationCodeGrant.getToken throws if the server response's refresh_token property is not a string", async () => {
  await assertThrowsAsync(
    () =>
      mockATResponse(
        () =>
          getOAuth2Client().code.getToken(buildAccessTokenCallback({
            params: { code: "authCode" },
          })),
        {
          body: {
            access_token: "at",
            token_type: "tt",
            refresh_token: 123 as any,
          },
        },
      ),
    TokenResponseError,
    "Invalid token response: refresh_token is not a string",
  );
});

Deno.test("AuthorizationCodeGrant.getToken throws if the server response's expires_in property is not a number", async () => {
  await assertThrowsAsync(
    () =>
      mockATResponse(
        () =>
          getOAuth2Client().code.getToken(buildAccessTokenCallback({
            params: { code: "authCode" },
          })),
        {
          body: {
            access_token: "at",
            token_type: "tt",
            expires_in: { this: "is illegal" } as any,
          },
        },
      ),
    TokenResponseError,
    "Invalid token response: expires_in is not a number",
  );
});

Deno.test("AuthorizationCodeGrant.getToken throws if the server response's scope property is not a string", async () => {
  await assertThrowsAsync(
    () =>
      mockATResponse(
        () =>
          getOAuth2Client().code.getToken(buildAccessTokenCallback({
            params: { code: "authCode" },
          })),
        {
          body: {
            access_token: "at",
            token_type: "tt",
            scope: ["scope1", "scope2"] as any,
          },
        },
      ),
    TokenResponseError,
    "Invalid token response: scope is not a string",
  );
});

//#endregion

//#region AuthorizationCodeGrant.getToken successful paths

Deno.test("AuthorizationCodeGrant.getToken parses the minimal token response correctly", async () => {
  const { result } = await mockATResponse(
    () =>
      getOAuth2Client().code.getToken(buildAccessTokenCallback({
        params: { code: "authCode" },
      })),
    {
      body: {
        access_token: "accessToken",
        token_type: "tokenType",
      },
    },
  );
  assertEquals(result, {
    accessToken: "accessToken",
    tokenType: "tokenType",
  });
});

Deno.test("AuthorizationCodeGrant.getToken parses the full token response correctly", async () => {
  const { result } = await mockATResponse(
    () =>
      getOAuth2Client().code.getToken(buildAccessTokenCallback({
        params: { code: "authCode" },
      })),
    {
      body: {
        access_token: "accessToken",
        token_type: "tokenType",
        refresh_token: "refreshToken",
        expires_in: 3600,
        scope: "multiple scopes",
      },
    },
  );
  assertEquals(result, {
    accessToken: "accessToken",
    tokenType: "tokenType",
    refreshToken: "refreshToken",
    expiresIn: 3600,
    scope: ["multiple", "scopes"],
  });
});

Deno.test("AuthorizationCodeGrant.getToken doesn't throw if it didn't receive a state but the state validator returns true", async () => {
  await mockATResponse(
    () =>
      getOAuth2Client().code.getToken(
        buildAccessTokenCallback({
          params: { code: "code" },
        }),
        { stateValidator: () => true },
      ),
  );
});

Deno.test("AuthorizationCodeGrant.getToken builds a correct request to the token endpoint by default", async () => {
  const { request } = await mockATResponse(
    () =>
      getOAuth2Client().code.getToken(buildAccessTokenCallback({
        params: { code: "authCode" },
      })),
  );

  assertEquals(request.url, "https://auth.server/token");
  const body = await request.formData();
  assertEquals(body.get("grant_type"), "authorization_code");
  assertEquals(body.get("code"), "authCode");
  assertEquals(body.get("redirect_uri"), null);
  assertEquals(body.get("client_id"), "clientId");
  assertEquals(
    request.headers.get("Content-Type"),
    "application/x-www-form-urlencoded",
  );
});

Deno.test("AuthorizationCodeGrant.getToken correctly adds the redirectUri to the token request if specified", async () => {
  const { request } = await mockATResponse(
    () =>
      getOAuth2Client({
        redirectUri: "http://some.redirect/uri",
      }).code.getToken(buildAccessTokenCallback({
        baseUrl: "http://some.redirect/uri",
        params: { code: "authCode" },
      })),
  );
  assertEquals(
    (await request.formData()).get("redirect_uri"),
    "http://some.redirect/uri",
  );
});

Deno.test("AuthorizationCodeGrant.getToken sends the clientId as form parameter if no clientSecret is set", async () => {
  const { request } = await mockATResponse(
    () =>
      getOAuth2Client().code.getToken(buildAccessTokenCallback({
        params: { code: "authCode" },
      })),
  );
  assertEquals(
    (await request.formData()).get("client_id"),
    "clientId",
  );
  assertEquals(request.headers.get("Authorization"), null);
});

Deno.test("AuthorizationCodeGrant.getToken sends the correct Authorization header if the clientSecret is set", async () => {
  const { request } = await mockATResponse(
    () =>
      getOAuth2Client({ clientSecret: "super-secret" }).code.getToken(
        buildAccessTokenCallback({
          params: { code: "authCode" },
        }),
      ),
  );
  assertEquals(
    request.headers.get("Authorization"),
    "Basic Y2xpZW50SWQ6c3VwZXItc2VjcmV0",
  );
  assertEquals((await request.formData()).get("client_id"), null);
});

Deno.test("AuthorizationCodeGrant.getToken uses the default request options", async () => {
  const { request } = await mockATResponse(
    () =>
      getOAuth2Client({
        defaults: {
          requestOptions: {
            headers: {
              "User-Agent": "Custom User Agent",
              "Content-Type": "application/json",
            },
            urlParams: { "custom-url-param": "value" },
            body: { "custom-body-param": "value" },
          },
        },
      }).code.getToken(buildAccessTokenCallback({
        params: { code: "authCode" },
      })),
  );
  const url = new URL(request.url);
  assertEquals(url.searchParams.getAll("custom-url-param"), ["value"]);
  assertEquals(request.headers.get("Content-Type"), "application/json");
  assertEquals(request.headers.get("User-Agent"), "Custom User Agent");
  assertMatch(await request.text(), /.*custom-body-param=value.*/);
});

Deno.test("AuthorizationCodeGrant.getToken uses the passed request options over the default options", async () => {
  const { request } = await mockATResponse(
    () =>
      getOAuth2Client({
        defaults: {
          requestOptions: {
            headers: {
              "User-Agent": "Custom User Agent",
              "Content-Type": "application/json",
            },
            urlParams: { "custom-url-param": "value" },
            body: { "custom-body-param": "value" },
          },
        },
      }).code.getToken(
        buildAccessTokenCallback({
          params: { code: "authCode" },
        }),
        {
          requestOptions: {
            headers: { "Content-Type": "text/plain" },
            urlParams: { "custom-url-param": "other_value" },
            body: { "custom-body-param": "other_value" },
          },
        },
      ),
  );
  const url = new URL(request.url);
  assertEquals(url.searchParams.getAll("custom-url-param"), ["other_value"]);
  assertEquals(request.headers.get("Content-Type"), "text/plain");
  assertEquals(request.headers.get("User-Agent"), "Custom User Agent");

  const requestText = await request.text()
  assertMatch(requestText, /.*custom-body-param=other_value.*/);
  assertNotMatch(requestText, /.*custom-body-param=value.*/);
});

Deno.test("AuthorizationCodeGrant.getToken uses the default state validator if no state or validator was given", async () => {
  const defaultValidator = spy(() => true);

  await mockATResponse(
    () =>
      getOAuth2Client({
        defaults: { stateValidator: defaultValidator },
      }).code.getToken(buildAccessTokenCallback({
        params: { code: "authCode", state: "some_state" },
      })),
  );

  assertEquals(
    defaultValidator.calls,
    [{ args: ["some_state"], returned: true }],
  );
});

Deno.test("AuthorizationCodeGrant.getToken uses the passed state validator over the default validator", async () => {
  const defaultValidator = spy(() => true);
  const validator = spy(() => true);

  await mockATResponse(
    () =>
      getOAuth2Client({
        defaults: { stateValidator: defaultValidator },
      }).code.getToken(
        buildAccessTokenCallback({
          params: { code: "authCode", state: "some_state" },
        }),
        { stateValidator: validator },
      ),
  );

  assertEquals(defaultValidator.calls, []);
  assertEquals(validator.calls, [{ args: ["some_state"], returned: true }]);
});

Deno.test("AuthorizationCodeGrant.getToken uses the passed state validator over the passed state", async () => {
  const defaultValidator = spy(() => true);
  const validator = spy(() => true);

  await mockATResponse(
    () =>
      getOAuth2Client({
        defaults: { stateValidator: defaultValidator },
      }).code.getToken(
        buildAccessTokenCallback({
          params: { code: "authCode", state: "some_state" },
        }),
        { stateValidator: validator, state: "other_state" },
      ),
  );

  assertEquals(defaultValidator.calls, []);
  assertEquals(validator.calls, [{ args: ["some_state"], returned: true }]);
});

//#endregion
//#endregion

//#region Utility test functions

function assertMatchesUrl(test: URL, expectedUrl: string | URL): void {
  const expected = expectedUrl instanceof URL
    ? expectedUrl
    : new URL(expectedUrl);

  assertEquals(test.origin, expected.origin);
  assertEquals(test.pathname, expected.pathname);
  assertEquals(test.hash, expected.hash);

  const testParams = [...test.searchParams.entries()].sort(([a], [b]) =>
    a > b ? 1 : a < b ? -1 : 0
  );
  const expectedParams = [...expected.searchParams.entries()].sort(([a], [b]) =>
    a > b ? 1 : a < b ? -1 : 0
  );
  assertEquals(testParams, expectedParams);
}

//#endregion
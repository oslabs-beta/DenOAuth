import { assertEquals } from "https://deno.land/std@0.71.0/testing/asserts.ts";
import { getOAuth2Client, mockATResponse } from "./test_utils.ts";

Deno.test("RefreshTokenGrant.refresh works without optional options", async () => {
  const client = getOAuth2Client();
  const { request, result } = await mockATResponse(
    () => client.refreshToken.refresh("refreshToken"),
    {
      body: {
        access_token: "at",
        token_type: "tt",
        refresh_token: "rt",
        expires_in: 1234,
      },
    },
  );

  assertEquals(request.method, "POST");
  assertEquals(request.url, "https://auth.server/token");
  const requestBody = new URLSearchParams(await request.text());
  assertEquals(requestBody.get("grant_type"), "refresh_token");
  assertEquals(requestBody.get("refresh_token"), "refreshToken");
  assertEquals(requestBody.get("scope"), null);

  assertEquals(result.accessToken, "at");
  assertEquals(result.tokenType, "tt");
  assertEquals(result.refreshToken, "rt");
  assertEquals(result.expiresIn, 1234);
});

Deno.test("RefreshTokenGrant.refresh works when overriding the HTTP method", async () => {
  const client = getOAuth2Client();
  const { request } = await mockATResponse(
    () =>
      client.refreshToken.refresh(
        "refreshToken",
        { requestOptions: { method: "GET" } },
      ),
    {
      body: {
        access_token: "at",
        token_type: "tt",
      },
    },
  );

  assertEquals(request.method, "GET");
});

Deno.test("RefreshTokenGrant.refresh works when requesting a single scope", async () => {
  const client = getOAuth2Client();
  const { request } = await mockATResponse(
    () => client.refreshToken.refresh("refreshToken", { scope: "test" }),
    {
      body: {
        access_token: "at",
        token_type: "tt",
      },
    },
  );

  assertEquals(new URLSearchParams(await request.text()).get("scope"), "test");
});

Deno.test("RefreshTokenGrant.refresh works when requesting multiple scopes", async () => {
  const client = getOAuth2Client();
  const { request } = await mockATResponse(
    () =>
      client.refreshToken.refresh(
        "refreshToken",
        { scope: ["multiple", "scopes"] },
      ),
    {
      body: {
        access_token: "at",
        token_type: "tt",
      },
    },
  );

  assertEquals(
    new URLSearchParams(await request.text()).get("scope"),
    "multiple scopes",
  );
});

Deno.test("RefreshTokenGrant.refresh adds the Authorization header when a clientSecret is set", async () => {
  const client = getOAuth2Client({ clientSecret: "secret" });
  const { request } = await mockATResponse(
    () => client.refreshToken.refresh("refreshToken", { scope: "test" }),
    {
      body: {
        access_token: "at",
        token_type: "tt",
      },
    },
  );

  assertEquals(
    request.headers.get("Authorization"),
    "Basic Y2xpZW50SWQ6c2VjcmV0",
  );
});
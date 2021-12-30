import { stub } from "https://deno.land/x/mock@v0.9.5/mod.ts";
import { OAuth2Client, OAuth2ClientConfig } from "./oauth2_client.ts";
import { Tokens } from "./types.ts";

export function getOAuth2Client(
  overrideConfig: Partial<OAuth2ClientConfig> = {},
) {
  return new OAuth2Client({
    clientId: "clientId",
    authorizationEndpointUri: "https://auth.server/auth",
    tokenUri: "https://auth.server/token",
    ...overrideConfig,
  });
}

export interface AccessTokenCallbackSuccess {
  code?: string;
  state?: string;
}

export interface AccessTokenCallbackError {
  error?: string;
  "error_description"?: string;
  "error_uri"?: string;
  state?: string;
}

interface AccessTokenErrorResponse {
  error: string;
  "error_description"?: string;
  "error_uri"?: string;
}

interface AccessTokenResponse {
  "access_token": string;
  "token_type": string;
  "expires_in"?: number;
  "refresh_token"?: string;
  scope?: string;
}

interface MockAccessTokenResponse {
  status?: number;
  headers?: { [key: string]: string };
  body?: Partial<AccessTokenResponse | AccessTokenErrorResponse> | string;
}

interface MockAccessTokenResponseResult {
  request: Request;
  result: Tokens;
}

export async function mockATResponse(
  request: (() => Promise<Tokens>),
  response?: MockAccessTokenResponse,
): Promise<MockAccessTokenResponseResult> {
  const fetchStub = stub(window, "fetch");
  try {
    const body = typeof response?.body === "string"
      ? response?.body
      : JSON.stringify(
        response?.body ?? { access_token: "at", token_type: "tt" },
      );

    const headers = new Headers(
      response?.headers ?? { "Content-Type": "application/json" },
    );

    const status = response?.status ?? 200;

    fetchStub.returns = [
      Promise.resolve(new Response(body, { headers, status })),
    ];

    const result = await request();
    const req = fetchStub.calls[0].args[0] as Request;

    return { request: req, result };
  } finally {
    fetchStub.restore();
  }
}

interface AccessTokenCallbackOptions {
  baseUrl?: string;
  params?: AccessTokenCallbackSuccess | AccessTokenCallbackError;
}

export function buildAccessTokenCallback(
  options: AccessTokenCallbackOptions = {},
) {
  const base = options.baseUrl ?? "https://example.app/callback";
  return new URL(
    `?${new URLSearchParams((options.params ?? {}) as Record<string, string>)}`,
    base,
  );
}
import {
  assertEquals,
} from "https://deno.land/std@0.71.0/testing/asserts.ts";

import { OAuth2Client, OAuth2ClientConfig } from "./oauth2_client.ts";
import { OAuth2GrantBase } from "./grant_base.ts";
import { RequestOptions } from "./types.ts";

class OAuth2Grant extends OAuth2GrantBase {
  public buildRequest(
    baseUrl: string | URL,
    options: RequestOptions,
    overrideOptions: RequestOptions = {},
  ): Request {
    return super.buildRequest(baseUrl, options, overrideOptions);
  }
}

function getGrantBase(overrideConfig: Partial<OAuth2ClientConfig> = {}) {
  return new OAuth2Grant(
    new OAuth2Client({
      clientId: "clientId",
      authorizationEndpointUri: "https://auth.server/auth",
      tokenUri: "https://auth.server/token",
      ...overrideConfig,
    }),
  );
}

Deno.test("OAuth2GrantBase.buildRequest works without optional parameters", async () => {
  const req = getGrantBase().buildRequest("https://auth.server/req", {});

  assertEquals(await req.text(), "");
  assertEquals(
    [...req.headers],
    [["content-type", "application/x-www-form-urlencoded"]],
  );
  assertEquals(req.method, "GET");
  assertEquals(req.url, "https://auth.server/req");
});

Deno.test("OAuth2GrantBase.buildRequest works with overrideOptions set", async () => {
  const req = getGrantBase({
    defaults: {
      requestOptions: {
        body: {
          default1: "default",
          default2: "default",
          default3: "default",
        },
        headers: {
          "default-header1": "default",
          "default-header2": "default",
          "default-header3": "default",
        },
        urlParams: {
          "defaultParam1": "default",
          "defaultParam2": "default",
          "defaultParam3": "default",
        },
      },
    },
  }).buildRequest("https://auth.server/req", {
    body: {
      default2: "request",
      default3: "request",
      request1: "request",
      request2: "request",
    },
    headers: {
      "default-header2": "request",
      "default-header3": "request",
      "request-header1": "request",
      "request-header2": "request",
    },
    method: "POST",
    urlParams: {
      defaultParam2: "request",
      defaultParam3: "request",
      requestParam1: "request",
      requestParam2: "request",
    },
  }, {
    body: {
      default3: "override",
      request2: "override",
      override1: "override",
    },
    headers: {
      "default-header3": "override",
      "request-header2": "override",
      "override-header1": "override",
    },
    method: "DELETE",
    urlParams: {
      defaultParam3: "override",
      requestParam2: "override",
      overrideParam1: "override",
    },
  });

  const formData = new URLSearchParams(await req.text());
  assertEquals(formData.get("default1"), "default");
  assertEquals(formData.get("default2"), "request");
  assertEquals(formData.get("default3"), "override");
  assertEquals(formData.get("request1"), "request");
  assertEquals(formData.get("request2"), "override");
  assertEquals(formData.get("override1"), "override");

  assertEquals(
    req.headers.get("Content-Type"),
    "application/x-www-form-urlencoded",
  );
  assertEquals(req.headers.get("default-header1"), "default");
  assertEquals(req.headers.get("default-header2"), "request");
  assertEquals(req.headers.get("default-header3"), "override");
  assertEquals(req.headers.get("request-header1"), "request");
  assertEquals(req.headers.get("request-header2"), "override");
  assertEquals(req.headers.get("override-header1"), "override");

  assertEquals(req.method, "DELETE");

  assertEquals(
    req.url,
    [
      "https://auth.server/req?",
      "defaultParam1=default&defaultParam2=request&defaultParam3=override&",
      "requestParam1=request&requestParam2=override&",
      "overrideParam1=override",
    ].join(""),
  );
});
import type { OAuth2Client } from "./oauth2_client.ts";
import { AuthorizationResponseError, OAuth2ResponseError } from "./errors.ts";
import { RequestOptions, Tokens } from "./types.ts";
import { OAuth2GrantBase } from "./grant_base.ts";

export interface GetUriOptions {
  /**
   * State parameter to send along with the authorization request.
   *
   * see https://tools.ietf.org/html/rfc6749#section-4.1.1
   */
  state?: string;
  /**
   * Scopes to request with the authorization request.
   *
   * If an array is passed, it is concatinated using spaces as per
   * https://tools.ietf.org/html/rfc6749#section-3.3
   */
  scope?: string | string[];
}

export interface GetTokenOptions {
  /**
   * The state parameter expected to be returned by the authorization response.
   *
   * Usually you'd store the state you sent with the authorization request in the
   * user's session so you can pass it here.
   * If it could be one of many states or you want to run some custom verification
   * logic, use the `stateValidator` parameter instead.
   */
  state?: string;
  /**
   * The state validator used to verify that the received state is valid.
   *
   * The option object's state value is ignored when a stateValidator is passed.
   */
  stateValidator?: (state: string | null) => boolean;
  /** Request options used when making the access token request. */
  requestOptions?: RequestOptions;
}

/**
 * Implements the OAuth 2.0 authorization code grant.
 *
 * See https://tools.ietf.org/html/rfc6749#section-4.1
 */
export class AuthorizationCodeGrant extends OAuth2GrantBase {
  constructor(client: OAuth2Client) {
    super(client);
  }

  /** Builds a URI you can redirect a user to to make the authorization request. */
  public getAuthorizationUri(options: GetUriOptions = {}): URL {
    const params = new URLSearchParams();
    params.set("client_id", this.client.config.clientId);
    if (typeof this.client.config.responseType === "string") {
      params.set("response_type", this.client.config.responseType);
    } else {
      params.set("response_type", "code");
    }
    if (typeof this.client.config.redirectUri === "string") {
      params.set("redirect_uri", this.client.config.redirectUri);
    }
    if (typeof this.client.config.includeGrantedScopes === "string") {
      params.set("include_granted_scopes", this.client.config.includeGrantedScopes);
    }
    if (typeof this.client.config.tenant === "string") {
      params.set("tenant", this.client.config.tenant);
    }
    if (typeof this.client.config.codeChallenge === "string") {
      params.set("code_challenge", this.client.config.codeChallenge);
    }
    if (typeof this.client.config.codeChallengeMethod === "string") {
      params.set("code_challenge_method", this.client.config.codeChallengeMethod);
    }
    if (typeof this.client.config.responseMode === "string") {
      params.set("response_mode", this.client.config.responseMode);
    }

    if (options.state) {
      params.set("state", options.state);
    }
    const scope = options.scope ?? this.client.config.defaults?.scope;
    if (scope) {
      params.set("scope", Array.isArray(scope) ? scope.join(" ") : scope);
    }
    return new URL(`?${params}`, this.client.config.authorizationEndpointUri);
  }

  /**
   * Parses the authorization response request tokens from the authorization server.
   *
   * Usually you'd want to call this method in the function that handles the user's request to your configured redirectUri.
   * @param authResponseUri The complete URI the user got redirected to by the authorization server after making the authorization request.
   *     Must include all received URL parameters.
   */
  public async getToken(
    authResponseUri: string | URL,
    options: GetTokenOptions = {},
  ): Promise<Tokens> {
    const validated = this.validateAuthorizationResponse(
      this.toUrl(authResponseUri),
      options,
    );

    const request = this.buildAccessTokenRequest(
      validated.code,
      options.requestOptions,
    );

    const accessTokenResponse = await fetch(request);

    return this.parseTokenResponse(accessTokenResponse);
  }

  private validateAuthorizationResponse(
    url: URL,
    options: GetTokenOptions,
  ): { code: string; state?: string } {
    if (typeof this.client.config.redirectUri === "string") {
      const expectedUrl = new URL(this.client.config.redirectUri);

      if (
        typeof url.pathname === "string" &&
        url.pathname !== expectedUrl.pathname
      ) {
        throw new AuthorizationResponseError(
          `Redirect path should match configured path, but got: ${url.pathname}`,
        );
      }
    }

    if (!url.search || !url.search.substr(1)) {
      throw new AuthorizationResponseError(
        `URI does not contain callback parameters: ${url}`,
      );
    }

    const params = new URLSearchParams(url.search || "");

    if (params.get("error") !== null) {
      throw OAuth2ResponseError.fromURLSearchParams(params);
    }

    const code = params.get("code") || "";
    if (!code) {
      throw new AuthorizationResponseError(
        "Missing code, unable to request token",
      );
    }

    const state = params.get("state");
    const stateValidator = options.stateValidator ||
      (options.state && ((s) => s === options.state)) ||
      this.client.config.defaults?.stateValidator;

    if (stateValidator && !stateValidator(state)) {
      if (state === null) {
        throw new AuthorizationResponseError("Missing state");
      } else {
        throw new AuthorizationResponseError(
          `Invalid state: ${params.get("state")}`,
        );
      }
    }

    if (state) {
      return { code, state };
    }
    return { code };
  }

  private buildAccessTokenRequest(
    code: string,
    requestOptions: RequestOptions = {},
  ): Request {
    const body: Record<string, string> = {
      "grant_type": "authorization_code",
      code,
    };
    const headers: Record<string, string> = {
      "Accept": "application/json",
      "content-type": "application/x-www-form-urlencoded",
    };

    if (typeof this.client.config.redirectUri === "string") {
      body.redirect_uri = this.client.config.redirectUri;
    }

    if (typeof this.client.config.clientSecret === "string") {
      // We have a client secret, authenticate using HTTP Basic Auth as described in RFC6749 Section 2.3.1.
      const { clientId, clientSecret } = this.client.config;
      headers.Authorization = `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
    } else {
      // This appears to be a public client, include the client ID along in the body
      body.client_id = this.client.config.clientId;
    }

    return this.buildRequest(this.client.config.tokenUri, {
      method: "POST",
      headers,
      body,
    }, requestOptions);
  }
}
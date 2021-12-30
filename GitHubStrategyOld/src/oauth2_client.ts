import { AuthorizationCodeGrant } from "./authorization_code_grant.ts";
import { RefreshTokenGrant } from "./refresh_token_grant.ts";
import { RequestOptions } from "./types.ts";
import { ResourceGrant } from "./resource_grant.ts"

export interface OAuth2ClientConfig {
  /** The client ID provided by the authorization server. */
  clientId: string;
  /** The client secret provided by the authorization server, if using a confidential client. */
  clientSecret?: string;
  /** The URI of the client's redirection endpoint (sometimes also called callback URI). */
  redirectUri?: string;
  /** Must include code for the authorization code flow. 
   * Can also include id_token or token if using the hybrid flow.*/
  responseType?: string;

  /** The URI of the authorization server's authorization endpoint. */
  authorizationEndpointUri: string;

  /** The URI of the authorization server's token endpoint. */
  tokenUri: string;

  /** The base URI of the resource server. */
  resourceEndpointHost?: string;

  /** To enable applications to use incremental authorization to request access to additional scopes in context.
   * If you set this parameter's value to true and the authorization request is granted, 
   * then the new access token will also cover any scopes to which the user previously granted the application access. */
  includeGrantedScopes?: string;

  /** The {tenant} value in the path of the request can be used to control who can sign into the application. 
   * The allowed values are common, organizations, consumers, and tenant identifiers. */
  tenant?: string;

  /** Used to secure authorization code grants via Proof Key for Code Exchange (PKCE).
   * Required if code_challenge_method is included. For more information, see the PKCE RFC. */
  codeChallenge?: string;

  /** Used to secure authorization code grants via Proof Key for Code Exchange (PKCE). 
   * Required if code_challenge_method is included. For more information, see the PKCE RFC. */
  codeChallengeMethod?: string;

  /** Specifies the method that should be used to send the resulting token back to your app.
   * "query" provides the code as a query string parameter on your redirect URI. 
   * If you're requesting an ID token using the implicit flow, you can't use query as specified in the OpenID spec.
   * If you're requesting just the code, you can use query, "fragment", or "form_post". 
   * "form_post" executes a POST containing the code to your redirect URI. */
  responseMode?: string;

  defaults?: {
    /**
     * Default request options to use when performing outgoing HTTP requests.
     *
     * For example used when exchanging authorization codes for access tokens.
     */
    requestOptions?: Omit<RequestOptions, "method">;
    /** Default scopes to request unless otherwise specified. */
    scope?: string | string[];
    /** Default state validator to use for validating the authorization response's state value. */
    stateValidator?: (state: string | null) => boolean;  
  };
}

export class OAuth2Client {
  /**
   * Implements the Authorization Code Grant.
   *
   * See RFC6749, section 4.1.
   */
  public code = new AuthorizationCodeGrant(this);

  /**
   * Access resources from resource server.
   */
  public resource = new ResourceGrant(this);

  /**
   * Implements the Refresh Token Grant.
   * 
   * See RFC6749, section 6.
   */
  public refreshToken = new RefreshTokenGrant(this);

  constructor(
    public readonly config: Readonly<OAuth2ClientConfig>,
  ) {}
}
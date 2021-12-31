import { LinkedInStrategy } from './linkedInAuth.ts';
import { RequestOptions } from './types.ts';


export interface LinkedInClientConfig {
  /** The client ID provided by the authorization server. */
  clientId: string;
  /** The client secret provided by the authorization server, if using a confidential client. */
  clientSecret: string;
  /** The URI of the client's redirection endpoint (sometimes also called callback URI). */
  redirect: string;
  /** The URI of the authorization server's token endpoint. */
  tokenUri: string;

  defaults?: {
    /**
     * Default request options to use when performing outgoing HTTP requests.
     *
     * For example used when exchanging authorization codes for access tokens.
     */
    /** The URI of the authorization server's authorization endpoint. */
    authorizationEndpointUri: string;

    requestOptions?: Omit<RequestOptions, "method">;
    /** Default scopes to request unless otherwise specified. */
    // Our implementation currently only works with scope set to 'r_liteprofile' 
    scope: string | string[];
    /** Default state validator to use for validating the authorization response's state value. */
    stateValidator?: (state: string | null) => boolean;
  };
}

/**
 * include createLink params as part of the interface,
 * then in the class: passing in the necessary info (clientId, state, etc)
 * LOAUTHOne(or equivalent), when redirecting the URI, should call createLink, and then the link returned is the redirect
 */

export class LinkedInClient {
  // implements all the methods required to complete OAuth process
  public code = new LinkedInStrategy(this)

  // interface values cannot be changed outside of class
  constructor(
    public readonly config: Readonly<LinkedInClientConfig>,
  ) {}
}
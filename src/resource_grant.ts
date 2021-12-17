import type { OAuth2Client } from "./oauth2_client.ts";
import { OAuth2GrantBase } from "./grant_base.ts";
import { HttpVerb, RequestOptions } from "./types.ts";
import { ResourceResponseError } from "./errors.ts";

export class ResourceGrant extends OAuth2GrantBase {
    constructor(client: OAuth2Client) {
        super(client);
      };

    public async serverResponse(
    method: HttpVerb,
    resourcePath: string,
    token: string,
    requestOptions?: RequestOptions) {
        const headers: Record<string, string> = {
            "Authorization": `Bearer ${token}`,
            "content-type": "application/json",
        };
        const resourceUrl: string = (resourcePath.startsWith('https://')) ? 
            resourcePath : 
            this.client.config.resourceEndpointHost + resourcePath;
        const request = this.buildRequest(resourceUrl, {
            method,
            headers
        }, requestOptions);
        const response = await fetch(request);
        if (!response.ok) {
            console.log(new ResourceResponseError(`{ status: ${response.status}, statusText: ${response.statusText}, url: ${resourceUrl}, method: ${method}, tokenLength: ${token.length} }`, response))
        }
        return response
    }
}
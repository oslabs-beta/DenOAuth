import { DiscordClient } from './Discord_client.ts';

export abstract class DiscordGrant {
	constructor(
	protected readonly client: DiscordClient
  ) {}
}

export class DiscordStrategy extends DiscordGrant {
  constructor(
    client: DiscordClient
  ) {
    super(client);
  }

  // SampleLink: string = 'https://discord.com/api/oauth2/authorize?response_type=code&client_id={your_clientId}&scope={your_encoded_scope}&state={state}&redirect_uri={your_redirect_uri}'

  // part 1 of DenOAuth strategy
  /** Builds a URI you can redirect a user to to make the authorization request. */
  createLink() {
    // The primary reason for using the state parameter is to mitigate CSRF attacks by using a unique and non-guessable value associated with each authentication request about to be initiated.
    const state:number = Math.floor(Math.random() * 1000000000);
    const encodeLink:string = encodeURIComponent(this.client.config.redirect);
    const encodeScope:any = encodeURIComponent(this.client.config.scope)
    const SampleLink = `https://discord.com/api/oauth2/authorize?response_type=code&client_id=${this.client.config.clientId}&scope=${encodeScope}&state=${state}&redirect_uri=${encodeLink}`;
    return SampleLink;
  }


   // part 2 of DenOAuth strategy
  async processAuth(stringPathName:any) {
   /** Parses the authorization response request tokens from the authorization server. */
    const code: string = JSON.stringify(stringPathName.search) 
    console.log(`code ${code}`)
    const parsedCode:string = code.slice(code.indexOf('"?code=')+7, code.indexOf('&state'))
    console.log(`parsedCode ${parsedCode}`)
    const userResponse:unknown[] = [];
    
   /** Exchange the authorization code for an access token */
   await fetch('https://discord.com/api/oauth2/token',{
        method: 'POST',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        body: new URLSearchParams({
          'grant_type': "authorization_code",
          'code': parsedCode,
          'redirect_uri': this.client.config.redirect,
          'client_id': this.client.config.clientId,
          'client_secret': this.client.config.clientSecret
        })
      })
      .then((response: any) => {
        console.log(response)
        return response.text()
      })
      .then( async (paramsString: any) => {
        const params = new URLSearchParams(paramsString)
        console.log(params);
        const tokenKey = [];
    
        for (const [key, value] of params.entries()){
          tokenKey.push(key, value)
        }
        console.log(tokenKey[0])
        const obj: any = tokenKey[0]
        const values: unknown[] = Object.values(obj)
        console.log(values)
    
        const tokenArr: unknown[] = []
        let i = 18;
        while (values[i] !== '"') {
          tokenArr.push(values[i])
          i++
        }
        const bearerToken = tokenArr.join('')

          /** Use the access token to make an authenticated API request */
          await fetch("http://discordapp.com/api/users/@me", {
                headers: {
                  Authorization: `Bearer ${bearerToken}`,
                },
              })
              .then(response => response.json())
              .then(data => {
                // Returning Discord Response Data in console for Client
                console.log(`Discord Response Data: ${data}`)
                userResponse.push(data)
              })
              .catch(console.error)
        }) 
        return userResponse[0];
    } 
}
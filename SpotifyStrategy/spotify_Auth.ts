import { SpotifyClient } from './spotify_client.ts';

export abstract class SpotifyGrant {
	constructor(
	protected readonly client: SpotifyClient
  ) {}
}

export class SpotifyStrategy extends SpotifyGrant {
  constructor(
    client: SpotifyClient
  ) {
    super(client);
  }

  // SampleLink: string = `https://accounts.spotify.com/authorize?client_id={clientId}&scope=user-read-private&response_type=code&redirect_uri={redirect}&state=${state}`

  // part 1 of DenOAuth strategy
  /** Builds a URI you can redirect a user to to make the authorization request. */
  createLink() {
    const state: number = Math.floor(Math.random() * 1000000000)  
    const SampleLink = `https://accounts.spotify.com/authorize?client_id=${this.client.config.clientId}&scope=${this.client.config.scope}&response_type=code&redirect_uri=${this.client.config.redirect}&state=${state}`;
    return SampleLink;
  }


   // part 2 of DenOAuth strategy
  async processAuth(stringPathName:any) {
   /** Parses the authorization response request tokens from the authorization server. */
    const code:string = JSON.stringify(stringPathName.search);
    const parsedCode:string = code.slice(code.indexOf('"?code=')+7, code.indexOf('&state')); 
    console.log(`parsedCode ${parsedCode}`)
    const userResponse:unknown[] = [];
    
   /** Exchange the authorization code for an access token */
   await fetch('https://accounts.spotify.com/api/token',{
    method: 'POST',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
    },
    body: new URLSearchParams({
      'grant_type': "authorization_code", // hard code
      'code': parsedCode, // helper function
      'redirect_uri': this.client.config.redirect, // Spotify uri
      'client_id': this.client.config.clientId, // provided by Spotify
      'client_secret': this.client.config.clientSecret //provided by Spotify
      })
    })
    .then((response) => {
        console.log(`response ${response}`)
      return response.text()
     })
    .then( async (paramsString: any) => {
      const params = new URLSearchParams(paramsString);
      console.log(`params ${params}`)
        const tokenKey = [];
        for (const [key, value] of params.entries()){
        tokenKey.push(key, value)
        }

        const obj:any = tokenKey[0];
        const values: unknown[] = Object.values(obj);
        const tokenArr: unknown[] = []
        let i = 17;
        while (values[i] !== '"') {
          tokenArr.push(values[i])
          i++
          }
          const bearerToken = await tokenArr.join('');
          console.log(`bearerToken ${bearerToken}`)
          /** Use the access token to make an authenticated API request */
          await fetch("https://api.spotify.com/v1/me", {
                headers: {
                  Authorization: `Bearer ${bearerToken}`,
                },
              })
              .then(response => response.json())
              .then(data => {
                // Returning Spotify Response Data in console for Client
                console.log(`Spotify Response Data: ${data}`)
                userResponse.push(data)
              })
              .catch(console.error)
        }) 
        return userResponse[0];
    } 
}
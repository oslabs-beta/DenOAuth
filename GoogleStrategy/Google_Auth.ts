import { GoogleClient } from './Google_client.ts';

export abstract class GoogleGrant {
	constructor(
	protected readonly client: GoogleClient
  ) {}
}

export class GoogleStrategy extends GoogleGrant {
  constructor(
    client: GoogleClient
  ) {
    super(client);
  }

// SampleLink: String = 'https://accounts.google.com/o/oauth2/v2/auth?scope=${https://mail.google.com&access_type=offline&include_granted_scopes=true}&response_type=code&state=${foobar}&redirect_uri=${your_encoded_redirectLink}&client_id=${your_clientId}
  
  // part 1 of DenOAuth strategy
  /** Builds a URI you can redirect a user to to make the authorization request. */
  createLink() {
    const state: number = Math.floor(Math.random() * 1000000000)
    const encodeLink: string = encodeURIComponent(this.client.config.redirect)
    const SampleLink = `https://accounts.google.com/o/oauth2/v2/auth?scope=${this.client.config.scope}&response_type=code&state=${state}&redirect_uri=${encodeLink}&client_id=${this.client.config.clientId}`
    return SampleLink
  }


   // part 2 of DenOAuth strategy
  async processAuth(stringPathName:any) {
    /** Parses the authorization response request tokens from the authorization server. */
    const code: string = JSON.stringify(stringPathName.search)
    const parsedCode = code.slice(code.indexOf('"?code=')+24, code.indexOf('&scope'))
    const userResponse: unknown[] = [];
     
    /** Exchange the authorization code for an access token */
    await fetch('https://accounts.google.com/o/oauth2/token',{
    method: 'POST',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
    },

    body: new URLSearchParams({
      'code': parsedCode,
      'client_id': this.client.config.clientId, //provided by Google
      'client_secret': this.client.config.clientSecret, //provided by Google
      'redirect_uri': this.client.config.redirect, //provided by Google
      'grant_type': "authorization_code", //must be hardcoded exactly
    })
   })
    .then((response) => {
     return response.text()
    })
    .then( async (paramsString:any) => {
      const params = new URLSearchParams(paramsString)
      const tokenKey = [];
      for (const [key, value] of params.entries()){
        
        tokenKey.push(key, value)
      }
      const obj:any = tokenKey[0]
      const values: unknown[] = Object.values(obj)
      const tokenArr:unknown[] = []
      let i = 21;
      while (values[i] !== '"') {
        tokenArr.push(values[i])
        i++
      }
      const bearerToken: string = tokenArr.join('')
 
           /** Use the access token to make an authenticated API request */
           await fetch("https://www.googleapis.com/drive/v2/files", {
                 headers: {
                   Authorization: `Bearer ${bearerToken}`,
                 },
           })
           .then(response => response.json())
           .then(data => {
           // Returning Google Response Data in console for Client
              console.log(`Google Response Data: ${data}`)
              userResponse.push(data)
           })
           .catch(console.error)
    }) 

  return userResponse[0];
  } 
 }
 
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

  
  // part 1
  /** Builds a URI you can redirect a user to to make the authorization request. */
  createLink() {
    const state: number = Math.floor(Math.random() * 1000000000)
    const encodeLink: any = encodeURIComponent(this.client.config.redirect)
    let SampleLink: String = `https://accounts.google.com/o/oauth2/v2/auth?scope=${this.client.config.scope}&response_type=code&state=${state}&redirect_uri=${encodeLink}&client_id=${this.client.config.clientId}`
    return SampleLink
  }


   // part 2
  async processAuth(stringPathName:string) {
    /**
    * Parses the authorization response request tokens from the authorization server.
    */
    const code: string = JSON.stringify(stringPathName.search)
    console.log(code)
    const parsedCode = code.slice(code.indexOf('"?code=')+24, code.indexOf('&scope'))
    const userResponse:any = [];
    console.log(`parsedCode ${parsedCode}`)
     
    /** Exchange the authorization code for an access token */
    await fetch('https://accounts.google.com/o/oauth2/token',{
    method: 'POST',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
    },

    body: new URLSearchParams({
      'code': parsedCode,
      'client_id': this.client.config.clientId,
      'client_secret': this.client.config.clientSecret,
      'redirect_uri': this.client.config.redirect,
      'grant_type': "authorization_code",
    })
   })
   .then((response: any) => {
    console.log(response)
    return response.text()
  })
  .then( async (paramsString: any) => {
    let params = new URLSearchParams(paramsString)
      console.log(`params ${params}`);
      let tokenKey = [];
      for (const [key, value] of params.entries()){
        
        tokenKey.push(key, value)
      }
      console.log(`tokenKey first element ${tokenKey[0]}`)
      let obj: any = tokenKey[0]
      let values = Object.values(obj)
      console.log(`values ${values}`)
      const tokenArr:any = []
      console.log(`tokenArr ${tokenArr}`)
      let i = 21;
      while (values[i] !== '"') {
        tokenArr.push(values[i])
        i++
      }
      const bearerToken = tokenArr.join('')
      console.log(`bearerToken ${bearerToken}`)
 
           /** Use the access token to make an authenticated API request */
           await fetch("https://www.googleapis.com/drive/v2/files", {
                 headers: {
                   Authorization: `Bearer ${bearerToken}`,
                 },
               })
               .then(response => response.json())
               .then(data => {
                 console.log(data)
                 userResponse.push(data)
               })
               .catch(console.error)
         }) 
         return userResponse[0];
     } 
 }
 
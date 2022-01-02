import { LinkedInClient } from './linkedIn_client.ts';

export abstract class LinkedInGrant {
	constructor(
	protected readonly client: LinkedInClient
) {}
}

export class LinkedInStrategy extends LinkedInGrant {
  constructor(
    // clientId: string,
    // clientSecret: string,
    // scope: string,
    // redirect: string
    client: LinkedInClient
  ) {
    super(client);
  }

// {clientId} = code;

  // const SampleLink: String = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id={your_client_id}&redirect_uri={your_callback_url}&state=foobar&scope=r_liteprofile%20r_emailaddress%20w_member_social`

  // hardcode in createLink
  createLink() {
    const state:number = Math.floor(Math.random() * 1000000000);
    const encode:string = encodeURIComponent(this.client.config.redirect);
    const SampleLink = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${this.client.config.clientId}&redirect_uri=${encode}&state=${state}&scope=${this.client.config.scope}`;
    return SampleLink;
  }

  // const newLink = createLink(clientId, redirect, scope)

  //part 1
  // const LOauthOne = async (ctx:any, next:any) => {
  ///////////////////// session stuff /////////////////
  // let sessionId: Number = Math.floor(Math.random() * 1000000000);
  // await client.connect()
  // await client.queryObject("INSERT INTO session(session_id) VALUES($1)", sessionId)
  // ctx.response.body = {
  //     message: 'success',
  //     data: ctx.response.redirect(`https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=8693ww7e9p6u3t&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fstore&state=foobar&scope=r_liteprofile`)
  // };

  //   ctx.response.body = {
  //     message: 'success',
  //     data: ctx.response.redirect(createLink())    
  //   };
  // }

  // const setBearerToken = async (bearToken: any) => {
  //   const userResponse = await fetch("https://api.linkedin.com/v2/me", {
  //     headers: {
  //       Authorization: `Bearer ${bearToken}`,
  //     },
  //   });
  //   const {localizedFirstName} = await userResponse.json()
  // }

   // part 2
   async findCode(stringPathName:string) {
    // const stringPathName: String = ctx.request.url;
    let bearerToken:string;
    const code:string = JSON.stringify(stringPathName.search);
    const parsedCode:string = code.slice(code.indexOf('"?code=')+7, code.indexOf('&state'));

   await fetch('https://www.linkedin.com/oauth/v2/accessToken',{
    method: 'POST',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
    },
    body: new URLSearchParams({
      'grant_type': "authorization_code", // hard code
      'code': parsedCode, // helper function
      'redirect_uri': this.client.config.redirect, // linkedin uri
      'client_id': this.client.config.clientId, // provided by linkedin
      'client_secret': this.client.config.clientSecret //provided by linkedin
      })
    })
    .then((response: any) => {
      return response.text()
     })
    .then( async (paramsString: any) => {
      const params = new URLSearchParams(paramsString);
        const tokenKey = [];
        for (const [key, value] of params.entries()){
        tokenKey.push(key, value)
        }

        const obj:any = tokenKey[0];
        const values = Object.values(obj);
        const tokenArr = []
        let i = 17;
        while (values[i] !== '"') {
          tokenArr.push(values[i])
          i++
          }
          bearerToken = await tokenArr.join('');
          console.log(`bearerToken: ${bearerToken}`)
          await fetch("https://api.linkedin.com/v2/me", {
                headers: {
                  Authorization: `Bearer ${bearerToken}`,
                },
              })
              .then(response => response.json())
              .then(data => console.log(data))
              .catch(console.error)
        })  
    } 
  }

// potentially part of LOAuthOne
// check if loggin in or out

// let sessionId: String;
// const sessionCheck = async (ctx:any, next:any) => {
//   const jwt = await ctx.cookies.get("jwt") || '' ;
//   if(jwt) {
//     await next()
//   } else {
//   const test = await ctx.cookies.get("test") || '';
//   console.log(test)
//   if (!test) {
//     ctx.response.body = 401;
//     ctx.response.body = {
//         message: 'unauthenticated',
//         data: ctx.response.redirect('./login')
//     };
//     return 
// }
//   const token = await client.queryObject(`SELECT * FROM session WHERE session_id = '${ test }'`)
//   if (!token){
//       ctx.response.body = 401;
//       ctx.response.body = {
//           message: 'unauthenticated',
//           data: ctx.response.redirect('./login')
//       } 
//   } 
//   await next();
//   return;
// }
// };  
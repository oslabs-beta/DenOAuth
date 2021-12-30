export default class LinkedInStrategy {




  // const SampleLink: String = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id={your_client_id}&redirect_uri={your_callback_url}&state=foobar&scope=r_liteprofile%20r_emailaddress%20w_member_social`

  // hardcode in createLink
  async createLink: Function = (cliendId:String, redirect:any, scope:String) => {
    const state: Number = Math.floor(Math.random() * 1000000000)
    const encode: String = encodeURIComponent(redirect)
    let SampleLink: String = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${cliendId}&redirect_uri=${encode}&state=${state}&scope=${scope}`
    return SampleLink
  }

  const newLink = createLink(clientId, redirect, scope)

  const setBearerToken = async (bearToken: any) => {
    const userResponse = await fetch("https://api.linkedin.com/v2/me", {
      headers: {
        Authorization: `Bearer ${bearToken}`,
      },
    });
    const {localizedFirstName} = await userResponse.json()
  }

  //part 1
  const LOauthOne = async (ctx:any, next:any) => {
  ///////////////////// session stuff /////////////////
  // let sessionId: Number = Math.floor(Math.random() * 1000000000);
  // await client.connect()
  // await client.queryObject("INSERT INTO session(session_id) VALUES($1)", sessionId)
  // ctx.response.body = {
  //     message: 'success',
  //     data: ctx.response.redirect(`https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=8693ww7e9p6u3t&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fstore&state=foobar&scope=r_liteprofile`)
  // };

    ctx.response.body = {
      message: 'success',
      data: ctx.response.redirect(newLink)    
    };
  }

  // part 2
  const findCode = async (ctx:any, next:any) => {
    const stringPathName: String = ctx.request.url;
  
    const code: String = JSON.stringify(stringPathName.search)
    const parsedCode = code.slice(code.indexOf('"?code=')+7, code.indexOf('&state'))

    const tokens = await fetch('https://www.linkedin.com/oauth/v2/accessToken',{
    method: 'POST',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
    },
    body: new URLSearchParams({
      'grant_type': "authorization_code", // hard code
      'code': parsedCode, // helper function
      'redirect_uri': redirect, // linkedin uri
      'client_id': clientId, // provided by linkedin
      'client_secret': clientSecret //provided by linkedin
    })
  })
  .then((response: any) => {
    return response.text()
  })
  .then((paramsString: any) => {
    let params = new URLSearchParams(paramsString)
      console.log(params);
      let tokenKey = [];
      for (const [key, value] of params.entries()){
      tokenKey.push(key, value)
      }

      let obj: any = tokenKey[0]
      let values = Object.values(obj)

      const tokenArr = []
      let i = 17;
      while (values[i] !== '"') {
          tokenArr.push(values[i])
         i++
        }
      const bearerToken = tokenArr.join('')

      setBearerToken(bearerToken)
  })
   return await next();
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
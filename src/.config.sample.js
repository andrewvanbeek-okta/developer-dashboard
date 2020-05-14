export default {
    colors: {
      default: "#344675",
      primary: "#42b883",
      info: "#1d8cf8",
      danger: "#fd5d93",
      teal: "#00d6b4",
      primaryGradient: ['rgba(76, 211, 150, 0.1)', 'rgba(53, 183, 125, 0)', 'rgba(119,52,169,0)'],
    },
    baseUrl: "{your_okta_base_url}",
    // social: {
    //   fb: "0oa12iotmlkXfacxG357"
    // },
    oidc: {
      clientId: '{vue app client ID}',
      issuer: '{austh_server full issuer url}',
      redirectUri: 'http://localhost:8080/implicit/callback',
      scopes: ['openid', 'profile', 'email'],
      testing: {
        disableHttpsCheck: true
      }
    }
  }
  
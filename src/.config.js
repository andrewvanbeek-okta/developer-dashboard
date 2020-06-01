export default {
    colors: {
      default: "#344675",
      primary: "#42b883",
      info: "#1d8cf8",
      danger: "#fd5d93",
      teal: "#00d6b4",
      primaryGradient: ['rgba(76, 211, 150, 0.1)', 'rgba(53, 183, 125, 0)', 'rgba(119,52,169,0)'],
    },
    baseUrl: "https://avb.oktapreview.com/",
    // social: {
    //   fb: "0oa12iotmlkXfacxG357"
    // },
    oidc: {
      clientId: '0oaq0i2rhg08X7rPz0h7',
      issuer: 'https://avb.oktapreview.com/oauth2/default',
      redirectUri: 'http://localhost:8080/implicit/callback',
      scopes: ['openid', 'profile', 'email'],
      testing: {
        disableHttpsCheck: true
      }
    }
  }
  
export default {
    colors: {
      default: "#344675",
      primary: "#42b883",
      info: "#1d8cf8",
      danger: "#fd5d93",
      teal: "#00d6b4",
      primaryGradient: ['rgba(76, 211, 150, 0.1)', 'rgba(53, 183, 125, 0)', 'rgba(119,52,169,0)'],
    },
    baseUrl: "https://pollardcorp.oktapreview.com/",
    // social: {
    //   fb: "0oa12iotmlkXfacxG357"
    // },
    oidc: {
      clientId: '0oar5mhdbdVNN9LDr0h7',
      issuer: 'https://pollardcorp.oktapreview.com/oauth2/ausr5uummxs0p44mY0h7',
      redirectUri: 'http://localhost:8080/implicit/callback',
      scope: 'openid profile email',
      testing: {
        disableHttpsCheck: true
      }
    }
  }
  
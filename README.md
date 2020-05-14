# developer-dashboard

![Video of Dev Dash](https://cdn.glitch.com/b3c3d929-d176-4f3c-8e82-bfdcad09277f%2F2020-03-17%2010.26.56.gif)

This application allows for users to register, sign in, and create OAuth service clients that can be used to retrieve tokens from your Okta Authorization Servers, and use those to hit custom APIs! It leverages OAuth for Okta APIs as well, so that the application is tightly scoped to only allow for the creation/deletion of these service applications themselves. Try generating an OAuth client and then using postman or any command-line tool to hit the https://developer.okta.com/docs/reference/api/oidc/#token endpoint in okta via the client credentials flow.

## Project setup
```
npm install
```
### Create a .env file and copy the keys from .env.sample.  Then go to your Okta to get the client Id, Issuer, org url and api token
```
touch .env
```
 
 If you don't already have an application configured in Okta,head to Applications > Create new App and specify "SPA" as the type. Remember to assign yourself the app as well.

### Run the following script to set up your org for O4O: (it's important that you only run this once)
```
node O4OScript.js
```

This script is necessary to create a backend service client to generate O4O tokens for the purposes of allowing our developer dashboard to hit Okta Lifecycle APIs with properly scoped tokens (i.e. only allowing the app to create/read clients). In order to do so, we are:
1. Generating a public/private RSA keypair, converting into JwKs 
2. Registering a client with those JwKs using the private_key_jwt method of authentication, storing the O4O client id in the .env file
3. Using the apps/{appid}/grants api to grant that client access to manage applications (to mint new clients)

More documentation on that entire process here: https://developer.okta.com/docs/guides/implement-oauth-for-okta/overview/ 

### It's important that you only run this script once.
 This script populates your .env file as well as local private keys for the project itself. If you need to run it again, make sure to do the following:
1. Delete up the .jwk, .pem files generated from the project directory, and clear the O4O_CLIENT_ID line from your env file
2. Remove the "DevDashboard-O4OClient" generated in your okta tenant

### We're ready to go! run the project
```
npm run start
```


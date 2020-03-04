var express = require('express');
var app = express();
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
var history = require('connect-history-api-fallback');
require('dotenv').config()
// Serve all the files in '/dist' directory

var bodyParser = require('body-parser')
var cors = require('cors')
const uuidv4 = require('uuid/v4');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

app.use(bodyParser.json());
app.use(cors())

var apiToken = process.env.API_TOKEN
var orgUrl = process.env.ORG_URL

console.log(apiToken)
console.log(orgUrl)

var headers = { 'postman-token': '2b14e38a-8e95-99b2-e685-9fc68f58bd22',
'cache-control': 'no-cache',
authorization: 'SSWS ' + apiToken,
'content-type': 'application/json',
accept: 'application/json' }
var request = require("request");

const okta = require('@okta/okta-sdk-nodejs');

const client = new okta.Client({
  orgUrl: orgUrl + '',
  token: apiToken
});

app.get("/developer-apps", function(req, res){
  var request = require('request');
  var user = req.query.user
  var options = {
    'method': 'GET',
    'url': orgUrl + '/oauth2/v1/clients?q=' + user,
    'headers': headers
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
    res.send(response.body)
  });
})



app.post("/developer-app", function(req, res){
  console.log(req.body.user)
  var clientId = uuidv4()
  var clientSecret = uuidv4()
  var client_data = {"client_id" : clientId, "client_secret": clientSecret}
  console.log(client_data)
  var application = {
    "name": "oidc_client",
    "label": req.body.user.preferred_username + clientId,
    "signOnMode": "OPENID_CONNECT",
    "credentials": {
      "oauthClient": {
        "client_id": clientId,
        "client_secret": clientSecret,
        "token_endpoint_auth_method": "client_secret_post"
      }
    },
    "settings": {
      "oauthClient": {
        "client_uri": "http://clientsecplaceholder.com?sec=" + clientSecret, //typically you would save the client secret in your own backend since Okta does expose the client secret but for demo purposes we manipulate it here
        "logo_uri": null,
        "response_types": [
          "token"
        ],
        "grant_types": [
          "client_credentials"
        ],
        "application_type": "service",
        "consent_method": "REQUIRED",
        "issuer_mode": "ORG_URL"
      }
    }
  }



  console.log(application)


  client.createApplication(application)
  .then(application => {
    res.send(application)
  }).catch(err => {
    console.log(err)
  })
})



app.listen(process.env.PORT || 8000, function () {
  console.log('Example app listening on port 8000!');
});

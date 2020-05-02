var express = require('express');
var app = express();
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
var history = require('connect-history-api-fallback');
require('dotenv').config()
const fs = require('fs');

// Serve all the files in '/dist' directory


var bodyParser = require('body-parser')
var cors = require('cors')
const uuidv4 = require('uuid/v4');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

app.use(bodyParser.json());
app.use(cors())

var apiToken = process.env.API_TOKEN
var orgUrl = process.env.ORG_URL

global.O4OToken = ""
var O4Oheaders = ""

var clientId = process.env.O4O_CLIENT_ID

var request = require("request");
const okta = require('@okta/okta-sdk-nodejs');

var pair = {
  public: fs.readFileSync('./.public.key', 'utf8'),
  private: fs.readFileSync('./.private.key','utf8')
};
var jwks = require('./.jwk.json');

const O4Oclient = new okta.Client({
  orgUrl: orgUrl,
  authorizationMode: 'PrivateKey',
  clientId: clientId,
  scopes: ['okta.users.read', 'okta.clients.manage', 'okta.clients.read', 'okta.clients.register', 'okta.apps.manage'],
  privateKey: jwks,
  token: 'faketoken',
});


  app.get("/developer-apps", function(req, res){
    var request = require('request');
    console.log(jwks);
    if (O4OToken == "") {
      const njwt = require('njwt');
      const now = Math.floor( new Date().getTime() / 1000 ); // seconds since epoch
      const plus5Minutes = new Date( ( now + (5*60) ) * 1000); // Date object
      const claims = {
        aud: orgUrl + "/oauth2/v1/token",
        cid: clientId,
      };
  
      const jwt = njwt.create(claims, pair.private, 'RS256')
        .setIssuedAt(now)
        .setExpiration(plus5Minutes)
        .setIssuer(clientId)
        .setSubject(clientId)
        .compact();
      
        var options = {
          'method': 'POST',
          'url': orgUrl + '/oauth2/v1/token',
          'headers': {
            'Accept': 'application/json',
            'content-type': 'application/x-www-form-urlencoded',
            'cache-control': ' no-cache'
          },
          form: {
            'grant_type': 'client_credentials',
            'scope': 'okta.users.read okta.clients.manage okta.clients.read okta.clients.register',
            'client_assertion_type': 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
            'client_assertion': jwt
          }
        };

        request(options, function (error, response) { 
          if (error) throw new Error(error);
          var O4OResponse = JSON.parse(response.body)
          O4OToken = O4OResponse.access_token;
          O4Oheaders = {
            'cache-control': 'no-cache',
            authorization: 'Bearer ' + O4OToken,
            'content-type': 'application/json',
            accept: 'application/json' 
          }

          //////

          var user = req.query.user
          
          var options = {
            'method': 'GET',
            'url': orgUrl + '/oauth2/v1/clients?q=' + user,
            'headers': O4Oheaders
          };
          
          request(options, function (error, response) {
            if (error) console.log(error);
            res.send(response.body)
          });
        });
    } else {
      console.log("O4OHeaders have been set");
      var user = req.query.user
          
      var options = {
        'method': 'GET',
        'url': orgUrl + '/oauth2/v1/clients?q=' + user,
        'headers': O4Oheaders
      };
      
      request(options, function (error, response) {
        if (error) console.log(error);
        res.send(response.body)
      });
    }
  })


  app.post("/developer-app", function(req, res){
    console.log(req.body.user)
    var clientId = uuidv4()
    var clientSecret = uuidv4()
    var client_data = {"client_id" : clientId, "client_secret": clientSecret}
   // console.log(client_data)
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

    O4Oclient.createApplication(application)
    .then(application => {
      console.log("created new app")
      res.send(application)
    }).catch(err => {
      console.log(err)
    })
  })

  app.post("/newSecret", function(req, res){
    console.log(req.body.client.client_id)
    var clientId = req.body.client.client_id
    var options = {
      'method': 'POST',
      'url': orgUrl + '/oauth2/v1/clients/' + clientId + '/lifecycle/newSecret',
      'headers': O4Oheaders
    };
    request(options, function (error, response) {
      if (error) throw new Error(error);
      console.log(response.body);
      console.log("#####")
      var clientResponse = JSON.parse(response.body)
      console.log(clientResponse)
      console.log("#####")
      var client = {}
      client["client_name"] = clientResponse.client_name
      clientResponse["client_uri"] = "http://clientsecplaceholder.com?sec=" + clientResponse.client_secret
      client["response_types"] = clientResponse["response_types"]
      client["grant_types"] = clientResponse["grant_types"]
      options["method"] = 'PUT'
      options['url'] = orgUrl + '/oauth2/v1/clients/' + clientResponse.client_id
      options.body = JSON.stringify(client)

      console.log(options)
      request(options, function (updateerror, updateresponse) {
        console.log(updateerror)
        console.log(updateresponse.body)
        res.send({"messsage": "update"})
      });
    });
  })

  app.delete("/oauthClient", function(req, res){
    console.log(req.body.client.client_id)
    var clientId = req.body.client.client_id
    var options = {
      'method': 'DELETE',
      'url': orgUrl + '/oauth2/v1/clients/' + clientId,
      'headers':O4Oheaders
    };
    request(options, function (error, response) {
      if (error) throw new Error(error);
      console.log(response.body);
      res.send({"message": "deleted"})
    });
  })



  app.listen(process.env.PORT || 8000, function () {
    console.log('Example app listening on port 8000!');
  });

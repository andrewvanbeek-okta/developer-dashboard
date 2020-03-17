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

var headers = {
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

  app.post("/newSecret", function(req, res){
    console.log(req.body.client.client_id)
    var clientId = req.body.client.client_id
    var options = {
      'method': 'POST',
      'url': orgUrl + '/oauth2/v1/clients/' + clientId + '/lifecycle/newSecret',
      'headers': headers
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
      'headers':headers
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

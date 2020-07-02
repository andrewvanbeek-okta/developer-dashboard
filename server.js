var express = require('express');
var app = express();
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
require('dotenv').config()
const fs = require('fs');
const logo = process.env.VUE_APP_LOGO

// Serve all the files in '/dist' directory
const OktaJwtVerifier = require('@okta/jwt-verifier');
const oktaJwtVerifier = new OktaJwtVerifier({
  issuer: process.env.VUE_APP_OKTA_ISSUER // required
});

process.on('SIGINT', function() {
  console.log("Caught interrupt signal");
  // kill(8000, 'tcp')
      process.exit();
});


var bodyParser = require('body-parser')
var cors = require('cors')
const uuidv4 = require('uuid/v4');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

app.use(bodyParser.json());
app.use(cors())

var orgUrl = process.env.ORG_URL

global.O4OToken = ""
var O4Oheaders = ""

var clientId = process.env.O4O_CLIENT_ID

var request = require("request");
const okta = require('@okta/okta-sdk-nodejs');

var pair = {
  public: fs.readFileSync('./.public.pem', 'utf8'),
  private: fs.readFileSync('./.private.pem', 'utf8')
};
var jwks = require('./.jwk.json');

const O4Oclient = new okta.Client({
  orgUrl: orgUrl,
  authorizationMode: 'PrivateKey',
  clientId: clientId,
  scopes: ['okta.clients.manage', 'okta.apps.manage'],
  privateKey: jwks,
  token: 'faketoken',
});


app.get("/developer-apps", function (req, res) {
  oktaJwtVerifier.verifyAccessToken(req.headers.authorization, process.env.AUDIENCE)
    .then(jwt => {
      var request = require('request');
      if (O4OToken == "") {
        const njwt = require('njwt');
        const now = Math.floor(new Date().getTime() / 1000); // seconds since epoch
        const plus5Minutes = new Date((now + (5 * 60)) * 1000); // Date object
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

        console.log(clientId);
        console.log(jwt);


        //console.log(jwt);
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
            'scope': 'okta.clients.manage okta.authorizationServers.read ',
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
          console.log(user);

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
    }).catch(err => {
      // a validation failed, inspect the error
      console.log(err);
    });
})

app.post("/developer-app", function (req, res) {
  // console.log(req.headers);
  // console.log(req.body.headers);
  // console.log(req.body.headers.Authorization);

  //not sure why it's coming in from req.body and not headers...
  oktaJwtVerifier.verifyAccessToken(req.body.headers.Authorization, process.env.AUDIENCE)
    .then(jwt => {
      console.log(req.body.user)
      var clientId = uuidv4()
      var clientSecret = uuidv4()
      var client_data = { "client_id": clientId, "client_secret": clientSecret }
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
      console.log(application)

      O4Oclient.createApplication(application)
        .then(application => {
          console.log("created new app")
          res.send(application)
        }).catch(err => {
          console.log(err)
        })
    }).catch(err => {
      // a validation failed, inspect the error
      console.log(err);
    });
})

app.get("/scopes", function (req, res) {
  console.log(req.headers)
  console.log(req.headers.authorization)
  oktaJwtVerifier.verifyAccessToken(req.headers.authorization, process.env.AUDIENCE)
    .then(jwt => {
      var options = {
        'method': 'GET',
        'url': process.env.ORG_URL + '/api/v1/authorizationServers/' + process.env.VUE_APP_OKTA_ISSUER.split("oauth2/")[1] + '/scopes',
        'headers': O4Oheaders
      };
      request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
        res.send(response.body)
      });
    })
})

app.post("/developer-pkce-app", function (req, res) {
  // console.log(req.headers);
  // console.log(req.body.headers);
  // console.log(req.body.headers.Authorization);

  //not sure why it's coming in from req.body and not headers...
  oktaJwtVerifier.verifyAccessToken(req.body.headers.Authorization, process.env.AUDIENCE)
    .then(jwt => {
      console.log(req.body.user)
      var clientId = uuidv4()
      var clientSecret = uuidv4()
      var client_data = { "client_id": clientId, "client_secret": clientSecret }
      // console.log(client_data)
      var application = {
        "name": "oidc_client",
        "label": req.body.user.preferred_username + clientId + "?name=" + req.body.name,
        "signOnMode": "OPENID_CONNECT",
        "profile": { "name": "cool startup app" },
        "credentials": {
          "oauthClient": {
            "autoKeyRotation": true,
            "token_endpoint_auth_method": "none"
          }
        },
        "settings": {
          "implicitAssignment": true,
          "oauthClient": {
            "client_uri": "http://localhost:4000",
            "logo_uri": logo || "http://developer.okta.com/assets/images/logo-new.png",
            "redirect_uris": [
              "https://example.com/oauth2/callback",
              "http://localhost:4000/callback",
              "myapp://callback"
            ],
            "post_logout_redirect_uris": [
              "https://example.com/oauth2/postLogoutRedirectUri"
            ],
            "response_types": [
              "code"
            ],
            "grant_types": [
              "authorization_code"
            ],
            "application_type": "native",
            "tos_uri": req.body.tos || "https://example.com/client/tos",
            "policy_uri": req.body.policy || "https://example.com/client/policy",
            "consent_method": "REQUIRED",
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
    }).catch(err => {
      // a validation failed, inspect the error
      console.log(err);
    });
})

app.post("/newSecret", function (req, res) {
  oktaJwtVerifier.verifyAccessToken(req.headers.authorization, process.env.AUDIENCE)
    .then(jwt => {
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
          res.send({ "messsage": "update" })
        });
      });
    }).catch(err => {
      // a validation failed, inspect the error
      console.log(err);
    });
})

app.delete("/oauthClient", function (req, res) {
  console.log(req.headers);
  oktaJwtVerifier.verifyAccessToken(req.headers.authorization, process.env.AUDIENCE)
    .then(jwt => {
      console.log(req.body.client.client_id)
      var clientId = req.body.client.client_id
      var options = {
        'method': 'DELETE',
        'url': orgUrl + '/oauth2/v1/clients/' + clientId,
        'headers': O4Oheaders
      };
      request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
        res.send({ "message": "deleted" })
      });
    }).catch(err => {
      // a validation failed, inspect the error
      console.log(err);
    });
})

// everything below is bonus use of OPA for Oauth Autorization and Fine Grained Authorization, is not required for building your own Oauth client dashboard but useful for testing and prototyping authoirzation patterns

app.get("/rego", function (req, res) {
  // res.sendFile(__dirname + "/test.rego")
  // console.log(req.headers);
  request({
    url: 'http://localhost:8181/v1/policies/example',
    method: 'PUT',
    headers: {
      'cache-control': 'no-cache',
    },
    encoding: null,
    body: fs.createReadStream(__dirname + "/editable.rego")
  }, (error, response, body) => {
    if (error) {
      res.json({ name: error });
    } else {
      console.log(response.body)
    }
  });
})


app.post("/rego", async function (req, res) {
  console.log(req.body)
  var newRego = req.body.rego
  await fs.writeFileSync(__dirname + "/editable.rego", newRego)
  request({
    url: 'http://localhost:8181/v1/policies/example',
    method: 'PUT',
    headers: {
      'cache-control': 'no-cache',
    },
    encoding: null,
    body: fs.createReadStream(__dirname + "/editable.rego")
  }, (error, response, body) => {
    if (error) {
      res.json({ name: error });
    } else {
      console.log(response.body)
      res.send({ "message": "wrote to file" })
    }
  });
})

app.post("/opaAuthz", async function (req, res) {
  var request = require("request");
  var options = {
    method: 'POST',
    url: 'http://localhost:8181/v1/data/httpapi/authz',
    headers:
    {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json'
    },
    body:
      { input: req.body },
    json: true
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    console.log(body);
    res.send(response.body)
  });
})

app.delete("/rego", async function (req, res) {
  var request = require("request");

  var options = {
    method: 'DELETE',
    url: 'http://localhost:8181/v1/policies/example',
    headers:
      { 'Cache-Control': 'no-cache' }
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    res.send({ "message": "deleted" })
  });
})

app.get("/opa", function (req, res) {
  request({
    url: 'http://localhost:8181/v1/policies/example',
    method: 'GET',
    headers: {
      'cache-control': 'no-cache',
    },
  }, (error, response, body) => {
    if (error) {
      res.json({ name: error });
    } else {
      console.log(response.body)
      var policy = JSON.parse(response.body)
      if (policy.result) {
        res.json({ rego: policy.result.raw })
      } else {
        fs.readFile(__dirname + "/default.rego", "utf8", function (err, data) {
          if (err) throw err;
          res.json({ rego: data });
        });
      }
    }
  });
})

app.get("/easyRego", function (req, res) {
  fs.readFile(__dirname + "/easy.rego", "utf8", function (err, data) {
    if (err) throw err;
    res.json({ rego: data });
  });
})





// i want the ability to add scopes, claims, audience to an opa policy

app.listen(process.env.PORT || 8000, function () {
  console.log('Example app listening on port 8000!');
});

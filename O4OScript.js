// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.

const express = require("express");
const app = express();
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
require('dotenv').config()
var fs = require('fs');
var rsaPemToJwk = require('rsa-pem-to-jwk');

const crypto = require('crypto');
const assert = require('assert');

var orgUrl = process.env.ORG_URL
var apiKey = process.env.API_TOKEN

const okta = require('@okta/okta-sdk-nodejs');

//only want to do this if we don't already have a pair; otherwise the pairs will be overwritten and the server code will no longer work (signing with wrong keys);
// Assumes configuration is loaded via yaml or environment variables

// https://developer.okta.com/docs/reference/api/apps/#preview-saml-metadata-for-application


const client = new okta.Client({
  orgUrl: orgUrl,
  clientId: process.env.VUE_APP_OKTA_CLIENT_ID,
  token: process.env.API_TOKEN,
});

var keyPair = crypto.generateKeyPair('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'pkcs1',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs1',
    format: 'pem'
  }
}, (err, publicKey, privateKey) => {
  // Handle errors and use the generated key pair.
  //console.log(publicKey);
  var jwk = rsaPemToJwk(privateKey, {use: 'sig'}, 'private');

  //register new client w/ jwks
  var request = require('request');
  var options = {
    'method': 'POST',
    'url': orgUrl + '/oauth2/v1/clients',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'SSWS ' + apiKey
    },
    body:  JSON.stringify({
      "client_name": "DevDashboard-O4OServiceClient",
      "response_types": [
          "token"
      ],
      "grant_types": [
          "client_credentials"
      ],
      "token_endpoint_auth_method": "private_key_jwt",
      "application_type": "service",
      "jwks": {
          "keys": [
            jwk
          ]
      }
   })
  };
  console.log(options);
  request(options, function (error, response) { 
    if (error) throw new Error(error);
    var jsonres = JSON.parse(response.body);
    var client_id = jsonres.client_id;
    console.log("client created: client_id: " + jsonres.client_id);
    fs.appendFile('./.env', 'O4O_CLIENT_ID=' + client_id, (err) => {
      if (err) throw err;
      console.log('env file updated!');
    });
    //console.log(jsonres);

    const url = process.env.ORG_URL + `/api/v1/apps/` + client_id + `/grants/`;
    const request = {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "scopeId": "okta.clients.manage",
        "issuer": process.env.ORG_URL
      })
    };
    
    client.http.http(url, request)
      .then(res => res.json())
      .then(json => {
        console.log("okta.clients.manage granted");

      })
      .catch(err => {
        console.error(err);
      });

      //have to do this again, only one scopeId at a time supported
      const request2 = {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "scopeId": "okta.apps.manage",
          "issuer": process.env.ORG_URL
        })
      };
      client.http.http(url, request2)
      .then(res => res.json())
      .then(json => {
        console.log("okta.apps.manage granted");

      })
      .catch(err => {
        console.error(err);
      });
      
    // request(options, function (err, res) { 
    //   if (error) throw new Error(error);
    //   var jsonres = JSON.parse(response.body);
    //   console.log(jsonres.client_id);
    //   fs.appendFile('./.env', 'O4O_CLIENT_ID=' + jsonres.client_id, (err) => {
    //     if (err) throw err;
    //     console.log('env file updated!');
    //   });
    //   console.log(jsonres);
    //   //onsole.log(JSON.parse(response.body).client);
    // })
  })

  
  //need to write client_id to .env file

  fs.writeFile('./.jwk.json', JSON.stringify(jwk, null, 4), function (err) {
    if (err) throw err;
    console.log('Saved JWK!');
  });
  fs.writeFile('./.private.pem', privateKey, function (err) {
    if (err) throw err;
    console.log('Saved Private Key!');

  });  
  fs.writeFile('./.public.pem', publicKey, function (err) {
    if (err) throw err;
    console.log('Saved Public Key!');
  });
  //console.log(priv);
});


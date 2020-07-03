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

var apiToken = process.env.API_TOKEN;
var O4OclientID = process.env.O4O_CLIENT_ID;
/*
might want to search for "O4O app with Get and then destroy app, 
but we shoudl be able to stash the client ID in UDP as well, so 
I opted for the easier route here
 */

var request = require('request');


var options = {
  'method': 'DELETE',
  'url': orgUrl + "/oauth2/v1/clients/" + O4OclientID,
  'headers': {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'SSWS ' + apiToken
  }
};
request(options, function (error, response) {
  if (error) throw new Error(error);
  console.log(response.body);
});



const jwk = './.jwk.json'
const private = './.public.pem'
const public = './.private.pem'
fs.unlink(jwk, (err) => {
  if (err) {
    console.error(err)
    return
  }
  //file removed
})
fs.unlink(private, (err) => {
  if (err) {
    console.error(err)
    return
  }
  //file removed
})
fs.unlink(public, (err) => {
  if (err) {
    console.error(err)
    return
  }
  //file removed
})

util = require('util'),
cp = require('child_process');

var filename = './.env';
var lines2nuke = 1;
var command = util.format('tail -n %d %s', lines2nuke, filename);

cp.exec(command, (err, stdout, stderr) => {
if (err) throw err;
var to_vanquish = stdout.length;
fs.stat(filename, (err, stats) => {
    if (err) throw err;
    fs.truncate(filename, stats.size - to_vanquish, (err) => {
        if (err) throw err;
        console.log('File truncated!');
    })
});
});
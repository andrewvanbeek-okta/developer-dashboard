#!/usr/bin/env python
"""o4o_servive_app_sample.py: Small Python Script to Generated a Signed JWT for use with oAuth for Okta."""
__author__      = "James Reeder"
__version__     = "0.0.1"
__copyright__   = "Copyright 2020, Okta"

## Import Required Python Modules
import json
import time
import requests
from jose   import jwt
from pprint import pprint

## Configuration
clientId                = "0oar7v9zc04cwBzU00h7"                                ## OAuth Service App Client ID within Okta. This will become the audience (aud) and issuer (iss) within the JWT
oktaOrg                 = "https://pollardcorp.oktapreview.com"                          ## Your Okta Org    
oktaOrgTokenEndpoint    = oktaOrg+"/oauth2/v1/token"                            ## Your Okta Org's default OIDC token endpoint. This will become the audience within the JWT.
expiryTime              = time.time() + 900                                     ## This is the time the JWT will expire at in seconds
issuedAt                = time.time() - 900                                     ## This is the time the JWT will be issued at in seconds
requestedScopes         = "okta.users.read"

print ("#========== Starting script ==========#")

#====== Build the Signed JWT ======#
print ("## Stage 1 - Building Signed JWT....")
##Import JWT Key set
with open('jwk.json') as json_file:
    data = json.load(json_file)
keySet=data['keys'][0]

##Create JWT Payload
claims = {
    'exp': expiryTime,
    'iss': clientId,
    'aud': oktaOrgTokenEndpoint,
    'iat': issuedAt,
    'sub': clientId
}

## Create Token and sign with Private Key.
signedToken=jwt.encode(claims,keySet,algorithm="RS256")

print ("# Signed JWT: \n")
print (signedToken+"\n")

#====== Request Access Token ======#
print ("## Stage 2 - Requesting Access Token....")
payload = 'grant_type=client_credentials&scope='+requestedScopes+'&client_assertion_type=urn%3Aietf%3Aparams%3Aoauth%3Aclient-assertion-type%3Ajwt-bearer&client_assertion='+signedToken
headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/x-www-form-urlencoded',
  'cache-control': 'no-cache'
}

accessTokenRequest = requests.request("POST", oktaOrgTokenEndpoint, headers=headers, data = payload, verify=False) ## verify=False in case certs not installed in Python. DO NOT USE THIS IN PROD for obvious reasons.
print ('\n# Token Type:\n'+accessTokenRequest.json()['token_type']+"\n")
print ('# Expires In:\n'+str(accessTokenRequest.json()['expires_in'])+"\n")
print ('# Access Token:\n'+accessTokenRequest.json()['access_token']+"\n")
print ('# Scope:\n'+accessTokenRequest.json()['scope']+"\n")

#====== Try a request ======#
print ("## Stage 3 - Make a request....")
headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'Authorization': 'Bearer '+ accessTokenRequest.json()['access_token']
}

## Feel free to change the request below. Ensure the scopes you request match up to your request.
getUserListRequest = requests.request("GET", oktaOrg+"/api/v1/users?limit=2", headers=headers, verify=False)  ## verify=False in case certs not installed in Python. DO NOT USE THIS IN PROD for obvious reasons.
print ("# API Request Reponse\n")
pprint(getUserListRequest.json())
print ("#========== Script Completed  ==========#")

package httpapi.authz
# HTTP API request
import input
default allow = false
# your content
allow {
user_owns_scope
}

# Helper to get the token payload.
user_owns_claim { "" == token.payload._replace_claim_key }

user_owns_scope { "openid" == token.payload.scp[i] }

user_owns_username { "" == token.payload.sub }

user_owns_role { "xvxvdxfv" == token.payload.roles[i] }

token = {"payload": payload} {

[header, payload, signature] := io.jwt.decode(input.token)
}


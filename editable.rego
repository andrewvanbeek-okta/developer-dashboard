package httpapi.authz
# HTTP API request
import input
default allow = false
# your content
allow {
user_owns_role
}

# Helper to get the token payload.
user_owns_claim { "" == token.payload.your_claim_key }

user_owns_scope { "" == token.payload.scp[i] }

user_owns_username { "" == token.payload.sub }

user_owns_role { "" == token.payload.roles[i] }

token = {"payload": payload} {

[header, payload, signature] := io.jwt.decode(input.token)
}


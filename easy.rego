package httpapi.authz

# HTTP API request
import input

default allow = false

# your content
allow {
    #placeholder#
}

# Helper to get the token payload.
user_owns_claim { "#claim#" == token.payload._replace_claim_key }
user_owns_scope { "#scope#" == token.payload.scp[i] }
user_owns_username { "#username#" == token.payload.sub }
user_owns_role { "#role#" == token.payload.roles[i] }

token = {"payload": payload} {
  [header, payload, signature] := io.jwt.decode(input.token)
}

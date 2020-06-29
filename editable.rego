package httpapi.authz
# HTTP API request
import input
default allow = false
# your content
allow {
user_owns_claim
user_owns_scope
user_owns_role
user_owns_username
}

# Helper to get the token payload.
user_owns_claim { "897831y86t47t674t75764" == token.payload.org_id }

user_owns_scope { "openid" == token.payload.scp[i] }

user_owns_username { "andrew.vanbeek@okta.com" == token.payload.sub }

user_owns_role { "roles::admin" == token.payload.roles[i] }

token = {"payload": payload} {

[header, payload, signature] := io.jwt.decode(input.token)
}


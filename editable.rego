package httpapi.authz
# bob is alice's manager, and betty is charlie's.
subordinates = {"alice": [], "charlie": [], "bob": ["alice"], "betty": ["charlie"]}

# HTTP API request
import input
default allow = false
# Allow users to get their own salaries.
allow {
input.method == "GET"
input.path == "finance"
user_owns_token
user_owns_scope
}

# Allow managers to get their subordinates' salaries.
allow {
some username
input.method == "GET"
input.path = ["finance", "salary", username]
subordinates[input.user][_] == username
}

user_owns_token { token.payload.aud == "api://payments" }

user_owns_scope { "openid" == token.payload.scp[i] }

# Helper to get the token payload.
token = {"payload": payload} {

[header, payload, signature] := io.jwt.decode(input.token)
}


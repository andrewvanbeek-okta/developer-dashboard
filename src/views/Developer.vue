<template>
  <v-data-table :headers="headers" :items="clients" sort-by="client_id" class="elevation-1">
    <template v-slot:top>
      <v-toolbar flat color="white">
        <v-toolbar-title>Developer Dashboard</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-toolbar-title>
          Welcome,
          <span v-model="user">{{user}}</span>
        </v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-btn color="primary" dark class="mb-2" @click="save">New Service Oauth App</v-btn>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-btn color="primary" dark class="mb-2" @click="createUserGrant">New User Grant Oauth App</v-btn>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-btn v-if="authenticated" color="primary" dark class="mb-2" @click="logout">Logout</v-btn>
        <button
          v-else
          v-on:click="$auth.loginRedirect"
          color="primary"
          dark
          class="mb-2"
          id="login-button"
        >Login</button>
        <v-dialog v-model="dialog" max-width="800px">
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row v-if="userField">
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="new_client_name" label="client client_name"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="logo_url" label="url for logo"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="terms_url" label="url for terms"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="policy_url" label="url for policy"></v-text-field>
                  </v-col>
                </v-row>
                <v-row v-else>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="viewedItem.client_name" label="client client_name"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="viewedItem.client_id" label="client_id"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      label="client_secret"
                      v-model="viewedItem.client_secret"
                      :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                      :type="show1 ? 'text' : 'password'"
                      name="input-10-1"
                      counter
                      @click:append="show1 = !show1"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-expansion-panel>
              <v-card v-if="!creatingApp" max-width="800" max-height="200" class="mx-auto scroll">
                <v-toolbar color="primary" dark>
                  <v-toolbar-title>Available Scopes</v-toolbar-title>
                  <v-spacer></v-spacer>
                </v-toolbar>
                <v-list>
                  <v-list-item v-for="item in items" :key="item.title" @click>
                    <v-list-item-content>
                      <v-list-item-title>Scope Name: {{item.name}}</v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-content>
                      <v-list-item-title>description: {{item.description}}</v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-content>
                      <v-list-item-title>Consent: {{item.consent}}</v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-content>
                      <v-list-item-title>Openid Scope: {{item.system}}</v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-icon>
                      <v-icon
                        color="primary"
                        @click="addScope(item.name)"
                        v-if="!user_scopes.includes(item.name)"
                      >mdi-plus</v-icon>
                      <v-icon
                        color="primary"
                        @click="removeScope(item.name)"
                        v-else-if="user_scopes.includes(item.name)"
                      >mdi-minus</v-icon>
                    </v-list-item-icon>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-expansion-panel>
            <v-card v-if="!viewedItem.client_secret && !creatingApp">
              <br />
              <div class="d-block pa-2 black white--text">
                <h3>Run command below</h3>
                npm i dev-dash-cli-user-login -g && dev-login --OKTA_ORG_URL={{okta_issuer}} --OKTA_CLIENT_ID={{viewedItem.client_id}} --OKTA_REDIRECT_PORT=4000 --OKTA_SCOPES="{{user_scopes}}"
              </div>
              <br />
            </v-card>
            <v-card v-else-if="creatingApp">
              <div class="d-block pa-2 black white--text">
              to use this grant make sure you have the okta federated broker mode turned on!
              If you don't find the app you create in Okta and assign user groups in Okta.
              </div>
            </v-card>
            <v-card v-else>
              <br />
              <div class="d-block pa-2 black white--text">
                <h3>Run command below</h3>
                curl --location --request POST '{{okta_issuer}}/v1/token' \
                <br />
                --header 'Authorization: Basic {{baseEncode}}' \
                <br />--header 'Content-Type: application/x-www-form-urlencoded' \
                <br />--data-urlencode 'grant_type=client_credentials' \
                <br />
                --data-urlencode 'scope={{client_creds_scopes}}'
              </div>
              <br />
            </v-card>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="close">Close</v-btn>
              <v-btn color="blue darken-1" text @click="save">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.action="{ item }">
      <v-icon small class="mr-2" @click="viewItem(item)">mdi-eye</v-icon>
      <v-icon small @click="deleteItem(item)">mdi-delete</v-icon>
    </template>
    <template v-slot:no-data>
      <v-btn color="primary" @click="initialize">Reset</v-btn>
    </template>
  </v-data-table>
</template>

<script>
export default {
  client_name: "Developer",
  data: () => ({
    show1: false,
    dialog: false,
    authenticated: false,
    new_client_name: "",
    creatingApp: false,
    policy_url: "",
    terms_url: "",
    okta_issuer: "",
    userField: false,
    baseEncode: "",
    user_scopes: "openid email profile",
    items: [
      {
        consent: "IMPLICIT",
        default: false,
        description: null,
        id: "scpjeez3czmycNAvE0h7",
        metadataPublish: "NO_CLIENTS",
        name: "Admin",
        system: false
      }
    ],
    client_creds_scopes: "",
    user: "",
    headers: [
      {
        text: "Oauth Clients",
        align: "start",
        sortable: false,
        value: "client_name"
      },
      {
        text: "client_id",
        value: "client_id"
      },
      {
        text: "Actions",
        value: "action",
        sortable: false
      }
    ],
    clients: [],
    editedIndex: -1,
    viewedItem: {
      client_name: "",
      client_id: 0,
      client_secret: 0
    },
    defaultItem: {
      client_name: "",
      client_id: 0
    }
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "New Oauth App" : "View Oauth Client";
    }
  },

  watch: {
    dialog(val) {
      val || this.close();
    }
  },

  created() {
    this.initialize();
    console.log(process.env.VUE_APP_OKTA_ISSUER);
    this.okta_issuer = process.env.VUE_APP_OKTA_ISSUER;
    this.isAuthenticated();
  },

  methods: {
    async initialize() {
      var component = this;
      var user = await this.$auth.getUser();
      var accessToken = await this.$auth.getAccessToken();
      const accessTokenobj = {
        accessToken
      };
      this.user = user.preferred_username;

      const baseURI =
        "http://localhost:8000/developer-apps?user=" + user.preferred_username;
      this.$http
        .get(baseURI, {
          headers: {
            Authorization: `${accessToken}`
          }
        })
        .then(result => {
          this.clients = result.data.map(function(client) {
            client["client_secret"] = client.client_uri.split("sec=")[1];
            return client;
          });
          //map to make prettier
        });
    },
    async rotateSecret(item) {
      var accessToken = await this.$auth.getAccessToken();

      this.$http
        .post("http://localhost:8000/newSecret", {
          headers: {
            Authorization: `${accessToken}`
          },
          client: item
        })
        .then(result => {
          component.close();
          component.initialize();
        });
    },
    async addScope(item) {
      if (!this.user_scopes.includes(item)) {
        this.user_scopes = this.user_scopes + " " + item;
      }
      if (!this.client_creds_scopes.includes(item)) {
        this.client_creds_scopes = this.client_creds_scopes + " " + item;
      }
    },
    async removeScope(item) {
      if (this.user_scopes.includes(" " + item)) {
        this.user_scopes = this.user_scopes.replace(" " + item, "");
      }

      if (this.client_creds_scopes.includes(" " + item)) {
        this.client_creds_scopes = this.client_creds_scopes.replace(
          " " + item,
          ""
        );
      }
    },
    async getScopes(item) {
      var component = this;
      var accessToken = await this.$auth.getAccessToken();
      const accessTokenobj = {
        accessToken
      };
      const baseURI = "http://localhost:8000/scopes";
      this.$http
        .get(baseURI, {
          headers: {
            Authorization: `${accessToken}`
          }
        })
        .then(result => {
          console.log(result);
          component.items = result.data;
        });
    },
    viewItem(item) {
      this.user_scopes = "openid email profile";
      this.editedIndex = this.clients.indexOf(item);
      this.viewedItem = Object.assign({}, item);
      this.baseEncode = btoa(
        this.viewedItem.client_id + ":" + this.viewedItem.client_secret
      );
      this.getScopes(this.viewedItem);
      this.dialog = true;
    },
    createUserGrant(item) {
      this.creatingApp = true
      this.editedIndex = this.clients.indexOf(item);
      this.viewedItem = Object.assign({}, item);
      this.userField = true;
      this.dialog = true;
    },
    async deleteItem(item) {
      var component = this;
      var user = await this.$auth.getUser();
      var accessToken = await this.$auth.getAccessToken();
      this.$http
        .delete("http://localhost:8000/oauthClient", {
          headers: {
            Authorization: `${accessToken}`
          },
          data: {
            client: item
          }
        })
        .then(result => {
          component.initialize();
        });
    },
    close() {
      this.dialog = false;
      this.userField = false;
      this.creatingApp = false;
      setTimeout(() => {
        this.viewedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },
    async isAuthenticated() {
      this.authenticated = await this.$auth.isAuthenticated();
    },
    async logout() {
      await this.$auth.logout();
      await this.$auth.isAuthenticated();

      // Navigate back to home
      window.location.reload();
    },
    async save() {
      var component = this;
      if (component.userField && component.new_client_name) {
        component.savePkce();
      } else {
        var user = await this.$auth.getUser();
        var accessToken = await this.$auth.getAccessToken();
        this.$http
          .post("http://localhost:8000/developer-app", {
            headers: {
              Authorization: `${accessToken}`
            },
            user: user
          })
          .then(result => {
            component.close();
            component.initialize();
          });
      }
    },
    async savePkce() {
      var component = this;
      var name = component.new_client_name;
      var user = await this.$auth.getUser();
      var tos = component.terms_url;
      var policy = component.policy_url;
      var accessToken = await this.$auth.getAccessToken();
      this.$http
        .post("http://localhost:8000/developer-pkce-app", {
          headers: {
            Authorization: `${accessToken}`
          },
          user: user,
          name: name,
          tos: tos,
          policy: policy
        })
        .then(result => {
          component.userField = false;
          component.close();
          component.initialize();
        });
    }
  }
};
</script>

<style>
.scroll {
  overflow-y: auto;
}
</style>

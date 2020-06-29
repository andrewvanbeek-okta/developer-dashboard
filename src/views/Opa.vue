<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" scrollable max-width="800px">
      <v-card>
        <v-card-title>{{opaMessageTitle}}</v-card-title>
        <v-card-text class="d-block pa-2 black white--text scroll">{{opaResponse}}</v-card-text>
        <v-btn color="blue darken-1" text @click="dialog = false">Close</v-btn>
      </v-card>
    </v-dialog>
    <v-col cols="6">
      <v-card width="1000px" scrollable="true">
        <v-card-title>Test Authorization</v-card-title>
        <v-divider></v-divider>
        <v-divider></v-divider>
        <v-form>
          <v-container>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field v-model="method"></v-text-field>
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field v-model="path"></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="9">
                <v-label>Copy and Paste your Access Token</v-label>   <v-btn color="blue darken-1" text @click="parseJwt()">Show Token Contents</v-btn>
                <v-textarea
                  outlined
                  name="input-7-4"
                  label="Paste a Access Token here"
                  rows="12"
                  v-model="access_token"
                ></v-textarea>
              </v-col>
              <v-col cols="3">
                <v-label>Use the token from the Dev Dashboard</v-label>
                <v-switch value v-model="useCurrentToken"></v-switch>
              </v-col>
            </v-row>
          </v-container>
          <v-row justify="center">
            <v-btn color="primary" dark class="mb-2 send" @click="sendToOpa()">Send</v-btn>
          </v-row>
        </v-form>
        <div class="d-block pa-2 black white--text scroll">
          What we are going to send to Open Policy Agent
          <br />
          <br />
          {
          "input":{
          "method": "{{method}}",
          "path": "{{path}}",
          "token": "{{access_token}}"
          }
          }
        </div>
        <v-divider></v-divider>
      </v-card>
    </v-col>
    <v-col cols="6">
      <v-card width="1000px" scrollable="true">
        <v-card-title>
          Open Policy Agent Status:
          <span v-if="opaOff">
            Not Available
            <v-btn icon @click="opaInfo()">
              <v-icon>?</v-icon>
            </v-btn>
          </span>
          <span v-else>All systems go</span>
        </v-card-title>
        <v-progress-linear v-if="opaOff" color="red lighten-2" buffer-value="0" stream></v-progress-linear>
        <v-progress-linear color="green" buffer-value="0" value="100" stream v-else></v-progress-linear>
        <v-divider></v-divider>
        <v-card-title>Edit Opa Policy</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-form>
            <v-container>
              <v-row>
                <v-col cols="12" md="2">
                  <v-label>Check Token for scope below</v-label>
                  <v-switch v-model="checkForScope" value="John"></v-switch>
                  <v-text-field placeholder="scope value" v-model="scopeToCheck"></v-text-field>
                </v-col>
                <v-col cols="12" md="2">
                  <v-label>Check Token for claim below</v-label>
                  <v-switch v-model="checkForClaim" value></v-switch>
                   <v-text-field placeholder="claim title" v-model="claimKey"></v-text-field>
                  <v-text-field placeholder="claim value" v-model="claimToCheck"></v-text-field>
                </v-col>
                <v-col cols="12" md="2">
                  <v-label>Check Token for role or group name</v-label>
                  <v-switch v-model="checkForGroup" value="John"></v-switch>
                  <v-text-field placeholder="role value" v-model="groupForCheck"></v-text-field>
                </v-col>
                <v-col cols="12" md="2">
                  <v-label>Check Token for specific users</v-label>
                  <v-switch v-model="checkForUser" value="John"></v-switch>
                  <v-text-field placeholder="username value" v-model="userForCheck"></v-text-field>
                </v-col>
              </v-row>
            </v-container>
            <v-row justify="center">
              <v-btn color="primary" dark class="mb-2 send" @click="easyAuthorization()">Apply</v-btn>
            </v-row>
          </v-form>
        </v-card-text>
         <v-label>Or Directly edit the OPA policy</v-label>
        <div class="d-block pa-2 black white--text scroll">
          <!-- <h3>Run command below</h3>
          <p v-for="fragment in regoFragements">{{fragment}}<br></p>-->
          <editor-content :editor="editor" />
        </div>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="saveRego()">Save</v-btn>
          <v-btn color="blue darken-1" text @click="resetRego()">Reset</v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { Editor, EditorContent } from "tiptap";
export default {
  components: {
    EditorContent
  },
  client_name: "Developer",
  data: () => ({
    opaText: "",
    on: true,
    useCurrentToken: false,
    opaMessageTitle: "",
    checkForClaim: false,
    claimKey: "",
    claimToCheck: "",
    checkForScope: false,
    scopeToCheck: "",
    checkForGroup: false,
    groupForCheck: "",
    checkForUser: false,
    userForCheck: "",
    opaOff: false,
    opaResponse: "",
    dialog: false,
    method: "GET",
    path: "finance",
    access_token: "",
    editor: null,
    regoFragements: [],
    user: ""
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "New Oauth App" : "View Oauth Client";
    }
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    async useCurrentToken(newValue) {
      var useDashToken = this.useCurrentTokens;
      if (newValue) {
        this.access_token = await this.$auth.getAccessToken();
      } else {
        this.access_token = "";
      }
    }
  },

  created() {
    this.initialize();
    console.log(process.env.VUE_APP_OKTA_ISSUER);
    this.okta_issuer = process.env.VUE_APP_OKTA_ISSUER;
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
      const baseURI = "http://localhost:8000/opa";
      var opa = await this.$http.get(baseURI);
      if (opa.data.name) {
        this.opaOff = opa.data.name.code == "ECONNREFUSED";
        this.opaInfo();
      }
      this.regoFragements = opa.data.rego.split("\n");
      var rego = opa.data.rego.split("\n").join("</br>");
      var niceRego = this.createPrettyString(this.regoFragements);
      this.editor = new Editor({
        content: niceRego
      });
      component.saveRego();
    },
    opaInfo() {
      if (this.opaOff) {
        this.opaMessageTitle =
          "You do not have Open Policy Agent running.  Run this command in the terminal and refresh the page(prereq is to have docker)";
        this.opaResponse =
          "docker run -p 8181:8181 openpolicyagent/opa \
    run --server --log-level debug";
        this.dialog = true;
      }
    },
    async saveRego() {
      const baseURI = "http://localhost:8000/rego";
      var jsonContent = this.editor.getJSON();
      var htmlContent = this.editor.getHTML();
      console.log(jsonContent.content);
      var regoToSend = this.createFormattedString(jsonContent.content);
      console.log(regoToSend);
      var opa = await this.$http.post(baseURI, { rego: regoToSend });
      console.log(opa);
    },
    parseJwt() {
      var base64Url = this.access_token.split(".")[1];
      var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      var jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function(c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      this.opaMessageTitle = "Parsed Access Token"
      this.opaResponse = JSON.parse(jsonPayload);
      this.dialog = true
    },
    async easyAuthorization() {
      var component = this;
      const baseURI = "http://localhost:8000/easyRego";
      var opa = await this.$http.get(baseURI);
      this.regoFragements = opa.data.rego.split("\n");
      var rego = opa.data.rego.split("\n").join("</br>");
      var niceRego = this.createPrettyString(this.regoFragements);
      var regoWithSettings = this.easyAuthorizationSettings(niceRego);
      this.editor.setContent(regoWithSettings);
      this.saveRego();
    },
    easyAuthorizationSettings(rego) {
      var regoSettingsString = "";
      if (this.checkForClaim) {
        regoSettingsString += "<p>" + "user_owns_claim" + "</p></br>";
        rego.replace("#claim#", this.claimToCheck);
      }
      if (this.checkForScope) {
        regoSettingsString += "<p>" + "user_owns_scope" + "</p></br>";
        rego.replace("#scope#", this.scopeToCheck);
      }
      if (this.checkForGroup) {
        regoSettingsString += "<p>" + "user_owns_role" + "</p></br>";
      }
      if (this.checkForUser) {
        regoSettingsString += "<p>" + "user_owns_username" + "</p></br>";
      }
      var newRego = rego
        .replace("#placeholder#", regoSettingsString)
        .replace("#username#", this.userForCheck)
        .replace("#role#", this.groupForCheck)
        .replace("#scope#", this.scopeToCheck)
        .replace("#claim#", this.claimToCheck)
        .replace("_replace_claim_key", this.claimKey);
      return newRego;
    },
    async sendToOpa() {
      var component = this;
      const baseURI = "http://localhost:8000/opaAuthz";
      var opa = await this.$http.post(baseURI, {
        method: component.method,
        path: component.path,
        token: component.access_token
      });
      console.log(opa);
      component.opaMessageTitle = "Response from Opa!";
      component.opaResponse = opa.data;
      component.dialog = true;
    },
    async resetRego() {
      const baseURI = "http://localhost:8000/rego";
      var opa = await this.$http.delete(baseURI);
      this.$router.go();
    },
    createPrettyString(fragments) {
      var string = "";
      fragments.forEach((item, i) => {
        string += "<p>" + item + "</p><br>";
      });
      return string;
    },
    createFormattedString(contentObjects) {
      var string = "";
      contentObjects.forEach((item, i) => {
        if (item.content) {
          string += item.content[0].text + "\n";
          if (item.content[0].text.includes("}")) {
            string += "\n";
          }
        }
      });
      return string;
    },
    async logout() {
      await this.$auth.logout();
      await this.$auth.isAuthenticated();

      // Navigate back to home
      window.location.reload();
    }
  }
};
</script>
 
<style>
.scroll {
  overflow-y: auto;
  height: 600px;
}
</style>

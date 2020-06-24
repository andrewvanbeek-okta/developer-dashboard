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
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="sendToOpa()">Send</v-btn>
        </v-card-actions>
        <v-divider></v-divider>
        <v-form v-model="valid">
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
              <v-col cols="12" md="6">
                <v-label>Copy and Paste your Access Token</v-label>
                <v-textarea
                  outlined
                  name="input-7-4"
                  label="Paste a Access Token here"
                  v-model="access_token"
                ></v-textarea>
              </v-col>
              <v-col cols="6">
                <v-label>Use the token from the Dev Dashboard</v-label>
                <v-switch value v-model="useCurrentToken"></v-switch>
              </v-col>
            </v-row>
          </v-container>
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
      <v-card max-height="200px" width="1000px" scrollable="true">
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
    useCurrentToken: false,
    opaMessageTitle: "",
    opaOff: false,
    opaResponse: "",
    dialog: false,
    method: "GET",
    path: "finance",
    access_token: "",
    editor: null,
    regoFragements: [],
    client_creds_scopes: "",
    user: "",
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
      component.saveRego()
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

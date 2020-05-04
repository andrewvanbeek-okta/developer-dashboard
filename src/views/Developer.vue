<template>
  <v-data-table
  :headers="headers"
  :items="clients"
  sort-by="client_id"
  class="elevation-1"
  >
  <template v-slot:top>
    <v-toolbar flat color="white">
      <v-toolbar-title>Developer Dashboard</v-toolbar-title>
      <v-divider
      class="mx-4"
      inset
      vertical
      ></v-divider>
      <v-spacer></v-spacer>
      <v-toolbar-title>Welcome, <span v-model="user">{{user}}</span></v-toolbar-title>
      <v-divider
      class="mx-4"
      inset
      vertical
      ></v-divider>
      <v-btn color="primary" dark class="mb-2" @click="save">New Oauth App</v-btn>
      <v-divider
      class="mx-4"
      inset
      vertical
      ></v-divider>
      <v-btn color="primary" dark class="mb-2" @click="logout">Logout</v-btn>
      <v-dialog v-model="dialog" max-width="800px">
        <v-card>
          <v-card-title>
            <span class="headline">{{ formTitle }}</span>
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
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
    <v-icon
    small
    class="mr-2"
    @click="viewItem(item)"
    >
    mdi-eye
  </v-icon>
  <v-icon
  small
  @click="deleteItem(item)"
  >
  mdi-delete
</v-icon>
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
    user: "",
    headers: [
      {
        text: 'Oauth Clients',
        align: 'start',
        sortable: false,
        value: 'client_name',
      },
      { text: 'client_id', value: 'client_id' },
      { text: 'Actions', value: 'action', sortable: false },
    ],
    clients: [],
    editedIndex: -1,
    viewedItem: {
      client_name: '',
      client_id: 0,
      client_secret: 0,
    },
    defaultItem: {
      client_name: '',
      client_id: 0,
    },
  }),

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'New Oauth App' : 'View Oauth Client'
    },
  },

  watch: {
    dialog (val) {
      val || this.close()
    },
  },

  created () {
    this.initialize()
  },

  methods: {
    async initialize () {
      var user = await this.$auth.getUser()
      var accessToken = await this.$auth.getAccessToken();
      console.log(accessToken);
      const accessTokenobj = {
        accessToken
      }
      var username = user.preferred_username
      const baseURI = "http://localhost:8000/developer-apps?user="+ username;

      this.$http.get(baseURI, {
          "adhoidhjwioqdhq" : "abc"
      }).then((result) => {
        this.clients = result.data.map(function(client) {
          //client["client_secret"] = client.client_uri.split("sec=")[1]
          return client
        })
        //map to make prettier
      })
    },
    async rotateSecret(item) {
      this.$http.post("http://localhost:8000/newSecret", {client: item}).then((result) => {
        component.close()
        component.initialize()
      })

    },
    viewItem (item) {
      this.editedIndex = this.clients.indexOf(item)
      this.viewedItem = Object.assign({}, item)
      this.dialog = true
    },
    async deleteItem (item) {
      var component = this
      var user = await this.$auth.getUser()
      this.token = await this.$auth.getAccessToken()
      this.$http.delete("http://localhost:8000/oauthClient", { data: { client: item } }).then((result) => {
        component.initialize()
      })
    },
    close () {
      this.dialog = false
      setTimeout(() => {
        this.viewedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },
    async logout () {
     await this.$auth.logout()
     await this.$auth.isAuthenticated()

     // Navigate back to home
     window.location.reload()
   },
    async save () {
      var component = this
      var user = await this.$auth.getUser()
      this.token = await this.$auth.getAccessToken()
      this.$http.post("http://localhost:8000/developer-app", {user: user}).then((result) => {
        component.close()
        component.initialize()
      })

    },
  },
}
</script>

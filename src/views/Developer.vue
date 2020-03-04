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
      <v-btn color="primary" dark class="mb-2" @click="save">New Oauth App</v-btn>
      <v-dialog v-model="dialog" max-width="800px">
        <v-card>
          <v-card-title>
            <span class="headline">{{ formTitle }}</span>
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model="editedItem.client_name" label="client client_name"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model="editedItem.client_id" label="client_id"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                  label="client_secret"
                  v-model="editedItem.client_secret"
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
            <v-btn color="blue darken-1" text @click="rotateSecret(editedItem)">Generate New Client secret</v-btn>
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
    @click="editItem(item)"
    >
    mdi-pencil
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
    editedItem: {
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
      return this.editedIndex === -1 ? 'New Oauth App' : 'Edit Oauth Client'
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
      var username = user.preferred_username
      this.$http.get("http://localhost:8000/developer-apps?user="+ username).then((result) => {
        console.log(result.data)
        this.clients = result.data.map(function(client) {
          client["client_secret"] = client.client_uri.split("sec=")[1]
          return client
        })
        //map to make prettier
      })
    },
    async rotateSecret(item) {
      console.log(item)
      this.$http.post("http://localhost:8000/newSecret", {client: item}).then((result) => {
        component.close()
        component.initialize()
      })

    },
    editItem (item) {
      this.editedIndex = this.clients.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    async deleteItem (item) {
      console.log(item)
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
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },

    async save () {
      var component = this
      var user = await this.$auth.getUser()
      this.token = await this.$auth.getAccessToken()
      console.log(this.$http)
      this.$http.post("http://localhost:8000/developer-app", {user: user}).then((result) => {
        component.close()
        component.initialize()
      })

    },
  },
}
</script>

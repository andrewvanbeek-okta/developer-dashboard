<template>
  <div class="d-block pa-2 black white--text">
      <h3>Run command below</h3>
      <p v-for="fragment in regoFragements">{{fragment}}<br></p>
  </div>

</template>

<script>
export default {
  client_name: "Developer",
  data: () => ({
    opaText: "",
    regoFragements: [],
    show1: false,
    dialog: false,
    new_client_name: "",
    policy_url: "",
    terms_url: "",
    okta_issuer: "",
    userField: false,
    baseEncode: "",
    user_scopes: "openid email profile",
    items: [{
      consent: "IMPLICIT",
      default: false,
      description: null,
      id: "scpjeez3czmycNAvE0h7",
      metadataPublish: "NO_CLIENTS",
      name: "Admin",
      system: false
    }],
    client_creds_scopes: "",
    user: "",
    headers: [{
      text: 'Oauth Clients',
      align: 'start',
      sortable: false,
      value: 'client_name',
    },
    {
      text: 'client_id',
      value: 'client_id'
    },
    {
      text: 'Actions',
      value: 'action',
      sortable: false
    },
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
  formTitle() {
    return this.editedIndex === -1 ? 'New Oauth App' : 'View Oauth Client'
  },
},

watch: {
  dialog(val) {
    val || this.close()
  },
},

created() {
  this.initialize()
  this.sendToOpa()
  console.log(process.env.VUE_APP_OKTA_ISSUER)
  this.okta_issuer = process.env.VUE_APP_OKTA_ISSUER
},

methods: {
  async initialize() {
    var component = this
    var user = await this.$auth.getUser()
    var accessToken = await this.$auth.getAccessToken();
    const accessTokenobj = {
      accessToken
    }
    this.user = user.preferred_username
    const baseURI = "http://localhost:8000/opa"
    var opa = await this.$http.get(baseURI)
    this.regoFragements = opa.data.rego.split("\n")
  },
  async rotateSecret(item) {
    var accessToken = await this.$auth.getAccessToken();

    this.$http.post("http://localhost:8000/newSecret", {
      headers: {
        'Authorization': `${accessToken}`
      },
      client: item
    }).then((result) => {
      component.close()
      component.initialize()
    })

  },
  async sendToOpa() {
    let data = new FormData()
    data.set('file', "http://localhost:8080/test.rego")
    var opa = await this.$http.post('http://localhost:8181/v1/policies', data)
    console.log(opa)
  },
  async addScope(item) {
    if (!this.user_scopes.includes(item)) {
      this.user_scopes = this.user_scopes + " " + item
    }
    if (!this.client_creds_scopes.includes(item)) {
      this.client_creds_scopes = this.client_creds_scopes + " " + item
    }
  },
  async removeScope(item) {
    if (this.user_scopes.includes(" " + item)) {
      this.user_scopes = this.user_scopes.replace(" " + item, '')
    }

    if(this.client_creds_scopes.includes(" " + item)) {
      this.client_creds_scopes = this.client_creds_scopes.replace(" " + item, '')
    }
  },
  async getScopes(item) {
    var component = this
    var accessToken = await this.$auth.getAccessToken();
    const accessTokenobj = {
      accessToken
    }
    const baseURI = "http://localhost:8000/scopes"
    this.$http.get(baseURI, {
      headers: {
        'Authorization': `${accessToken}`
      }
    }).then((result) => {
      console.log(result)
      component.items = result.data
    })
  },
  viewItem(item) {
    this.user_scopes = "openid email profile"
    this.editedIndex = this.clients.indexOf(item)
    this.viewedItem = Object.assign({}, item)
    this.baseEncode = btoa(this.viewedItem.client_id + ":" + this.viewedItem.client_secret)
    this.getScopes(this.viewedItem)
    this.dialog = true
  },
  createUserGrant(item) {
    this.editedIndex = this.clients.indexOf(item)
    this.viewedItem = Object.assign({}, item)
    this.userField = true
    this.dialog = true
  },
  async deleteItem(item) {
    var component = this
    var user = await this.$auth.getUser()
    var accessToken = await this.$auth.getAccessToken();
    this.$http.delete("http://localhost:8000/oauthClient", {
      headers: {
        'Authorization': `${accessToken}`
      },
      data: {
        client: item
      }
    }).then((result) => {
      component.initialize()
    })
  },
  close() {
    this.dialog = false
    this.userField = false
    setTimeout(() => {
      this.viewedItem = Object.assign({}, this.defaultItem)
      this.editedIndex = -1
    }, 300)
  },
  async logout() {
    await this.$auth.logout()
    await this.$auth.isAuthenticated()

    // Navigate back to home
    window.location.reload()
  },
  async save() {
    var component = this
    if (component.userField && component.new_client_name) {
      component.savePkce()
    } else {
      var user = await this.$auth.getUser()
      var accessToken = await this.$auth.getAccessToken()
      this.$http.post("http://localhost:8000/developer-app", {
        headers: {
          'Authorization': `${accessToken}`
        },
        user: user
      }).then((result) => {
        component.close()
        component.initialize()
      })
    }
  },
  async savePkce() {
    var component = this
    var name = component.new_client_name
    var user = await this.$auth.getUser()
    var tos = component.terms_url
    var policy = component.policy_url
    var accessToken = await this.$auth.getAccessToken()
    this.$http.post("http://localhost:8000/developer-pkce-app", {
      headers: {
        'Authorization': `${accessToken}`
      },
      user: user,
      name: name,
      tos: tos,
      policy: policy
    }).then((result) => {
      component.userField = false
      component.close()
      component.initialize()
    })
  },
},
}
</script>

<style>
.scroll {
  overflow-y: auto;
}
</style>

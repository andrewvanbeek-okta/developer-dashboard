<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          v-bind:src="logo"
          transition="scale-transition"
          width="40"
        />
        <h1>Developer Dashboard</h1>
      </div>

      <v-spacer></v-spacer>
      <v-btn color="primary" class="mb-2" v-if="authenticated" to="/opa">Test Tokens</v-btn>
      <v-btn color="primary" class="mb-2" v-if="authenticated" to="/developer">developer dashboard</v-btn>
      <v-btn
        to="/login"
        color="primary"
        dark
        class="mb-2"
        id="login-button"
      v-else>Login</v-btn>
    </v-app-bar>

    <v-content>
      <router-view />
    </v-content>
  </v-app>
</template>

<script>
var logo =
  "https://www.okta.com/sites/all/themes/Okta/images/logos/developer/Dev_Logo-03_White_Large.png";
if (process.env) {
  logo = process.env.VUE_APP_LOGO;
}

export default {
  name: "App",
  created() {
    this.isAuthenticated();
  },
  mounted() {
    this.isAuthenticated();
  },
  watch: {
    // Everytime the route changes, check for auth status
    '$route': 'isAuthenticated'
  },
  data: () => ({
    logo: logo,
    authenticated: false
  }),
  methods: {
    async isAuthenticated() {
      this.authenticated = await this.$auth.isAuthenticated();
      console.log(this.authenticated)

    }
  }
};
</script>

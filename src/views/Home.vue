<template>
  <hello-world />
</template>

<script>
import HelloWorld from "../components/HelloWorld";

export default {
  name: "Home",

  components: {
    HelloWorld
  },
  created () {
    this.isAuthenticated()
  },
  data: function () {
    return {
      authenticated: false
    }
  },
  methods: {
    async isAuthenticated() {
      this.authenticated = await this.$auth.isAuthenticated();
    }
  }
};
</script>

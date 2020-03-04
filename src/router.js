import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Developer from './views/Developer.vue'
import Auth from '@okta/okta-vue'

Vue.use(Router)

Vue.use(Auth, {
  issuer: process.env.VUE_APP_OKTA_ISSUER,
  client_id: process.env.VUE_APP_OKTA_CLIENT_ID,
  redirect_uri: "http://localhost:8080/implicit/callback",
  scope: 'openid profile email'
})

var router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'developer',
      component: Developer
    },
    {
      path: '/developer',
      name: 'developer',
      component: Developer,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/implicit/callback',
      component: Auth.handleCallback()
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    }
  ]
})

router.beforeEach(Vue.prototype.$auth.authRedirectGuard())

export default router

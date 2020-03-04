module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  devServer:{
    host: 'localhost',
    hot:true,
    port: 8080,
    open: 'Chrome',
    proxy: { //https://cli.vuejs.org/guide/html-and-static-assets.html#disable-index-generation
      '/api':{ //everything from root
        target: 'http://localhost:8000',
        secure: false,
        ws: false,
      }
    }
  }
}

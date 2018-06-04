import Vue from 'vue'
import axios from 'axios'
import VueHighlightJS from 'vue-highlightjs'
import './assets/highlight.main.css'
import 'animate.css/animate.min.css'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import { remote } from 'electron'

import App from './App'
import TreeView from 'vue-json-tree-view'
import router from './router'
import store from './store'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.prototype.$lang = remote.getGlobal('lang')
console.log(remote.getGlobal('lang'))
Vue.use(VueHighlightJS)
Vue.use(ElementUI)
Vue.use(TreeView)
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')

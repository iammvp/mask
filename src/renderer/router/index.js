import Vue from 'vue'
import Router from 'vue-router'

import RecordList from '../components/recordList/RecordList.vue'
import ProxyRule from '../components/proxyRule/ProxyRule.vue'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: RecordList
    },
    {
      path: '/proxy-rule',
      component: ProxyRule
    }
  ]
})

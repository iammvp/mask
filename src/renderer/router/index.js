import Vue from 'vue'
import Router from 'vue-router'

import RecordList from '../components/recordList/RecordList.vue'
import TreeView from '../components/recordList/TreeView.vue'
import SequenceView from '../components/recordList/SequenceView.vue'
import ProxyRule from '../components/proxyRule/ProxyRule.vue'
Vue.use(Router)
let preView = 'sequence-view'
const router = new Router({
  routes: [
    { path: '/', redirect: '/record-list' },
    {
      path: '/record-list',
      component: RecordList,
      children: [
        { path: 'tree-view', name: 'tree-view', component: TreeView },
        { path: 'sequence-view', name: 'sequence-view', component: SequenceView }
      ]
    },
    {
      path: '/proxy-rule',
      component: ProxyRule
    }
  ]
})
router.afterEach((to, from) => {
  if (from.fullPath.indexOf('/record-list') !== -1) {
    preView = from.name
  }
})
router.beforeEach((to, from, next) => {
  if (to.fullPath === '/record-list') {
    next({name: preView})
  } else {
    next()
  }
})
export default router

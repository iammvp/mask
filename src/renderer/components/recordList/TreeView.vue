<template>
  <div class="tree-view">
    <tree-node :treeData="recordsTree"/>
    <transition name="slide-detail">
      <record-detail v-show="showRecordDetail"></record-detail>
    </transition>
  </div>
</template>

<script>
import TreeNode from './TreeNode'
import RecordDetail from './RecordDetail'
import { mapState, mapMutations } from 'vuex'
export default {
  components: {
    TreeNode,
    RecordDetail
  },
  methods: {
    ...mapMutations({
      closeRecordDetail: 'CLOSE_RECORD_DETAIL'
    })
  },
  computed: {
    ...mapState({
      recordsTree: state => state.Records.recordsTree,
      showRecordDetail: state => state.Records.showRecordDetail
    })
  },
  beforeRouteLeave (to, from, next) {
    this.closeRecordDetail()
    next()
  }
}
</script>

<style lang="less" scoped>
.tree-view{
  flex: 9;
  overflow: auto;
}
.slide-detail-enter-active {
  transition: all .3s ease;
}
.slide-detail-leave-active {
  transition: all .3s ease;
}
.slide-detail-enter, .slide-detail-leave-active {
  transform: translate3d(200px,0,0);
  opacity: 0;
}
</style>


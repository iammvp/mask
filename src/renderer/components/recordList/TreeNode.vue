<template>
  <div class="tree-node">
    <div class="tree-branch" v-for="(v,k) in treeData" :key="k">
      <div class="tree-single" :class="{matched: isLastNode(v) && v['record']['isMatched']}" @click="handleClick(v,k)">
        <i :class="getIconClass(v,k)"></i>
        <span class="desc">{{k || '/'}}</span>
      </div>
      <transition name="slide" enter-active-class="animated fadeIn" >
        <treeNode v-if="v.hasOwnProperty('isLast') === false && v['isLast'] !== true" :treeData="v" v-show="isShowCurrentNode(k)"/>
      </transition>
    </div>
  </div>  
</template>

<script>
import { mapMutations } from 'vuex'
export default {
  name: 'treeNode',
  props: {
    treeData: {
      type: Object
    }
  },
  data () {
    return {
      isShowChildren: {}
    }
  },
  methods: {
    ...mapMutations({
      openRecordDetail: 'OPEN_RECORD_DETAIL',
      clickLastTreeNode: 'CLICK_LAST_TREE_NODE'
    }),
    handleClick (v, k) {
      if (this.isLastNode(v)) {
        this.openRecordDetail()
        this.clickLastTreeNode(v['record'])
      } else {
        if (this.isShowChildren.hasOwnProperty(k)) {
          this.isShowChildren[k] = !this.isShowChildren[k]
        } else {
          this.$set(this.isShowChildren, k, true)
        }
      }
    },
    isShowCurrentNode (k) {
      return this.isShowChildren.hasOwnProperty(k) && this.isShowChildren[k]
    },
    isLastNode (v) {
      return v.hasOwnProperty('isLast') && v['isLast'] === true
    },
    getIconClass (v, k) {
      if (this.isLastNode(v)) {
        return 'el-icon-document'
      } else {
        if (this.isShowCurrentNode(k)) {
          return 'el-icon-arrow-down'
        } else {
          return 'el-icon-arrow-right'
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
.tree-node{
  padding-left: 20px;
  .tree-single{
    height: 26px;
    cursor: pointer;
    display: flex;
    align-items: center;
    .desc{
      white-space: nowrap;
    }
    &.matched{
      color:  #67c23a;
    }
  }
}
</style>

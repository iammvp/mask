<template>
  <div class="record-list">
    <!-- <div class="list-type-menu">
      <router-link to="/record-list/tree-view"><el-button>树状列表</el-button></router-link>
      <router-link to="/record-list/sequence-view"><el-button>顺序列表</el-button></router-link>
    </div> -->
    <router-view/>
  </div>  
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex'
import RecordDetail from './RecordDetail'
export default {
  components: {
    RecordDetail
  },
  data () {
    return {
      showRecordDetail: false
    }
  },
  methods: {
    ...mapMutations({
      clickRecord: 'SELECT_RECORD',
      sliceRecords: 'SLICE_RECORDS'
    }),
    handleCurrentRecord (row) {
      this.clickRecord(row)
      if (this.showRecordDetail === false) {
        this.showRecordDetail = true
      }
    },
    highlightMatchedRow ({row}) {
      if (row.isMatched) {
        return 'success-row'
      }
    }
  },
  computed: {
    ...mapState({
      proxySetting: state => state.ProxySetting.proxySetting,
      recordsTree: state => state.Records.recordsTree
    }),
    ...mapGetters({
      records: 'filteredRecords',
      sizeOfRecords: 'sizeOfRecords'
    })
  },
  mounted () {
    this.$store.watch(
      (state) => {
        return this.sizeOfRecords
      },
      (val) => {
        if (val > this.proxySetting.ramSize) {
          console.log(val)
          this.sliceRecords()
        }
      },
      {
        deep: true
      })
  }
}
</script>

<style lang="less">
.record-list{
  height: 100%;
  display: flex;
  flex-direction: column;
  .list-type-menu{
    height: 10%;
    .router-link-active{
      .el-button {
        background-color: #67c23a;
        border-color: #67c23a;
        color:#fff;
      }
    }
  }

}
</style>

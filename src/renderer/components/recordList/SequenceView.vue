<template>
  <div class="sequence-view">
    <el-table
      v-show="records.length !== 0"
      :data="records"
      height="100%"
      @row-click="handleCurrentRecord"
      :row-class-name="highlightMatchedRow"
      style="width: 100%">
      <el-table-column
        prop="fullUrl"
        show-overflow-tooltip
        label="URL">
      </el-table-column>
      <el-table-column
        prop="method"
        width="80"
        label="Method">
      </el-table-column>
      <el-table-column
        prop="statusCode"
        width="80"
        label="Code">
      </el-table-column>
      <el-table-column
        prop="mime"
        show-overflow-tooltip
        width="150"
        label="Mime">
      </el-table-column>
      <el-table-column
        prop="start"
        width="80"
        label="start">
      </el-table-column>
    </el-table>
  <transition name="slide-detail">
    <record-detail v-show="showRecordDetail"></record-detail>
  </transition>
  </div>  
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex'
import RecordDetail from './RecordDetail'
export default {
  components: {
    RecordDetail
  },
  methods: {
    ...mapMutations({
      clickRecord: 'SELECT_RECORD',
      sliceRecords: 'SLICE_RECORDS',
      openRecordDetail: 'OPEN_RECORD_DETAIL',
      closeRecordDetail: 'CLOSE_RECORD_DETAIL'
    }),
    handleCurrentRecord (row) {
      this.clickRecord(row)
      if (this.showRecordDetail === false) {
        this.openRecordDetail()
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
      recordsTree: state => state.Records.recordsTree,
      showRecordDetail: state => state.Records.showRecordDetail
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
  },
  beforeRouteLeave (to, from, next) {
    this.closeRecordDetail()
    next()
  }
}
</script>

<style lang="less">
.sequence-view{
  height: 90%;
  .success-row {
    background-color: #f0f9eb!important;
}
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

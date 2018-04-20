<template>
  <div class="record-list">
    <el-table
      :data="records"
      height="100%"
      @row-click="handleCurrentRecord"
      :row-class-name="highlightMatchedRow"
      style="width: 100%">
      <el-table-column
        prop="url"
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
    <record-detail v-show="showRecordDetail" @closePanel="showRecordDetail = false"></record-detail>
  </transition>
  </div>  
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
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
      clickRecord: 'SELECT_RECORD'
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
    ...mapGetters({
      records: 'filteredRecords'
    })
  }
}
</script>

<style lang="less">
.record-list{
  height: 100%;
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

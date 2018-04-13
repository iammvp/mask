<template>
  <div class="record-list">
    <el-table
      :data="records"
      stripe
      height="100%"
      @row-click="handleCurrentRecord"
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
    <record-detail v-show="showRecordDetail"></record-detail>
  </transition>
  </div>  
</template>

<script>
import { mapState } from 'vuex'
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
    handleCurrentRecord (val) {
      console.log(val)
      this.showRecordDetail = !this.showRecordDetail
    }
  },
  computed: mapState({
    records: state => state.Records.records
  })
}
</script>

<style lang="less" scoped>
.record-list{
  height: 100%;
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

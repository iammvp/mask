<template>
  <div class="record-detail">
    <el-tabs v-model="defaultTab">
      <el-tab-pane label="Request" name="request">
        <request-detail></request-detail>
      </el-tab-pane>
      <el-tab-pane label="Response" name="response">
        <response-detail></response-detail>
      </el-tab-pane>
    </el-tabs>
    <i class="close_panel el-icon-close" @click="closePanel"></i>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import HeadersDetail from './HeadersDetail'
import RequestDetail from './RequestDetail'
import ResponseDetail from './ResponseDetail'
export default {
  name: 'recordDetail',
  components: {
    HeadersDetail,
    RequestDetail,
    ResponseDetail
  },
  data () {
    return {
      defaultTab: 'request'
    }
  },
  methods: {
    ...mapMutations({
      closeRecordDetail: 'CLOSE_RECORD_DETAIL'
    }),
    closePanel () {
      this.closeRecordDetail()
    }
  }
}
</script>

<style lang="less">
.record-detail{
  position: absolute;
  top: 10%;
  right: 0;
  width: 35%;
  height:85%;
  padding: 10px;
  background: #fff;
  box-shadow: -3px 2px 9px rgba(0, 0, 0, 0.4);
  z-index: 10;
  .close_panel{
    position:absolute;
    right:12px;
    top:12px;
    cursor: pointer;
  }
  .el-tabs{
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .el-tabs__content{
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .el-tab-pane{ 
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}
</style>

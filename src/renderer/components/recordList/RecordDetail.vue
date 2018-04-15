<template>
  <div class="record-detail">
    <el-tabs>
      <el-tab-pane label="用户管理" name="first">
        <headers-detail></headers-detail>
      </el-tab-pane>
      <el-tab-pane label="配置管理" name="second">
        <preview-detail></preview-detail>
      </el-tab-pane>
      <el-tab-pane label="配置管理" name="second">
        <response-detail></response-detail>
      </el-tab-pane>
    </el-tabs>
    <i class="close_panel el-icon-close" @click="closePanel"></i>
  </div>
</template>

<script>
import HeadersDetail from './HeadersDetail'
import PreviewDetail from './PreviewDetail'
import ResponseDetail from './ResponseDetail'
export default {
  name:'recordDetail',
  components:{
    HeadersDetail,
    PreviewDetail,
    ResponseDetail
  },
  methods:{
    closePanel(){
      this.$emit('closePanel')
    }
  }
}
</script>

<style lang="less" scoped>
.record-detail{
  position: absolute;
  top: 5%;
  right: 0;
  width: 35%;
  height:95%;
  background: #fff;
  overflow-y: auto;
  box-shadow: -3px 2px 9px rgba(0, 0, 0, 0.4);
  z-index: 10;
  .close_panel{
    position:absolute;
    right:12px;
    top:12px;
    cursor: pointer;
  }
}
</style>

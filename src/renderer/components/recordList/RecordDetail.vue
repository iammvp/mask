<template>
  <div class="record-detail">
    <el-tabs>
      <el-tab-pane label="用户管理" name="first">用户管理</el-tab-pane>
      <el-tab-pane label="配置管理" name="second">配置管理</el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {

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
}
</style>

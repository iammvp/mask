<template>
  <div id="app">
    <el-container class="main-container">
      <el-aside class="app-left">
        <left-menu></left-menu>
      </el-aside>
      <el-container class="app-right">
        <el-header class="app-top-container">
          <app-top></app-top>
        </el-header>
        <el-main class="app-main-container">
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
  import LeftMenu from './components/LeftMenu.vue'
  import AppTop from './components/appTop/AppTop.vue'
  export default {
    name: 'maskApp',
    components: {
      LeftMenu,
      AppTop
    }
  }
</script>

<style lang="less">
*{
  padding: 0;
  margin: 0;
}
a{
  text-decoration: none;
}
html,body{
  height: 100%;
  // max-width: 100%;
  overflow: hidden;
  #app{
    height: 100%;
    position: relative;
    .main-container{
      height: 100%;
      .app-left{
        background: #606266;
        flex:2;
      }
      .app-right{
        flex: 8;
        .app-top-container{
          flex:1;
          display: flex;
          align-items: center;
        }
        .app-main-container{
          flex:9;
        }
      }
    }
  }
}
</style>


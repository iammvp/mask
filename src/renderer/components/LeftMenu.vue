<template>
  <div class="left-menu">
    <router-link to="/"><div class="menu-item">{{$lang.leftMenu.records}}</div></router-link>
    <router-link to="/proxy-rule"><div class="menu-item">{{$lang.leftMenu.rules}}</div></router-link>
  </div>
</template>

<script>
export default {
  name: 'LeftMenu'
}
</script>

<style lang="less" scoped>
  .left-menu{
    display: flex;
    flex-direction: column;
    .menu-item{
      color: #fff;
      height: 65px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      &:hover{
        background: #303133;
      }
    }
    .router-link-exact-active{
      .menu-item{
        background: #303133;
        border-left: 5px solid #67C23A;
      }
    }
  }
</style>


<template>
    <div class="response" v-if="selectedRecord.hasOwnProperty('responseBody')">
      <div class="response-header">
        <p class="title">Header</p>
        <div class="detail">
          <div v-for="(value, key) in selectedRecord.responseHeader" :key="key">
            <b>{{key}}: </b>{{value}}
          </div>
        </div>
      </div>
      <div class="response-body">
        <div class="title">Body</div>
        <p class="from-cache" v-if="selectedRecord.statusCode === 304">数据来自缓存, chrome下 cmd+shfit+r 强刷新</p>
        <pre v-highlightjs="selectedRecord.responseBody" v-else-if="selectedRecord.mime.indexOf('html') !== -1"><code class="javascript"></code></pre>
        <pre v-highlightjs="beautify(selectedRecord.responseBody, { indent_size: 4, space_in_empty_paren: true })" v-else-if="selectedRecord.mime.indexOf('text') !== -1 || selectedRecord.mime === 'application/javascript' || selectedRecord.mime=== 'application/json'"><code class="javascript"></code></pre>
        <div class="image-preiview" v-else-if="selectedRecord.mime.indexOf('image') !== -1">
          <img :src="selectedRecord.responseBody" alt="">
        </div>
      </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
const beautify = require('js-beautify').js
export default {
  data () {
    this.beautify = beautify
    return {}
  },
  computed: {
    ...mapState({
      selectedRecord: state => state.Records.selectedRecord
    }),
    parseJson () {
      let tmp
      try {
        tmp = JSON.parse(this.selectedRecord.responseBody)
      } catch (error) {
        tmp = this.selectedRecord.responseBody
      }
      return this.beautify(tmp, { indent_size: 2, space_in_empty_paren: true })
    }
  }
}
</script>

<style lang="less" scoped>
.response{
  flex: 1;
  display: flex;
  flex-direction: column;
  .response-header{
    border-bottom: 1px solid #d9d9d9;
    padding-bottom:5px;
    max-height: 200px;
    display: flex;
    flex-direction: column;
    .detail{
      float: 1;
      overflow: auto;
    }
  }
  .response-body{
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-top: 5px;
    pre{
      flex: 1;
      overflow: auto;
      background: #F0F0F0;
    }
    .image-preiview{
      overflow: auto;
      display: flex;
      justify-content: center;
      align-content: center;
    }
  }
  .title{
    display: block;
    font-size: 18px;
    border-left: 3px solid #108ee9;
    height: 30px;
    line-height: 30px;
    padding-left: 5px;
    margin-bottom: 10px;
  }
}
</style>

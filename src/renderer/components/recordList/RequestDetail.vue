<template>
    <div class="request" v-if="selectedRecord.hasOwnProperty('requestHeader')">
      <div class="general">
        <p class="title">{{$lang.requestDetail.title.general}}</p>
        <div class="detail">
          <div v-for="(value, key) in generalInfo" :key="key">
              <b>{{key}}: </b>{{value}}
          </div>
        </div>
      </div>
      <div class="request-header">
        <p class="title">{{$lang.requestDetail.title.header}}</p>
        <div class="detail">
          <div v-for="(value, key) in selectedRecord.responseHeader" :key="key">
            <b>{{key}}: </b>{{value}}
          </div>
        </div>
      </div>
      <div class="request-params">
        <p class="title">{{$lang.requestDetail.title.params}}</p>
        <div class="detail" v-if="selectedRecord.queryParams !== null">
          <pre v-highlightjs="beautify(JSON.stringify(selectedRecord.queryParams,null,2), { indent_size: 4, space_in_empty_paren: true })" ><code class="javascript"></code></pre>
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
    generalInfo () {
      return {
        'Request URL': this.selectedRecord.fullUrl,
        'Request Method': this.selectedRecord.method,
        'Status Code': this.selectedRecord.statusCode,
        'Protocol': this.selectedRecord.protocol
      }
    }
  }
}
</script>

<style lang="less" scoped>
.request{
  flex: 1;
  display: flex;
  flex-direction: column;
  .general{
    display: flex;
    flex-direction: column;
    .detail{
      flex: 1;
      overflow: auto;
    }
  }
  .general,.request-header{
    border-bottom: 1px solid #d9d9d9;
    padding-bottom:5px;
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
  .request-header,.request-params{
    flex: 1;
    display: flex;
    flex-direction: column;
    padding-top: 5px;
    .detail{
      flex: 1;
      overflow: auto;
    }
  }
}
</style>

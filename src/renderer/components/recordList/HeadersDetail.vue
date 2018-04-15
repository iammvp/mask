<template>
  <el-collapse >
    <el-collapse-item title="一致性 Consistency" name="1">
        <div><b>Request URL: </b>{{selectedRecord.url}}</div>
        <div><b>Request Method: </b>{{selectedRecord.method}}</div>
        <div><b>Status Code: </b>{{selectedRecord.statusCode}}</div>
        <div><b>Protocol: </b>{{selectedRecord.protocol}}</div>
    </el-collapse-item>
    <el-collapse-item title="Response Header" name="resheaders">
        <div v-for="(value, key) in selectedRecord.responseHeader" :key="key">
            <b>{{key}}: </b>{{value}}
        </div>
    </el-collapse-item>
    <el-collapse-item title="Request Headers" name="reqheaders">
        <div v-for="(value, key) in selectedRecord.requestHeader" :key="key">
            <b>{{key}}: </b>{{value}}
        </div>
    </el-collapse-item>
  </el-collapse>
</template>

<script>
import { mapState } from 'vuex'
export default {
  computed: mapState({
    selectedRecord: state => state.Records.selectedRecord
  })
}
</script>

<style lang="less" scoped>

</style>


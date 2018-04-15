<template>
    <div class="preview" v-if="selectedRecord.hasOwnProperty('mime')">
        <div class="image-preiview" v-if="selectedRecord.mime.indexOf('image') !== -1">
            <img :src="selectedRecord.responseBody" alt="">
        </div>
        <div v-else class="text-preview" v-html="selectedRecord.responseBody">
        </div>
    </div>
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
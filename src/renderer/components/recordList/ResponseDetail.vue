<template>
    <div class="response">
        {{selectedRecord.responseBody}}
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
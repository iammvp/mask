<template>
  <div class="proxy-rule">
    <div class="add-rule-button">
      <el-button icon="el-icon-plus" @click="handleAddNewRule">{{$lang.proxyRule.addRule}}</el-button>
      <!-- addRuleDialog -->
      <el-dialog
        :visible.sync="showAddRuleDialog">
        <span class="title" slot="title">{{$lang.proxyRule.addRule}}</span>
        <el-form label-position="left" :model="newRule" label-width="80px" :rules="rules" ref="addRuleTable">
          <el-form-item :label="$lang.proxyRule.label.desc" prop="desc">
            <el-input v-model="newRule.desc" :placeholder="$lang.proxyRule.descPlaceholder"></el-input>
          </el-form-item>
          <el-form-item :label="$lang.proxyRule.label.match" prop="match">
            <el-input v-model="newRule.match" :placeholder="$lang.proxyRule.matchPlaceholder"></el-input>
          </el-form-item>
          <el-form-item :label="$lang.proxyRule.label.replace" prop="replace">
            <el-col :span="16">
              <el-input v-model="newRule.replace" :placeholder="$lang.proxyRule.replacePlaceholder"></el-input>
            </el-col>
            <el-col :span="8" class="local-file-button">
              <el-button @click="handleSelectLocalFile">{{$lang.proxyRule.localFile}}</el-button>
            </el-col>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="showAddRuleDialog = false">{{$lang.common.cancel}}</el-button>
          <el-button type="primary" @click="handleConfirmClicked">{{$lang.common.confirm}}</el-button>
        </span>
      </el-dialog>
      <!-- addRuleDialog -->
    </div>

    <div class="rule-lists">
      <el-table
      :data="ruleLists"
      v-show="ruleLists.length !== 0"
      stripe
      height="100%"
      style="width: 100%">
      <el-table-column
        prop="isSelected"
        width="80"
        :label="$lang.proxyRule.label.status">
        <template scope="scope"><el-checkbox :checked="scope.row.isSelected" @change="handleSelectionChange(scope.row)"></el-checkbox></template>
      </el-table-column>
      <el-table-column
        show-overflow-tooltip
        prop="desc"
        width="80"
        :label="$lang.proxyRule.label.desc">
      </el-table-column>
      <el-table-column
        show-overflow-tooltip
        prop="match"
        :label="$lang.proxyRule.label.match">
      </el-table-column>
      <el-table-column
        show-overflow-tooltip
        prop="replace"
        :label="$lang.proxyRule.label.replace">
      </el-table-column>
      <el-table-column
        fixed="right"
        :label="$lang.proxyRule.label.action"
        width="100">
        <template slot-scope="scope">
          <el-button @click="handleEditRule(scope.row)" type="text" size="small">{{$lang.common.edit}}</el-button>
          <el-button @click="handleDeleteRule(scope.row)" type="text" size="small" >{{$lang.common.delete}}</el-button>
        </template>
      </el-table-column>
    </el-table>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import {ipcRenderer} from 'electron'
const remote = require('electron').remote
export default {
  data () {
    return {
      showAddRuleDialog: false,
      isEdit: false, // to distinguish edit or add when click confirm button
      editRuleId: '',
      newRule: {
        isSelected: '',
        desc: '',
        match: '',
        replace: ''
      },
      rules: {
        desc: [
          { required: true, message: this.$lang.proxyRule.validation.descRule, trigger: 'blur' }
        ],
        match: [
          { required: true, message: this.$lang.proxyRule.validation.matchRule, trigger: 'blur' }
        ],
        replace: [
          { required: true, message: this.$lang.proxyRule.validation.replaceRule, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    ...mapActions({
      addRuleList: 'addRuleList',
      deleteRuleList: 'deleteRuleList',
      updateRuleList: 'updateRuleList',
      toggleRuleSelection: 'toggleRuleSelection'
    }),
    handleConfirmClicked () {
      this.$refs.addRuleTable.validate(valid => {
        if (valid) {
          if (this.isEdit === false) { // do not triggle add funtion when edit
          // add to database logic
            this.newRule.time = Date.now()
            this.newRule.isSelected = true
            this.addRuleList(this.newRule)
          } else { // edit
            this.updateRuleList({id: this.editRuleId, list: this.newRule})
          }
          this.newRule = {
            isSelected: '',
            desc: '',
            match: '',
            replace: ''
          }
          this.showAddRuleDialog = false
        } else {
          return false
        }
      })
    },
    handleSelectLocalFile () {
      const options = {
        title: 'Select local file',
        properties: ['openFile']
      }
      remote.dialog.showOpenDialog(remote.getCurrentWindow(), options, (filepath) => {
        console.log(filepath)
        if (filepath === undefined) {
          return
        }

        this.newRule.replace = filepath[0]
      })
    },
    handleAddNewRule () {
      this.showAddRuleDialog = true
      this.isEdit = false
      this.newRule = { // reset model
        isSelected: '',
        desc: '',
        match: '',
        replace: ''
      }
    },
    handleDeleteRule (rule) {
      this.deleteRuleList(rule._id)
    },
    handleEditRule (rule) {
      this.showAddRuleDialog = true
      this.isEdit = true
      this.editRuleId = rule._id
      this.newRule = {
        isSelected: rule.isSelected,
        desc: rule.desc,
        match: rule.match,
        replace: rule.replace,
        time: rule.time
      }
    },
    handleSelectionChange (row) {
      this.toggleRuleSelection(row)
    }
  },
  computed: {
    ...mapState({
      ruleLists: state => state.ProxyRule.ruleLists
    })
  },
  mounted () {
    this.$store.watch(
      (state) => {
        return state.ProxyRule.ruleLists
      },
      (val) => {
        // watch ruleLists change an auto restart proxy server
        ipcRenderer.send('needRestartProxyServer')
      },
      {
        deep: true
      })
  }
}
</script>

<style lang="less" scoped>
.proxy-rule{
  height: 100%;
  .add-rule-button{
    height: 10%;
  }
  .rule-lists{
    height: 90%;
  }
  .local-file-button{
    text-align: right;
  }
}
</style>


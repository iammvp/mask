<template>
  <div class="proxy-rule">
    <div class="add-rule-button">
      <el-button icon="el-icon-plus" @click="showAddRuleDialog = true ">默认按钮</el-button>
      <!-- addRuleDialog -->
      <el-dialog
        :visible.sync="showAddRuleDialog">
        <span class="title" slot="title">标题</span>
        <el-form label-position="left" :model="rulesInfo" label-width="80px" :rules="rules" ref="addRuleTable">
          <el-form-item label="描述" prop="desc">
            <el-input v-model="rulesInfo.desc"></el-input>
          </el-form-item>
          <el-form-item label="From" prop="from">
            <el-input v-model="rulesInfo.from"></el-input>
          </el-form-item>
          <el-form-item label="To" prop="to">
            <el-col :span="16">
              <el-input v-model="rulesInfo.to" ></el-input>
            </el-col>
            <el-col :span="8" class="local-file-button">
              <el-button >本地文件</el-button>
            </el-col>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="showAddRuleDialog = false">取 消</el-button>
          <el-button type="primary" @click="handleConfirmClicked()">确 定</el-button>
        </span>
      </el-dialog>
      <!-- addRuleDialog -->
    </div>

    <div class="rule-lists">
      <el-table
      :data="ruleLists"
      stripe
      height="100%"
      style="width: 100%">
      <el-table-column
        prop="status"
        width="80"
        type="selection"
        label="状态">
      </el-table-column>
      <el-table-column
        show-overflow-tooltip
        prop="desc"
        width="80"
        label="描述">
      </el-table-column>
      <el-table-column
        show-overflow-tooltip
        prop="from"
        label="From">
      </el-table-column>
      <el-table-column
        show-overflow-tooltip
        prop="to"
        label="To">
      </el-table-column>
      <el-table-column
        fixed="right"
        label="操作"
        width="100">
        <template slot-scope="scope">
          <el-button @click="handleClick(scope.row)" type="text" size="small">查看</el-button>
          <el-button type="text" size="small">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    </div>
  </div>
</template>

<script>
import testData from './mock.json'
export default {
  data () {
    return {
      showAddRuleDialog: false,
      rulesInfo: {

      },
      // ruleLists: []
      ruleLists: testData.result,
      rules:{
        desc:[
          { required: true, message: '请输入活动名称', trigger: 'blur' }
        ],
        from:[
          { required: true, message: '请输入活动名称', trigger: 'blur' }
        ],
        to:[
          { required: true, message: '请输入活动名称', trigger: 'blur' }
        ],
      }
    }
  },
  methods:{
    handleConfirmClicked(){
      this.$refs.addRuleTable.validate( valid => {
        if(valid){
          // add to database logic
          this.showAddRuleDialog = false
        }else{
          return false
        }
      })
    }
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


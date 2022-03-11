<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>模板管理</el-breadcrumb-item>
      <el-breadcrumb-item>系统模板</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input placeholder="请输入内容"> <el-button slot="append" icon="el-icon-search"></el-button> </el-input>
        </el-col>
        <el-col :span="12"><el-button type="primary" @click="addConfigDialogVisible = true">添加模板</el-button></el-col>
      </el-row>
      <el-table :data="configList" border style="width: 100%">
        <el-table-column type="index" label="序号" width="50px"></el-table-column>
        <el-table-column prop="name" label="模板名称"> </el-table-column>
        <el-table-column prop="image" label="关联镜像"> </el-table-column>
        <el-table-column prop="path" label="文件位置"> </el-table-column>

        <el-table-column fixed="right" label="操作" width="300px">
          <!-- <template> -->
          <template #default="{ row }">
            <el-button type="info" size="small" @click="viewHandler(row)">查看</el-button>
            <el-button type="primary" size="small" @click="editHandler(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDel(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagination.page"
        :page-size="pagination.size"
        layout="total, prev, pager, next, jumper"
        :total="pagination.total"
      >
      </el-pagination>
    </el-card>
    <!-- 增加系统模板 -->
    <el-dialog title="增加模板" :visible.sync="addConfigDialogVisible" @close="resetForm('addConfig')" :before-close="closeHandler" width="70%">
      <el-form ref="addConfig" :model="addConfigForm" :rules="addConfigRules" label-width="100px" border>
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="addConfigForm.name" style="width: 50%"></el-input>
        </el-form-item>
        <el-form-item label="系统镜像" prop="image">
          <el-select v-model="addConfigForm.image" placeholder="请选择关联的系统镜像" style="width: 50%">
            <el-option v-for="item in imageList" :key="item.id" :label="item.name" :value="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="KS文件" prop="config">
          <el-input type="textarea" v-model="addConfigForm.config" :rows="20"></el-input>
        </el-form-item>
        <el-form-item label="校准仓库地址">
          <el-button type="primary" @click="generateURL(addConfigForm)">检查并修改 (必须)</el-button>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addConfigDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addConfigHandler">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 查看系统模板 -->
    <el-dialog title="查看模板" :visible.sync="viewConfigDialogVisible" @close="resetForm('viewConfig')" width="70%">
      <el-form ref="viewConfig" :model="viewConfigForm" label-width="100px">
        <el-form-item label="模板名称">
          <el-input v-model="viewConfigForm.name" style="width: 50%" disabled></el-input>
        </el-form-item>
        <el-form-item label="系统镜像">
          <el-input v-model="viewConfigForm.image" style="width: 50%" disabled></el-input>
        </el-form-item>
        <el-form-item label="存储路径">
          <el-input v-model="viewConfigForm.path" style="width: 50%" disabled></el-input>
        </el-form-item>
        <el-form-item label="KS文件">
          <el-input type="textarea" :disabled="true" v-model="viewConfigForm.config" :rows="25"> </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="viewConfigDialogVisible = false">关 闭</el-button>
      </span>
    </el-dialog>
    <!-- 编辑系统模板 -->
    <el-dialog title="编辑模板" :visible.sync="editConfigDialogVisible" @close="resetForm('editConfig')" :before-close="closeHandler" width="70%">
      <el-form ref="editConfig" :model="editConfigForm" :rules="editConfigRules" label-width="100px">
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="editConfigForm.name" style="width: 50%" disabled></el-input>
        </el-form-item>
        <el-form-item label="系统镜像" prop="image">
          <el-input v-model="editConfigForm.image" style="width: 50%" disabled></el-input>
        </el-form-item>
        <el-form-item label="存储路径">
          <el-input v-model="editConfigForm.path" style="width: 50%" disabled></el-input>
        </el-form-item>
        <el-form-item label="KS文件" prop="config">
          <el-input type="textarea" v-model="editConfigForm.config" :rows="20"></el-input>
        </el-form-item>
        <el-form-item label="校准仓库地址">
          <el-button type="primary" @click="generateURL(editConfigForm)">检查并修改 (必须)</el-button>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editConfigDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editConfigHandler()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getConfigList()
    this.getImageList()
  },
  data() {
    return {
      // 获取列表相关
      imageList: [],
      configList: [],
      // 增加config相关
      addConfigDialogVisible: false,
      addConfigForm: {
        name: '',
        image: '',
        config: '',
        path: '',
        save_path: ''
      },
      addConfigRules: {
        name: [
          { required: true, message: '请输入模板名称', trigger: 'blur' },
          { min: 4, max: 16, message: '长度在 4 到 16 个字符', trigger: 'blur' }
        ],
        image: [{ required: true, message: '请选择系统镜像', trigger: 'change' }],
        config: [{ required: true, message: '请输入配置参数', trigger: 'blur' }]
      },
      // 检查URL相关
      checkTag: 0,
      // 查看config相关
      viewConfigDialogVisible: false,
      viewConfigForm: {
        name: '',
        image: '',
        config: '',
        path: ''
      },
      // 编辑config相关
      editConfigDialogVisible: false,
      editConfigForm: {
        image: '',
        config: ''
      },
      editConfigRules: {
        config: [{ required: true, message: '请输入配置参数', trigger: 'blur' }]
      },
      // 分页相关
      pagination: { page: 1, size: 20, total: 0 } // 设置初始化的分页信息，否则会报错
    }
  },
  methods: {
    // 获取镜像列表
    async getImageList() {
      const { data: response } = await this.$http.get('temp/image/')
      if (response.code) {
        return this.$message.error(response.message)
      }
      this.imageList = response.results
      console.log(this.imageList)
    },
    // 分页处理函数
    handleSizeChange(val) {
      console.log(`每页 ${val}`)
    },
    handleCurrentChange(val) {
      console.log(`当前页： ${val}`)
      this.getConfigList(val)
    },
    // 获取config列表
    async getConfigList(page) {
      if (!page) {
        page = this.pagination.page
      }
      const { data: response } = await this.$http.get(`temp/config/?page=${page}`)
      if (response.code) {
        return this.$message.error(response.message)
      }
      this.configList = response.results
      this.pagination = response.pagination
      console.log(this.configList)
    },
    // 增加config相关
    addConfigHandler() {
      if (!this.checkTag) {
        return this.$message.error('请确保ks文件已经检查通过')
      }
      const name = 'addConfig'
      this.$refs[name].validate(async (valid) => {
        if (valid) {
          console.log(valid, '++++')
          console.log(this.addConfigForm)
          const { data: response } = await this.$http.post('temp/config/', this.addConfigForm)
          if (response.code) {
            return this.$message.error(response.message)
          }
          this.$message.success('模板添加成功')
          this.addConfigDialogVisible = false
          this.checkTag = 0
          this.getConfigList()
        } else {
          this.$message.error('验证失败，请检查内容！')
        }
      })
    },
    handleImageChange() {
      console.log('123')
    },
    // 使用添加的ks文件，去后台检查url是否符合标准，并修改不符合标准的URL
    async generateURL(Form) {
      console.log(Form)
      const { data: response } = await this.$http.post('temp/config/generate/', Form)
      if (response.code) {
        return this.$message.error(response.message)
      }
      // 如果检查成功，标记为1
      this.checkTag = 1
      this.$message.success('检查完成，已经替换URL')
      console.log(Form)
      console.log(response)
      Form.config = response
      console.log(Form)
    },
    // 重置form表单
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    // 处理查看config
    viewHandler(row) {
      this.viewConfigForm = row
      this.viewConfigDialogVisible = true
    },
    // 处理编辑config
    editHandler(row) {
      this.editConfigForm = row
      console.log(this.editConfigForm)
      this.editConfigDialogVisible = true
    },
    //
    editConfigHandler() {
      if (!this.checkTag) {
        return this.$message.error('请确保ks文件已经检查通过')
      }
      console.log(this.editConfigForm)
      const name = 'editConfig'
      this.$refs[name].validate(async (valid) => {
        if (valid) {
          console.log(valid, '++++')
          console.log(this.editConfigForm)
          const { data: response } = await this.$http.patch(`temp/config/${this.editConfigForm.id}/`, this.editConfigForm)
          if (response.code) {
            return this.$message.error(response.message)
          }
          this.$message.success('模板修改成功')
          this.editConfigDialogVisible = false
          this.checkTag = 0
          this.getConfigList()
        } else {
          this.$message.error('验证失败，请检查内容！')
        }
      })
    },
    // 防止点击空白处关闭窗口
    closeHandler() {
      this.$msgbox
        .confirm('关闭窗口将会丢失当前内容, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
          // center: true
        })
        .then(() => {
          this.addConfigDialogVisible = false
          this.editConfigDialogVisible = false
          this.$message.success('关闭窗口成功')
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消关闭窗口'
          })
        })
    },
    // 删除config
    handleDel(id) {
      this.$msgbox
        .confirm('此操作将删除该模板, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        .then(async () => {
          const { data: response } = await this.$http.delete(`temp/config/${id}/`)
          if (response.code) {
            return this.$message.error(response.message)
          }
          this.getConfigList()
          this.$message.success('模板已成功删除')
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    }
  }
}
</script>

<style lang="less" scoped>
.el-dialog .el-form .el-form.item .el-textarea__inner {
  min-height: 500px;
}
// 修改编辑器样式
/deep/ .el-textarea__inner {
  background-color: #303133;
  border-color: #e4e7ed;
  color: #f4f4f5;
  // cursor: not-allowed;
}
// 修改查看样式
/deep/ .el-textarea.is-disabled .el-textarea__inner {
  background-color: #303133;
  border-color: #e4e7ed;
  color: #f4f4f5;
  cursor: not-allowed;
}
/deep/ .el-input.is-disabled .el-input__inner {
  background-color: #e4e7ed;
  border-color: #e4e7ed;
  color: #303133;
  cursor: not-allowed;
}
</style>
<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <!-- <el-breadcrumb-item :to="{ path: '/home' }">设备管理</el-breadcrumb-item> -->
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>设备管理</el-breadcrumb-item>
      <el-breadcrumb-item>准备列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input placeholder="请输入内容" v-model="search"> <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="2"><el-button type="success" @click="getHostList()">手动刷新</el-button></el-col>
      </el-row>
      <el-table ref="multipleTable" row-key="mac" :data="hostList" border style="width: 100%"
        @select="handleSelectionChange">
        <el-table-column type="selection" :reserve-selection="true" width="45"> </el-table-column>
        <el-table-column type="index" label="ID"></el-table-column>
        <el-table-column prop="sn" label="SN" width="180"> </el-table-column>
        <el-table-column prop="vender" label="生厂商"> </el-table-column>
        <el-table-column prop="product" label="产品型号"> </el-table-column>
        <el-table-column prop="os" label="即将安装的系统"> </el-table-column>
        <el-table-column prop="config" label="系统配置"> </el-table-column>
        <el-table-column prop="clientip" label="Client IP"> </el-table-column>
        <el-table-column prop="ipmi" label="IPMI IP"> </el-table-column>
        <!-- <el-table-column prop="join_date" label="加入时间" width="300px"> </el-table-column> -->
        <el-table-column prop="join_date" label="加入时间" width="180">
          <template #default="{ row }">
            <span> {{ row.join_date | dateFmt }}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="200px">
          <template slot-scope="scope">
            <el-button @click="handleEdit(scope.row)" type="info" size="small">编辑</el-button>
            <el-button @click="handleDel(scope.row)" type="danger" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="pagination.page" :page-size="pagination.size" layout="total, prev, pager, next, jumper"
        :total="pagination.total">
      </el-pagination>
      <div style="margin-top: 20px">
        <el-button type="primary" size="small" @click="handleInstall()">立即安装</el-button>
        <el-button type="success" size="small" @click="handleTask()">更改到任务列表</el-button>
        <el-button type="danger" size="small" disabled>关机</el-button>
        <!-- <el-button type="info" size="small">信息导出</el-button> -->
      </div>
      <h2>这里可以修改安装的信息，生成安装菜单</h2>
      <h2>按下【立即安装】后：该列表内的数据"转换"到安装记录表中，然后进行硬件配置，重启BootOS，安装系统等等</h2>
    </el-card>
    <!-- 这里是隐藏的弹出表单 @修改配置 -->
    <el-dialog title="修改配置" :visible.sync="editDialogFormVisible" @close="resetForm('editHost')">
      <el-form :model="editHostForm" :rules="editHostRules" ref="editHost" label-width="100px">
        <el-form-item label="当前设备">
          {{ editHostForm.sn }}
        </el-form-item>
        <el-form-item label="系统模板">
          <el-select v-model="editHostForm.config" placeholder="请选择系统配置模板" @change="handleConfigChange"
            style="width: 50%">
            <el-option v-for="item in configList" :key="item.id" :label="item.name"
              :value="{ name: item.name, path: item.path, image: item.image }"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="danger" @click="editDialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="editHost">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getHostList()
    this.getConfigList()
  },
  data() {
    return {
      hostList: [],
      multipleSelection: [],
      selectArray: [],
      search: null,
      pagination: { page: 1, size: 20, total: 0 }, // 设置初始化的分页信息，否则会报错
      editDialogFormVisible: false,
      editHostForm: {
        sn: '',
        mac: '',
        config: ''
      },
      editHostRules: {},
      configList: []
    }
  },
  methods: {
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    handleSizeChange(val) {
      // console.log(`每页 ${val}`)
    },
    handleCurrentChange(val) {
      // console.log(`当前页： ${val}`)
      this.getHostList(val)
    },
    async getHostList(page) {
      if (!page) {
        page = this.pagination.page
      }
      const { data: response } = await this.$http.get(`install/iprelist/?page=${page}`)
      if (response.code) {
        return this.$message.error(response.message)
      }
      this.hostList = response.results
      this.pagination = response.pagination
      // console.log('======')
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      // console.log('当前被选择的', this.multipleSelection)
    },
    handleInstall() {
      this.selectArray = []
      this.multipleSelection.forEach((row) => {
        this.selectArray.push(row.mac)
      })
      // console.log('进入装机列表的', this.selectArray)
      this.selectArray.forEach(async (mac) => {
        console.log('当前处理的mac地址', mac)
        const { data: response } = await this.$http.post(`/install/iprelist/${mac}/install/`)
        if (response.code) {
          return this.$message.error(response.message)
        }
        this.$message.success(`${mac}已经成功添加到了装机队列`)
        this.getHostList()
      })
      this.selectArray = []
    },
    handleEdit(row) {
      // console.log(row)
      this.editHostForm = row
      this.editDialogFormVisible = true
    },
    async getConfigList() {
      const { data: response } = await this.$http.get('temp/config/')
      if (response.code) {
        return this.$message.error(response.message)
      }
      this.configList = response.results
      console.log(this.configList)
    },
    handleConfigChange() { },
    editHost() {
      // console.log(this.editHostForm)
      const name = 'editHost'
      this.$refs[name].validate(async (valid) => {
        if (valid) {
          const { data: response } = await this.$http.patch(`install/iprelist/${this.editHostForm.mac}/`, this.editHostForm)
          if (response.code) {
            return this.$message.error(response.message)
          }
          this.editDialogFormVisible = false
          this.getHostList(this.pagination.page)
          this.$message.success('配置成功')
        } else {
          this.$message.error('验证失败，请检查内容！')
        }
      })
    },
    handleDelete() { },
    handlePxeboot() { },
    handleDel(row) {
      this.$msgbox
        .confirm('此操作将删除该设备, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
          // center: true
        })
        .then(async () => {
          console.log(row.mac)
          const { data: response } = await this.$http.delete(`install/iprelist/${row.mac}/`)
          if (response.code) {
            return this.$message.error(response.message)
          }
          this.getHostList(this.pagination.page)
          this.$message.success('设备' + row.sn + ' 已成功删除')
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    toggleSelection(rows) {
      if (rows) {
        rows.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    },
    handleTask() {
      console.log('进入任务列表的', this.$refs.multipleTable.selection)
      if (this.$refs.multipleTable.selection.length !== 0) {
        this.$refs.multipleTable.selection.forEach(async (row) => {
          console.log('当前处理的mac地址', row.mac)
          const { data: response } = await this.$http.post(`/install/iprelist/${row.mac}/convert/`)
          if (response.code) {
            return this.$message.error(response.message)
          }
          this.$message.success(`${row.mac}已经成功添加到任务列表`)
          this.$refs.multipleTable.selection.shift() // 配置成功后，就删除掉该值
          this.getHostList()
          console.log('刷新完成了')
        })
      } else {
        this.$message.error('当前未选中任何设备')
      }
    }
  }
}
</script>

<style lang="less">
.my-label {
  background: #4bd107;
}

.my-content {
  background: #fde2fc;
}
</style>
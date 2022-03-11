<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <!-- <el-breadcrumb-item :to="{ path: '/home' }">模板管理</el-breadcrumb-item> -->
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>模板管理</el-breadcrumb-item>
      <el-breadcrumb-item>硬件模板</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input placeholder="请输入内容"> <el-button slot="append" icon="el-icon-search"></el-button> </el-input>
        </el-col>
        <el-col :span="12"><el-button type="primary" @click="addHwdialogVisible = true">增加模板</el-button></el-col>
      </el-row>
      <el-table :data="hwList" border style="width: 100%">
        <el-table-column prop="name" label="硬件名称"> </el-table-column>
        <el-table-column prop="vendor" label="服务器厂商"> </el-table-column>
        <el-table-column prop="model" label="产品型号"> </el-table-column>
        <el-table-column fixed="right" label="操作" width="200px">
          <template>
            <el-button @click="addHwdialogVisible = true" type="info" size="small">详细信息</el-button>
            <el-button type="danger" size="small">删除</el-button>
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
    <!-- 上传镜像的提示框 -->
    <el-dialog title="提示" :visible.sync="addHwdialogVisible" @close="resetForm('addHw')">
      <el-form ref="addHw" :model="addHwForm" :rules="addUserRules" label-width="100px">
        <el-form-item label="硬件名称" prop="name">
          <el-input v-model="addHwForm.name"></el-input>
        </el-form-item>
        <el-form-item label="服务器厂商" prop="vendor">
          <el-input v-model="addHwForm.vendor"></el-input>
        </el-form-item>
        <el-form-item label="产品型号" prop="model">
          <el-input v-model="addHwForm.model"></el-input>
        </el-form-item>
        <el-form-item label="RAID" prop="raid">
          <el-table :data="addHwForm.raid" border>
            <el-table-column prop="model" label="模式"> </el-table-column>
            <el-table-column prop="disks" label="硬盘选择"> </el-table-column>
            <el-table-column prop="info" label="备注"> </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item label="IPMI" prop="ipmi">
          <el-table :data="addHwForm.ipmi" border>
            <el-table-column prop="ipaddr" label="网络配置"> </el-table-column>
            <el-table-column prop="username" label="用户名"> </el-table-column>
            <el-table-column prop="password" label="密码"> </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addHwdialogVisible = false">取 消</el-button>
        <el-button type="primary">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getUserList()
  },
  data() {
    return {
      addHwdialogVisible: false,
      // 重置表单需要初始化和prop
      addHwForm: {
        name: '',
        vendor: '',
        model: '',
        raid: [
          {
            model: 'RAID_1',
            disks: '0 1',
            info: '系统盘'
          },
          {
            model: 'RAID_5',
            disks: '2 3 4 , 5',
            info: '数据盘，5是热备'
          }
        ],
        ipmi: [
          {
            ipaddr: 'static',
            username: 'root',
            password: 'calvin'
          }
        ]
      },
      input3: '',
      hwList: [
        {
          name: 'Dell-R740-Hadoop',
          vendor: 'Dell',
          model: 'R740'
        },
        {
          name: 'Huawei-RH2288HV3-Hadoop',
          vendor: 'Huawei',
          model: 'RH2288H_V3'
        },
        {
          name: 'VM-Test',
          vendor: 'VM',
          model: '虚拟机'
        }
      ],
      pagination: { page: 1, size: 20, total: 0 } // 设置初始化的分页信息，否则会报错
    }
  },
  methods: {
    async getUserList(page = 1) {
      if (!page) {
        page = 1
      }
      const { data: response } = await this.$http.get(`users/?page=${page}`)
      if (response.code) {
        return this.$message.error(response.message)
      }
      this.userList = response.results
      this.pagination = response.pagination
    },
    handleSizeChange(val) {
      console.log(`每页 ${val}`)
    },
    handleCurrentChange(val) {
      console.log(`当前页： ${val}`)
      this.getUserList(val)
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    addUser() {
      console.log(this.addImageForm)
      const name = 'addUser'
      this.$refs[name].validate(async (valid) => {
        if (valid) {
          console.log(valid, '++++')
          const { data: response } = await this.$http.post('users/', this.addImageForm)
          if (response.code) {
            return this.$message.error(response.message)
          }
          this.$message.success('用户添加成功！')
          this.addHwdialogVisible = false
          this.resetForm(name)
          this.getUserList() // 增加成功后刷新一下列表的显示
        } else {
          this.$message.error('验证失败，请重新输入')
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
</style>
<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <!-- <el-breadcrumb-item :to="{ path: '/home' }">设备管理</el-breadcrumb-item> -->
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>设备管理</el-breadcrumb-item>
      <el-breadcrumb-item>预先配置</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-form ref="form" :model="form" label-width="100px">
        <el-form-item label="SN">
          <!-- <el-input v-model="form.sn" placeholder="请输入设备的SN" style="width: 50%"></el-input> -->
          <el-select v-model="form.sn" placeholder="请选择设备的SN" @change="handleSNChange" style="width: 50%">
            <el-option v-for="item in macList" :key="item.id" :label="item.sn" :value="item.mac"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="系统模板">
          <!-- <el-input v-model="form.sn" placeholder="请输入设备的SN" style="width: 50%"></el-input> -->
          <el-select v-model="form.config" placeholder="请选择系统配置模板" @change="handleConfigChange" style="width: 50%">
            <el-option
              v-for="item in configList"
              :key="item.id"
              :label="item.name"
              :value="{ name: item.name, path: item.path, image: item.image }"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="主机名">
          <el-input v-model="form.hostname" placeholder="请输入准备设置的主机名" style="width: 50%"></el-input>
        </el-form-item>
        <el-form-item label="IP地址">
          <el-input v-model="form.ipaddr" placeholder="请输入准备设置的IP地址" style="width: 50%"></el-input>
        </el-form-item> -->
        <!-- <el-form-item label="系统模板">
          <el-select v-model="form.osTemp" placeholder="请选择系统模板">
            <el-option label="CentOS-76" value="CentOS-76"></el-option>
            <el-option label="CentOS-83" value="CentOS-83"></el-option>
          </el-select>
        </el-form-item> -->

        <!-- <el-form-item label="硬件模板">
          <el-select v-model="form.hwconfig" placeholder="请选择硬件模板">
            <el-option label="Dell_R740_Hadoop" value="Dell_R740_Hadoop"></el-option>
            <el-option label="Dell_R740_VM" value="Dell_R740_VM"></el-option>
          </el-select>
        </el-form-item> -->
        <!-- <el-form-item label="配置硬件？">
          <el-switch v-model="form.reboot"></el-switch>
        </el-form-item> -->
        <el-form-item>
          <el-button type="primary" @click="addPreSetting()">立即创建</el-button>
          <el-button>取消</el-button>
        </el-form-item>
      </el-form>
      <el-button type="primary">批量导入</el-button>
      <el-button type="info">下载模板</el-button>
      <h2>这里的SN可以在设备加入到【准备列表】后，可以选择</h2>
      <h2>【批量导入】功能后续开启</h2>
      <h2>创建完成后，后台根据对应的系统配置，生成pxe菜单</h2>
      <h2>这里的系统模板获取应该不带分页信息</h2>
      <h2>增加一个： 是否开启vnc</h2>
    </el-card>
  </div>
</template>

<script>
export default {
  created() {
    this.getMacList()
    this.getConfigList()
  },
  data() {
    return {
      macList: [],
      configList: [],
      form: {
        sn: '',
        hostname: '',
        ipaddr: '',
        config: ''
      }
    }
  },
  methods: {
    async getMacList() {
      const { data: response } = await this.$http.get('install/iprelist/allmac/')
      if (response.code) {
        return this.$message.error(response.message)
      }
      this.macList = response
      console.log(this.macList, 'maclist')
    },
    handleSNChange() {},
    async getConfigList() {
      const { data: response } = await this.$http.get('temp/config/')
      if (response.code) {
        return this.$message.error(response.message)
      }
      this.configList = response.results
      console.log(this.configList)
    },
    handleConfigChange() {},
    addPreSetting() {
      console.log(this.form)
      const name = 'form'
      this.$refs[name].validate(async (valid) => {
        if (valid) {
          console.log(this.customOSForm)
          const { data: response } = await this.$http.patch(`install/iprelist/${this.form.sn}/`, this.form)
          if (response.code) {
            return this.$message.error(response.message)
          }
          this.$message.success('配置成功')
        } else {
          this.$message.error('验证失败，请检查内容！')
        }
      })
    },
    // addCustomOS() {
    //   const name = 'customOS'
    //   this.$refs[name].validate(async (valid) => {
    //     if (valid) {
    //       console.log(valid, '++++')
    //       console.log(this.customOSForm)
    //       const { data: response } = await this.$http.post('temp/cosconfig/', this.customOSForm)
    //       if (response.code) {
    //         return this.$message.error(response.message)
    //       }
    //       this.$message.success('模板添加成功')
    //       this.customOSdialogVisible = false
    //       this.getConfigList()
    //     } else {
    //       this.$message.error('验证失败，请检查内容！')
    //     }
    //   })
    // },
    onSubmit() {
      console.log(this.form)
      console.log('submit!')
    }
  }
}
</script>

<style lang="less" scoped>
</style>
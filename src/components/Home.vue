<template>
  <el-container>
    <el-header>
      <div class="logo">
        <img src="../assets/logo.png" alt="logo" />
        <div class="title">SmartPXE智能部署平台</div>
        <div><i :class="isCollapse ? 'el-icon-s-unfold' : 'el-icon-s-fold'" @click="caidan"></i></div>
      </div>
      <div class="user">
        <!-- 用户的头像 -->
        <div class="user-avator">
          <img src="../assets/logo.png" />
        </div>
        <!-- 用户名下拉菜单 -->
        <el-dropdown @command="handleCommand">
          <span class="el-dropdown-link">{{ user.username }}<i class="el-icon-arrow-down el-icon--right"></i> </span>
          <el-dropdown-menu slot="dropdown">
            <!-- <el-dropdown-item command="chpwd">修改密码</el-dropdown-item> -->
            <el-dropdown-item divided command="logout">退出登陆</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <!-- 这里是隐藏的弹出表单 @修改当前用户密码 -->
        <el-dialog title="修改用户密码" :visible.sync="chpwdDialogFormVisible" @close="resetForm('chpwdUser')">
          <el-form :model="chpwdUserForm" :rules="chpwdUserRules" ref="chpwdUser" label-width="100px">
            <el-form-item label="用户名">
              {{ user.username }}
            </el-form-item>
            <el-form-item label="旧密码" prop="oldPassword">
              <el-input v-model="chpwdUserForm.oldPassword"></el-input>
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input v-model="chpwdUserForm.newPassword"></el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="checkpass">
              <el-input v-model="chpwdUserForm.checkpass"></el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="danger" @click="chpwdDialogFormVisible = false">取 消</el-button>
            <el-button type="primary" @click="chpwdUser(user.id)">确 定</el-button>
          </div>
        </el-dialog>
      </div>
    </el-header>
    <el-container>
      <!-- 侧边栏配置 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <el-menu
          :collapse="isCollapse"
          :collapse-transition="false"
          background-color="#123"
          text-color="#fff"
          active-text-color="#ffd04b"
          :router="true"
          :default-active="this.$route.path"
          :unique-opened="true"
        >
          <el-submenu index="1">
            <template slot="title">
              <i class="el-icon-s-home"></i>
              <span>首页</span>
            </template>
            <el-menu-item index="/dashboard">Dashboard</el-menu-item>
            <el-menu-item index="/discovered">发现设备</el-menu-item>
          </el-submenu>

          <el-submenu index="2">
            <template slot="title">
              <i class="el-icon-monitor"></i>
              <span>设备管理</span>
            </template>
            <el-menu-item index="/presettings" disabled>预先配置</el-menu-item>
            <el-menu-item index="/prelist">准备列表</el-menu-item>
            <el-menu-item index="/installing">正在安装</el-menu-item>
            <el-menu-item index="/installed">安装记录</el-menu-item>
          </el-submenu>

          <el-submenu index="3">
            <template slot="title">
              <i class="el-icon-suitcase-1"></i>
              <span>任务管理</span>
            </template>
            <el-menu-item index="/hostlist">主机列表</el-menu-item>
            <el-menu-item index="/tasktemps">任务模板</el-menu-item>
            <el-menu-item index="/taskresult">任务记录</el-menu-item>
          </el-submenu>

          <el-submenu index="4">
            <template slot="title">
              <i class="el-icon-notebook-1"></i>
              <span>模板管理</span>
            </template>
            <el-menu-item index="/images">镜像模板</el-menu-item>
            <el-menu-item index="/ostemps">系统模板</el-menu-item>
            <el-menu-item index="/hwtemps" disabled>硬件模板</el-menu-item>
          </el-submenu>
          <!-- 动态生成的菜单栏--开始 -->
          <!-- <el-submenu v-for="item in menulist" :index="item.id + ''" :key="item.id">
            <template slot="title"
              ><i class="el-icon-user-solid"></i><span>{{ item.itemName }}</span></template
            >
            <el-menu-item v-for="subItem in item.children" :index="subItem.path" :key="subItem.id">
              <template slot="title">
                <span slot="title"> {{ subItem.itemName }}</span>
              </template>
            </el-menu-item>
          </el-submenu> -->
          <!-- 动态生成的菜单栏-结束 -->
        </el-menu>
      </el-aside>
      <!-- 主页部分配置 -->
      <el-main>
        <!-- 主页内部使用嵌套路由切换页面的显示 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  // 创建页面时的回调函数
  created() {
    // this.getMenuList()
    // this.getUserInfo()
    console.log(this.$route.path, '000')
  },
  // 双向绑定的数据
  data() {
    // 验证新密码是否确认过
    const validateNewPass = (rule, value, callback) => {
      if (value !== this.chpwdUserForm.newPassword) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    // 验证新密码是否与旧密码相同
    const validateOldpass = (rule, value, callback) => {
      if (value === this.chpwdUserForm.oldPassword) {
        callback(new Error('新密码不能与旧密码相同！'))
      } else {
        callback()
      }
    }
    return {
      menulist: [],
      isCollapse: false,
      user: {},
      // 修改用户密码
      chpwdUserForm: {
        oldPassword: '',
        newPassword: '',
        checkpass: ''
      },
      chpwdDialogFormVisible: false,
      chpwdUserRules: {
        oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 4, max: 16, message: '长度在 4 到 16个字符', trigger: 'blur' },
          { validator: validateOldpass, trigger: 'blur' }
        ],
        checkpass: [
          { required: true, message: '请确认新密码', trigger: 'blur' },
          { validator: validateNewPass, trigger: 'blur' }
        ]
      } // 验证旧密码是否与新密码相同，如果相同则报错
    }
  },
  // 事件处理函数
  methods: {
    resetForm(formName) {
      // 表单关闭时需要进行内容重置
      this.$refs[formName].resetFields()
    },
    logout() {
      window.localStorage.removeItem('token')
      this.$message('退出成功！')
      this.$router.push('/login')
    },
    // 动态获取侧边栏菜单
    async getMenuList() {
      const { data: response } = await this.$http.get('users/menulist/')
      //   console.log(response)
      //   console.log(response.code)
      // 如果返回的code码有问题，那么就直接return message弹窗
      if (response.code) {
        return this.$message.error(response.message)
      }
      // 如果没有问题，那么将response.data => menulist
      this.menulist = response.data
      console.log(this.menulist)
    },
    // 菜单折叠按钮
    caidan() {
      this.isCollapse = !this.isCollapse
    },
    // 用户名下拉菜单选择事件
    handleCommand(command) {
      if (command === 'chpwd') {
        this.chpwdDialogFormVisible = true
      } else if (command === 'logout') {
        this.logout()
      }
    },
    // 应该先判断密码是否正确，如果不正确，则不允许修改
    chpwdUser(id) {
      const name = 'chpwdUser'
      this.$refs[name].validate(async (valid) => {
        if (valid) {
          const { data: response } = await this.$http.post(`users/mgr/${id}/setpwd/`, this.chpwdUserForm)
          if (response.code) {
            return this.$message.error(response.message)
          }
          this.$message.success('修改密码成功')
          this.chpwdDialogFormVisible = false
        }
      })
    },
    async getUserInfo() {
      const { data: response } = await this.$http.get('users/mgr/whoami/')
      if (response.code) {
        return this.$message.error(response.message)
      }
      this.user = response.user
    }
  }
}
</script>

<style lang="less" scoped>
.el-container {
  height: 100%;
}
.el-header {
  //   background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 5px;
  .logo {
    display: flex;
    img {
      width: 30px;
    }
    .title {
      font-size: 24px;
      margin-left: 5px;
    }
    i {
      font-size: 30px;
      margin-left: 10px;
    }
  }
  .user {
    display: flex;
    img {
      width: 30px;
    }
  }
}

.el-aside {
  background-color: #123;
}

.el-main {
  background-color: #f0f2f5;
}
.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
}
.el-icon-arrow-down {
  font-size: 12px;
}
.el-menu {
  border-right: none;
}
/* body > .el-container {
  margin-bottom: 40px;
}

.el-container:nth-child(5) .el-aside,
.el-container:nth-child(6) .el-aside {
  line-height: 260px;
}

.el-container:nth-child(7) .el-aside {
  line-height: 320px;
} */
</style>
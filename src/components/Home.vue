<template>
  <el-container class="home_container">

    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logOut">退出</el-button>
    </el-header>
    
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '65px' : '200px'">
        <div class="toggle_button" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#323743"
          text-color="#fff"
          active-text-color=""
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 一级菜单模板区域 -->
          <el-submenu
            :index="m.id.toString()"
            v-for="m in menuList"
            :key="m.id"
          >
            <template slot="title">
              <!-- 一级菜单图标 -->
              <i :class="iconsList[m.id]"></i>
              <!-- 文本 -->
              <span>{{ m.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + item.path"
              v-for="item in m.children"
              :key="item.id"
              @click="saveNavState('/' + item.path)"
            >
              <template slot="title">
                <!-- 二级菜单图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{ item.authName }}</span>
              </template></el-menu-item
            >
          </el-submenu>
        </el-menu>
      </el-aside>

      <!-- 主体区 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      //左侧菜单数据
      menuList: [],
      iconsList: {
        125: 'el-icon-user',
        103: 'el-icon-s-operation',
        101: 'el-icon-shopping-bag-1',
        102: 'el-icon-s-order',
        145: 'el-icon-s-data',
      },
      //是否折叠
      isCollapse: false,
      //被激活的链接地址
      activePath:''
    }
  },
  created() {
    this.getMenuList()
    // this.activePath = window.sessionStorage.getItem('activePath')
    this.activePath = this.$route.path
  },
  methods: {
    logOut() {
      window.sessionStorage.removeItem('token') //销毁token
      this.$router.replace('/login')
      this.$message({
        type: 'warning',
        message: '退出成功',
        center: true,
      })
    },
    //获取所有菜单
    getMenuList() {
      this.$http.get('menus').then((res) => {
        if (res.status !== 200) return this.$message.error(res.data.meta.msg)
        this.menuList = res.data.data
      })
    },
    //点击按钮 切换菜单的折叠和展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    //保存链接的激活状态
    saveNavState(activePath){
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  },
}
</script>
<style lang="less" scoped>
.home_container {
  height: 100%;
  i {
    margin-right: 10px;
  }
}
.el-header {
  background-color: #363d40;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.toggle_button {
  background-color: #485162;
  color: #fff;
  text-align: center;
  font-size: 10px;
  line-height: 24px;
  letter-spacing: 0.2em; //使每个竖线之间间隔0.2em
  cursor: pointer;
}
.el-aside {
  background-color: #313743;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #e9edf1;
}
</style>




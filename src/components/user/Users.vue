<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 添加与搜索区域 -->
      <el-row :gutter="20">
        <el-col :span="8"
          ><div>
            <el-input
              clearable
              placeholder="请输入内容"
              v-model="queryInfo.query"
              @clear="getUserList"
            >
              <el-button
                slot="append"
                icon="el-icon-search"
                @click="getUserList"
              ></el-button
            ></el-input></div
        ></el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="用户名"> </el-table-column>
        <el-table-column prop="role_name" label="管理权限"> </el-table-column>
        <el-table-column prop="email" label="邮箱"> </el-table-column>
        <el-table-column prop="mobile" label="电话"> </el-table-column>
        <!-- <el-table-column prop="mg_state" label="状态"> 使用了作用域插槽，prop不生效 -->
        <el-table-column label="状态">
          <template v-slot="scope">
            <!-- {{scope.row}} -->
            <!-- {{scope.$index}} 获取当前行的index -->
            <!-- {{scope.column}} -->
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChange(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template v-slot="scope">
            <!-- 编辑按钮 -->
            <el-button
              @click="showEditDialog(scope.row.id)"
              type="primary"
              icon="el-icon-edit"
              size="mini"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              @click="removeUserById(scope.row.id)"
              type="danger"
              icon="el-icon-delete"
              size="mini"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip
              :enterable="false"
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
            >
              <el-button
                @click="setRole(scope.row)"
                type="warning"
                icon="el-icon-setting"
                size="mini"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 3, 5]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog
      title="添加用户"
      @close="addDialogClosed"
      :visible.sync="addDialogVisible"
      width="50%"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog
      @close="editDialogClosed"
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!--分配角色的对话框 -->
    <el-dialog
    @close="setRoleDialogClosed"
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
    >
      <div>当前的用户： {{ userInfo.username }}</div>
      <div>当前的角色：{{ userInfo.role_name }}</div>
      <div>
        分配新角色:
        <el-select v-model="selectedRoleId" placeholder="请选择">
          <el-option
            v-for="item in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'User',
  created() {
    this.getUserList()
  },
  data() {
    //验证邮箱的规则
    const checkEmail = (rule, value, callback) => {
      const regEmail =
        /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/
      if (regEmail.test(value)) return callback() //合法邮箱
      callback(new Error('请输入合法的邮箱'))
    }

    //验证手机号的规则
    const checkMobile = (rule, value, callback) => {
      const regMobile = /^1[3|4|5|7|8][0-9]{9}$/
      if (regMobile.test(value)) return callback() //合法邮箱
      callback(new Error('请输入合法的手机号'))
    }
    return {
      //获取用户列表的参数对象
      queryInfo: {
        query: '',
        //当前的页数
        pagenum: 1,
        pagesize: 2,
      },
      //用户列表
      userList: [],
      //总人数
      total: 0,
      //控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      //添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      //添加表单的验证规则对象
      addFormRules: {
        username: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur',
          },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' },
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur',
          },
          {
            min: 6,
            max: 15,
            message: '长度在 6 到 15 个字符',
            trigger: 'blur',
          },
        ],
        email: [
          {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur',
          },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机号',
            trigger: 'blur',
          },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },
      //控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      //查询到用户的信息对象
      editForm: {},
      //修改用户信息表单的验证规则对象
      editFormRules: {
        email: [
          {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur',
          },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机号',
            trigger: 'blur',
          },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },
      //控制删除用户对话框的显示与隐藏
      deleteDialogVisible: false,
      //删除用户信息
      deleteForm: {},
      //控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      //需要被分配角色的用户信息
      userInfo: {},
      //所有角色的数据列表
      rolesList: [],
      //已选中的角色id值
      selectedRoleId: '',
    }
  },
  methods: {
    //获取用户列表
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取当前用户列表失败')
      }
      this.userList = res.data.users
      this.total = res.data.total
    },
    //监听pagesize 改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    //监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    //监听switch开关状态的变化
    async userStateChange(userInfo) {
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态失败！')
      }
      //更新状态成功
      this.$message.success({
        message: '更新用户状态成功！',
        center: true,
      })
    },
    //监听添加用户对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    //点击按钮添加新用户
    addUser() {
      this.$refs.addFormRef.validate((valid) => {
        // console.log(valid)
        if (!valid) return
        //可以发起添加用户的网路请求
        this.$http.post('/users', this.addForm).then((res) => {
          if (res.data.meta.status !== 201)
            return this.$message.error(res.data.meta.msg)
          this.$message.success({
            message: '添加用户成功！',
          })
          //添加成功后 将Dialog隐藏
          this.addDialogVisible = false
          //重新获取用户列表数据
          this.getUserList()
        })
      })
    },
    //展示编辑用户的对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(`/users/${id}`)
      if (res.meta.status !== 200)
        return this.$message.error('查询用户信息失败！')
      this.editForm = res.data

      this.editDialogVisible = true
    },
    //监听修改用户信息对话框的关闭事件
    editDialogClosed() {
      //重置表单
      this.$refs.editFormRef.resetFields()
    },
    //修改用户信息并提交
    editUserInfo() {
      //预验证
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error('表单信息格式不正确')
        //发起请求，提交表单
        const { data: res } = await this.$http.put(
          `/users/${this.editForm.id}`,
          { email: this.editForm.email, mobile: this.editForm.mobile }
        )
        if (res.meta.status !== 200)
          return this.$message.error({
            message: res.meta.msg,
            center: true,
          })
        //关闭对话框
        this.editDialogVisible = false
        //重新获取用户列表数据
        this.getUserList()
        //修改成功
        this.$message.success({
          message: '修改用户信息成功',
        })
      })
    },
    //根据id删除用户信息
    async removeUserById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '删除用户',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      if (confirmResult !== 'confirm') return this.$message.info('取消了删除')
      const { data: res } = await this.$http.delete('/users/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除失败！')
      this.$message.success('删除成功！')
      this.getUserList()
    },
    //分配角色对话框显示与隐藏
    async setRole(userInfo) {
      this.setRoleDialogVisible = true
      this.userInfo = userInfo
      //在分配角色前获取所有角色列表
      const { data: res } = await this.$http.get('/roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
    },
    //点击按钮，分配角色
    saveRoleInfo() {
      if (!this.selectedRoleId) return this.$message.error('请选择要分配的角色')
      this.$http
        .put(`/users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
        .then((res) => {
          if(res.status !==200) {
            return this.$message.error(res.data.msg)
          }
          this.$message.success('分配角色成功')
          this.getUserList()
          this.setRoleDialogVisible = false
        })
    },
    //关闭对话框后清空已选择的id和用户信息
    setRoleDialogClosed(){
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  },
}
</script>

<style lang="less">
.el-select {
  margin-left: 10px;
}
</style>

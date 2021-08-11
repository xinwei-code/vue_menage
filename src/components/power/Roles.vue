<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
      <el-breadcrumb-item>角色管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe style="width: 100%">
        <!-- 展开行 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <!-- 栅格系统 -->
            <el-row
              :class="['bdbottom', item2 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, item2) in scope.row.children"
              :key="item1.id"
            >
              <!-- 第一列 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  @close="removeRolesById(scope.row, item1.id)"
                  closable
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环 嵌套渲染二级权限 -->
                <el-row
                  :class="[index == 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item3, index) in item1.children"
                  :key="item3.id"
                >
                  <el-col :span="6">
                    <el-tag
                      @close="removeRolesById(scope.row, item3.id)"
                      closable
                      type="success"
                      >{{ item3.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      @close="removeRolesById(scope.row, item4.id)"
                      closable
                      type="warning"
                      v-for="item4 in item3.children"
                      :key="item4.id"
                      >{{ item4.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"> </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button icon="el-icon-edit" size="mini" type="primary"
              >编辑</el-button
            >
            <el-button icon="el-icon-delete" size="mini" type="danger"
              >删除</el-button
            >
            <el-button
              @click="showSetRightDialog(scope.row)"
              v-model="roleId"
              icon="el-icon-setting"
              size="mini"
              type="warning"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限的对话框 -->
    <el-dialog
      @close="setDialogClosed"
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
    >
      <!-- 树形控件 -->
      <el-tree
        ref="treeRef"
        :default-checked-keys="defKeys"
        default-expand-all
        node-key="id"
        show-checkbox
        :data="rightsList"
        :props="treeProps"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'Roles',
  created() {
    this.getRolesList()
  },
  data() {
    return {
      rolesList: [],
      //分配权限对话框显示与隐藏属性
      setRightDialogVisible: false,
      //权限列表
      rightsList: [],
      //树形控件指定的数据绑定对象
      treeProps: {
        children: 'children',
        label: 'authName',
      },
      //默认选中的节点的id值数组
      defKeys: [],
      //保存分配权限对应角色的id
      roleId: '',
    }
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('/roles')
      if (res.meta.status !== 200)
        return this.$message.error('获取角色权限列表失败')
      this.rolesList = res.data
    },
    //通过id删除权限
    async removeRolesById(role, rightId) {
      //弹框提示用户是否删除权限
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)

      if (confirmResult !== 'confirm')
        return this.$message.info('已取消删除权限')
      //用户点击了确定，发起请求删除权限
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status != 200) {
        return this.$message.error('删除失败，请重试')
      }
      //重新获取权限列表
      // this.getRolesList()  //会导致局部刷新
      role.children = res.data
    },
    //展示分配权限的对话框
    async showSetRightDialog(role) {
      //保存分配权限对应角色的id
      this.roleId = role.id
      //获取所有权限
      const { data: res } = await this.$http.get('/rights/tree')
      if (res.meta.status !== 200) {
        return this.$$message.error('获取权限数据失败')
      }
      //获取到的权限数据保存到data中
      this.rightsList = res.data
      //递归获取三级节点的id
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    //通过递归的形式， 获取角色下所有三级权限的id，并保存到defKeys数组中
    getLeafKeys(node, arr) {
      //如果当前的 node 节点中不包含children属性， 则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr)
      })
    },
    //监听分配权限对话框的关闭事件
    setDialogClosed() {
      this.defKeys = []
    },
    //点击确定为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      //将数组转成字符串，以逗号拼接
      const idStr = keys.join(',')
      // 发起请求
      const { data: res } = await this.$http.post(
        `/roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) return this.$message.error('分配权限失败！')
      //提示更新成功
      this.$message.success('分配权限成功！')
      //隐藏对话框
      this.setRightDialogVisible = false
      //重新获取角色权限列表
      this.getRolesList()
    },
  },
}
</script>

<style>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
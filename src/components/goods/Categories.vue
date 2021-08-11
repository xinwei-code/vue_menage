<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 按钮 -->
      <el-row>
        <el-col>
          <el-button @click="showAddCateDialog" type="primary"
            >添加分类</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <tree-table
        class="treetable"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        :show-row-hover="false"
        border
        index-text="#"
      >
        <!-- 第一个模板：是否有效 -->
        <template v-slot:isok="scope">
          <i
            class="el-icon-success"
            style="color: green"
            v-if="scope.row.cat_deleted === false"
          ></i>
          <i class="el-icon-error" style="color: red" v-else></i>
        </template>

        <!-- 第二个模板：排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" v-else>三级</el-tag>
        </template>

        <!-- 第三个模板列：操作 -->
        <template slot="operate" slot-scope="scope">
          <el-button
            @click="showEditCateDialog(scope.row.cat_id)"
            size="mini"
            type="primary"
            icon="el-icon-edit"
            >编辑</el-button
          >
          <el-button
            @click="deleteCate(scope.row.cat_id)"
            size="mini"
            type="danger"
            icon="el-icon-delete"
            >删除</el-button
          >
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum + 1"
        :page-sizes="[5, 7, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      @close="addCateDialogClosed"
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
    >
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- 不需要验证规则可以删掉prop -->
          <!-- options用来指定数据源 -->
          <!-- props用来指定配置对象 -->
          <el-cascader
            change-on-select
            clearable
            v-model="seletedKeys"
            :options="parentCateList"
            :props="{
              expandTrigger: 'hover',
              value: 'cat_id',
              label: 'cat_name',
              children: 'children',
            }"
            @change="parentCateChange"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类的对话框 -->
    <el-dialog
      @close="editCateDialogClosed"
      title="修改分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
    >
      <el-form
        :model="editCateForm"
        :rules="editCateFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Categories',
  data() {
    return {
      //商品分类的列表，默认为空
      cateList: [],
      //查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      //总数据条数
      total: 0,
      //为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
        },
        {
          label: '是否有效',
          //将当前的列定义为模板列
          type: 'template',
          //表示当前这一列使用模板名称
          template: 'isok',
        },
        {
          label: '排序',
          //将当前的列定义为模板列
          type: 'template',
          //表示当前这一列使用模板名称
          template: 'order',
        },
        {
          label: '操作',
          //将当前的列定义为模板列
          type: 'template',
          //表示当前这一列使用模板名称
          template: 'operate',
        },
      ],
      //控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      //添加分类的表单数据对象
      addCateForm: {
        // 将要添加分类的名称
        cat_name: '',
        //父级分类的id
        cat_pid: 0,
        //分类的等级，默认要添加的是一级分类
        cat_level: 0,
      },
      //添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
        ],
      },
      //父级分类的列表
      parentCateList: [],
      //选中的父级分类的id数组
      seletedKeys: [],
      // 控制编辑分类对话框的显示与隐藏
      editCateDialogVisible: false,
      //修改分类表单数据对象
      editCateForm: {
        cat_name: '',
        cat_id: '',
      },
      //修改分类表单验证规则
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //获取商品分类数据
    getCateList() {
      this.$http.get('/categories', { params: this.queryInfo }).then((res) => {
        if (res.data.meta.status !== 200)
          return this.$message.error('获取商品分类数据失败')
        //把数据列表赋值给 cateList
        this.cateList = res.data.data.result
        this.queryInfo.pagenum = res.data.data.pagenum
        this.queryInfo.pagesize = res.data.data.pagesize
        //为总数据条数赋值
        this.total = res.data.data.total
      })
    },
    //监听 pagenum的改变
    handleSizeChange(val) {
      this.queryInfo.pagesize = val
      this.getCateList()
    },
    handleCurrentChange(val) {
      this.queryInfo.pagenum = val
      this.getCateList()
    },
    //点击按钮，显示添加分类的对话框
    showAddCateDialog() {
      //先获取数据分类的列表
      this.getParentCateList()
      //显示对话框
      this.addCateDialogVisible = true
    },
    //获取第一第二级的商品列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('/categories', {
        params: { type: 2 },
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败')
      }
      this.parentCateList = res.data
    },
    //选择项发生变化触发这个函数
    parentCateChange() {
      //如果seletedKeys.length大于0，则说明选中了父级分类
      //反之没有选中任何父级分类
      if (this.seletedKeys.length > 0) {
        //父级分类的id
        this.addCateForm.cat_pid = this.seletedKeys[this.seletedKeys.length - 1]
        //为当前分类的等级赋值
        this.addCateForm.cat_level = this.seletedKeys.length
        return
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    //点击按钮，添加新的分类
    addCate() {
      this.$refs.addCateFormRef.validate((valid) => {
        if (!valid) return
        this.$http.post('categories', this.addCateForm).then((res) => {
          if (res.data.meta.status !== 201)
            return this.$message.error('添加分类失败!')
          this.$message.success('添加分类成功！')
          //重新获取分类列表
          this.getCateList()
          //隐藏对话框
          this.addCateDialogVisible = false
        })
      })
    },
    //监听添加分类对话框的关闭事件
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.seletedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    //点击按钮，显示编辑分类对话框
    showEditCateDialog(id) {
      //先根据id查询分类
      this.$http.get(`categories/${id}`).then((res) => {
        if (res.data.meta.status !== 200)
          return this.$message.error('查询该分类失败！')
        //保存id
        this.editCateForm.cat_id = res.data.data.cat_id
      })
      this.editCateDialogVisible = true
    },
    //提交修改分类的请求
    editCate() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.editCateForm.cat_id}`,
          { cat_name: this.editCateForm.cat_name }
        )
        console.log(res)
        if (res.meta.status !== 200)
          return this.$message.error('修改分类失败！')
        this.$message.success('修改分类成功！')
        this.getCateList()
        this.editCateDialogVisible = false
      })
    },
    //监听修改分类对话框的关闭事件
    editCateDialogClosed() {
      this.editCateForm.cat_name = ''
      this.$refs.editFormRef.resetFields()
    },
    //删除分类
    deleteCate(id) {
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        //先判断confirmResult是否为'confirm',再发请求
        .then(() => {
          this.$http.delete(`categories/${id}`).then((res) => {
            console.log(res.data);
            if (res.data.meta.status !== 200)
              return this.$message.error('删除失败！')
            this.getCateList()
            this.$message({
              type: 'success',
              message: '删除成功!',
            })
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          })
        })
    },
  },
}
</script>

<style>
.treetable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
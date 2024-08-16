<template>
  <section class="wrap">
    <el-form
      ref="ruleForm"
      :model="ruleForm"
      :rules="rules"
      label-width="120px"
      class="demo-ruleForm"
    >
      <el-form-item label="标题" prop="title">
        <el-input v-model="ruleForm.title" />
      </el-form-item>
      <el-form-item label="文章路径" prop="article_path">
        <el-input v-model="ruleForm.article_path" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="ruleForm.description" />
      </el-form-item>
      <el-form-item label="SEO关键字" prop="seo_keyword">
        <el-input v-model="ruleForm.seo_keyword" />
      </el-form-item>
      <el-form-item label="图片" prop="img_url">
        <el-upload
          class="avatar-uploader"
          :limit="1"
          name="file"
          :action="uploadUrl"
          :headers="{
            ['Authorization']: encodeToken()
          }"
          :show-file-list="false"
          :on-success="handleUploadSuccess"
        >
          <img
            v-if="ruleForm.img_url"
            width="80"
            height="80"
            :src="ruleForm.img_url"
            class="avatar"
          >
          <i v-else class="el-icon-plus avatar-uploader-icon" />
        </el-upload>
      </el-form-item>
      <el-form-item label="展示" prop="status">
        <el-radio-group v-model="ruleForm.status">
          <el-radio :label="1">显示</el-radio>
          <el-radio :label="0">隐藏</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="分类" prop="category_id">
        <el-select v-model="ruleForm.category_id" placeholder="请选择分类">
          <el-option
            v-for="item in categoryList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="排序" prop="sort_order">
        <el-input v-model="ruleForm.sort_order" />
      </el-form-item>
      <el-form-item label="内容" prop="content">
        <mavon-editor
          ref="md"
          v-model="ruleForm.content"
          code-style="atom-one-dark"
          @imgAdd="$imgAdd"
          @imgDel="$imgDel"
        />
      </el-form-item>

      <el-form-item>
        <el-button @click="resetForm('ruleForm')">重置</el-button>
        <el-button
          type="primary"
          @click="submitForm('ruleForm')"
        >立即创建</el-button>
      </el-form-item>
    </el-form>
  </section>
</template>

<script>
import { mapState } from 'vuex'
import { create } from '@/api/article'
import { uploadImage } from '@/api/upload'
import { list } from '@/api/category'
import axios from 'axios'
import { encodeToken } from '@/utils/auth'

export default {
  name: 'CategoryCreate',
  data() {
    return {
      token: '',
      categoryList: [],
      uploadUrl: process.env.VUE_APP_BASE_API + '/upload/images',
      ruleForm: {
        title: '',
        article_path: '',
        description: '',
        img_url: '',
        seo_keyword: '',
        status: 1,
        sort_order: 1,
        admin_id: '',
        category_id: '',
        content: ''
      },
      rules: {
        title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
        description: [
          { required: true, message: '请输入文章描述', trigger: 'blur' }
        ],
        article_path: [
          { required: true, message: '请输入文章路径', trigger: 'blur' }
        ],
        img_url: [
          { required: true, message: '请输入图片链接', trigger: 'blur' }
        ],
        seo_keyword: [
          { required: true, message: '请输入 SEO 关键字', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请输入展示状态', trigger: 'blur' }
        ],
        sort_order: [
          { required: true, message: '请输入文章排序', trigger: 'blur' }
        ],
        category_id: [
          { required: true, message: '请选择分类', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入文章内容', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapState({
      adminInfo: (state) => state.admin.adminInfo
    })
  },
  mounted() {
    this.$axios = axios.create({ withCredentials: false })
    this.getCategoryList()
  },
  methods: {
    encodeToken,
    // 上传图片成功回调
    handleUploadSuccess(res) {
      this.ruleForm.img_url = res.data.img_url
      this.$message.success('上传成功!')
    },
    // 编辑器删除图片回调
    $imgDel(pos, $file) {
      console.log(pos, $file)
    },
    // 编辑器新增上传图片回调
    async $imgAdd(pos, $file) {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })

      // 第一步.将图片上传到服务器.
      const formdata = new FormData()
      formdata.append('file', $file)

      try {
        const res = await uploadImage(formdata)
        this.$refs.md.$img2Url(pos, res.data.img_url)
        loading.close()
      } catch (e) {
        console.log(e)
        loading.close()
      }
    },
    // 获取分类列表
    async getCategoryList() {
      try {
        this.listLoading = true
        const res = await list()
        this.categoryList = res.data.data
      } catch (err) {
        console.log(err)
      } finally {
        this.listLoading = false
      }
    },
    // 提交表单
    submitForm(formName) {
      if (this.adminInfo) {
        this.ruleForm.admin_id = this.adminInfo.id
      }

      this.$refs[formName].validate(async(valid) => {
        if (valid) {
          this.createArticle()
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    // 重置表单
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    // 创建文章
    async createArticle() {
      try {
        const res = await create(this.ruleForm)
        if (res.code === 200) {
          this.$msgbox
            .confirm('创建成功，是否退出创建文章页面', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'success'
            })
            .then(() => {
              this.$router.push('/article/index')
            })
        }
      } catch (err) {
        this.$message.error(err)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.wrap {
  box-sizing: border-box;
  margin: 24px;
}
</style>
<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>

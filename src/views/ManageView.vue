<script setup lang="ts">
import { RouterView, useRoute, useRouter } from 'vue-router'
import { onMounted, reactive, ref, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { type ChangePassword } from '@/types'
import { logoutPost, userPasswordChange } from '@/api/user'
import { errorHandle } from '@/utils/responseHandle';


const router = useRouter()
const logout = () => {
  logoutPost().then((response) => {
    if (response.status === 200) {
      ElMessage.success({ message: "Logout success!" })
    }
  }).finally(() => {
    sessionStorage.removeItem('token')
    username.value = ''
    router.replace('/login')
  })
}

const username = ref('')
onMounted(() => {
  username.value = localStorage.getItem('username') || "undefined"
})

const activeMenu = ref(useRoute().path)
const route = useRoute()
watch(() => route.path, (newPath) => {
  activeMenu.value = newPath
})

// change password
const handleChangePassword = () => {
  dialogChangePwdVisible.value = true
}

const dialogChangePwdVisible = ref(false)
const ruleFormRef = ref<FormInstance>()
const form = ref<ChangePassword>({
  password: '',
  new_password: '',
  new_password_confirm: ''
})
const rules = reactive<FormRules<ChangePassword>>({
  password: [
    { required: true, message: 'Please input password', trigger: 'blur' },
    { min: 6, max: 64, message: 'Length should be 6 to 64', trigger: 'change' }
  ],
  new_password: [
    { required: true, message: 'Please input new password', trigger: 'blur', },
    { min: 6, max: 64, message: 'Length should be 6 to 64', trigger: 'change' }
  ],
  new_password_confirm: [
    { required: true, message: 'Please input new password confirm', trigger: 'blur', },
    { min: 6, max: 64, message: 'Length should be 6 to 64', trigger: 'change' }
  ]
})

const changePassword = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (!valid) return
    userPasswordChange(form.value)
      .then(function (response) {
        if (response.status === 200) {
          ElMessage.success({
            message: "Change password success!"
          })
          dialogChangePwdVisible.value = false
          logout()
        }
      })
      .catch(function (error) {
        ElMessage.error({
          message: errorHandle(error.response.data, "Change password failed!")
        })
      })
  })
}

</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-aside width="200px">
        <el-menu :default-active="activeMenu" class="el-menu-vertical-demo" router>
          <el-menu-item index="/api">
            <el-icon>
              <Key />
            </el-icon>
            <span>API Management</span>
          </el-menu-item>
          <el-menu-item index="/role">
            <el-icon>
              <CollectionTag />
            </el-icon>
            <span>Role Management</span>
          </el-menu-item>
          <el-menu-item index="/user">
            <el-icon>
              <User />
            </el-icon>
            <span>User Management</span>
          </el-menu-item>
          <el-menu-item index="/operate-log">
            <el-icon>
              <Notebook />
            </el-icon>
            <span>Operate Log</span>
          </el-menu-item>
          <el-menu-item index="/security-log">
            <el-icon>
              <Lock />
            </el-icon>
            <span>Security Log</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header height="60px">
          <el-dropdown @command="(args: () => void) => { args() }">
            <span class="el-dropdown-link">
              {{ username }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="handleChangePassword">Update password</el-dropdown-item>
                <el-dropdown-item :command="logout" divided>Logout</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-header>
        <el-main>
          <RouterView />
        </el-main>
      </el-container>
    </el-container>
  </div>
  <!-- change password modal -->
  <el-dialog v-model="dialogChangePwdVisible" title="Change password" width="500">
    <el-form ref="ruleFormRef" :model="form" :rules="rules" label-width="auto">
      <el-form-item label="Password" prop="password" required>
        <el-input v-model="form.password" type="password" show-password />
      </el-form-item>
      <el-form-item label="NewPassword" prop="new_password" required>
        <el-input v-model="form.new_password" type="password" show-password />
      </el-form-item>
      <el-form-item label="NewPasswordConfirm" prop="new_password_confirm" required>
        <el-input v-model="form.new_password_confirm" type="password" show-password />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogChangePwdVisible = false">Cancel</el-button>
        <el-button type="primary" @click="changePassword(ruleFormRef)">
          Change
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.el-header {
  text-align: right;
}

.el-menu-item {
  margin: 10px;
}
</style>

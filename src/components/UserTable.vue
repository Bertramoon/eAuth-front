<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue'
import {Plus, Search} from '@element-plus/icons-vue'
import EAuthTable from "@/components/EAuthTable.vue";
import type {AxiosResponse} from "axios";
import {isSuccess} from "@/utils/responseHandle"
import {usePageStore} from "@/stores/page";
import {ElMessage, type FormInstance, type FormRules} from "element-plus";
import {userRegisterCall, userResetCall, updateUserCall} from "@/api/user";
import type {User, UserRegister, UserUpdate} from "@/types/user";

// 定义传参数据
const emit = defineEmits<{
  (e: 'loadUser', currentPage: number, pageSize: number, search?: string): void
  (e: 'selectionChange', val: Array<User>): void,
  (e: 'handleGrant', user: User): void,
}>()
withDefaults(defineProps<{
  hasAdd: boolean,
  hasBind: boolean,
  hasSelect: boolean,
  height: string
}>(), {
  hasAdd: false,
  hasBind: false,
  hasSelect: false,
  height: "75vh"
})
const userList = defineModel<Array<User>>('userList')
const total = defineModel<number>('total')

// 初始化数据
onMounted(() => {
  loadData()
})

// 搜索框
const searchText = ref<string>()
const loadData = () => {
  emit("loadUser",
      currentPage.value,
      pageStore.pageSize,
      searchText.value
  )
}

// 分页
const pageStore = usePageStore()
const currentPage = ref<number>(1)

const userOptions = [
  {
    prop: "id",
    label: "Id",
    minWidth: 15,
    sortable: false,
    showOverflowTooltip: false
  },
  {
    prop: "username",
    label: "Username",
    minWidth: 25,
    sortable: true,
    showOverflowTooltip: false
  },
  {
    prop: "email",
    label: "Email",
    minWidth: 35,
    sortable: true,
    showOverflowTooltip: false
  }
]

// 过滤locked列
const filterLocked = (value: true, row: User) => {
  return row.locked === value
}

// 禁用用户
const handleLocked = (row: User) => {
  updateUserCall(row.id, {
    email: row.email,
    locked: row.locked
  }).then((response: AxiosResponse) => {
    if (isSuccess(response.data)) {
      if (row.locked) {
        ElMessage.success({
          message: "Locked user success!"
        })
      } else {
        ElMessage.success({
          message: "Unlocked user success!"
        })
      }
      dialogUpdateUserFormVisible.value = false
      loadData()
    }
  })
}

/**
 * 创建用户
 */
const dialogCreateUserFormVisible = ref(false)
const createRuleFormRef = ref<FormInstance>()
const registerForm = ref<UserRegister>({
  username: '',
  email: ''
})

const registerUser = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (!valid) return
    userRegisterCall(registerForm.value)
        .then((response: AxiosResponse) => {
          if (isSuccess(response.data)) {
            ElMessage.success({
              message: "Register user success!"
            })
            dialogCreateUserFormVisible.value = false
            loadData()
          }
        })
  })
}

const createUserRules = reactive<FormRules<UserRegister>>({
  username: [
    {required: true, message: 'Please input username', trigger: 'blur'},
    {min: 1, max: 20, message: 'Length should be 1 to 20', trigger: 'change'}
  ],
  email: [
    {required: true, message: 'Please input email', trigger: 'blur'},
    {min: 1, max: 320, message: 'Length should be 1 to 320', trigger: 'change'}
  ]
})

/**
 * 修改用户
 */
const currentUser = ref<User>()
const dialogUpdateUserFormVisible = ref<boolean>(false)
const dialogUpdateUserTitle = ref<string>()
const updateUserForm = ref<UserUpdate>({
  email: "",
  locked: false
})
const updateRuleFormRef = ref<FormInstance>()
const updateUserRules = reactive<FormRules<UserUpdate>>({
  locked: [
    {required: true, message: 'Please select locked switch', trigger: 'blur'},
  ],
  email: [
    {required: true, message: 'Please input email', trigger: 'blur'},
    {min: 1, max: 320, message: 'Length should be 1 to 320', trigger: 'change'}
  ]
})

const updateUser = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (!valid) return
    if (!currentUser.value?.id) {
      ElMessage.warning({
        message: "Can't get current user"
      })
      return
    }
    console.log(updateUserForm.value)
    updateUserCall(currentUser.value.id, updateUserForm.value)
        .then((response: AxiosResponse) => {
          if (isSuccess(response.data)) {
            ElMessage.success({
              message: "Update user success!"
            })
            dialogUpdateUserFormVisible.value = false
            loadData()
          }
        })
  })
}

/**
 * 增删改按钮handle
 */
const handleCreate = () => {
  registerForm.value = {
    username: "",
    email: ""
  }
  createRuleFormRef.value?.clearValidate()
  dialogCreateUserFormVisible.value = true
}

const handleEdit = (index: number, row: User) => {
  dialogUpdateUserTitle.value = "Update user: " + row.username
  updateRuleFormRef.value?.clearValidate()
  currentUser.value = row
  updateUserForm.value = {
    email: row.email,
    locked: row.locked
  }
  dialogUpdateUserFormVisible.value = true
}

const handleReset = (index: number, row: User) => {
  userResetCall({email: row.email})
      .then((response: AxiosResponse) => {
        if (isSuccess(response.data)) {
          ElMessage.success({
            message: "Reset user success!"
          })
        }
      })
}
</script>
<template>
  <!-- table display -->
  <e-auth-table
      v-model:data="userList"
      :options="userOptions"
      v-model:current-page="currentPage"
      v-model:page-size="pageStore.pageSize"
      :page-sizes="pageStore.pageSizes"
      v-model:total="total"
      :table-height="height"
      @handle-current-change="loadData"
      @selection-change="(val: Array<User>) => $emit('selectionChange', val)"
      :has-select="hasSelect"
  >
    <template #header>
      <!-- search && create button -->
      <el-col :span="8" style="padding-right: 10px;">
        <el-input v-model="searchText" placeholder="Search user by username or email" @keyup.enter="loadData"
                  size="small"/>
      </el-col>
      <el-col :span="4">
        <el-button type="primary" :icon="Search" class="search" plain
                   @click="loadData" size="small">Search
        </el-button>
      </el-col>
      <el-col :span="12" style="text-align: right;" v-if="hasAdd">
        <el-button type="primary" plain @click="handleCreate" size="small" :icon="Plus">
          Add user
        </el-button>
      </el-col>
    </template>
    <template #options>
      <slot name="options">
        <el-table-column prop="locked" label="Locked" min-width="30" sortable :filters="[
                { text: 'true', value: true },
                { text: 'false', value: false }
            ]" :filter-method="filterLocked">
          <template #default="scope">
            <el-switch v-model="scope.row.locked" @change="handleLocked(scope.row)"/>
          </template>
        </el-table-column>
        <el-table-column label="Options">
          <template #default="scope">
            <el-button size="small" plain @click="handleEdit(scope.$index, scope.row)">Edit</el-button>
            <el-button type="primary" size="small" plain @click="$emit('handleGrant', scope.$index, scope.row)"
                       v-if="hasBind">Grant
            </el-button>
            <el-popconfirm width="220" confirm-button-text="Confirm" cancel-button-text="Cancel"
                           title="Are you sure to reset this user?" @confirm="handleReset(scope.$index, scope.row)">
              <template #reference>
                <el-button size="small" type="danger" plain>
                  Reset
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </slot>
    </template>
  </e-auth-table>
  <!--  update user dialog -->
  <el-dialog v-model="dialogUpdateUserFormVisible" :title="dialogUpdateUserTitle" width="500">
    <el-form ref="updateRuleFormRef" :model="updateUserForm" :rules="updateUserRules" label-width="auto">
      <el-form-item label="Email" prop="email" required>
        <el-input v-model="updateUserForm.email"/>
      </el-form-item>
      <el-form-item label="Locked" prop="locked" required>
        <el-switch v-model="updateUserForm.locked"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogUpdateUserFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="updateUser(updateRuleFormRef)">
          Update
        </el-button>
      </div>
    </template>
  </el-dialog>
  <!-- create user dialog -->
  <el-dialog v-model="dialogCreateUserFormVisible" title="Register user" width="500">
    <el-form ref="createRuleFormRef" :model="registerForm" :rules="createUserRules" label-width="auto">
      <el-form-item label="Username" prop="username" required>
        <el-input v-model="registerForm.username"/>
      </el-form-item>
      <el-form-item label="Email" prop="email" required>
        <el-input v-model="registerForm.email"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogCreateUserFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="registerUser(createRuleFormRef)">
          Register
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<style scoped>
</style>
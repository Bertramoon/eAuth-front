<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElTable, type FormRules, type FormInstance } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { type UserReset, type Role, type User, type UserRegister, type UserUpdate } from '@/types'
import { lightRolesGet, userGet, userRegister, userUpdate, userGrant, userReset } from '@/api/user'
import { errorHandle } from '@/utils/responseHandle'


// 初始化数据
onMounted(() => {
    loadUser()
})

// 搜索框
const searchText = ref('')
const search = () => {
    loadUser(searchText.value)
}

// 注册用户
const dialogCreateUserFormVisible = ref(false)
const createRuleFormRef = ref<FormInstance>()
const registerForm = ref<UserRegister>({
    username: '',
    email: ''
})
const handleCreateUser = () => {
    registerForm.value = {
        username: '',
        email: ''
    }
    createRuleFormRef.value?.clearValidate()
    dialogCreateUserFormVisible.value = true
}

const registerUser = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
        if (!valid) return
        userRegister(registerForm.value)
            .then(function (response) {
                if (response.status === 201) {
                    ElMessage.success({
                        message: "Register user success!"
                    })
                    dialogCreateUserFormVisible.value = false
                    loadUser()
                }
            })
            .catch(function (error) {
                ElMessage.error({
                    message: errorHandle(error.response.data, "Register user failed!")
                })
            })
    })
}

const createUserRules = reactive<FormRules<UserRegister>>({
    username: [
        { required: true, message: 'Please input username', trigger: 'blur' },
        { min: 1, max: 20, message: 'Length should be 1 to 20', trigger: 'change' }
    ],
    email: [
        { required: true, message: 'Please input email', trigger: 'blur' },
        { min: 1, max: 320, message: 'Length should be 1 to 320', trigger: 'change' }
    ]
})

// 重置用户
const resetUser = (index: number, row: User) => {
    console.log(row.email)
    userReset({ email: row.email })
        .then(function (response) {
            if (response.status === 200) {
                ElMessage.success({
                    message: "Reset user success!"
                })
            }
        })
        .catch(function (error) {
            ElMessage.error({
                message: errorHandle(error.response.data, "Reset user failed!")
            })
        })
}


// 表格
const userList = ref<Array<User>>([])

// 过滤locked列
const filterLocked = (value: true, row: User) => {
    return row.locked === value
}

// 修改locked值
const handleLocked = (row: User) => {
    userUpdate(row.id, {
        email: row.email,
        locked: row.locked
    }).then(function (response) {
        if (response.status === 201) {
            ElMessage.success({
                message: "Update user success!"
            })
            dialogUpdateUserFormVisible.value = false
            loadUser()
        }
    }).catch(function (error) {
        ElMessage.error({
            message: errorHandle(error.response.data, "Update user failed!")
        })
        row.locked = !row.locked
    })
}

// 查看拥有的角色
const dialogRoleTableVisible = ref(false)
const dialogRoleTableTitle = ref("Roles by user")
const rolesByUser = ref<Array<Role>>([])

const handleInfo = (index: number, row: User) => {
    rolesByUser.value = row.roles || []
    dialogRoleTableTitle.value = "Roles by user: " + row.username
    dialogRoleTableVisible.value = true
}

// 编辑用户基本信息
const dialogUpdateUserFormVisible = ref(false)
const dialogUpdateUserTitle = ref("Update user")
const updateRuleFormRef = ref<FormInstance>()
const updateUserForm = ref<UserUpdate>({
    email: '',
    locked: false
})

const handleEdit = (index: number, row: User) => {
    updateUserForm.value = {
        email: row.email,
        locked: row.locked
    }
    updateRuleFormRef.value?.clearValidate()
    currentUser.value = row
    dialogUpdateUserTitle.value = "Update user: " + row.username
    dialogUpdateUserFormVisible.value = true
}

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
        userUpdate(currentUser.value.id, updateUserForm.value)
            .then(function (response) {
                if (response.status === 201) {
                    ElMessage.success({
                        message: "Update user success!"
                    })
                    dialogUpdateUserFormVisible.value = false
                    loadUser()
                }
            })
            .catch(function (error) {
                ElMessage.error({
                    message: errorHandle(error.response.data, "Update user failed!")
                })
            })
    })
}


const updateUserRules = reactive<FormRules<UserUpdate>>({
    locked: [
        { required: true, message: 'Please select locked switch', trigger: 'blur' },
    ],
    email: [
        { required: true, message: 'Please input email', trigger: 'blur' },
        { min: 1, max: 320, message: 'Length should be 1 to 320', trigger: 'change' }
    ]
})

// 用户授权
const dialogBindRolesVisible = ref(false)
const dialogBindRolesTitle = ref('')
const currentUser = ref<User>()
// 穿梭框
const bindRolesList = ref<Array<number>>([])
interface Option {
    key: number
    label: string
}
const generateData = (): Option[] => {
    const data: Option[] = []
    let temp: Role[] = []
    lightRolesGet().then((response) => {
        if (response.status === 200 && response.data.success === true) {
            temp = response.data.data
            temp.forEach(item => {
                data.push({
                    key: item.id,
                    label: item.name
                })
            })
        }
    }).catch(function (error) {
        ElMessage.error({
            message: errorHandle(error.response.data, "Get roles failed that which can bind!")
        })
    })
    return data
}
const roleList = ref(generateData())


const handleGrant = (index: number, row: User) => {
    dialogBindRolesTitle.value = "Bind roles for user: " + row.username
    dialogBindRolesVisible.value = true
    currentUser.value = row
    bindRolesList.value = currentUser.value.roles?.map(item => item.id) || []
}

const grantPermission = () => {
    console.log("grant", bindRolesList.value)
    userGrant(currentUser.value!.id, { ids: bindRolesList.value })
        .then((response) => {
            if (response.status === 201 && response.data.success === true) {
                ElMessage.success({
                    message: "Grant success!"
                })
                dialogBindRolesVisible.value = false
                loadUser()
            }
        }).catch(function (error) {
            ElMessage.error({
                message: errorHandle(error.response.data, "Grant failed!")
            })
        })
}


// 分页
const pageSize = ref(20)
const currentPage = ref(1)
const total = ref(0)

const handleCurrentChange = () => {
    loadUser()
}

// 公共
const loadUser = (search?: string) => {
    userGet({
        page: currentPage.value,
        per_page: pageSize.value,
        username: search
    }).then((response) => {
        if (response.status === 200 && response.data.success === true) {
            userList.value = response.data.data
            total.value = response.data.pagination.total
        }
    }).catch(function (error) {
        if (error.response.status === 404 && currentPage.value > 1) {
            currentPage.value--
            loadUser(search)
            return
        }
        // 如果最后还是404，将结果置空
        if (error.response.status === 404) {
            userList.value = []
            total.value = 0
            return
        }
        ElMessage.error({
            message: errorHandle(error.response.data, "Get user info failed!")
        })
    })
}
</script>
<template>
    <!-- search && create button -->
    <el-row>
        <el-col :span="8">
            <el-input v-model="searchText" placeholder="Search User" />
        </el-col>
        <el-col :span="4">
            <el-button type="primary" :icon="Search" class="search" plain @click="search">Search</el-button>
        </el-col>
        <el-col :span="12" style="text-align: right;">
            <el-button type="primary" plain @click="handleCreateUser">Register user</el-button>
        </el-col>
    </el-row>
    <!-- table display -->
    <el-scrollbar class="main-table">
        <el-table :data="userList" style="width: 100%" :default-sort="{ prop: 'id', order: 'ascending' }">
            <el-table-column prop="id" label="Id" min-width="15" sortable />
            <el-table-column prop="username" label="Username" min-width="30" sortable />
            <el-table-column prop="email" label="Email" min-width="50" sortable />
            <el-table-column prop="locked" label="Locked" min-width="30" sortable :filters="[
                { text: 'true', value: true },
                { text: 'false', value: false }
            ]" :filter-method="filterLocked">
                <template #default="scope">
                    <el-switch v-model="scope.row.locked" @change="handleLocked(scope.row)" />
                </template>
            </el-table-column>
            <el-table-column label="Operations">
                <template #default="scope">
                    <el-button size="small" @click="handleInfo(scope.$index, scope.row)" plain type="info">
                        Roles
                    </el-button>
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)" plain>
                        Edit
                    </el-button>
                    <!-- set roles -->
                    <el-button size="small" @click="handleGrant(scope.$index, scope.row)" plain>
                        Grant
                    </el-button>
                    <el-popconfirm width="220" confirm-button-text="Confirm" cancel-button-text="Cancel"
                        title="Are you sure to reset user?" @confirm="resetUser(scope.$index, scope.row)">
                        <template #reference>
                            <el-button size="small" type="danger" plain>
                                Reset
                            </el-button>
                        </template>
                    </el-popconfirm>
                </template>
            </el-table-column>
        </el-table>
    </el-scrollbar>
    <!-- pagination -->
    <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" size="large"
            layout="total, prev, pager, next" :total="total" @current-change="handleCurrentChange"
            @size-change="handleCurrentChange" />
    </div>
    <!-- modal -->
    <!-- create user dialog -->
    <el-dialog v-model="dialogCreateUserFormVisible" title="Register user" width="500">
        <el-form ref="createRuleFormRef" :model="registerForm" :rules="createUserRules" label-width="auto">
            <el-form-item label="Username" prop="username" required>
                <el-input v-model="registerForm.username" />
            </el-form-item>
            <el-form-item label="Email" prop="email" required>
                <el-input v-model="registerForm.email" />
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
    <!-- update user dialog -->
    <el-dialog v-model="dialogUpdateUserFormVisible" :title="dialogUpdateUserTitle" width="500">
        <el-form ref="updateRuleFormRef" :model="updateUserForm" :rules="updateUserRules" label-width="auto">
            <el-form-item label="Email" prop="email" required>
                <el-input v-model="updateUserForm.email" />
            </el-form-item>
            <el-form-item label="Locked" prop="locked" required>
                <el-switch v-model="updateUserForm.locked" />
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
    <!-- view user's role dialog -->
    <el-dialog v-model="dialogRoleTableVisible" :title="dialogRoleTableTitle" width="800">
        <el-scrollbar class="modal-table">
            <el-table :data="rolesByUser" :default-sort="{ prop: 'id', order: 'ascending' }">
                <el-table-column prop="id" label="Id" sortable min-width="20" />
                <el-table-column prop="name" label="Name" min-width="50" />
                <el-table-column prop="description" label="Description" show-overflow-tooltip />
            </el-table>
        </el-scrollbar>
    </el-dialog>
    <!-- grant role dialog -->
    <el-dialog v-model="dialogBindRolesVisible" :title="dialogBindRolesTitle">
        <el-transfer v-model="bindRolesList" filterable :titles="['Unbind roles', 'Will bind roles']"
            :button-texts="['Remove roles', 'Add roles']" :data="roleList" style="text-align: center"
            filter-placeholder="Search role">
        </el-transfer>
        <template #footer>
            <div class="dialog-footer" style="text-align: center;">
                <el-button type="primary" @click="grantPermission">
                    Grant
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>
<style scoped>
.pagination-container {
    margin-top: 10px;
}

.main-table {
    /*表格显示区域，适配1080p 100%比例缩放下*/
    height: 700px;
}

.modal-table {
    height: 400px;
}

.search {
    margin-left: 10px;
}
</style>
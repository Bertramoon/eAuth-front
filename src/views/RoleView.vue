<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElTable, type FormRules, type FormInstance } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import {type Api, type Role, type RoleInput, type User} from '@/types'
import { getRole, createRole, updateRole, deleteRole, getRoleUnbindApi, roleBindApi, roleUnbindApi } from '@/api/role'
import { errorHandle } from '@/utils/responseHandle'


// 初始化数据
onMounted(() => {
    loadRole()
})

// 搜索框
const searchText = ref('')
const search = () => {
    loadRole()
}

// 添加角色
const addTitle = "Add Role"
const operation = ref('')
const dialogTitle = ref("")
const openCreateRoleDialog = () => {
    operation.value = "Create"
    dialogTitle.value = "Create Role"
    form.value = {
        id: 0,
        name: '',
        description: ''
    }
    ruleFormRef.value?.clearValidate()

    dialogRoleFormVisible.value = true
}

// 表格
const roleList = ref<Array<Api>>([])
const ruleFormRef = ref<FormInstance>()

const rules = reactive<FormRules<RoleInput>>({
    name: [
        { required: true, message: 'Please input role name', trigger: 'blur' },
        { min: 1, max: 30, message: 'Length should be 1 to 30', trigger: 'change' }
    ]
})

// 查看拥有的API
const dialogApiTableVisible = ref(false)
const dialogApiTableTitle = ref("APIs by this role")
const apisByRole = ref<Array<Api>>([])

const handleApiView = (index: number, row: Role) => {
    apisByRole.value = row.apis || []
    dialogApiTableVisible.value = true
    dialogApiTableTitle.value = "APIs by role: " + row.name
}

// 查看拥有的User
const dialogUserTableVisible = ref(false)
const dialogUserTableTitle = ref("APIs by this role")
const usersByRole = ref<Array<User>>([])

const handleUserView = (index: number, row: Role) => {
  usersByRole.value = row.users || []
  dialogUserTableVisible.value = true
  dialogUserTableTitle.value = "Users by role: " + row.name
}

// 编辑API
const handleEdit = (index: number, row: Role) => {
    operation.value = "Save"
    dialogTitle.value = "Update role: " + row.name
    ruleFormRef.value?.clearValidate()
    form.value = { ...row }
    dialogRoleFormVisible.value = true
}

// 绑定API
const dialogBindApiVisible = ref(false)
const dialogBindApiTitle = ref('')
const bindApiTableRef = ref<InstanceType<typeof ElTable>>()
const bindApiSelection = ref<Array<Api>>([])
const unbindApiList = ref<Array<Api>>([])
const currentBindApiRole = ref<Role>()

// -分页
const unbindApiPageSizes = [20, 50, 100, 200]
const unbindApiCurrentPage = ref(1)
const unbindApiPageSize = ref(20)
const unbindApiTotal = ref(0)


const handleBind = (index: number, row: Role) => {
    dialogBindApiTitle.value = "Bind APIs for role: " + row.name
    currentBindApiRole.value = row
    unbindApiCurrentPage.value = 1
    // 将搜索值设置为空
    bindApiSearchText.value = ""
    bindApiSearchMethod.value = undefined
    loadUnbindApi(row.id).then(() => {
        dialogBindApiVisible.value = true
        bindApiSearchMethod.value = undefined
        bindApiSearchText.value = ""
    })
    if (bindApiTableRef.value) {
        bindApiTableRef.value.clearSelection()
    }
}

const handleUnbindApiCurrentChange = () => {
    loadUnbindApi(currentBindApiRole.value!.id)
}

const handleBindSelectionChange = (val: Array<Api>) => {
    bindApiSelection.value = val
}

const bindApi = () => {
    roleBindApi(currentBindApiRole.value!.id, { "ids": bindApiSelection.value.map(api => api.id) })
        .then((response) => {
            if (response.status === 201 && response.data.success === true) {
                ElMessage.success({ message: "Bind APIs success!" })
                dialogBindApiVisible.value = false
                loadRole()
            }
        })
        .catch(function (error) {
            ElMessage.error({
                message: errorHandle(error.response.data, "Bind api failed!")
            })
        })
}

// -搜索API
const bindApiSearchMethod = ref<string>()
const bindApiSearchText = ref('')
const bindSearch = () => {
    loadUnbindApi(currentBindApiRole.value!.id)
}

function differenceBy(arr1: Array<any>, arr2: Array<any>, key: string) {
    const set2 = new Set(arr2.map(item => item[key]));
    return arr1.filter(item => !set2.has(item[key]));
}

function sameBy(arr1: Array<any>, arr2: Array<any>, key: string) {
    const set2 = new Set(arr2.map(item => item[key]));
    return arr1.filter(item => set2.has(item[key]));
}

const loadUnbindApi = (roleId: number) => {
    return getRoleUnbindApi(roleId, {
        page: unbindApiCurrentPage.value,
        per_page: unbindApiPageSize.value,
        search: bindApiSearchText.value,
        method: bindApiSearchMethod.value
    }).then((response) => {
        if (response.status === 200 && response.data.success === true) {
            unbindApiList.value = response.data.data
            unbindApiTotal.value = response.data.pagination.total
        }
    }).catch(function (error) {
        if (error.response.status === 404 && currentPage.value > 1) {
            unbindApiCurrentPage.value--
            loadUnbindApi(roleId)
            return
        }
        // 如果最后还是404，将结果置空
        if (error.response.status === 404) {
            unbindApiList.value = []
            unbindApiTotal.value = 0
            return
        }
        ElMessage.error({
            message: errorHandle(error.response.data, "Get unbind api failed!")
        })
    })
}

const toggleSelection = async (rows?: Api[]) => {
    if (!bindApiTableRef.value) return
    if (rows) {
        rows.forEach((row) => {
            bindApiTableRef.value!.toggleRowSelection(row, true)
        })
    }
}


// 解绑API
const dialogUnbindApiVisible = ref(false)
const dialogUnbindApiTransferTitlePrefix = "Unbind APIs for "
const dialogUnbindApiTitle = ref('')
const unbindApiTableRef = ref<InstanceType<typeof ElTable>>()
const unbindApiSelection = ref<Array<Api>>([])
const bindApiList = ref<Array<Api>>([])
const currentUnbindApiRole = ref<Role>()


const handleUnbind = (index: number, row: Role) => {
    dialogUnbindApiTitle.value = "Unbind APIs for role: " + row.name
    currentUnbindApiRole.value = row
    unbindApiSearchText.value = ""
    unbindApiSearchMethod.value = undefined
    bindApiList.value = currentUnbindApiRole.value.apis || []
    dialogUnbindApiVisible.value = true
    if (unbindApiTableRef.value) {
        unbindApiTableRef.value.clearSelection()
    }
}

const handleUnbindSelectionChange = (val: Array<Api>) => {
    unbindApiSelection.value = val
}

const unbindApi = () => {
    roleUnbindApi(currentUnbindApiRole.value!.id, { "ids": unbindApiSelection.value.map(api => api.id) })
        .then((response) => {
            if (response.status === 201 && response.data.success === true) {
                ElMessage.success({ message: "Unbind APIs success!" })
                dialogUnbindApiVisible.value = false
                loadRole()
            }
        })
        .catch(function (error) {
            ElMessage.error({
                message: errorHandle(error.response.data, "Unbind api failed!")
            })
        })
}

// -搜索API
const unbindApiSearchText = ref('')
const unbindApiSearchMethod = ref<string>()
const unbindSearch = () => {
    let data = currentUnbindApiRole.value!.apis || []
    if (unbindApiSearchText.value && currentUnbindApiRole.value?.apis) {
      data = data.filter(item => item.url.includes(unbindApiSearchText.value))
    }
    if (unbindApiSearchMethod.value && currentUnbindApiRole.value?.apis) {
      data = data.filter(item => item.method.includes(unbindApiSearchMethod.value))
    }
    bindApiList.value = data
}


// 删除API
const handleDelete = (index: number, row: Role) => {
    deleteRole(row.id)
        .then(function (response) {
            if (response.status === 200) {
                ElMessage.success({
                    message: "Delete role success!"
                })
                dialogRoleFormVisible.value = false
                loadRole()
            }
        })
        .catch(function (error) {
            ElMessage.error({
                message: errorHandle(error.response.data, "Delete role failed!")
            })
        })
}

// 分页
const pageSizes = [20, 50, 100, 200]
const pageSize = ref(20)
const currentPage = ref(1)
const total = ref(0)

const handleCurrentChange = () => {
    loadRole()
}

// 公共
const form = ref<Role>({
    id: 0,
    name: '',
    description: ''
})
const dialogRoleFormVisible = ref(false)

const addOrUpdateRole = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
        if (!valid) return
        const roleInput: RoleInput = {
            name: form.value.name,
            description: form.value.description || ""
        }
        if (!form.value.id) {
            createRole(roleInput)
                .then(function (response) {
                    if (response.status === 201) {
                        ElMessage.success({
                            message: "Create role success!"
                        })
                        dialogRoleFormVisible.value = false
                        loadRole()
                    }
                })
                .catch(function (error) {
                    ElMessage.error({
                        message: errorHandle(error.response.data, "Create role failed!")
                    })
                })
            return
        }
        const roleId = form.value.id
        updateRole(roleId, roleInput)
            .then(function (response) {
                if (response.status === 201) {
                    ElMessage.success({
                        message: "Update role success!"
                    })
                    dialogRoleFormVisible.value = false
                    loadRole()
                }
            })
            .catch(function (error) {
                ElMessage.error({
                    message: errorHandle(error.response.data, "Update role failed!")
                })
            })
    })
}

const loadRole = () => {
    getRole({
        page: currentPage.value,
        per_page: pageSize.value,
        search: searchText.value
    }).then((response) => {
        if (response.status === 200 && response.data.success === true) {
            roleList.value = response.data.data
            total.value = response.data.pagination.total
        }
    }).catch(function (error) {
        if (error.response.status === 404 && currentPage.value > 1) {
            currentPage.value--
            loadRole()
            return
        }
        // 如果最后还是404，将结果置空
        if (error.response.status === 404) {
            roleList.value = []
            total.value = 0
            return
        }
        ElMessage.error({
            message: errorHandle(error.response.data, "Get role failed!")
        })
    })
}
</script>
<template>
    <!-- search && create button -->
    <el-row style="padding-bottom: 10px;">
        <el-col :span="8">
            <el-input v-model="searchText" placeholder="Search Role by name or description" @keyup.enter="search"
                size="small" />
        </el-col>
        <el-col :span="4">
            <el-button type="primary" :icon="Search" class="search" plain @click="search"
                size="small">Search</el-button>
        </el-col>
        <el-col :span="12" style="text-align: right;">
            <el-button type="primary" plain @click="openCreateRoleDialog" size="small" :icon="Plus">{{ addTitle
                }}</el-button>
        </el-col>
    </el-row>
    <!-- table display -->
    <el-scrollbar class="main-table">
        <el-table :data="roleList" style="width: 100%" :default-sort="{ prop: 'id', order: 'ascending' }">
            <el-table-column prop="id" label="Id" min-width="15" sortable />
            <el-table-column prop="name" label="Name" min-width="25" sortable />
            <el-table-column prop="description" label="Description" show-overflow-tooltip />
            <el-table-column label="Operations">
                <template #default="scope">
                    <el-button size="small" @click="handleApiView(scope.$index, scope.row)" plain type="info">
                        APIs
                    </el-button>
                    <el-button size="small" @click="handleUserView(scope.$index, scope.row)" plain type="info">
                        Users
                    </el-button>
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)" plain>
                        Edit
                    </el-button>
                    <!-- bind API -->
                    <el-button size="small" @click="handleBind(scope.$index, scope.row)" plain>
                        Bind API
                    </el-button>
                    <!-- unbind API -->
                    <el-button size="small" @click="handleUnbind(scope.$index, scope.row)" plain type="warning">
                        Unbind API
                    </el-button>
                    <el-popconfirm width="220" confirm-button-text="Delete" cancel-button-text="Cancel"
                        title="Are you sure to delete this?" @confirm="handleDelete(scope.$index, scope.row)">
                        <template #reference>
                            <el-button size="small" type="danger" plain>
                                Delete
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
            layout="total, sizes, prev, pager, next" :total="total" @current-change="handleCurrentChange"
            @size-change="handleCurrentChange" :page-sizes="pageSizes" />
    </div>
    <!-- modal -->
    <!-- create or update role dialog -->
    <el-dialog v-model="dialogRoleFormVisible" :title="dialogTitle" width="500">
        <el-form ref="ruleFormRef" :model="form" :rules="rules" label-width="auto">
            <el-form-item label="name" prop="name" required>
                <el-input v-model="form.name" />
            </el-form-item>
            <el-form-item label="description" prop="description">
                <el-input v-model="form.description" />
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="dialogRoleFormVisible = false">Cancel</el-button>
                <el-button type="primary" @click="addOrUpdateRole(ruleFormRef)">
                    {{ operation }}
                </el-button>
            </div>
        </template>
    </el-dialog>
    <!-- view binded api dialog -->
    <el-dialog v-model="dialogApiTableVisible" :title="dialogApiTableTitle" width="800">
        <el-scrollbar class="modal-table">
            <el-table :data="apisByRole" :default-sort="{ prop: 'id', order: 'ascending' }">
                <el-table-column prop="id" label="Id" sortable min-width="20" />
                <el-table-column prop="method" label="Method" min-width="30" sortable />
                <el-table-column prop="url" label="Url" sortable min-width="70" />
                <el-table-column prop="description" label="Description" show-overflow-tooltip />
            </el-table>
        </el-scrollbar>
    </el-dialog>
    <!--  view binded user dialog-->
    <el-dialog v-model="dialogUserTableVisible" :title="dialogUserTableTitle" width="800">
      <el-scrollbar class="modal-table">
        <el-table :data="usersByRole" :default-sort="{ prop: 'id', order: 'ascending' }">
          <el-table-column prop="id" label="Id" sortable min-width="20" />
          <el-table-column prop="username" label="Username" sortable min-width="40" />
          <el-table-column prop="email" label="Email" sortable min-width="50" />
          <el-table-column prop="locked" label="Locked" sortable />
        </el-table>
      </el-scrollbar>
    </el-dialog>
    <!-- bind api dialog -->
    <el-dialog v-model="dialogBindApiVisible" :title="dialogBindApiTitle" width="800">
        <el-row style="padding-bottom: 10px;">
            <el-col :span="6" style="padding-right: 10px;">
                <el-select v-model="bindApiSearchMethod" placeholder="Filter by request method" clearable size="small">
                    <el-option label="GET" value="GET" />
                    <el-option label="POST" value="POST" />
                    <el-option label="PUT" value="PUT" />
                    <el-option label="DELETE" value="DELETE" />
                </el-select>
            </el-col>
            <el-col :span="12">
                <el-input v-model="bindApiSearchText" placeholder="Search API by url or description"
                    @keyup.enter="bindSearch" size="small" />
            </el-col>
            <el-col :span="4">
                <el-button type="primary" :icon="Search" class="search" plain @click="bindSearch"
                    size="small">Search</el-button>
            </el-col>
        </el-row>
        <el-scrollbar class="modal-table">
            <el-table ref="bindApiTableRef" :data="unbindApiList" @selection-change="handleBindSelectionChange"
                :row-key="row => row.id" :default-sort="{ prop: 'id', order: 'ascending' }">
                <el-table-column type="selection" reserve-selection />
                <el-table-column prop="id" label="Id" sortable min-width="30" />
                <el-table-column prop="method" label="Method" min-width="40" />
                <el-table-column prop="url" label="Url" sortable min-width="70" />
                <el-table-column prop="description" label="Description" show-overflow-tooltip />
            </el-table>
        </el-scrollbar>
        <div class="pagination-container">
            <el-pagination v-model:current-page="unbindApiCurrentPage" v-model:page-size="unbindApiPageSize"
                layout="total, sizes, prev, pager, next" :total="unbindApiTotal" @current-change="handleUnbindApiCurrentChange"
                @size-change="handleUnbindApiCurrentChange" :page-sizes="unbindApiPageSizes"/>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <el-button type="primary" @click="bindApi">
                    Bind
                </el-button>
            </div>
        </template>
    </el-dialog>
    <!-- unbind api dialog -->
    <el-dialog v-model="dialogUnbindApiVisible" :title="dialogUnbindApiTitle" width="800">
        <el-row>
          <el-col :span="6" style="padding-right: 10px;">
            <el-select v-model="unbindApiSearchMethod" placeholder="Filter by request method" clearable size="small">
              <el-option label="GET" value="GET" />
              <el-option label="POST" value="POST" />
              <el-option label="PUT" value="PUT" />
              <el-option label="DELETE" value="DELETE" />
            </el-select>
          </el-col>
          <el-col :span="12">
            <el-input v-model="unbindApiSearchText" placeholder="Search API by url or description"
                      @keyup.enter="unbindSearch" size="small" />
          </el-col>
            <el-col :span="4">
                <el-button type="primary" :icon="Search" class="search" plain @click="unbindSearch"
                    size="small">Search</el-button>
            </el-col>
        </el-row>
        <el-scrollbar class="modal-table">
            <el-table ref="unbindApiTableRef" :data="bindApiList" @selection-change="handleUnbindSelectionChange"
                :row-key="row => row.id" :default-sort="{ prop: 'id', order: 'ascending' }">
                <el-table-column type="selection" reserve-selection />
                <el-table-column prop="id" label="Id" sortable min-width="30" />
                <el-table-column prop="method" label="Method" min-width="40" />
                <el-table-column prop="url" label="Url" sortable min-width="70" />
                <el-table-column prop="description" label="Description" />
            </el-table> </el-scrollbar>
        <template #footer>
            <div class="dialog-footer">
                <el-button type="primary" @click="unbindApi">
                    Unbind
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
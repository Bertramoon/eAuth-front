<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElTable, type FormRules, type FormInstance } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { type Api, type ApiInput, type Role } from '@/types'
import { getApi, createApi, updateApi, deleteApi } from '@/api/api'
import { errorHandle } from '@/utils/responseHandle'


// 初始化数据
onMounted(() => {
    loadApi()
})

// 搜索框
const searchMethod = ref<string>()
const searchText = ref<string>('')
const search = () => {
    loadApi()
}

// 添加API
const addTitle = "Add API"
const operation = ref('Create')
const dialogTitle = ref("Create API")
const openCreateAPIDialog = () => {
    operation.value = "Create"
    dialogTitle.value = "Create API"
    form.value = {
        id: 0,
        url: '',
        method: '',
        description: ''
    }
    ruleFormRef.value?.clearValidate()

    dialogApiFormVisible.value = true
}

// 表格
const apiList = ref<Array<Api>>([])
const ruleFormRef = ref<FormInstance>()

const rules = reactive<FormRules<ApiInput>>({
    method: [
        { required: true, message: 'Please select request method', trigger: 'blur' },
    ],
    url: [
        { required: true, message: 'Please input url', trigger: 'blur', },
        { min: 1, max: 256, message: 'Length should be 1 to 256', trigger: 'change' }
    ]
})

// 查看归属角色
const dialogRoleTableVisible = ref(false)
const dialogRoleTableTitle = ref("")
const rolesByApi = ref<Array<Role>>([])

const handleInfo = (index: number, row: Api) => {
    rolesByApi.value = row.roles || []
    dialogRoleTableVisible.value = true
    dialogRoleTableTitle.value = "Roles by API: " + row.method + " " + row.url
}

// 编辑API
const handleEdit = (index: number, row: Api) => {
    operation.value = "Save"
    dialogTitle.value = "Update API: " + row.method + " " + row.url
    ruleFormRef.value?.clearValidate()
    form.value = { ...row }
    dialogApiFormVisible.value = true
}

// 删除API
const handleDelete = (index: number, row: Api) => {
    deleteApi(row.id)
        .then(function (response) {
            if (response.status === 200) {
                ElMessage.success({
                    message: "Delete API success!"
                })
                dialogApiFormVisible.value = false
                loadApi()
            }
        })
        .catch(function (error) {
            ElMessage.error({
                message: errorHandle(error.response.data, 'Delete API failed!')
            })
        })
}

// 分页
const pageSize = ref(20)
const pageSizes = [20, 50, 100, 200]
const currentPage = ref(1)
const total = ref(0)

const handleCurrentChange = () => {
    loadApi()
}

// 公共
const form = ref<Api>({
    id: 0,
    url: '',
    method: '',
    description: ''
})
const dialogApiFormVisible = ref(false)

const addOrUpdateApi = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
        if (!valid) return
        const apiInput: ApiInput = {
            url: form.value.url,
            method: form.value.method,
            description: form.value.description || ""
        }
        if (!form.value.id) {
            createApi(apiInput)
                .then(function (response) {
                    if (response.status === 201) {
                        ElMessage.success({
                            message: "Create API success!"
                        })
                        dialogApiFormVisible.value = false
                        loadApi()
                    }
                })
                .catch(function (error) {
                    ElMessage.error({
                        message: errorHandle(error.response.data, "Create API failed!")
                    })
                })
            return
        }
        const apiId = form.value.id
        updateApi(apiId, apiInput)
            .then(function (response) {
                if (response.status === 201) {
                    ElMessage.success({
                        message: "Update API success!"
                    })
                    dialogApiFormVisible.value = false
                    loadApi()
                }
            })
            .catch(function (error) {
                ElMessage.error({
                    message: errorHandle(error.response.data, "Update API failed!")
                })
            })
    })
}

const loadApi = () => {
    getApi({
        page: currentPage.value,
        per_page: pageSize.value,
        search: searchText.value,
        method: searchMethod.value
    }).then((response) => {
        if (response.status === 200 && response.data.success === true) {
            apiList.value = response.data.data
            total.value = response.data.pagination.total
        }
    }).catch(function (error) {
        if (error.response.status === 404 && currentPage.value > 1) {
            currentPage.value--
            loadApi()
            return
        }
        // 如果最后还是404，将结果置空
        if (error.response.status === 404) {
            apiList.value = []
            total.value = 0
            return
        }
        ElMessage.error({
            message: errorHandle(error.response.data, "Get API failed!")
        })
    })
}
</script>
<template>
    <!-- search && create button -->
    <el-row style="padding-bottom: 10px;">
        <el-col :span="3" style="padding-right: 10px;">
            <el-select v-model="searchMethod" placeholder="Filter by request method" clearable size="small">
                <el-option label="GET" value="GET" />
                <el-option label="POST" value="POST" />
                <el-option label="PUT" value="PUT" />
                <el-option label="DELETE" value="DELETE" />
            </el-select>
        </el-col>
        <el-col :span="8">
            <el-input v-model="searchText" placeholder="Search API by url or description" @keyup.enter="search"  size="small"/>
        </el-col>
        <el-col :span="4">
            <el-button type="primary" :icon="Search" class="search" plain @click="search" size="small">Search</el-button>
        </el-col>
        <el-col :span="9" style="text-align: right;">
            <el-button type="primary" plain @click="openCreateAPIDialog" size="small" :icon="Plus">{{ addTitle }}</el-button>
        </el-col>
    </el-row>
    <!-- table display -->
    <el-scrollbar>
        <el-table :data="apiList" style="width: 100%" :default-sort="{ prop: 'id', order: 'ascending' }">
            <el-table-column prop="id" label="Id" min-width="15" sortable />
            <el-table-column prop="method" label="Method" min-width="25" sortable />
            <el-table-column prop="url" label="Url" min-width="50" sortable />
            <el-table-column prop="description" label="Description" show-overflow-tooltip />
            <el-table-column label="Operations">
                <template #default="scope">
                    <el-button size="small" @click="handleInfo(scope.$index, scope.row)" plain type="info">
                        Roles
                    </el-button>
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)" plain>
                        Edit
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
    <!-- create or update api dialog -->
    <el-dialog v-model="dialogApiFormVisible" :title="dialogTitle" width="500">
        <el-form ref="ruleFormRef" :model="form" :rules="rules" label-width="auto">
            <el-form-item label="Request method" prop="method" required>
                <el-select v-model="form.method" placeholder="Please select request method">
                    <el-option label="GET" value="GET" />
                    <el-option label="POST" value="POST" />
                    <el-option label="PUT" value="PUT" />
                    <el-option label="DELETE" value="DELETE" />
                </el-select>
            </el-form-item>
            <el-form-item label="Url" prop="url" required>
                <el-input v-model="form.url" />
            </el-form-item>
            <el-form-item label="Description" prop="description">
                <el-input v-model="form.description" />
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="dialogApiFormVisible = false">Cancel</el-button>
                <el-button type="primary" @click="addOrUpdateApi(ruleFormRef)">
                    {{ operation }}
                </el-button>
            </div>
        </template>
    </el-dialog>
    <!-- view binded role dialog -->
    <el-dialog v-model="dialogRoleTableVisible" :title="dialogRoleTableTitle" width="800">
        <el-table :data="rolesByApi" :default-sort="{ prop: 'id', order: 'ascending' }">
            <el-table-column prop="id" label="Id" min-width="30" sortable />
            <el-table-column prop="name" label="Name" min-width="40" sortable />
            <el-table-column prop="description" label="Description" show-overflow-tooltip />
        </el-table>
    </el-dialog>
</template>
<style scoped>
.pagination-container {
    margin-top: 10px;
}

.el-scrollbar {
    /*表格显示区域，适配1080p 100%比例缩放下*/
    height: 700px;
}

.search {
    margin-left: 10px;
}
</style>
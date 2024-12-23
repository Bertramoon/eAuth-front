<script setup lang="ts">

import {Plus, Search} from "@element-plus/icons-vue";
import {onMounted, reactive, ref} from "vue";
import type {ServiceItem} from "@/types";
import {createRoleCall, deleteRoleCall, getRoleConditionsCall, updateRoleCall} from "@/api/role";
import type {AxiosResponse} from "axios";
import type {Role, RoleConditions, RoleInput} from "@/types/role";
import {isSuccess, type Response} from "@/utils/responseHandle";
import {usePageStore} from "@/stores/page";
import EAuthTable from "@/components/EAuthTable.vue";
import {ElMessage, type FormInstance, type FormRules} from "element-plus";
import type {Api} from "@/types/api";


// 定义传参数据
const emit = defineEmits<{
  (e: 'loadRole', currentPage: number, pageSize: number, service?: string, search?: string): void,
  (e: 'selectionChange', val: Array<Role>): void,
  (e: 'handleBoundApi', role: Role): void,
  (e: 'handleUnboundApi', role: Role): void,
  (e: 'handleBoundUser', role: Role): void,
  (e: 'handleUnboundUser', role: Role): void,
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
const roleList = defineModel<Array<Role>>('roleList')
const total = defineModel<number>('total')

// 初始化数据
onMounted(() => {
  loadConditions()
  loadData()
})

// 搜索框
const searchService = ref<string>()
const searchText = ref<string>()
const loadData = () => {
  emit("loadRole",
      currentPage.value,
      pageStore.pageSize,
      searchService.value,
      searchText.value
  )
}

// 查询参数
const services = ref<Array<string>>([])
const servicesOptions = ref<Array<ServiceItem>>([])

// 分页
const pageStore = usePageStore()
const currentPage = ref<number>(1)

const loadConditions = () => {
  getRoleConditionsCall().then((response: AxiosResponse) => {
    const res: Response<RoleConditions> = response.data
    if (isSuccess(res)) {
      services.value = res.data.services
      servicesOptions.value = []
      for (const service of res.data.services) {
        servicesOptions.value.push({
          value: service
        })
      }
    }
  })
}

const roleOptions = [
  {
    prop: "id",
    label: "Id",
    minWidth: 15,
    sortable: false,
    showOverflowTooltip: false
  },
  {
    prop: "name",
    label: "name",
    minWidth: 35,
    sortable: true,
    showOverflowTooltip: false
  },
  {
    prop: "service",
    label: "Service",
    minWidth: 25,
    sortable: true,
    showOverflowTooltip: false
  },
  {
    prop: "description",
    label: "Description",
    minWidth: 150,
    sortable: true,
    showOverflowTooltip: true
  },
]


// 定义增删改操作
const dialogRoleFormVisible = ref<boolean>(false)
const dialogTitle = ref<string>()
const form = ref<Role | RoleInput>({
  name: ""
})
const ruleFormRef = ref<FormInstance>()
const rules = reactive<FormRules<RoleInput>>({
  name: [
    {required: true, message: 'Please input role name', trigger: 'blur'},
    {min: 1, max: 30, message: 'Length should be 1 to 30', trigger: 'change'}
  ]
})

const addOrUpdateRole = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (!valid) return
    const roleInput: RoleInput = {
      name: form.value.name,
      service: form.value.service,
      description: form.value.description
    }
    if (!form.value.id) {  // add role
      createRoleCall(roleInput)
          .then((response: AxiosResponse) => {
            if (isSuccess(response.data)) {
              ElMessage.success({
                message: "Create role success!"
              })
              dialogRoleFormVisible.value = false
              loadConditions()
              loadData()
            }
          })
      return
    }
    // update role
    const roleId = form.value!.id
    updateRoleCall(roleId, roleInput)
        .then((response: AxiosResponse) => {
          if (isSuccess(response.data)) {
            ElMessage.success({
              message: "Update role success!"
            })
            dialogRoleFormVisible.value = false
            loadConditions()
            loadData()
          }
        })
  })
}

// 增删改操作事件
const handleCreate = () => {
  dialogTitle.value = "Create Role"
  form.value = {
    name: '',
  }
  ruleFormRef.value?.clearValidate()

  dialogRoleFormVisible.value = true
}

const handleEdit = (index: number, row: Role) => {
  dialogTitle.value = "Update Role: " + row.name
  if (row.service) {
    dialogTitle.value += "(" + row.service + ")"
  }
  ruleFormRef.value?.clearValidate()
  form.value = {...row}
  dialogRoleFormVisible.value = true
}

const handleDelete = (index: number, row: Role) => {
  deleteRoleCall(row.id)
      .then((response: AxiosResponse) => {
        if (isSuccess(response.data)) {
          ElMessage.success({
            message: "Delete Role success!"
          })
          dialogRoleFormVisible.value = false
          loadData()
        }
      })
}

// 自动提示service
const serviceSearch = (queryString: string, cb: any) => {
  const results = queryString
      ? servicesOptions.value.filter(createFilter(queryString))
      : servicesOptions.value
  // call callback function to return suggestions
  cb(results)
}
const createFilter = (queryString: string) => {
  return (restaurant: ServiceItem) => {
    return (
        restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}
</script>

<template>
  <!-- table display -->
  <e-auth-table
      v-model:data="roleList"
      :options="roleOptions"
      v-model:current-page="currentPage"
      v-model:page-size="pageStore.pageSize"
      :page-sizes="pageStore.pageSizes"
      v-model:total="total"
      :table-height="height"
      @handle-current-change="loadData"
      @selection-change="(val: Array<Api>) => $emit('selectionChange', val)"
      :has-select="hasSelect"
  >
    <template #header>
      <!-- search && create button -->
      <el-col :span="2" style="padding-right: 10px;">
        <el-select v-model="searchService" placeholder="Filter by service" clearable size="small" @change="loadData">
          <el-option v-for="service in services" :label="service" :value="service"/>
        </el-select>
      </el-col>
      <el-col :span="8" style="padding-right: 10px;">
        <el-input v-model="searchText" placeholder="Search API by url or description" @keyup.enter="loadData"
                  size="small"/>
      </el-col>
      <el-col :span="4">
        <el-button type="primary" :icon="Search" class="search" plain
                   @click="loadData" size="small">Search
        </el-button>
      </el-col>
      <el-col :span="10" style="text-align: right;" v-if="hasAdd">
        <el-button type="primary" plain @click="handleCreate" size="small" :icon="Plus">
          Add Role
        </el-button>
      </el-col>
    </template>
    <template #options>
      <slot name="options">
        <el-table-column label="Options" min-width="120">
          <template #default="scope">
            <el-button size="small" plain @click="handleEdit(scope.$index, scope.row)">Edit</el-button>
            <el-button type="primary" size="small" plain @click="$emit('handleUnboundApi', scope.row)" v-if="hasBind">
              Bind api
            </el-button>
            <el-button type="primary" size="small" plain @click="$emit('handleBoundApi', scope.row)" v-if="hasBind">
              Unbind api
            </el-button>
            <el-button type="primary" size="small" plain @click="$emit('handleUnboundUser', scope.row)" v-if="hasBind">
              Bind user
            </el-button>
            <el-button type="primary" size="small" plain @click="$emit('handleBoundUser', scope.row)" v-if="hasBind">
              Unbind user
            </el-button>
            <el-popconfirm width="220" confirm-button-text="Delete" cancel-button-text="Cancel"
                           title="Are you sure to delete this api?" @confirm="handleDelete(scope.$index, scope.row)">
              <template #reference>
                <el-button size="small" type="danger" plain>
                  Delete
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </slot>
    </template>
  </e-auth-table>
  <!-- create or update role dialog -->
  <el-dialog v-model="dialogRoleFormVisible" :title="dialogTitle" width="500">
    <el-form ref="ruleFormRef" :model="form" :rules="rules" label-width="auto">
      <el-form-item label="name" prop="name" required>
        <el-input v-model="form.name"/>
      </el-form-item>
      <el-form-item label="description" prop="description">
        <el-input v-model="form.description"/>
      </el-form-item>
      <el-form-item label="Service" prop="service">
        <el-autocomplete
            v-model="form.service"
            trigger-on-focus
            :fetch-suggestions="serviceSearch"
            clearable
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogRoleFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="addOrUpdateRole(ruleFormRef)">Submit</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>
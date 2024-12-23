<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue'
import {Plus, Search} from '@element-plus/icons-vue'
import {type ServiceItem} from '@/types'
import {createApiCall, deleteApiCall, getApiConditionsCall, updateApiCall} from '@/api/api'
import EAuthTable from "@/components/EAuthTable.vue";
import type {AxiosResponse} from "axios";
import type {Api, ApiConditions, ApiInput} from "@/types/api"
import {isSuccess, type Response} from "@/utils/responseHandle"
import {usePageStore} from "@/stores/page";
import {ElMessage, type FormInstance, type FormRules} from "element-plus";

// 定义传参数据
const emit = defineEmits<{
  (e: 'loadApi', currentPage: number, pageSize: number, method?: string, service?: string, search?: string): void
  (e: 'selectionChange', val: Array<Api>): void,
  (e: 'handleBoundRole', api: Api): void,
  (e: 'handleUnboundRole', api: Api): void,
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
const apiList = defineModel<Array<Api>>('apiList')
const total = defineModel<number>('total')

// 初始化数据
onMounted(() => {
  loadConditions()
  loadData()
})

// 搜索框
const searchMethod = ref<string>()
const searchService = ref<string>()
const searchText = ref<string>()
const loadData = () => {
  emit("loadApi",
      currentPage.value,
      pageStore.pageSize,
      searchMethod.value,
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
  getApiConditionsCall().then((response: AxiosResponse) => {
    const res: Response<ApiConditions> = response.data
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

const apiOptions = [
  {
    prop: "id",
    label: "Id",
    minWidth: 15,
    sortable: false,
    showOverflowTooltip: false
  },
  {
    prop: "method",
    label: "Method",
    minWidth: 25,
    sortable: true,
    showOverflowTooltip: false
  },
  {
    prop: "url",
    label: "Url",
    minWidth: 50,
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
    minWidth: 100,
    sortable: true,
    showOverflowTooltip: true
  },
]

// 定义增删改操作
const dialogApiFormVisible = ref<boolean>(false)
const dialogTitle = ref<string>()
const form = ref<Api | ApiInput>({
  url: "",
  method: ""
})
const ruleFormRef = ref<FormInstance>()
const rules = reactive<FormRules<ApiInput>>({
  method: [
    {required: true, message: 'Please select request method', trigger: 'blur'},
  ],
  url: [
    {required: true, message: 'Please input url', trigger: 'blur',},
    {min: 1, max: 256, message: 'Length should be 1 to 256', trigger: 'change'}
  ]
})
const addOrUpdateApi = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (!valid) return
    const apiInput: ApiInput = {
      url: form.value.url,
      method: form.value.method,
      service: form.value.service,
      description: form.value.description || ""
    }
    if (!form.value?.id) {  // create api
      createApiCall(apiInput)
          .then((response: AxiosResponse) => {
            if (isSuccess(response.data)) {
              ElMessage.success({
                message: "Create API success!"
              })
              dialogApiFormVisible.value = false
              loadConditions()
              loadData()
            }
          })
      return
    }
    // update api
    const apiId = form.value.id
    updateApiCall(apiId, apiInput)
        .then((response: AxiosResponse) => {
          if (isSuccess(response.data)) {
            ElMessage.success({
              message: "Update API success!"
            })
            dialogApiFormVisible.value = false
            loadConditions()
            loadData()
          }
        })
  })
}

// 增删改操作事件
const handleCreate = () => {
  dialogTitle.value = "Create API"
  form.value = {
    url: '',
    method: ''
  }
  ruleFormRef.value?.clearValidate()

  dialogApiFormVisible.value = true
}

const handleEdit = (index: number, row: Api) => {
  dialogTitle.value = "Update API: " + row.method + " " + row.url
  if (row.service) {
    dialogTitle.value += "(" + row.service + ")"
  }
  ruleFormRef.value?.clearValidate()
  form.value = {...row}
  dialogApiFormVisible.value = true
}

const handleDelete = (index: number, row: Api) => {
  deleteApiCall(row.id)
      .then((response: AxiosResponse) => {
        if (isSuccess(response.data)) {
          ElMessage.success({
            message: "Delete API success!"
          })
          dialogApiFormVisible.value = false
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
      v-model:data="apiList"
      :options="apiOptions"
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
      <el-col :span="3" style="padding-right: 10px;">
        <el-select v-model="searchMethod" placeholder="Filter by request method" clearable size="small" @change="loadData">
          <el-option label="GET" value="GET"/>
          <el-option label="POST" value="POST"/>
          <el-option label="PUT" value="PUT"/>
          <el-option label="DELETE" value="DELETE"/>
        </el-select>
      </el-col>
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
      <el-col :span="7" style="text-align: right;" v-if="hasAdd">
        <el-button type="primary" plain @click="handleCreate" size="small" :icon="Plus">
          Add API
        </el-button>
      </el-col>
    </template>
    <template #options>
      <slot name="options">
        <el-table-column label="Options">
          <template #default="scope">
            <el-button size="small" plain @click="handleEdit(scope.$index, scope.row)">Edit</el-button>
            <el-button type="primary" size="small" plain @click="$emit('handleUnboundRole', scope.row)" v-if="hasBind">
              Bind role
            </el-button>
            <el-button type="primary" size="small" plain @click="$emit('handleBoundRole', scope.row)" v-if="hasBind">
              Unbind role
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
  <!--  create or update dialog -->
  <el-dialog v-model="dialogApiFormVisible" :title="dialogTitle" width="500">
    <el-form ref="ruleFormRef" :model="form" :rules="rules" label-width="auto">
      <el-form-item label="Request method" prop="method" required>
        <el-select v-model="form.method" placeholder="Please select request method">
          <el-option label="GET" value="GET"/>
          <el-option label="POST" value="POST"/>
          <el-option label="PUT" value="PUT"/>
          <el-option label="DELETE" value="DELETE"/>
        </el-select>
      </el-form-item>
      <el-form-item label="Url" prop="url" required>
        <el-input v-model="form.url"/>
      </el-form-item>
      <el-form-item label="Description" prop="description">
        <el-input v-model="form.description"/>
      </el-form-item>
      <el-form-item label="Service" prop="service">
        <!--        <el-select v-model="form.service" placeholder="Please select service" clearable>-->
        <!--          <el-option v-for="service in services" :label="service" :value="service"/>-->
        <!--        </el-select>-->
        <el-autocomplete
            v-model="form.service"
            trigger-on-focus
            :fetch-suggestions="serviceSearch"
            clearable
            placeholder="Input service"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogApiFormVisible = false">Cancel</el-button>
      <el-button type="primary" @click="addOrUpdateApi(ruleFormRef)">Submit</el-button>
    </template>
  </el-dialog>
</template>
<style scoped>
</style>
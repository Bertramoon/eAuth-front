<script setup lang="ts">
import {operateLogCall} from '@/api/log';
import {Refresh, Search} from '@element-plus/icons-vue';
import {onMounted, ref} from 'vue';
import type {AxiosResponse} from "axios";
import moment from "moment";
import type {OperateLog, OperateLogQuery} from "@/types/log";
import {usePageStore} from "@/stores/page";


// 初始化数据
onMounted(() => {
  loadOperateLog()
})

const form = ref<OperateLogQuery>({})
const operateDateTime = ref<Array<Date>>([])

const operateLogList = ref<Array<OperateLog>>([])

const shortcuts = [
  {
    text: 'Last week',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 7)
      return [start, end]
    },
  },
  {
    text: 'Last month',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 1)
      return [start, end]
    },
  }
]

const queryOperateLog = () => {
  if (operateDateTime.value && operateDateTime.value.length > 0 && operateDateTime.value[0]) {
    form.value.start_datetime = formatDate(operateDateTime.value[0])
  } else {
    delete form.value.start_datetime
  }
  if (operateDateTime.value && operateDateTime.value.length > 1 && operateDateTime.value[1]) {
    form.value.end_datetime = formatDate(operateDateTime.value[1])
  } else {
    delete form.value.end_datetime
  }
  console.log(form.value)
  loadOperateLog()
}

const formatDate = (date: Date) => {
  const year = date.getUTCFullYear()
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
  const day = date.getUTCDate().toString().padStart(2, '0')
  const hour = date.getUTCHours().toString().padStart(2, '0')
  const minute = date.getUTCMinutes().toString().padStart(2, '0')
  const second = date.getUTCSeconds().toString().padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

// 分页
const pageStore = usePageStore()
const currentPage = ref(1)
const total = ref(0)

const handleCurrentChange = () => {
  loadOperateLog()
}

const loadOperateLog = () => {
  operateLogCall({
    page: currentPage.value,
    per_page: pageStore.pageSize,
    ...pickNonEmptyValues(form.value)
  }).then((response: AxiosResponse) => {
    if (response.status === 200 && response.data.success === true) {
      operateLogList.value = response.data.data
      total.value = response.data.pagination.total
    }
  })
}

const pickNonEmptyValues = (obj: any) => {
  return Object.keys(obj)
      .filter(key => obj[key] !== null && obj[key] !== undefined && obj[key] !== '')
      .reduce((acc: any, key) => {
        acc[key] = obj[key];
        return acc;
      }, {});
}

const statusCodeOptions = [
  {
    value: 200,
    label: "200 OK"
  },
  {
    value: 201,
    label: "201 Created"
  },
  {
    value: 401,
    label: "401 Unauthorized"
  },
  {
    value: 403,
    label: "403 Forbidden"
  },
  {
    value: 422,
    label: "422 UNPROCESSABLE ENTITY"
  },
  {
    value: 500,
    label: "500 Internal Server Error"
  }
]

const resetQuery = () => {
  form.value = {}
  operateDateTime.value = []
}


</script>
<template>
  <!-- search -->
  <el-form :inline="true" v-model="form" style="text-align: center;" size="small">
    <el-form-item label="Operator">
      <el-input v-model="form.username" placeholder="Input username" clearable/>
    </el-form-item>
    <el-form-item label="Client address">
      <el-input v-model="form.ip_addr" placeholder="Input IP address" clearable/>
    </el-form-item>
    <el-form-item label="Request method">
      <el-select v-model="form.operate_type" placeholder="Select method" clearable @change="queryOperateLog">
        <el-option label="GET" value="GET"/>
        <el-option label="POST" value="POST"/>
        <el-option label="PUT" value="PUT"/>
        <el-option label="DELETE" value="DELETE"/>
      </el-select>
    </el-form-item>
    <el-form-item label="Request api">
      <el-input v-model="form.operate_api" placeholder="Input api" clearable/>
    </el-form-item>
    <el-form-item label="Status code">
      <el-select v-model="form.status_code" placeholder="Select status code" clearable @change="queryOperateLog">
        <el-option v-for="item in statusCodeOptions" :key="item.value" :label="item.label"
                   :value="item.value"/>
      </el-select>
    </el-form-item>
    <el-form-item label="Resource id">
      <el-input v-model="form.resource_id" placeholder="Input resource id" clearable/>
    </el-form-item>
    <el-form-item label="Result">
      <el-select v-model="form.success" placeholder="Select operate result" clearable @change="queryOperateLog">
        <el-option label="Success" :value="true"/>
        <el-option label="Failure" :value="false"/>
      </el-select>
    </el-form-item>
    <el-form-item label="Datetime range">
      <el-date-picker v-model="operateDateTime" type="datetimerange" :shortcuts="shortcuts"
                      start-placeholder="Start date" end-placeholder="End date"/>
    </el-form-item>
  </el-form>
  <el-row :gutter="20" style="padding-bottom: 10px;">
    <el-col :span="24" style="text-align: center;">
      <el-button @click="resetQuery" plain type="info" size="small" :icon="Refresh">Reset</el-button>
      <el-button type="primary" plain @click="queryOperateLog" size="small" :icon="Search">Query</el-button>
    </el-col>
  </el-row>
  <!-- table display -->
  <el-scrollbar>
    <el-table :data="operateLogList" style="width: 100%" :default-sort="{ prop: 'id', order: 'descending' }">
      <el-table-column prop="id" label="Id" min-width="30" sortable/>
      <el-table-column prop="username" label="Operator" min-width="50" sortable/>
      <el-table-column prop="ip_addr" label="Client address" min-width="65" sortable/>
      <el-table-column prop="operate_type" label="Method" min-width="40" sortable/>
      <el-table-column prop="operate_api" label="Request api" min-width="100"/>
      <el-table-column prop="resource_id" label="Resource id" sortable min-width="60"/>
      <el-table-column prop="request_data" label="Request data" show-overflow-tooltip/>
      <el-table-column prop="response_data" label="Response data" show-overflow-tooltip/>
      <el-table-column prop="operate_datetime" label="Datetime" min-width="60">
        <template #default="scope">
          {{ moment.utc(scope.row.operate_datetime).local().format("YYYY-MM-DD HH:mm:ss") }}
        </template>
      </el-table-column>
      <el-table-column prop="success" label="success" sortable :filters="[
                { text: 'true', value: true },
                { text: 'false', value: false }
            ]" :filter-method="(value: boolean, row: OperateLog) => row.success === value" min-width="50">
        <template #default="scope">
          <el-tag :key="scope.row.success" :type="scope.row.success ? 'success' : 'danger'" effect="light">
            {{ scope.row.success }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status_code" label="Status code" min-width="40"/>
    </el-table>
  </el-scrollbar>
  <!-- pagination -->
  <div class="pagination-container">
    <el-pagination v-model:current-page="currentPage" v-model:page-size="pageStore.pageSize" size="large"
                   layout="total, sizes, prev, pager, next" :total="total" @current-change="handleCurrentChange"
                   @size-change="handleCurrentChange" :page-sizes="pageStore.pageSizes"/>
  </div>
</template>
<style scoped>
.pagination-container {
  margin-top: 10px;
}

.el-scrollbar,
.el-table {
  /*表格显示区域，适配1080p 100%比例缩放下*/
  height: 600px;
}

.search {
  margin-left: 10px;
}

.el-input {
  --el-input-width: 220px;
}

.el-select {
  --el-select-width: 220px;
}
</style>
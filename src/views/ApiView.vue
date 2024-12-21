<script setup lang="ts">

import ApiTable from "@/components/ApiTable.vue";
import {
  apiBindRolesCall,
  apiUnbindRolesCall,
  queryApiBoundRolesCall,
  queryApiCall,
  queryApiUnboundRolesCall
} from "@/api/api";
import {ref} from "vue";
import type {AxiosResponse} from "axios"
import {isSuccess, type Response} from "@/utils/responseHandle"
import RoleTable from "@/components/RoleTable.vue";
import {ElMessage} from "element-plus";
import type {Api} from "@/types/api";
import type {Role} from "@/types/role";

const apiList = ref<Array<Api>>([])
const total = ref<number>(0)

const loadApi = (currentPage: number, pageSize: number, method?: string, service?: string, search?: string) => {
  queryApiCall({
    page: currentPage,
    per_page: pageSize,
    method: method,
    service: service,
    search: search
  }).then((response: AxiosResponse) => {
    const res: Response<Array<Api>> = response.data
    if (isSuccess(res)) {
      apiList.value = res.data
      total.value = res.pagination?.total || 0
    }
  })
}


/**
 * 加载对应api已绑定的角色和未绑定的角色
 */
const curApi = ref<Api>()
// 加载已绑定的角色
const boundRoleList = ref<Array<Role>>([])
const boundRoleTotal = ref<number>(0)
const boundSelection = ref<Array<Role>>([])

const dialogBoundFormVisible = ref<boolean>(false)
const dialogBoundTitle = ref<string>()
const handleBoundRole = (api: Api) => {
  boundSelection.value = []
  curApi.value = api
  dialogBoundTitle.value = "Unbind Roles for api: " + api.method + " " + api.url
  if (api?.service) {
    dialogBoundTitle.value += "(" + api.service + ")"
  }
  dialogBoundFormVisible.value = true
}

const loadBoundRole = (currentPage: number, pageSize: number, service?: string, search?: string) => {
  queryApiBoundRolesCall(curApi.value!.id, {
    page: currentPage,
    per_page: pageSize,
    service: service,
    search: search
  }).then((response: AxiosResponse) => {
    const res: Response<Array<Role>> = response.data
    if (isSuccess(res)) {
      boundRoleList.value = res.data
      boundRoleTotal.value = res.pagination?.total || 0
    }
  })
}

const unboundRole = () => {
  apiUnbindRolesCall(curApi.value!.id, {"ids": boundSelection.value.map(role => role.id)})
      .then((response: AxiosResponse) => {
        if (isSuccess(response.data)) {
          ElMessage.success({message: "Unbind roles success!"})
          dialogBoundFormVisible.value = false
        }
      })
}

// 加载未绑定的角色
const unboundRoleList = ref<Array<Role>>([])
const unboundRoleTotal = ref<number>(0)
const unboundSelection = ref<Array<Role>>([])

const dialogUnboundFormVisible = ref<boolean>(false)
const dialogUnboundTitle = ref<string>()
const handleUnboundRole = (api: Api) => {
  unboundSelection.value = []
  curApi.value = api
  dialogUnboundTitle.value = "Bind roles for api: " + api.method + " " + api.url
  if (api?.service) {
    dialogUnboundTitle.value += "(" + api.service + ")"
  }
  dialogUnboundFormVisible.value = true
}

const loadUnboundRole = (currentPage: number, pageSize: number, service?: string, search?: string) => {
  queryApiUnboundRolesCall(curApi.value!.id, {
    page: currentPage,
    per_page: pageSize,
    service: service,
    search: search
  }).then((response: AxiosResponse) => {
    const res: Response<Array<Role>> = response.data
    if (isSuccess(res)) {
      unboundRoleList.value = res.data
      unboundRoleTotal.value = res.pagination?.total || 0
    }
  })
}

const boundRole = () => {
  apiBindRolesCall(curApi.value!.id, {"ids": unboundSelection.value.map(role => role.id)})
      .then((response: AxiosResponse) => {
        if (isSuccess(response.data)) {
          ElMessage.success({message: "Bind roles success!"})
          dialogUnboundFormVisible.value = false
        }
      })
}

</script>

<template>
  <api-table
      has-add
      has-bind
      @load-api="loadApi"
      v-model:api-list="apiList"
      v-model:total="total"
      @handle-bound-role="handleBoundRole"
      @handle-unbound-role="handleUnboundRole"
  />
  <el-dialog v-model="dialogBoundFormVisible" :title="dialogBoundTitle" width="70vw" top="5vh" destroy-on-close>
    <role-table
        @load-role="loadBoundRole"
        v-model:role-list="boundRoleList"
        v-model:total="boundRoleTotal"
        has-select
        height="65vh"
        @selection-change="(val: Array<Role>) => boundSelection = val"
    />
    <template #footer>
      <el-button @click="dialogBoundFormVisible = false">Cancel</el-button>
      <el-button type="primary" @click="unboundRole">Unbind</el-button>
    </template>
  </el-dialog>
  <el-dialog v-model="dialogUnboundFormVisible" :title="dialogUnboundTitle" width="70vw" top="5vh" destroy-on-close>
    <role-table
        @load-role="loadUnboundRole"
        v-model:role-list="unboundRoleList"
        v-model:total="unboundRoleTotal"
        has-select
        height="65vh"
        @selection-change="(val: Array<Role>) => unboundSelection = val"
    />
    <template #footer>
      <el-button @click="dialogUnboundFormVisible = false">Cancel</el-button>
      <el-button type="primary" @click="boundRole">Bind</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>
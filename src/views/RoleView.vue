<script setup lang="ts">

import RoleTable from "@/components/RoleTable.vue";
import {ref} from "vue";
import type {AxiosResponse} from "axios";
import {isSuccess, type Response} from "@/utils/responseHandle";
import {
  getRoleCall,
  queryRoleBoundApisCall,
  queryRoleBoundUsersCall,
  queryRoleUnboundApisCall,
  queryRoleUnboundUsersCall,
  roleBindApisCall,
  roleBindUsersCall,
  roleUnbindApisCall,
  roleUnbindUsersCall
} from "@/api/role";
import ApiTable from "@/components/ApiTable.vue";
import {ElMessage} from "element-plus";
import UserTable from "@/components/UserTable.vue";
import type {Api} from "@/types/api";
import type {Role} from "@/types/role";
import type {User} from "@/types/user";

const roleList = ref<Array<Role>>([])
const total = ref<number>(0)

const loadRole = (currentPage: number, pageSize: number, service?: string, search?: string) => {
  getRoleCall({
    page: currentPage,
    per_page: pageSize,
    service: service,
    search: search
  }).then((response: AxiosResponse) => {
    const res: Response<Array<Role>> = response.data
    if (isSuccess(res)) {
      roleList.value = res.data
      total.value = res.pagination?.total || 0
    }
  })
}

/**
 * 加载对应角色已绑定的api和未绑定的api
 */
const curRole = ref<Role>()
// 加载已绑定的api
const boundApiList = ref<Array<Api>>([])
const boundApiTotal = ref<number>(0)
const boundSelection = ref<Array<Api>>([])

const dialogBoundFormVisible = ref<boolean>(false)
const dialogBoundTitle = ref<string>()
const handleBoundApi = (role: Role) => {
  boundSelection.value = []
  curRole.value = role
  dialogBoundTitle.value = "Unbind Apis for role: " + role.name
  if (role?.service) {
    dialogBoundTitle.value += "(" + role.service + ")"
  }
  dialogBoundFormVisible.value = true
}

const loadBoundApi = (currentPage: number, pageSize: number, method?: string, service?: string, search?: string) => {
  queryRoleBoundApisCall(curRole.value!.id, {
    page: currentPage,
    per_page: pageSize,
    method: method,
    service: service,
    search: search
  }).then((response: AxiosResponse) => {
    const res: Response<Array<Api>> = response.data
    if (isSuccess(res)) {
      boundApiList.value = res.data
      boundApiTotal.value = res.pagination?.total || 0
    }
  })
}

const unboundApi = () => {
  roleUnbindApisCall(curRole.value!.id, {"ids": boundSelection.value.map(api => api.id)})
      .then((response: AxiosResponse) => {
        if (isSuccess(response.data)) {
          ElMessage.success({message: "Unbind APIs success!"})
          dialogBoundFormVisible.value = false
        }
      })
}

// 加载未绑定的api
const unboundApiList = ref<Array<Api>>([])
const unboundApiTotal = ref<number>(0)
const unboundSelection = ref<Array<Api>>([])

const dialogUnboundFormVisible = ref<boolean>(false)
const dialogUnboundTitle = ref<string>()
const handleUnboundApi = (role: Role) => {
  unboundSelection.value = []
  curRole.value = role
  dialogUnboundTitle.value = "Bind Apis for role: " + role.name
  if (role?.service) {
    dialogUnboundTitle.value += "(" + role.service + ")"
  }
  dialogUnboundFormVisible.value = true
}

const loadUnboundApi = (currentPage: number, pageSize: number, method?: string, service?: string, search?: string) => {
  queryRoleUnboundApisCall(curRole.value!.id, {
    page: currentPage,
    per_page: pageSize,
    method: method,
    service: service,
    search: search
  }).then((response: AxiosResponse) => {
    const res: Response<Array<Api>> = response.data
    if (isSuccess(res)) {
      unboundApiList.value = res.data
      unboundApiTotal.value = res.pagination?.total || 0
    }
  })
}

const boundApi = () => {
  roleBindApisCall(curRole.value!.id, {"ids": unboundSelection.value.map(api => api.id)})
      .then((response: AxiosResponse) => {
        if (isSuccess(response.data)) {
          ElMessage.success({message: "Bind APIs success!"})
          dialogUnboundFormVisible.value = false
        }
      })
}


/**
 * 加载对应角色已绑定的用户和未绑定的用户
 */
// 加载已绑定的角色
const boundUserList = ref<Array<User>>([])
const boundUserTotal = ref<number>(0)
const boundUserSelection = ref<Array<User>>([])

const dialogBoundUserFormVisible = ref<boolean>(false)
const dialogBoundUserTitle = ref<string>()
const handleBoundUser = (role: Role) => {
  boundUserSelection.value = []
  curRole.value = role
  dialogBoundUserTitle.value = "Unbind users for role: " + role.name
  if (role?.service) {
    dialogBoundUserTitle.value += "(" + role.service + ")"
  }
  dialogBoundUserFormVisible.value = true
}

const loadBoundUser = (currentPage: number, pageSize: number, search?: string) => {
  queryRoleBoundUsersCall(curRole.value!.id, {
    page: currentPage,
    per_page: pageSize,
    search: search
  }).then((response: AxiosResponse) => {
    const res: Response<Array<User>> = response.data
    if (isSuccess(res)) {
      boundUserList.value = res.data
      boundUserTotal.value = res.pagination?.total || 0
    }
  })
}

const unboundUser = () => {
  roleUnbindUsersCall(curRole.value!.id, {"ids": boundUserSelection.value.map(user => user.id)})
      .then((response: AxiosResponse) => {
        if (isSuccess(response.data)) {
          ElMessage.success({message: "Unbind users success!"})
          dialogBoundUserFormVisible.value = false
        }
      })
}

// 加载未绑定的角色（也就是绑定角色）
const unboundUserList = ref<Array<User>>([])
const unboundUserTotal = ref<number>(0)
const unboundUserSelection = ref<Array<User>>([])

const dialogUnboundUserFormVisible = ref<boolean>(false)
const dialogUnboundUserTitle = ref<string>()
const handleUnboundUser = (role: Role) => {
  unboundUserSelection.value = []
  curRole.value = role
  dialogUnboundUserTitle.value = "Bind users for role: " + role.name
  if (role?.service) {
    dialogUnboundUserTitle.value += "(" + role.service + ")"
  }
  dialogUnboundUserFormVisible.value = true
}

const loadUnboundUser = (currentPage: number, pageSize: number, search?: string) => {
  queryRoleUnboundUsersCall(curRole.value!.id, {
    page: currentPage,
    per_page: pageSize,
    search: search
  }).then((response: AxiosResponse) => {
    const res: Response<Array<User>> = response.data
    if (isSuccess(res)) {
      unboundUserList.value = res.data
      unboundUserTotal.value = res.pagination?.total || 0
    }
  })
}

const boundUser = () => {
  roleBindUsersCall(curRole.value!.id, {"ids": unboundUserSelection.value.map(user => user.id)})
      .then((response: AxiosResponse) => {
        if (isSuccess(response.data)) {
          ElMessage.success({message: "Bind users success!"})
          dialogUnboundUserFormVisible.value = false
        }
      })
}

</script>

<template>
  <role-table
      has-add
      has-bind
      @load-role="loadRole"
      v-model:role-list="roleList"
      v-model:total="total"
      @handle-bound-api="handleBoundApi"
      @handle-unbound-api="handleUnboundApi"
      @handle-bound-user="handleBoundUser"
      @handle-unbound-user="handleUnboundUser"
  />
  <el-dialog v-model="dialogBoundFormVisible" :title="dialogBoundTitle" width="70vw" top="5vh" destroy-on-close>
    <api-table
        @load-api="loadBoundApi"
        v-model:api-list="boundApiList"
        v-model:total="boundApiTotal"
        has-select
        height="65vh"
        @selection-change="(val: Array<Api>) => boundSelection = val"
    />
    <template #footer>
      <el-button @click="dialogBoundFormVisible = false">Cancel</el-button>
      <el-button type="primary" @click="unboundApi">Unbind</el-button>
    </template>
  </el-dialog>
  <el-dialog v-model="dialogUnboundFormVisible" :title="dialogUnboundTitle" width="70vw" top="5vh" destroy-on-close>
    <api-table
        @load-api="loadUnboundApi"
        v-model:api-list="unboundApiList"
        v-model:total="unboundApiTotal"
        has-select
        height="65vh"
        @selection-change="(val: Array<Api>) => unboundSelection = val"
    />
    <template #footer>
      <el-button @click="dialogUnboundFormVisible = false">Cancel</el-button>
      <el-button type="primary" @click="boundApi">Bind</el-button>
    </template>
  </el-dialog>
  <!-- user dialog -->
  <el-dialog v-model="dialogBoundUserFormVisible" :title="dialogBoundUserTitle" width="50vw" top="5vh" destroy-on-close>
    <user-table
        @load-user="loadBoundUser"
        v-model:user-list="boundUserList"
        v-model:total="boundUserTotal"
        has-select
        height="65vh"
        @selection-change="(val: Array<User>) => boundUserSelection = val"
    />
    <template #footer>
      <el-button @click="dialogBoundUserFormVisible = false">Cancel</el-button>
      <el-button type="primary" @click="unboundUser">Unbind</el-button>
    </template>
  </el-dialog>
  <el-dialog v-model="dialogUnboundUserFormVisible" :title="dialogUnboundUserTitle" width="50vw" top="5vh" destroy-on-close>
    <user-table
        @load-user="loadUnboundUser"
        v-model:user-list="unboundUserList"
        v-model:total="unboundUserTotal"
        has-select
        height="65vh"
        @selection-change="(val: Array<User>) => unboundUserSelection = val"
    />
    <template #footer>
      <el-button @click="dialogUnboundUserFormVisible = false">Cancel</el-button>
      <el-button type="primary" @click="boundUser">Unbind</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>
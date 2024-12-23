<script setup lang="ts">

import {ref} from "vue";
import type {AxiosResponse} from "axios"
import {isSuccess, type Response} from "@/utils/responseHandle"
import {ElMessage} from "element-plus";
import UserTable from "@/components/UserTable.vue";
import {getLightRolesCall, queryUserBoundRolesCall, queryUserCall, userGrantCall} from "@/api/user";
import type {Role, RoleLight} from "@/types/role";
import type {User} from "@/types/user";

const userList = ref<Array<User>>([])
const total = ref<number>(0)

const loadUser = (currentPage: number, pageSize: number, search?: string) => {
  queryUserCall({
    page: currentPage,
    per_page: pageSize,
    search: search
  }).then((response: AxiosResponse) => {
    const res: Response<Array<User>> = response.data
    if (isSuccess(res)) {
      userList.value = res.data
      total.value = res.pagination?.total || 0
    }
  })
}


/**
 * 用户授权
 */
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
  getLightRolesCall().then((response: AxiosResponse) => {
    if (isSuccess(response.data)) {
      temp = response.data.data
      temp.forEach(item => {
        data.push({
          key: item.id,
          label: item.service ? item.service + " - " + item.name : item.name
        })
      })
      data.sort((a: Option, b: Option) => a.label > b.label ? 1 : -1)
    }
  })
  return data
}
const roleList = ref(generateData())


const handleGrant = (index: number, row: User) => {
  queryUserBoundRolesCall(row.id, {})
      .then((response: AxiosResponse) => {
        const res: Response<Array<RoleLight>> = response.data
        if (isSuccess(response.data)) {
          dialogBindRolesTitle.value = "Bind roles for user: " + row.username
          dialogBindRolesVisible.value = true
          currentUser.value = row
          bindRolesList.value = res.data.map(item => item.id) || []
        }
      })
}

const grantPermission = () => {
  console.log("grant", bindRolesList.value)
  userGrantCall(currentUser.value!.id, { ids: bindRolesList.value })
      .then((response: AxiosResponse) => {
        if (isSuccess(response.data)) {
          ElMessage.success({
            message: "Grant success!"
          })
          dialogBindRolesVisible.value = false
        }
      })
}

</script>

<template>
  <user-table
      has-add
      has-bind
      @load-user="loadUser"
      v-model:user-list="userList"
      v-model:total="total"
      @handle-grant="handleGrant"
  />
  <!-- grant role dialog -->
  <el-dialog v-model="dialogBindRolesVisible" :title="dialogBindRolesTitle" width="1000px">
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
:deep(.el-transfer-panel) {
  width: 300px;
}
:deep(.el-transfer-panel__body) {
  height: 40vh; /* 穿梭框列表高度 */
}
</style>
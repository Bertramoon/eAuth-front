<script setup lang="ts">
import { securityLogGet, operateLogGet } from '@/api/log';
import type { SecurityLog, SecurityLogQuery, OperateLog, OperateLogQuery } from '@/types';
import { errorHandle } from '@/utils/responseHandle';
import { Refresh, Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';


// 初始化数据
onMounted(() => {
    loadSecurityLog()
})

const form = ref<SecurityLogQuery>({})

const operateDateTime = ref<Array<Date>>([])

const securityLogList = ref<Array<SecurityLog>>([])

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

const querySecurityLog = () => {
    if (operateDateTime.value[0]) {
        form.value.start_datetime = formatDate(operateDateTime.value[0])
    }
    if (operateDateTime.value[1]) {
        form.value.end_datetime = formatDate(operateDateTime.value[1])
    }
    loadSecurityLog()
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
const pageSize = ref(20)
const currentPage = ref(1)
const total = ref(0)

const handleCurrentChange = () => {
    loadSecurityLog()
}

const loadSecurityLog = () => {
    securityLogGet({
        page: currentPage.value,
        per_page: pageSize.value,
        ...pickNonEmptyValues(form.value)
    }).then((response) => {
        if (response.status === 200 && response.data.success === true) {
            securityLogList.value = response.data.data
            total.value = response.data.pagination.total
        }
    }).catch(function (error) {
        if (error.response.status === 404 && currentPage.value > 1) {
            currentPage.value--
            loadSecurityLog()
            return
        }
        // 如果最后还是404，将结果置空
        if (error.response.status === 404) {
            securityLogList.value = []
            total.value = 0
            return
        }
        ElMessage.error({
            message: errorHandle(error.response.data, "Get security log failed!")
        })
    })
}

const pickNonEmptyValues = (obj: any) => {
    return Object.keys(obj)
        .filter(key => obj[key] !== null && obj[key] !== undefined && obj[key] !== '')
        .reduce((acc: any, key) => {
            acc[key] = obj[key]
            return acc
        }, {})
}

const resetQuery = () => {
    form.value = {}
    operateDateTime.value = []
}


</script>
<template>
    <!-- search -->
    <el-form :inline="true" v-model="form" style="text-align: center;" size="small">
        <el-form-item label="Operator">
            <el-input v-model="form.username" placeholder="Input username" clearable />
        </el-form-item>
        <el-form-item label="Client address">
            <el-input v-model="form.ip_addr" placeholder="Input IP address" clearable />
        </el-form-item>
        <el-form-item label="Operate">
            <el-input v-model="form.operate" placeholder="Input operation description" clearable />
        </el-form-item>
        <el-form-item label="Result">
            <el-select v-model="form.success" placeholder="Select operate result" clearable>
                <el-option label="Success" :value="true" />
                <el-option label="Failure" :value="false" />
            </el-select>
        </el-form-item>
        <el-form-item label="Datetime range">
            <el-date-picker v-model="operateDateTime" type="datetimerange" :shortcuts="shortcuts"
                start-placeholder="Start date" end-placeholder="End date" />
        </el-form-item>
    </el-form>
    <el-row :gutter="20" style="padding-bottom: 10px;">
        <el-col :span="24" style="text-align: center;">
            <el-button @click="resetQuery" plain type="info" size="small" :icon="Refresh">Reset</el-button>
            <el-button type="primary" plain @click="querySecurityLog" size="small" :icon="Search">Query</el-button>
        </el-col>
    </el-row>
    <!-- table display -->
    <el-scrollbar>
        <el-table :data="securityLogList" style="width: 100%" :default-sort="{ prop: 'id', order: 'descending' }">
            <el-table-column prop="id" label="Id" min-width="30" sortable />
            <el-table-column prop="username" label="Operator" min-width="50" sortable />
            <el-table-column prop="ip_addr" label="Client address" min-width="65" sortable />
            <el-table-column prop="operate" label="Operate" min-width="40" sortable />
            <el-table-column prop="operate_datetime" label="Datetime" min-width="60" />
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
        </el-table>
    </el-scrollbar>
    <!-- pagination -->
    <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" size="large"
            layout="total, sizes, prev, pager, next" :total="total" @current-change="handleCurrentChange"
            @size-change="handleCurrentChange" />
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
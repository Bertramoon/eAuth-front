<script setup lang="ts">
import type {Option} from "@/types";

// pagination
const currentPage = defineModel<number>('currentPage')
const pageSize = defineModel<number>('pageSize')
const total = defineModel<number>('total')
defineProps<{
  tableHeight?: string,
  options: Array<Option>,
  pageSizes: Array<number>,
  hasSelect: boolean
}>()
defineEmits<{
  (e: 'handleCurrentChange'): void,
  (e: 'selectionChange', val: Array<any>): void
}>()

// table
const data = defineModel<Array<any>>('data')
</script>

<template>
  <!-- component header, e.g. search && create button -->
  <el-row style="padding-bottom: 10px;">
    <slot name="header"></slot>
  </el-row>
  <!-- table display -->
  <el-scrollbar :style="'height: ' + tableHeight||'70vh'">
    <el-table :data="data" style="width: 100%" :row-key="row => row.id"
              @selection-change="(val: any) => { $emit('selectionChange', val) }">
      <el-table-column type="selection" reserve-selection v-if="hasSelect"/>
      <el-table-column
          v-for="option in options"
          :prop="option.prop"
          :label="option.label"
          :min-width="option.minWidth"
          :sortable="option.sortable"
          :show-overflow-tooltip="option.showOverflowTooltip"
      />
      <slot name="options"></slot>
    </el-table>
  </el-scrollbar>
  <!-- pagination -->
  <slot name="pagination">
    <div class="pagination-container">
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" size="large"
                     layout="total, sizes, prev, pager, next" :total="total"
                     @current-change="$emit('handleCurrentChange')"
                     @size-change="$emit('handleCurrentChange')"
                     :page-sizes="pageSizes"/>
    </div>
  </slot>
</template>

<style scoped>
.pagination-container {
  margin-top: 10px;
}
</style>
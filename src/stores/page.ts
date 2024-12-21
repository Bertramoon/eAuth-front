import {defineStore} from "pinia";
import {ref} from "vue";


export const usePageStore = defineStore("page", () => {
    const pageSize = ref<number>(10)
    const pageSizes = [10, 20, 50, 100, 200]

    return {pageSize, pageSizes}
}, {
    persist: {
        enabled: true,
        strategies: [
            {
                key: 'page',
                storage: localStorage
            }
        ]
    }
})
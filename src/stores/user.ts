import {defineStore} from "pinia";
import {ref} from "vue";

export const useUserStore = defineStore("user", () => {
    const token = ref<string>()
    const username = ref<string>()

    return {token, username}
}, {
    persist: {
        enabled: true,
        strategies: [
            {
                key: "token",
                storage: sessionStorage
            }
        ]
    }
})
import {defineStore} from 'pinia'

export const useStore = defineStore('store',{
    state: () => ({
        province: '',
        school_parallel: '',
        school_parallel_id: '',
        school_parallel_filter: '',
        school_parallel_index: '',
        school_parallel_data: '',
    }),
    getters:{

    },
    actions:{
        //burshed方法,将数据传出
        brushend(){
            this.data = this.school_parallel_data
        },

        // sankey方法,接收brushed传来的数据
        sankey(){
            return {
                parallel_id: this.school_parallel_id,
                parallel_filter: this.school_parallel_filter,
                parallel_index: this.school_parallel_index
            }
        }
    }
})
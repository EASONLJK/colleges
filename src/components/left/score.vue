<template>
    <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" class="demo-ruleForm custom-form" label-width="50px"
        status-icon size="small">
        <el-form-item label="省份" prop="classify_province" class="custom-form-item">
            <el-select v-model="ruleForm.classify_province" placeholder="请选择省份" @change="getTypes()">
                <el-option v-for="item in province_options" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
            </el-select>
        </el-form-item>

        <el-form-item label="类型" prop="classify_type" class="custom-form-item">
            <el-select v-model="ruleForm.classify_type" placeholder="请选择学科类型">
                <el-option v-for="item in type_options" :key="item.value" :label="item.label"
                    :value="item.value"></el-option>
            </el-select>
        </el-form-item>

        <el-form-item label="分数" prop="score" class="custom-form-item">
            <el-col :span="12">
                <el-input v-model="ruleForm.score" placeholder="请输入分数" />
            </el-col>
        </el-form-item>

        <el-form-item class="custom-form-item">
            <el-button type="primary" @click="submitForm(ruleFormRef)
                ">
                Submit
            </el-button>
        </el-form-item>
    </el-form>
</template>
  
<script lang="ts" setup>
import { reactive, ref, onMounted, inject, onUpdated } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import axios from 'axios'

var province_options = ref([])
var type_options = ref([])
// var types = ref([])
let bus = inject('bus')
let province_datas: any[] = []
let url = 'http://127.0.0.1:5000/'
axios.get(url + 'province_scores').then(res => {
    const keys = Object.keys(res.data[0])
    const province_names = []
    for (let i = 0; i < res.data.length; i++) {
        province_names.push(res.data[i][keys[0]])
        province_datas.push(res.data[i])
    }
    // options传值
    for (let i = 0; i < province_names.length; i++) {
        province_options.value.push({ value: province_names[i], label: province_names[i] })
    }

})

const ruleFormRef = ref<FormInstance>()

const checkScore = (rule: any, value: any, callback: any) => {
    if (!value) {
        return callback(new Error('请输入分数'))
    }
    if (value < 0 || value > 750) {
        callback(new Error('请输入正确的分数'))
    } else {
        callback()
    }
}

const checkProvince = (rule: any, value: any, callback: any) => {
    if (!value) {
        return callback(new Error('请选择省份'))
    } else {
        callback()
    }
}

const checkType = (rule: any, value: any, callback: any) => {
    if (!value) {
        return callback(new Error('请选择学科类型'))
    } else {
        callback()
    }
}

const ruleForm = reactive({
    score: '',
    classify_province: '',
    classify_type: ''
})

const rules = reactive<FormRules>({
    score: [{ validator: checkScore, trigger: 'blur' }],
    classify_province: [{ validator: checkProvince, trigger: 'change' }],
    classify_type: [{ validator: checkType, trigger: 'change' }]
})

const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.validate((valid, fields) => {
        if (valid) {
            console.log('submit!')
        } else {
            console.log('error submit!', fields)
        }
    })

    //输出对应options的value
    let province_name = ruleForm.classify_province
    let input_score = ruleForm.score
    let type = ruleForm.classify_type
    let province_data
    province_data = province_datas.filter(item => item['province_name'] == province_name)[0]
    var province_scores = province_data.province_scores
    var filter_name = []
    var filter_score
    var filter_scores
    var average_score: number
    var bus_filter_data = []
    var bus_data = []
    var color_mark = []
    filter_score = province_scores.map((item: { attributes: any }) => item.attributes.filter(
        (item: { type: any }) => item.type == type
    ))
    filter_scores = filter_score.map((item: { score: any }[]) => item.map((item: { score: any }) => item.score))
    average_score = filter_scores.map((item: any) => {
        var sum = 0
        var count = 0
        for (let i = 0; i < item.length; i++) {
            if (item[i] != 0) {
                sum += item[i]
                count += 1
            }
        }
        if (count == 0) {
            return 0
        } else {
            return Math.round(sum / count)
        }
    })
    let j = 0
    for (let i = 0; i < province_scores.length; i++) {
        if (average_score[i] <= input_score && average_score[i] != 0) {
            filter_name.push(province_scores[i].name)
            bus_filter_data.push(filter_score[i])
            //根据输入分数和平均分数的差值来判断颜色
            if (input_score - average_score[i] <= 10) {
                color_mark.push('red')
            } else if (input_score - average_score[i] <= 20) {
                color_mark.push('yellow')
            } else {
                color_mark.push('green')
            }
            console.log(input_score - average_score[i], color_mark);

        }
    }
    for (let i = 0; i < filter_name.length; i++) {
        bus_data.push({ name: filter_name[i], attributes: bus_filter_data[i], color: color_mark[i] })
    }
    console.log(bus_data);
    bus.emit('submitForm', bus_data)
}

function getTypes() {
    type_options.value = []
    let province_name = ruleForm.classify_province
    let province_data
    province_data = province_datas.filter(item => item['province_name'] == province_name)[0]
    var province_scores = province_data.province_scores
    var colleges_type = []
    colleges_type = Array.from(new Set(province_scores[0].attributes.map(((item: { type: any }) => {
        return item.type
    }))))
    for (let i = 0; i < colleges_type.length; i++) {
        type_options.value.push({ value: colleges_type[i], label: colleges_type[i] })
    }
}

onUpdated(() => {
    try {
        submitForm(ruleFormRef.value)
    } catch (error) {
        console.log(error);
    }
})

</script>

<style>
.demo-ruleForm {
    height: 100%;
    width: 100%;
}

.el-input__wrapper {
    height: 20px;
}

.custom-form-item {
    height: 20px;
}

.el-form-item__content {
    height: 20px;
}

.custom-form-item label {
    font-size: 13px;
}
</style>
  
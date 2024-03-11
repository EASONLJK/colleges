<template>
    <div class="right-framwork">
        <div id="dialog">
            <button @click="openDialog">
                Submit
            </button>
            <childdialog ref="childDialog" :visible="dialogVisible" @ok="onDialogOk" @cancel="onDialogCancel">
            </childdialog>
        </div>
        <div id="parallel_axis">
            <div id="school_parallel_axis">
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, reactive, watch, watchEffect, nextTick, inject, ref, toRef } from 'vue';
import * as d3 from 'd3'
import axios, { all } from 'axios'
import { useStore } from '../../store/index.js'
import childdialog from '../dialog/custom_weight.vue'

let data_length = ref(0)
let store = useStore()
let bus = inject('bus')
let allColleges = []
let url = 'http://127.0.0.1:5000/'

let obj = reactive({
    area_name: [],
    eduFund: [],
    nature_name: [],
    school_level: [],
    type_name: [],
    heat_name: [],
    prob_name: [],
    area_weight: [],
    edu_weight: [],
    nature_weight: [],
    school_weight: [],
    type_weight: [],
    heat_weight: [],
    prob_weight: [],
    all_weight: [],
    data: [],
})

const dialogVisible = ref(false);
const childDialog = ref(null);

function openDialog() {
    dialogVisible.value = true;
}

function AHP(AHP_data) {
    // 计算每列的和
    let colSum = [];
    for (let j = 0; j < AHP_data.length; j++) {
        let sum = 0;
        for (let i = 0; i < AHP_data.length; i++) {
            sum += AHP_data[i][j];
        }
        colSum.push(sum);
    }

    // 计算归一化矩阵
    let normMatrix = [];
    for (let i = 0; i < AHP_data.length; i++) {
        let temp = [];
        for (let j = 0; j < AHP_data.length; j++) {
            temp.push(AHP_data[i][j] / colSum[j]);
        }
        normMatrix.push(temp);
    }

    // 计算每行的平均值
    let rowAvg = [];
    for (let i = 0; i < AHP_data.length; i++) {
        let sum = 0;
        for (let j = 0; j < AHP_data.length; j++) {
            sum += normMatrix[i][j];
        }
        rowAvg.push(sum / AHP_data.length);
    }

    // 计算权重向量
    let weightVector = [];
    let sum = 0;
    for (let i = 0; i < AHP_data.length; i++) {
        weightVector.push(rowAvg[i]);
        sum += rowAvg[i];
    }
    for (let i = 0; i < AHP_data.length; i++) {
        weightVector[i] /= sum;
    }

    // 计算一致性指标
    let lambdaMax = 0;
    let RI_arr = [0, 0, 0.58, 0.90, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49, 1.51, 1.54, 1.56];
    for (let i = 0; i < AHP_data.length; i++) {
        let sum = 0;
        for (let j = 0; j < AHP_data.length; j++) {
            sum += AHP_data[i][j] * weightVector[j];
        }
        lambdaMax += sum / (AHP_data.length * weightVector[i]);
    }
    let CI = (lambdaMax - AHP_data.length) / (AHP_data.length - 1);
    let CR = CI / RI_arr[AHP_data.length - 1];

    // console.log("CR = " + CR);
    // 将权重向量转换为数组类型，返回
    let weightVector_arr = [];
    for (let i = 0; i < AHP_data.length; i++) {
        weightVector_arr.push(weightVector[i]);
    }

    return weightVector_arr
}

function onDialogOk(areaName, eduFund, natureName, schoolLevel, typeName, heatName, probName) {
    dialogVisible.value = false;

    obj.area_name = areaName
    obj.eduFund = eduFund
    obj.nature_name = natureName
    obj.school_level = schoolLevel
    obj.type_name = typeName
    obj.heat_name = heatName
    obj.prob_name = probName

    obj.area_weight = AHP(obj.area_name)
    obj.edu_weight = AHP(obj.eduFund)
    obj.nature_weight = AHP(obj.nature_name)
    obj.school_weight = AHP(obj.school_level)
    obj.type_weight = AHP(obj.type_name)
    obj.heat_weight = AHP(obj.heat_name)
    obj.prob_weight = AHP(obj.prob_name)

    obj.all_weight = obj.nature_weight.concat(obj.school_weight, obj.type_weight, obj.area_weight, obj.edu_weight, obj.heat_weight, obj.prob_weight)

    const process_weight_data = weightsProcess()
    store.process_weight_data = process_weight_data
}

function weightsProcess() {

    let area_weight = []
    let edu_weight = []
    let nature_weight = []
    let school_weight = []
    let type_weight = []
    let heat_weight = []
    let prob_weight = []
    let process_weight = []
    let area_weight_name = ['41', '42', '43', '44', '45', '46', '47']
    let edu_weight_name = ['51', '52', '53', '54', '55']
    let nature_weight_name = ['111', '112', '113', '114']
    let school_weight_name = ['1', '2', '3', '4', '5']
    let type_weight_name = ['11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23']
    let heat_weight_name = ['31', '32', '33', '34', '35']
    let prob_weight_name = ['61', '62', '63', '64']

    //将obj.area_weight, obj.edu_weight, obj.heat_weight中的权重分配数据对象
    for (let i = 0; i < obj.area_name.length; i++) {
        area_weight.push({
            name: area_weight_name[i],
            weight: obj.area_weight[i]
        })
    }

    for (let i = 0; i < obj.eduFund.length; i++) {
        edu_weight.push({
            name: edu_weight_name[i],
            weight: obj.edu_weight[i]
        })
    }

    for (let i = 0; i < obj.heat_name.length; i++) {
        heat_weight.push({
            name: heat_weight_name[i],
            weight: obj.heat_weight[i]
        })
    }

    for (let i = 0; i < obj.prob_name.length; i++) {
        prob_weight.push({
            name: prob_weight_name[i],
            weight: obj.prob_weight[i]
        })
    }

    for (let i = 0; i < obj.nature_name.length; i++) {
        nature_weight.push({
            name: nature_weight_name[i],
            weight: obj.nature_weight[i]
        })
    }
    for (let i = 0; i < obj.school_level.length; i++) {
        school_weight.push({
            name: school_weight_name[i],
            weight: obj.school_weight[i]
        })
    }
    for (let i = 0; i < obj.type_name.length; i++) {
        type_weight.push({
            name: type_weight_name[i],
            weight: obj.type_weight[i]
        })
    }

    process_weight = nature_weight.concat(area_weight, edu_weight, heat_weight, school_weight, type_weight, prob_weight)
    return process_weight
}

function onDialogCancel() {
    dialogVisible.value = false;
}

function school_parallelAxis() {
    let data, keys
    let bus_data_name
    d3.select("#school_parallel_axis").select("svg").remove();
    axios.get(url + 'school_parallel').then(res => {
        store.school_parallel = res.data
        data = store.school_parallel
        d3.select("#school_parallel_axis").select("svg").remove();
        bus.on('submitForm', bus_data => {
            data_length = bus_data.length
            bus_data_name = bus_data.map(item => item.name)
            let score = bus_data.map(item => item.attributes.map(d => d.score))
            score = score.map(item => item[0])
            data = data.filter(item => {
                return bus_data_name.some(d => {
                    return d == item.name
                })
            })

            var probability = bus_data.map(item => item.probability)
            var probability_name = bus_data.map(item => item.name)
            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < probability.length; j++) {
                    if (data[i].name == probability_name[j]) {
                        data[i].prob_name = probability[j].prob_name
                    }
                }
            }
            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < score.length; j++) {
                    if (data[i].name == probability_name[j]) {
                        data[i].score = score[j]
                    }
                }
            }

            keys = Object.keys(data[0]).filter(item => item != 'name')
            d3.select("#school_parallel_axis").select("svg").remove();
            let school_parallel_view = document.getElementById("school_parallel_axis");
            let margin = { top: 10, right: 12, bottom: 10, left: 12 },
                width = school_parallel_view.offsetWidth - margin.left - margin.right,
                height = school_parallel_view.offsetHeight - margin.top - margin.bottom;

            const svg = d3.select(school_parallel_view)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.bottom + margin.top)

            var x = new Map(Array.from(keys, key => [key, d3.scaleLinear(d3.extent(data, d => d[key]), [margin.top, height - margin.bottom])])),
                y = d3.scalePoint(keys, [margin.left, width - margin.left - margin.right])

            var line = d3.line()
                .y(([key, value]) => x.get(key)(value))
                .x(([key]) => y(key))

            const path = svg.append("g")
                .attr("class", "line")
                .attr("fill", "none")
                .attr("stroke-opacity", 0.5)
                .selectAll("path")
                .data(data)
                .join("path")
                .attr("d", d => line(d3.cross(keys, [d], (key, d) => [key, d[key]])))
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .attr("stroke-linecap", "round")
                .attr("stroke-linejoin", "round")
                .attr("transform", `translate(0,${margin.top})`)

            svg.append("g")
                .selectAll("g")
                .data(keys)
                .join("g")
                .attr("transform", d => `translate(${y(d)},10)`)
                .attr("class", "axisRight")
                .each(function (d) {
                    d3.select(this).call(d3.axisRight(x.get(d))
                        .tickFormat(d => {
                            if (d == 1) return "985"
                            if (d == 2) return "211"
                            if (d == 3) return "双一流"
                            if (d == 4) return "普通本科"
                            if (d == 5) return "专科"
                            if (d == 11) return "综合类"
                            if (d == 12) return "理工类"
                            if (d == 13) return "师范类"
                            if (d == 14) return "农林类"
                            if (d == 15) return "政法类"
                            if (d == 16) return "艺术类"
                            if (d == 17) return "财经类"
                            if (d == 18) return "民族类"
                            if (d == 19) return "医药类"
                            if (d == 20) return "其他"
                            if (d == 21) return "军事类"
                            if (d == 22) return "体育类"
                            if (d == 23) return "语言类"
                            if (d == 31) return "大热门"
                            if (d == 32) return "热门"
                            if (d == 33) return "中等热门"
                            if (d == 34) return "偏冷门"
                            if (d == 35) return "冷门"
                            if (d == 41) return "东北地区"
                            if (d == 42) return "华北地区"
                            if (d == 43) return "西北地区"
                            if (d == 44) return "华中地区"
                            if (d == 45) return "华东地区"
                            if (d == 46) return "西南地区"
                            if (d == 47) return "华南地区"
                            if (d == 51) return "高经费"
                            if (d == 52) return "中高经费"
                            if (d == 53) return "中等经费"
                            if (d == 54) return "中低经费"
                            if (d == 55) return "低经费"
                            if (d == 61) return "稳"
                            if (d == 62) return "保"
                            if (d == 63) return "冲"
                            if (d == 64) return "不招生"
                            if (d == 111) return "公办"
                            if (d == 112) return "民办"
                            if (d == 113) return "中外合作办学"
                            if (d == 114) return "内地与港澳台合作办学"
                            //如果刻度全是数字，则返回数字
                            if (d % 1 == 0) return d

                        })
                    )
                })
                .call(g => g.append("text")
                    .attr("y", margin.left - 10)
                    .attr("x", -5)
                    .attr("text-anchor", "center")
                    .attr("fill", "currentColor")
                    .text(d => {
                        if (d == "nature_name") return "办学性质"
                        if (d == "school_level") return "办学层次"
                        if (d == "type_name") return "院校类型"
                        if (d == "area_name") return "地区"
                        if (d == "eduFund") return "经费"
                        if (d == 'view_total_number') return "热度"
                        if (d == 'prob_name') return "录取率"
                        if (d == 'score') return "分数"
                    }))
                .call(g => g.selectAll("text")
                    .clone(true).lower()
                    .attr("fill", "none")
                    .attr("stroke-width", 5)
                    .attr("stroke-linejoin", "round")
                    .attr("stroke", "white"));

            svg.append("g")
                .selectAll("g")
                .data(keys)
                .join("g")
                .attr("transform", d => `translate(${y(d)},10)`)
                .call(g => g.append("g")
                    .call(d3.brushY()
                        .extent(
                            [
                                [-10, margin.top],
                                [10, height - margin.bottom]
                            ]
                        )

                        .on("end", brushend)))
                .call(g => g.selectAll(".domain")
                    .datum(d => {
                        return {
                            type: "selection",
                            id: d
                        }
                    })
                );

            function update_weight(weight_data) {
                var process_weight = store.process_weight_data
                // 踩坑，在JS中，对象是通过引用传递的，而不是通过值传递的
                var school_parallel_data = weight_data.map(item => {
                    return {
                        name: item.name,
                        area_name: item.area_name,
                        eduFund: item.eduFund,
                        nature_name: item.nature_name,
                        school_level: item.school_level,
                        type_name: item.type_name,
                        heat_name: item.view_total_number,
                        prob_name: item.prob_name,
                        probability: item.prob_name
                    }
                })

                for (let i = 0; i < school_parallel_data.length; i++) {
                    for (let j = 0; j < process_weight.length; j++) {
                        if (school_parallel_data[i].area_name == process_weight[j].name) {
                            school_parallel_data[i].area_name = process_weight[j].weight
                        }
                        if (school_parallel_data[i].eduFund == process_weight[j].name) {
                            school_parallel_data[i].eduFund = process_weight[j].weight
                        }
                        if (school_parallel_data[i].nature_name == process_weight[j].name) {
                            school_parallel_data[i].nature_name = process_weight[j].weight
                        }
                        if (school_parallel_data[i].school_level == process_weight[j].name) {
                            school_parallel_data[i].school_level = process_weight[j].weight
                        }
                        if (school_parallel_data[i].type_name == process_weight[j].name) {
                            school_parallel_data[i].type_name = process_weight[j].weight
                        }
                        if (school_parallel_data[i].heat_name == process_weight[j].name) {
                            school_parallel_data[i].heat_name = process_weight[j].weight
                        }
                        if (school_parallel_data[i].prob_name == process_weight[j].name) {
                            school_parallel_data[i].prob_name = process_weight[j].weight
                        }
                    }
                }
                //将每个高校的录取率对应的冲稳保不招生的值存入school_parallel_data中
                for (let i = 0; i < school_parallel_data.length; i++) {
                    if (school_parallel_data[i].probability == 61) {
                        school_parallel_data[i].probability = '稳'
                    }
                    if (school_parallel_data[i].probability == 62) {
                        school_parallel_data[i].probability = '保'
                    }
                    if (school_parallel_data[i].probability == 63) {
                        school_parallel_data[i].probability = '冲'
                    }
                    if (school_parallel_data[i].probability == 64) {
                        school_parallel_data[i].probability = '不招生'
                    }
                }
                return school_parallel_data
            }
            store.update_weight_data = update_weight(data)
            // console.save = function (data, filename) {
            //     var blob = new Blob([data], { type: "text/plain" });
            //     var url = URL.createObjectURL(blob);
            //     var link = document.createElement("a");
            //     link.href = url;
            //     link.download = filename;
            //     link.click();
            //     URL.revokeObjectURL(url);
            // }
            function brushend({ selection }) {
                store.mark = 1
                if (selection) {
                    //计算刷子选中的区域的domain
                    var domain = selection.map(x.get(this.parentNode.__data__).invert)
                    //获取刷子选中的区域的点
                    var filtered = data.filter(d => {
                        return d[this.parentNode.__data__] >= domain[0] && d[this.parentNode.__data__] <= domain[1]
                    })

                    //获取刷子选中的区域的点对应轴的刻度的text
                    var ticks = x.get(this.parentNode.__data__).ticks()
                    store.all_school_parallel_index = ticks
                    //获取刷子选中的区域的点对应轴的刻度的值
                    var index = ticks.filter(d => {
                        return d >= domain[0] && d <= domain[1]
                    })

                    //将刷子选中的区域的点对应轴的刻度的值存入store中
                    store.school_parallel_index = index.filter(item => {
                        return item % 1 == 0
                    })

                    //获取刷子选中的区域所属的轴的id
                    store.school_parallel_id = this.parentNode.__data__

                    //将每个轴对应的筛选的数据存入allColleges中
                    allColleges[this.parentNode.__data__] = filtered

                    // 将筛选出来的点的个数存入store中
                    store.school_parallel_filter = filtered.length

                    //获取allColleges中相同的点
                    store.colleges_filter = Object.values(allColleges).reduce((a, b) => {
                        return a.filter(c => {
                            return b.some(d => {
                                return d.name == c.name
                            })
                        })
                    })
                    store.colleges_filter = store.colleges_filter.map(proxyObject => {
                        // 提取原始对象
                        const plainObject = Object.fromEntries(Object.entries(proxyObject));
                        return plainObject;
                    });

                    // console.log('筛选出来的数据', store.colleges_filter)
                    store.parallel_data = [
                        store.school_parallel_id,
                        store.school_parallel_index,
                        store.school_parallel_filter,
                        store.colleges_filter,
                        data_length,
                        store.mark,
                        store.all_school_parallel_index
                    ]
                    console.log('选中', store.parallel_data);
                    bus.emit('brushend', store.parallel_data)
                }
                if (!selection) {
                    store.mark = 0
                    delete allColleges[this.parentNode.__data__]
                    var remainingData = [].concat(...Object.values(allColleges));

                    store.colleges_filter = data.filter(d => {
                        return remainingData.some(item => item.name === d.name)
                    });
                    store.school_parallel_id = this.parentNode.__data__;
                    store.parallel_data = [
                        store.school_parallel_id,
                        store.school_parallel_index,
                        store.school_parallel_filter,
                        store.colleges_filter,
                        data_length,
                        store.mark,
                        store.all_school_parallel_index
                    ];
                    bus.emit('brushend', store.parallel_data)
                }
                path.attr("stroke", d => {
                    // 首先检查store.colleges_filter是否为空
                    if (store.colleges_filter.length === 0) {
                        // 如果为空，则将路径颜色设置为"green"或其他期望的颜色
                        return "steelblue"; // 你可以根据需求更换这里的颜色
                    }
                    else if (store.colleges_filter.some(item => item.name == d.name)) {
                        // 如果store.colleges_filter不为空，并且其中某项的name属性与d.name相等，设置颜色为"red"
                        return "red";
                    } else {
                        // 如果以上两个条件都不满足，设置颜色为"steelblue"
                        return "steelblue";
                    }
                });
            }
        })
    })

}

onMounted(() => {
    // triggerChildMethod();
    openDialog();
    // onDialogOk();
    onDialogCancel();
    // weightsProcess()
    try {
        school_parallelAxis()
    } catch (error) {
    }
})

</script>

<style scoped>
.right-framwork {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

#parallel_axis {
    width: 100%;
    height: 90%;
    display: flex;
    flex-direction: row;
}

#school_parallel_axis {
    width: 100%;
    height: 100%;
}

#dialog {
    width: 100%;
    height: 10%;
}
</style>../dialog/custom_weights.vue
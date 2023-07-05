<template>
    <div id="school_parallel_axis">

    </div>
</template>

<script setup>
import { onMounted, reactive, onUpdated, toRaw, inject } from 'vue';
import * as d3 from 'd3'
import axios from 'axios'
import { useStore } from '../../store/index.js'

let store = useStore
let bus = inject('bus')
let allColleges = []
let colleges_filter = []
function school_parallelAxis() {
    bus.on('submitForm', bus_data => {
        let url = 'http://127.0.0.1:5000/'
        let data, keys
        let bus_data_name = bus_data.map(item => item.name)
        axios.get(url + 'school_parallel').then(res => {
            store.school_parallel = res.data
            data = store.school_parallel
            //对比bus_data_name,过滤出于bus_data_name相同的数据
            data = data.filter(item => bus_data_name.includes(item.name))
            //获取data中除了name的字段
            keys = Object.keys(data[0]).filter(item => item != 'name')
            console.log(data,keys);

            let school_parallel_view = document.getElementById("school_parallel_axis");
            let margin = { top: 30, right: 10, bottom: 10, left: 30 },
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

            //为每个轴绘制path
            svg.append("g")
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
                .on("mouseover", hightlight)
                // .on("mouseleave", donothightlight)
                .append("title")
                .text(d => d.name)
            //绘制坐标轴
            svg.append("g")
                .selectAll("g")
                .data(keys)
                .join("g")
                .attr("transform", d => `translate(${y(d)},0)`)
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
                            if (d == 111) return "公办"
                            if (d == 112) return "民办"
                            if (d == 113) return "中外合作办学"
                            if (d == 114) return "内地与港澳台合作办学"
                        }))
                })
                .call(g => g.append("text")
                    .attr("y", margin.left - 4)
                    .attr("x", -25)
                    .attr("text-anchor", "center")
                    .attr("fill", "currentColor")
                    .text(d => d))
                .call(g => g.selectAll("text")
                    .clone(true).lower()
                    .attr("fill", "none")
                    .attr("stroke-width", 5)
                    .attr("stroke-linejoin", "round")
                    .attr("stroke", "white"));

            //为每一个axisRight添加brush刷子，selection为当前选中的区域
            svg.append("g")
                .selectAll("g")
                .data(keys)
                .join("g")
                .attr("transform", d => `translate(${y(d)},0)`)
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

            //highlight函数，高亮选中的path
            function hightlight(d) {
                svg.selectAll("path")
                    .attr("stroke", "steelblue")
                    .attr("stroke-width", 1.5)
                    .attr("stroke-opacity", 0.5)
                d3.select(this)
                    .attr("stroke", "red")
                    .attr("stroke-width", 3)
                    .attr("stroke-opacity", 1)
            }
            //刷子的brushend函数,统计轴上的刷子选中的区域的点的个数
            function brushend({ selection }) {

                if (!selection) return;

                //计算刷子选中的区域的domain
                var domain = selection.map(x.get(this.parentNode.__data__).invert)

                //获取刷子选中的区域的点
                var filtered = data.filter(d => {
                    return d[this.parentNode.__data__] >= domain[0] && d[this.parentNode.__data__] <= domain[1]
                })

                //获取刷子选中的区域的点对应轴的刻度的text
                var ticks = x.get(this.parentNode.__data__).ticks()

                //获取刷子选中的区域的点对应轴的刻度的值
                var index = ticks.filter(d => {
                    return d >= domain[0] && d <= domain[1]
                })

                //过滤index，只输出整数
                index = index.filter(d => {
                    return d % 1 == 0
                })

                //将刷子选中的区域的点对应轴的刻度的值存入store中
                store.school_parallel_index = index

                //获取刷子选中的区域所属的轴的id
                store.school_parallel_id = this.parentNode.__data__

                //将每个轴对应的筛选的数据存入allColleges中
                allColleges[this.parentNode.__data__] = filtered

                //获取allColleges中相同的点
                colleges_filter = Object.values(allColleges).reduce((a, b) => {
                    return a.filter(c => {
                        return b.some(d => {
                            return d.name == c.name
                        })
                    })
                })

                store.school_parallel_data = colleges_filter
                // console.log(colleges_filter);
                // console.log(store.school_parallel_data);

                // 将筛选出来的点的个数存入store中
                store.school_parallel_filter = filtered.length
                var parallel_data = [
                    store.school_parallel_id,
                    store.school_parallel_index,
                    store.school_parallel_filter,
                    colleges_filter
                ]

                //选中区域内的path高亮
                svg.selectAll("path")
                    .attr("stroke", "red")
                    .attr("stroke-width", 1.5)
                    .attr("stroke-opacity", 0.5)
                bus.emit("brushend", parallel_data)
            }
        })
    })
}

onMounted(() => {
    try {
        school_parallelAxis()
    } catch (error) {
        console.log(error);
    }
})
</script>

<style scoped>
#school_parallel_axis {
    width: 100%;
    height: 100%;
}
</style>
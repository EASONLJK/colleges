<template>
    <div id='sankey'>

    </div>
</template>

<script setup>
import { onMounted, ref, reactive, onUpdated, onUnmounted, inject } from 'vue';
import * as d3 from 'd3'
import * as d3Sankey from 'd3-sankey'
import axios from 'axios'
import { useStore } from '../../store/index.js'

const store = useStore()

let bus = inject('bus')
let allSource = []
let allTarget = []
let allValue = []
function sankey() {
    bus.on("brushend", parallel_data => {
        d3.select("#sankey").select("svg").remove();

        // d3绘制桑基图
        let source = parallel_data[0]
        let target = parallel_data[1].map(item => {
            //将数字转换为对应文字
            if (item == 1) return "985"
            if (item == 2) return "211"
            if (item == 3) return "双一流"
            if (item == 4) return "普通院校"
            if (item == 5) return "专科"
            if (item == 11) return "综合类"
            if (item == 12) return "理工类"
            if (item == 13) return "师范类"
            if (item == 14) return "农林类"
            if (item == 15) return "政法类"
            if (item == 16) return "艺术类"
            if (item == 17) return "财经类"
            if (item == 18) return "民族类"
            if (item == 19) return "医药类"
            if (item == 20) return "其他"
            if (item == 21) return "军事类"
            if (item == 22) return "体育类"
            if (item == 23) return "语言类"
            if (item == 31) return "大热门"
            if (item == 32) return "热门"
            if (item == 33) return "中等热门"
            if (item == 34) return "偏冷门"
            if (item == 35) return "冷门"
            if (item == 41) return "东北地区"
            if (item == 42) return "华北地区"
            if (item == 43) return "西北地区"
            if (item == 44) return "华中地区"
            if (item == 45) return "华东地区"
            if (item == 46) return "西南地区"
            if (item == 47) return "华南地区"
            if (item == 51) return "高经费"
            if (item == 52) return "中高经费"
            if (item == 53) return "中等经费"
            if (item == 54) return "中低经费"
            if (item == 55) return "低经费"
            if (item == 61) return "稳"
            if (item == 62) return "保"
            if (item == 63) return "冲"
            if (item == 64) return "不招生"
            if (item == 111) return "公办"
            if (item == 112) return "民办"
            if (item == 113) return "中外合作办学"
            if (item == 114) return "内地与港澳台合作办学"
        }).join(",")
        let value = parallel_data[2]
        let length = parallel_data[4]
        let data
        let unselected = "未选中"
        let mark = parallel_data[5]

        if (mark == 1) {
            allSource.push(source)
            allTarget.push(target)
            allValue.push(value)
        }
        if (mark == 0) {
            //删除对应mark为0的数据
            for (let i = 0; i < allSource.length; i++) {
                if (allSource[i] == source && allTarget[i] == target) {
                    allSource.splice(i, 1)
                    allTarget.splice(i, 1)
                    allValue.splice(i, 1)
                }
            }
        }
        // if (allSource.length > 1) {
        //     for (let i = 0; i < allSource.length - 1; i++) {
        //         if (allSource[i] == allSource[allSource.length - 1]) {
        //             allTarget[i] = allTarget[allSource.length - 1]
        //             allValue[i] = allValue[allSource.length - 1]
        //             allSource.pop()
        //             allTarget.pop()
        //             allValue.pop()
        //         }
        //     }
        // }
        // if (allSource.length == 1) {
        //     data = {
        //         "name": allSource[0],
        //         "children": [
        //             {
        //                 "name": allTarget[0],
        //                 "value": allValue[0]
        //             },
        //             {
        //                 "name": unselected,
        //                 "value": length - allValue[0]
        //             }
        //         ]
        //     }
        // }
        // if (allSource.length == 2) {
        //     data = {
        //         "name": allSource[0],
        //         "children": [
        //             {
        //                 "name": allTarget[0],
        //                 "children": [
        //                     {
        //                         "name": allTarget[1],
        //                         "value": allValue[0]
        //                     },
        //                     {
        //                         "name": unselected,
        //                         "value": length - allValue[1]
        //                     }
        //                 ]
        //             },
        //             {
        //                 "name": unselected,
        //                 "value": length - allValue[1]
        //             }
        //         ]
        //     }
        // }
        // if (allSource.length == 3) {
        //     data = {
        //         "name": allSource[0],
        //         "children": [
        //             {
        //                 "name": allTarget[0],
        //                 "children": [
        //                     {
        //                         "name": allTarget[1],
        //                         "children": [
        //                             {
        //                                 "name": allTarget[2],
        //                                 "value": allValue[0]
        //                             },
        //                             {
        //                                 "name": unselected,
        //                                 "value": length - allValue[2]
        //                             }
        //                         ]
        //                     },
        //                     {
        //                         "name": unselected,
        //                         "value": length - allValue[1]
        //                     }
        //                 ]
        //             },
        //             {
        //                 "name": unselected,
        //                 "value": length - allValue[0]
        //             }
        //         ]
        //     }
        // }
        // if (allSource.length == 4) {
        //     data = {
        //         "name": allSource[0],
        //         "children": [
        //             {
        //                 "name": allTarget[0],
        //                 "children": [
        //                     {
        //                         "name": allTarget[1],
        //                         "children": [
        //                             {
        //                                 "name": allTarget[2],
        //                                 "children": [
        //                                     {
        //                                         "name": allTarget[3],
        //                                         "value": allValue[0]
        //                                     },
        //                                     {
        //                                         "name": unselected,
        //                                         "value": length - allValue[3]
        //                                     }
        //                                 ]
        //                             },
        //                             {
        //                                 "name": unselected,
        //                                 "value": length - allValue[2]
        //                             }
        //                         ]
        //                     },
        //                     {
        //                         "name": unselected,
        //                         "value": length - allValue[1]
        //                     }
        //                 ]
        //             },
        //             {
        //                 "name": unselected,
        //                 "value": length - allValue[0]
        //             }
        //         ]
        //     }
        // }
        // if (allSource.length == 5) {
        //     data = {
        //         "name": allSource[0],
        //         "children": [
        //             {
        //                 "name": allTarget[0],
        //                 "children": [
        //                     {
        //                         "name": allTarget[1],
        //                         "children": [
        //                             {
        //                                 "name": allTarget[2],
        //                                 "children": [
        //                                     {
        //                                         "name": allTarget[3],
        //                                         "children": [
        //                                             {
        //                                                 "name": allTarget[4],
        //                                                 "value": allValue[0]
        //                                             },
        //                                             {
        //                                                 "name": unselected,
        //                                                 "value": length - allValue[4]
        //                                             }
        //                                         ]
        //                                     },
        //                                     {
        //                                         "name": unselected,
        //                                         "value": length - allValue[3]
        //                                     }
        //                                 ]
        //                             },
        //                             {
        //                                 "name": unselected,
        //                                 "value": length - allValue[2]
        //                             }
        //                         ]
        //                     },
        //                     {
        //                         "name": unselected,
        //                         "value": length - allValue[1]
        //                     }
        //                 ]
        //             },
        //             {
        //                 "name": unselected,
        //                 "value": length - allValue[0]
        //             }
        //         ]
        //     }
        // }
        // if (allSource.length == 6) {
        //     data = {
        //         "name": allSource[0],
        //         "children": [
        //             {
        //                 "name": allTarget[0],
        //                 "children": [
        //                     {
        //                         "name": allTarget[1],
        //                         "children": [
        //                             {
        //                                 "name": allTarget[2],
        //                                 "children": [
        //                                     {
        //                                         "name": allTarget[3],
        //                                         "children": [
        //                                             {
        //                                                 "name": allTarget[4],
        //                                                 "children": [
        //                                                     {
        //                                                         "name": allTarget[5],
        //                                                         "value": allValue[0]
        //                                                     },
        //                                                     {
        //                                                         "name": unselected,
        //                                                         "value": length - allValue[5]
        //                                                     }
        //                                                 ]
        //                                             },
        //                                             {
        //                                                 "name": unselected,
        //                                                 "value": length - allValue[4]
        //                                             }
        //                                         ]
        //                                     },
        //                                     {
        //                                         "name": unselected,
        //                                         "value": length - allValue[3]
        //                                     }
        //                                 ]
        //                             },
        //                             {
        //                                 "name": unselected,
        //                                 "value": length - allValue[2]
        //                             }
        //                         ]
        //                     },
        //                     {
        //                         "name": unselected,
        //                         "value": length - allValue[1]
        //                     }
        //                 ]
        //             },
        //             {
        //                 "name": unselected,
        //                 "value": length - allValue[0]
        //             }
        //         ]
        //     }
        // }
        function buildChildren(source, target, value, length, depth) {
            if (depth === source.length) {
                return {
                    "name": unselected,
                    "value": length - value[depth - 1]
                }
            }

            return {
                "name": target[depth - 1],
                "children": [
                    {
                        "name": target[depth],
                        "value": source.length - 1 ? value[depth] : undefined,
                        "child": buildChildren(source, target, value, length, depth + 1),
                    },
                    buildChildren(source, target, value, length, depth + 1)
                ]
            }
        }

        if (allSource.length) {
            data = {
                "name": allSource[0],
                "children": buildChildren(allSource, allTarget, allValue, length, 1)
            };
        }

        const dom = document.getElementById('sankey')
        const margin = { top: 15, right: 10, bottom: 10, left: 10 }
        const width = dom.offsetWidth - margin.left - margin.right
        const height = dom.offsetHeight - margin.top - margin.bottom

        const svg = d3.select(dom)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.bottom + margin.top)

        const root = d3.hierarchy(data)

        // 创建布局
        const treeLayout = d3.tree().size([width - margin.left - margin.right, height - margin.top - margin.bottom]) // 交换宽度和高度

        // 对数据进行布局
        const treeData = treeLayout(root)

        // 创建分组元素
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`)

        // 创建连线
        g.selectAll('.link')
            .data(treeData.links())
            .enter()
            .append('path')
            .attr('class', 'link')
            .attr('fill', 'none')
            .attr('stroke', '#ccc')
            .attr('stroke-width', d => {
                if (d.target.data.value > 1000) {
                    return d.target.data.value ? d.target.data.value / 1000 + 5 : 5
                } else if (d.target.data.value > 100) {
                    return d.target.data.value ? d.target.data.value / 100 + 5 : 5
                } else if (d.target.data.value > 50) {
                    return d.target.data.value ? d.target.data.value / 50 + 5 : 5
                } else {
                    return d.target.data.value ? d.target.data.value / 10 + 5 : 5
                }
            })
            .attr('d', d3.linkVertical()
                .x(d => d.x)
                .y(d => d.y))

        const node = g.selectAll('.node')
            .data(treeData.descendants())
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${d.x},${d.y})`)

        node.append('circle')
            .attr('r', d => {
                if (d.data.value > 1000) {
                    return d.data.value ? d.data.value / 1000 + 5 : 5
                } else if (d.data.value > 100) {
                    return d.data.value ? d.data.value / 100 + 5 : 5
                } else if (d.data.value > 50) {
                    return d.data.value ? d.data.value / 50 + 5 : 5
                } else {
                    return d.data.value ? d.data.value / 10 + 5 : 5
                }
            })

        // 创建文本标签
        node.append('text')
            .attr('dy', '.35em')
            .attr('x', d => d.children ? 0 : 8)
            .attr('transform', d => {
                if (d.children) {
                    return d.children[0].x > d.children[1].x ? 'translate(-8,0)' : 'translate(8,0)'
                } else {
                    return d.x > d.parent.x ? 'translate(8,2)' : 'translate(-8,2)'
                }
            })
            .attr('y', d => d.children ? -10 : d.data.name.length > 4 ? -15 : 15)
            .style('text-anchor', 'middle')
            .style('font-size', 12)
            .text(d => {
                if (d.parent) {
                    if (d.parent.data.name.length > 4 && d.data.name.length > 4) {
                        return d.data.name.substring(0, 4) + "..."
                    }
                    if (d.parent.data.name.length > 4 && d.data.name.length <= 4) {
                        return d.data.name
                    }
                    if (d.parent.data.name.length <= 4 && d.data.name.length > 4) {
                        return d.data.name.substring(0, 4) + "..."
                    }
                    if (d.parent.data.name.length <= 4 && d.data.name.length <= 4) {
                        return d.data.name
                    }
                } else {
                    return d.data.name
                }
            })

    })
}

onMounted(() => {
    try {
        sankey()
    } catch (error) {
        console.log(error)
    }
})

onUnmounted(() => {
    bus.off("brushend", handleBrushEnd);
});

</script>

<style scoped>
#sankey {
    width: 100%;
    height: 100%;
}
</style>
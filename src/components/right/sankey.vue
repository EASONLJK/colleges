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

// //监听store中的数据变化，重新渲染
// let sankey = store.$subscribe(( mutation, store ) => {

//     if (mutation.type == 'brushend'){
//         console.log(store.school_parallel_filter);
//     }

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
            if (item == 111) return "公办"
            if (item == 112) return "民办"
            if (item == 113) return "中外合作办学"
            if (item == 114) return "内地与港澳台合作办学"
        }).join(",")
        let value = parallel_data[2]

        // 将数据存入数组，source，target，value的值一一对应
        allSource.push(source)
        allTarget.push(target)
        allValue.push(value)

        //当数组长度超过3时，将后面的数据与前面的数据对比，如果source相同，则将target和value变为新的值
        if (allSource.length > 3) {
            for (let i = 0; i < allSource.length - 1; i++) {
                if (allSource[i] == allSource[allSource.length - 1]) {
                    allTarget[i] = allTarget[allSource.length - 1]
                    allValue[i] = allValue[allSource.length - 1]
                    allSource.pop()
                    allTarget.pop()
                    allValue.pop()
                }
            }
        }else{
            //长度不超过三时，对比三次，如果source相同，则将target和value变为新的值
            for (let i = 0; i < allSource.length - 1; i++) {
                if (allSource[i] == allSource[allSource.length - 1]) {
                    allTarget[i] = allTarget[allSource.length - 1]
                    allValue[i] = allValue[allSource.length - 1]
                    allSource.pop()
                    allTarget.pop()
                    allValue.pop()
                }
            }
        }
    
        let data
        for (let i=0 ; i<allSource.length ; i++){
            if (allSource.length == 1) {
                data = {
                    nodes: [
                        { name: allSource[0] },
                        { name: allTarget[0] },
                        { name: 'unselected1' },
                    ],
                    links: [
                        { source: allSource[0], target: allTarget[0], value: allValue[0] },
                        { source: allSource[0], target: 'unselected1', value: 2827 - allValue[0] },
                    ]
                }
            }
            if (allSource.length == 2) {
                data = {
                    nodes: [
                        { name: allSource[0] },
                        { name: allSource[1] },
                        { name: allTarget[1] },
                        { name: 'unselected1' },
                        { name: 'unselected2' },
                    ],
                    links: [
                        { source: allSource[0], target: allSource[1], value: allValue[0] },
                        { source: allSource[0], target: 'unselected1', value: 2827 - allValue[0]},
                        { source: allSource[1], target: allTarget[1], value: allValue[1]},
                        { source: allSource[1], target: 'unselected2', value: 2827 - allValue[1] },
                    ]
                }
            }

            if (allSource.length > 2) {
                data = {
                    nodes: [
                        { name: allSource[0] },
                        { name: allSource[1] },
                        { name: allSource[2] },
                        { name: allTarget[2] },
                        { name: 'unselected1' },
                        { name: 'unselected2' },
                        { name: 'unselected3' },
                    ],
                    links: [
                        { source: allSource[0], target: allSource[1], value: allValue[0] },
                        { source: allSource[0], target: 'unselected1', value: 2827 - allValue[0]},
                        { source: allSource[1], target: allSource[2], value: allValue[1]},
                        { source: allSource[1], target: 'unselected2', value: 2827 - allValue[1] },
                        { source: allSource[2], target: allTarget[2], value: allValue[2]},
                        { source: allSource[2], target: 'unselected3', value: 2827 - allValue[2] }
                    ]
                }
            }

        }

        // console.log(store.school_parallel_filter);
        const dom = document.getElementById('sankey')
        const margin = { top: 10, right: 10, bottom: 10, left: 10 }
        const width = dom.offsetWidth - margin.left - margin.right
        const height = dom.offsetHeight - margin.top - margin.bottom

        const svg = d3.select(dom)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.bottom + margin.top)

        const chart = svg.append('g')

        const colorScale = d3.scaleOrdinal(d3.schemeCategory10)

        const sankey = d3Sankey.sankey()
            .nodeId((d) => d.name)
            .nodeWidth(5)
            .nodePadding(15)
            .extent([
                [margin.left, margin.top],
                [width - margin.right, height - margin.bottom]
            ])

        const { nodes, links } = sankey({
            nodes: data.nodes,
            links: data.links
        })

        //以气泡图的形式绘制节点
        chart
            .append('g')
            .selectAll('circle')
            .data(nodes)
            .join('g')
            .attr('class', 'node')
            .append('circle')
            .attr('fill', (d, i) => colorScale(d.name))
            //设置圆的x坐标和y坐标，使其相对位置不超出桑基图的范围
            .attr('cx', (d) => (d.x0 + d.x1) / 2 + 5)
            .attr('cy', (d) => (d.y0 + d.y1) / 2)
            //设置圆的半径，使其面积不超出桑基图的面积
            .attr('r', d => Math.sqrt((d.x1 - d.x0) * (d.y1 - d.y0) / Math.PI))
            .append('title')
            .text((d) => `${d.name}`)

        chart
            .append('g')
            .attr('fill', 'none')
            .selectAll('g')
            .data(links)
            .join('path')
            .attr('d', d => {
                //自定义target 和 source
                let target = d.target
                let source = d.source
                let x0 = source.x1
                let x1 = target.x0
                let y0 = source.y0 + (source.y1 - source.y0) / 2
                let y1 = target.y0 + (target.y1 - target.y0) / 2
                return `M${x0},${y0}C${x0},${y1} ${x1},${y1} ${x1},${y1}`
            })
            .attr('stroke', (d, i) => colorScale(d.source.name))
            .attr('stroke-opacity', 0.2)
            .attr('stroke-width', (d) => {
                //根据circle的半径设置线条的宽度
                let source = d.source
                let target = d.target
                let r = Math.sqrt((target.x1 - target.x0) * (target.y1 - target.y0) / Math.PI)
                return r * 2
            })
            .style('mix-blend-mode', 'multiply')

        chart
            .append('g')
            .style('font', '10px sans-serif')
            .selectAll('text')
            .data(nodes)
            .join('text')
            .attr('x', d => d.x0 < width / 2 ? d.x1 + 15 : d.x0 - 10)
            .attr('y', d => {
                let y = (d.y0 + d.y1) / 2
                if (y < 0) {
                    y = 0
                }
                if (y > height) {
                    y = height
                }
                return y
            })
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .text(d => {
                //节点文字超出桑基图的范围时，省略
                let name = d.name
                if (name.length > 10) {
                    name = name.slice(0, 10) + '...'
                }
                return name
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

</script>

<style scoped>
#sankey {
    width: 100%;
    height: 100%;
}
</style>
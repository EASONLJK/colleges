<template>
    <div id='stream'>

    </div>
</template>

<script setup>
import { onMounted, inject, onBeforeUnmount } from 'vue';
import * as d3 from 'd3'
// import { useStore } from '../../store/index.js'

let bus = inject('bus')
// let store = useStore()
// var data = store.province[0]
function streamGragh() {
    bus.on('province', data => {
        // console.log(data[0]);
        d3.selectAll('#stream svg').remove()
        const keys = ['GDP(亿元)', 'cost(元)', 'employment(万人)', 'income(元)', 'population(万人)']
        const dom = document.getElementById('stream')
        const margin = { top: 30, right: 30, bottom: 30, left: 50 }
        const width = dom.clientWidth - margin.left - margin.right
        const height = dom.clientHeight - margin.top - margin.bottom

        const stackData = d3.stack()
            .order(d3.stackOrderInsideOut)
            .offset(d3.stackOffsetSilhouette)
            .keys(keys)(data[0])

        const x = d3.scaleLinear()
            .domain(d3.extent(data[0], d => d.year))
            .range([0, width])

        const y = d3.scaleLinear()
            .domain(d3.extent(stackData.flat(2)))
            .range([height, 0])

        const svg = d3.select(dom)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.bottom + margin.top)
            .append('g')
            .attr("transform", `translate(${margin.left}, ${margin.top})`)

        svg.append('g')
            .call(d3.axisBottom(x).ticks(10))
            .attr("transform", `translate(0, ${height})`)

        svg.append('g')
            .call(d3.axisLeft(y))

        const color = d3.scaleOrdinal()
            .domain(keys)
            .range(d3.schemeCategory10)

        const area = d3.area()
            .x(d => x(d.data.year))
            .y0(d => y(d[0]))
            .y1(d => y(d[1]))

        svg.selectAll('mylayers')
            .data(stackData)
            .join('path')
            .attr("fill", d => color(d.key))
            //设置属性使path变得平滑
            .attr('curve', 'smooth')
            .attr('storke-opacity', 0.5)
            .attr("d", area)
            .on('mouseover', function (event, d) {
                d3.selectAll('path').style('opacity', 0.2)
                d3.select(this).style('opacity', 1).append('title').text(d.key)
            })
            .on('mouseout', function (event, d) {
                d3.selectAll('path').style('opacity', 1)
            })

        const legend = svg.append('g')
            .attr('transform', (d, i) => `translate(${i * 100 - 40}, -20)`)
            .selectAll('g')
            .data(keys)
            .join('g')
            .attr('transform', (d, i) => `translate(${i * 40}, 0)`);

        legend.append('rect')
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', color)

        //添加文字缩写，分别代表GDP、cost、employment、income、population
        const text = ['GDP', 'COST', 'EMP', 'IN', 'POPU']
        legend.append('text')
            .attr('x', 10)
            .attr('y', 10)
            .attr('font-size', 10)
            .text((d, i) => text[i])
    })
}

onMounted(() => {
    try {
        streamGragh()
    } catch (error) {
        console.log(error)
    }
})

</script>

<style scope>
#stream {
    width: 100%;
    height: 100%;
}
</style>
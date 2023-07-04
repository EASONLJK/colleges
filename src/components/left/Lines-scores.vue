<template>
    <div id="lineChart">

    </div>
</template>

<script setup>
import { onMounted, ref, reactive, inject, toRaw } from 'vue';
import * as d3 from 'd3'

let bus = inject('bus')
let college_data = []
let attributes = []
const lineChart = () => {
    bus.on('collgesInfo', data => {
        d3.select("#lineChart").select("svg").remove();
        college_data = toRaw(data)
        attributes = toRaw(college_data[0].attributes)
        console.log(attributes);
        const dom = document.getElementById('lineChart')
        const margin = { top: 20, right: 20, bottom: 30, left: 30 }
        const width = dom.offsetWidth - margin.left - margin.right
        const height = dom.offsetHeight - margin.top - margin.bottom
        
        const svg = d3.select(dom)
            .append('svg')
            .attr("viewBox", [0, 0, width, height])

        const x = d3.scaleLinear()
            .domain(d3.extent(attributes, d => d.year))
            .range([margin.left, width - margin.right])

        const y = d3.scaleLinear()
            .domain(d3.extent(attributes, d => d.score))
            .range([height - margin.bottom, margin.top])

        const xAxis = g => g
            .attr("transform", `translate(0, ${height - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))

        const yAxis = g => g
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(y).ticks(height / 40))

        svg.append("g")
            .call(xAxis);

        svg.append("g")
            .call(yAxis);

        const line = d3.line()
            .x(d => x(d.year))
            .y(d => y(d.score))

        //绘制折线
        svg.append("path")
            .datum(attributes)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", line)

    })
}

onMounted(() => {
    lineChart()
})
</script>

<style scoped>
#lineChart {
    width: 100%;
    height: 100%
}
</style>
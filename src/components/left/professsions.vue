<template>
    <div id="profession">

    </div>
</template>

<script setup>
import * as d3 from 'd3'
import axios from 'axios'
import { onMounted, ref, reactive, onUpdated, onUnmounted, inject, toRaw } from 'vue';

let data
function BubbleChart(data, {
    name = ([x]) => x, // alias for label
    label = level, // given d in data, returns text to display on the bubble
    value = ([, y]) => y, // given d in data, returns a quantitative size
    group, // given d in data, returns a categorical value for color
    title, // given d in data, returns text to show on hover
    link, // given a node d, its link (if any)
    linkTarget = "_blank", // the target attribute for links, if any
    groups, // array of group names (the domain of the color scale)
    colors = d3.schemeTableau10, // an array of colors (for groups)
    fill = "#ccc", // a static fill color, if no group channel is specified
    fillOpacity = 0.7, // the fill opacity of the bubbles
    stroke, // a static stroke around the bubbles
    strokeWidth, // the stroke width around the bubbles, if any
    strokeOpacity, // the stroke opacity around the bubbles, if any
} = {}) {
    let url = 'http://127.0.0.1:5000/'
    axios.get(url + 'major_datas').then(res => {
        // for (let i=0; i<res.data.length; i++) {
        //     major_datas.push(res.data[i])
        // }
        data = res.data
        // 过滤data，保留level和value两个字段
        var datas = data.map(function (d) {
            return { level: d.level, value: d.value }
        })
        
        const D = d3.map(data, d => d);
        const V = d3.map(data, value);
        V.sort((a, b) => a - b);
        const G = group == null ? null : d3.map(data, group);
        const I = d3.range(V.length).filter(i => V[i] > 0);
        
        // Unique the groups.
        if (G && groups === undefined) groups = I.map(i => G[i]);
        groups = G && new d3.InternSet(groups);

        // Construct scales.
        const color = G && d3.scaleOrdinal(groups, colors);

        // Compute labels and titles.
        const L = label == null ? null : d3.map(data, label);
        const T = title === undefined ? L : title == null ? null : d3.map(data, title);

        const dom = document.getElementById('profession')
        const margin = { top: 20, right: 20, bottom: 20, left: 20 }
        const width = dom.offsetWidth - margin.left - margin.right
        const height = dom.offsetHeight - margin.top - margin.bottom

        // Compute layout: create a 1-deep hierarchy, and pack it.
        const root = d3.pack()
            .size([width + margin.left + margin.right, height + margin.bottom + margin.top])
            .padding(3)
            (d3.hierarchy({ children: I })
                .sum(i => V[i]))
                .sort((a, b) => b.value - a.value);

        const svg = d3.select(dom)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.bottom + margin.top)
            .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
            .attr("fill", "currentColor")
            .attr("font-size", 10)
            .attr("font-family", "sans-serif")
            .attr("text-anchor", "middle");

        const leaf = svg.selectAll("a")
            .data(root.descendants().slice(1))
            .join("a")
            .attr("xlink:href", link == null ? null : (d, i) => link(D[d.data], i, data))
            .attr("target", link == null ? null : linkTarget)
            .attr("transform", d => `translate(${d.x},${d.y})`);

        leaf.append("circle")
            .attr("stroke", stroke)
            .attr("stroke-width", strokeWidth)
            .attr("stroke-opacity", strokeOpacity)
            .attr("fill", G ? d => color(G[d.data]) : fill == null ? "none" : fill)
            .attr("fill-opacity", fillOpacity)
            .attr("r", d => d.r);

        if (T) leaf.append("title")
            .text(d => T[d.data]);

        if (L) {
            // A unique identifier for clip paths (to avoid conflicts).
            const uid = `O-${Math.random().toString(16).slice(2)}`;

            leaf.append("clipPath")
                .attr("id", d => `${uid}-clip-${d.data}`)
                .append("circle")
                .attr("r", d => d.r);

            leaf.append("text")
                .attr("clip-path", d => `url(${new URL(`#${uid}-clip-${d.data}`, location)})`)
                .selectAll("tspan")
                .data(d => `${L[d.data]}`.split(/\n/g))
                .join("tspan")
                .attr("x", 0)
                .attr("y", (d, i, D) => `${i - D.length / 2 + 0.85}em`)
                .attr("fill-opacity", (d, i, D) => i === D.length - 1 ? 0.7 : null)
                .text(d => d);
        }

        return Object.assign(svg.node(), { scales: { color } });
    })

}

onMounted(() => {
    BubbleChart(data, {
        label: d => [...d.level],
        value: d => d.value,
        group: d => d.level,
        title: d => `${d.level}\n${d.value.toLocaleString("en")}`
    })
})
</script>

<style scoped>  #profession {
      width: 100%;
      height: 100%;
  }
</style>
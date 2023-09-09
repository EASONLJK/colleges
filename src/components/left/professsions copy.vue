<template>
    <div id="profession">

    </div>
</template>

<script setup>
import * as d3 from 'd3'
import axios from 'axios'
import { onMounted, ref, reactive, onUpdated, onUnmounted, inject, toRaw } from 'vue';

let obj = reactive({
    data: [],
    collges_name: [],
    filter_data: [],
    attributes: [],
    color: []
})

function _chart() {
    const data = obj.data
    const dom = document.getElementById('profession')
    const margins = { top: 20, right: 20, bottom: 20, left: 20 }
    const width = dom.clientWidth - margins.left - margins.right;
    const height = dom.clientHeight - margins.top - margins.bottom;
    const margin = 1; // to avoid clipping the root circle stroke

    // Specify the number format for values.
    const format = d3.format(",d");

    // Create the pack layout.
    const pack = d3.pack()
        .size([width - margin * 2, height - margin * 2])
        .padding(5);

    // Compute the hierarchy from the JSON data; recursively sum the
    // values for each node; sort the tree by descending value; lastly
    // apply the pack layout.
    const root = pack(d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value));

    //清空svg
    d3.select(dom).selectAll('*').remove()

    // Create the SVG container.
    const svg = d3.select(dom)
        .append("svg")
        .attr("width", width + margins.left + margins.right)
        .attr("height", height + margins.top + margins.bottom)
        .attr("viewBox", [-margin, -margin, width, height])
        .attr("style", "width: 100%; height: auto; font: 10px sans-serif;")
        .attr("text-anchor", "middle");

    // Place each node according to the layout’s x and y values.
    const node = svg.append("g")
        .selectAll()
        .data(root.descendants())
        .join("g")
        .attr("transform", d => `translate(${d.x},${d.y})`);

    // Add a title.
    node.append("title")
        .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

    // Add a filled or stroked circle.
    node.append("circle")
        .attr("fill", d => d.children ? "#fff" : "#ddd")
        .attr("stroke", d => d.children ? "#bbb" : null)
        .attr("r", function (d) {
            //对数据过滤，只显示第一层的数据，再根据点击事件过滤出当前节点的子节点
            if (d.depth == 1) {
                return d.r
            }
        });

    const text = node
        .filter(d => d.depth === 1)
        .append("text")
        .attr("clip-path", d => `circle(${d.r})`);

    text.selectAll()
        .data(d => d.data.name.split(/(?=[A-Z][a-z])|\s+/g))
        .join("tspan")
        .attr("text-anchor", "middle")
        .attr("x", 0)
        .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.8}em`)
        .text(d => d)
        .style("font-size", function(d) {
        // 根据圆的半径来计算tspan的大小，tspan的大小不能超过圆的长
        let r = d3.select(this.parentNode).datum().r*1.5
        let len = d.length
        let size = r / len
        return `${size}px`

    });

    // 添加交互，点击当前circle，过滤出当前节点数据
    node.on('click', function () {
        let filter_data = this.__data__.data
        let new_data = filter_data.children
        //保存当前节点数据的上一个节点数据
        obj.filter_data.push(obj.data)
        if (new_data) {
            obj.data = filter_data
            _chart()
        }
    })

    // 提供返回上一级功能
    let back = svg.append('g')
        .attr('transform', `translate(${width - 100},${height - margins.bottom})`)
        .append('text')
        .text('返回上一级')
        .attr('fill', 'blue')
        .attr('cursor', 'pointer')
        .on('click', function () {
            if (obj.filter_data.length == 1) {
                obj.data = obj.filter_data[obj.filter_data.length - 1]
                console.log(obj.data);
                _chart()
            }
            else if (obj.filter_data.length > 1) {
                obj.data = obj.filter_data.pop()
                console.log(obj.data);
                _chart()
            }
        })
    
    //为最里面circle添加颜色
    node.filter(d => !d.children)
        .attr('fill', function (d) {
            let color = d3.scaleOrdinal(d3.schemeCategory10)
            return color(d.parent.data.name)
        })
}

onMounted(() => {
    let url = 'http://127.0.0.1:5000/'
    axios.get(url + 'major_datas').then(res => {
        obj.data = res.data
        _chart()
    })
})
</script>

<style scoped>  #profession {
      width: 100%;
      height: 100%;
  }
</style>
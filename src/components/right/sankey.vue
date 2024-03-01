<template>
    <div id='sankey'>

    </div>
</template>

<script setup>
import { onMounted, onUnmounted, inject } from 'vue';
import * as d3 from 'd3'
import { useStore } from '../../store/index.js'

const store = useStore()

let bus = inject('bus')
let allSource = []
let allTarget = []
let allValue = []
let rootNodes = []
let data
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
    let unselected = "未选中"
    let mark = parallel_data[5]
    if (mark == 1) {
        allSource.push(source)
        allTarget.push(target)
        allValue.push(value)
    }
    if (mark == 0) {
        // 只有当allSource不为空时，才进行遍历删除操作
        if (allSource.length > 0) {
            // 从后向前遍历数组来安全删除元素
            for (let i = allSource.length - 1; i >= 0; i--) {
                if (allSource[i] === source) {
                    allSource.splice(i, 1);
                    allTarget.splice(i, 1);
                    allValue.splice(i, 1);
                }
            }
        }
    }
    function buildHierarchicalData(sources, targets, values, length) {
        if (sources.length === 0) {
            return; // 当没有源数据时，立即返回
        } else if (sources.length === 1) {
            // 递归的终止条件，只剩下一个元素时返回
            return [
                {
                    name: targets[0],
                    value: values[0]
                },
                {
                    name: "unselected",
                    value: length - values[0]
                }
            ];
        } else {
            // 继续递归构建层级数据
            const remainingSources = sources.slice(1);
            const remainingTargets = targets.slice(1);
            const remainingValues = values.slice(1);
            return [
                {
                    name: remainingSources[0],
                    name_origin: targets[0],
                    value_origin: values[0],
                    children: buildHierarchicalData(remainingSources, remainingTargets, remainingValues, length - values[0])
                },
                {
                    name: "unselected",
                    value: length - values[0]
                }
            ];
        }
    }

    data = buildHierarchicalData(allSource, allTarget, allValue, length);
    data = { name: allSource[0], children: data };
    console.log(data);
    sankey(data);
})
function sankey(data) {
    const dom = document.getElementById('sankey')
    if (dom) {
        d3.select(dom).selectAll('svg').remove();
        const margin = { top: 15, right: 10, bottom: 10, left: 10 };
        const width = dom.offsetWidth - margin.left - margin.right;
        const height = dom.offsetHeight - margin.top - margin.bottom;

        if (data && data.children && data.children.length > 0) {
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
            const links = g.selectAll('.link')
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
                    } else if (d.data.value > 0) {
                        return d.data.value ? d.data.value / 10 + 5 : 5
                    } else {
                        return 5
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

            const dragHandler = d3.drag()
                .on("start", dragStart)
                .on("drag", dragHandle)
                .on("end", dragEnd);
            node.filter(function (d) {
                // 给叶子节点绑定拖拽
                if (d.children) {
                    d3.select(this).call(dragHandler);
                    rootNodes.push(d)
                }
            });

            function dragStart(event) {
                // 开始拖拽时的操作
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }

            function dragHandle(event, d) {
                // 拖动时更新节点的位置
                // d.x = event.x;
                d.y = event.y;
                d3.select(this)
                    .attr("transform", `translate(${d.x},${d.y})`);

                // 更新连线
                updateLinks();
            }

            function dragEnd(event, d) {
                let nearbyRoot = rootNodes.find(rootNode => Math.abs(rootNode.y - event.y) <= 20); // 检查是否有根节点在20个单位的范围内
                if (nearbyRoot && nearbyRoot !== d) { // 确保不是当前节点本身
                    console.log(d.data.name, nearbyRoot.data.name);
                    swapNodes(data, d.data.name, nearbyRoot.data.name)
                    sankey(data);
                }
                d3.select(this).classed("dragging", false); // 结束拖拽，移除dragging类
            }

            // 定义一个函数来更新连线
            function updateLinks() {
                // 使用新的位置更新连线
                links.attr('d', d3.linkVertical()
                    .x(d => d.x)
                    .y(d => d.y));
            }

            function swapNodes(data, nodeName1, nodeName2) {
                // Helper function to find and return node reference and its parent
                function findNode(node, name, parent) {
                    if (node.name === name) {
                        return { node, parent };
                    }
                    if (Array.isArray(node.children)) {
                        for (let child of node.children) {
                            let result = findNode(child, name, node);
                            if (result) return result;
                        }
                    }
                    return null;
                }

                // Find nodes
                let node1 = findNode(data, nodeName1, null);
                let node2 = findNode(data, nodeName2, null);

                // Check if both nodes were found
                if (!node1) {
                    console.error(`Node not found: ${nodeName1}`);
                    return;
                }
                if (!node2) {
                    console.error(`Node not found: ${nodeName2}`);
                    return;
                }

                // Swap node names and values if both nodes have 'value' attribute
                [node1.node.name, node2.node.name] = [node2.node.name, node1.node.name];
                console.log(node1.node.children[0].value);
                if ('value' in node1.node.children[1] && 'value' in node2.node.children[1]) {
                    [node1.node.children[1].value, node2.node.children[1].value] = [node2.node.children[1].value, node1.node.children[1].value];
                } else {
                    console.error('Both nodes must have a value for the swapping to work');
                }
                if ('value' in node1.node.children[0] && 'value_origin' in node2.node.children[0]) {
                    [node1.node.children[0].value, node2.node.children[0].value_origin] = [node2.node.children[0].value_origin, node1.node.children[0].value];
                    [node1.node.children[0].name, node2.node.children[0].name_origin] = [node2.node.children[0].name_origin, node1.node.children[0].name];
                    console.log(1, [node1.node.children[0].name, node2.node.children[0].name_origin]);
                }
                if ('value_origin' in node1.node.children[0] && 'value' in node2.node.children[0]) {
                    [node1.node.children[0].value_origin, node2.node.children[0].value] = [node2.node.children[0].value, node1.node.children[0].value_origin];
                    [node1.node.children[0].name_origin, node2.node.children[0].name] = [node2.node.children[0].name, node1.node.children[0].name_origin];
                    console.log(2);
                }
                if ('value_origin' in node1.node.children[0] && 'value_origin' in node2.node.children[0]) {
                    [node1.node.children[0].value_origin, node2.node.children[0].value_origin] = [node2.node.children[0].value_origin, node1.node.children[0].value_origin];
                    [node1.node.children[0].name_origin, node2.node.children[0].name_origin] = [node2.node.children[0].name_origin, node1.node.children[0].name_origin];
                    console.log(3);
                }
            }

        } else {
            d3.select(dom).selectAll('svg').remove();
        }
    }

}

onMounted(() => {
    try {
        sankey(data)
    } catch (error) {
        console.log(error)
    }
})

onUnmounted(() => {
    bus.off("brushend");
});

</script>

<style scoped>
#sankey {
    width: 100%;
    height: 100%;
}
</style>
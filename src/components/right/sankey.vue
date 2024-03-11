<template>
    <div id='sankey'>
        <div v-for="popup in Popups" :key="popup.id" class="popup"
            :style="{ left: popup.x + 'px', top: popup.y + 'px' }">
            <!-- 弹窗内容 -->
            <CustomWeight :nodeName="popup.nodeName" :nodeChildren="popup.nodeChildren" />
        </div>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, inject, ref, nextTick } from 'vue';
import * as d3 from 'd3'
import CustomWeight from '../dialog/custom_weights.vue';
import { useStore } from '../../store/index.js'

const store = useStore()

let bus = inject('bus')
const d3Container = ref(null);
let showCustomWeight = ref(false);
let selectedNodeName = ref('');
let selectedNodeChildren = ref([]);
let Popups = ref([]);
let checkPopups = ref([])
let allSource = []
let allTarget = []
let allValue = []
let allIndex = []
let rootNodes = []
let data1 = ref(null)
let datas = ref(null)
bus.on("brushend", parallel_data => {
    d3.select("#sankey").select("svg").remove();

    let source = parallel_data[0]
    const mapping = {
        "nature_name": "办学性质",
        "school_level": "办学层次",
        "type_name": "院校类型",
        "area_name": "地区",
        "eduFund": "经费",
        "view_total_number": "热度",
        "prob_name": "录取率",
        "score": "分数"
    };
    source = mapping[source] || source;

    const itemMap = {
        1: "985",
        2: "211",
        3: "双一流",
        4: "普通院校",
        5: "专科",
        11: "综合类",
        12: "理工类",
        13: "师范类",
        14: "农林类",
        15: "政法类",
        16: "艺术类",
        17: "财经类",
        18: "民族类",
        19: "医药类",
        20: "其他",
        21: "军事类",
        22: "体育类",
        23: "语言类",
        31: "大热门",
        32: "热门",
        33: "中等热门",
        34: "偏冷门",
        35: "冷门",
        41: "东北地区",
        42: "华北地区",
        43: "西北地区",
        44: "华中地区",
        45: "华东地区",
        46: "西南地区",
        47: "华南地区",
        51: "高经费",
        52: "中高经费",
        53: "中等经费",
        54: "中低经费",
        55: "低经费",
        61: "稳",
        62: "保",
        63: "冲",
        64: "不招生",
        111: "公办",
        112: "民办",
        113: "中外合作办学",
        114: "内地与港澳台合作办学"
    };
    let target = parallel_data[1].map(item => itemMap[item] || item).join(",");
    let indexs = parallel_data[6].map(item => itemMap[item] || item).filter(item => typeof item !== 'number');

    let value = parallel_data[2]
    let length = parallel_data[4]
    let unselected = "未选中"
    let mark = parallel_data[5]
    if (mark == 1) {
        let index = allSource.indexOf(source);
        if (index !== -1) {
            // 有重复数据，更新已存在的条目
            allTarget[index] = target;
            allIndex[index] = indexs;
            allValue[index] = value;
        } else {
            // 否则，添加新的数据
            allSource.push(source);
            allTarget.push(target);
            allIndex.push(indexs);
            allValue.push(value);
        }
    }
    if (mark == 0) {
        // 只有当allSource不为空时，才进行遍历删除操作
        if (allSource.length > 0) {
            // 从后向前遍历数组来安全删除元素
            for (let i = allSource.length - 1; i >= 0; i--) {
                if (allSource[i] === source) {
                    allSource.splice(i, 1);
                    allTarget.splice(i, 1);
                    allIndex.splice(i, 1);
                    allValue.splice(i, 1);

                }
            }
            // console.log(source);
            // console.log(Popups);
            if (Popups.value) {
                for (let i = Popups.value.length - 1; i >= 0; i--) {
                    if (Popups.value[i].id === source) {
                        Popups.value.splice(i, 1);
                    }
                }
            }
        }

    }
    function buildHierarchicalData(sources, targets, indexs, values, length) {
        if (sources.length === 0) {
            return; // 当没有源数据时，立即返回
        } else if (sources.length === 1) {
            // 递归的终止条件，只剩下一个元素时返回
            return [
                {
                    name: targets[0],
                    names: indexs[0],
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
            const remainingIndexs = indexs.slice(1);
            const remainingValues = values.slice(1);
            return [
                {
                    name: remainingSources[0],
                    name_origin: targets[0],
                    names_origin: indexs[0],
                    value_origin: values[0],
                    children: buildHierarchicalData(remainingSources, remainingTargets, remainingIndexs, remainingValues, length - values[0])
                },
                {
                    name: "unselected",
                    value: length - values[0]
                }
            ];
        }
    }

    data1 = buildHierarchicalData(allSource, allTarget, allIndex, allValue, length);
    datas = { name: allSource[0], children: data1 };
    // console.log('传入组件中的datas', datas);
    sankey(datas);
})
function sankey(data) {
    // d3绘制桑基图
    let unselected = "未选中"
    console.log(data);
    const dom = document.getElementById('sankey')
    if (dom && data && data.name !== undefined && data.children !== undefined) {
        d3.select(dom).selectAll('svg').remove();
        const margin = { top: 15, right: 10, bottom: 10, left: 10 };
        const width = dom.offsetWidth - margin.left - margin.right;
        const height = dom.offsetHeight - margin.top - margin.bottom;

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
        let rootNodes = []
        node.filter(function (d) {
            // 给叶子节点绑定拖拽
            if (d.children) {
                d3.select(this)
                    .on("click", async (event, d) => {
                        showCustomWeight.value = !showCustomWeight.value;
                        selectedNodeName.value = d.data.name;
                        let subset = (d.children[0].data.name_origin || d.children[0].data.name).split(","); // 将子集字符串分割成数组
                        let allNames = (d.children[0].data.names_origin || d.children[0].data.names); // 所有名字的数组
                        let nodeId = d.data.id ? d.data.id : d.data.name; // 使用name作为备选id
                        console.log(d);
                        console.log(subset, allNames);
                        // 创建对象数组，为subset中的元素添加颜色标记
                        let markedNames = allNames.map(name => {
                            return {
                                name: name,
                                color: subset.includes(name) ? "red" : "black" // 如果名字在子集中则标记红色，否则黑色
                            };
                        });

                        // 对标记后的元素进行排序，红色的在前面，黑色的在后面
                        markedNames.sort((a, b) => {
                            if (a.color === b.color) {
                                // 如果颜色相同，则按照名字排序
                                return a.name.localeCompare(b.name);
                            }
                            // 颜色不同，红色在前，黑色在后
                            return a.color === "red" ? -1 : 1;
                        });
                        // 查找弹窗数组中是否已存在当前节点的弹窗
                        const index = Popups.value.findIndex(popup => popup.id === nodeId);

                        if (index !== -1) {
                            // 如果找到了，说明弹窗已存在，移除它
                            Popups.value.splice(index, 1);
                        } else {
                            // 如果未找到，创建新的弹窗并添加
                            const newX = event.x - 40; // 这里加20是给出一个数值类型的结果
                            const newY = event.y + 10; // 假设你只想改变X坐标

                            const newPopup = {
                                id: nodeId,
                                x: newX, // newX 已经包含了额外的20像素
                                y: newY,
                                nodeName: d.data.name,
                                nodeChildren: markedNames, // 初始情况下，设置为markedNames的值
                            };

                            // 此处检查，如果checkPopups.value存在，则更新newPopup对象的nodeChildren属性
                            if (checkPopups.value) {
                                newPopup.nodeChildren = checkPopups.value; // 将nodeChildren更新为checkPopups.value的值
                            }

                            // 将更新后的newPopup对象推送到Popups.value数组中
                            Popups.value.push(newPopup);
                        }
                        console.log('初始的popups', Popups.value);
                        await nextTick(); // 等待Vue更新DOM
                    })
                    .call(dragHandler).classed('dragging')
                rootNodes.push(d);
            }
        });
        function checkPopups() {
            bus.on('drop', localNodeChildren => {
                checkPopups.value = localNodeChildren
            })
        }
        checkPopups()
        let startX, startY;
        function dragStart(event) {
            // 开始拖拽时的操作
            startX = event.x;
            startY = event.y;
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragHandle(event, d) {
            // 拖动时更新节点的位置
            d.y = event.y;
            d3.select(this)
                .attr("transform", `translate(${d.x},${d.y})`);
            // 更新连线
            updateLinks();
        }
        const dragThreshold = 3;
        function dragEnd(event, d) {
            const dx = event.x - startX;
            const dy = event.y - startY;
            if (Math.abs(dx) < dragThreshold && Math.abs(dy) < dragThreshold) {
                return;
            }

            let nearbyRoot = rootNodes.find(rootNode => rootNode !== d && Math.abs(rootNode.y - d.y) <= 20); // 检查是否有根节点在20个单位的范围内
            if (nearbyRoot && nearbyRoot.data.name !== d.data.name) { // 确保不是当前节点本身
                //   console.log(d.data.name, nearbyRoot.data.name);
                swapNodes(data, d.data.name, nearbyRoot.data.name)
            }
            if (Popups.value) {
                Popups.value = []
            }
            // 重置节点坐标
            d.fx = null;
            d.fy = null;
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
            // console.log(node1, node2);
            // Check if both nodes were found
            if (!node1) {
                console.error(`Node not found: ${nodeName1}`);
                return;
            }
            if (!node2) {
                console.error(`Node not found: ${nodeName2}`);
                return;
            }

            if ('value' in node1.node.children[1] && 'value' in node2.node.children[1]) {
                [node1.node.name, node2.node.name] = [node2.node.name, node1.node.name];
                [node1.node.children[1].value, node2.node.children[1].value] = [node2.node.children[1].value, node1.node.children[1].value];
            } else {
                console.error('Both nodes must have a value for the swapping to work');
            }
            if ('value' in node1.node.children[0] && 'value_origin' in node2.node.children[0]) {
                [node1.node.children[0].value, node2.node.children[0].value_origin] = [node2.node.children[0].value_origin, node1.node.children[0].value];
                [node1.node.children[0].name, node2.node.children[0].name_origin] = [node2.node.children[0].name_origin, node1.node.children[0].name];
                [node1.node.children[0].names, node2.node.children[0].names_origin] = [node2.node.children[0].names_origin, node1.node.children[0].names];
                //   console.log(1, [node1.node.children[0].name, node2.node.children[0].name_origin]);
            }
            if ('value_origin' in node1.node.children[0] && 'value' in node2.node.children[0]) {
                [node1.node.children[0].value_origin, node2.node.children[0].value] = [node2.node.children[0].value, node1.node.children[0].value_origin];
                [node1.node.children[0].name_origin, node2.node.children[0].name] = [node2.node.children[0].name, node1.node.children[0].name_origin];
                [node1.node.children[0].names_origin, node2.node.children[0].names] = [node2.node.children[0].names, node1.node.children[0].names_origin];
                //   console.log(2);
            }
            if ('value_origin' in node1.node.children[0] && 'value_origin' in node2.node.children[0]) {
                [node1.node.children[0].value_origin, node2.node.children[0].value_origin] = [node2.node.children[0].value_origin, node1.node.children[0].value_origin];
                [node1.node.children[0].name_origin, node2.node.children[0].name_origin] = [node2.node.children[0].name_origin, node1.node.children[0].name_origin];
                [node1.node.children[0].names_origin, node2.node.children[0].names_origin] = [node2.node.children[0].names_origin, node1.node.children[0].names_origin];
                //   console.log(3);
            }
            sankey(data);
        }
    }

}
// onUnmounted(() => {
//     bus.off("brushend");
// });

</script>

<style>
#sankey {
    width: 100%;
    height: 100%;
}

.popup {
    position: absolute;
    z-index: 999;
    /* 确保属性框在最顶层 */
    background-color: #fff;
    /* 设置属性框的背景颜色 */
    border: 1px solid #ccc;
    /* 设置属性框的边框 */
    padding: 2.5px;
    /* 设置属性框的内边距 */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    /* 设置属性框的阴影效果 */
    display: block;
}
</style>
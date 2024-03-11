<template>
  <el-scrollbar :height="scrollHeight" ref="scrollbar">
    <div class="draggable-container">
      <p v-for="(item, index) in localNodeChildren" :key="item.name" class="scrollbar-demo-item"
        :class="{ draggable: item.color === 'red' }" @click="collegesInfo" :draggable="item.color === 'red'"
        @dragstart="dragStart($event, item, index)" @dragover.prevent @drop="drop($event, item, index)">
        {{ item.name }}<span id="sp" :style="{ backgroundColor: item.color }"></span>
      </p>
    </div>
  </el-scrollbar>
</template>

<script setup>
import { ref, inject, reactive, watch, computed, defineProps, nextTick } from 'vue'

import { useStore } from '../../store/index.js'

let bus = inject('bus')
let scrollbarRef = ref()
let store = useStore()
let url = 'http://127.0.0.1:5000'
// 接收来自父组件的 prop
const props = defineProps({
  nodeChildren: Array
});
const itemHeight = 17; // 假设每个列表元素的高度是20px
const maxItemCount = 4; // 超过4个元素时开始滚动

const scrollHeight = computed(() => {
  const visibleItemCount = Math.min(maxItemCount, localNodeChildren.length);
  return `${visibleItemCount * itemHeight}px`;
});
// 我们直接用响应式数据来代替计算属性
let localNodeChildren = reactive([...props.nodeChildren]);
console.log(localNodeChildren);
let obj = reactive({
  data: [],
  list: [],
  collges_name: [],
  filter_data: [],
  attributes: [],
  color: [],
  draggedItem: null,
})

function getNodeRank(index) {
  // 假设 localNodeChildren 是已排序的，那么给第一个赋值为最大的排名，以下递减
  return localNodeChildren.length - index;
}
// 响应式变量存储颜色为红色的项
let redItems = computed(() => {
  return localNodeChildren
    .filter(item => item.color === 'red')  // 筛选出红色的项
    .map((item, index) => ({ ...item, value: getNodeRank(index) })); // 假设 value 即为每一项的值
});
console.log(redItems);
function dragStart(event, item, index) {
  // 只允许红色的item被拖动
  if (item.color === 'red') {
    console.log(`拖动项目: ${item.name}，排名：${getNodeRank(index)}`);
    obj.draggedItem = item;
  } else {
    event.preventDefault(); // 阻止其他颜色的项目被拖动
  }
}
function doSomethingWithRedItems() {
  const redItemsList = redItems.value;
  console.log('红色项的列表:', redItemsList);
}
async function drop(event, targetItem) {
  const draggedIndex = localNodeChildren.findIndex(
    (item) => item.name === obj.draggedItem.name
  )
  const targetIndex = localNodeChildren.findIndex(
    (item) => item.name === targetItem.name
  )
  console.log(draggedIndex, targetIndex);
  // 创建一个新的数组副本
  let newData = [...localNodeChildren];
  console.log(newData);
  // 删除拖拽项目
  let [removed] = newData.splice(draggedIndex, 1);

  // 在新的目标位置插入项目
  newData.splice(targetIndex, 0, removed);

  // 清空当前数组
  localNodeChildren.splice(0, localNodeChildren.length);
  // 将新数组的内容添加到现有响应式数组中
  localNodeChildren.push(...newData);
  // 等待 DOM 更新
  bus.emit('drop', localNodeChildren)
  await nextTick();
  // 清除拖拽项目记录
  obj.draggedItem = null;
  doSomethingWithRedItems()
  // console.log("props.nodeChildren", props.nodeChildren);
}
function dragOver(event) {
  // 依旧需要这个函数来处理元素接近边缘时的滚动行为
  autoScroll(event);
}
// watch(() => [store.update_weight_data, store.colleges_filter, obj.filter_data,store.school_parallel_index], ([newVal1, newVal2, newVal3,newVal4], [oldVal1, oldVal2, oldVal3,oldVal4]) => {
//   let commonData;
//   if (Array.isArray(newVal2)) {
//     commonData = newVal1.filter((data1) =>
//       newVal2.some((data2) => data2.name === data1.name)
//     )
//   } else {
//     commonData = newVal1;
//   }
//   props.nodeChildren = [...commonData]; // 使用了新数组副本

//   obj.collges_name = commonData.map((item) => item.name);
//   if (props.nodeChildren.length > 0) {
//     fetch(url + '/send_data_to_server', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json; charset=utf-8',
//       },
//       body: JSON.stringify({ data: props.nodeChildren }),
//     })
//       .then(response => {
//         if (!response.ok) {
//           throw new Error('Network response was not ok ' + response.statusText);
//         }
//         return response.json();
//       })
//       .then(data => {
//         console.log('后端数据变化：', typeof data, data);
//         store.ranSVM_data = data;
//         bus.emit('ranked', store.ranSVM_data);
//       })
//       .catch(error => {
//         console.error('There has been a problem with your fetch operation:', error);
//       });
//   } else {
//     bus.emit('empty-data');
//   }
// })
</script>

<style scoped>
.scrollbar-demo-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 10px;
  margin: 1px;
  text-align: center;
  border-radius: 6px;
  background: #f2f2f2;
  font-size: 10px;
  border: 1px solid #000;
  /* 黑色边框，可以根据需要调整边框宽度 */
  border-radius: 2px;
  /* 圆角半径，可以根据需要调整 */
  padding: 2px;
  color: black;
}

#sp {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 2px;
}

span {
  display: inline-block;
  width: 9px;
  height: 9px;
  margin-right: 1px;
}
</style>
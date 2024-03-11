<template>
  <el-scrollbar height="100%" ref="scrollbar">
    <div class="draggable-container">
      <p v-for="item in obj.data" :key="item.name" class="scrollbar-demo-item" @click="collegesInfo" draggable="true"
        @dragstart="dragStart($event, item)" @dragover.prevent @drop="drop($event, item)">
        {{ item.name }}<span id="sp" :style="{ backgroundColor: item.color }"></span>
      </p>
    </div>
  </el-scrollbar>
</template>

<script setup>
import { ref, inject, reactive, watch, computed } from 'vue'
import { useStore } from '../../store/index.js'

let bus = inject('bus')
let scrollbarRef = ref()
let store = useStore()
let url = 'http://127.0.0.1:5000'

let obj = reactive({
  data: [],
  collges_name: [],
  filter_data: [],
  attributes: [],
  color: [],
  draggedItem: null,
})

function dragStart(event, item) {
  obj.draggedItem = item
  console.log(obj.draggedItem);
}

async function drop(event, targetItem) {
  const draggedIndex = obj.data.findIndex(
    (item) => item.name === obj.draggedItem.name
  )
  const targetIndex = obj.data.findIndex(
    (item) => item.name === targetItem.name
  )

  // 创建一个新的数组副本
  let newData = [...obj.data];

  // 删除拖拽项目
  let [removed] = newData.splice(draggedIndex, 1);

  // 在新的目标位置插入项目
  newData.splice(targetIndex, 0, removed);

  // 更新obj.data为新的数组
  obj.data = newData;

  // 清除拖拽项目记录
  obj.draggedItem = null;

  console.log("obj.data", obj.data);
}

watch(() => [store.update_weight_data, store.colleges_filter, obj.filter_data], ([newVal1, newVal2, newVal3], [oldVal1, oldVal2, oldVal3]) => {
  let commonData;
  if (Array.isArray(newVal2)) {
    commonData = newVal1.filter((data1) =>
      newVal2.some((data2) => data2.name === data1.name)
    )
  } else {
    commonData = newVal1;
  }
  obj.data = [...commonData]; // 使用了新数组副本
  obj.collges_name = commonData.map((item) => item.name);
  if (obj.data.length > 0) {
    fetch(url + '/send_data_to_server', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({ data: obj.data }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
      })
      .then(data => {
        console.log('后端数据变化：', typeof data, data);
        store.ranSVM_data = data;
        bus.emit('ranked', store.ranSVM_data);
      })
      .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
      });
  } else {
    bus.emit('empty-data');
  }
})
</script>

<style scoped>
.scrollbar-demo-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 18px;
  margin: 5px;
  text-align: center;
  border-radius: 4px;
  background: #f2f2f2;
  font-size: 14px;
  border: 2px solid #000;
  /* 黑色边框，可以根据需要调整边框宽度 */
  border-radius: 2px;
  /* 圆角半径，可以根据需要调整 */
  padding: 2px;
  color: black;
}

#sp {
  display: inline-block;
  width: 18px;
  height: 18px;
  margin-right: 2px;
}

span {
  display: inline-block;
  width: 18px;
  height: 18px;
  margin-right: 2px;
}
</style>
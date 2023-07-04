<template>
  <span style="background-color: red;"></span>冲
  <span style="background-color: yellow;"></span>稳
  <span style="background-color: green;"></span>保
  <el-scrollbar height="100px">
    <p v-for="item in obj.data" :key="item" class="scrollbar-demo-item" @click="collegesInfo" >{{ item.name }}<span id="sp" :style="{backgroundColor:item.color}"></span></p>
  </el-scrollbar>
</template>

<script setup>
import { onMounted, ref, inject, reactive } from 'vue'

let bus = inject('bus')
let obj = reactive({
  data: [],
  collges_name: [],
  filter_data: [],
  attributes: [],
  color: []
})
bus.on("submitForm", bus_data => {
  obj.data = bus_data
  obj.collges_name = obj.data.map(item => item.name)
  //:

})

function collegesInfo() {
  obj.filter_data = obj.data.filter(item => item.name == event.target.innerText)
  bus.emit("collgesInfo", obj.filter_data)
}
// onMounted(() => {
//   try {
//     collegesInfo()
//   } catch (error) {
//     console.log(error);
//   }
// })
</script>

<style scoped>
.scrollbar-demo-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 10px;
  margin: 10px;
  text-align: center;
  border-radius: 4px;
  background: #f2f2f2;
  font-size: 10px;
  color: var(--el-color-primary);
}

#sp {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 5px;
}

span {
  display: inline-block;
  width: 15px;
  height: 15px;
  margin-right: 3px;
}

</style>
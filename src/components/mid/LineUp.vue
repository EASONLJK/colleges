<template>
  <div ref="lineupContainer" id="lineup"></div>
</template>

<script setup>
import * as LineUpJS from 'lineupjs';
import { onMounted, ref, inject } from 'vue';

let bus = inject('bus')
let data = []
let axis_name = []
const lineupContainer = ref(null);
let lineup = null;

function lineUp() {
  bus.on("brushend", parallel_data => {
    console.log(parallel_data);
    axis_name.includes(parallel_data[0]) ? '' : axis_name.push(parallel_data[0]);
    // 如果axis_name中有view_total_number,把该字段修改为heat_name
    if (axis_name.includes('view_total_number')) {
      axis_name.splice(axis_name.indexOf('view_total_number'), 1, 'heat_name')
    }
    const div = document.getElementById('lineup');
    div.innerHTML = '';
    if (parallel_data[3].length > 0) {
      data = parallel_data[3].map(item => {

        let obj = {
          probability: item.probability,
          school_name: item.name
        }
        for (let i = 0; i < axis_name.length; i++) {
          obj[axis_name[i]] = item[axis_name[i]]
        }
        return obj
      })
      
      lineup = LineUpJS.asLineUp(lineupContainer.value, data);
    } else {
      lineup = LineUpJS.asLineUp(lineupContainer.value, []);
    }
  });
}

onMounted(() => {
  lineUp();
});
</script>

<style scoped>
@import "~lineupjs/build/LineUpJS.css";

#lineup {
  width: 100%;
  height: 100%;

}
</style>
<template>
  <div ref="lineupContainer" id="lineup"></div>
</template>

<script setup>
import * as LineUpJS from 'lineupjs';
import { onMounted, ref, inject, watch, nextTick } from 'vue';
import { useStore } from '../../store/index.js'

let bus = inject('bus')
let store = useStore()
let data = []
let axis_name = []
const lineupContainer = ref(null);
let lineup = null;
let update_weight_data = ref(null)

watch(() => store.ranSVM_data, (newVal, oldVal) => {
  update_weight_data.value = newVal;
  nextTick(() => {
    lineUp();
  });
})

function lineUp() {
    try {
      console.log(update_weight_data.value);
      const div = document.getElementById('lineup');
      div.innerHTML = '';
      if (update_weight_data.value.length > 0) {
        data = update_weight_data.value.map(item => {
          let obj = {
            Probability: item.probability,
            School_name: item.name,
            School_type: item.type_name,
            School_level: item.school_level,
            Nature_of_Education: item.nature_name,
            Educational_fund: item.eduFund,
            Pro_name: item.pro_name,
            Heat_name: item.heat_name,
            Area_name: item.area_name,
          }
          // for (let i = 0; i < axis_name.length; i++) {
          //   obj[axis_name[i]] = item[axis_name[i]]
          // }
          return obj
        })

        lineup = LineUpJS.asLineUp(lineupContainer.value, data);
      } else {
        lineup = LineUpJS.asLineUp(lineupContainer.value, []);
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
}

</script>

<style scoped>
@import "~lineupjs/build/LineUpJS.css";

#lineup {
  width: 100%;
  height: 100%;
}
</style>
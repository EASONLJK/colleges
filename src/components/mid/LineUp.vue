<template>
  <div ref="lineupContainer" id="lineup"></div>
</template>

<script setup>
import * as LineUpJS from 'lineupjs';
import { onMounted, ref, inject } from 'vue';

// const cats = ['c1', 'c2', 'c3'];
// const data = [];
// for (let i = 0; i < 100; ++i) {
//   data.push({
//     a: Math.random() * 10,
//     d: 'Row ' + i,
//     cat: cats[Math.floor(Math.random() * 3)],
//     cat2: cats[Math.floor(Math.random() * 3)],
//   });
// }
let bus = inject('bus')
let data = []
const lineupContainer = ref(null);
function lineUp() {
  bus.on("brushend", parallel_data => {
    //清除一次div中的内容
    lineupContainer.value.innerHTML = "";
    console.log(parallel_data[3]);
    data = parallel_data[3].map(item => {
      return {
        a: item.name,
        d: item.nature_name,
        // cat: item[2],
        // cat2: item[3]
      }
    })
    const container = lineupContainer.value;
    const lineup = LineUpJS.asLineUp(container, data);
    // const lineup = LineUpJS.builder(data)
    //   .column(LineUpJS.buildStringColumn('d'))
    //   .column(LineUpJS.buildNumberColumn('a').color('green'))
    //   .column(LineUpJS.buildCategoricalColumn('cat', cats))
    //   .column(LineUpJS.buildCategoricalColumn('cat2', cats))
    //   .build(container);
  })
}
onMounted(() => {
  lineUp()
})

</script>

<style scoped>
@import "~lineupjs/build/LineUpJS.css";

#lineup {
  width: 100%;
  height: 100%;

}
</style>
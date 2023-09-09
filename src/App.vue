<template>
  <div class="framWork">

    <div class="header-context">
      <div class="header">
        <h1></h1>
      </div>
    </div>

    <div class="main-context">
      <div class="left">
        <div class="score">
          <score />
        </div>
        <div class="sankey">
          <sankey />
        </div>
      </div>
      <div class="right">
        <div class="top">
          <div class="map">
            <mapBox />
          </div>
          <div class="professsion">
            <professsion />
          </div>
        </div>
        <div class="bottom">
          <div class="school_parallel_axis">
            <school_parallel_axis />
          </div>
        </div>
      </div>
    </div>

    <div class="footer-context">
      <LineUp />
    </div>

  </div>
</template>

<script>
import { useStore } from './store/index.js'
import { storeToRefs } from 'pinia'
import mapBox from './components/mid/mapBox.vue'
import score from './components/left/score.vue'
import LineUp from './components/mid/LineUp.vue'
import sankey from './components/right/sankey.vue'
import school_parallel_axis from './components/right/school_parallel_axis.vue'
import professsion from './components/left/professsions.vue'


export default {
  name: 'App',
  components: {
    mapBox,
    score,
    LineUp,
    sankey,
    school_parallel_axis,
    professsion
  }
}

</script>

<style >
.framWork {
  width: 100%;
  height: 100%;
  position: fixed;
}

.framWork>.header-context {
  width: 100%;
  height: 1%;
  margin-bottom: 4px;
  border-radius: 5px;
  border: 1px solid steelblue;
  background-color: #f5f5f5;
}

.framWork>.main-context {
  width: 100%;
  height: 69%;
  margin-bottom: 4px;
  border-radius: 5px;
  border: 1px solid steelblue;
  background-color: #f5f5f5;
  display: flex;
  flex-wrap: wrap;
}

.framWork>.main-context>.left {
  width: 20%;
  height: 100%;
  margin-right: 4px;
  border-radius: 5px;
  background-color: #f5f5f5;
}

.framWork>.main-context>.left>.score {
  width: 100%;
  height: 30%;
  border-radius: 5px;
  background-color: #f5f5f5;
}

.framWork>.main-context>.left>.sankey {
  width: 100%;
  height: 70%;
  border-radius: 5px;
  background-color: #f5f5f5;
}

.framWork>.main-context>.right {
  width: 79%;
  height: 100%;
  border-radius: 5px;
  background-color: #f5f5f5;
  display: flex;
  flex-wrap: wrap;
}

.framWork>.main-context>.right>.top {
  width: 100%;
  height: 60%;
  border-radius: 5px;
  background-color: #f5f5f5;
  display: flex;
}

.framWork>.main-context>.right>.top>.map {
  width: 50%;
  height: 100%;
  border-radius: 5px;
  background-color: #f5f5f5;
}

.framWork>.main-context>.right>.top>.professsion {
  width: 50%;
  height: 100%;
  border-radius: 5px;
  background-color: #f5f5f5;
}

.framWork>.main-context>.right>.bottom {
  width: 100%;
  height: 40%;
  border-radius: 5px;
  background-color: #f5f5f5;
  display: flex;
}

.framWork>.main-context>.right>.bottom>.school_parallel_axis {
  width: 100%;
  height: 100%;
}

.framWork>.footer-context {
  width: 100%;
  height: 29%;
  border-radius: 5px;
  border: 1px solid steelblue;
  background-color: #f5f5f5;
}

.framWork>.footer {
  width: 100%;
  height: 40%;
  border-radius: 5px;
  border: 1px solid steelblue;
  background-color: #f5f5f5;
}

* {
  margin: 0;
  padding: 0;
}
</style>

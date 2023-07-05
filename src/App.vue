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
        <div class="info">
          <info></info>
        </div>
        <div class="lineScores">
          <linesScores></linesScores>
        </div>
        <div class="professsion">
          <professsion />
        </div>  
      </div>

      <div class="mid">
        <div id="map">
          <mapBox />
        </div>
      </div>

      <div class="right">
        <div class="right-stream">
          <stream />
        </div>
        <div class="right-sankey">
          <sankey />
        </div>
        <div class="right-parallel">
          <school_parallel_axis />
        </div>
      </div>
    </div>

    <div class="footer-context">
        <LineUp/>
    </div>

  </div>
</template>

<script>
import { useStore } from './store/index.js'
import { storeToRefs } from 'pinia'
import mapBox from './components/mid/mapBox.vue'
import score from './components/left/score.vue'
import linesScores from './components/left/Lines-scores.vue'
import info from './components/left/info.vue'
import LineUp from './components/mid/LineUp.vue'
import sankey from './components/right/sankey.vue'
import stream from './components/right/stream.vue'
import school_parallel_axis from './components/right/school_parallel_axis.vue'
import professsion from './components/left/professsions.vue'


export default {
  name: 'App',
  components: {
    mapBox,
    score,
    linesScores,
    info,
    LineUp,
    sankey,
    stream,
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
  height: 2%;
  margin-bottom: 4px;
  border-radius: 5px;
  border: 1px solid steelblue;
  background-color: #f5f5f5;
}

.framWork>.main-context {
  width: 100%;
  height: 70%;
  display: flex;
  flex-direction: row;
}

.framWork>.footer-context {
  width: 100%;
  height: 28%;
  border-radius: 5px;
  border: 1px solid steelblue;
  background-color: #f5f5f5;
}

.framWork>.main-context>.mid {
  width: 60%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.framWork>.main-context>.mid>#map {
  width: 100%;
  height: 100%;
  margin-bottom: 4px;
  border-radius: 5px;
  border: 1px solid steelblue;
}

.framWork>.footer {
  width: 100%;
  height: 40%;
  border-radius: 5px;
  border: 1px solid steelblue;
  background-color: #f5f5f5;
}

.framWork>.main-context>.left {
  width: 20%;
  height: 100%;
  margin-right: 4px;
  border-radius: 5px;
  border: 1px solid steelblue;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.framWork>.main-context>.left>.score {
  width: 100%;
  height: 30%;
}

.framWork>.main-context>.left>.lineScores {
  width: 100%;
  height: 30%;
}

.framWork>.main-context>.left>.info {
  width: 100%;
  height: 20%;
}

.framWork>.main-context>.left>.professsion {
  width: 100%;
  height: 20%;
}

.framWork>.main-context>.right {
  width: 20%;
  height: 100%;
  margin-left: 4px;
  border-radius: 5px;
  border: 1px solid steelblue;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.framWork>.main-context>.right>.right-sankey {
  width: 100%;
  height: 30%;
}

.framWork>.main-context>.right>.right-stream {
  width: 100%;
  height: 30%;
}

.framWork>.main-context>.right>.right-parallel {
  width: 100%;
  height: 40%;
}

* {
  margin: 0;
  padding: 0;
}</style>

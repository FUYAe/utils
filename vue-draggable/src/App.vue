<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import { ref, onMounted } from "vue"
import { Draggable, Expandable } from "./utils/draggable"
const MoveTarget = ref({} as HTMLElement)
onMounted(() => {
  const dr = new Draggable(MoveTarget.value)
  dr.addStopListener((state, e) => {

    console.log('state', state)


  })
  dr.addStartListener(() => {
    console.log('1', 1)
  })
  // new Expandable(MoveTarget.value)
})
</script>

<template>
  <div class="outer">

    <div drkey="sjkdfhskj" class="move" ref="MoveTarget">
    </div>

  </div>
</template>

<style scoped>
.outer {
  background-color: aliceblue;
  width: 1000px;
  height: 800px;
  position: relative;
}

.move {
  position: absolute;
  width: 200px;
  height: 200px;
  background-color: antiquewhite;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

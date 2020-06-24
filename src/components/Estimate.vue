
<template>
<div>
        <li class="list-group-item">{{ item.text }}</li>
        </div>
</template>



<script lang="ts">

import { Vue, Component, Prop } from "vue-property-decorator";
interface EstimateData {
  text: string;
}
@Component
export default class Estimate extends Vue {
    @Prop() item!: EstimateData;
}


</script>


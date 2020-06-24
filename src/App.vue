<template>
  <div id="app">
    <div class="container">
      <div class="row first-row">
        <div class="col-sm">
          <div class="jumbotron" v-if="display">
            <h1>Euler</h1>
            <form v-on:submit.prevent="runEuler">
            
              <button class="btn btn-danger" id="reset-euler-btn" :disabled="!(display.eulerLoading)" v-on:click="resetEuler" type="button">STOP</button>
              <button class="btn btn-success" id="run-euler-btn" :disabled="display.runDisabled" v-on:click="runEuler" type="button">{{ display.eulerButtonLabel || "GO" }}</button>
            </form>
            <div>{{ display.eulerItems.length }} iterations:</div>
            <div>{{ display.eulerBestEstimate }}</div>
            <ul class="list-group" id="euler-items-list">
              <estimate v-for="item in display.eulerItems" :key="item.cnt" v-bind:item="item">
              </estimate>
            </ul>
            <div class="overflowMsg" v-if="display.eulerOverflow">
                Scroll through list to see more results
            </div>
          </div>
        </div>
        <div class="col-sm"  v-if="display">
          <div class="jumbotron">
            <h1>Leibniz</h1>
            <form v-on:submit.prevent="runLeibniz">
              <button class="btn btn-danger" id="reset-leibniz-btn" :disabled="!(display.leibnizLoading)" v-on:click="resetLeibniz" type="button">STOP</button>
              <button class="btn btn-success" id="run-leibniz-btn" :disabled="display.runDisabled" v-on:click="runLeibniz" type="button">{{ display.leibnizButtonLabel  || "GO"  }}</button>
            </form>
            <div>{{ display.leibnizItems.length }} iterations:</div>
            <div>{{ display.leibnizBestEstimate }}</div>
            <ul class="list-group" id="leibniz-items-list">
              <estimate v-for="item in display.leibnizItems" :key="item.cnt" v-bind:item="item">
              </estimate>
            </ul>
            <div class="overflowMsg" v-if="display.leibnizOverflow">
                Scroll through list to see more results
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import Vue from 'vue';
import { EstimateItem, Display, IOnMessageEvent} from './types/index';
import { Component, Prop, Emit } from 'vue-property-decorator';
import Estimate from "./components/Estimate.vue";
interface DisplayContainer {
  display: Display;
}

//REFACTOR -- different place in code...
interface EventWithCount {
    messageEvent: IOnMessageEvent;
    index: number;
}

Vue.filter('reverse', (value: number[]): number[] => {
  // slice to make a copy of array, then reverse the copy
  return value.slice().reverse();
});
const streamUrlLeibniz = 'http://localhost:8090/leibniz';
const streamUrlEuler = 'http://localhost:8090/euler';

@Component({
  name: 'App',
  components: {
    Estimate
  }
})
export default class App extends Vue {
  // Data property
  @Prop()
  display!: Display;

  // Lifecycle hook
  mounted () {
    let self = this;
    self.display = {
      leibnizOverflow: false,
      eulerOverflow: false,
      leibnizItems: [],
      eulerItems: [],
      leibnizBestEstimate: 3,
      eulerBestEstimate: 3,
      loading: false,
      eulerLoading: false,
      leibnizLoading: false,
      evtSourceLeibniz: new EventSource(streamUrlLeibniz),
      evtSourceEuler:  new EventSource(streamUrlEuler),
    }
  }
  get leibnizButtonLabel() {
    return (this.display && this.display.leibnizLoading) ? 'Loading…' : 'Go';    
  }
  get eulerButtonLabel() {
    return (this.display && this.display.eulerLoading) ? 'Loading…' : 'Go';    
  }
  get runDisabled() {
    return (this.display && (this.display.eulerLoading || this.display.leibnizLoading));
  }
  set leibnizItemsLoadState(value: boolean) {
    if (value == true) {
      this.display.leibnizItems = [];
      this.display.leibnizOverflow = false;
      this.display.loading = true;
      this.display.leibnizLoading = true;
    }
  }
  set eulerItemsLoadState(value: boolean) {
    if (value == true) {
      this.display.eulerItems = [];
      this.display.eulerLoading = true;
      this.display.eulerOverflow = false;
      this.display.loading = true;
    }
  }  
  
  set leibnizOverflowState(value: boolean) {
    this.display.leibnizOverflow = value;
  }
  set eulerOverflowState(value: boolean) {
    this.display.eulerOverflow = value;
  }
  set displayLoading(value: boolean) {
    this.display.loading = value;
  }
  
  set eulerPush({messageEvent: msgEvent, index: count}: EventWithCount) {
    this.display.eulerItems.push({text: msgEvent.data, cnt: count});
    this.display.eulerBestEstimate = parseFloat(msgEvent.data);
  }

  set leibnizPush({messageEvent: msgEvent, index: count}: EventWithCount) {
    this.display.leibnizItems.push({text: msgEvent.data, cnt: count});
    this.display.leibnizBestEstimate = parseFloat(msgEvent.data);
  }
// Component methods
@Emit()
runLeibniz() {
    let self = this;
    self.resetEuler();

  
    self.display.evtSourceLeibniz = new EventSource(streamUrlLeibniz);
    
    this.leibnizItemsLoadState = true;

    let i = 0;
    self.display.evtSourceLeibniz.onmessage = (e: IOnMessageEvent) => {

      const item = JSON.parse(e.data);
      self.leibnizPush = { messageEvent: e, index: i};
      
      i += 1;
      if (i > 6) {
        this.leibnizOverflowState = true;
      }
    };
    self.display.evtSourceLeibniz.addEventListener('close',  (e: Event) => {
      self.display.evtSourceLeibniz.close();
      self.displayLoading = false;
    }, false);
  }
  @Emit()
  runEuler() {
    let self = this;
    let i=0;
    self.resetLeibniz();
    //self.display.eulerItems = [];
    //const streamUrl = 'http://localhost:8090/euler';

    self.eulerItemsLoadState = true;
    self.display.evtSourceEuler = new EventSource(streamUrlEuler);
    //self.display.eulerLoading = true;
    //self.display.eulerOverflow = false;
    //self.display.loading = true;
    
    self.display.evtSourceEuler.onmessage = (e: IOnMessageEvent) => {
      const item = JSON.parse(e.data);
      //self.display.eulerItems.push({text: e.data, cnt: i});
      //self.display.eulerBestEstimate = parseFloat(e.data);
      this.eulerPush = { messageEvent: e, index: i};
      i += 1;
      if (i > 6) { // can only show 6 items, 0<=i<=5
        self.eulerOverflowState = true
      }
    };
    self.display.evtSourceEuler.addEventListener('close', (e: Event) => {
      self.display.evtSourceEuler.close();
      self.displayLoading = false;
    }, false);
  }
  @Emit()
  resetLeibniz() {
    if (this.display.evtSourceLeibniz) {
      this.display.evtSourceLeibniz.close();
    }
    this.display.leibnizLoading = false;
  }
  @Emit()
  resetEuler() {
    if (this.display.evtSourceEuler) {
      this.display.evtSourceEuler.close();
    }
    this.display.eulerLoading = false;
  } 
}

</script> 

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

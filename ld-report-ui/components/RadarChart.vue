<script>
import { Radar, mixins } from 'vue-chartjs'
const { reactiveProp, reactiveData } = mixins

export default {
  extends: Radar,
  mixins: [reactiveProp, reactiveData],
  mounted() {
    this.renderChart(this.chartdata, this.options)
  },
}
</script>

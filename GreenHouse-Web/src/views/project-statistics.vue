<template>
  <div class="statistics">
    <div class="content">
      <div v-if="loading">Loading...</div>
      <div v-else-if="dataRead.length > 0 && descriptionData.length > 0 && anovaData.length > 0 && tukeyResults.length > 0 && tTestResults.length > 0">
        <div class="read">
          <h3>Data Read</h3>
          <dx-data-grid :data-source="dataRead" :show-borders="true">
          </dx-data-grid>
        </div>
        <div class="describe">
          <h3>Data Description</h3>
          <dx-data-grid :data-source="descriptionData" :show-borders="true">
            <dx-column field="stat" caption="Statistic"></dx-column>
            <dx-column field="value" caption="Value"></dx-column>
          </dx-data-grid>
        </div>
        <div class="anova">
          <h3>ANOVA Analysis</h3>
          <dx-data-grid :data-source="anovaData" :show-borders="true">
            <dx-column field="source" caption="Source"></dx-column>
            <dx-column field="Residual" caption="Residual"></dx-column>
            <dx-column field="treatment_code" caption="Treatment Code"></dx-column>
          </dx-data-grid>
        </div>
        <div class="tukey">
          <h3>Tukey Test Results</h3>
          <dx-data-grid :data-source="tukeyResults" :show-borders="true">
          </dx-data-grid>
        </div>
        <div class="t-test">
          <h3>T-Test Results</h3>
          <dx-data-grid :data-source="tTestResults" :show-borders="true">
            <dx-column field="group1" caption="Group 1"></dx-column>
            <dx-column field="group2" caption="Group 2"></dx-column>
            <dx-column field="stat" caption="Statistic"></dx-column>
            <dx-column field="pval" caption="P Value"></dx-column>
            <dx-column field="pval_corr" caption="P Value (Corrected)"></dx-column>
            <dx-column field="reject" caption="Reject Null?"></dx-column>
          </dx-data-grid>
        </div>
      </div>
      <div v-else>
        No data available.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, watch } from 'vue';
import DxDataGrid from 'devextreme-vue/data-grid';
import { useStatisticStore } from '../store/statistics-project';

const props = defineProps({
  projectId: String,
  inputBatchId: String,
  criterionId: String,
});

const statisticStore = useStatisticStore();

const dataRead = ref(statisticStore.data)
const descriptionData = ref(statisticStore.descriptionData);
const anovaData = ref(statisticStore.anovaData);
const tukeyResults = ref(statisticStore.tukeyResults);
const tTestResults = ref(statisticStore.tTestResults);
const loading = ref(statisticStore.loading);


const fetchStatistics = async () => {
  await statisticStore.fetchStatistics(props.inputBatchId, props.projectId, props.criterionId);

  // Update data sources after fetching
  dataRead.value = statisticStore.data;
  descriptionData.value = statisticStore.descriptionData;
  anovaData.value = statisticStore.anovaData;
  tukeyResults.value = statisticStore.tukeyResults;
  tTestResults.value = statisticStore.tTestResults;
};
// Gọi fetchStatistics lần đầu khi component được mount
onMounted(fetchStatistics);

// Theo dõi sự thay đổi của criterionId và gọi lại fetchStatistics khi nó thay đổi
watch(() => props.criterionId, (newCriterionId, oldCriterionId) => {
  if (newCriterionId !== oldCriterionId) {
    fetchStatistics(); // Gọi lại fetchStatistics khi criterionId thay đổi
  }
});
</script>

<style scoped>
.statistics {
  padding: 16px;
}

.header {
  background-color: #085321;
  color: #ffffff;
  padding: 16px;
  text-align: center;
}

.content {
  padding: 16px;
}

.describe,
.anova,
.tukey,
.t-test {
  margin-bottom: 24px;
}
</style>

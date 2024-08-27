<template>
  <dx-popup
    :visible.sync="isPopupMonitorVisible"
    :showCloseButton="true"
    @hidden="onPopupHidden"
    width="700px"
    height="auto"
    :title="popupTitle"
    minHeight="700"
    class="monitor-popup"
  >
  <!-- <template #title>
      <div class="custom-title">
        Plot: {{ cellSelected.plot }}<br>Treatment: {{ cellSelected.treatment_code }}
      </div>
    </template> -->
    <!-- <div class="info-plot">
      <div class="input-batch">
        {{ titleInputBatch }}
      </div>
      <div class="title-monitor">
        <div class="text plot">
          Plot:  {{ cellSelected.plot }}
        </div>
        <div class="text treatment">
          Treatment:  {{ cellSelected.treatment_code }}
        </div>
      </div>
    </div> -->
    <div class="flex-row">
      <div class="input_text">
        <div class="range-date">
          Input batch {{ input_batch.order }} ({{ moment(input_batch.start_date).format('DD/MM/YYYY') }} - {{ moment(input_batch.end_date).format('DD/MM/YYYY') }})
        </div>
        <br>
      </div>
      <dx-button
        icon="export"
        class="mr-16 btn-export"
        @click="exportHistoryData"
      />
    </div>
    <div class="input-detail flex-col">
      <div v-for="(projectDetail) in projectDetailList" :key="projectDetail._id" class="input-text">
        <label :for="`${projectDetail.criterion_code}`">{{ projectDetail.criterion_code }}</label>
        <dx-text-box v-model="projectDetail.value" :disabled="!isEditable"/>
      </div>
    </div>
    <div class="footer" v-if="isEditable == true">
      <dx-button
        text="Cancel"
        class="btn-cancel mr-16"
        @click="onPopupHidden"
      />
      <dx-button
        text="Save"
        class="btn-save"
        @click="saveDataAndCloseForm"
      />
    </div>
  </dx-popup>
</template>

<script setup>
import { ref, inject, onBeforeMount, onMounted } from 'vue';
import DxButton from 'devextreme-vue/button';
import DxTextBox from 'devextreme-vue/text-box';
import DxPopup from 'devextreme-vue/popup';
import DxNumberBox from 'devextreme-vue/number-box';
import moment from 'moment';
import { useProjectMonitorStore } from '../store/monitor-project';
import criterionApi from '../api/criterion';
import treatmentApi from '../api/treatment';

const projectMonitorStore = useProjectMonitorStore();

const isPopupMonitorVisible = inject('projectDataMonitor').isPopupMonitorVisible;

const titleInputBatch = ref('');
const inputBatchList = ref([]);
const input_batch = ref();
const projectDetailList = ref([]);
const criterionList = ref([]);
const cellSelected = ref();
const isEditable = ref(true);
const popupTitle = ref('');

onBeforeMount( async () => {
  inputBatchList.value = projectMonitorStore.inputBatchList;
  input_batch.value = projectMonitorStore.input_batch;
  cellSelected.value = projectMonitorStore.cellSelected;
  criterionList.value = await criterionApi.getByProjectId(projectMonitorStore.project._id);
  titleInputBatch.value = `Input Batch ${input_batch.value.order} (${moment(input_batch.value.start_date).format('DD/MM/YYYY')} - ${moment(input_batch.value.end_date).format('DD/MM/YYYY')})`;
  await getProjectDetailList();
  isEditable.value = projectMonitorStore.isEditable;
});

onMounted( () => {
  popupTitle.value = `Plot: ${cellSelected.value.plot}\n Treatment: ${cellSelected.value.treatment_code}`;
});

const getProjectDetailList = async () => {
  let detail = await projectMonitorStore.getDataByCell();
  let treatmentList = await treatmentApi.getByProjectId(projectMonitorStore.project._id);
  let treatment = treatmentList.find(t => t.treatment_code == cellSelected.value.treatment_code);
  projectDetailList.value = criterionList.value.map(criterion => {
    let value = detail?.find(d => d.criterion_id == criterion._id);
    if(value == null || value == undefined) {
      return {
        project_id: projectMonitorStore.project._id,
        project_code: projectMonitorStore.project.project_code,
        criterion_id: criterion._id,
        criterion_code: criterion.criterion_code,
        treatment_id: treatment._id,
        treatment_code: treatment.treatment_code,
        input_batch_id: input_batch.value._id,
        block: cellSelected.value.block,
        replicate: cellSelected.value.replicate,
        column: cellSelected.value.column,
        plot: cellSelected.value.plot,
        value: ''
      };
    }
    return value;
  });
};

const onPopupHidden = () => {
  isPopupMonitorVisible.value = false;
};

const saveDataAndCloseForm = () => {
  isPopupMonitorVisible.value = false;
  projectMonitorStore.saveDataByCell(projectDetailList.value);
};

const exportHistoryData = async () => {
  await projectMonitorStore.exportHistoryData();
};

</script>

<style lang="scss">
.fl-3 {
  flex: 0.3;
}
.fl-5 {
  flex: 0.5;
}
.fl-10 {
  flex: 1;
}
.mr-16 {
  margin-right: 16px;
}
.input_text {
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  label {
    font-weight: 500;
    font-size: 16px;
    padding-bottom: 6px;
  }
}
.monitor-popup {
  display: flex;
  flex-direction: column;
  .dx-popup-title {
    .title {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 10px 20px;
      border-bottom: 1px solid #e8e8e8;
      h1 {
        font-size: 18px;
        font-weight: 600;
        margin: 0;
      }
      i {
        cursor: pointer;
      }
    }
  }
  
  .info-plot {
    padding: 20px;
    .input-batch {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    .block {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    .plot {
      font-size: 14px;
      font-weight: 600;
    }
  }

  .footer {
    position: absolute;
    right: 16px;
  }
}

.title-monitor {
  display: flex;
  flex-direction: column;
  .text {
    font-weight: bold;
    color: #0E5021;
  }
}

.range-date {
  font-size: 16px;
  font-weight: 600;
}

.input-detail {
  .input-text {
    label {
      font-weight: 600;
      color: #0E5021;
    }
    .dx-textbox {
      margin-top: 8px;
    }
    padding-bottom: 16px;
  }
}

.btn-export {
  margin-left: auto;
}

.flex-row {
  display: flex;
  //align-items: center; /* Căn chỉnh các phần tử theo chiều dọc (trung tâm) */
}
</style>
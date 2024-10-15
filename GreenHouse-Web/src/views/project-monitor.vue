<template>
  <div class="project_monitor">
    <div class="header">
      <div class="header-left">
        {{ projectTitleName }}
      </div>
      <div class="header-right">
        <!-- <dx-button
          text="Statistics"
          icon="chart"
          class="mr-16 btn-statistics"
          stylingMode="outlined"
        /> -->
        <dx-button
          icon="import"
          class="mr-16 btn-import"
          @click="triggerFileInput"
        />
        <!-- Thẻ input để chọn file, được ẩn -->
        <input
          type="file"
          ref="fileInput"
          style="display: none"
          @change="handleFileChange"
        />
        <dx-button
          icon="export"
          class="mr-16 btn-export"
          @click="exportData"
        />
        <dx-button
          icon="close"
          class="mr-16 btn-close"
          stylingMode="outlined"
          @click="onCloseMonitor"
        />
      </div>
    </div>
    <div class="content">
      <div class="flex-col">
        <div class="input_text fl-3 mr-16">
          <div>
            <label for="input_batch">Input Batch</label>
            <dx-button
              icon="edit"
              class="mr-16 btn-close"
              @click="onClickAddInputBatch"
            />
            <dx-button
              icon="download"
              class="mr-16 btn-export"
              @click="exportSchema"
            />
          </div>
          <dx-select-box
            v-model="input_batch"
            :dataSource="inputBatchList"
            :displayExpr="displayExprInputbatch"
            :valueExpr="_id"
            :acceptCustomValue="false"
            :searchEnabled="false"
            @valueChanged="onValueInputBatchChanged"
          />
        </div>
      </div>
      <div class="flex-col layout">
        <div v-if="typeExperiment == TypeExperiment.RCBD" class="input_text fl-10 RCBD-layout">
          <div v-for="(layout, layoutIndex) in layoutDetail" :key="layoutIndex" class="RCBD-layout-item">
            <div class="block"> {{ layoutIndex + 1 }}</div>
            <dx-data-grid
              :data-source="layout.map((row, rowIndex) => row.reduce((acc, item, itemIndex) => {
                acc['field' + itemIndex] = item;
                return acc;
              }, {}))"
              :show-borders="true"
              :show-column-headers="false"
              :editing="{ mode: 'cell', allowUpdating: false }"
              :onCellClick="e => openPopupMonitor(e, layoutIndex)"
            >
              <dx-column
                v-for="(item, index) in layout[0]"
                :key="index"
                :data-field="'field' + index"
                :width="100"
                :allow-sorting="false"
              >
                <template #cellTemplate="{ data }">
                  <div>
                    {{ data['field' + index] }}
                  </div>
                </template>
              </dx-column>
            </dx-data-grid>
          </div>
        </div>
        <div v-if="typeExperiment == TypeExperiment.CRD" class="input_text fl-10 RCD-layout">
          <div v-for="(layout, layoutIndex) in layoutDetail" :key="layoutIndex" class="RCD-layout-item">
            <dx-data-grid
              ref="dataGrid"
              :data-source="layout.map((row, rowIndex) => row.reduce((acc, item, itemIndex) => {
                acc['field' + itemIndex] = item;
                return acc;
              }, {}))"
              :show-borders="true"
              :show-column-headers="false"
              :editing="{ mode: 'cell', allowUpdating: false }"
              :onCellClick="e => openPopupMonitor(e, layoutIndex)"
            >
              <dx-column
                v-for="(item, index) in layout[0]"
                :key="index"
                :data-field="'field' + index"
                :width="100"
                :allow-sorting="false"
              >
                <template #cellTemplate="{ data }">
                  {{ data['field' + index] }}
                </template>
              </dx-column>
            </dx-data-grid>
          </div>
        </div>
        <div class="header2">
          <h3>Dashboard</h3>
        </div>
        <div class="dashboard-iframe">
          <iframe
            src="http://localhost:3000/public/dashboard/c8f12382-b5e5-4f96-bc6d-70fedb398ec3"
            frameborder="0"
            width="100%"
            height="600"
            allowtransparency
          ></iframe>
        </div>
        <div class="header2">
          <h3>Statistics</h3>
        </div>
        <div class="input_text fl-3 mr-16">
          <div>
            <label for="criterion">Criterion</label>
          </div>
          <dx-select-box
            v-model="selectedCriterion"
            :dataSource="criterionList"
            displayExpr="criterion_name"
            :valueExpr="_id"
            :acceptCustomValue="false"
            :searchEnabled="false"
            @valueChanged="onValueCriterionChanged"
          />
        </div>
        <div v-if="selectedCriterion" class="criterion-section">
          <statistics-component 
            :project-id="projectMonitorStore.projectId" 
            :input-batch-id="projectMonitorStore.input_batch._id"
            :criterion-id="selectedCriterion._id"
          />
        </div>
      </div>
    </div>
    <input-batch-popup v-if="isPopupInputBatchVisible"/>
    <monitor-popup v-if="isPopupMonitorVisible"/>
  </div>
</template>

<script setup>
import { ref, provide, onMounted, onBeforeMount } from 'vue';
import moment from 'moment';
import DxButton from 'devextreme-vue/button';
import DxSelectBox from 'devextreme-vue/select-box';
import DxDataGrid from 'devextreme-vue/data-grid';
import InputBatchPopup from './input-batch-popup.vue';
import MonitorPopup from './monitor-popup.vue';
import StatisticsComponent from './project-statistics.vue';
import { useProjectMonitorStore } from '../store/monitor-project';
import statisticsApi from '../api/statistics';
import { useRoute, useRouter } from 'vue-router';
import { ModelState, TypeExperiment } from '@/enum/enum';
import treatment from '@/api/treatment';

const route = useRoute();
const router = useRouter();
const projectMonitorStore = useProjectMonitorStore();

const displayExprInputbatch = (item) => {
  if (!item) {
    return "";
  }
  return `Batch ${item.order} (${moment(item.start_date).format('DD/MM/YYYY')} - ${moment(item.end_date).format('DD/MM/YYYY')})`;
};
const isPopupInputBatchVisible = ref(false);
const isPopupMonitorVisible = ref(false);
const projectTitleName = ref('');
const typeExperiment = ref(0);
const layoutDetail = ref([]);
const isEditable = ref(true);

const input_batch = ref(null);
const inputBatchList = ref([]);
const criterionList = ref([]);
const showStatistics = ref(false);
const selectedCriterion = ref(null);
const fileInput = ref(null);

onBeforeMount( async () => {
  projectMonitorStore.$reset();
  // mode = 0: add edit, mode = 1: view
  if(route.query.mode == 0) {
    projectMonitorStore.mode = ModelState.Add;
  } else {
    projectMonitorStore.mode = ModelState.View;
  }
  projectMonitorStore.projectId = route.params.id;
  await projectMonitorStore.getProjectById(projectMonitorStore.projectId);
  await projectMonitorStore.getlayoutArrangementByProjectId();
  await projectMonitorStore.getInputBatchByProjectId();
  await projectMonitorStore.getCriterionByProjectId();
  
  layoutDetail.value = projectMonitorStore.layoutDetail;
  projectTitleName.value = projectMonitorStore.project.project_name;
  typeExperiment.value = projectMonitorStore.project.type_experiment;
  inputBatchList.value = projectMonitorStore.inputBatchList;
  criterionList.value = projectMonitorStore.criterionList;
  input_batch.value = projectMonitorStore.inputBatchList[projectMonitorStore.inputBatchList.length - 1];
  selectedCriterion.value = projectMonitorStore.criterionList[0];
  projectMonitorStore.input_batch = projectMonitorStore.inputBatchList[projectMonitorStore.inputBatchList.length - 1];
  isEditable.value = projectMonitorStore.isEditable;
  showStatistics.value = true;
});

const updateInputBatchList = async () => {
  await projectMonitorStore.getInputBatchByProjectId();
  inputBatchList.value = projectMonitorStore.inputBatchList;
  input_batch.value = projectMonitorStore.inputBatchList[projectMonitorStore.inputBatchList.length - 1];
};



provide('projectDataMonitor', {
  isPopupInputBatchVisible,
  isPopupMonitorVisible,
  updateInputBatchList
});

const onCloseMonitor = () => {
  router.push('/projects');
};

// Hàm để kích hoạt chọn file
const triggerFileInput = () => {
  fileInput.value.click();
};

// Hàm xử lý khi người dùng chọn file
const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (file) {
    try {
      // Tạo FormData và thêm file vào
      const formData = new FormData();
      formData.append('file', file);

      // Lặp qua và in ra các giá trị trong FormData
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1].name}`);  // In ra key và tên của tệp
      }

      // In ra thông tin của tệp
      console.log('Tên file:', file.name);
      console.log('Kích thước file:', file.size);
      console.log('Loại file:', file.type);

      projectMonitorStore.dataImport = formData;

      // Gọi API để gửi FormData (phần này không thay đổi)
      const result = await projectMonitorStore.importData();

      if (result && result.success) {
        alert("Import dữ liệu thành công!");
      } else {
        alert(result.error || "Có lỗi xảy ra khi import dữ liệu 2.");
      }
    } catch (error) {
      console.error("Lỗi khi import dữ liệu:", error);
      alert("Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại.");
    }
  }
};

const exportData = async () => {
  await projectMonitorStore.exportData();
};

const exportSchema = async () => {
  await projectMonitorStore.exportSchema();
};

const onClickAddInputBatch = () => {
  isPopupInputBatchVisible.value = true;
};

const onValueInputBatchChanged = (e) => {
  input_batch.value = e.value;
  projectMonitorStore.input_batch = e.value;
};

const onValueCriterionChanged = (e) => {
  selectedCriterion.value = e.value;
  // Add your logic here if you need to update anything when the criterion changes
};

const openPopupMonitor = (e, layoutIndex) => {
  isPopupMonitorVisible.value = true;
  projectMonitorStore.cellSelected = {
    block: layoutIndex + 1,
    replicate: e.rowIndex + 1,
    column: e.columnIndex + 1,
    project_id: projectMonitorStore.project._id,
    input_batch_id: input_batch.value._id,
    plot: `${layoutIndex + 1}.${e.rowIndex + 1}.${e.columnIndex + 1}`,
    treatment_code: e.value
  };
};


</script>

<style lang="scss">
@import "../themes/generated/variables.base.scss";
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
  flex-direction: column;
  label {
    font-weight: 500;
    font-size: 16px;
    padding-bottom: 6px;
  }
}
.project_monitor {
  display: flex;
  flex-direction: column;
  .header {
    background-color: #085321;
    color: #ffffff;
    min-height: 50px;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 16px;
    .header-left {
      font-weight: bold;
      font-size: 16px;
    }
    .header-right {
      position: absolute;
      right: 16px;
      .btn-statistics, .btn-import, .btn-export, .btn-close {
        background-color: white !important;
        color: black !important;
      }
    }
  }
  .header2 {
    margin-top: 15px;
    margin-bottom: 15px;
    background-color: #085321;
    color: #ffffff;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-left: 10px;
  }
  .content {
    padding: 16px;
    .layout {
      width: 100%;
      padding-top: 16px;
      overflow: auto;
      .RCBD-layout {
        display: flex !important;
        flex-direction: row;
        .RCBD-layout-item {
          display: flex;
          flex-direction: column;
          padding-right: 16px;
          .block {
            font-weight: bold;
            font-size: 24px;
            margin-bottom: 10px;
          }
        }
      }
      .RCD-layout {
        display: flex !important;
        flex-direction: column;
        width: 518px;
        .RCD-layout-item {
          display: flex;
          flex-direction: column;
          padding-right: 16px;
          td {
            width: fit-content !important;
          }
          .block {
            font-weight: bold;
            font-size: 24px;
            margin-bottom: 10px;
          }
        }
      }
    }
  }
}
</style>
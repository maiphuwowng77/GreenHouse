<template>
  <div class="layout_detail">
    <div class="header">
      <div class="left_header">
        <h2 class="title_project">{{ projectTitleName }}</h2>
      </div>
    </div>
    <hr style="height:1px;border-width:0;color:gray;background-color:gray">
    <div class="project_content">
      <div class="flex-col type-project">
        <div :class="['item-type rcbd', typeExperiment == TypeExperiment.RCBD ? 'type-selected' : '']">
          Randomized Completely Block Design
        </div>
        <div :class="['item-type crd', typeExperiment == TypeExperiment.CRD ? 'type-selected' : '']">
          Completely Random Design
        </div>
      </div>
      <div class="flex-col">
        <div class="input_text fl-3" v-if="typeExperiment != TypeExperiment.CRD">
          <label for="project_code">Block *</label>
          <dx-number-box
            :value="block"
            :show-spin-buttons="true"
            :min="0"
            @valueChanged="onBlockChanged"
            :disabled="!isEditable"
          />
        </div>
      </div>
      
      <div class="flex-col">
        <div class="input_text fl-3">
          <label for="project_code">Replicate *</label>
          <dx-number-box
            :value="replicate"
            :show-spin-buttons="true"
            :min="0"
            :disabled="!isEditable"
            @valueChanged="onReplicateChanged"
          />
        </div>
      </div>

      <div class="flex-col">
        <div class="input_text fl-3">
          <label for="project_code">Column in block *</label>
          <dx-number-box
            :value="column"
            :show-spin-buttons="true"
            :min="0"
            :max="typeExperiment == TypeExperiment.RCBD ? projectDetailStore.treatmentList.length : 1000"
            :disabled="!isEditable"
            :isValid="column !== null && column !== ''"
            validationMessage="This field is required"
            @valueChanged="onColumnChanged"
          />
        </div>
        <div class="input_text fl-3">
          <dx-button 
            class="" 
            text="Generate Layout" 
            @click="generateLayout" 
            :disabled="!isEditable"
          />
        </div>
      </div>

      <div class="flex-col layout">
        <div v-if="typeExperiment == TypeExperiment.RCBD" class="input_text fl-10 RCBD-layout">
          <div v-for="(layout, layoutIndex) in layoutArrangement" :key="layoutIndex" class="RCBD-layout-item">
            <div class="block"> {{ layoutIndex + 1 }}</div>
            <dx-data-grid
              ref="dataGrid"
              :data-source="layout.map((row, rowIndex) => row.reduce((acc, item, itemIndex) => {
                acc['field' + itemIndex] = item;
                return acc;
              }, {}))"
              :show-borders="true"
              :show-column-headers="false"
              :editing="editingOptions"
              :onRowValidating="e => onRowValidating(e, layoutIndex)"
            >
              <dx-column
                v-for="(item, index) in layout[0]"
                :key="index"
                :data-field="'field' + index"
                :width="100"
                :allow-sorting="false"
                :lookup="{ dataSource: treatmentCodeList}"
              >
                <template #cellTemplate="{ data }">
                  <dx-select-box
                    :value="data['field' + index]"
                  />
                </template>
              </dx-column>
            </dx-data-grid>
          </div>
        </div>
        <div v-if="typeExperiment == TypeExperiment.CRD" class="input_text fl-10 RCD-layout">
          <div v-for="(layout, layoutIndex) in layoutArrangement" :key="layoutIndex" class="RCD-layout-item">
            <dx-data-grid
              ref="dataGrid"
              :data-source="layout.map((row, rowIndex) => row.reduce((acc, item, itemIndex) => {
                acc['field' + itemIndex] = item;
                return acc;
              }, {}))"
              :show-borders="true"
              :show-column-headers="false"
              :editing="editingOptions"
              :onRowValidating="e => onRowValidating(e, layoutIndex)"
            >
              <dx-column
                v-for="(item, index) in layout[0]"
                :key="index"
                :data-field="'field' + index"
                :width="100"
                :allow-sorting="false"
                :lookup="{ dataSource: treatmentCodeList}"
              >
                <template #cellTemplate="{ data }">
                  <dx-select-box
                    :value="data['field' + index]"
                  />
                </template>
              </dx-column>
            </dx-data-grid>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, getCurrentInstance } from 'vue';
import {DxDataGrid, DxColumn } from 'devextreme-vue/data-grid';
import { DxButton } from 'devextreme-vue/button';
import DxSelectBox from 'devextreme-vue/select-box';
import DxNumberBox from 'devextreme-vue/number-box';
import { ModelState, TypeExperiment } from '../enum/enum';
import { useProjectDetailStore } from '../store/projects-detail';
import DxValidator, {
    DxRequiredRule,
} from 'devextreme-vue/validator';

const proxy = getCurrentInstance();
const editingOptions = ref({
  mode: 'cell',
  allowUpdating: true,
});
const projectDetailStore = useProjectDetailStore();

// data
const isEditable = ref([]);
const layoutArrangement = ref(null);
const treatmentCodeList = ref([]);
const block = ref(0);
const replicate = ref(0);
const column = ref(0);
const typeExperiment = ref(0);
const projectTitleName = ref([]);

const onRowValidating = (e, layoutIndex) => {
  if(typeExperiment.value == 1) {
    let dataRow = Object.assign(e.oldData, e.newData);
    layoutArrangement.value[layoutIndex][0] = Object.values(Object.values(dataRow));
    let set = new Set(Object.values(dataRow));
    if(set.size !== dataRow.length) {
      e.errorText = "Treatments cannot be duplicated.";
      e.isValid = false;
    }
  }
};

onBeforeMount( async () => {
  typeExperiment.value = projectDetailStore.project.type_experiment;
  projectDetailStore.typeExperiment = typeExperiment.value;
  switch (projectDetailStore.mode) {
    case ModelState.Add:
      await beforeMountLayout();
      isEditable.value = true;
      break;
    case ModelState.Edit:
      if(projectDetailStore.layoutArrangement == null || projectDetailStore.layoutArrangement.length === 0 ) {
        await projectDetailStore.getlayoutArrangementByProjectId();
      }
      block.value = typeExperiment.value == 0 ? 1 : projectDetailStore.treatmentList.length;
      column.value = projectDetailStore.treatmentList.length;
      replicate.value = projectDetailStore.treatmentList.length;
      layoutArrangement.value = typeExperiment.value == 0 ? [[]] : [[[]]];
      isEditable.value = projectDetailStore.isEditable;
      break;
    case ModelState.View:
      await projectDetailStore.getlayoutArrangementByProjectId();
      isEditable.value = false;
      break;
    default:
      break;
  }
  projectTitleName.value = projectDetailStore.mode === ModelState.Add ? 'Create New Project' : projectDetailStore.project.project_name;
  layoutArrangement.value = projectDetailStore.layoutArrangement.layout;
  treatmentCodeList.value = projectDetailStore.layoutArrangement.treatments;
  block.value = projectDetailStore.layoutArrangement.block;
  replicate.value = projectDetailStore.layoutArrangement.replicate;
  column.value = projectDetailStore.layoutArrangement.column;
  editingOptions.value = {
    mode: 'cell',
    allowUpdating: isEditable.value,
  };
});

const beforeMountLayout = async () => {
  block.value = typeExperiment.value == TypeExperiment.CRD ? 1 : projectDetailStore.treatmentList.length;
  column.value = projectDetailStore.treatmentList.length;
  replicate.value = projectDetailStore.treatmentList.length;
  var layoutParams = {
    block: block.value,
    replicate: replicate.value,
    column: column.value,
    typeExperiment: typeExperiment.value,
    treatments: projectDetailStore.treatmentList.map(item => item.treatment_code),
  };
  var layout = await projectDetailStore.generateLayout(layoutParams);
  if(layout != null) {
    projectDetailStore.layoutArrangement = {
      layout: layout,
      treatments: projectDetailStore.treatmentList.map(item => item.treatment_code),
      block: block.value,
      replicate: replicate.value,
      column: column.value,
    };
  }
};

const onBlockChanged = (e) => {
  projectDetailStore.layoutArrangement.block = e.value;
  block.value = e.value;
};

const onReplicateChanged = (e) => {
  projectDetailStore.layoutArrangement.replicate = e.value;
  replicate.value = e.value;
};

const onColumnChanged = (e) => {
  projectDetailStore.layoutArrangement.column = e.value;
  column.value = e.value;
};

const generateLayout = async () => {
  let layoutParams = {
    block: block.value,
    replicate: replicate.value,
    column: column.value,
    typeExperiment: typeExperiment.value,
    treatments: treatmentCodeList.value,
  };
  let layout = await projectDetailStore.generateLayout(layoutParams);
  layoutArrangement.value = layout;
  projectDetailStore.layoutArrangement.layout = layout;

  proxy.refs.dataGrid.forEach(element => {
    element.instance.refresh();
  });
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
  flex-direction: column;
  label {
    font-weight: 500;
    font-size: 16px;
    padding-bottom: 6px;
  }
}
.layout_detail {
  .dx-freespace-row {
    display: none !important;
  }
  height: 100%;
  padding: 32px;
  .header {
    display: flex;
    h2 {
      font-weight: bold;
      font-size: 24px;
      margin-top: 0 !important;
      margin-bottom: 0 !important;
    }
  }
  .project_content {
    .input_text {
      display: flex;
      flex-direction: row;
      align-items: center;
      label {
        min-width: 140px;
        font-weight: 500;
        font-size: 16px;
        padding-bottom: 6px;
        padding-right: 16px;
      }
    }
    .flex-col {
      display: flex;
      min-height: unset !important;
      padding-bottom: 16px;;
    }
    .type-project {
      display: flex;
      width: 100%;
      .item-type {
        background-color: #215B32;
        padding: 16px;
        color: #fff;
        font-weight: 700;
        border-radius: 4px;
        height: fit-content;
        margin-right: 16px;
      }
      .type-selected {
        background-color: #63b666;
        color: #053314;
      }
    }
    .flex-col {
      display: flex;
      min-height: 100px;
    }
    .dx-datagrid-header-panel {
      .dx-toolbar {
        // width: fit-content !important;
      }
    }
  }

  .RCBD-layout {
    display: flex !important;
    flex-direction: row !important;
  }
  .RCD-layout {
    display: flex !important;
    flex-direction: column !important;
  }

  .dx-datagrid {
    height: 100%;
    .dx-link {
      color: #000;
      &:hover{
        color: #358638;
      }
    }
    .dx-datagrid-content .dx-datagrid-table .dx-row > td:not(.dx-validation-pending):not(.dx-datagrid-select-all).dx-command-edit.dx-command-edit-with-icons .dx-link {
      &:hover{
          color: #358638;
        }
    }
    .dx-datagrid-headers .dx-datagrid-table .dx-row > td {
      border-bottom: none;
    }
    .dx-data-row  {
      background-color: #fff !important;
    }
  }

  .dx-numberbox {
    width: 100px;
    .dx-texteditor-input {
      background-color: #f0f0f0;
    }
  }

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
      align-items: normal;
      .RCD-layout-item {
        width: min-content;
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
</style>
<template>
  <dx-popup
    class="input-batch-popup"
    :visible.sync="isPopupInputBatchVisible"
    :showCloseButton="true"
    @hidden="onPopupHidden"
    title="Edit Project Date"
    width="700px"
    height="auto"
    minHeight="700px"
  >
    <div class="time-project">
      <div class="input_text fl-3 pb-16">
        <label for="start_date">Start Date</label>
        <dx-date-box 
          v-model="project.start_date" 
          placeholder="Start Date" 
          :disabled="true"
          displayFormat="dd/MM/yyyy"
        />
      </div>
      <div class="input_text fl-3">
        <label for="to_date">To Date</label>
        <dx-date-box 
          v-model="project.end_date" 
          placeholder="End Date"
          :disabled="!isEditable"
          displayFormat="dd/MM/yyyy"
        />
          <!-- <dx-validator>
            <dx-validation-rule 
              type="custom" 
              :validationCallback="validateEndDate" 
              message="End date cannot be earlier than start date."
            />
          </dx-validator>
        </dx-date-box> -->
      </div>
    </div>
    <dx-data-grid
      :data-source="inputBatchList"
      :columns="columnsInputBatch"
      :editing="editingOptionsInputBatch"
      @initNewRow="onInitNewRow"
      @rowValidating="onRowValidatingInputBatch"
    >
      <!-- <template #orderCellTemplate="{ data }">
        <div>{{ inputBatchList.indexOf(data) + 1 }}</div>
      </template>

      <template #dateCellTemplate="{ data }">
        <dx-date-box
          :value="data.start_date"
          type="range"
          displayFormat="dd/MM/yyyy"
          class="custom-date-box"
        />
      </template> -->
    </dx-data-grid>
    <div class="footer">
      <dx-button
        text="Cancel"
        class="btn-cancel mr-16"
        @click="onPopupHidden"
      />
      <dx-button
        text="Save"
        class="btn-save"
        :disabled="!isEditable"
        @click="saveInputBatch"
      />
    </div>
  </dx-popup>
</template>

<script setup>
import { ref, inject, onBeforeMount } from 'vue';
import DxDataGrid from 'devextreme-vue/data-grid';
import DxPopup from 'devextreme-vue/popup';
import DxButton from 'devextreme-vue/button';
import DxDateBox from 'devextreme-vue/date-box';
import DxCheckBox from 'devextreme-vue/check-box';
import { DxValidationRule, DxValidator } from 'devextreme-vue/validator';
import { useProjectMonitorStore } from '../store/monitor-project';

const projectMonitorStore = useProjectMonitorStore();
const isPopupInputBatchVisible = inject('projectDataMonitor').isPopupInputBatchVisible;
const updateInputBatchList = inject('projectDataMonitor').updateInputBatchList;

const project = ref({});
const columnsInputBatch = [
      {
        dataField: 'order',
        caption: 'Order',
        allowSorting: false,
        allowEditing: false,
        width: 100,
        calculateCellValue: function(rowData) {
          if(rowData.order != null && rowData.order != undefined) return "Batch " + rowData.order;
          return null;
        }
      },
      {
        dataField: 'start_date',
        caption: 'Start Date',
        allowSorting: false,
        width: 200,
      },
      {
        dataField: 'end_date',
        caption: 'End Date',
        allowSorting: false,
        width: 200,
      },
    ];

const editingOptionsInputBatch = ref({
  mode: 'row',
  allowUpdating: true,
  allowAdding: true,
  allowDeleting: true,
  confirmDelete: false
});

const inputBatchList = ref([]);
const isEditable = ref(false);

onBeforeMount( async () => {
  project.value = projectMonitorStore.project;
  inputBatchList.value = projectMonitorStore.inputBatchList;
  isEditable.value = projectMonitorStore.isEditable;
  editingOptionsInputBatch.value = {
    mode: 'row',
    allowUpdating: isEditable.value,
    allowDeleting: isEditable.value,
    allowAdding: isEditable.value,
    confirmDelete: false
  };
});

const onPopupHidden = async () => {
  isPopupInputBatchVisible.value = false;
  await projectMonitorStore.getInputBatchByProjectId();
  projectMonitorStore.end_date = projectMonitorStore.project.end_date;
};

const saveInputBatch = async () => {
  await projectMonitorStore.saveInputBatch();
  updateInputBatchList();
  // await projectMonitorStore.getInputBatchByProjectId();
  isPopupInputBatchVisible.value = false;
};

const onInitNewRow = (e) => {
  e.data.order = inputBatchList.value.length + 1;
  e.data.start_date = new Date();
  e.data.end_date = new Date();
};

// const validateEndDate = (e) => {
//   if(enabledEndDate.value && e.value < project.start_date) {
//     e.rule.isValid = false;
//     e.rule.message = "End date cannot be earlier than start date.";
//   } else {
//     e.rule.isValid = true;
//   }
// };

const onRowValidatingInputBatch = (e) => {
  let startDate = e.newData.start_date ? e.newData.start_date : e.oldData.start_date;
  let endDate = e.newData.end_date ? e.newData.end_date : e.oldData.end_date;
  if(startDate == null || startDate == undefined) {
    e.errorText = "Start Date is required";
    e.isValid = false;
  }
  if(endDate == null || endDate == undefined) {
    e.errorText = "End Date is required";
    e.isValid = false;
  }
  if(startDate != null && startDate != undefined && endDate != null && endDate != undefined && startDate > endDate) {
    e.errorText = "End Date must be greater than Start Date";
    e.isValid = false;
  }
  if(startDate != null && startDate != undefined && startDate < projectMonitorStore.project.start_date) {
    e.errorText = "Start Date must be greater than Project Start Date";
    e.isValid = false;
  }
};

</script>

<style lang="scss">
.pb-16 {
  padding-bottom: 16px;
}
.input-batch-popup {
  display: flex;
  flex-direction: column;

  .footer {
    position: absolute;
    right: 16px;
  }
}

.dx-popup-flex-height {
  .dx-popup-content {
    .time-project {
      .input_text {
        display: flex;
        flex-direction: row;
        align-items: center;
        label {
          min-width: 100px;
          padding-right: 16px;
        }
      }
    }
    .footer {
      position: absolute;
      right: 24px;
      bottom: 24px;
    }
  }
  .btn-save {
    background-color: #215B32;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 16px;
    border-radius: 5px;
    cursor: pointer;
  }

  .btn-save:hover {
    background-color: #297e43;
  }
}
.dx-link-icon{
  color: #000;
  &:hover {
    color: #358638;
  }
}
.dx-datagrid {
  .dx-datagrid-rowsview {
    .dx-texteditor-input {
      background-color: #f0f0f0;
      color: #333;
      padding: 8px;
      
      &.dx-state-disabled {
        background-color: #e9ecef;
        color: #6c757d;
        border-color: #ced4da;
      }
    }

    .dx-placeholder {
      color: #999;
      font-style: italic;
    }
  }
  .dx-toolbar {
    .dx-toolbar-items-container {
      background-color: #fff;
    }
    .dx-toolbar-after {
      left: -30px;
      top: 0;
    }
    .dx-button-content{
      border: 1px solid #000;
      border-radius: 50%
    }
  }
  .dx-row.dx-header-row {
    background-color: #fff !important;
    color: #000;
    .dx-datagrid-text-content{
      font-size: 16px;
    }
    .dx-cell-focus-disabled {
      background-color: #fff !important;
    }
  }
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

.dx-datebox {
  width: 100%;
  
  .dx-texteditor-input {
    background-color: #f0f0f0;
    color: #333;
    padding: 10px;
  }

  .dx-texteditor.dx-state-disabled .dx-texteditor-input {
    background-color: #e9ecef;
    color: #6c757d;
    border-color: #ced4da;
  }

  .dx-placeholder {
    color: #999;
    font-style: italic;
  }

  .dx-dropdowneditor-button {
    color: #fff;
  }

  .dx-dropdowneditor-button .dx-icon {
    color: #fff;
  }
}
</style>
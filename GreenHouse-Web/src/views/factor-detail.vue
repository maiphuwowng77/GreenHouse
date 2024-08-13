<template>
  <div class="factor_detail">
    <div class="header">
      <div class="left_header">
        <h2 class="title_project">{{ projectTitleName }}</h2>
      </div>
    </div>
    <hr style="height:1px;border-width:0;color:gray;background-color:gray">
    <div class="project_content">
      <div class="flex-col">
        <div class="input_text fl-10">
          <label for="project_code">Factor *</label>
          <dx-data-grid
            :data-source="factorList"
            :columns="columnsFactor"
            :editing="editingOptionsFactor"
            @rowValidating="onRowValidatingFactor"
          />
        </div>
      </div>

      <div class="flex-col">
        <div class="input_text fl-10 level">
          <label for="members">Level *</label>
          <dx-data-grid
            :data-source="levelList"
            :columns="columnsLevel"
            :editing="editingOptionsLevel"
            @rowValidating="onRowValidatingLevel"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, watch, inject } from 'vue';
import DxDataGrid from 'devextreme-vue/data-grid';
import { useProjectDetailStore } from '../store/projects-detail';
import { ModelState } from '../enum/enum';

const columnsFactor = ref([
  {
    dataField: 'factor_code',
    caption: 'Factor Code',
    allowSorting: false,
    width: 200,
  },
  {
    dataField: 'factor_name',
    caption: 'Factor Name',
    allowSorting: false,
  }
]);

const editingOptionsFactor = ref({
  mode: 'row',
  allowUpdating: true,
  // allowAdding: true,
  confirmDelete: false
});

const editingOptionsLevel = ref({
  mode: 'row',
  allowUpdating: true,
  allowAdding: true,
  allowDeleting: true,
  confirmDelete: false
});

const columnsLevel = ref([
  {
    dataField: 'level_code',
    caption: 'Level Code',
    allowSorting: false,
    width: 200,
  },
  {
    dataField: 'level_name',
    caption: 'Level Name',
    allowSorting: false,
  }
]);

const projectDetailStore = useProjectDetailStore();

// data
const factorList = ref([{
  factor_code: null,
  factor_name: null
}]);
const levelList = ref([]);
const isEditable = ref([]);
const projectTitleName = ref([]);
const isNext = inject('projectDataDetail').isNext;


watch(() => [factorList, levelList], ([newValFactor, newValLevel]) => {
  if(newValFactor.value.every(x => x.factor_code == null || x.factor_name == null || x.factor_code == "" || x.factor_name == "")) {
    isNext.value = false;
    return;
  } else {
    isNext.value = true;
  }

  if(newValLevel.value.every(x => x.level_code == null || x.level_name == null || x.level_code == "" || x.level_name== "")) {
    isNext.value = false;
    return;
  } else {
    isNext.value = true;
  }
}, {
  deep: true
});

onBeforeMount( async () => {
  switch (projectDetailStore.mode) {
    case ModelState.Add:
      if(projectDetailStore.factorList == null || projectDetailStore.factorList.length === 0) {
        projectDetailStore.factorList = factorList.value;
      }
      if(projectDetailStore.levelList == null || projectDetailStore.levelList.length === 0) {
        projectDetailStore.levelList = [];
      }
      isEditable.value = true;
      isNext.value = false;
      break;
    case ModelState.Edit:
      if(projectDetailStore.factorList == null || projectDetailStore.factorList.length === 0 ||
        projectDetailStore.levelList == null || projectDetailStore.levelList.length === 0
      ) {
        await projectDetailStore.getFactorLevelByProjectId();
        isEditable.value = projectDetailStore.isEditable;
      }
      
      isEditable.value = projectDetailStore.isEditable;
      break;
    case ModelState.View:
      await projectDetailStore.getFactorLevelByProjectId();
      isEditable.value = false;
      break;
    default:
      break;
  }
  
  projectTitleName.value = projectDetailStore.mode === ModelState.Add ? 'Create New Project' : projectDetailStore.project.project_name;
  factorList.value = projectDetailStore.factorList;
  levelList.value = projectDetailStore.levelList;
  
  editingOptionsFactor.value = {
    mode: 'row',
    allowUpdating: isEditable.value,
    allowDeleting: false,
    allowAdding: false,
  };
  editingOptionsLevel.value = {
    mode: 'row',
    allowUpdating: isEditable.value,
    allowDeleting: isEditable.value,
    allowAdding: isEditable.value,
    confirmDelete: false
  };
});


const onRowValidatingLevel = (e) => {
  let checkedLevelCodes = levelList.value.map(x => x.level_code);
  if (checkedLevelCodes.includes(e.newData.level_code)) {
    e.errorText = "Level code must be unique";
    e.isValid = false;
  }
};


const onRowValidatingFactor = (e) => {
  let errorText = '';
  let newDataFactor =  {
    factor_code: (e.newData.factor_code != null && e.newData.factor_code != undefined) ? e.newData.factor_code : e.oldData.factor_code,
    factor_name: (e.newData.factor_name != null && e.newData.factor_name != undefined) ? e.newData.factor_name : e.oldData.factor_name,
  }

  if (newDataFactor.factor_code === '' || newDataFactor.factor_code === undefined || newDataFactor.factor_code === null) {
    errorText += "Factor code is required. ";
  }

  if (newDataFactor.factor_name === '' || newDataFactor.factor_name === undefined || newDataFactor.factor_name === null) {
    errorText += "Factor name is required. ";
  }

  if (errorText !== '') {
    e.errorText = errorText;
    e.isValid = false;
  }
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
.factor_detail {
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
    .flex-col {
      display: flex;
      min-height: 100px;
    }
    .dx-datagrid-header-panel {
      height: 12px;
      padding: 0;
      .dx-toolbar {
        .dx-toolbar-items-container {
          background-color: #fff;
        }
        .dx-toolbar-after {
          left: 60px;
          top: -45px;
          padding-inline-start: 0;
        }
        .dx-button-content{
          border: 1px solid #000;
          border-radius: 50%
        }
      }
    }
  }
  .dx-link-icon{
    color: #000;
    &:hover {
      color: #358638;
    }
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
    .dx-datagrid-rowsview .dx-row {
      border-bottom: none !important;
    }
  }
  .dx-datagrid{
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
  } 
}
</style>
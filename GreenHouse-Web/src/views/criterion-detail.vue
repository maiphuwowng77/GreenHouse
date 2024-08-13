<template>
  <div class="criterion_detail">
    <div class="header">
      <div class="left_header">
        <h2 class="title_project">{{ projectTitleName }}</h2>
      </div>
    </div>
    <hr style="height:1px;border-width:0;color:gray;background-color:gray">
    <div class="project_content">
      <div class="flex-col">
        <div class="input_text fl-10">
          <label for="members">Treatment</label>
          <dx-data-grid
            :data-source="treatmentList"
            :columns="columnsTreatment"
            :editing="editingOptionsTreatment"
          />
        </div>
      </div>
      <div class="flex-col">
        <div class="input_text fl-10 criterion">
          <label for="members">Criterion *</label>
          <dx-data-grid
            :data-source="criterionList"
            :columns="columnsCriterion"
            :editing="editingOptionsCriterion"
            @rowValidating="onRowValidatingCriterion"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, inject, watch } from 'vue';
import DxDataGrid from 'devextreme-vue/data-grid';
import { useProjectDetailStore } from '../store/projects-detail';
import { ModelState } from '../enum/enum';
import { ObjectId } from 'bson';

const editingOptionsCriterion = ref({
  mode: 'row',
  allowUpdating: true,
  allowAdding: true,
  allowDeleting: true,
  confirmDelete: false
});

const columnsCriterion = ref([
  {
    dataField: 'criterion_code',
    caption: 'Criterion Code',
    allowSorting: false,
    width: 200,
  },
  {
    dataField: 'criterion_name',
    caption: 'Criterion Name',
    allowSorting: false,
  }
]);

const editingOptionsTreatment = ref({
  mode: 'row',
  allowUpdating: false,
  allowAdding: false,
  allowDeleting: false,
  confirmDelete: false
});

const columnsTreatment = ref([
  {
    dataField: 'treatment_code',
    caption: 'Treatment Code',
    allowSorting: false,
    width: 200,
  },
  {
    dataField: 'treatment_name',
    caption: 'Treatment Name',
    allowSorting: false,
  }
]);

const projectDetailStore = useProjectDetailStore();

// data
const criterionList = ref([]);
const treatmentList = ref([]);
const isEditable = ref([]);
const projectTitleName = ref([]);
const isNext = inject('projectDataDetail').isNext;

watch(() => criterionList, (newVal, oldVal) => {
  if(criterionList.value.every(x => x.criterion_code == null || x.criterion_name == null || x.criterion_code == "" || x.criterion_name == "")) {
    isNext.value = false;
  } else {
    isNext.value = true;
  }
}, {
  deep: true
});

onBeforeMount( async () => {
  switch (projectDetailStore.mode) {
    case ModelState.Add:
      generateTreatment();
      isEditable.value = true;
      isNext.value = false;
      break;
    case ModelState.Edit:
    if(projectDetailStore.treatmentList == null || projectDetailStore.treatmentList.length === 0 ||
        projectDetailStore.criterionList == null || projectDetailStore.criterionList.length === 0
      ) {
        await projectDetailStore.getTreatmentByProjectId();
        await projectDetailStore.getCriterionByProjectId();
      }
      generateTreatment();
      isEditable.value = projectDetailStore.isEditable;
      break;
    case ModelState.View:
      await projectDetailStore.getTreatmentByProjectId();
      await projectDetailStore.getCriterionByProjectId();
      isEditable.value = false;
      break;
    default:
      break;
  }
  projectTitleName.value = projectDetailStore.mode === ModelState.Add ? 'Create New Project' : projectDetailStore.project.project_name;
  criterionList.value = projectDetailStore.criterionList;
  treatmentList.value = projectDetailStore.treatmentList;
  editingOptionsCriterion.value = {
    mode: 'row',
    allowUpdating: isEditable.value,
    allowDeleting: isEditable.value,
    allowAdding: isEditable.value,
    confirmDelete: false
  };
});

const generateTreatment = () => {
  var factorData = projectDetailStore.factorList;
  var levelData = projectDetailStore.levelList;
  factorData = factorData.map(factor => {
    return {
      _id: new ObjectId().toString(),
      factor_code: factor.factor_code,
      factor_name: factor.factor_name,
      project_id: projectDetailStore.projectId,
      project_code: projectDetailStore.project.project_code,
    };
  });
  levelData = levelData.map(level => {
    return {
      _id: new ObjectId().toString(),
      level_code: level.level_code,
      level_name: level.level_name,
      factor_id: factorData[0].factor_id,
      factor_code: factorData[0].factor_code,
    };
  });

  var treatmentData = levelData.map(level => {
    return {
      _id: new ObjectId().toString(),
      treatment_code: level.level_code,
      treatment_name: level.level_name,
      project_id: projectDetailStore.projectId,
      project_code: projectDetailStore.project.project_code,
      components: {
        factor_id: factorData[0]._id,
        factor_code: factorData[0].factor_code,
        factor_name: factorData[0].factor_name,
        level_id: level._id,
        level_code: level.level_code,
        level_name: level.level_name,
      }
    };
  });

  projectDetailStore.factorList = factorData;
  projectDetailStore.levelList = levelData;
  projectDetailStore.treatmentList = treatmentData;
};

const onRowValidatingCriterion = (e) => {
  let checkedCriterionCodes = criterionList.value.map(x => x.criterion_code);
  if (checkedCriterionCodes.includes(e.newData.criterion_code)) {
    e.errorText = "Criterion code must be unique";
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
.criterion {
  margin-top: 20px;
}
.criterion_detail {
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
          left: 85px;
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
}
</style>
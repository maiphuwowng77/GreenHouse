<template>
  <div class="project_summary">
    <div class="header">
      <div class="left_header">
        <h2 class="title_project">
          {{ projectTitleName }}
        </h2>
      </div>
    </div>
    <hr style="height:1px;border-width:0;color:gray;background-color:gray">
    <div class="project_content">
      <div class="flex-col">
        <div class="input_text fl-5 mr-16">
          <label for="project_code">Project Code *</label>
          <dx-text-box
            ref="projectCode"
            v-model="project.project_code" 
            placeholder="Project Code" 
            :disabled="!isEditable"
            :isValid="isValid"
            :validationError="validationError"
            @input="onInputProjectCode"
          >
            <dx-validator :validate-mode="onBlur">
              <dx-required-rule message="Project code is required" />
            </dx-validator>
          </dx-text-box>
        </div>
      </div>

      <div class="flex-col">
        <div class="input_text fl-10">
          <label for="project_name">Project Name *</label>
          <dx-text-box 
            ref="projectName"
            v-model="project.project_name" 
            placeholder="Project Name" 
            :disabled="!isEditable"
          >
            <dx-validator>
              <dx-required-rule message="Project name is required" />
            </dx-validator>
          </dx-text-box>
        </div>
      </div>

      <div class="flex-col">
        <div class="input_text fl-10">
          <label for="description">Description</label>
          <dx-text-box v-model="project.description" placeholder="Description" :disabled="!isEditable" />
        </div>
      </div>

      <div class="flex-col">
        <div class="input_text fl-3 mr-16">
          <label for="type_experiment">Type of Experiment *</label>
          <dx-select-box
            ref="typeExperiment"
            v-model="project.type_experiment"
            :dataSource="experimentTypes"
            displayExpr="name"
            valueExpr="_id"
            placeholder="Type of Experiment"
            :searchEnabled="true"
            :acceptCustomValue="true"
            :disabled="!isEditable"
          >
            <dx-validator>
              <dx-required-rule message="Type experiment is required" />
            </dx-validator>
          </dx-select-box>
        </div>
        <div class="input_text fl-3 mr-16">
          <label for="start_date">Start Date</label>
          <dx-date-box 
            v-model="project.start_date" 
            placeholder="Start Date" 
            displayFormat="dd/MM/yyyy"
            :disabled="!isEditable"
          />
        </div>
        <div class="input_text fl-3">
          <label for="to_date">To Date</label>
          <dx-date-box v-model="project.end_date" displayFormat="dd/MM/yyyy" placeholder="End Date" :disabled="!isEditable"/>
        </div>
      </div>

      <div class="flex-col">
        <div class="input_text fl-10">
          <label for="members">Members *</label>
          <dx-data-grid
            ref="userProjectGrid"
            :dataSource="userProject"
            :columns="columns"
            :editing="editingOptions"
            :showColumnHeaders="false"
            @editingStart="onEditorStart"
            @rowValidating="onRowValidating"
            @rowRemoving="onRowRemoving"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, ref, onBeforeMount, watch, onMounted } from 'vue';
import DxTextBox from 'devextreme-vue/text-box';
import DxDateBox from 'devextreme-vue/date-box';
import DxSelectBox from 'devextreme-vue/select-box';
import DxDataGrid from 'devextreme-vue/data-grid';
import notify from 'devextreme/ui/notify';
import { TypeExperiment, RoleProject, ModelState } from '../enum/enum';
import { useProjectDetailStore } from '../store/projects-detail';
import { useRoute, useRouter } from 'vue-router';
import authApi from '../api/auth';
import DxValidator, {
    DxRequiredRule,
} from 'devextreme-vue/validator';
import { ObjectId } from 'bson';

const projectDetailStore = useProjectDetailStore();
const route = useRoute();

const columns = ref([]);

const editingOptions = ref({
  mode: 'row',
  allowUpdating: true,
  allowDeleting: true,
  allowAdding: true,
  confirmDelete: false
});

const experimentTypes = ref(Object.keys(TypeExperiment).map(key => ({
  _id: TypeExperiment[key],
  name: key
})));

// data chung
const project = ref({
  project_code: null,
  project_name: null,
  description: null,
  type_experiment: TypeExperiment.RCBD,
  start_date: new Date(),
  end_date: new Date(new Date().setDate(new Date().getDate() + 15 * 7))
});
const projectTitleName = ref([]);
const userProject = ref([]);
const isEditable = ref([]);
const projectId = inject('projectDataDetail').projectId;
const isNext = inject('projectDataDetail').isNext;

const isValid = ref(true);
const validationError = ref(null);

watch(() => project, (newVal, oldVal) => {
  if(newVal.value.project_code == null || newVal.value.project_code == "" ||
    newVal.value.project_name == null || newVal.value.project_name == "" ||
    newVal.value.type_experiment == null) {
    isNext.value = false;
  } else {
    isNext.value = true;
  }
  if(newVal.value.type_experiment == TypeExperiment.RCBD) {
    projectDetailStore.typeExperiment == 1;
  } else {
    projectDetailStore.typeExperiment == 0;
  }
}, {
  deep: true
});

onBeforeMount( async () => {
  switch (projectDetailStore.mode) {
    case ModelState.Add:
      if(projectDetailStore.members == null || projectDetailStore.members.length === 0) {
        let dataMember = await authApi.getAllUser();
        projectDetailStore.members = dataMember.map(x => ({
          _id: x._id,
          email: x.email,
          full_name: x.full_name,
          role: x.role,
          name_email: `${x.full_name} (${x.email})`
        }));
      }
      project.value.project_code = await projectDetailStore.generateCode();
      project.typeExperiment = TypeExperiment.RCBD;
      projectDetailStore.project = projectDetailStore.project ? projectDetailStore.project : project.value;
      if(projectDetailStore.userProject == null ||projectDetailStore.userProject.length === 0) {
        let userLogin = JSON.parse(localStorage.getItem('user'));
        userProject.value.push({
          user_id: userLogin._id,
          email: userLogin.email,
          full_name: userLogin.full_name,
          role: RoleProject.Owner,
          name_email: `${userLogin.full_name} (${userLogin.email})`
        });
        projectDetailStore.userProject = userProject.value;
      } else {
        userProject.value = projectDetailStore.userProject;
      }
      isEditable.value = true;
      isNext.value = false;
      break;
    case ModelState.Edit:
      if(projectDetailStore.project == null || projectDetailStore.project.length === 0) {
        await projectDetailStore.getById(projectId);
      }
      
      isEditable.value = projectDetailStore.isEditable;
      break;
    case ModelState.View:
      await projectDetailStore.getById(projectId);
      isEditable.value = false;
      break;
    default:
      break;
  }
  projectTitleName.value = projectDetailStore.mode === ModelState.Add ? 'Create New Project' : projectDetailStore.project.project_name;
  project.value = projectDetailStore.project;
  userProject.value = projectDetailStore.userProject;
  columns.value = [
    {
      dataField: 'user_id',
      caption: 'Member',
      allowSorting: false,
      lookup: {
        dataSource: projectDetailStore.members,
        displayExpr: 'name_email',
        valueExpr: '_id'
      }
    },
    {
      dataField: 'role',
      caption: 'Role',
      allowSorting: false,
      lookup: {
        dataSource: Object.entries(RoleProject).map(([key, value]) => ({ _id: value, role: key })),
        displayExpr: 'role',
        valueExpr: '_id'
      }
    }
  ];
  editingOptions.value = {
    mode: 'row',
    allowUpdating: isEditable.value,
    allowDeleting: isEditable.value,
    allowAdding: isEditable.value,
    confirmDelete: false
  };
});

const onEditorStart = (e) => {
  if (e.component.getRowIndexByKey(e.key) === 0) {
    e.cancel = true;
    notify({
      message: "Not allowed to edit owner of project",
      position: {
        my: "right top",
        at: "right top",
        offset: "0 60"
      },
      width: "auto",
      type: "warning",
      displayTime: 1500
    });
  }
};

const onRowRemoving = (e) => {
  if (e.component.getRowIndexByKey(e.key) === 0) {
    e.cancel = true;
    notify({
      message: "Not allowed to delete owner of project",
      position: {
        my: "right top",
        at: "right top",
        offset: "0 60"
      },
      width: "auto",
      type: "warning",
      displayTime: 1500
    });
  }
};

const onRowValidating = (e) => {
  const memberValues = userProject.value.map(item => item.user_id);
  const duplicateCount = memberValues.filter(value => value === e.newData.user_id).length;

  if (duplicateCount >= 1) {
    e.errorText = "The user has been authorized";
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
.level{
  margin-top: 20px;
}
.project_summary {
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
  .dx-datagrid > .dx-datagrid-rowsview {
    width: 935px;
    @media screen and (max-width:1000px) {
      width: 100%;
    }
  }
  .project_content {
    .flex-col {
      display: flex;
      min-height: 100px;
    }
    .dx-datagrid-header-panel {
      height: 12px;
      .dx-toolbar {
        // width: fit-content !important;
      }
    }
  }
  .dx-texteditor.dx-editor-filled::after {
    border-bottom: none;
  }
  .dx-texteditor.dx-state-focused::before {
    border-bottom: none
  }
  .dx-texteditor-container .dx-texteditor-input-container {
      background-color: #EEEEEE !important;
  }
  .dx-state-focused{
    border: 1px solid #358638 !important;
    border-radius: 4px;
  }
  .dx-texteditor-container{
    &:focus {
      border: 1px solid #358638 !important;
    }
  
  }
  .dx-toolbar {
    .dx-toolbar-items-container {
      background-color: #fff;
    }
    .dx-toolbar-after {
      left: 54px !important;
      top: -45px !important;
    }
    .dx-button-content{
      border: 1px solid #000;
      border-radius: 50%
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
  }
}
</style>
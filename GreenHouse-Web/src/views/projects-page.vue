<template>
  <div class="project-page">
    <div class="header">
      <h2 class="content-block">Project</h2>
      <dx-button class="add-project-button" text="Add Project" @click="addNewProject" />
    </div>

    <div class="content-project">
      <dx-data-grid
        ref="dataGridRef"
        class="dx-card wide-card"
        :data-source="projectList"
        key-expr="_id"
        :focused-row-index="0"
        :show-borders="false"
        :focused-row-enabled="true"
        :column-auto-width="true"
        :column-hiding-enabled="false"
        :paging="{ enabled: true }"
        @optionChanged="handleOptionChanged"
      >
        <dx-paging :page-size="10" />
        <dx-pager :show-page-size-selector="true" :show-info="true" :always-show-pager="true" :visible="true" />
        <dx-search-panel :visible="true" />

        <dx-column
          data-field="project_code"
          caption="Project Code"
          :width="150"
        />

        <dx-column
          data-field="project_name"
          caption="Project Name"
          width="100%"
        />

        <dx-column
          data-field="owner"
          caption="Owner"
          :width="180"
          :calculate-cell-value="data => data.owner_name"
        />

        <dx-column
          type="buttons"
          :width="120"
          :visible="true"
          :buttons="[
            // {
            //   text: 'Statistics',
            //   icon: 'chart',
            //   onClick: navigateToChart
            // },
            {
              text: 'Monitor',
              icon: 'find',
              onClick: navigateToProjectMonitor
            },
            {
              text: 'Edit',
              icon: 'edit',
              onClick: editProject
            },
            {
              text: 'Delete',
              icon: 'trash',
              onClick: deleteProject,
            }
          ]"
        />
      </dx-data-grid>
    </div>
    <delete-project-confirm-popup v-if="isPopupDeleteProjectVisible" />
  </div>
</template>

<script setup>
import "devextreme/data/odata/store";
import DxDataGrid, {
  DxColumn,
  DxSearchPanel,
  DxPager,
  DxPaging,
} from "devextreme-vue/data-grid";
import DxButton from "devextreme-vue/button";
import notify from 'devextreme/ui/notify';
import { useRoute, useRouter } from 'vue-router';
import { onBeforeMount, provide, ref, onMounted, getCurrentInstance } from 'vue';
import { useProjectStore } from '../store/projects-page';
import DeleteProjectConfirmPopup from './delete-project-confirm-popup';
import { ObjectId } from 'bson';
import { ModelState } from "@/enum/enum";

const proxy = getCurrentInstance();
const route = useRoute();
const router = useRouter();

const projectStore = useProjectStore();
const rowSelected = ref();
const isPopupDeleteProjectVisible = ref(false);
const projectList = ref([]);

onBeforeMount( async () => {
  await projectStore.getPagingProjects(1,10);
  projectList.value = projectStore.projectList;
});

const addNewProject = () => {
  const newObjectId = new ObjectId();
  router.push({name: 'project-detail', params: { id: newObjectId }, query: { mode: 0 } });
}

const navigateToProjectMonitor = (data) => {
  router.push({name: 'project-monitor', params: { id: data.row.data._id }, query: { mode: 0 } });
}

const handleOptionChanged = async (e) => {
  if (e.fullName === 'paging.pageIndex') {
    projectStore.currentPage = e.value + 1;
    await projectStore.getPagingProjects(projectStore.currentPage, projectStore.limit);
  } else if (e.fullName === 'paging.pageSize') {
    projectStore.limit = e.value;
    await projectStore.getPagingProjects(projectStore.currentPage, projectStore.limit);
  }
  
}

const editProject = (data) => {
  router.push({ name: 'project-detail', params: { id: data.row.data._id }, query: { mode: 1 } });
}

const deleteProject = async (data) => {
  rowSelected.value = data.row.data;
  let user = JSON.parse(localStorage.getItem('user'));
  if(rowSelected.value.owner !== user._id) {
    notify({
      message: "Not allowed delete project",
      position: {
        my: "right top",
        at: "right top",
        offset: "0 60"
      },
      width: "auto",
      type: "error",
      displayTime: 1500
    });
    return;
  } else {
    isPopupDeleteProjectVisible.value = true;
  }
}

const refreshGrid = async () => {
  await projectStore.getPagingProjects(1,10);
  projectList.value = projectStore.projectList;
  proxy.refs.dataGridRef.instance.getDataSource().reload();
};

provide('projectListData', {
  rowSelected,
  isPopupDeleteProjectVisible,
  refreshGrid
});
</script>

<style lang="scss">
.project-page {
  .content-project {
    padding-left: 20px;
    padding-right: 20px;
    height: calc(100% - 100px);
  }  
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 20px;
    min-height: 100px;
  }

  .add-project-button .dx-button-content {
    background-color: #085321;
    color: white;
    padding: 15px 32px;
  }

  .dx-datagrid {
    height: 100%;
    overflow-y: auto;
    .dx-datagrid-header-panel {
      padding: 0;
      border-bottom: none;
      .dx-toolbar{
        .dx-toolbar-items-container {
          background-color: #fff;
          .dx-toolbar-after {
            min-width: 350px;
            left: 0 !important;
            padding-inline-start: 0;
            .dx-datagrid-search-panel {
              width: 100% !important;
              margin: 0;
              input {
                border-radius: 4px;
                &:focus {
                  border: 1px solid #358638 !important;
                }
              }
            }
          }
        }
      }
    }
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
    .dx-row.dx-header-row .dx-cell-focus-disabled{
      background-color: #fff !important;
      font-weight: bold;
      color: #000;
      font-size: 16px;
    }

    .dx-datagrid-headers .dx-datagrid-table .dx-row > td {
      border-bottom: none;
    }

    .dx-data-row  {
      background-color: #fff !important;
    }
    
  }

  .dx-card {
      box-shadow: none !important;
  }
  .dx-pager{
    // border: 1px solid #eae3e3;
    box-shadow: 0 1px 3px rgba(0,0,0,.12), 0 1px 2px rgba(0,0,0,.24);
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

  .dx-datagrid-rowsview .dx-row-focused.dx-data-row > td:not(.dx-focused):not(.dx-cell-modified):not(.dx-datagrid-invalid) {
    background-color: #ffffff;
  }
  .dx-datagrid-rowsview .dx-row-focused.dx-data-row .dx-command-edit .dx-link {
      background-color: #fff;
      color: rgba(0, 0, 0, .87);
  }


}
</style>

<template>
  <dx-popup
    :visible.sync="isPopupDeleteProjectVisible"
    :show-close-button="true"
    width="700px"
    height="auto"
    min-height="180px"
    class="delete-project-popup"
    @hidden="onPopupHidden"
  >
    <div class="info-plot">
      <div class="title">
        {{ title }}
      </div>
    </div>
    <div class="footer">
      <dx-button
        text="No"
        class="btn-cancel mr-16"
        @click="onPopupHidden"
      />
      <dx-button
        text="Yes"
        class="btn-save"
        @click="deleteProject"
      />
    </div>
  </dx-popup>
</template>

<script setup>
import { inject, onBeforeMount, ref } from 'vue';
import DxButton from 'devextreme-vue/button';
import DxPopup from 'devextreme-vue/popup';
import { useProjectStore } from '../store/projects-page';
import projectDetailApi from '../api/projectDetail';
import projectDetail from '../api/projectDetail';

const projectStore = useProjectStore();
const title = ref('');

const isPopupDeleteProjectVisible = inject('projectListData').isPopupDeleteProjectVisible;
const rowSelected = inject('projectListData').rowSelected;
const refreshGrid = inject('projectListData').refreshGrid;

const onPopupHidden = () => {
  isPopupDeleteProjectVisible.value = false;
};

const deleteProject = async () => {
  await projectStore.deleteProject(rowSelected.value._id);
  isPopupDeleteProjectVisible.value = false;
  refreshGrid();
};

onBeforeMount( async () => {
  let hasDataDetail = await projectDetailApi.checkDeleteProject(rowSelected.value._id);
  if(hasDataDetail) {
    title.value = 'This project has data detail. Are you sure you want to delete this project?';
  } else {
    title.value = 'Are you sure you want to delete this project?';
  }
});


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
.delete-project-popup {
  display: flex;
  flex-direction: column;
}

.dx-popup-flex-height {
  .dx-popup-content {
    .info-plot {
      .title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 10px;
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
</style>
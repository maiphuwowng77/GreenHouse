<template>
  <div class="project_detail">
    <project-summary v-if="currentStep == 0" />
    <factor-detail v-if="currentStep == 1" />
    <criterion-detail v-if="currentStep == 2" />
    <layout-detail v-if="currentStep == 3" />
    <div class="footer">
      <div class="right">
        <dx-button
          text="Create"
          class="btn-save mr-16"
          @click="createProject"
          v-if="currentStep == 3 && modeView == 0"
        />
        <dx-button
          text="Save"
          class="btn-save mr-16"
          @click="editProject"
          v-if="currentStep == 3 && modeView == 1 && isEditable"
        />
        <dx-button
          text="Close"
          class="btn-close mr-16 ml-16"
          @click="closeProject"
        />
        <dx-button
          icon="arrowright"
          class="btn-icon"
          @click="onNextFactor"
          v-if="currentStep != 3"
          :disabled="!isNext"
        />
      </div>
      <div class="left">
        <dx-button
          icon="arrowleft"
          class="btn-icon"
          @click="onPreviousFactor"
          v-if="currentStep != 0"
          />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, provide, onBeforeMount, onMounted } from 'vue';
import DxButton from 'devextreme-vue/button';
import FactorDetail from './factor-detail.vue';
import ProjectSummary from './project-summary.vue';
import CriterionDetail from './criterion-detail.vue';
import LayoutDetail from './layout-detail.vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectDetailStore } from '../store/projects-detail';
import { ModelState } from '@/enum/enum';


const steps = ref([
      { index: 0, name: 'summary'},
      { index: 1, name: 'factor-detail'},
      { index: 2, name: 'criterion-detail'},
      { index: 3, name: 'layout-detail'},
    ]);

const currentStep = ref(0);
const modeView = ref(0);
const isEditable = ref(true);

const route = useRoute();
const router = useRouter();
const projectDetailStore = useProjectDetailStore();
const isNext = ref(true);

onBeforeMount( async () => {
  projectDetailStore.$reset();
  modeView.value = projectDetailStore.mode;
  projectDetailStore.projectId = route.params.id;
  // mode = 0: add, mode = 1: edit,view
  if(route.query.mode == 0) {
    modeView.value = 0;
    projectDetailStore.mode = ModelState.Add;
    isEditable.value = true;
    projectDetailStore.isEditable = true;
  } else {
    modeView.value = 1;
    projectDetailStore.mode = ModelState.Edit;
    isEditable.value = await projectDetailStore.checkEditabled(projectDetailStore.projectId);
    projectDetailStore.isEditable = isEditable.value;
    console.log(isEditable.value);
  }
});

provide('projectDataDetail', {
  currentStep,
  projectId: route.params.id,
  isNext,
});

const onNextFactor = async () => {
  const currentIndex = currentStep.value;
  if (currentIndex < steps.value.length) {
    currentStep.value = currentStep.value + 1;
  }
};

const onPreviousFactor = () => {
  const currentIndex = currentStep.value;
  if (currentIndex > 0) {
    currentStep.value = currentStep.value - 1;
  }
};

const createProject = async () => {
  await projectDetailStore.createProject();
  router.push({ name: 'projects' });
};

const editProject = async () => {
  await projectDetailStore.editProject();
  router.push({ name: 'projects' });
};

const closeProject = async () => {
  router.push({ name: 'projects' });
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
.ml-16 {
  margin-left: 16px;
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
.project_detail {
  display: flex;
  flex-direction: column;
  .btn-save {
    background-color: #215B32;
    color: white;
    padding: 15px 32px;
  }

  .btn-save:hover {
    background-color: #297e43;
  }
  .footer {
    display: flex;
    flex-direction: column;
    position: absolute;
    bottom: 32px;
    right: 32px;
    display: flex;
    flex-direction: row-reverse;
    width: 100%;
    .left {
      position: absolute;
      left: 72px;
    }
    .btn-icon {
      border: 2px solid #000;
    }
  }
}
</style>
<template>
  <dx-popup
    :visible.sync="isPopupDeleteUserVisible"
    :show-close-button="true"
    width="700px"
    height="auto"
    min-height="200px"
    class="delete-user-popup"
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
        @click="deleteUser"
      />
    </div>
  </dx-popup>
</template>

<script setup>
import { inject, onBeforeMount, ref } from 'vue';
import DxButton from 'devextreme-vue/button';
import DxPopup from 'devextreme-vue/popup';
import { useUserStore } from '../store/user-page';

const userStore = useUserStore();
const title = ref('');

const isPopupDeleteUserVisible = inject('userPage').isPopupDeleteUserVisible;
const refreshGrid = inject('userPage').refreshGrid;

const onPopupHidden = () => {
  isPopupDeleteUserVisible.value = false;
};

const deleteUser = async () => {
  await userStore.deleteUser(userStore.userId);
  isPopupDeleteUserVisible.value = false;
  refreshGrid();
};

onBeforeMount( async () => {
  var full_name = userStore.userDetail.full_name;
  title.value = 'Are you sure you want to delete this user <<' + full_name + '>> ?';
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
}
.delete-user-popup {
  display: flex;
  flex-direction: column;
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
</style>
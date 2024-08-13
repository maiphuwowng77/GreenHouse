<template>
  <dx-popup
    class="user-detail"
    :visible.sync="isShowDetailUser"
    :show-close-button="true"
    :title="titleUserDetail"
    width="700px"
    height="auto"
    min-height="500px"
    @hidden="onPopupHidden"
  >
    <div class="content">
      <div class="input_text fl-5 mr-16">
        <label for="email">Email*</label>
        <dx-text-box
          v-model="userDetail.email"
          placeholder="Email"
          :disabled="userStore.mode != 0"
        >
          <dx-validator validation-mode="onBlur">
            <dx-required-rule message="Email is required" />
            <dx-email-rule message="Email is invalid" />
          </dx-validator>
        </dx-text-box>
      </div>
      <div class="input_text fl-5 mr-16">
        <label for="full_name">Full Name*</label>
        <dx-text-box
          v-model="userDetail.full_name"
          placeholder="Full Name"
        >
          <dx-validator validation-mode="onBlur">
            <dx-required-rule message="Full name is required" />
          </dx-validator>
        </dx-text-box>
      </div>
      <div class="input_text fl-3 mr-16">
        <label for="role">Role *</label>
        <dx-select-box
          v-model="userDetail.role"
          :data-source="roleAccounts"
          display-expr="name"
          value-expr="_id"
          placeholder="Role"
          :search-enabled="true"
        >
          <dx-validator validation-mode="onBlur">
            <dx-required-rule message="Role is required" />
          </dx-validator>
        </dx-select-box>
      </div>
    </div>
    <div class="footer">
      <dx-button
        text="Cancel"
        class="btn-cancel mr-16"
        @click="onPopupHidden"
      />
      <dx-button
        text="Save"
        class="btn-save"
        :disabled="!isFormValid"
        @click="saveUser"
      />
    </div>
  </dx-popup>
</template>

<script setup>
import { ref, inject, onBeforeMount, onMounted, watch } from 'vue';
import DxPopup from 'devextreme-vue/popup';
import DxSelectBox from 'devextreme-vue/select-box';
import DxTextBox from 'devextreme-vue/text-box';
import DxValidator, {
    DxRequiredRule,
    DxEmailRule
} from 'devextreme-vue/validator';
import DxButton from 'devextreme-vue/button';
import { useUserStore } from '../store/user-page';
import { RoleAccount } from "@/enum/enum";
import _ from 'lodash';

const userStore = useUserStore();
const titleUserDetail = ref(null);
const userDetail = ref(null);
const roleAccounts = ref(Object.keys(RoleAccount).map(key => ({
  _id: RoleAccount[key],
  name: key
})));

const isShowDetailUser = inject('userPage').isShowDetailUser;
const refreshGrid = inject('userPage').refreshGrid;
const validationGroup = 'userForm';

onBeforeMount(async () => {
  userDetail.value = userStore.userDetail;
  titleUserDetail.value = userStore.mode === 0 ? 'Add User' : 'Edit User';
});

onMounted(() => {
});

const isFormValid = ref(true);

const onPopupHidden = async () => {
  isShowDetailUser.value = false;
  userStore.isShowDetailUser = false;
};

const saveUser = async () => {
  if (isFormValid.value) {
    await userStore.saveUser();
    isShowDetailUser.value = false;
    refreshGrid();
  }
};

const validateEmail =  (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

watch(() => userDetail, (newVal, oldVal) => {
  if(!validateEmail(newVal.value.email) || newVal.value.full_name == null || newVal.value.full_name == '' || newVal.value.role == null) {
    isFormValid.value = false;
  } else isFormValid.value = true;
}, {
  deep: true
});

</script>

<style lang="scss">
.user-detail {
  display: flex;
  flex-direction: column;

  .footer {
    position: absolute;
    right: 16px;
  }
}
.dx-popup-flex-height {
  .dx-popup-content {
    .content {
      .input_text {
        padding-bottom: 16px;
      }
    }
  }
}
.dx-textbox {
  .dx-texteditor-input {
    background-color: #f0f0f0;
    border: none;
    padding: 10px;
    font-size: 16px;
    border-radius: 5px;
  }

  .dx-texteditor-container {
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  .dx-texteditor-buttons-container .dx-icon {
    color: #888;
    font-size: 20px;
  }

  .dx-state-focused .dx-texteditor-input {
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
  }

  .dx-invalid .dx-texteditor-input {
    border-color: #ff0000;
  }

  .dx-placeholder {
    color: #888;
    font-size: 16px;
  }
  .dx-state-disabled {
    .dx-texteditor-input {
      background-color: #e0e0e0;
      color: #a0a0a0;
      cursor: not-allowed;
    }

    .dx-texteditor-container {
      border-color: #d0d0d0;
    }

    .dx-texteditor-buttons-container .dx-icon {
      color: #d0d0d0;
    }
  }
}

.dx-scrollable-wrapper {
  .dx-scrollable-container {
    background-color: #f0f0f0;
    border: none;
    border-radius: 5px;
  }

  .dx-scrollview-top-pocket, 
  .dx-scrollview-bottom-pocket {
    display: none;
  }

  .dx-scrollable-scrollbar {
    background-color: #ccc;
  }

  .dx-scrollable-scroll {
    border-radius: 5px;
    background-color: #888;
  }

  .dx-scrollview-content {
    font-size: 16px;
    color: #333;
  }

  .dx-list-item {
    background-color: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    &.dx-list-item-selected {
      background-color: #007bff;
      color: #ffffff;
    }
  }

  .dx-item-content {
    font-size: 16px;
  }

  .dx-state-focused .dx-scrollable-container {
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
  }

  .dx-invalid .dx-scrollable-container {
    border-color: #ff0000;
  }
}
</style>
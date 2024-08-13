<template>
  <form
    class="change-password-form"
    @submit.prevent="onSubmit"
  >
    <dx-form
      :form-data="formData"
      :disabled="loading"
      class="form"
    >
      <dx-item>
        <dx-header class="header">
          Change Password
        </dx-header>
      </dx-item>
      <dx-item
        data-field="currentPassword"
        editor-type="dxTextBox"
        :editor-options="{ stylingMode: 'filled', placeholder: 'Current Password', mode: 'password' }"
      >
        <dx-required-rule message="Current Password is required" />
        <dx-label :visible="true" text="Current Password" />
      </dx-item>
      <dx-item
        data-field="newPassword"
        editor-type="dxTextBox"
        :editor-options="{ stylingMode: 'filled', placeholder: 'New Password', mode: 'password' }"
      >
        <dx-required-rule message="New Password is required" />
        <dx-label :visible="true" text="New Password" />
      </dx-item>
      <dx-item
        data-field="confirmPassword"
        editor-type="dxTextBox"
        :editor-options="{ stylingMode: 'filled', placeholder: 'Confirm New Password', mode: 'password' }"
      >
        <dx-required-rule message="Confirm Password is required" />
        <dx-label :visible="true" text="Confirm New Password" />
      </dx-item>
      <dx-button-item>
        <dx-button-options
          width="100%"
          type="default"
          text="Change Password"
          :use-submit-behavior="true"
        />
      </dx-button-item>

      <template #submitButtonTemplate>
        <div>
          <span class="dx-button-text">
            <dx-load-indicator
              v-if="loading"
              width="24px"
              height="24px"
              :visible="true"
            />
            <span v-if="!loading">Change Password</span>
          </span>
        </div>
      </template>
    </dx-form>
  </form>
</template>

<script setup>
import { DxLoadIndicator, DxHeader } from "devextreme-vue/load-indicator";
import DxForm, {
  DxItem,
  DxRequiredRule,
  DxLabel,
  DxButtonItem,
  DxButtonOptions
} from "devextreme-vue/form";
import notify from 'devextreme/ui/notify';
import auth from "../api/auth";
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const formData = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
});
const loading = ref(false);

const route = useRoute();
const router = useRouter();

function onSubmit() {
  const { currentPassword, newPassword, confirmPassword } = formData;

  if (newPassword !== confirmPassword) {
    notify("Passwords do not match.", "error", 2000);
    return;
  }

  loading.value = true;
  auth.changePassword(currentPassword, newPassword)
    .then(result => {
      loading.value = false;
      if (!result.isOk) {
        notify(result.message, "error", 2000);
      } else {
        notify("Password changed successfully!", "success", 2000);
        router.push("/dashboard");
      }
    })
    .catch(error => {
      loading.value = false;
      console.error("Change password error:", error);
      notify("An error occurred while changing password.", "error", 2000);
    });
}
</script>

<style lang="scss">
@import "../themes/generated/variables.base.scss";

.change-password-form {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.form {
  width: 400px;
}

.header {
  text-align: center;
  font-size: 40px;
  font-weight: bold;
  margin-bottom: 20px;
}

.dx-form-item {
  margin-bottom: 16px;
}

.dx-button-text {
  min-width: 150px;
}
</style>

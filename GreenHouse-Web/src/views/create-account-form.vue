<template>
  <form
    class="create-account-form"
    @submit.prevent="onSubmit"
  >
    <div class="image-container">
      <img
        class="image"
        src="../assets/login.png"
      >
      <div class="text-green">
        GREEN HOUSE
      </div>
    </div>
    <dx-form
      :form-data="formData"
      :disabled="loading"
      class="form"
    >
      <dx-item :class="'header-login'">
        <dx-header class="header">
          Sign up
        </dx-header>
      </dx-item>
      <dx-item
        data-field="full_name" 
        editor-type="dxTextBox"
        :editor-options="
          { stylingMode: 'filled', 
            placeholder: 'Full Name'
          }"
      >
        <dx-required-rule message="Full name is required" />
        <dx-label
          :visible="true"
          text="Full Name"
        />
      </dx-item>
      <dx-item
        data-field="email"
        editor-type="dxTextBox"
        :editor-options="{ stylingMode: 'filled', placeholder: 'Email', mode: 'email' }"
      >
        <dx-required-rule message="Email is required" />
        <dx-email-rule message="Email is invalid" />
        <dx-label
          :visible="true"
          text="Email"
        />
      </dx-item>
      <dx-item
        data-field="password" 
        editor-type="dxTextBox"
        :editor-options="
          { stylingMode: 'filled', 
            placeholder: 'Password',
            mode: 'password', 
            validationRules: [
              {
                type: 'pattern',
                pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                message: 'Invalid email format'
              }
            ] }"
      >
        <dx-required-rule message="Password is required" />
        <dx-label
          :visible="true"
          text="Password"
        />
      </dx-item>
      <dx-button-item>
        <dx-button-options
          width="100%"
          type="default"
          template="signInTemplate"
          :use-submit-behavior="true"
        />
      </dx-button-item>
      <template #signInTemplate>
        <div>
          <span class="dx-button-text">
            <dx-load-indicator
              v-if="loading"
              width="24px"
              height="24px"
              :visible="true"
            />
            <span v-if="!loading">Create Account</span>
          </span>
        </div>
      </template>
      <dx-item>
        <template #default>
          <div class="login-link">
            Already A Member? <router-link
              to="/login-form"
              class="login-text"
            >
              Log In
            </router-link>
          </div>
        </template>
      </dx-item>
    </dx-form>
  </form>
</template>

<script>
import DxForm, {
  DxItem,
  DxEmailRule,
  DxLabel,
  DxButtonItem,
  DxButtonOptions,
  DxRequiredRule,
} from 'devextreme-vue/form';
import DxLoadIndicator from 'devextreme-vue/load-indicator';
import notify from 'devextreme/ui/notify';
import { useRouter } from 'vue-router';
import { ref, reactive } from 'vue';
import common from '../utils/common';

import auth from "../api/auth";

export default {
  components: {
    DxForm,
    DxItem,
    DxLabel,
    DxButtonItem,
    DxButtonOptions,
    DxRequiredRule,
    DxLoadIndicator,
    DxEmailRule,
  },
  setup() {
    const router = useRouter();
    
    const loading = ref(false);
    const formData = reactive({
      email:"",
      password:"",
      full_name: '',
      role: 1
    });

    const onSubmit = async () => {
      loading.value = true;
      formData._id = common.generateRandomId();
      const result = await auth.createAccount(formData);
      loading.value = false;

      if (result.isOk) {
        router.push("/login-form");
      } else {
        notify(result.message, 'error', 2000);
      }
    };
    
    return {
        formData,
        loading,
        onSubmit,
    }
  }
}
</script>

<style lang="scss">
@import "../themes/generated/variables.base.scss";

.create-account-form {
  display: flex;
  .form{
    background-color: #fff !important;
  }
  .image-container{
    width: 40vw;
    height: 100vh;
    z-index: 1;
    position: relative;
    .image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .text-green{
      z-index: 10;
      background: linear-gradient(180deg, rgba(255,255,255,1) 37%, rgba(99,122,48,1) 70%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      position: absolute;
      transform: rotate(-90deg);
      top: 42%;
      right: -370px;
      font-size: 100px;
      font-weight: 500;
      white-space: nowrap;
      letter-spacing:7px;
    }
  }
  .header {
    display: block;
    width: 100%;
    text-align: center;
    font-weight: bold;
    font-size: 40px;
  }
  .dx-form {
    width: 60vw;
    background-color: #E8EAE0;
    display: flex;
    justify-content: center;
    align-items: center;
    .dx-layout-manager {
      min-width: 500px;
    }
    .dx-field-button-item {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  .link {
    text-align: center;
    font-size: 16px;
    font-style: normal;

    a {
      text-decoration: none;
    }
  }

  .form-text {
    margin: 10px 0;
    color: rgba($base-text-color, alpha($base-text-color) * 0.7);
  }

  .login-link{
    text-align: center;
    .login-text {
      color: #358638;
      text-decoration-line: none;
      cursor: pointer;
      &:hover {
        text-decoration-line: underline;
      }
    }
  }
  .dx-button-text{
    min-width: 200px;
  }
}
</style>
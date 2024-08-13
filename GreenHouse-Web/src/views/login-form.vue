<template>
  <form
    class="login-form"
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
          Log in
        </dx-header>
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
      <dx-button-item :class="test">
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
            <span v-if="!loading">Log in</span>
          </span>
        </div>
      </template>
      <dx-item>
        <div class="text-wrap">
          Not a member yet? <span
            class="text-sign"
            @click="onCreateAccountClick"
          >Sign up</span>
        </div>
      </dx-item>
    </dx-form>
  </form>
</template>

<script>
import { DxLoadIndicator, DxHeader  } from "devextreme-vue/load-indicator";
import DxForm, {
  DxItem,
  DxEmailRule,
  DxRequiredRule,
  DxLabel,
  DxButtonItem,
  DxButtonOptions
} from "devextreme-vue/form";
import notify from 'devextreme/ui/notify';

import auth from "../api/auth";

import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default {
  components: {
    DxLoadIndicator,
    DxHeader,
    DxForm,
    DxEmailRule,
    DxRequiredRule,
    DxItem,
    DxLabel,
    DxButtonItem,
    DxButtonOptions
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const formData = reactive({
      email: "",
      password: ""
    });
    const loading = ref(false);

    function onCreateAccountClick() {
      router.push("/create-account");
    }

    async function onSubmit() {
      const { email, password } = formData;
      loading.value = true;
      const result = await auth.logIn(email, password);
      if (!result.isOk) {
        loading.value = false;
        notify(result.message, "error", 2000);
      } else {
        loading.value = false;
        router.push("/projects");
      }
    }

    return {
      formData,
      loading,
      onCreateAccountClick,
      onSubmit
    };
  }
};
</script>

<style lang="scss">
@import "../themes/generated/variables.base.scss";

.login-form {
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
  .text-wrap {
    text-align: center;
    .text-sign {
      color: #358638;
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

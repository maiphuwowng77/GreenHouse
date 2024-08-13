<template>
  <div class="user-page">
    <div class="header">
      <h2 class="content-block">
        User
      </h2>
      <dx-button
        class="add-project-button"
        text="Add User"
        @click="addNewUser"
      />
    </div>

    <div class="content-project">
      <dx-data-grid
        ref="dataGridRef"
        class="dx-card wide-card"
        :data-source="userList"
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
        <dx-pager
          :show-page-size-selector="true"
          :show-info="true"
          :always-show-pager="true"
          :visible="true"
        />
        <dx-search-panel :visible="true" />

        <dx-column
          data-field="email"
          caption="Email"
          :width="300"
        />

        <dx-column
          data-field="full_name"
          caption="Full Name"
          width="100%"
        />

        <dx-column
          data-field="role"
          caption="Role"
          :width="180"
          :calculate-cell-value="data => getKeyByValue(RoleAccount, data.role)"
        />
        <dx-column
          type="buttons"
          :width="120"
          :visible="true"
          :buttons="[
            {
              text: 'Edit',
              icon: 'edit',
              onClick: editUser
            },
            {
              text: 'Delete',
              icon: 'trash',
              onClick: deleteUser,
            }
          ]"
        />
      </dx-data-grid>
    </div>
    <user-detail v-if="isShowDetailUser" />
    <delete-user-confirm-popup v-if="isPopupDeleteUserVisible" />
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
import { onBeforeMount, provide, ref, onMounted, getCurrentInstance } from 'vue';
import { RoleAccount } from "@/enum/enum";
import { useUserStore } from '../store/user-page';
import { useRoute, useRouter } from 'vue-router';
import { ObjectId } from 'bson';
import UserDetail from './user-detail';
import DeleteUserConfirmPopup from './delete-user-confirm-popup';

const proxy = getCurrentInstance();
const route = useRoute();
const router = useRouter();

const userStore = useUserStore();
const userList = ref([]);

const isShowDetailUser = ref(false);
const isPopupDeleteUserVisible = ref(false);

onBeforeMount( async () => {
  await userStore.getPagingUsers(1,10);
  userList.value = userStore.userList;
});

const handleOptionChanged = async (e) => {
  if (e.fullName === 'paging.pageIndex') {
    userStore.currentPage = e.value + 1;
    await userStore.getPagingUsers(userStore.currentPage, userStore.limit);
  } else if (e.fullName === 'paging.pageSize') {
    userStore.limit = e.value;
    await userStore.getPagingUsers(userStore.currentPage, userStore.limit);
  }
}

const getKeyByValue = (object, value) => {
  return Object.keys(object).find(key => object[key] === value);
}

const addNewUser = () => {
  isShowDetailUser.value = true;
  userStore.userId = new ObjectId();
  userStore.mode = 0;
  userStore.userDetail = {
    _id: userStore.userId,
    full_name: null,
    email: null,
    role: RoleAccount.Student,
  }
}

const editUser = (data) => {
  isShowDetailUser.value = true;
  userStore.userId = data.row.data._id;
  userStore.mode = 1;
  userStore.userDetail = data.row.data;
}

const deleteUser = async (data) => {
  userStore.userId = data.row.data._id;
  userStore.userDetail = data.row.data;
  isPopupDeleteUserVisible.value = true;
}

const refreshGrid = async () => {
  await userStore.getPagingUsers(1,10);
  userList.value = userStore.userList;
  proxy.refs.dataGridRef.instance.getDataSource().reload();
};

provide('userPage', {
  isShowDetailUser,
  isPopupDeleteUserVisible,
  refreshGrid
});

</script>

<style lang="scss">
.user-page {
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
    background-color: #215B32;
    color: white;
    padding: 15px 32px;
  }

  .add-project-button:hover {
    background-color: #297e43;
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

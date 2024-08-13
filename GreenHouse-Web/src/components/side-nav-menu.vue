<template>
  <div
    class="dx-swatch-additional side-navigation-menu"
    @click="forwardClick"
  >
    <slot />
    <div class="menu-container">
      <dx-tree-view
        ref="treeViewRef"
        :items="items"
        key-expr="path"
        selection-mode="single"
        :focus-state-enabled="false"
        expand-event="click"
        width="100%"
        @item-click="handleItemClick"
      />
    </div>
    <div class="bottom-menu">
      <!-- <div
        class="item-menu profile"
        @click="onProfileClick"
      >
        <i class="icon dx-icon-user" />
        <div class="text">
          Profile
        </div>
      </div> -->
      <div
        class="item-menu logout"
        @click="onLogoutClick"
      >
        <i class="icon dx-icon-runner" />
        <div class="text">
          Logout
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DxTreeView from 'devextreme-vue/tree-view';
import { sizes } from '../utils/media-query';
import navigation from '../app-navigation';
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { RoleAccount } from '@/enum/enum';
import auth from "../api/auth";

export default {
  components: {
    DxTreeView,
  },
  props: {
    compactMode: Boolean
  },
  setup(props, context) {
    const route = useRoute();
    const router = useRouter();

    const isLargeScreen = sizes()['screen-large'];
    let userLogin = JSON.parse(localStorage.getItem('user'));
    let nav = navigation;
    if (userLogin && userLogin.role != RoleAccount.Admin ) {
      nav = navigation.filter(x => !x.isAdmin );
    }
    
    const items = nav.map((item) => {
      if(item.path && !(/^\//.test(item.path))){
        item.path = `/${item.path}`;
      }
      return {...item, expanded: isLargeScreen}
    });

    const treeViewRef = ref(null);

    function forwardClick (...args) {
      context.emit("click", args);
    }

    function handleItemClick(e) {
      if (!e.itemData.path || props.compactMode) {
        return;
      }
      router.push(e.itemData.path);

      const pointerEvent = e.event;
      pointerEvent.stopPropagation();
    }

    function updateSelection () {
      if (!treeViewRef.value || !treeViewRef.value.instance) {
        return;
      }

      treeViewRef.value.instance.selectItem(route.path);
      treeViewRef.value.instance.expandItem(route.path);
    }

    function onLogoutClick() {
      auth.logOut();
      router.push({
        path: "/login-form",
        query: { redirect: route.path }
      });
    }

    function onProfileClick() {
      router.push({
        path: "/profile",
        query: { redirect: route.path }
      });
    }

    onMounted(() => {
      updateSelection();
      if (props.compactMode) {
        treeViewRef.value.instance.collapseAll();
      }
    });


    watch(
      () => route.path,
      () => {
        updateSelection();
      }
    );

    watch(
      () => props.compactMode,
      () => {
        if (props.compactMode) {
          treeViewRef.value.instance.collapseAll();
        } else {
          updateSelection();
        }
      }
    );

    return {
      treeViewRef,
      items,
      forwardClick,
      handleItemClick,
      updateSelection,
      onLogoutClick,
      onProfileClick
    };
  }
};
</script>

<style lang="scss">
@import "./dx-styles.scss";
@import "../themes/generated/variables.additional.scss";

.side-navigation-menu {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  height: 100%;
  width: 250px !important;
  position: relative;

  .menu-container {
    min-height: 100%;
    display: flex;
    flex-direction: column;
    flex: 1;

    .dx-scrollable-container {
      background-color: #053314 !important;
      border-radius: unset !important;
      .dx-treeview-item {
        color: rgba(0,0,0,.87);
      }
      .dx-state-selected {
        background-color: #DDE1CD;
      }
    }

    .dx-treeview {
      white-space: nowrap;
      .dx-treeview-item {
        padding-left: 0;
        flex-direction: row-reverse;

        .dx-icon {
          width: $side-panel-min-width !important;
          margin: 0 !important;
        }
      }
      .dx-treeview-node {
        padding: 0 0 !important;
      }

      .dx-treeview-toggle-item-visibility {
        right: 10px;
        left: auto;
      }

      .dx-rtl .dx-treeview-toggle-item-visibility {
        left: 10px;
        right: auto;
      }
      .dx-treeview-node {
        &[aria-level="1"] {
          font-weight: bold;
        }
      }
    }
    .dx-treeview {
      .dx-treeview-node-container {
        .dx-treeview-node {
          .dx-treeview-item {
            color: #ffffff;
            min-height: 60px;
            font-size: 16px;
            .dx-treeview-item-content {
              display: flex;
              align-items: center;
            }
          }
        }
      }
    }

    .dx-theme-generic .dx-treeview {
      .dx-treeview-node-container
        .dx-treeview-node.dx-state-selected.dx-state-focused
        > .dx-treeview-item
        * {
        color: inherit;
      }
    }
  }

  .bottom-menu {
    position: absolute;
    bottom: 0px;
    width: 100%;

    .item-menu {
      min-height: 60px;
      font-size: 16px;
      color: #ffffff;
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 0px 16px 0 12px;
      .icon {
        font-size: 28px;
      }
      .text {
        padding-left: 24px;
      }
    }

    .item-menu:hover {
      background-color: rgba(110,110,128,.5);
    }
  }
}


</style>

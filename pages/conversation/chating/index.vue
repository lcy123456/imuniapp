<template>
    <view class="chating_container">
        <chating-header />
        <chating-list
            ref="chatingListRef"
            :menu-outside-flag="menuOutsideFlag"
            @click="pageClick"
            @initSuccess="initSuccess"
        />
        <chating-footer
            ref="chatingFooterRef"
            :footer-outside-flag="footerOutsideFlag"
            @scrollToBottom="scrollToBottom"
        />
        <u-loading-page :loading="initLoading" />
    </view>
</template>

<script>
import { mapActions } from "vuex";
import ChatingHeader from "./components/ChatingHeader.vue";
import ChatingFooter from "./components/ChatingFooter/index.vue";
import ChatingList from "./components/ChatingList.vue";
import {
    markConversationAsRead,
} from "@/util/imCommon";
import { getEl } from '@/util/common';

export default {
    components: {
        ChatingHeader,
        ChatingFooter,
        ChatingList,
    },
    data () {
        return {
            listHeight: 0,
            footerOutsideFlag: 0,
            menuOutsideFlag: 0,
            initLoading: true,
            back2Tab: false,
        };
    },
    onLoad (options) {
        if (options?.back2Tab) {
            this.back2Tab = JSON.parse(options.back2Tab);
        }
    },
    onUnload () {
        console.log("unload");
        markConversationAsRead(
            {
                ...this.$store.getters.storeCurrentConversation,
            },
            true
        );
        this.resetConversationState();
        this.resetMessageState();
    },
    methods: {
        ...mapActions("message", ["resetMessageState", "deleteMessages"]),
        ...mapActions("conversation", ["resetConversationState"]),
        scrollToBottom (isRecv = false) {
            // this.$refs.chatingListRef.scrollToAnchor(`auchor${clientMsgID}`, isRecv);
            this.$refs.chatingListRef.scrollToBottom(false, isRecv);
        },
        async pageClick () {
            const res = await getEl.call(this, '.message_menu_container');
            if (res) {
                this.menuOutsideFlag += 1;
            }

            this.footerOutsideFlag += 1;
        },
        getEl (el) {
            return new Promise((resolve) => {
                const query = uni.createSelectorQuery().in(this);
                query
                    .select(el)
                    .boundingClientRect((data) => {
                        resolve(data);
                    })
                    .exec();
            });
        },
        initSuccess () {
            console.log("initSuccess");
            this.initLoading = false;
        },
    },
    onBackPress () {
        if (this.back2Tab) {
            uni.switchTab({
                url: '/pages/conversation/conversationList/index'
            });
            return true;
        }

        return false;
    },
};
</script>

<style lang="scss" scoped>
.chating_container {
  @include colBox(false);
  height: 100vh;
  overflow: hidden;
  background: url('/static/images/chat-bg.png') no-repeat;
  background-size: cover;

  .mutiple_action_container {
    display: flex;
    border-top: 1px solid #eaeaea;

    .action_item {
      @include centerBox();
      flex-direction: column;
      flex: 1;
      padding: 48rpx 0;
      font-size: 24rpx;
      color: #898989;

      .u-icon {
        margin-bottom: 6rpx;
      }
    }
  }
}
</style>

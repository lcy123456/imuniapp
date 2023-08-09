<template>
    <view class="group_settings_container">
        <custom-nav-bar title="聊天设置" />
        <view class="group_settings_content">
            <view class="setting_row info_row">
                <view class="group_avatar">
                    <my-avatar
                        :src="storeCurrentConversation.faceURL"
                        :is-group="true"
                        size="48"
                    />
                </view>
                <text class="group_name">
                    {{ storeCurrentConversation.showName }}
                </text>
                <text>({{ storeCurrentGroup.memberCount }})</text>
            </view>

            <group-member-row
                :is-nomal="!isAdmin && !isOwner"
                :group-i-d="storeCurrentConversation.groupID"
                :member-count="storeCurrentGroup.memberCount"
            />

            <view class="setting_row">
                <setting-item title="群聊名称">
                    <text class="sub_title">
                        {{ storeCurrentConversation.showName }}
                    </text>
                </setting-item>
                <setting-item
                    title="群类型"
                    :arrow="false"
                >
                    <text class="sub_title">
                        {{ getGroupTypeStr }}
                    </text>
                </setting-item>
            </view>


            <view class="setting_row">
                <setting-item
                    title="群ID号"
                    :arrow="false"
                    :border="false"
                    @click="copyGroupID"
                >
                    <text class="sub_title">
                        {{ storeCurrentConversation.groupID }}
                    </text>
                </setting-item>
            </view>

            <view class="bottom_action">
                <u-button
                    type="error"
                    plain
                    :text="isOwner ? '解散群聊' : '退出群聊'"
                    @click="() => (confirmType = isOwner ? 'Dismiss' : 'Quit')"
                />
            </view>

            <u-modal
                :content="getConfirmContent"
                async-close
                :show="confirmType !== null"
                show-cancel-button
                @confirm="confirm"
                @cancel="() => (confirmType = null)"
            />
        </view>

        <u-toast ref="uToast" />
    </view>
</template>

<script>
import { mapGetters } from "vuex";
import IMSDK, {
    GroupMemberRole,
} from "openim-uniapp-polyfill";
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import MyAvatar from "@/components/MyAvatar/index.vue";
import SettingItem from "@/components/SettingItem/index.vue";
import GroupMemberRow from "./components/GroupMemberRow.vue";

const ConfirmTypes = {
    Dismiss: "Dismiss",
    Quit: "Quit",
};

export default {
    components: {
        CustomNavBar,
        MyAvatar,
        SettingItem,
        GroupMemberRow,
    },
    props: {},
    data () {
        return {
            actionSheetVisible: false,
            confirmType: null,
        };
    },
    computed: {
        ...mapGetters([
            "storeCurrentConversation",
            "storeCurrentMemberInGroup",
            "storeCurrentGroup",
        ]),
        getConfirmContent () {
            if (this.confirmType === ConfirmTypes.Quit) {
                return "确定要退出当前群聊吗？";
            }
            if (this.confirmType === ConfirmTypes.Dismiss) {
                return "确定要解散当前群聊吗？";
            }
            return "";
        },
        isOwner () {
            return this.storeCurrentMemberInGroup.roleLevel === GroupMemberRole.Owner;
        },
        isAdmin () {
            return this.storeCurrentMemberInGroup.roleLevel === GroupMemberRole.Admin;
        },
        getGroupTypeStr () {
            return "工作群";
        },
    },
    methods: {
        copyGroupID () {
            uni.setClipboardData({
                data: this.storeCurrentGroup.groupID,
                success: () => {
                    uni.hideToast();
                    this.$nextTick(() => {
                        uni.$u.toast("复制成功");
                    });
                },
            });
        },
        confirm () {
            let funcName = "";
            let sourceID = this.storeCurrentConversation.groupID;
            if (this.confirmType === ConfirmTypes.Quit) {
                funcName = IMSDK.IMMethods.QuitGroup;
            }
            if (this.confirmType === ConfirmTypes.Dismiss) {
                funcName = IMSDK.IMMethods.DismissGroup;
            }
            IMSDK.asyncApi(funcName, IMSDK.uuid(), sourceID)
                .then(() => {
                    uni.$u.toast("操作成功");
                    if (this.confirmType === ConfirmTypes.Clear) {
                        this.$store.commit("message/SET_HISTORY_MESSAGE_LIST", []);
                    } else {
                        setTimeout(
                            () =>
                                uni.switchTab({
                                    url: "/pages/conversation/conversationList/index",
                                }),
                            250
                        );
                    }
                })
                .catch(() => uni.$u.toast("操作失败"))
                .finally(() => (this.confirmType = null));
        },
    },
};
</script>

<style lang="scss" scoped>
.group_settings_container {
  @include colBox(false);
  height: 100vh;
  background-color: #f6f6f6;

  .group_settings_content {
    overflow-y: auto;
  }

  .setting_row {
    background-color: #fff;
    margin: 24rpx 0;

    .sub_title {
      @include nomalEllipsis();
      max-width: 300rpx;
      font-size: 28rpx;
      color: #999;
    }

    &:nth-child(1) {
      margin-top: 12rpx;
    }
  }

  .info_row {
    @include vCenterBox();
    padding: 36rpx 44rpx;

    .group_avatar {
      margin-right: 36rpx;
      position: relative;

      .edit_icon {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 11px;
        height: 11px;
      }
    }

    .group_name {
      @include nomalEllipsis();
      max-width: 480rpx;
      margin-right: 24rpx;
    }
  }

  .bottom_action {
    margin: 84rpx 0;

    .u-button {
      border: none;
    }
  }
}
</style>

<template>
    <view
        class="group_members_container"
    >
        <group-member-list-header
            :check-visible.sync="showCheck"
            :group-i-d="groupID"
        />

        <view class="search_bar_wrap">
            <u-search
                v-model="keyword"
                class="search_bar"
                shape="square"
                placeholder="搜索"
                action-text="搜索"
            />
        </view>

        <u-list
            class="member_list"
            lower-threshold="100"
            height="1"
            @scrolltolower="loadMore"
        >
            <u-list-item
                v-for="member in groupMemberList"
                :key="member.userID"
            >
                <user-item
                    :checked="isChecked(member.userID)"
                    :check-visible="showCheck"
                    :disabled="!canCheck(member) && showCheck"
                    :item="member"
                    @itemClick="userClick"
                    @updateCheck="updateCheck"
                />
            </u-list-item>
            <view
                v-show="loadState.loading"
                class="member_loading"
            >
                <u-loading-icon />
            </view>
        </u-list>

        <!-- <choose-index-footer
            v-if="showCheck"
            :comfirm-loading="comfirmLoading"
            :choosed-data="getChoosedData"
            :is-remove="isRemove"
            @removeItem="updateCheck"
            @confirm="confirm"
        /> -->

        <u-modal
            :show="showConfirmModal"
            async-close
            show-cancel-button
            content="确定移除已选群成员？"
            @confirm="modalConfirm"
            @cancel="() => (showConfirmModal = false)"
        />
        <u-toast ref="uToast" />
    </view>
</template>

<script>
import { GroupMemberListTypes } from "@/constant";
import IMSDK, { GroupMemberRole } from "openim-uniapp-polyfill";
import UserItem from "@/components/UserItem/index.vue";
import GroupMemberListHeader from "./components/GroupMemberListHeader.vue";
import ChooseIndexFooter from "@/components/ChooseIndexFooter/index.vue";

export default {
    components: {
        GroupMemberListHeader,
        ChooseIndexFooter,
        UserItem,
    },
    data () {
        return {
            showCheck: false,
            groupID: "",
            keyword: "",
            showConfirmModal: false,
            comfirmLoading: false,
            groupMemberList: [],
            choosedMemberIDList: [],
            type: GroupMemberListTypes.Preview,
            isRightKick: true,
            loadState: {
                hasMore: true,
                loading: false,
            },
        };
    },
    computed: {
        getChoosedData () {
            const tmpList = [...this.choosedMemberIDList];
            const a = [...this.groupMemberList, ...this.searchChoosedList].filter(
                (member) => {
                    const idx = tmpList.findIndex((item) => item === member.userID);
                    if (idx > -1) {
                        tmpList.splice(idx, 1);
                    }
                    return idx > -1;
                }
            );
            console.log('xxx', a);
            return a;
        },
        isRemove () {
            return this.type === GroupMemberListTypes.Kickout;
        },
        isOwner () {
            return (
                this.$store.getters.storeCurrentMemberInGroup.roleLevel ===
        GroupMemberRole.Owner
            );
        },
        isAdmin () {
            return (
                this.$store.getters.storeCurrentMemberInGroup.roleLevel ===
        GroupMemberRole.Admin
            );
        },
    },
    onLoad (options) {
        const { groupID, type } = options;
        this.loadMemberList(groupID);
        this.type = type;
        this.groupID = groupID;
        this.isRightKick = type === GroupMemberListTypes.Kickout;
        if (this.isRightKick) {
            this.showCheck = true;
        }
    },
    onUnload () {
        this.disposeIMListener();
    },
    methods: {
        isChecked (userID) {
            return this.choosedMemberIDList.includes(userID);
        },
        canCheck ({ roleLevel, userID }) {
            if (this.type === GroupMemberListTypes.Kickout) {
                return (
                    (this.isOwner ||
            (this.isAdmin && roleLevel !== GroupMemberRole.Owner)) &&
        userID !== this.$store.getters.storeCurrentUserID
                );
            }
            return userID !== this.$store.getters.storeCurrentUserID;
        },
        confirm () {
            this.showConfirmModal = true;
        },
        modalConfirm () {
            IMSDK.asyncApi(IMSDK.IMMethods.KickGroupMember, IMSDK.uuid(), {
                groupID: this.getChoosedData[0].groupID,
                reason: "",
                userIDList: this.getChoosedData.map((member) => member.userID),
            }).then(() => this.showToast("操作成功", () => uni.navigateBack()))
                .catch(() => this.showToast("操作失败"))
                .finally(() => (this.showConfirmModal = false));
        },
        updateChoosedData (userID) {
            if (this.choosedMemberIDList.includes(userID)) {
                const idx = this.choosedMemberIDList.findIndex(
                    (item) => item === userID
                );
                const tmpArr = [...this.choosedMemberIDList];
                tmpArr.splice(idx, 1);
                this.choosedMemberIDList = tmpArr;
            } else {
                this.choosedMemberIDList = [...this.choosedMemberIDList, userID];
            }
        },
        userClick (member) {
            uni.$u.route("/pages/common/userCard/index", {
                sourceID: member.userID,
            });
        },
        updateCheck (member) {
            if (
                !this.choosedMemberIDList.includes(member.userID)
            ) {
                this.searchChoosedList = [...this.searchChoosedList, member];
            }
            this.updateChoosedData(member.userID);
        },
        loadMore () {
            const stateKey = "loadState";
            const methodKey = "loadMemberList";
            if (this[stateKey].hasMore && !this[stateKey].loading) {
                this[methodKey]();
            }
        },
        loadMemberList (groupID) {
            this.loadState.loading = true;
            IMSDK.asyncApi(IMSDK.IMMethods.GetGroupMemberList, IMSDK.uuid(), {
                groupID: groupID ?? this.groupID,
                filter: 0,
                offset: this.groupMemberList.length,
                count: 20,
            })
                .then(({ data }) => {
                    this.groupMemberList = [...this.groupMemberList, ...data];
                    this.loadState.hasMore = data.length === 20;
                })
                .finally(() => (this.loadState.loading = false));
        },
        showToast (message, complete = null) {
            this.$refs.uToast.show({
                message,
                complete,
            });
        },
    },
    onBackPress () {
        if (this.showCheck && this.isRightKick) {
            this.showCheck = false;
            this.type = GroupMemberListTypes.Preview;
            return true;
        }
        return false;
    },
};
</script>

<style lang="scss" scoped>
.group_members_container {
  @include colBox(false);
  height: 100vh;
  overflow: hidden;

  .search_bar_wrap {
    height: 34px;
    padding: 12px 22px;
  }

  .at_all_btn {
    font-weight: 500;
    padding: 24rpx 44rpx;
  }

  /deep/.u-popup {
    flex: none;
  }

  .member_list {
    flex: 1;
  }
}
</style>

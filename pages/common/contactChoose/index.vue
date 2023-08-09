<template>
    <view class="contact_choose_container">
        <custom-nav-bar title="联系人" />

        <view class="search_bar_wrap">
            <u-search
                v-model="keyword"
                shape="square"
                placeholder="搜索"
                :show-action="false"
            />
        </view>

        <view class="tab_container">
            <view class="tab_pane">
                <choose-index-list
                    :height="getListHeight"
                    :index-list="getChooseData.indexList"
                    :item-arr="getChooseData.dataList"
                    :checked-i-d-list="checkedUserIDList"
                    :disabled-i-d-list="disabledUserIDList"
                    :show-check="true"
                    @updateCheck="updateCheckedUser"
                />
            </view>

            <choose-index-footer
                :comfirm-loading="comfirmLoading"
                :choosed-data="getCheckedInfo"
                @removeItem="updateCheckedUser"
                @confirm="confirm"
            />
        </view>
    </view>
</template>

<script>
import { mapGetters } from "vuex";
import { ContactChooseTypes } from "@/constant";
import { formatChooseData, toastWithCallback } from "@/util/common";
import IMSDK from "openim-uniapp-polyfill";
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import UserItem from "@/components/UserItem/index.vue";
import ChooseIndexList from "@/components/ChooseIndexList/index.vue";
import ChooseIndexFooter from "@/components/ChooseIndexFooter/index.vue";

export default {
    components: {
        CustomNavBar,
        UserItem,
        ChooseIndexList,
        ChooseIndexFooter,
    },
    data () {
        return {
            keyword: "",
            type: ContactChooseTypes.GetList,
            showConfirmModal: false,
            groupID: "",
            checkedUserIDList: [],
            disabledUserIDList: [],
            comfirmLoading: false,
        };
    },
    computed: {
        ...mapGetters([
            "storeFriendList",
        ]),
        getListHeight () {
            const statusBar = uni.getWindowInfo().statusBarHeight;
            return (
                uni.getWindowInfo().safeArea.height -
        statusBar -
        58 -
        72 -
        44 +
        "px"
            );
        },
        showGroup () {
            return showGroupTypes.includes(this.type);
        },
        showConversation () {
            return showConversationTypes.includes(this.type);
        },
        getChooseData () {
            if (this.keyword) {
                return {
                    indexList: ["#"],
                    dataList: [
                        this.storeFriendList.filter(
                            (friend) =>
                                friend.nickname.includes(this.keyword) ||
                friend.remark.includes(this.keyword)
                        ),
                    ],
                };
            }
            return formatChooseData(this.storeFriendList);
        },
        getCheckedInfo () {
            const tmpUserIDList = [...this.checkedUserIDList];
            const checkedFriends = this.storeFriendList.filter((friend) => {
                const idx = tmpUserIDList.findIndex(
                    (userID) => userID === friend.userID
                );
                if (idx > -1) {
                    tmpUserIDList.splice(idx, 1);
                }
                return idx > -1;
            });
            return [...checkedFriends];
        },
    },
    onLoad (options) {
        const {
            type,
            groupID,
            checkedUserIDList,
        } = options;
        this.type = type;
        this.groupID = groupID;
        this.checkedUserIDList = checkedUserIDList
            ? JSON.parse(checkedUserIDList)
            : [];
        if (this.type === ContactChooseTypes.Invite) {
            this.checkDisabledUser();
        }
    },
    methods: {
        checkDisabledUser () {
            const friendIDList = this.storeFriendList.map((friend) => friend.userID);
            IMSDK.asyncApi(
                IMSDK.IMMethods.GetSpecifiedGroupMembersInfo,
                IMSDK.uuid(),
                {
                    groupID: this.groupID,
                    userIDList: friendIDList,
                }
            ).then(({ data }) => {
                this.disabledUserIDList = data.map((member) => member.userID);
            });
        },
        updateCheckedUser ({ userID }) {
            if (this.checkedUserIDList.includes(userID)) {
                const idx = this.checkedUserIDList.findIndex((item) => item === userID);
                const tmpArr = [...this.checkedUserIDList];
                tmpArr.splice(idx, 1);
                this.checkedUserIDList = [...tmpArr];
            } else {
                this.checkedUserIDList = [...this.checkedUserIDList, userID];
            }
        },
        confirm () {
            this.comfirmLoading = true;
            if (this.type === ContactChooseTypes.GetList) {
                let pages = getCurrentPages();
                let prevPage = pages[pages.length - 2];
                prevPage.$vm.getCheckedUsers(this.getCheckedInfo);
                this.comfirmLoading = false;

                uni.navigateBack({
                    delta: 1,
                });
                return;
            }

            IMSDK.asyncApi(IMSDK.IMMethods.InviteUserToGroup, IMSDK.uuid(), {
                groupID: this.groupID,
                reason: "",
                userIDList: this.getCheckedInfo.map((user) => user.userID),
            })
                .then(() => {
                    toastWithCallback("操作成功", () => uni.navigateBack());
                    this.comfirmLoading = false;
                })
                .catch(() => toastWithCallback("操作失败"));
            this.comfirmLoading = false;
        },
    },
};
</script>

<style lang="scss" scoped>
.contact_choose_container {
  .search_bar_wrap {
    height: 34px;
    padding: 12px 22px;
  }

  .tab_container {
    @include colBox(false);
    overflow: hidden;

    .tabs_bar {
      @include vCenterBox();
      justify-content: space-evenly;

      .tab_item {
        @include colBox(false);
        align-items: center;

        image {
          width: 50px;
          height: 50px;
        }
      }
    }

    .tab_pane {
      flex: 1;
      margin-top: 24px;

      .member_list {
        /deep/uni-scroll-view {
          max-height: 100% !important;
        }
      }

      .member_anchor {
        background-color: #f8f8f8 !important;
        border: none !important;
      }
    }
  }
}
</style>

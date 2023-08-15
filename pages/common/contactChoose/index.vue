<template>
    <view class="contact_choose_container">
        <CustomNavBar
            title="联系人"
            is-bg-color2
        />

        <view class="px-20 pb-20 pt-10">
            <u-search
                v-model="keyword"
                shape="square"
                placeholder="搜索"
                :show-action="false"
                bg-color="#fff"
                height="70rpx"
            />
        </view>

        <ChooseIndexList
            class="bg-color"
            :index-list="getChooseData.indexList"
            :item-arr="getChooseData.dataList"
            :checked-i-d-list="checkedUserIDList"
            :disabled-i-d-list="disabledUserIDList"
            :show-check="true"
            @updateCheck="updateCheckedUser"
        />
        <ChooseIndexFooter
            :comfirm-loading="comfirmLoading"
            :choosed-data="getCheckedInfo"
            @removeItem="updateCheckedUser"
            @confirm="confirm"
        />
        
        <view class="tab_container">
            <view class="tab_pane" />
        </view>
    </view>
</template>

<script>
import { mapGetters } from 'vuex';
import { ContactChooseTypes } from '@/constant';
import { formatChooseData, toastWithCallback } from '@/util/common';
import IMSDK from 'openim-uniapp-polyfill';
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import ChooseIndexList from '@/components/ChooseIndexList/index.vue';
import ChooseIndexFooter from '@/components/ChooseIndexFooter/index.vue';

export default {
    components: {
        CustomNavBar,
        ChooseIndexList,
        ChooseIndexFooter,
    },
    data () {
        return {
            keyword: '',
            type: ContactChooseTypes.GetList,
            showConfirmModal: false,
            groupID: '',
            checkedUserIDList: [],
            disabledUserIDList: [],
            comfirmLoading: false,
        };
    },
    computed: {
        ...mapGetters(['storeFriendList']),
        getChooseData () {
            const newList = this.storeFriendList.filter(
                (friend) =>
                    friend.nickname.includes(this.keyword) ||
                    friend.remark.includes(this.keyword)
            );
            return formatChooseData(newList);
        },
        // TODO：代码优化，写法过于繁琐
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
        const { type, groupID, checkedUserIDList } = options;
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
            const friendIDList = this.storeFriendList.map(
                (friend) => friend.userID
            );
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
        // TODO: 优化：写法繁琐
        updateCheckedUser ({ userID }) {
            if (this.checkedUserIDList.includes(userID)) {
                const idx = this.checkedUserIDList.findIndex(
                    (item) => item === userID
                );
                const tmpArr = [...this.checkedUserIDList];
                tmpArr.splice(idx, 1);
                this.checkedUserIDList = [...tmpArr];
            } else {
                this.checkedUserIDList = [...this.checkedUserIDList, userID];
            }
        },
        confirm () {
            // this.comfirmLoading = true;
            // if (this.type === ContactChooseTypes.GetList) {
            let pages = getCurrentPages();
            let prevPage = pages[pages.length - 2];
            prevPage.$vm.getCheckedUsers(this.getCheckedInfo);
            // this.comfirmLoading = false;

            uni.navigateBack({
                delta: 1,
            });
            //     return;
            // }

            // IMSDK.asyncApi(IMSDK.IMMethods.InviteUserToGroup, IMSDK.uuid(), {
            //     groupID: this.groupID,
            //     reason: '',
            //     userIDList: this.getCheckedInfo.map((user) => user.userID),
            // })
            //     .then(() => {
            //         toastWithCallback('操作成功', () => uni.navigateBack());
            //         this.comfirmLoading = false;
            //     })
            //     .catch(() => toastWithCallback('操作失败'));
            // this.comfirmLoading = false;
        },
    },
};
</script>

<style lang="scss" scoped>
.contact_choose_container {
    height: 100vh;
    background-color: $uni-bg-color-grey;
    display: flex;
    flex-direction: column;
}
</style>

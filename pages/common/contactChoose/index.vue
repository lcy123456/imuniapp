<template>
    <view class="contact_choose_container">
        <CustomNavBar
            title="选择成员"
            is-bg-color2
        />

        <view class="search_box">
            <MyAvatar
                v-for="v in showCheckFriendList"
                :key="v.userID"
                :src="v.faceURL"
                :desc="v.remark || v.nickname"
                size="78rpx"
                class="mr-10"
                @click="updateCheckedUser(v)"
            />
            <uni-search-bar
                v-model="keyword"
                class="h-60"
                placeholder="搜索好友"
                focus
                cancel-button="none"
            >
                <view
                    v-if="checkFriendList.length !== 0"
                    slot="searchIcon"
                />
            </uni-search-bar>
        </view>
        <ChooseIndexList
            class="bg-color"
            :index-list="showFriendList.indexList"
            :item-arr="showFriendList.dataList"
            :checked-i-d-list="checkUserIDList"
            :disabled-i-d-list="disabledUserIDList"
            :show-check="true"
            @updateCheck="updateCheckedUser"
        />
        <view class="flex justify-end my-30">
            <view>
                <u-button
                    :disabled="checkFriendList.length === 0"
                    type="primary"
                    :text="`完成 (${checkFriendList.length})`"
                    @click="confirm"
                />
            </view>
        </view>
    </view>
</template>

<script>
import { mapGetters } from 'vuex';
import { ContactChooseTypes } from '@/constant';
import { formatChooseData } from '@/util/common';
import IMSDK, {
    SessionType,
} from 'openim-uniapp-polyfill';
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import ChooseIndexList from '@/components/ChooseIndexList/index.vue';
import MyAvatar from '@/components/MyAvatar/index.vue';

export default {
    components: {
        CustomNavBar,
        MyAvatar,
        ChooseIndexList,
    },
    data () {
        return {
            SessionType: Object.freeze(SessionType),
            keyword: '',
            type: ContactChooseTypes.GetList,
            showConfirmModal: false,
            groupID: '',
            checkFriendList: [],
            disabledUserIDList: [],
        };
    },
    computed: {
        ...mapGetters(['storeFriendList']),
        showFriendList () {
            const newList = this.storeFriendList.filter(
                (friend) =>
                    friend.nickname.includes(this.keyword) ||
                    friend.remark.includes(this.keyword)
            );
            return formatChooseData(newList);
        },
        checkUserIDList () {
            return this.checkFriendList.map((v) => v.userID);
        },
        showCheckFriendList () {
            return this.checkFriendList.slice(-6);
        }
    },
    onLoad (options) {
        const { type, groupID, checkUserIDList } = options;
        this.type = type;
        this.groupID = groupID;
        const userIdList = checkUserIDList ? JSON.parse(checkUserIDList) : [];
        this.checkFriendList = this.storeFriendList.filter(v => userIdList.includes(v.userID));
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
        updateCheckedUser (val) {
            const idx = this.checkFriendList.findIndex(v => v.userID === val.userID);
            if (idx > -1) {
                this.checkFriendList.splice(idx, 1);
            } else {
                this.checkFriendList.push(val);
            }
        },
        confirm () {
            let pages = getCurrentPages();
            let prevPage = pages[pages.length - 2];
            prevPage.$vm.getCheckUsers(this.checkFriendList);

            uni.navigateBack({
                delta: 1,
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.contact_choose_container {
    height: 100vh;
    background-color: $uni-bg-color-grey;
    padding: 0 20rpx;
    @include colBox(false);

    .search_box {
        height: 100rpx;
        background-color: $uni-bg-color !important;
        border-radius: 20rpx 20rpx 0 0;
        padding: 0 20rpx;
        @include vCenterBox();
        .uni-searchbar {
            flex: 1;
            min-width: 200rpx;
        }
        /deep/.u-avatar {
            border-radius: 30rpx;
            overflow: hidden;
        }
        /deep/.uni-searchbar__box {
            background-color: $uni-bg-color !important;
        }
    }
    /deep/.u-index-list {
        margin-top: 2rpx;
        padding-top: 30rpx;
        .u-index-list__letter {
            padding-right: 33rpx;
        }
    }
}
</style>

<!-- eslint-disable vue/attribute-hyphenation -->
<template>
    <u-popup :show="show" @close="close" @open="open">
        <view class="groupMemberList">
            <view class="flex justify-end my-30">
                <view>
                    <u-button
                        :disabled="checkFriendList.length === 0"
                        type="primary"
                        :text="`${$t('Complete')} (${checkFriendList.length})`"
                        @click="confirm"
                    />
                </view>
            </view>
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
                    :placeholder="$t('Search_for_friends')"
                    :cancel-text="$t('Cancel')"
                    cancel-button="none"
                >
                    <view
                        v-if="checkFriendList.length !== 0"
                        slot="searchIcon"
                    />
                </uni-search-bar>
            </view>
            <UserItem
                v-if="[100, 60].includes(userInfo.roleLevel)"
                :key="'all'"
                :item="allCell"
                class="all"
                @itemClick="itemClick"
            />
            <ChooseIndexList
                class="bg-color"
                :index-list="showFriendList.indexList"
                :item-arr="showFriendList.dataList"
                :checked-i-d-list="checkUserIDList"
                :disabled-i-d-list="disabledUserIDList"
                :show-check="true"
                @updateCheck="updateCheckedUser"
            />
        </view>
    </u-popup>
</template>

<script>
import { mapGetters } from 'vuex';
import { ContactChooseTypes } from '@/constant';
import { formatChooseData } from '@/util/common';
import { getName } from '@/util/imCommon';
import IMSDK, {
    IMMethods,
    SessionType,
    GroupMemberFilter
} from 'openim-uniapp-polyfill';
import UserItem from '@/components/UserItem/index.vue';
import ChooseIndexList from '@/components/ChooseIndexList/index.vue';
import MyAvatar from '@/components/MyAvatar/index.vue';

export default {
    components: {
        MyAvatar,
        ChooseIndexList,
        UserItem
    },
    model: {
        prop: 'show',
        event: 'change'
    },
    props: {
        show: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            SessionType: Object.freeze(SessionType),
            keyword: '',
            type: ContactChooseTypes.GetList,
            showConfirmModal: false,
            groupID: '',
            checkFriendList: [],
            disabledUserIDList: [],
            memberList: [],
            userInfo: {},
            allCell: {
                faceURL: '',
                nickname: this.$t('[Everyone]').slice(1, -1),
                groupName: this.$t('[Everyone]').slice(1, -1)
            }
        };
    },
    computed: {
        ...mapGetters([
            'storeCurrentConversation',
            'storeUserID',
            'storeSelfInfo'
        ]),
        showFriendList() {
            return formatChooseData(this.filterFriendList);
        },
        filterFriendList() {
            const newList = this.memberList.filter(
                friend =>
                    (friend.nickname.includes(this.keyword) ||
                        friend.remark.includes(this.keyword)) &&
                    friend.userID !== this.storeUserID
            );
            return newList;
        },
        checkUserIDList() {
            return this.checkFriendList.map(v => v.userID);
        },
        showCheckFriendList() {
            return this.checkFriendList.slice(-6);
        }
    },
    async created() {
        const { groupID } = this.storeCurrentConversation;
        this.groupID = groupID;
        if (groupID) {
            const { data } = await IMSDK.asyncApi(
                IMMethods.GetGroupMemberList,
                IMSDK.uuid(),
                {
                    groupID,
                    filter: GroupMemberFilter.All,
                    offset: 0,
                    count: 100
                }
            );
            let info = {};
            this.memberList = data;
            this.memberList.forEach(item => {
                item.remark = getName(item);
                if (item.userID === this.storeSelfInfo.userID) {
                    info = item;
                }
            });
            this.userInfo = {
                ...this.storeSelfInfo,
                ...info
            };
            console.log(
                'this.memberList------this.memberList',
                this.memberList
            );
        }
    },
    methods: {
        itemClick() {
            this.$emit('confirm', [...this.filterFriendList], 'all');
        },
        close() {
            this.$emit('change', false);
        },
        open() {
            this.$emit('change', true);
        },
        updateCheckedUser(val) {
            const idx = this.checkFriendList.findIndex(
                v => v.userID === val.userID
            );
            if (idx > -1) {
                this.checkFriendList.splice(idx, 1);
            } else {
                this.checkFriendList.push(val);
            }
        },
        confirm() {
            this.$emit('confirm', [...this.checkFriendList]);
            this.checkFriendList = [];
        }
    }
};
</script>

<style lang="scss" scoped>
.groupMemberList {
    height: 600px;
    background-color: $uni-bg-color-grey;
    padding: 0 20rpx;
    @include colBox(false);
    /deep/ .u-index-list__letter {
        display: none;
    }
    .search_box {
        height: 100rpx;
        background-color: $uni-bg-color !important;
        border-radius: 20rpx 20rpx 0 0;
        padding: 0 20rpx;
        @include vCenterBox();
        /deep/.u-avatar {
            border-radius: 30rpx;
            overflow: hidden;
        }
        .uni-searchbar {
            flex: 1;
            min-width: 200rpx;
            /deep/.uni-searchbar__box {
                justify-content: flex-start;
                background-color: $uni-bg-color !important;
            }
        }
    }
    /deep/.u-index-list {
        margin-top: 2rpx;
        padding-top: 30rpx;
        .u-index-list__letter {
            padding-right: 33rpx;
        }
    }
    .all {
        padding-left: 95rpx;
        background-color: $uni-bg-color !important;
        border: none !important;
    }
}
</style>

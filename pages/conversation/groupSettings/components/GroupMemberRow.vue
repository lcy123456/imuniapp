<template>
    <view class="member_row">
        <view class="member_title">
            <view
                class="member_desc"
                @click.stop="inviteMember"
            >
                <image
                    src="/static/images/contact_add_search_user.png"
                    class="w-44 h-44"
                />
                <text class="ml-20 primary">
                    邀请新成员
                </text>
            </view>
            <text class="text-grey">
                {{ `${memberCount}位成员` }}
            </text>
        </view>
        <u-swipe-action
            ref="swipeActionRef"
            class="member_list"
        >
            <!-- v-if="getSwipOptions(v)" -->
            <u-swipe-action-item
                v-for="v in list"
                :key="v.userID"
                :options="getSwipOptions(v)"
                :disabled="getDisabled(v)"
                @click="swipeClick($event, v)"
            >
                <UserItem
                    :item="v"
                    light-self
                    @itemClick="userClick"
                />
            </u-swipe-action-item>
        </u-swipe-action>
    </view>
</template>

<script>
import { mapGetters } from 'vuex';
import { ContactChooseTypes } from '@/constant';
import UserItem from '@/components/UserItem/index.vue';
import { GroupMemberRole } from 'openim-uniapp-polyfill';

export default {
    name: '',
    components: {
        UserItem,
    },
    props: {
        list: {
            type: Array,
            default: () => [],
        },
        isOwner: {
            type: Boolean,
            default: false,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        memberCount: {
            type: Number,
            default: 0,
        },
        groupID: {
            type: String,
            default: '',
        },
    },
    data () {
        return {};
    },
    computed: {
        ...mapGetters(['storeCurrentUserID']),
        isNormal () {
            return !this.isOwner && !this.isAdmin;
        },
    },
    methods: {
        // toMemberList () {
        //     uni.navigateTo({
        //         url: `/pages/conversation/groupMemberList/index?type=${GroupMemberListTypes.Preview}&groupID=${this.groupID}`,
        //     });
        // },
        // kickMember () {
        //     uni.navigateTo({
        //         url: `/pages/conversation/groupMemberList/index?type=${GroupMemberListTypes.Kickout}&groupID=${this.groupID}`,
        //     });
        // },
        inviteMember () {
            uni.navigateTo({
                url: `/pages/common/contactChoose/index?type=${ContactChooseTypes.Invite}&groupID=${this.groupID}`,
            });
        },
        getDisabled (v) {
            if (v.roleLevel === GroupMemberRole.Owner) {
                return true;
            } else if (GroupMemberRole.Admin === v.roleLevel && this.isAdmin) {
                return true;
            } else if (this.isNormal) {
                return true;
            }
            return false;
        },
        getSwipOptions (v) {
            const swipeOptions = [
                {
                    text: '设置管理员',
                    style: {
                        backgroundColor: '#37abec',
                    },
                },
                {
                    text: '删除',
                    style: {
                        backgroundColor: '#ec4b37',
                    },
                },
            ];
            if (this.isOwner) {
                swipeOptions[0].text = `${
                    GroupMemberRole.Admin === v.roleLevel ? '取消' : '设置'
                }管理员`;
            } else if (this.isAdmin) {
                swipeOptions.shift();
            }
            return swipeOptions;
        },
        swipeClick ({ index }, v) {
            let temp = index;
            if (!this.isOwner) temp += 1;
            switch (temp) {
            case 0:
                this.$emit('admin', v);
                break;
            case 1:
                this.$emit('kick', v);
                break;
            }
            
            this.$refs.swipeActionRef.closeAll();
        },
        userClick (member) {
            let url = '/pages/common/userCard/index';
            if (this.storeCurrentUserID === member.userID) {
                url = '/pages/profile/selfInfo/index';
            }
            uni.$u.route(url, {
                sourceID: member.userID,
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.member_row {
    @include colBox(false);
    background-color: $uni-bg-color;
    border-radius: 30rpx;
    // flex: 1;
    overflow: hidden;

    .member_title {
        @include btwBox();
        padding: 30rpx 20rpx;

        .member_desc {
            @include vCenterBox();
        }
    }
    .member_list {
        flex: 1;
        overflow-y: auto;
    }
}
</style>

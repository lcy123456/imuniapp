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
                <text class="ml-20 primary ">
                    邀请新成员
                </text>
            </view>
            <text class="text-grey">
                {{ `${memberCount}位成员` }}
            </text>
        </view>
        <u-swipe-action class="member_list">
            <template v-for="member in list">
                <u-swipe-action-item
                    v-if="getSwipOptions(member)"
                    :key="member.userID" 
                    :options="getSwipOptions(member)"
                    @click="swipeClick(member)"
                >
                    <UserItem
                        :item="member"
                        @itemClick="userClick"
                    />
                </u-swipe-action-item>
                <UserItem
                    v-else
                    :key="member.userID"
                    :item="member"
                    @itemClick="userClick"
                />
            </template>
        </u-swipe-action>
    </view>
</template>

<script>
import { ContactChooseTypes } from "@/constant";
import UserItem from "@/components/UserItem/index.vue";
import { GroupMemberRole } from 'openim-uniapp-polyfill';

export default {
    name: "",
    components: {
        UserItem
    },
    props: {
        list: {
            type: Array,
            default: () => []
        },
        isOwner: {
            type: Boolean,
            default: false
        },
        isAdmin: {
            type: Boolean,
            default: false
        },
        memberCount: {
            type: Number,
            default: 0
        },
        groupID: {
            type: String,
            default: ''
        },
    },
    data () {
        return {
            swipeOptions: [
                {
                    text: '删除',
                    style: {
                        backgroundColor: '#ec4b37',
                    },
                },
            ],
        };
    },
    computed: {
        isNormal () {
            return !this.isOwner && !this.isAdmin;
        }
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
        getSwipOptions (member) {
            if (this.isOwner && [GroupMemberRole.Owner].includes(member.roleLevel)) {
                return false;
            } else if (this.isAdmin && [GroupMemberRole.Owner, GroupMemberRole.Admin].includes(member.roleLevel)) {
                return false;
            } else if (this.isNormal) {
                return false;
            }
            return this.swipeOptions;
        },
        swipeClick (member) {
            this.$emit('kick', member);
        },
        userClick (member) {
            uni.$u.route("/pages/common/userCard/index", {
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
  flex: 1;
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

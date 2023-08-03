<template>
  <view @click="toMemberList" class="member_row">
    <view class="member_title">
      <text>群成员</text>
      <view class="member_desc">
        <text>{{ `${memberCount}人` }}</text>
        <u-icon name="arrow-right" color="#999" size="16" />
      </view>
    </view>
    <view class="member_list">
      <my-avatar
        v-for="member in groupMemberList"
        :src="member.faceURL"
        :desc="member.nickname"
        :key="member.userID"
        class="member_item"
        size="42"
      />
      <image
        style="width: 36px; height: 36px; min-width: 36px"
        @click.stop="inviteMember"
        class="member_item"
        src="@/static/images/group_setting_invite.png"
        alt=""
      />
      <image
        style="width: 36px; height: 36px; min-width: 36px"
        @click.stop="kickMember"
        v-if="!isNomal"
        class="member_item"
        src="@/static/images/group_setting_remove.png"
        alt=""
      />
    </view>
  </view>
</template>

<script>
import IMSDK from "openim-uniapp-polyfill";
import MyAvatar from "@/components/MyAvatar/index.vue";
import { ContactChooseTypes, GroupMemberListTypes } from "@/constant";
export default {
  name: "",
  components: {
    MyAvatar,
  },
  props: {
    isNomal: Boolean,
    memberCount: Number,
    groupID: String,
  },
  data() {
    return {
      groupMemberList: [],
    };
  },
  watch: {
    memberCount() {
      this.getGroupMemberList();
    },
  },
  mounted() {
    this.getGroupMemberList();
  },
  methods: {
    getGroupMemberList() {
      IMSDK.asyncApi(IMSDK.IMMethods.GetGroupMemberList, IMSDK.uuid(), {
        groupID: this.groupID,
        filter: 0,
        offset: 0,
        count: this.isNomal ? 6 : 5,
      }).then(({ data }) => {
        console.log(data);
        this.groupMemberList = [...data];
      }).catch((err) => {
        console.log(err);
      })
    },
    toMemberList() {
      uni.navigateTo({
        url: `/pages/conversation/groupMemberList/index?type=${GroupMemberListTypes.Preview}&groupID=${this.groupID}`,
      });
    },
    inviteMember() {
      uni.navigateTo({
        url: `/pages/common/contactChoose/index?type=${ContactChooseTypes.Invite}&groupID=${this.groupID}`,
      });
    },
    kickMember() {
      uni.navigateTo({
        url: `/pages/conversation/groupMemberList/index?type=${GroupMemberListTypes.Kickout}&groupID=${this.groupID}`,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.member_row {
  @include colBox(false);
  padding: 36rpx 44rpx;
  margin: 12rpx 0;
  background-color: #fff;
  color: $uni-text-color;

  .member_title {
    @include btwBox();

    .member_desc {
      @include vCenterBox();
      font-size: 26rpx;
    }
  }

  .member_list {
    @include vCenterBox();
    margin-top: 24rpx;

    .member_item {
      margin-right: 16rpx;
    }
  }
}
</style>

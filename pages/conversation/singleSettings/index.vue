<template>
    <view class="single_settings_container">
        <custom-nav-bar title="聊天设置" />

        <view class="row_wrap">
            <view class="setting_row info_row">
                <view
                    class="user_info"
                    @click="toUserCard"
                >
                    <my-avatar
                        :src="storeCurrentConversation.faceURL"
                        :desc="storeCurrentConversation.showName"
                        size="48"
                    />
                    <text class="user_name">
                        {{ storeCurrentConversation.showName }}
                    </text>
                </view>
                <view
                    class="action"
                    @click="invite2group"
                >
                    <image
                        style="width: 48px; height: 48px"
                        src="@/static/images/single_setting_add.png"
                        alt=""
                    />
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import { mapGetters } from "vuex";
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import MyAvatar from "@/components/MyAvatar/index.vue";
import SettingItem from "@/components/SettingItem/index.vue";
export default {
    components: {
        CustomNavBar,
        MyAvatar,
        SettingItem,
    },
    props: {},
    data () {
        return {

        };
    },
    computed: {
        ...mapGetters(["storeCurrentConversation"]),
    },
    methods: {
        toUserCard () {
            uni.navigateTo({
                url: `/pages/common/userCard/index?sourceID=${this.storeCurrentConversation.userID}`,
            });
        },
        invite2group () {
            const checkedMemberList = JSON.stringify([
                {
                    userID: this.storeCurrentConversation.userID,
                    faceURL: this.storeCurrentConversation.faceURL,
                    nickname: this.storeCurrentConversation.showName,
                },
            ]);
            uni.navigateTo({
                url: `/pages/common/createGroup/index?checkedMemberList=${checkedMemberList}`,
            });
        }
    },
};
</script>

<style lang="scss" scoped>
.single_settings_container {
  @include colBox(false);
  height: 100vh;
  background-color: #f6f6f6;

  .row_wrap {
    flex: 1;
    overflow-y: auto;
  }

  .setting_row {
    background-color: #fff;
    padding: 0 44rpx;
    margin: 12rpx 0;
  }

  .info_row {
    display: flex;
    padding: 44rpx;

    .user_info {
      @include colBox(false);
      margin-right: 36rpx;

      .user_name {
        margin-top: 20rpx;
        color: #666;
      }
    }
  }

  .conversation_state_row {
    padding: 0;
    color: $uni-text-color;
  }
}
</style>

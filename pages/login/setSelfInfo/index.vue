<template>
    <view class="set_info_container  ">
        <view class="title">
            欢迎使用OpenIM
        </view>
        <view class="sub_title">
            请完善个人信息
        </view>
        <view
            class="avatar_container"
            @click="chooseAvatar"
        >
            <view class="avatar_container_wrap">
                <my-avatar
                    v-show="userInfo.faceURL"
                    size="180rpx"
                    :src="userInfo.faceURL"
                />
                <u-icon
                    v-show="!userInfo.faceURL"
                    name="camera-fill"
                    size="46"
                    color="#999"
                />
            </view>
            <view class="upload_desc">
                点击选择头像
            </view>
        </view>
        <u-form
            ref="loginForm"
            label-position="left"
            :model="userInfo"
            :rules="rules"
            label-width="160rpx"
            :label-style="{
                fontSize: '14px',
                minWidth: '200rpx',
            }"
        >
            <u-form-item
                label="你的姓名"
                prop="nickname"
                border-bottom
            >
                <u-input
                    v-model="userInfo.nickname"
                    border="none"
                    placeholder="请填写真实姓名"
                    clearable
                />
            </u-form-item>
        </u-form>
        <view class="btn">
            <u-button
                :loading="loading"
                type="primary"
                @click="doNext"
            >
                进入OpenIM
            </u-button>
        </view>
    </view>
</template>

<script>
import md5 from "md5";
import IMSDK from "openim-uniapp-polyfill";
import MyAvatar from "@/components/MyAvatar/index.vue";
import { businessRegister } from "@/api/login";
import { checkLoginError, getPurePath } from "@/util/common";
export default {
    components: {
        MyAvatar,
    },
    data () {
        return {
            loading: false,
            codeValue: "",
            passWord: "",
            userInfo: {
                phoneNumber: "",
                areaCode: "",
                nickname: "",
                faceURL: "",
            },
            rules: {
                nickname: [
                    {
                        type: "string",
                        required: true,
                        message: "请填写真实姓名",
                        trigger: ["blur", "change"],
                    },
                ],
            },
        };
    },
    onLoad (options) {
        const { userInfo, passWord, codeValue } = options;
        this.userInfo = {
            ...this.userInfo,
            ...JSON.parse(userInfo),
        };
        this.passWord = passWord;
        this.codeValue = codeValue;
    },
    onBackPress () {
        return true;
    },
    methods: {
        chooseAvatar () {
            uni.navigateTo({
                url: "/pages/login/chooseDefaultAvatar/index",
            });
        },
        getDefaultAvatar (value) {
            console.log(value);
            this.userInfo.faceURL = value;
        },
        doNext () {
            if (!this.userInfo.faceURL) {
                uni.$u.toast("请先选择头像！");
                return;
            }

            this.$refs.loginForm.validate().then((valid) => {
                if (valid) {
                    this.doRegister();
                }
            });
        },
        async doRegister () {
            this.loading = true;
            const options = {
                verifyCode: this.codeValue,
                platform: uni.$u.os() === "ios" ? 1 : 2,
                autoLogin: true,
                user: {
                    ...this.userInfo,
                    areaCode: `+${this.userInfo.areaCode}`,
                    password: md5(this.passWord),
                },
            };
            try {
                const data = await businessRegister(options);
                const { imToken, chatToken, userID } = data;
                await IMSDK.asyncApi(IMSDK.IMMethods.Login, IMSDK.uuid(), {
                    userID,
                    token: imToken,
                });
                this.saveLoginProfile(data);
                this.saveLoginInfo();
                this.$store.commit("user/SET_AUTH_DATA", data);
                this.$store.dispatch("user/getSelfInfo");
                this.$store.dispatch("conversation/getConversationList");
                this.$store.dispatch("contact/getFriendList");
                this.$store.dispatch("contact/getGrouplist");
                this.$store.dispatch("contact/getBlacklist");
                this.$store.dispatch("contact/getRecvFriendApplications");
                this.$store.dispatch("contact/getSentFriendApplications");
                this.$store.dispatch("contact/getRecvGroupApplications");
                this.$store.dispatch("contact/getSentGroupApplications");
                uni.switchTab({
                    url: "/pages/conversation/conversationList/index",
                });
            } catch (err) {
                console.log(err);
                uni.$u.toast(checkLoginError(err));
                // uni.$u.toast('注册失败')
            }
            this.loading = false;
        },
        saveLoginInfo () {
            uni.setStorage({
                key: "lastPhoneNumber",
                data: this.userInfo.phoneNumber,
            });
            uni.setStorage({
                key: "lastAreaCode",
                data: this.userInfo.areaCode,
            });
        },
        saveLoginProfile (data) {
            const { imToken, chatToken, userID } = data;
            uni.setStorage({
                key: "IMUserID",
                data: userID,
            });
            uni.setStorage({
                key: "IMToken",
                data: imToken,
            });
            uni.setStorage({
                key: "BusinessToken",
                data: chatToken,
            });
        },
    },
};
</script>
<style lang="scss" scoped>
.set_info_container {
  margin-top: var(--status-bar-height);
  padding-top: 150rpx;

  .title {
    padding-bottom: 8rpx;
  }

  .sub_title {
    color: #333333;
    padding-bottom: 0;
  }

  .avatar_container {
    margin: 100rpx 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    &_wrap {
      background-color: #d8d8d8;
      width: 180rpx;
      height: 180rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 14rpx;

      .image {
        width: 100%;
        height: 100%;
      }
    }

    .upload_desc {
      font-size: 24rpx;
      color: #999;
      margin-top: 14rpx;
    }
  }

  .btn {
    margin-top: 200rpx;
  }
}
</style>

<template>
    <view class="set_info_container">
        <CustomNavBar
            title="注册"
        />
        <view class="flex align-center mt-100 mb-5">
            <text class="fz-50 ff-bold mr-10">
                欢迎使用
            </text>
            <u--image
                src="/static/images/logo_name_blue.png"
                width="217rpx"
                height="32rpx"
            />
        </view>
        <view class="text-grey">
            请完善个人信息
        </view>
        <view
            class="avatar_container"
        >
            <view
                class="avatar_container_wrap" 
                @click="chooseAvatar"
            >
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
            :model="userInfo"
        >
            <u-form-item prop="nickname">
                <u-input
                    v-model="userInfo.nickname"
                    class="login-input"
                    placeholder="请填写您的昵称"
                    clearable
                />
            </u-form-item>
        </u-form>
        <view class="mt-280">
            <u-button
                :loading="loading"
                type="primary"
                shape="circle"
                size="large"
                class="ff-bold"
                :disabled="!isVerifyOk"
                @click="doNext"
            >
                进入MUSKIM
            </u-button>
        </view>
    </view>
</template>

<script>
import { mapGetters } from 'vuex';
import CustomNavBar from '@/components/CustomNavBar';
import md5 from 'md5';
import MyAvatar from '@/components/MyAvatar/index.vue';
import { businessRegister } from '@/api/login';
import { checkLoginError } from '@/util/common';
import { IMLogin } from '@/util/imCommon';

export default {
    components: {
        CustomNavBar,
        MyAvatar,
    },
    data () {
        return {
            loading: false,
            codeValue: '',
            passWord: '',
            userInfo: {
                phoneNumber: '',
                areaCode: '',
                nickname: '',
                faceURL: '',
            },
        };
    },
    computed: {
        ...mapGetters(['storeClientID']),
        isVerifyOk () {
            return this.userInfo.faceURL && this.userInfo.nickname;
        }
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
                url: '/pages/login/chooseDefaultAvatar/index',
            });
        },
        getDefaultAvatar (value) {
            console.log(value);
            this.userInfo.faceURL = value;
        },
        async doNext () {
            try {
                this.loading = true;
                const options = {
                    verifyCode: this.codeValue,
                    platform: uni.$u.os() === 'ios' ? 1 : 2,
                    autoLogin: true,
                    user: {
                        ...this.userInfo,
                        areaCode: `+${this.userInfo.areaCode}`,
                        password: md5(this.passWord),
                    },
                    cid: this.storeClientID
                };
                this.saveLoginInfo();
                const data = await businessRegister(options);
                this.$store.commit('user/SET_AUTH_DATA', data);
                await IMLogin();
            } catch (err) {
                this.loading = false;
                console.log(err);
                uni.$u.toast(checkLoginError(err));
                // uni.$u.toast('注册失败')
            }
        },
        saveLoginInfo () {
            uni.setStorageSync('lastPhoneNumber', this.userInfo.phoneNumber);
            uni.setStorageSync('lastAreaCode', this.userInfo.areaCode);
        },
    },
};
</script>
<style lang="scss" scoped>
.set_info_container {
    padding: 0 30rpx;

    .avatar_container {
        margin: 70rpx 0;
        &_wrap {
            background-color: #d8d8d8;
            width: 180rpx;
            height: 180rpx;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 14rpx;
            margin: 0 auto;
        }

        .upload_desc {
            text-align: center;
            font-size: 24rpx;
            color: $uni-text-color-grey;
            margin-top: 14rpx;
        }
    }
    /deep/.login-input .u-input__content__field-wrapper__field {
        text-align: center !important;
    }
}
</style>

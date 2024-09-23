<template>
    <view class="set_info_container">
        <CustomNavBar :title="$t('Register')" />
        <view class="flex mb-5 align-center mt-100">
            <text class="mr-10 fz-50 ff-bold">
                {{ $t('Welcome_to_use') }}
            </text>
            <u--image
                src="/static/images/logo_name_blue.png"
                width="217rpx"
                height="32rpx"
            />
        </view>
        <view class="text-grey">
            {{ $t('Please_complete_personal_information') }}
        </view>
        <view class="avatar_container">
            <view class="avatar_container_wrap" @click="chooseAvatar">
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
                {{ $t('Click_to_select_avatar') }}
            </view>
        </view>
        <u-form ref="loginForm" :model="userInfo">
            <u-form-item prop="nickname">
                <u-input
                    v-model="userInfo.nickname"
                    class="login-input"
                    :placeholder="$t('Please_fill_in_your_nickname')"
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
                {{ $t('Register_now') }}
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
        MyAvatar
    },
    data() {
        return {
            loading: false,
            codeValue: '',
            passWord: '',
            userInfo: {
                phoneNumber: '',
                areaCode: '',
                nickname: '',
                faceURL: ''
            }
        };
    },
    computed: {
        ...mapGetters(['storeClientID']),
        isVerifyOk() {
            // return this.userInfo.faceURL && this.userInfo.nickname;
            return this.userInfo.nickname;
        }
    },
    onLoad(options) {
        const { userInfo, passWord, codeValue } = options;
        this.userInfo = {
            ...this.userInfo,
            ...JSON.parse(userInfo)
        };
        this.passWord = passWord;
        this.codeValue = codeValue;
    },
    onBackPress() {
        return true;
    },
    methods: {
        chooseAvatar() {
            uni.navigateTo({
                url: '/pages/login/chooseDefaultAvatar/index'
            });
        },
        getDefaultAvatar(value) {
            this.userInfo.faceURL = value;
        },
        async doNext() {
            try {
                this.loading = true;
                let passWord = md5(this.passWord);
                const options = {
                    phoneNumber: this.userInfo.phoneNumber,
                    areaCode: `+${this.userInfo.areaCode}`,
                    password: passWord,
                    verifyCode: this.codeValue,
                    platform: uni.$u.os() === 'ios' ? 1 : 2,
                    autoLogin: true,
                    invitationCode: this.userInfo.invitationCode,
                    user: {
                        ...this.userInfo,
                        areaCode: `+${this.userInfo.areaCode}`,
                        password: passWord
                    },
                    cid: this.storeClientID
                };
                this.saveLoginInfo();
                const data = await businessRegister(options);
                this.$store.commit('user/SET_AUTH_DATA', data);
                this.$store.commit('user/SET_USER_LIST', {
                    ...data,
                    ...options
                });
                await IMLogin('login');
                this.loading = false;
            } catch (err) {
                this.loading = false;
                uni.$u.toast(checkLoginError(err));
                // uni.$u.toast('注册失败')
            }
        },
        saveLoginInfo() {
            uni.setStorageSync('lastPhoneNumber', this.userInfo.phoneNumber);
            uni.setStorageSync('lastAreaCode', this.userInfo.areaCode);
        }
    }
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

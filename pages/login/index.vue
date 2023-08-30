<template>
    <view class="page_container">
        <view class="login">
            <view class="navbar-height" />
            <view class="box-logo">
                <image
                    class="logo w-130 h-120"
                    src="/static/images/logo@2x.png"
                />
                <image
                    class="w-249 h-37"
                    src="/static/images/logo_name.png"
                />
            </view>
            <u-form
                ref="loginForm"
                class="loginForm"
                :model="loginInfo"
                :rules="rules"
                label-width="0"
            >
                <u-form-item prop="phoneNumber">
                    <view
                        class="phoneNumber_areacode"
                        @click="showPicker"
                    >
                        <u--image
                            src="/static/images/logo@2x.png"
                            width="58rpx"
                            height="58rpx"
                            shape="circle"
                            mode="center"
                        />
                        <text class="areacode_content">
                            +{{ loginInfo.areaCode }}
                        </text>
                        <u-icon
                            class="arrow_down"
                            name="arrow-down"
                        />
                    </view>
                    <u-input
                        v-model="loginInfo.phoneNumber"
                        class="login-input"
                        placeholder="请输入您的手机号码"
                        clearable
                    />
                </u-form-item>
                <u-form-item prop="password">
                    <u-input
                        v-model="loginInfo.password"
                        class="login-input"
                        placeholder="请输入您的登录密码"
                        :password="!eying"
                    >
                        <u-icon
                            slot="suffix"
                            :name="eying ? 'eye-off' : 'eye'"
                            @click="updateEye"
                        />
                    </u-input>
                </u-form-item>
            </u-form>
            <view class="mt-95">
                <u-button
                    :loading="loading"
                    type="primary"
                    :disabled="!canLogin"
                    shape="circle"
                    size="large"
                    @click="startLogin"
                >
                    登录
                </u-button>
            </view>
            <view class="agreement">
                <u-checkbox-group v-model="checked">
                    <u-checkbox
                        icon-size="12"
                        label-size="12"
                        shape="circle"
                        label="我已阅读并同意："
                        :name="true"
                    />
                </u-checkbox-group>
                <text class="detail">
                    服务协议
                </text>
                <text>与</text>
                <text class="detail">
                    隐私政策
                </text>
            </view>

            <AreaPicker
                ref="AreaPicker"
                @chooseArea="chooseArea"
            />
        </view>

        <view class="action_bar">
            <text
                class="primary"
                @click="toRegisterOrForget(SmsUserFor.Reset)"
            >
                忘记密码
            </text>
            <view class="mt-43">
                <text class="text-grey">
                    没有账号？
                </text>
                <text
                    class="primary"
                    @click="toRegisterOrForget(SmsUserFor.Register)"
                >
                    立即注册
                </text>
            </view>
        </view>
    </view>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';
import md5 from 'md5';
import { businessLogin } from '@/api/login';
import AreaPicker from '@/components/AreaPicker';
import { checkLoginError } from '@/util/common';
import IMSDK from 'openim-uniapp-polyfill';
import { SmsUserFor } from '@/constant';

export default {
    components: {
        AreaPicker,
    },
    data () {
        return {
            SmsUserFor,
            loginInfo: {
                phoneNumber: '',
                password: '',
                areaCode: '86',
                verificationCode: undefined,
            },
            checked: [true],
            eying: false,
            loading: false,
            rules: {
                password: [
                    {
                        type: 'string',
                        required: true,
                        message: '密码不能为空',
                        trigger: ['blur', 'change'],
                    },
                ],
                phoneNumber: [
                    {
                        type: 'string',
                        required: true,
                        message: '手机号码不能为空',
                        trigger: ['blur', 'change'],
                    },
                ],
            },
        };
    },
    computed: {
        canLogin () {
            return (
                this.checked[0] &&
                this.loginInfo.phoneNumber &&
                this.loginInfo.password
            );
        },
    },
    onLoad () {
        this.init();
    },
    methods: {
        init () {
            // if (process.env.NODE_ENV === 'development') {
            this.loginInfo.phoneNumber =
				uni.getStorageSync('lastPhoneNumber') || '';
            this.loginInfo.areaCode =
				uni.getStorageSync('lastAreaCode') || '86';
            // } else {
            //     this.loginInfo.phoneNumber = '';
            //     this.loginInfo.password = '';
            // }
        },
        updateEye () {
            this.eying = !this.eying;
        },
        async startLogin () {
            this.$refs.loginForm.validate().then(async () => {
                this.loading = true;
                this.saveLoginInfo();
                let data = {};
                try {
                    data = await businessLogin({
                        phoneNumber: this.loginInfo.phoneNumber,
                        areaCode: `+${this.loginInfo.areaCode}`,
                        password: md5(this.loginInfo.password),
                        platform: uni.$u.os() === 'ios' ? 1 : 2,
                        verifyCode: this.loginInfo.verificationCode,
                    });
                } catch (err) {
                    console.error(err);
                    uni.$u.toast(checkLoginError(err));
                    this.loading = false;
                    return;
                }
                console.log('login', data);
                const { imToken, userID } = data;
                await IMSDK.asyncApi(IMSDK.IMMethods.Login, uuidv4(), {
                    userID,
                    token: imToken,
                });

                this.saveLoginProfile(data);
                this.$store.commit('user/SET_AUTH_DATA', data);
                this.$store.dispatch('user/getSelfInfo');
                this.$store.dispatch('conversation/getConversationList');
                this.$store.dispatch('conversation/getUnReadCount');
                this.$store.dispatch('contact/getFriendList');
                this.$store.dispatch('contact/getGrouplist');
                this.$store.dispatch('contact/getBlacklist');
                this.$store.dispatch('contact/getRecvFriendApplications');
                this.$store.dispatch('contact/getSentFriendApplications');
                this.$store.dispatch('contact/getRecvGroupApplications');
                this.$store.dispatch('contact/getSentGroupApplications');
                uni.switchTab({
                    url: '/pages/conversation/conversationList/index',
                });
                this.loginInfo.password = '';
                this.loading = false;
            });
        },
        saveLoginProfile (data) {
            const { imToken, chatToken, userID, cryptoPadding } = data;
            uni.setStorageSync('IMUserID', userID);
            uni.setStorageSync('IMToken', imToken);
            uni.setStorageSync('BusinessToken', chatToken);
            uni.setStorageSync('CryptoPadding', cryptoPadding);
        },
        saveLoginInfo () {
            uni.setStorageSync('lastPhoneNumber', this.loginInfo.phoneNumber);
            uni.setStorageSync('lastAreaCode', this.loginInfo.areaCode);
        },
        showPicker () {
            this.$refs.AreaPicker.init();
        },
        chooseArea (areaCode) {
            this.loginInfo.areaCode = areaCode;
        },
        toRegisterOrForget (val) {
            uni.$u.route('/pages/login/registerOrForget/index', {
                usedFor: val
            });
        },
    },
};
</script>
<style lang="scss" scoped>
.page_container {
    justify-content: space-between;

    .login {
        color: #333333;
        padding: 0 30rpx 0;

        .loginForm {

            .eye {
                .image {
                    width: 44rpx;
                    height: 32rpx;
                }
            }

            .code_btn {
                color: $u-primary;
            }
        }

        .other {
            margin-top: 29rpx;
            font-size: 24rpx;
            font-weight: 400;
            color: $u-primary;
        }
    }

    .action_bar {
        display: flex;
		flex-direction: column;
        align-items: center;
        margin-bottom: 96rpx;
        font-size: 30rpx;
        font-weight: 400;
    }
}
</style>

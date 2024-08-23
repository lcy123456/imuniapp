<template>
    <view class="page_container">
        <view class="login">
            <view class="navbar-height-all" />
            <view class="box-logo" @click="chooseDomain">
                <image class="logo w-130 h-120" src="/static/images/logo.png" />
                <image class="w-249 h-37" src="/static/images/logo_name.png" />
            </view>
            <u-form
                ref="loginForm"
                class="loginForm"
                :model="loginInfo"
                :rules="rules"
                label-width="0"
            >
                <u-form-item prop="phoneNumber">
                    <view class="phoneNumber_areacode" @click="showPicker">
                        <u--image
                            src="/static/images/logo.png"
                            width="58rpx"
                            height="58rpx"
                            shape="circle"
                            mode="center"
                        />
                        <text class="areacode_content">
                            +{{ loginInfo.areaCode }}
                        </text>
                        <u-icon class="arrow_down" name="arrow-down" />
                    </view>
                    <u-input
                        v-model="loginInfo.phoneNumber"
                        class="login-input"
                        :placeholder="$t('Please_enter_your_mobile_number')"
                        type="number"
                        clearable
                    />
                    <input
                        v-model="loginInfo.phoneNumber"
                        class="input-hidden"
                        placeholder="防止密码回填"
                        type="number"
                        clearable
                    />
                </u-form-item>
                <u-form-item prop="password">
                    <u-input
                        v-model="loginInfo.password"
                        class="login-input"
                        :placeholder="$t('Please_enter_your_login_password')"
                        :password="!eying"
                        clearable
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
                    {{ $t('Login') }}
                </u-button>
            </view>
            <view class="agreement">
                <u-checkbox-group v-model="checked">
                    <u-checkbox
                        icon-size="12"
                        label-size="12"
                        shape="circle"
                        :label="$t('I_have_read_and_agreed_to')"
                        :name="true"
                    />
                </u-checkbox-group>
                <text
                    class="detail"
                    @click="
                        handleGoToPolicy('/pages/login/servicePolicy/index')
                    "
                >
                    {{ $t('Service_Agreement') }}
                </text>
                <text>、</text>
                <text
                    class="detail"
                    @click="
                        handleGoToPolicy('/pages/login/privacyPolicy/index')
                    "
                >
                    {{ $t('Privacy_Policy') }}
                </text>
            </view>

            <AreaPicker ref="AreaPicker" @chooseArea="chooseArea" />
        </view>

        <view class="action_bar">
            <text class="primary" @click="toRegisterOrForget(SmsUserFor.Reset)">
                {{ $t('Forgot_password') }}
            </text>
            <view class="mt-43">
                <text class="text-grey"> {{ $t('No_account') }} </text>
                <text
                    class="primary"
                    @click="toRegisterOrForget(SmsUserFor.Register)"
                >
                    {{ $t('Register_now') }}
                </text>
            </view>
        </view>
    </view>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex';
import md5 from 'md5';
import AreaPicker from '@/components/AreaPicker';
import { checkLoginError, getPhoneReg } from '@/util/common';
import { login } from '@/util/imCommon';
import { SmsUserFor } from '@/constant';

let timer;

export default {
    components: {
        AreaPicker
    },
    data() {
        return {
            SmsUserFor,
            domainCount: 0,
            loginInfo: {
                phoneNumber: '',
                password: '',
                areaCode: '1',
                verificationCode: undefined
            },
            checked: [true],
            eying: false,
            loading: false,
            rules: {
                password: [
                    {
                        type: 'string',
                        required: true,
                        message: this.$t('Password_cannot_be_empty'),
                        trigger: ['blur', 'change']
                    }
                ],
                phoneNumber: [
                    {
                        required: true,
                        message: this.$t('Mobile_number_cannot_be_empty'),
                        trigger: ['blur', 'change']
                    },
                    {
                        validator: (rule, value) => {
                            return getPhoneReg(
                                `+${this.loginInfo.areaCode}`
                            ).test(value);
                        },
                        message: this.$t(
                            'Please_enter_the_correct_mobile_number'
                        ),
                        trigger: ['change', 'blur']
                    }
                ]
            }
        };
    },
    computed: {
        ...mapGetters(['storeClientID', 'storeIsProd']),
        canLogin() {
            return (
                this.checked[0] &&
                this.loginInfo.phoneNumber &&
                this.loginInfo.password
            );
        }
    },
    onLoad() {
        this.init();
    },
    methods: {
        ...mapMutations('user', ['SET_IS_PROD']),
        init() {
            // if (process.env.NODE_ENV === 'development') {
            this.loginInfo.phoneNumber =
                uni.getStorageSync('lastPhoneNumber') || '';
            this.loginInfo.areaCode = uni.getStorageSync('lastAreaCode') || '1';
            // } else {
            //     this.loginInfo.phoneNumber = '';
            //     this.loginInfo.password = '';
            // }
        },
        chooseDomain() {
            this.domainCount = this.domainCount + 1;
            clearTimeout(timer);
            if (this.domainCount === 20) {
                this.SET_IS_PROD();
                this.$toast(
                    `${this.storeIsProd ? '生产' : '测试'}环境；渠道环境：${
                        plus.runtime.channel
                    }`
                );
            }
            timer = setTimeout(() => {
                this.domainCount = 0;
            }, 2000);
        },
        updateEye() {
            this.eying = !this.eying;
        },
        async startLogin() {
            this.$refs.loginForm.validate().then(async () => {
                try {
                    this.loading = true;
                    this.saveLoginInfo();
                    const requestMap = {
                        phoneNumber: this.loginInfo.phoneNumber,
                        areaCode: `+${this.loginInfo.areaCode}`,
                        password: md5(this.loginInfo.password),
                        platform: uni.$u.os() === 'ios' ? 1 : 2,
                        verifyCode: this.loginInfo.verificationCode,
                        cid: this.storeClientID
                    };
                    let data = await login(requestMap);
                    if (!data) {
                        this.loading = false;
                    }
                } catch (err) {
                    console.error(err);
                    uni.$u.toast(checkLoginError(err));
                    this.loading = false;
                    return;
                }
            });
        },
        saveLoginInfo() {
            uni.setStorageSync('lastPhoneNumber', this.loginInfo.phoneNumber);
            uni.setStorageSync('lastAreaCode', this.loginInfo.areaCode);
        },
        showPicker() {
            this.$refs.AreaPicker.init();
        },
        chooseArea(areaCode) {
            this.loginInfo.areaCode = areaCode;
        },
        toRegisterOrForget(val) {
            uni.$u.route('/pages/login/registerOrForget/index', {
                usedFor: val
            });
        },
        handleGoToPolicy(url) {
            uni.$u.route(url);
        }
    }
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

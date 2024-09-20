<template>
    <view class="register_container">
        <CustomNavBar
            :title="isRegister ? $t('Register') : $t('Forgot_password')"
        />
        <view class="box-logo">
            <image class="logo w-130 h-120" src="/static/images/logo.png" />
            <image class="w-249 h-37" src="/static/images/logo_name.png" />
        </view>
        <u-form
            v-if="isRegister"
            ref="registerForm"
            label-position="top"
            :model="userInfo"
            :rules="rules"
        >
            <u-form-item prop="account">
                <u-input
                    v-model="userInfo.account"
                    class="login-input"
                    :placeholder="$t('Please_fill_in_your_nickname')"
                    clearable
                />
                <!-- <view class="phoneNumber_areacode" @click="showPicker">
                    <u--image
                        src="/static/images/logo.png"
                        width="58rpx"
                        height="58rpx"
                        shape="circle"
                        mode="center"
                    />
                    <text class="areacode_content">
                        +{{ userInfo.areaCode }}
                    </text>
                    <u-icon class="arrow_down" name="arrow-down" />
                </view>
                <u-input
                    v-model="userInfo.phoneNumber"
                    type="number"
                    class="login-input"
                    :placeholder="$t('Please_enter_your_mobile_number')"
                    clearable
                /> -->
            </u-form-item>
            <u-form-item prop="password">
                <u-input
                    v-model="userInfo.password"
                    class="login-input"
                    :placeholder="$t('Please_enter_new_login_password')"
                    :password="!passwordEying"
                >
                    <u-icon
                        slot="suffix"
                        :name="passwordEying ? 'eye-off' : 'eye'"
                        @click="updateEye('passwordEying')"
                    />
                </u-input>
            </u-form-item>
            <u-form-item prop="confirmPassword">
                <u-input
                    v-model="userInfo.confirmPassword"
                    class="login-input"
                    :placeholder="$t('Confirm_new_login_password_again')"
                    :password="!comfirmEying"
                >
                    <u-icon
                        slot="suffix"
                        :name="comfirmEying ? 'eye-off' : 'eye'"
                        @click="updateEye('comfirmEying')"
                    />
                </u-input>
            </u-form-item>
            <u-form-item prop="invitationCode">
                <u-input
                    v-model="userInfo.invitationCode"
                    class="login-input"
                    :placeholder="`${$t('Please_enter_your_invitation_code')}${
                        needInvitationCodeRegister
                            ? `(${$t('Required')})`
                            : `(${$t('Optional')})`
                    }`"
                    clearable
                />
            </u-form-item>
        </u-form>

        <u-form
            v-else
            ref="registerForm"
            label-position="top"
            :model="userInfo"
            :rules="rules"
        >
            <u-form-item prop="email">
                <u-input
                    v-model="userInfo.email"
                    type="text"
                    class="login-input"
                    :placeholder="$t('Please_enter_your_email_address')"
                    clearable
                />
            </u-form-item>
        </u-form>
        <view class="mt-95">
            <u-button
                type="primary"
                :disabled="!canLogin"
                shape="circle"
                size="large"
                :loading="loading"
                @click="sendSms"
            >
                {{ isRegister ? 'SUMI.CHAT' : $t('Get_verification_code') }}
            </u-button>
        </view>
        <view v-if="isRegister" class="agreement">
            <u-checkbox-group v-model="checked">
                <u-checkbox
                    icon-size="12"
                    label-size="12"
                    shape="circle"
                    :label="$t('I_have_read_and_agreed_to')"
                    :name="true"
                />
            </u-checkbox-group>
            <text class="detail"> {{ $t('Service_Agreement') }} </text>
            <text>与</text>
            <text class="detail"> {{ $t('Privacy_Policy') }} </text>
        </view>
        <AreaPicker ref="AreaPicker" @chooseArea="chooseArea" />
    </view>
</template>

<script>
import { mapGetters } from 'vuex';
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import AreaPicker from '@/components/AreaPicker';
import { businessSendSms, emailSendCode, businessRegister } from '@/api/login';
import { SmsUserFor } from '@/constant';
import { checkLoginError, getPhoneReg } from '@/util/common';
import { IMLogin } from '@/util/imCommon';
import { regMap } from '@/enum';
import md5 from 'md5';

export default {
    components: {
        CustomNavBar,
        AreaPicker
    },
    data() {
        return {
            usedFor: 0,
            passwordEying: false,
            comfirmEying: false,
            userInfo: {
                faceURL: '',
                account: '',
                nickname: '',
                password: '',
                confirmPassword: '',
                invitationCode: null
            },
            checked: [true],
            rules: {
                account: [
                    {
                        type: 'string',
                        required: true,
                        message: this.$t('Please_fill_in_your_nickname'),
                        trigger: ['blur', 'change']
                    }
                ],
                password: [
                    {
                        type: 'string',
                        required: true,
                        message: this.$t('Please_enter_new_login_password'),
                        trigger: ['blur', 'change']
                    },
                    {
                        validator: (rule, value) => {
                            return regMap.pwd.test(value);
                        },
                        message: this.$t('must_contain_letters_and_numbers'),
                        trigger: ['change', 'blur']
                    }
                ],
                confirmPassword: [
                    {
                        type: 'string',
                        required: true,
                        message: this.$t('Confirm_new_login_password_again'),
                        trigger: ['blur', 'change']
                    },
                    {
                        validator: (rule, value) => {
                            console.log('---', this.userInfo.password, value);
                            return this.userInfo.password === value;
                        },
                        message: this.$t('Two_passwords_are_different'),
                        trigger: ['change', 'blur']
                    }
                ]
            },
            loading: false
        };
    },
    computed: {
        ...mapGetters(['storeClientID']),
        needInvitationCodeRegister() {
            return this.$store.getters.storeAppConfig
                .needInvitationCodeRegister;
        },
        isRegister() {
            return SmsUserFor.Register === this.usedFor;
        },
        canLogin() {
            return (
                (this.isRegister ? this.checked[0] : true) &&
                (this.isRegister ? this.userInfo.account : this.userInfo.email)
            );
        }
    },
    onLoad(options) {
        this.usedFor = Number(options.usedFor);
        this.checkInvitationCodeState();
    },
    methods: {
        updateEye(key) {
            this[key] = !this[key];
        },
        checkInvitationCodeState() {
            if (this.needInvitationCodeRegister) {
                this.rules = {
                    ...this.rules,
                    invitationCode: [
                        {
                            type: 'string',
                            required: true,
                            message: this.$t(
                                'Please_enter_your_invitation_code'
                            ),
                            trigger: ['blur', 'change']
                        }
                    ]
                };
            }
        },
        sendSms() {
            this.$refs.registerForm.validate().then(async () => {
                try {
                    this.loading = true;
                    if (this.isRegister) {
                        let password = md5(this.userInfo.password);
                        const options = {
                            password,
                            platform: uni.$u.os() === 'ios' ? 1 : 2,
                            autoLogin: true,
                            invitationCode: this.userInfo.invitationCode,
                            user: {
                                ...this.userInfo,
                                nickname: this.userInfo.account,
                                password
                            },
                            cid: this.storeClientID
                        };
                        console.log('options---options', options);
                        // this.saveLoginInfo();
                        const data = await businessRegister(options);
                        this.$store.commit('user/SET_AUTH_DATA', data);
                        this.$store.commit('user/SET_USER_LIST', {
                            ...data,
                            ...options
                        });
                        uni.$u.toast(this.$t('Create_successfully'));
                        // await IMLogin('login');
                        setTimeout(() => {
                            uni.reLaunch({
                                url: '/pages/login/index'
                            });
                        }, 1000);
                        this.loading = false;
                    } else {
                        const data = await emailSendCode({
                            email: this.userInfo.email,
                            usedFor: SmsUserFor.Reset,
                            deviceID: '',
                            platform: uni.$u.os() === 'ios' ? 1 : 2
                        });
                        console.log('emailSendCode--emailSendCode', data);
                        uni.$u.toast(
                            this.$t('Verification_code_has_been_sent')
                        );
                        setTimeout(
                            () =>
                                uni.$u.route('/pages/login/verifyCode/index', {
                                    userInfo: JSON.stringify(this.userInfo),
                                    usedFor: this.usedFor
                                }),
                            1000
                        );
                    }
                } catch (err) {
                    console.error(err);
                    uni.$u.toast(checkLoginError(err));
                }
                this.loading = false;
            });
        },
        back() {
            uni.reLaunch({
                url: '/pages/login/index'
            });
        },
        showPicker() {
            this.$refs.AreaPicker.init();
        },
        chooseArea(areaCode) {
            this.userInfo.areaCode = areaCode;
        }
    }
};
</script>
<style lang="scss" scoped>
.register_container {
    padding: 0 30rpx;
}
</style>

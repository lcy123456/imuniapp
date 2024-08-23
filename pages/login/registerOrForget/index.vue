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
                />
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
                {{ isRegister ? $t('Next') : $t('Get_verification_code') }}
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
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import AreaPicker from '@/components/AreaPicker';
import { businessSendSms, emailSendCode } from '@/api/login';
import { SmsUserFor } from '@/constant';
import { checkLoginError, getPhoneReg } from '@/util/common';

export default {
    components: {
        CustomNavBar,
        AreaPicker
    },
    data() {
        return {
            usedFor: 0,
            userInfo: {
                phoneNumber: '',
                email: '',
                areaCode: '86',
                invitationCode: null
            },
            checked: [true],
            rules: {
                phoneNumber: [
                    {
                        type: 'string',
                        required: true,
                        message: this.$t('Please_enter_your_mobile_number'),
                        trigger: ['blur', 'change']
                    },
                    {
                        validator: (rule, value) => {
                            return getPhoneReg(
                                `+${this.userInfo.areaCode}`
                            ).test(value);
                        },
                        message: this.$t(
                            'Please_enter_the_correct_mobile_number'
                        ),
                        trigger: ['change', 'blur']
                    }
                ],
                email: [
                    {
                        type: 'string',
                        required: true,
                        message: this.$t('Please_enter_your_email_address'),
                        trigger: ['blur', 'change']
                    }
                ]
            },
            loading: false
        };
    },
    computed: {
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
                (this.isRegister
                    ? this.userInfo.phoneNumber
                    : this.userInfo.email)
            );
        }
    },
    onLoad(options) {
        this.usedFor = Number(options.usedFor);
        this.checkInvitationCodeState();
    },
    methods: {
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
                const options = {
                    phoneNumber: this.userInfo.phoneNumber,
                    areaCode: `+${this.userInfo.areaCode}`,
                    usedFor: this.usedFor,
                    invitationCode: this.userInfo.invitationCode
                };
                try {
                    this.loading = true;
                    if (this.isRegister) {
                        await businessSendSms(options);
                        uni.$u.route('/pages/login/setPassword/index', {
                            userInfo: JSON.stringify(this.userInfo),
                            usedFor: this.usedFor
                        });
                        return;
                    } else {
                        const data = await emailSendCode({
                            email: this.userInfo.email,
                            usedFor: SmsUserFor.Reset,
                            deviceID: '',
                            platform: uni.$u.os() === 'ios' ? 1 : 2
                        });
                        console.log('emailSendCode--emailSendCode', data);
                    }
                    uni.$u.toast(this.$t('Verification_code_has_been_sent'));
                    setTimeout(
                        () =>
                            uni.$u.route('/pages/login/verifyCode/index', {
                                userInfo: JSON.stringify(this.userInfo),
                                usedFor: this.usedFor
                            }),
                        1000
                    );
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

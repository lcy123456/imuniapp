<template>
    <view class="register_container">
        <CustomNavBar :title="isRegister ? '注册' : '忘记密码'" />
        <view class="box-logo">
            <image class="logo w-130 h-120" src="/static/images/logo.png" />
            <image class="w-249 h-37" src="/static/images/logo_name.png" />
        </view>
        <u-form
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
                    placeholder="请输入您的手机号码"
                    clearable
                />
            </u-form-item>
            <u-form-item v-if="isRegister" prop="invitationCode">
                <u-input
                    v-model="userInfo.invitationCode"
                    class="login-input"
                    :placeholder="`请输入您的邀请码${
                        needInvitationCodeRegister ? '(必填)' : '(选填)'
                    }`"
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
                {{ isRegister ? '下一步' : '获取验证码' }}
            </u-button>
        </view>
        <view v-if="isRegister" class="agreement">
            <u-checkbox-group v-model="checked">
                <u-checkbox
                    icon-size="12"
                    label-size="12"
                    shape="circle"
                    label="我已阅读并同意："
                    :name="true"
                />
            </u-checkbox-group>
            <text class="detail"> 服务协议 </text>
            <text>与</text>
            <text class="detail"> 隐私政策 </text>
        </view>
        <AreaPicker ref="AreaPicker" @chooseArea="chooseArea" />
    </view>
</template>

<script>
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import AreaPicker from '@/components/AreaPicker';
import { businessSendSms } from '@/api/login';
import { SmsUserFor } from '@/constant';
import { checkLoginError } from '@/util/common';

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
                        message: '请输入手机号码',
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
                this.userInfo.phoneNumber
            );
        }
    },
    onLoad(options) {
        this.usedFor = Number(options.usedFor);
    },
    methods: {
        checkInvitationCodeState() {
            if (this.needInvitationCodeRegister) {
                this.rules.push({
                    invitationCode: [
                        {
                            type: 'string',
                            required: true,
                            message: '请输入邀请码',
                            trigger: ['blur', 'change']
                        }
                    ]
                });
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
                    await businessSendSms(options);
                    uni.$u.toast('验证码已发送！');
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
            uni.$u.route('/pages/login/index');
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

<template>
    <Page>
        <view class="email-bind-css">
            <CustomNavBar :title="'绑定邮箱'"> </CustomNavBar>
            <u-form ref="loginForm" class="loginForm" label-width="0">
                <u-form-item prop="email">
                    <u-input
                        v-model="email"
                        class="login-input"
                        placeholder="请输入您的邮箱"
                        type="text"
                        clearable
                    />
                </u-form-item>
                <u-form-item prop="password">
                    <u-input
                        v-model="verifyCode"
                        class="login-input"
                        placeholder="请输入验证码"
                        type="number"
                        clearable
                    />
                    <view class="email_areacode" @click="sendCode">
                        <text
                            :class="[
                                count === 0 && email ? 'primary' : 'text-grey'
                            ]"
                        >
                            {{ isInit ? '发送验证码' : '重新发送' }}
                        </text>
                        <text class="primary">
                            {{ count === 0 ? '' : `(${count}s)` }}
                        </text>
                    </view>
                </u-form-item>
            </u-form>
            <view class="mt-95">
                <u-button
                    :loading="loading"
                    type="primary"
                    :disabled="!isCanBind"
                    shape="circle"
                    size="large"
                    @click="emailBind"
                >
                    绑定邮箱
                </u-button>
            </view>
        </view>
    </Page>
</template>
<script>
import { emailSendCode, emailBind } from '@/api/login';
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import { SmsUserFor } from '@/constant';
import { checkLoginError } from '@/util/common';
export default {
    components: {
        CustomNavBar
    },
    data() {
        return {
            loading: false,
            isInit: true,
            email: '',
            verifyCode: '',
            count: 0
        };
    },
    computed: {
        isCanBind() {
            return this.email && this.verifyCode;
        }
    },
    methods: {
        async emailBind() {
            this.loading = true;
            const { email, verifyCode } = this;
            try {
                await emailBind({
                    email,
                    usedFor: SmsUserFor.Register,
                    deviceID: '',
                    verifyCode,
                    platform: uni.$u.os() === 'ios' ? 1 : 2
                });
                uni.$u.toast('绑定成功');
                setTimeout(() => uni.navigateBack(), 1000);
            } catch (err) {
                console.log('err---err', err);
                uni.$u.toast('绑定失败，请稍后重试');
            }
            this.loading = false;
        },
        startCount() {
            let timer = setInterval(() => {
                if (this.count > 0) {
                    this.count--;
                } else {
                    clearInterval(timer);
                }
            }, 1000);
        },
        async sendCode() {
            this.isInit = false;
            if (this.count === 0) {
                const options = {
                    email: this.email,
                    deviceID: ``,
                    usedFor: SmsUserFor.Register,
                    platform: uni.$u.os() === 'ios' ? 1 : 2
                };
                try {
                    const data = await emailSendCode(options);
                    console.log('emailSendCode---emailSendCode', data);
                    this.count = 60;
                    this.startCount();
                    uni.$u.toast('验证码已发送！');
                } catch (err) {
                    console.log('err---err', err);
                    uni.$u.toast(checkLoginError(err));
                }
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.email-bind-css {
    justify-content: space-between;
    padding: 40rpx;
    .email_areacode {
        width: 150rpx;
        margin-left: 10rpx;
        text-align: center;
    }
}
</style>

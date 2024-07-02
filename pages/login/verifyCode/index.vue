<template>
    <view class="verify_code">
        <CustomNavBar />
        <view class="fz-50 mt-100 ff-bold"> 请输入您的验证码 </view>
        <view class="mb-128">
            <text class="text-grey"> 验证码已发送至 </text>
            <text v-if="isRegister" class="primary">
                {{ `+${userInfo.areaCode} ${userInfo.phoneNumber}` }}
            </text>
            <text v-else class="primary">
                {{ userInfo.email }}
            </text>
        </view>
        <u-code-input
            v-model="codeValue"
            font-size="24"
            color="#000"
            :focus="true"
            @finish="checkCode"
        />
        <view class="mt-46 flex justify-between">
            <view>
                <text
                    :class="[count === 0 ? 'primary' : 'text-grey']"
                    @click="getCodeAgain"
                >
                    重新发送
                </text>
                <text class="primary">
                    {{ count === 0 ? '' : `(${count}s)` }}
                </text>
            </view>
            <CodeNot />
        </view>
    </view>
</template>
<script>
import CustomNavBar from '@/components/CustomNavBar';
import CodeNot from '@/components/CodeNot';
import {
    businessSendSms,
    businessVerifyCode,
    emailVerifyCode
} from '@/api/login';
import { SmsUserFor } from '@/constant';
import { checkLoginError } from '@/util/common';
export default {
    components: {
        CustomNavBar,
        CodeNot
    },
    data() {
        return {
            codeValue: '',
            count: 60,
            userInfo: {
                phoneNumber: '',
                areaCode: ''
            },
            usedFor: 0
        };
    },
    computed: {
        isRegister() {
            return SmsUserFor.Register === this.usedFor;
        }
    },
    onLoad(options) {
        const { userInfo, usedFor } = options;
        this.userInfo = JSON.parse(userInfo);
        this.usedFor = Number(usedFor);
        this.startCount();
    },
    onReady() {},
    methods: {
        async checkCode(value) {
            const options = {
                phoneNumber: this.userInfo.phoneNumber,
                areaCode: `+${this.userInfo.areaCode}`,
                usedFor: this.isRegister
                    ? SmsUserFor.Register
                    : SmsUserFor.Reset,
                verifyCode: value
            };
            try {
                if (this.isRegister) {
                    await businessVerifyCode(options);
                } else {
                    await emailVerifyCode({
                        email: this.userInfo.email,
                        usedFor: SmsUserFor.Reset,
                        deviceID: '',
                        verifyCode: value
                    });
                }
                uni.$u.route('/pages/login/setPassword/index', {
                    userInfo: JSON.stringify(this.userInfo),
                    codeValue: this.codeValue,
                    usedFor: this.usedFor
                });
            } catch (err) {
                uni.$u.toast(checkLoginError(err));
            }
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
        async getCodeAgain() {
            if (this.count === 0) {
                const options = {
                    phoneNumber: this.userInfo.phoneNumber,
                    areaCode: `+${this.userInfo.areaCode}`,
                    usedFor: SmsUserFor.Register
                };
                try {
                    await businessSendSms(options);
                    this.count = 60;
                    this.startCount();
                    uni.$u.toast('验证码已发送！');
                } catch (err) {
                    uni.$u.toast('验证码发送失败');
                }
            }
        }
    }
};
</script>
<style lang="scss" scoped>
.verify_code {
    padding: 0 22rpx;

    /deep/.u-code-input {
        display: flex;
        justify-content: space-between;
        .u-code-input__item {
            width: calc(100vw / 8) !important;
            height: calc(100vw / 8) !important;
            border-radius: 16rpx;
        }
        .u-code-input__input {
            height: calc(100vw / 8) !important;
        }
    }
}
</style>

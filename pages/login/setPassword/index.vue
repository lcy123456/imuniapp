<template>
    <view class="set_password_container">
        <CustomNavBar :title="isRegister ? '注册' : '修改登录密码'" />
        <view class="fz-50 ff-bold mt-100 mb-175">
            请设置{{ isRegister ? '信息与密码' : '新登录密码' }}
        </view>
        <u-form
            ref="loginForm"
            :model="formData"
        >
            <u-form-item prop="password">
                <u-input
                    v-model="formData.password"
                    class="login-input"
                    placeholder="请输入新登录密码"
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
                    v-model="formData.confirmPassword"
                    class="login-input"
                    placeholder="再次确认新登录密码"
                    :password="!comfirmEying"
                >
                    <u-icon
                        slot="suffix"
                        :name="comfirmEying ? 'eye-off' : 'eye'"
                        @click="updateEye('comfirmEying')"
                    />
                </u-input>
            </u-form-item>
        </u-form>
        <view class="validate-cell">
            <Alert
                :value="formData.password"
                :verify-res="isLen"
                description="6-20位字符"
            />
            <Alert
                :value="formData.password"
                :verify-res="isNumAndLetter"
                description="必须包含字母和数字"
            />
            <Alert
                :value="formData.password"
                :verify-res="isEqual"
                description="两次密码不相同"
            />
        </view>
        <view class="mt-68">
            <u-button
                type="primary"
                :disabled="!isVerifyOk"
                shape="circle"
                size="large"
                @click="doNext"
            >
                {{ isRegister ? '下一步' : '确定' }}
            </u-button>
        </view>
    </view>
</template>

<script>
import CustomNavBar from '@/components/CustomNavBar';
import Alert from '@/components/Alert';
import { businessReset } from '@/api/login';
import { regMap } from '@/enum';
import { checkLoginError } from '@/util/common';
import md5 from 'md5';
import { SmsUserFor } from '@/constant';

export default {
    components: {
        CustomNavBar,
        Alert
    },
    data () {
        return {
            codeValue: '',
            userInfo: {
                phoneNumber: '',
                areaCode: '',
            },
            usedFor: 0,
            formData: {
                password: '',
                confirmPassword: '',
            },
            passwordEying: false,
            comfirmEying: false,
        };
    },
    computed: {
        isRegister () {
            return SmsUserFor.Register === this.usedFor;
        },
        isLen () {
            const len = this.formData.password.length;
            return len >= 6 && len <= 24;
        },
        isNumAndLetter () {
            return regMap.numberLetter.test(this.formData.password);
        },
        isEqual () {
            return this.formData.password === this.formData.confirmPassword;
        },
        isVerifyOk () {
            return this.isLen && this.isNumAndLetter && this.isEqual;
        }
    },
    onLoad (options) {
        const { userInfo, codeValue, usedFor } = options;
        this.userInfo = JSON.parse(userInfo);
        this.codeValue = codeValue;
        this.usedFor = Number(usedFor);
    },
    methods: {
        doNext () {
            if (this.isRegister) {
                uni.$u.route('/pages/login/setSelfInfo/index', {
                    userInfo: JSON.stringify(this.userInfo),
                    codeValue: this.codeValue,
                    passWord: this.formData.password,
                });
            } else {
                this.resetPassword();
            }
        },
        async resetPassword () {
            const { phoneNumber, areaCode } = this.userInfo;
            try {
                await businessReset({
                    areaCode: `+${areaCode}`,
                    phoneNumber,
                    verifyCode: this.codeValue,
                    password: md5(this.formData.password)
                });
                uni.$u.toast('修改成功，请重新登录');
                setTimeout(() => {
                    uni.reLaunch({
                        url: '/pages/login/index'
                    });
                }, 1000);
            } catch (err) {
                console.log(err);
                uni.$u.toast(checkLoginError(err));
            }
        },
        updateEye (key) {
            this[key] = !this[key];
        },
    },
};
</script>
<style lang="scss" scoped>
.set_password_container {
    padding: 0 30rpx;
}
</style>

<template>
    <view class="set_password_container">
        <CustomNavBar
            :title="isRegister ? $t('Register') : $t('Change_login_password')"
        />
        <view class="fz-50 ff-bold mt-100 mb-175">
            {{
                isRegister
                    ? $t('Please_set_information_and_password')
                    : $t('Please_set_new_login_password')
            }}
        </view>
        <u-form ref="loginForm" :model="formData">
            <u-form-item prop="password">
                <u-input
                    v-model="formData.password"
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
                    v-model="formData.confirmPassword"
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
        </u-form>
        <view class="validate-cell">
            <Alert
                :value="formData.password"
                :verify-res="isLen"
                :description="$t('6-20_characters')"
            />
            <Alert
                :value="formData.password"
                :verify-res="isNumAndLetter"
                :description="$t('6-20_characters')"
            />
            <Alert
                :value="formData.password"
                :verify-res="isEqual"
                :description="$t('Two_passwords_are_different')"
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
                {{ isRegister ? $t('Next') : $t('Sure') }}
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
    data() {
        return {
            codeValue: '',
            userInfo: {
                phoneNumber: '',
                areaCode: ''
            },
            usedFor: 0,
            formData: {
                password: '',
                confirmPassword: ''
            },
            passwordEying: false,
            comfirmEying: false
        };
    },
    computed: {
        isRegister() {
            return SmsUserFor.Register === this.usedFor;
        },
        isLen() {
            const len = this.formData.password.length;
            return len >= 6 && len <= 20;
        },
        isNumAndLetter() {
            return regMap.numberLetter.test(this.formData.password);
        },
        isEqual() {
            return this.formData.password === this.formData.confirmPassword;
        },
        isVerifyOk() {
            return this.isLen && this.isNumAndLetter && this.isEqual;
        }
    },
    onLoad(options) {
        const { userInfo, codeValue, usedFor } = options;
        this.userInfo = JSON.parse(userInfo);
        this.codeValue = codeValue;
        this.usedFor = Number(usedFor);
    },
    methods: {
        doNext() {
            if (this.isRegister) {
                uni.$u.route('/pages/login/setSelfInfo/index', {
                    userInfo: JSON.stringify(this.userInfo),
                    codeValue: this.codeValue,
                    passWord: this.formData.password
                });
            } else {
                this.resetPassword();
            }
        },
        async resetPassword() {
            const { email } = this.userInfo;
            try {
                await businessReset({
                    email,
                    deviceID: '',
                    platform: uni.$u.os() === 'ios' ? 1 : 2,
                    verifyCode: this.codeValue,
                    password: md5(this.formData.password)
                });
                uni.$u.toast(this.$t('Change_successful_please_log_in_again'));
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
        updateEye(key) {
            this[key] = !this[key];
        }
    }
};
</script>
<style lang="scss" scoped>
.set_password_container {
    padding: 0 30rpx;
}
</style>

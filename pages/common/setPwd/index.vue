<template>
    <view class="set_pwd_container">
        <CustomNavBar :title="$t('Change_login_password')" />
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
            <u-form-item prop="currentPassword">
                <u-input
                    v-model="userInfo.currentPassword"
                    class="login-input"
                    :placeholder="$t('Please_enter_your_password')"
                    :password="!currentPasswordEying"
                >
                    <u-icon
                        slot="suffix"
                        :name="currentPasswordEying ? 'eye-off' : 'eye'"
                        @click="updateEye('currentPasswordEying')"
                    />
                </u-input>
            </u-form-item>
            <u-form-item prop="newPassword">
                <u-input
                    v-model="userInfo.newPassword"
                    class="login-input"
                    :placeholder="$t('Please_enter_new_login_password')"
                    :password="!newPasswordEying"
                >
                    <u-icon
                        slot="suffix"
                        :name="newPasswordEying ? 'eye-off' : 'eye'"
                        @click="updateEye('newPasswordEying')"
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

            <view class="mt-68">
                <u-button
                    type="primary"
                    shape="circle"
                    size="large"
                    @click="businessModify"
                >
                    {{ $t('Sure') }}
                </u-button>
            </view>
        </u-form>
    </view>
</template>

<script>
import { mapGetters } from 'vuex';
import CustomNavBar from '@/components/CustomNavBar';
import { businessModify } from '@/api/login';
import { checkLoginError } from '@/util/common';
import { regMap } from '@/enum';
import md5 from 'md5';

export default {
    components: {
        CustomNavBar
    },
    data() {
        return {
            usedFor: 0,
            newPasswordEying: false,
            comfirmEying: false,
            currentPasswordEying: false,
            userInfo: {
                currentPassword: '',
                password: '',
                confirmPassword: '',
                userID: ''
            },
            checked: [true],
            rules: {
                currentPassword: [
                    {
                        type: 'string',
                        required: true,
                        message: this.$t('Please_enter_your_password'),
                        trigger: ['blur', 'change']
                    },
                    {
                        validator: (rule, value) => {
                            return regMap.pwd.test(value);
                        },
                        message: this.$t('6-20_characters'),
                        trigger: ['change', 'blur']
                    }
                ],
                newPassword: [
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
                        message: this.$t('6-20_characters'),
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
                            return this.userInfo.newPassword === value;
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
        ...mapGetters(['storeUserID'])
    },
    onLoad(options) {
        this.usedFor = Number(options.usedFor);
    },
    methods: {
        updateEye(key) {
            this[key] = !this[key];
        },
        businessModify() {
            this.$refs.registerForm.validate().then(async () => {
                try {
                    this.loading = true;
                    let newPassword = md5(this.userInfo.newPassword);
                    let currentPassword = md5(this.userInfo.currentPassword);
                    const options = {
                        newPassword,
                        currentPassword,
                        userID: this.storeUserID
                    };
                    console.log('options---options', options);
                    // this.saveLoginInfo();
                    await businessModify(options);
                    uni.$u.toast(
                        this.$t('Change_successful_please_log_in_again')
                    );
                    setTimeout(() => {
                        uni.reLaunch({
                            url: '/pages/login/index'
                        });
                    }, 1000);
                } catch (err) {
                    console.error(err);
                    uni.$u.toast(checkLoginError(err));
                }
                this.loading = false;
            });
        }
    }
};
</script>
<style lang="scss" scoped>
.set_pwd_container {
    padding: 50rpx 30rpx;
}
</style>

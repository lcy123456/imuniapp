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
                {{
                    isRegister
                        ? $t('Register_now')
                        : $t('Get_verification_code')
                }}
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
            <text>{{ $t('And') }}</text>
            <text class="detail"> {{ $t('Privacy_Policy') }} </text>
        </view>
        <AreaPicker ref="AreaPicker" @chooseArea="chooseArea" />

        <u-popup
            :show="showUserProfile"
            mode="center"
            round="8"
            class="user_profile_popup"
            :custom-style="{
                width: '80vw',
                padding: '65rpx 50rpx'
            }"
            :close-on-click-overlay="false"
        >
            <u-form ref="userProfile" label-position="top" class="user_profile">
                <view prop="avatar" class="avatar-line" @click="changeAvatar">
                    <u-loading-icon
                        v-show="loadingState.faceURL"
                        size="80"
                    ></u-loading-icon>
                    <u-avatar
                        v-show="!loadingState.faceURL"
                        :src="userInfo.faceURL"
                        size="80"
                    ></u-avatar>
                    <!-- <u-icon
                        name="camera"
                        color="#606266"
                        size="28"
                        class="avatar-icon"
                    ></u-icon> -->
                </view>
                <u-form-item class="nickname_line">
                    <u-input
                        v-model="userInfo.nickname"
                        type="text"
                        class="nickname_line_input"
                        :placeholder="$t('Please_fill_in_your_nickname')"
                        clearable
                    />
                </u-form-item>
                <u-button
                    type="primary"
                    :disabled="!canLogin"
                    shape="circle"
                    size="large"
                    :loading="loadingState.confirm"
                    @click="sureLogin"
                >
                    {{ $t('Enter_MUSKIM') }}
                </u-button>
            </u-form>
        </u-popup>
        <u-popup
            :show="showSelectDefaultsImage"
            mode="center"
            round="8"
            class="ava_popup"
            :custom-style="{
                width: '80vw',
                height: '60vh',
                'overflow-y': 'auto'
            }"
            @close="showSelectDefaultsImage = false"
        >
            <view class="ava_container">
                <u-image
                    v-for="item of avatarList"
                    :key="item.key"
                    :src="item.value"
                    width="18vw"
                    height="18vw"
                    @click="changeUserAvatar(item)"
                ></u-image>
                <u-image
                    :src="UploadCameraSvg"
                    width="18vw"
                    height="18vw"
                    @click="uploadUserAvatar(item)"
                ></u-image>
            </view>
        </u-popup>
    </view>
</template>

<script>
import { mapGetters } from 'vuex';
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import AreaPicker from '@/components/AreaPicker';
import {
    businessSendSms,
    emailSendCode,
    businessRegister,
    businessInfoUpdate
} from '@/api/login';
import { SmsUserFor } from '@/constant';
import { checkLoginError, getPhoneReg, getPurePath } from '@/util/common';
import { IMLogin, login, formatFileUrl } from '@/util/imCommon';
import { regMap } from '@/enum';
import md5 from 'md5';
import defaultAvatars from '@/common/defaultAvatars.js';
import UploadCameraSvg from '@/static/images/upload-camera.svg';
import IMSDK from 'openim-uniapp-polyfill';

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
            UploadCameraSvg,
            loadingState: {
                faceURL: false,
                confirm: false
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
                            console.log('---', this.userInfo.password, value);
                            return this.userInfo.password === value;
                        },
                        message: this.$t('Two_passwords_are_different'),
                        trigger: ['change', 'blur']
                    }
                ]
            },
            loading: false,
            showUserProfile: false,
            showSelectDefaultsImage: false
        };
    },
    computed: {
        ...mapGetters(['storeClientID', 'storeSelfInfo']),
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
        },
        avatarList() {
            return Object.keys(defaultAvatars).map(key => ({
                key,
                value: defaultAvatars[key]
            }));
        }
    },
    onLoad(options) {
        this.usedFor = Number(options.usedFor);
        this.checkInvitationCodeState();
        const { key, value } = this.getRandomAvatar();
        this.userInfo.faceURL = value;
        this.userInfo.faceURLKey = key;
    },
    onBackPress(options) {
        // 点击虚拟键或者侧滑的时候触发（不允许返回）
        if (options.from === 'backbutton') {
            return true;
        }
        // 否则则允许返回
        return false;
    },
    methods: {
        getRandomAvatar() {
            const keys = [...Object.keys(defaultAvatars)];
            const num = Math.floor(Math.random() * keys.length);
            const res = keys[num];
            return { key: res, value: defaultAvatars[res] };
        },
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
        openUserProfile() {
            this.$refs.registerForm.validate().then(async () => {
                this.showUserProfile = true;
                this.userInfo.nickname = this.userInfo.account;
            });
        },
        changeAvatar() {
            this.showSelectDefaultsImage = true;
        },
        uploadUserAvatar() {
            uni.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                crop: {
                    width: 200,
                    height: 200
                },
                success: async ({ tempFilePaths }) => {
                    const path = tempFilePaths[0];
                    const nameIdx = path.lastIndexOf('/') + 1;
                    const typeIdx = path.lastIndexOf('.') + 1;
                    const fileName = path.slice(nameIdx);
                    const fileType = path.slice(typeIdx);
                    this.loadingState.faceURL = true;
                    uni.showLoading({
                        title: this.$t('Loading'),
                        mask: true
                    });
                    try {
                        this.userInfo.faceURL = '';
                        const {
                            data: { url }
                        } = await IMSDK.asyncApi(
                            IMSDK.IMMethods.UploadFile,
                            IMSDK.uuid(),
                            {
                                filepath: getPurePath(tempFilePaths[0]),
                                name: fileName,
                                contentType: `image/${fileType}`,
                                uuid: IMSDK.uuid()
                            }
                        );
                        this.userInfo.faceURL = formatFileUrl(url);
                    } catch (error) {
                        console.log('🚀 ~ success: ~ error:', error);
                    } finally {
                        this.loadingState.faceURL = false;
                        this.showSelectDefaultsImage = false;
                        uni.hideLoading();
                    }
                    // this.updateSelfInfo({ faceURL: url }, 'faceURL');
                }
            });
        },
        async updateSelfInfo(data) {
            try {
                this.loadingState.confirm = true;
                const da1 = await businessInfoUpdate({
                    ...data,
                    userID: this.storeSelfInfo.userID
                });
                console.log('-------------------', da1);
                const da2 = await this.$store.dispatch(
                    'user/updateBusinessInfo'
                );
                console.log('-------------------', da2);
                // uni.$u.toast(this.$t('Change_successfully'));
                this.showUserProfile = false;
                this.loadingState.confirm = false;
                uni.switchTab({
                    url: '/pages/conversation/conversationList/index'
                });
            } catch (e) {
                console.log(e);
                uni.$u.toast(this.$t('Modification_failed'));
            }
        },
        sureLogin() {
            this.updateSelfInfo({
                nickname: this.userInfo.nickname,
                faceURL: this.userInfo.faceURL
            });
        },
        changeUserAvatar(item) {
            this.userInfo.faceURL = item.value;
            this.showSelectDefaultsImage = false;
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
                                password,
                                faceURL: this.userInfo.faceURLKey
                            },
                            cid: this.storeClientID,
                            faceURL: this.userInfo.faceURLKey
                        };
                        console.log('options---options', options);
                        // this.saveLoginInfo();
                        const data = await businessRegister(options);
                        console.log(
                            '🚀 ~ --------------- this.$refs.registerForm.validate ~ data:',
                            data
                        );
                        this.$store.commit('user/SET_AUTH_DATA', data);
                        this.$store.commit('user/SET_USER_LIST', {
                            ...data,
                            ...options
                        });
                        const requestMap = {
                            account: this.userInfo.account,
                            password: md5(this.userInfo.password),
                            platform: uni.$u.os() === 'ios' ? 1 : 2,
                            verifyCode: undefined,
                            cid: this.storeClientID
                        };
                        await login(requestMap, true);
                        uni.$u.toast(this.$t('Create_successfully'));
                        // await IMLogin('login');
                        // setTimeout(() => {
                        //     uni.reLaunch({
                        //         url: '/pages/login/index'
                        //     });
                        // }, 1000);

                        this.openUserProfile();

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

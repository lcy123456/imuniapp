<template>
    <Page>
        <view class="page_container">
            <CustomNavBar :title="$t('My_information')" is-bg-color2 />

            <view class="info_wrap">
                <SettingItem
                    :loading="loadingState.faceURL"
                    :title="$t('Avatar')"
                    show-arrow
                    @click="updateAvatar"
                >
                    <MyAvatar
                        slot="right"
                        :src="selfInfo.faceURL"
                        :desc="selfInfo.nickname"
                        size="80rpx"
                    />
                </SettingItem>
                <SettingItem
                    :title="$t('Name')"
                    :content="selfInfo.nickname"
                    show-arrow
                    @click="updateNickname"
                />
                <SettingItem
                    :loading="loadingState.gender"
                    :title="$t('Gender')"
                    :content="getGender"
                    show-arrow
                    @click="updateGender"
                />
                <SettingItem
                    :loading="loadingState.birth"
                    :title="$t('Birthday')"
                    :content="getBirth"
                    show-arrow
                    @click="() => (showDatePicker = true)"
                />
            </view>
            <view class="info_wrap">
                <SettingItem
                    :show-arrow="false"
                    :title="$t('Mobile_number')"
                    :content="selfInfo.phoneNumber || '-'"
                />
                <SettingItem
                    :loading="loadingState.isHiddenPhone"
                    :title="$t('Hideshow_mobile_number')"
                    :content="getIsHiddenPhone"
                    show-arrow
                    @click="updateIsHiddenPhone"
                />
                <SettingItem
                    :title="$t('Email')"
                    :content="selfInfo.email || '-'"
                    show-arrow
                    @click="updateEmail"
                />
                <!-- <SettingItem
                title="二维码名片"
                @click="toQrCode"
            >
                <image
                    slot="value"
                    class="w-48 h-48"
                    src="@/static/images/self_info_qr.png"
                    mode=""
                />
            </SettingItem>
            <SettingItem
                :show-arrow="false"
                title="ID"
                :content="selfInfo.userID"
                @click="copyID"
            /> -->
            </view>
            <view class="operation-btn error" @click="handleAccountCancel">{{
                $t('Log_out2')
            }}</view>

            <u-datetime-picker
                v-model="selfInfo.birth"
                :min-date="0"
                :max-date="nowDate"
                :show="showDatePicker"
                mode="date"
                @confirm="confirmDate"
                @cancel="() => (showDatePicker = false)"
            />
        </view>
    </Page>
</template>

<script>
import { businessInfoUpdate } from '@/api/login';
import IMSDK from 'openim-uniapp-polyfill';
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import MyAvatar from '@/components/MyAvatar/index.vue';
import dayjs from 'dayjs';
import SettingItem from '@/components/SettingItem/index.vue';
import { getPurePath } from '@/util/common';
import { CustomMarkType } from '@/constant';

export default {
    components: {
        CustomNavBar,
        MyAvatar,
        SettingItem
    },
    data() {
        return {
            showDatePicker: false,
            loadingState: {
                faceURL: false,
                gender: false,
                birth: false
            },
            nowDate: Date.now()
        };
    },
    computed: {
        selfInfo() {
            return this.$store.getters.storeSelfInfo;
        },
        getGender() {
            if (this.selfInfo.gender === 0) {
                return this.$t('Confidential');
            }
            if (this.selfInfo.gender === 1) {
                return this.$t('Male');
            }
            return this.$t('Female');
        },
        getIsHiddenPhone() {
            return this.selfInfo.isHiddenPhone === 1
                ? this.$t('Show')
                : this.$t('Hide');
        },
        getBirth() {
            const birth = this.selfInfo.birth;
            return birth ? dayjs(birth).format('YYYY-MM-DD') : '-';
        }
    },
    methods: {
        updateNickname() {
            uni.navigateTo({
                url: `/pages/common/markOrIDPage/index?type=${
                    CustomMarkType.SelfNickname
                }&sourceInfo=${JSON.stringify(this.selfInfo)}`
            });
        },
        updateEmail() {
            if (this.selfInfo.email) {
                return uni.$u.toast(
                    this.$t('Email_modification_is_not_supported')
                );
            }
            uni.navigateTo({
                url: `/pages/common/emailBind/index?type=${
                    CustomMarkType.Email
                }&sourceInfo=${JSON.stringify(this.selfInfo)}`
            });
        },
        updateGender() {
            uni.showActionSheet({
                itemList: [this.$t('Male'), this.$t('Female')],
                success: async ({ tapIndex }) => {
                    this.loadingState.gender = true;
                    await this.updateSelfInfo(
                        { gender: tapIndex + 1 },
                        'gender'
                    );
                }
            });
        },
        updateIsHiddenPhone() {
            uni.showActionSheet({
                itemList: [this.$t('Show'), this.$t('Hide')],
                success: async ({ tapIndex }) => {
                    this.loadingState.isHiddenPhone = true;
                    await this.updateSelfInfo(
                        { isHiddenPhone: tapIndex + 1 },
                        'isHiddenPhone'
                    );
                    this.$store.dispatch('user/getSelfInfo');
                }
            });
        },
        async updateAvatar() {
            const permissions = await this.$store.dispatch(
                'base/hasCameraPermissions'
            );
            if (!permissions) return;
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
                    this.updateSelfInfo({ faceURL: url }, 'faceURL');
                    this.loadingState.faceURL = false;
                }
            });
        },
        toQrCode() {
            uni.navigateTo({
                url: `/pages/common/userOrGroupQrCode/index`
            });
        },
        copyID() {
            uni.setClipboardData({
                data: this.selfInfo.userID,
                success: () => {
                    uni.hideToast();
                    this.$nextTick(() => {
                        uni.$u.toast(this.$t('Copy_successfully'));
                    });
                }
            });
        },
        async updateSelfInfo(data, key) {
            try {
                await businessInfoUpdate({
                    ...data,
                    userID: this.selfInfo.userID
                });
                await this.$store.dispatch('user/updateBusinessInfo');
                uni.$u.toast(this.$t('Change_successfully'));
            } catch (e) {
                console.log(e);
                uni.$u.toast(this.$t('Modification_failed'));
            }
            this.loadingState[key] = false;
        },
        confirmDate({ value }) {
            this.loadingState.birth = true;
            this.updateSelfInfo({ birth: value }, 'birth');
            this.showDatePicker = false;
        },
        handleAccountCancel() {
            uni.$u.route('/pages/common/markOrIDPage/index', {
                type: CustomMarkType.AccountCancel,
                sourceInfo: JSON.stringify(this.selfInfo)
            });
        }
    }
};
</script>

<style lang="scss" scoped>
.page_container {
    background-color: $uni-bg-color-grey;
    padding: 40rpx;

    .info_wrap {
        background-color: $uni-bg-color;
        border-radius: 30rpx;
        margin-bottom: 30rpx;
        .u-avatar {
            border-radius: 20rpx;
            overflow: hidden;
        }
    }
}
</style>

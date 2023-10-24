<template>
    <Page>
        <view class="page_container">
            <CustomNavBar
                title="我的信息"
                is-bg-color2
            />

            <view class="info_wrap">
                <SettingItem
                    :loading="loadingState.faceURL"
                    title="头像"
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
                    title="姓名"
                    :content="selfInfo.nickname"
                    show-arrow
                    @click="updateNickname"
                />
                <SettingItem
                    :loading="loadingState.gender"
                    title="性别"
                    :content="getGender"
                    show-arrow
                    @click="updateGender"
                />
                <SettingItem
                    :loading="loadingState.birth"
                    title="生日"
                    :content="getBirth"
                    show-arrow
                    @click="() => (showDatePicker = true)"
                />
            </view>
            <view class="info_wrap">
                <SettingItem
                    :show-arrow="false"
                    title="手机号码"
                    :content="selfInfo.phoneNumber || '-'"
                />
                <SettingItem
                    :show-arrow="false"
                    title="邮箱"
                    :content="selfInfo.email || '-'"
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
            <view 
                class="operation-btn error"
                @click="handleAccountCancel"
            >
                注销账号
            </view>

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
        SettingItem,
    },
    data () {
        return {
            showDatePicker: false,
            loadingState: {
                faceURL: false,
                gender: false,
                birth: false,
            },
            nowDate: Date.now(),
        };
    },
    computed: {
        selfInfo () {
            return this.$store.getters.storeSelfInfo;
        },
        getGender () {
            if (this.selfInfo.gender === 0) {
                return '保密';
            }
            if (this.selfInfo.gender === 1) {
                return '男';
            }
            return '女';
        },
        getBirth () {
            const birth = this.selfInfo.birth;
            return birth ? dayjs(birth).format('YYYY-MM-DD') : '-';
        },
    },
    methods: {
        updateNickname () {
            uni.navigateTo({
                url: `/pages/common/markOrIDPage/index?type=${CustomMarkType.SelfNickname}&sourceInfo=${JSON.stringify(
                    this.selfInfo
                )}`,
            });
        },
        updateGender () {
            uni.showActionSheet({
                itemList: ['男', '女'],
                success: async ({ tapIndex }) => {
                    this.loadingState.gender = true;
                    await this.updateSelfInfo(
                        { gender: tapIndex + 1, },
                        'gender'
                    );
                },
            });
        },
        updateAvatar () {
            uni.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                success: async ({ tempFilePaths }) => {
                    const path = tempFilePaths[0];
                    const nameIdx = path.lastIndexOf('/') + 1;
                    const typeIdx = path.lastIndexOf('.') + 1;
                    const fileName = path.slice(nameIdx);
                    const fileType = path.slice(typeIdx);
                    this.loadingState.faceURL = true;
                    const { data: { url }, } = await IMSDK.asyncApi(
                        IMSDK.IMMethods.UploadFile,
                        IMSDK.uuid(),
                        {
                            filepath: getPurePath(tempFilePaths[0]),
                            name: fileName,
                            contentType: `image/${fileType}`,
                            uuid: IMSDK.uuid(),
                        }
                    );
                    this.updateSelfInfo(
                        { faceURL: url, },
                        'faceURL'
                    );
                    this.loadingState.faceURL = false;
                },
            });
        },
        toQrCode () {
            uni.navigateTo({
                url: `/pages/common/userOrGroupQrCode/index`,
            });
        },
        copyID () {
            uni.setClipboardData({
                data: this.selfInfo.userID,
                success: () => {
                    uni.hideToast();
                    this.$nextTick(() => {
                        uni.$u.toast('复制成功');
                    });
                },
            });
        },
        async updateSelfInfo (data, key) {
            try {
                await businessInfoUpdate({
                    ...data,
                    userID: this.selfInfo.userID,
                });
                await this.$store.dispatch('user/updateBusinessInfo');
                uni.$u.toast('修改成功');
            } catch (e) {
                console.log(e);
                uni.$u.toast('修改失败');
            }
            this.loadingState[key] = false;
        },
        confirmDate ({ value }) {
            this.loadingState.birth = true;
            this.updateSelfInfo(
                { birth: value, },
                'birth'
            );
            this.showDatePicker = false;
        },
        handleAccountCancel () {
            uni.$u.route('/pages/common/markOrIDPage/index', {
                type: CustomMarkType.AccountCancel,
                sourceInfo: JSON.stringify(this.selfInfo)
            });
        }
    },
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

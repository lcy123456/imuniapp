<template>
    <view class="page_container">
        <custom-nav-bar title="我的信息" />

        <view class="info_wrap">
            <info-item
                :loading="loadingState.faceURL"
                title="头像"
                @click="updateAvatar"
            >
                <my-avatar
                    slot="value"
                    :src="selfInfo.faceURL"
                    :desc="selfInfo.nickname"
                    size="42"
                />
            </info-item>
            <info-item
                title="昵称"
                :content="selfInfo.nickname"
                @click="updateNickname"
            />
            <info-item
                :loading="loadingState.gender"
                title="性别"
                :content="getGender"
                @click="updateGender"
            />
            <info-item
                :loading="loadingState.birth"
                title="生日"
                :content="getBirth"
                @click="() => showDatePicker = true"
            />
            <info-item
                :show-arrow="false"
                title="手机号码"
                :content="selfInfo.phoneNumber || '-'"
            />
            <info-item
                :show-arrow="false"
                title="邮箱"
                :content="selfInfo.email || '-'"
            />
            <info-item
                title="二维码名片"
                @click="toQrCode"
            >
                <image
                    slot="value"
                    class="qr_icon"
                    src="@/static/images/self_info_qr.png"
                    mode=""
                />
            </info-item>
            <info-item
                :show-arrow="false"
                title="ID"
                :content="selfInfo.userID"
                @click="copyID"
            />
        </view>

        <u-datetime-picker
            v-model="selfInfo.birth"
            :min-date="0"
            :max-date="nowDate"
            :show="showDatePicker"
            mode="date"
            @confirm="confirmDate"
            @cancel="() => showDatePicker = false"
        />
    </view>
</template>

<script>
import {
    businessInfoUpdate
} from '@/api/login';
import IMSDK from 'openim-uniapp-polyfill';
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import MyAvatar from '@/components/MyAvatar/index.vue';
import dayjs from 'dayjs';
import InfoItem from './InfoItem.vue';
import {
    getPurePath
} from '@/util/common';
export default {
    components: {
        CustomNavBar,
        MyAvatar,
        InfoItem
    },
    data () {
        return {
            showDatePicker: false,
            loadingState: {
                faceURL: false,
                gender: false,
                birth: false,
            },
            nowDate: Date.now()
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
        }
    },
    methods: {
        updateNickname () {
            uni.navigateTo({
                url: `/pages/common/markOrIDPage/index?isSelfNickname=true&sourceInfo=${JSON.stringify(this.selfInfo)}`
            });
        },
        updateGender () {
            uni.showActionSheet({
                itemList: ['男', '女'],
                success: async ({
                    tapIndex
                }) => {
                    this.loadingState.gender = true;
                    await this.updateSelfInfo({
                        gender: tapIndex + 1
                    }, 'gender');
                }
            });
        },
        updateAvatar () {
            uni.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                success: async ({
                    tempFilePaths
                }) => {
                    const path = tempFilePaths[0];
                    const nameIdx = path.lastIndexOf('/') + 1;
                    const typeIdx = path.lastIndexOf('.') + 1;
                    const fileName = path.slice(nameIdx);
                    const fileType = path.slice(typeIdx);
                    this.loadingState.faceURL = true;
                    const { data: { url } } = await IMSDK.asyncApi(IMSDK.IMMethods.UploadFile, IMSDK.uuid(), {
                        filepath: getPurePath(tempFilePaths[0]),
                        name: fileName,
                        contentType: `image/${fileType}`,
                        uuid: IMSDK.uuid()
                    });
                    this.updateSelfInfo({
                        faceURL: url
                    }, 'faceURL');
                    this.loadingState.faceURL = false;
                }
            });
        },
        toQrCode () {
            uni.navigateTo({
                url: `/pages/common/userOrGroupQrCode/index`
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
                }
            });
        },
        async updateSelfInfo (data, key) {
            try {
                await businessInfoUpdate({
                    ...data,
                    userID: this.selfInfo.userID
                });
                await this.$store.dispatch('user/updateBusinessInfo');
                uni.$u.toast('修改成功');
            } catch (e) {
                console.log(e);
                uni.$u.toast('修改失败');
            }
            this.loadingState[key] = false;
        },
        confirmDate ({
            value
        }) {
            this.loadingState.birth = true;
            this.updateSelfInfo({
                birth: value
            }, 'birth');
            this.showDatePicker = false;
        },
    }
};
</script>

<style lang="scss" scoped>
.page_container {
	background-color: #f8f8f8;

	.info_wrap {
		background-color: #fff;
		margin-top: 24rpx;

		.qr_icon {
			width: 22px;
			height: 23px;
		}
	}
}
</style>

<template>
    <Page>
        <view class="page_container">
            <custom-nav-bar :title="$t('QR_code')" />

            <view class="qr_wrap">
                <view class="info_row">
                    <my-avatar
                        :src="sourceInfo.faceURL"
                        :desc="sourceInfo.nickname"
                        :is-group="sourceInfo.groupID !== undefined"
                        size="48"
                    />
                    <text class="nickname">
                        {{ sourceInfo.nickname || sourceInfo.groupName }}
                    </text>
                </view>

                <view class="desc_tip">
                    <text>{{ getDescTip }}</text>
                </view>

                <view class="qr_icon">
                    <uqrcode
                        ref="uqrcode"
                        canvas-id="qrcode"
                        :value="qrLink"
                        :size="140"
                        :options="{ margin: 10 }"
                    />
                </view>
            </view>
        </view>
    </Page>
</template>

<script>
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import MyAvatar from '@/components/MyAvatar/index.vue';
import { AddFriendQrCodePrefix, AddGroupQrCodePrefix } from '../../../constant';
export default {
    components: {
        CustomNavBar,
        MyAvatar
    },
    data() {
        return {
            sourceInfo: {},
            qrLink: ''
        };
    },
    computed: {
        getDescTip() {
            return this.sourceInfo.groupID === undefined
                ? this.$t('Scan_the_QR_code_below_to_add_me_as_a_friend')
                : this.$t('Scan_the_QR_code_below_Join_the_group_now');
        }
    },
    onLoad(options) {
        const { sourceInfo } = options;
        this.sourceInfo = sourceInfo
            ? JSON.parse(sourceInfo)
            : this.$store.getters.storeSelfInfo;
        this.getQrLink(this.sourceInfo);
    },
    methods: {
        getQrLink(info) {
            const prefix = info.groupID
                ? AddGroupQrCodePrefix
                : AddFriendQrCodePrefix;
            const sourceID = info.groupID ?? info.userID ?? '';
            this.qrLink = `${prefix}${sourceID}`;
        }
    }
};
</script>

<style lang="scss" scoped>
.page_container {
    background-color: #f8f8f8;

    .qr_wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 0 44rpx;
        margin-top: 96rpx;
        padding: 72rpx;
        background-color: #fff;
        box-shadow: 0px 0px 7px 0px rgba(0, 0, 0, 0.1);
        border-radius: 16rpx;

        .info_row {
            @include vCenterBox();
            justify-content: flex-start;
            width: 100%;
            margin-bottom: 96rpx;

            .nickname {
                @include nomalEllipsis();
                margin-left: 24rpx;
                max-width: 600rpx;
            }
        }

        .desc_tip {
            font-size: 28rpx;
            color: #999;
            margin-bottom: 48rpx;
        }

        .qr_icon {
            @include centerBox();
            background-image: url('@/static/images/self_qr_bg.png');
            margin-bottom: 48rpx;
            width: 180px;
            height: 180px;
        }
    }
}
</style>

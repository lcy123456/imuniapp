<template>
    <Page>
        <view class="page_container">
            <CustomNavBar :title="$t('More_information')" is-bg-color2 />

            <view class="info_wrap">
                <SettingItem :title="$t('Avatar')">
                    <MyAvatar
                        slot="right"
                        :src="sourceInfo.faceURL"
                        :desc="sourceInfo.nickname"
                        size="80rpx"
                    />
                </SettingItem>
                <SettingItem
                    :title="$t('Name')"
                    :content="sourceInfo.nickname"
                />
                <SettingItem :title="$t('Gender')" :content="getGender" />
                <SettingItem :title="$t('Birthday')" :content="getBirth" />
            </view>
            <view class="info_wrap">
                <SettingItem
                    :title="$t('Mobile_number')"
                    :content="sourceInfo.phoneNumber || '-'"
                />
                <SettingItem
                    :title="$t('Email')"
                    :content="sourceInfo.email || '-'"
                />
            </view>
        </view>
    </Page>
</template>

<script>
import dayjs from 'dayjs';
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import MyAvatar from '@/components/MyAvatar/index.vue';
import SettingItem from '@/components/SettingItem/index.vue';

export default {
    components: {
        CustomNavBar,
        MyAvatar,
        SettingItem
    },
    data() {
        return {
            sourceInfo: {}
        };
    },
    computed: {
        getGender() {
            if (this.sourceInfo.gender === 1) {
                return this.$t('Male');
            }
            if (this.sourceInfo.gender === 2) {
                return this.$t('Female');
            }
            return this.$t('Confidential');
        },
        getBirthStr() {
            const birth = this.sourceInfo.birth;
            return birth ? dayjs(birth).format('YYYY-MM-DD') : '-';
        }
    },
    onLoad(options) {
        const { sourceInfo } = options;
        this.sourceInfo = JSON.parse(sourceInfo);
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

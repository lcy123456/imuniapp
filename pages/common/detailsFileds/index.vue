<template>
    <Page>
        <view class="page_container">
            <CustomNavBar
                title="更多资料"
                is-bg-color2
            />

            <view class="info_wrap">
                <SettingItem
                    title="头像"
                >
                    <MyAvatar
                        slot="right"
                        :src="sourceInfo.faceURL"
                        :desc="sourceInfo.nickname"
                        size="80rpx"
                    />
                </SettingItem>
                <SettingItem
                    title="姓名"
                    :content="sourceInfo.nickname"
                />
                <SettingItem
                    title="性别"
                    :content="getGender"
                />
                <SettingItem
                    title="生日"
                    :content="getBirth"
                />
            </view>
            <view class="info_wrap">
                <SettingItem
                    title="手机号码"
                    :content="sourceInfo.phoneNumber || '-'"
                />
                <SettingItem
                    title="邮箱"
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
    data () {
        return {
            sourceInfo: {},
        };
    },
    computed: {
        getGender () {
            if (this.sourceInfo.gender === 1) {
                return '男';
            }
            if (this.sourceInfo.gender === 2) {
                return '女';
            }
            return '保密';
        },
        getBirthStr () {
            const birth = this.sourceInfo.birth;
            return birth ? dayjs(birth).format('YYYY-MM-DD') : '-';
        },
    },
    onLoad (options) {
        const { sourceInfo } = options;
        this.sourceInfo = JSON.parse(sourceInfo);
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

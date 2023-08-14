<template>
    <view class="page_container">
        <CustomNavBar
            title="账号设置"
            is-bg-color2
        />

        <view class="info_wrap">
            <setting-item
                title="通讯录黑名单"
                @click="toBlockList"
            />
            <setting-item
                :loading="loading"
                title="勿扰模式"
                :switch-value="globalOptEnable"
                :is-switch="true"
                @switch="switchGlobalOpt"
            />
        </view>
    </view>
</template>

<script>
import IMSDK, { MessageReceiveOptType } from 'openim-uniapp-polyfill';
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import SettingItem from '@/components/SettingItem/index.vue';

export default {
    components: {
        CustomNavBar,
        SettingItem
    },
    data () {
        return {
            loading: false
        };
    },
    computed: {
        globalOptEnable () {
            return this.$store.getters.storeSelfInfo.globalRecvMsgOpt !== MessageReceiveOptType.Nomal;
        }
    },
    methods: {
        toBlockList () {
            uni.navigateTo({
                url: '/pages/profile/blockList/index'
            });
        },
        switchGlobalOpt (flag) {
            this.loading = true;
            IMSDK.asyncApi(
                IMSDK.IMMethods.SetGlobalRecvMessageOpt, 
                IMSDK.uuid(), 
                flag ? MessageReceiveOptType.NotNotify : MessageReceiveOptType.Nomal
            ).finally(() => {
                this.loading = false;
            }).catch(() => {
                uni.$u.toast('设置失败');
            });
        }
    }
};
</script>

<style lang="scss" scoped>
	.page_container {
		background-color: $uni-bg-color-grey;

		.info_wrap {
			background-color: $uni-bg-color;
			margin: 40rpx;
            border-radius: 30rpx;
		}
	}
</style>

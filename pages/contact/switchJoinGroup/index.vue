<template>
    <Page>
        <view class="switch_join_container">
            <custom-nav-bar title="加入群聊" />

            <view class="action_row">
                <action-item
                    v-for="item in joinGroupMenus"
                    :key="item.idx"
                    :action="item"
                    @click="actionClick(item)"
                >
                    <view
                        slot="icon"
                        class="custom_icon"
                        :class="{'custom_icon_id':item.idx === 1}"
                    >
                        <image
                            :src="item.icon"
                            mode=""
                        />
                    </view>
                </action-item>
            </view>
        </view>
    </Page>
</template>

<script>
import {
    scanQrCodeResult
} from '@/util/imCommon';
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import ActionItem from '../contactAdd/ActionItem.vue';
export default {
    components: {
        CustomNavBar,
        ActionItem
    },
    data () {
        return {
            joinGroupMenus: [{
                idx: 0,
                title: '扫码加入',
                desc: '扫描二维码名片',
                icon: require('static/images/switch_join_qr.png')
            },
            {
                idx: 1,
                title: '群ID号加入',
                desc: '向管理员或团队成员询问ID',
                icon: require('static/images/switch_join_id.png')
            },
            ],
        };
    },
    methods: {
        actionClick ({
            idx
        }) {
            if (idx) {
                uni.navigateTo({
                    url: '/pages/common/searchUserOrGroup/index?isSearchGroup=true'
                });
            } else {
                uni.scanCode({
                    scanType: ['qrCode'],
                    success: ({
                        result
                    }) => scanQrCodeResult(result)
                });
            }
        }
    }
};
</script>

<style lang="scss" scoped>
	.switch_join_container {
		height: 100vh;
		background-color: #F8F8F8;

		.desc_title {
			font-size: 24rpx;
			color: #999;
			padding: 24rpx 44rpx;
		}

		.action_row {
			background-color: #fff;

			.custom_icon {
				@include centerBox();
				width: 44px;
				min-width: 44px;
				height: 44px;
				border-radius: 50%;
				background-color: #5496EB;

				image {
					width: 20px;
					height: 20px;
				}

				&_id {
					background-color: #FFC563;
				}
			}

			/deep/ .action_item {
				align-items: flex-start;
			}

			.action_item:last-child {
				.bottom_line {
					height: 0;
				}
			}
		}
	}
</style>

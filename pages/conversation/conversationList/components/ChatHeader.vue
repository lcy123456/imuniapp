<template>
    <view class="chat_header">
        <CustomNavBar
            :show-left="false"
            bg-color="#eff1f4"
        >
            <template slot="center">
                <text
                    v-if="storeConnectingStatus"
                    class="header-text"
                >
                    {{ storeConnectingStatus }}
                </text>
                <u--image
                    v-else
                    src="/static/images/logo_name_blue.png"
                    width="200rpx"
                    height="28rpx"
                />
            </template>
            <template slot="more">
                <view
                    class="more_icon mr-30"
                    @click="showMore"
                >
                    <image
                        class="w-44 h-44"
                        src="/static/images/common_circle_add.png"
                    />
                </view>
            </template>
        </CustomNavBar>
        <u-overlay
            :show="moreMenuVisible"
            opacity="0"
            @click="moreMenuVisible = false"
        >
            <view
                :style="{top:popMenuPosition.top,right:popMenuPosition.right}"
                class="more_menu"
            >
                <view class="arrow" />
                <view
                    v-for="item in moreMenus"
                    :key="item.idx"
                    class="menu_item"
                    @click="clickMenu(item)"
                >
                    <image
                        :src="item.icon"
                        mode=""
                    />
                    <text>{{ item.title }}</text>
                </view>
            </view>
        </u-overlay>
    </view>
</template>

<script>
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import { mapGetters } from 'vuex';
import { getEl } from '@/util/common';

import {
    scanQrCodeResult
} from '@/util/imCommon';
export default {
    name: 'ChatHeader',
    components: {
        CustomNavBar
    },
    data () {
        return {
            moreMenuVisible: false,
            popMenuPosition: {
                top: 0,
                right: 0
            },
            moreMenus: [
                {
                    idx: 3,
                    title: '创建群聊',
                    icon: require("static/images/more_create_group.png")
                },
                {
                    idx: 2,
                    title: '加入群聊',
                    icon: require("static/images/more_add_group.png")
                },
                {
                    idx: 1,
                    title: '搜索好友',
                    icon: require("static/images/more_add_friend.png")
                },
                {
                    idx: 0,
                    title: '扫一扫',
                    icon: require("static/images/more_qr.png")
                },
            ]
        };
    },
    computed: {
        ...mapGetters([
            'storeSelfInfo',
            'storeConnectingStatus'
        ])
    },
    methods: {
        clickMenu ({
            idx
        }) {
            switch (idx) {
            case 0:
                uni.scanCode({
                    scanType: ['qrCode'],
                    success: ({
                        result
                    }) => scanQrCodeResult(result)
                });
                break;
            case 1:
            case 2:
                uni.navigateTo({
                    url: `/pages/common/searchUserOrGroup/index?isSearchGroup=${idx === 2}`
                });
                break;
            case 3:
                uni.navigateTo({
                    url: `/pages/common/createGroup/index`
                });
                break;
            default:
                break;
            }
        },
        async showMore () {
            const {
                right,
                bottom
            } = await getEl.call(this, '.more_icon');
            this.popMenuPosition.right = (uni.getWindowInfo().windowWidth - right - 5) + 'px';
            this.popMenuPosition.top = bottom + 10 + 'px';
            this.moreMenuVisible = true;
        },
    }
};
</script>

<style lang="scss" scoped>
	.chat_header {
		padding: 0 20rpx;
        .header-text {
            font-size: 34rpx;
        }

        .more_menu {
            position: absolute;
            z-index: 999;
            box-shadow: 0px 0px 6px 2px rgba(0, 0, 0, 0.16);
            width: max-content;
            border-radius: 12rpx;
            background-color: $uni-bg-color-black;

            .arrow {
                position: absolute;
                top: -38rpx;
                right: 20rpx;
                border-width: 20rpx 15rpx;
                border-style: solid;
                border-color: transparent transparent $uni-bg-color-black transparent;
            }

            .menu_item {
                display: flex;
                align-items: center;
                padding: 33rpx 35rpx;
                color: $uni-text-color-inverse;

                image {
                    width: 42rpx;
                    height: 42rpx;
                    margin-right: 18rpx;
                }
            }

        }
	}
</style>

<template>
    <view class="chat_action_bar">
        <view
            v-for="item in actionList"
            :key="item.idx"
            class="action_item"
            @click="actionClick(item)"
        >
            <view
                v-if="!item.hide"
                :style="`width: ${width};height:${height}`"
                class="action_item_sub"
            >
                <view class="icon_nav">
                    <image :src="item.icon" />
                </view>
                <text class="action_item_title">
                    {{ item.title }}
                </text>
            </view>
        </view>
        <view
            v-for="v in 10"
            :key="v + 100"
            :style="`width: ${width};height:${0}`"
        />
    </view>
</template>

<script>
import { mapGetters } from 'vuex';
import { ChatingFooterActionTypes } from '@/constant';

export default {
    components: {},
    data() {
        return {
            ChatingFooterActionTypes: Object.freeze(ChatingFooterActionTypes),
            width: '140rpx',
            height: '140rpx',
            isSpecial: false
        };
    },
    computed: {
        ...mapGetters(['storeSelfInfo']),
        actionList() {
            return [
                {
                    idx: 0,
                    type: ChatingFooterActionTypes.Album,
                    title: '相册',
                    icon: require('static/images/chating_action_image.png')
                },
                {
                    idx: 1,
                    type: ChatingFooterActionTypes.Camera,
                    title: '拍摄',
                    icon: require('static/images/chating_action_camera.png')
                },
                // {
                //     idx: 2,
                //     type: ChatingFooterActionTypes.Call,
                //     title: '视频通话',
                //     icon: require('static/images/chating_action_call.png')
                // },
                {
                    idx: 3,
                    type: ChatingFooterActionTypes.File,
                    title: '文件',
                    icon: require('static/images/chating_action_file.png')
                },
                {
                    idx: 4,
                    type: ChatingFooterActionTypes.special,
                    title: '不可编辑消息',
                    icon: require(
                        `static/images/${
                            this.isSpecial ? 'special_checked' : 'special'
                        }.png`
                    ),
                    hide: this.storeSelfInfo?.managerLevel !== 8
                }
            ];
        }
    },
    methods: {
        async actionClick(action) {
            switch (action.type) {
                case ChatingFooterActionTypes.Album:
                case ChatingFooterActionTypes.Camera:
                case ChatingFooterActionTypes.Call:
                    this.$emit('prepareMediaMessage', action.type);
                    break;
                case ChatingFooterActionTypes.File:
                    this.$emit('prepareFileMessage', action.type);
                    break;
                case ChatingFooterActionTypes.special:
                    this.isSpecial = !this.isSpecial;
                    this.$emit('prepareNoEditMessage', action.type);
                    break;
                default:
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.chat_action_bar {
    padding: 24rpx 36rpx;
    background-color: $uni-bg-color;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-evenly;

    .action_item {
        margin-bottom: 20rpx;
        .action_item_sub {
            height: 100%;
            @include centerBox();
            flex-direction: column;

            .icon_nav {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 124rpx;
                height: 124rpx;
                background-color: #f6f7f9;
                border-radius: 30rpx;
                image {
                    width: 46rpx;
                    height: 46rpx;
                }
            }

            .action_item_title {
                font-size: 24rpx;
                color: $uni-text-color-grey;
                margin-top: 10rpx;
            }
        }
    }
}
</style>

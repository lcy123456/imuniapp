<template>
    <view class="chat_action_bar">
        <u-row class="action_row">
            <u-col
                v-for="item in actionList"
                :key="item.idx"
                span="3"
                @click="actionClick(item)"
            >
                <view class="action_item">
                    <image
                        :src="item.icon"
                        alt=""
                        srcset=""
                    />
                    <text class="action_item_title">
                        {{ item.title }}
                    </text>
                </view>
            </u-col>
        </u-row>
    </view>
</template>

<script>
import { ChatingFooterActionTypes } from '@/constant';

export default {
    components: {},
    data () {
        return {
            actionList: [
                {
                    idx: 0,
                    type: ChatingFooterActionTypes.Album,
                    title: '相册',
                    icon: require('static/images/chating_action_image.png'),
                },
                {
                    idx: 1,
                    type: ChatingFooterActionTypes.Camera,
                    title: '拍摄',
                    icon: require('static/images/chating_action_camera.png'),
                },
            ],
        };
    },
    methods: {
        async actionClick (action) {
            switch (action.type) {
            case ChatingFooterActionTypes.Album:
            case ChatingFooterActionTypes.Camera:
                this.$emit('prepareMediaMessage', action.type);
                break;
            default:
                break;
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.chat_action_bar {
    padding: 24rpx 36rpx;
    background-color: $uni-bg-color;

    .action_row {
        flex-wrap: wrap;
        margin-bottom: 24rpx;
    }

    .action_item {
        @include centerBox();
        flex-direction: column;
        margin-top: 24rpx;

        image {
            width: 96rpx;
            height: 96rpx;
        }

        &_title {
            font-size: 24rpx;
            color: #999;
            margin-top: 6rpx;
        }
    }
}
</style>

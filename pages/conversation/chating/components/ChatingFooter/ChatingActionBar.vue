<template>
    <view class="chat_action_bar">
        <view
            v-for="item in actionList"
            :key="item.idx"
            class="action_item"
            :style="`width: ${width};height:${height}`"
            @click="actionClick(item)"
        >
            <!-- <CheckFile
                v-if="item.type === ChatingFooterActionTypes.File"
                ref="checkFileRef"
                :width="width"
                :height="height"
                @change="actionClick({
                    ...item,
                    files: $event
                })"
            >
                <view class="action_item_sub">
                    <image :src="item.icon" />
                    <text class="action_item_title">
                        {{ item.title }}
                    </text>
                </view>
            </CheckFile> -->
            <!-- v-else -->
            <view
                class="action_item_sub"
            >
                <image :src="item.icon" />
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
import { ChatingFooterActionTypes } from '@/constant';
// import CheckFile from '@/components/CheckFile';

export default {
    components: {
        // CheckFile
    },
    data () {
        return {
            ChatingFooterActionTypes: Object.freeze(ChatingFooterActionTypes),
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
                // {
                //     idx: 2,
                //     type: ChatingFooterActionTypes.File,
                //     title: '文件',
                //     icon: require('static/images/chating_action_camera.png'),
                // },
            ],
            width: '140rpx',
            height: '140rpx',
        };
    },
    methods: {
        async actionClick (action) {
            switch (action.type) {
            case ChatingFooterActionTypes.Album:
            case ChatingFooterActionTypes.Camera:
                this.$emit('prepareMediaMessage', action.type);
                break;
            case ChatingFooterActionTypes.File:
                this.$emit('prepareFileMessage', action);
                break;
            default:
            }
        },
        checkFileLayout (val) {
            this.$refs.checkFileRef[0][val]();
        }
    },
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

            image {
                width: 96rpx;
                height: 96rpx;
            }

            &_title {
                font-size: 24rpx;
                color: $uni-bg-color-grey;
                margin-top: 6rpx;
            }
        }
    }

}
</style>

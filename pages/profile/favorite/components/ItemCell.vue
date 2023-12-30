<template>
    <view class="item_cell">
        <template v-if="source.idx == 1">
            <view v-for="item in 3" :key="item" class="mb-20 unit_cell">
                <text class="fz-26 text-grey"> 用户名好上头 </text>
                <text class="text_base ellipsisWithLine1">
                    我自横刀向天笑
                </text>
            </view>
        </template>
        <template v-if="source.idx == 2">
            <text class="mt-8 text_base ellipsisWithLine2">
                望门投止思张俭，忍死须臾待杜根。我自横刀向天笑，去留肝胆两昆仑
            </text>
        </template>
        <template v-if="source.idx == 3">
            <view class="flex justify-between">
                <view style="width: 80%">
                    <text class="text_base ellipsisWithLine2">
                        望门投止思张俭，忍死须臾待杜根。我自横刀向天笑，去留肝胆两昆仑111
                    </text>
                    <text class="mt-10 fz-24 text-grey"> PDF 24.MB </text>
                </view>
                <image class="w-100 h-116" :src="favoriteFile" />
            </view>
        </template>
        <template v-if="source.idx == 4">
            <image class="log_image" :src="favoriteFile" />
        </template>
        <template v-if="source.idx == 5">
            <view class="video_panel">
                <image class="log_image" :src="favoriteFile" />
                <image
                    class="play_icon"
                    src="/static/images/chating_message_video_play.png"
                />
            </view>
        </template>
        <view class="who_panel">
            <text>我的无聊群组</text>
            <text>今天</text>
        </view>
    </view>
</template>

<script>
import favoriteFile from '@/static/images/favorite_file.png';
export default {
    name: 'ItemCell',
    props: {
        source: {
            type: Object,
            default: () => {}
        }
    },
    data() {
        return {
            favoriteFile
        };
    },
    methods: {
        oncli() {
            // let map = {
            //   url: pictureElem?.sourcePicture.url,
            //   poster: [pictureElem?.sourcePicture.url, pictureElem?.sourcePath],
            //   type: 'image',
            // };
            // if (isVideo) {
            //   map = {
            //     url: videoElem.videoUrl,
            //     poster: [videoElem?.snapshotUrl],
            //     type: 'video',
            //   };
            // }
            const list = [
                {
                    url: '',
                    type: 'image'
                },
                {
                    url: '',
                    poster: '',
                    type: 'video'
                }
            ];
            uni.$u.route('/pages/common/previewMedia/index', {
                list: encodeURIComponent(JSON.stringify(list)),
                current: 0
            });
        }
    }
};
</script>

<style lang="scss" scoped>
.item_cell {
    border-radius: 10rpx;
    padding: 30rpx;
    background-color: #ffffff;
}

.unit_cell {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
}

.video_panel {
    position: relative;
    width: 216rpx;
    height: 216rpx;
}

.log_image {
    width: 216rpx;
    height: 216rpx;
    border-radius: 10rpx;
}

.play_icon {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    width: 86rpx;
    height: 80rpx;
    z-index: 2;
}

.who_panel {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 30rpx;
    text {
        font-size: 24rpx;
        color: $uni-text-color-grey;
    }
}

.text_base {
    font-size: 32rpx;
    color: $uni-text-color;
    //   -webkit-user-select: text;
    //   user-select: text;
}

.ellipsisWithLine1 {
    @include ellipsisWithLine(1);
}
.ellipsisWithLine2 {
    @include ellipsisWithLine(2);
}
</style>

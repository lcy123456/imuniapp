<template>
    <swiper
        class="swiper_wrap"
        :style="{height: (gifsData.length > 0 && current === 1) ? '600rpx' : '300rpx'}"
        :indicator-dots="true"
        indicator-active-color="#007aff"
        @change="handleSwiperChange"
    >
        <swiper-item class="chat_emoji_bar">
            <!-- :id="`emoji${emoji.context}`" -->
            <image
                v-for="emoji in emojiList"
                :key="emoji.context"
                class="emoji_item"
                :src="emoji.src"
                mode="aspectFit"
                @click="handleSendEmoji(emoji)"
            />
            <view
                v-for="v in 10" 
                :key="v"
                class="emoji_item_temp"
            />
        </swiper-item>
        <swiper-item class="chat_gifs_bar">
            <uni-search-bar
                v-model="keyword"
                class="h-70"
                placeholder="搜索"
                @confirm="handleGetGifs(true)"
                @cancel="handleSearchCancle"
            />
            <scroll-view
                class="chat_gifs_container"
                scroll-y
                @scrolltolower="handleGetGifs(false)"
            >
                <MyImage
                    v-for="(v, i) in gifsData"
                    :key="v.id + i"
                    class="gif_item"
                    :src="v.images.preview_gif.url"
                    mode="aspectFit"
                    @click="handleSendGif(v)"
                />
                <view
                    v-for="v in 10" 
                    :key="v"
                    class="gif_item_temp"
                />
                <view :class="`w-full ${gifsData.length === 0 && 'absolute t-0'}`">
                    <u-loading-icon v-show="gifLoading" />
                </view>
            </scroll-view>
        </swiper-item>
    </swiper>
</template>

<script>
import { getGifsSearch } from "@/api/index.js";
import emojis from "@/common/emojis.js";
import MyImage from "@/components/MyImage";

const limit = 25;

export default {
    components: {
        MyImage
    },
    data () {
        return {
            current: 0,
            emojiList: Object.freeze(emojis),
            keyword: "",
            gifScrollEnd: false,
            gifLoading: false,
            gifsData: []
        };
    },
    
    methods: {
        handleSwiperChange ({detail}) {
            this.current = detail.current;
        },
        handleSendEmoji (emoji) {
            this.$emit('emojiClick', emoji);
        },
        handleSearchCancle () {
            this.gifsData = [];
        },
        async handleGetGifs (isInit) {
            if (isInit) this.gifScrollEnd = false;
            if (this.gifScrollEnd) return;
            this.gifLoading = true;
            const res = await getGifsSearch({
                q: this.keyword,
                offset: isInit ? 0 : this.gifsData.length,
                limit
            });
            this.gifsData = isInit ? res.data : [...this.gifsData, ...res.data];
            if (limit > res.data.length) {
                this.gifScrollEnd = true;
            }
            // console.log('getGifs', res);
            this.gifLoading = false;
        },
        handleSendGif (v) {
            const original = v.images.original;
            this.$emit('sendGif', original);
        }
    }
};
</script>

<style lang="scss" scoped>
.swiper_wrap {
    background-color: $uni-bg-color;
    padding: 0 36rpx;
    .chat_emoji_bar {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-content: flex-start;
        .emoji_item {
            width: 80rpx;
            height: 80rpx;
            margin-bottom: 24rpx;
        }
        .emoji_item_temp {
            width: 80rpx;
            height: 0;
        }

    }
    .chat_gifs_bar {
        display: flex;
        flex-direction: column;
        .chat_gifs_container {
            flex: 1;
            overflow: hidden;
            margin-top: 40rpx;
            position: relative;
            /deep/ .uni-scroll-view-content {
                display: flex;
                flex-wrap: wrap;
                justify-content: space-between;
                .gif_item {
                    flex: 0 0 150rpx;
                    height: 150rpx;
                    margin-bottom: 40rpx;
                }
                .gif_item_temp {
                    flex: 0 0 150rpx;
                    height: 0;
                }
            }
        }
    }
}
</style>

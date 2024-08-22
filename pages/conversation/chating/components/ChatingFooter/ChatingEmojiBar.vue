<template>
    <view>
        <swiper
            class="swiper_wrap"
            :style="getHeight"
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
                <view v-for="v in 10" :key="v" class="emoji_item_temp" />
            </swiper-item>
            <swiper-item class="chat_gifs_bar">
                <uni-search-bar
                    v-model="keyword"
                    class="h-70"
                    :placeholder="$t('Search')"
                    @confirm="handleGetGifs(true)"
                    @cancel="handleSearchCancle"
                />
                <Empty v-if="gifsData.length === 0" />
                <scroll-view
                    v-else
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
                    <view v-for="v in 10" :key="v" class="gif_item_temp" />
                    <view
                        :class="`w-full ${
                            gifsData.length === 0 && 'absolute t-0'
                        }`"
                    >
                        <u-loading-icon v-show="gifLoading" />
                    </view>
                </scroll-view>
            </swiper-item>
            <swiper-item class="chat_gifs_bar">
                <Empty v-if="emoticonsList.length === 0" />
                <scroll-view
                    v-else
                    class="chat_gifs_container"
                    scroll-y
                    @scrolltolower="loadMoreEmoticonsList"
                >
                    <view
                        v-for="(v, i) in emoticonsList"
                        :key="'emoticonsList-' + v.id"
                        class="gif_item"
                        @longpress="handleLongpress(v, i)"
                    >
                        <MyImage
                            :src="v.url"
                            class="emoticons-item"
                            mode="aspectFit"
                            @click="handleSendEmoticons(v)"
                        />
                    </view>
                    <view v-for="v in 4" :key="v" class="gif_item" />
                    <view
                        :class="`w-full ${
                            emoticonsList.length === 0 && 'absolute t-0'
                        }`"
                    >
                        <u-loading-icon v-show="emojiLoading" />
                    </view>
                </scroll-view>
            </swiper-item>
        </swiper>
        <u-action-sheet
            :safe-area-inset-bottom="true"
            round="12"
            :actions="actionSheetMenu"
            :close-on-click-overlay="true"
            :close-on-click-action="true"
            :show="showActionSheet"
            @select="selectClick"
            @close="showActionSheet = false"
        />
    </view>
</template>

<script>
import { getGifsSearch } from '@/api/index.js';
import { emojiCollectList, emojiCollectCancel } from '@/api/emoji.js';
import emojis from '@/common/emojis.js';
import MyImage from '@/components/MyImage';
import { formatFileUrl } from '@/util/imCommon';

const limit = 25;
const showNumber = 12;

export default {
    components: {
        MyImage
    },
    data() {
        return {
            showActionSheet: false,
            emojisEnd: false,
            pageNumber: 1,
            actionSheetMenu: [
                {
                    name: this.$t('Delete_emoticon'),
                    type: 0
                },
                {
                    name: this.$t('Cancel'),
                    type: 1
                }
            ],
            current: 0,
            emojiList: Object.freeze(emojis),
            keyword: '',
            emoticonsList: [],
            gifScrollEnd: false,
            gifLoading: false,
            index: 0,
            gifsData: []
        };
    },
    computed: {
        getHeight() {
            const { current } = this;
            let height = '300rpx';
            if (current === 1 || current === 2) {
                height = '500rpx';
            }
            return {
                height
            };
        }
    },
    created() {
        uni.$on('undateEmoticons', this.emojiCollectList);
        this.emojiCollectList('init');
        this.handleGetGifs(true);
    },
    methods: {
        async selectClick({ type }) {
            if (type === 0) {
                try {
                    await emojiCollectCancel({
                        id: this.item.id
                    });
                    uni.$u.toast(this.$t('Delete_successfully'));
                    const l = [...this.emoticonsList];
                    const index = this.emoticonsList.findIndex(
                        v => v.id === this.item.id
                    );
                    l.splice(index, 1);
                    this.emoticonsList = l;
                    this.emojiCollectList();
                    this.showActionSheet = false;
                } catch (err) {
                    uni.$u.toast(this.$t('Delete_failed'));
                }
            } else {
                this.showActionSheet = false;
            }
        },
        handleLongpress(item) {
            this.showActionSheet = true;
            this.item = item;
        },
        handleSwiperChange({ detail }) {
            this.current = detail.current;
        },
        handleSendEmoji(emoji) {
            this.$emit('emojiClick', emoji);
        },
        handleSearchCancle() {
            this.gifsData = [];
            this.handleGetGifs(true);
        },
        loadMoreEmoticonsList() {
            if (this.emojisEnd) return;
            this.pageNumber++;
            this.emojiCollectList();
        },
        async emojiCollectList(type) {
            if (type === 'init') {
                this.pageNumber = 1;
                this.emojisEnd = false;
            }
            const pageNumber = this.pageNumber;
            this.emojiLoading = true;
            const map = {
                pagination: {
                    pageNumber,
                    showNumber
                }
            };
            const { list } = await emojiCollectList(map);
            const emoticonsListIdList = this.emoticonsList.map(item => item.id);
            const l = (list || []).filter(item => {
                item.url = formatFileUrl(item.url);
                return !emoticonsListIdList.includes(item.id);
            });
            this.emojisEnd = list.length !== showNumber;
            this.emoticonsList = this.emoticonsList.concat(l);
            this.emojiLoading = false;
        },
        async handleGetGifs(isInit) {
            if (isInit) this.gifScrollEnd = false;
            if (this.gifScrollEnd) return;
            this.gifLoading = true;
            const res = await getGifsSearch({
                q: this.keyword || 'funny',
                offset: isInit ? 0 : this.gifsData.length,
                limit
            });
            this.gifsData = isInit ? res.data : [...this.gifsData, ...res.data];
            if (limit > res.data.length) {
                this.gifScrollEnd = true;
            }
            this.gifLoading = false;
        },
        handleSendGif(v) {
            const original = v.images.original;
            this.$emit('sendGif', original);
        },
        handleSendEmoticons(v) {
            this.$emit('sendGif', {
                url: v.url
            });
        }
    }
};
</script>

<style lang="scss" scoped>
.swiper_wrap {
    background-color: $uni-bg-color;
    padding: 0 36rpx;
    /deep/ .empty-css {
        padding-top: 50rpx;
    }
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
                .emoticons-item {
                    height: 150rpx;
                }
            }
        }
    }
}
</style>

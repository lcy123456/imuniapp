<template>
    <view v-if="isShow && list.length" class="pin-to-top-box">
        <view class="index-box">
            <view
                v-for="(item, index) of list"
                :key="item.id"
                :class="['box', index === active ? 'active' : '']"
                :style="{
                    height: `calc(${(100 / list.length) * 0.7}rpx - 4rpx)`
                }"
            />
        </view>
        <view class="content">
            <text>置顶消息</text>
            <scroll-view
                class="scroll_view"
                :scroll-with-animation="true"
                :scroll-into-view="scrollIntoView"
                scroll-y
                :upper-threshold="0"
            >
                <view
                    v-for="item of list"
                    :id="`pin${item.id}`"
                    :key="item.id"
                    class="box"
                >
                    <text
                        v-if="showTextRender(item)"
                        class="text"
                        v-html="html2Text(item.content)"
                    >
                    </text>
                    <view v-if="showMediaRender(item)" class="img-box">
                        <image :src="formatFileUrl(item.content)" />
                    </view>
                    <view v-if="showFileRender(item)" class="file-box">
                        <image
                            src="/static/images/chating_action_file.png"
                            class="content-img"
                        />
                        <text class="text">
                            {{ item.content }}
                        </text>
                    </view>
                </view>
            </scroll-view>
            <view class="dialog" @touchend.prevent="setTop" />
        </view>
        <image
            class="close"
            src="/static/images/close.png"
            @touchend.prevent="close"
        />
    </view>
</template>

<script>
import { html2Text } from '@/util/common';
import { TextRenderTypes, MediaRenderTypes, FileRenderTypes } from '@/constant';
import { formatFileUrl } from '@/util/imCommon';

export default {
    name: 'PinToTop',
    components: {},
    props: {
        isReverse: {
            type: Boolean,
            default: true
        },
        list: {
            type: Array,
            default: () => []
        },
        conversationID: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            active: 0,
            isShow: true,
            scrollIntoView: ''
        };
    },
    computed: {},
    watch: {
        list() {
            this.init();
        }
    },
    mounted() {
        setTimeout(() => {
            this.init();
        }, 10);
    },
    methods: {
        html2Text,
        formatFileUrl,
        close() {
            console.log(33443);
            this.isShow = false;
        },
        init() {
            if (!this.list.length) return;
            this.active = this.list.length - 1;
            const nextItem =
                this.list[this.active - 1] || this.list[this.list.length - 1];
            this.scrollIntoView = 'pin' + nextItem.id;
        },
        setTop() {
            this.active =
                this.active !== 0 ? this.active - 1 : this.list.length - 1;
            const item =
                this.list[this.active] || this.list[this.list.length - 1];
            const nextItem =
                this.list[this.active - 1] || this.list[this.list.length - 1];
            this.scrollIntoView = 'pin' + nextItem.id;
            this.$emit('setPositionMsgID', item.clientMsgID, item.seq);
        },
        showTextRender(item) {
            return TextRenderTypes.includes(item.contentType);
        },
        showMediaRender(item) {
            return MediaRenderTypes.includes(item.contentType);
        },
        showFileRender(item) {
            return FileRenderTypes.includes(item.contentType);
        }
    }
};
</script>

<style lang="scss" scoped>
.pin-to-top-box {
    width: 100%;
    margin: 0 auto;
    padding: 10rpx 20rpx;
    color: #3981f8;
    background: #f4fbff;
    font-size: 26rpx;
    border-radius: 23rpx;
    display: flex;
    align-items: center;
    .index-box {
        .box {
            width: 4rpx;
            background: rgba(0, 141, 255, 0.3);
            margin-top: 4px;
            &:nth-child(1) {
                margin-top: 0;
            }
            &.active {
                background: rgba(0, 141, 255, 1);
            }
        }
    }
    & > .content {
        margin-left: 20rpx;
        flex: 1;
        margin-right: 40rpx;
        position: relative;
        & > uni-text {
            font-size: 28rpx;
            margin-bottom: 10rpx;
        }
        .dialog {
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            z-index: 2;
        }
    }
    .close {
        margin-left: 10rpx;
        width: 30rpx;
        height: 30rpx;
    }
    .scroll_view {
        width: 100%;
        height: 60rpx;
        .box {
            display: flex;
            height: 60rpx;
            line-height: 60rpx;
            margin: 0;
            & > .text {
                flex: 1;
                display: flex;
                align-items: center;
                font-size: 32rpx;
                height: 60rpx;
                color: #222222;
                margin: 10rpx 0;
                @include ellipsisWithLine(1);
                // white-space: nowrap;
                // text-overflow: ellipsis;
                // overflow: hidden;
            }
            .img-box {
                display: flex;
                align-items: center;
                height: 60rpx;
                uni-image {
                    width: 40rpx;
                    height: 40rpx;
                }
            }
            .file-box {
                display: flex;
                align-items: center;
                height: 60rpx;
                uni-image {
                    width: 40rpx;
                    height: 40rpx;
                    margin-right: 20rpx;
                }
            }
        }
    }
}
</style>

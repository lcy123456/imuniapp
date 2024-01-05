<template>
    <Page>
        <view class="favorite_container">
            <CustomNavBar title="我的收藏" is-bg-color2 />
            <Empty v-if="favoriteList.length === 0" />
            <z-paging
                ref="pagingRef"
                :fixed="false"
                :auto="false"
                :refresher-enabled="false"
                default-page-size="20"
                :show-loading-more-no-more-view="false"
                @query="queryList"
            >
                <uni-swipe-action ref="swipeWrapperRef">
                    <uni-swipe-action-item
                        v-for="(item, index) in favoriteList"
                        :key="index"
                        :index="item.id"
                        :right-options="swipeAction"
                        :disabled="isDisabled"
                        :threshold="50"
                        @click="swipeActionClick($event, item)"
                    >
                        <ItemCell :source="item" />
                    </uni-swipe-action-item>
                </uni-swipe-action>
            </z-paging>
        </view>
    </Page>
</template>

<script>
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import ItemCell from './components/ItemCell.vue';
import { collectList, collectCancel } from '@/api/message';
import { MediaRenderTypes } from '@/constant';
export default {
    components: {
        CustomNavBar,
        ItemCell
    },
    data() {
        return {
            favoriteList: [],
            pageNo: 1,
            isDisabled: false
        };
    },
    computed: {
        swipeAction() {
            let action = [
                {
                    text: '删除该收藏',
                    icon: `/static/images/conversation_del.png`,
                    style: {
                        iconSize: '40rpx',
                        fontSize: '28rpx',
                        backgroundColor: '#E75E58',
                        padding: '26rpx 40rpx'
                    }
                }
            ];
            return action;
        }
    },
    onLoad() {
        this.collectList(1);
    },
    methods: {
        async queryList(pageNo) {
            this.collectList(pageNo);
        },
        async collectList(pageNo) {
            console.log('pageNo-pageNo', pageNo);
            this.pageNo = pageNo;
            const { list } = await collectList({
                pagination: {
                    pageNumber: pageNo,
                    showNumber: 10
                }
            });
            let l = list.map(item => {
                return {
                    ...item,
                    content: JSON.parse(item.content)
                };
            });
            const favoriteListIdList = this.favoriteList.map(item => item.id);
            l = l.filter(item => !favoriteListIdList.includes(item.id));
            this.favoriteList = this.favoriteList.concat(l);
            console.log('this.favoriteList---this.favoriteList', list);
            this.getSearchRecordMedia();
        },
        closeAllSwipe() {
            this.$refs.swipeWrapperRef.closeAll();
        },
        goPerson({ id }) {
            uni.$u.route(`/pages/common/userCard/index?sourceID=${id}`);
        },
        goLink({ url }) {
            plus.runtime.openURL(url);
        },
        getSearchRecordMedia() {
            const imgList = this.favoriteList
                .map(item => item.content)
                .filter(message =>
                    MediaRenderTypes.includes(message.contentType)
                );
            uni.$emit('setMediaList', imgList);
        },
        async swipeActionClick({ index }, item) {
            console.log(index, item);
            switch (index) {
                case 0:
                    await this.handleDelete(item);
                    break;
            }
        },
        async handleDelete(item) {
            try {
                await collectCancel({
                    id: item.id
                });
                uni.$u.toast('删除成功');
                const l = [...this.favoriteList];
                const index = this.favoriteList.findIndex(
                    v => v.id === item.id
                );
                l.splice(index, 1);
                this.favoriteList = l;
                this.collectList(this.pageNo);
            } catch (err) {
                console.log(err);
            }
        }
    }
};
</script>

<script module="chatRender" lang="renderjs">
export default {
    mounted () {
        this.bindEvent();
    },
    methods: {
        bindEvent () {
            document.querySelector(`.favorite_container`).addEventListener('click', (event) => {
                const target = event.target;
                if (target.getAttribute('data-url')) {
                    this.$ownerInstance.callMethod('goLink', {
                        url: target.getAttribute('data-url')
                    });
                }
                if (target.getAttribute('data-at') && target.getAttribute('data-at') !== '999999999') {
                    this.$ownerInstance.callMethod('goPerson', {
                        id: target.getAttribute('data-at')
                    });
                }
            });
        }
    }
}
</script>
<style lang="scss" scoped>
.favorite_container {
    @include colBox(false);
    background-color: #eff1f4;
    height: 100vh;
    overflow-y: hidden;
}

.z-paging-content {
    flex: 1;
}

/deep/.uni-swipe_button-group {
    .uni-swipe_button {
        height: 90rpx !important;
        padding: 0 40rpx !important;
        display: flex;
        justify-content: space-evenly;
        border-radius: 45rpx;
        margin: auto 20rpx;
        .u-icon {
            width: 50rpx;
            height: 50rpx;
            .u-icon__img {
                width: 100% !important;
                height: 100% !important;
            }
        }
        .uni-swipe_button-text {
            font-size: 28rpx !important;
        }
    }
}
/deep/ .voice_message_container {
    margin: 10rpx;
    .voice-box {
        // box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.2);
        border: 1px solid #dedede57;
    }
}
/deep/ .merge_message_container {
    // box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.2);
    border: 1px solid #dedede57;
    margin: 10rpx;
    width: calc(100vw - 10rpx * 2 - 20rpx * 2 - 30rpx * 2) !important;
}
/deep/ .file_message_container {
    // box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.2);
    border: 1px solid #dedede57;
    margin: 10rpx;
    width: calc(100vw - 10rpx * 2 - 20rpx * 2 - 30rpx * 2) !important;
}
</style>

<template>
    <Page>
        <view class="favorite_container">
            <CustomNavBar
                title="我的收藏"
                is-bg-color2
            />
            <z-paging
                ref="pagingRef"
                :fixed="false"
                :auto="false"
                default-page-size="20"
                :show-loading-more-no-more-view="false"
                @query="queryList"
            >
                <uni-swipe-action ref="swipeWrapperRef">
                    <uni-swipe-action-item
                        v-for="item in favoriteList"
                        :key="item.idx"
                        :index="item.idx"
                        :right-options="swipeAction"
                        :disabled="isDisabled"
                        :threshold="50"
                        @click="swipeActionClick"
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
import ItemCell from "./components/ItemCell.vue";

export default {
    components: {
        CustomNavBar,
        ItemCell,
    },
    data () {
        return {
            favoriteList: [
                {
                    idx: 1
                },
                {
                    idx: 2
                },
                {
                    idx: 3
                },
                {
                    idx: 4
                },
                {
                    idx: 5
                }
            ],
            isDisabled: false,
        };
    },
    computed: {
        swipeAction () {
            let action = [
                {
                    text: '删除该收藏',
                    icon: `/static/images/conversation_del.png`,
                    style: {
                        iconSize: '40rpx',
                        fontSize: '28rpx',
                        backgroundColor: '#E75E58',
                        padding: '26rpx 40rpx',
                    }
                },
            ];
            return action;
        },
    },
    onLoad () {
      
    },
    methods: {
        async queryList () {
        },
        closeAllSwipe () {
            this.$refs.swipeWrapperRef.closeAll();
        },
        swipeActionClick ({}) {
        }
    }
};
</script>

<style lang="scss" scoped>
.favorite_container {
  @include colBox(false);
  background-color: #EFF1F4;
  height: 100vh;
  overflow-y: hidden;

}

.z-paging-content {
  flex: 1;
}

/deep/.uni-swipe_button-group {
    .uni-swipe_button {
        height: 90rpx!important;
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
</style>

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
                @refresherTouchmove="refresherTouchmove"
                @refresherTouchend="refresherTouchend"
            >
                <u-swipe-action ref="swipeWrapperRef">
                    <u-swipe-action-item
                        v-for="item in favoriteList"
                        :key="item.idx"
                        :index="item.idx"
                        :options="swipeAction"
                        :disabled="isDisabled"
                        :threshold="50"
                        @click="swipeActionClick"
                    >
                        <ItemCell :source="item" />
                    </u-swipe-action-item>
                </u-swipe-action>
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
                    text: '删除',
                    icon: `/static/images/conversation_del.png`,
                    style: {
                        iconSize: '40rpx',
                        fontSize: '28rpx',
                        backgroundColor: '#E75E58',
                        borderRadius: '50rpx',
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
        async queryList (pageNo) {
            console.log('xxx', pageNo);
        },
        refresherTouchmove () {
            this.isDisabled = true;
        },
        refresherTouchend () {
            setTimeout(() => {
                this.isDisabled = false;
            }, 500);
        },
        closeAllSwipe () {
            this.$refs.swipeWrapperRef.closeAll();
        },
        swipeActionClick ({index}) {
            console.log(index);
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

/deep/ .u-swipe-action{
  background-color: #EFF1F4;
}

/deep/ .u-swipe-action-item {
  margin-bottom: 30rpx;
}
</style>

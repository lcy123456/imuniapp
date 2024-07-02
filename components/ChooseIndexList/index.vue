<template>
    <u-index-list
        class="user_list"
        :style="{ height: height }"
        :index-list="indexList"
        @scrolltolower="scrolltolower"
    >
        <view v-for="(item, index) in itemArr" :key="index">
            <u-index-item>
                <u-index-anchor class="user_anchor" :text="indexList[index]" />
                <UserItem
                    v-for="cell in item"
                    :key="cell.userID"
                    :checked="checkedIDList.includes(cell.userID)"
                    :disabled="disabledIDList.includes(cell.userID)"
                    :check-visible="showCheck"
                    :item="cell"
                    @itemClick="itemClick"
                    @updateCheck="updateCheck"
                />
            </u-index-item>
        </view>
    </u-index-list>
</template>

<script>
import UserItem from '../UserItem/index.vue';
export default {
    name: 'ChooseIndexList',
    components: {
        UserItem
    },
    props: {
        height: {
            type: String,
            default: '0px'
        },
        indexList: {
            type: Array,
            default: () => []
        },
        itemArr: {
            type: Array,
            default: () => []
        },
        checkedIDList: {
            type: Array,
            default: () => []
        },
        disabledIDList: {
            type: Array,
            default: () => []
        },
        showCheck: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {};
    },
    methods: {
        itemClick(item) {
            this.$emit('itemClick', item);
        },
        updateCheck(item) {
            this.$emit('updateCheck', item);
        },
        scrolltolower() {
            this.$emit('scrolltolower');
        }
    }
};
</script>

<style scoped lang="scss">
.user_list {
    flex: 1;
    overflow: hidden;
    /deep/uni-scroll-view {
        max-height: 100% !important;
    }
}

.user_anchor {
    padding-left: 95rpx;
    background-color: $uni-bg-color !important;
    border: none !important;
}
</style>

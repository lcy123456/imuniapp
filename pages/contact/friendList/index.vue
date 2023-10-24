<template>
    <Page>
        <view class="friend_list_container">
            <CustomNavBar
                title="我的好友"
                is-bg-color2
            />
            <view class="px-20 pb-20 pt-10">
                <u-search
                    v-model="keyword"
                    shape="square"
                    placeholder="搜索"
                    :show-action="false"
                    input-align="center"
                    bg-color="#fff"
                    height="70rpx"
                />
            </view>

            <ChooseIndexList
                v-if="getIndexData.dataList.length > 0"
                class="bg-color"
                :index-list="getIndexData.indexList"
                :item-arr="getIndexData.dataList"
                @itemClick="userClick"
            />
            <u-empty
                v-else
                mode="list"
            />
        </view>
    </Page>
</template>

<script>
import { mapGetters } from 'vuex';
import { formatChooseData } from '@/util/common';
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import ChooseIndexList from '@/components/ChooseIndexList/index.vue';
export default {
    components: {
        CustomNavBar,
        ChooseIndexList,
    },
    data () {
        return {
            keyword: '',
        };
    },
    computed: {
        ...mapGetters(['storeFriendList']),
        getIndexData () {
            const newList = this.storeFriendList.filter(
                (friend) =>
                    friend.nickname.includes(this.keyword) ||
                    friend.remark.includes(this.keyword)
            );
            return formatChooseData(newList);
        },
    },
    mounted () {
    },
    methods: {
        userClick (friend) {
            uni.navigateTo({
                url: `/pages/common/userCard/index?sourceID=${friend.userID}`,
            });
        }
    },
};
</script>

<style lang="scss" scoped>
.friend_list_container {
    height: 100vh;
    background-color: $uni-bg-color-grey;
    display: flex;
    flex-direction: column;

    .u-empty {
        flex: 1;
    }
}
</style>

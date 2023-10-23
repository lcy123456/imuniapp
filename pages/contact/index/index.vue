<template>
    <view
        class="contact_container"
    >
        <!-- <div>
            <text @click="roomModule.toggleAudio">切换声音</text>
            <text @click="roomModule.toggleVideo">开关视频</text>
            <text @click="roomModule.toggleVideoInput">切换视频</text>
        </div> -->
        <CustomNavBar
            :show-left="false" 
            is-bg-color2
            title="通讯录"
        >
            <view
                slot="more"
                class="mr-30"
                @click="contactAddClick"
            >
                <image
                    src="@/static/images/common_circle_add.png"
                    class="w-44 h-44"
                />
            </view>
        </CustomNavBar>
        <view
            class="px-20 pt-10 pb-20"
            @click="handleToSearch"
        >
            <uni-search-bar
                v-model="keyword"
                bg-color="#fff"
                class="h-70"
                placeholder="搜索"
                readonly
            />
        </view>
        <ContactMenus />

        <view class="list_title">
            <text>常用联系人</text>
        </view>

        <u-list
            class="user_list"
        >
            <u-list-item
                v-for="user in frequentContacts"
                :key="user.userID"
            >
                <UserItem
                    :item="user"
                    @itemClick="userClick"
                />
            </u-list-item>
        </u-list>
    </view>
</template>

<script>
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import ContactMenus from './components/ContactMenus.vue';
import UserItem from "@/components/UserItem/index.vue";
export default {
    components: {
        CustomNavBar,
        ContactMenus,
        UserItem
    },
    data () {
        return {
            videoelm: null,
            keyword: '',
            update: '',
            frequentContacts: []
        };
    },
    onShow () {
        this.getFrequentContacts();
    },
    methods: {
        handleToSearch () {
            uni.$u.route('/pages/common/searchRecord/index');
        },
        contactAddClick () {
            uni.navigateTo({
                url: "/pages/contact/contactAdd/index"
            });
        },
        getFrequentContacts () {
            const tmpData = uni.getStorageSync(`${this.$store.getters.storeCurrentUserID}_frequentContacts`) || [];
            this.frequentContacts = [...tmpData].sort((a, b) => b - a);
        },
        userClick (item) {
            uni.navigateTo({
                url: `/pages/common/userCard/index?sourceID=${item.userID}`
            });
        },
    }
};
</script>
<style lang="scss" scoped>

    .screenshare-video {
        width: 400px;
        height: 400px;
        border: 1px solid red;
    }
	.contact_container {
		@include colBox(false);
		height: 100vh;
		background-color: $uni-bg-color-grey;

		.list_title {
			font-size: 24rpx;
			color: $uni-text-color-grey;
			margin-left: 30rpx;
		}

		.user_list {
			flex: 1;
            overflow: hidden;
			margin-top: 24rpx;
			background-color: $uni-bg-color;
		}
	}
</style>

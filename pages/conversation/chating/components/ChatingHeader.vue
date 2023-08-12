<template>
    <CustomNavBar
        class="chating_header"
        bg-color="rgba(255,255,255, .8)"
    >
        <view
            slot="center"
            class="conversation_info"
        >
            <view class="title">
                {{ storeCurrentConversation.showName }}
            </view>
            <view
                v-if="isSingle"
                class="fz-24 text-grey flex align-center justify-center"
            >
                <view :class="['w-12', 'h-12', 'br-12', isOnline ? 'bg-primary' : 'bg-inverse']" />
                <text class="ml-10">
                    {{ onlineStr }}
                </text>
            </view>
            <view
                v-else-if="isWorkingGroup"
                class="fz-24 text-grey"
            >
                {{ groupMemberCount }}
            </view>
        </view>
        <view slot="more">
            <view
                v-if="isSingle"
                class="right_action"
            >
                <MyAvatar
                    :src="storeCurrentConversation.faceURL"
                    :desc="storeCurrentConversation.showName"
                    size="60rpx"
                    shape="circle"
                    @click="showInfo"
                />
            </view>
            <view
                v-else-if="isWorkingGroup"
                class="right_action"
            >
                <u-icon
                    class="action_item"
                    name="more-dot-fill"
                    size="23"
                    color="#333"
                    @click="goSetting"
                />
            </view>
        </view>
    </CustomNavBar>
</template>

<script>
import CustomNavBar from '@/components/CustomNavBar';
import { mapGetters } from "vuex";
import { SessionType } from 'openim-uniapp-polyfill';
import MyAvatar from '@/components/MyAvatar/index.vue';
import { getDesignatedUserOnlineState } from "@/util/imCommon";

export default {
    name: 'ChatingHeader',
    components: {
        CustomNavBar,
        MyAvatar
    },
    data () {
        return {
            isOnline: false,
            onlineStr: "离线",
        };
    },
    computed: {
        ...mapGetters(['storeCurrentConversation', 'storeCurrentGroup', 'storeCurrentMemberInGroup']),
        userID () {
            return this.storeCurrentConversation.userID;
        },
        isSingle () {
            return this.storeCurrentConversation.conversationType === SessionType.Single;
        },
        isWorkingGroup () {
            return this.storeCurrentConversation.conversationType === SessionType.WorkingGroup;
        },
        isNotify () {
            return this.storeCurrentConversation.conversationType === SessionType.Notification;
        },
        groupMemberCount () {
            return `${this.storeCurrentGroup?.memberCount ?? 0}位成员`;
        },
    },
    methods: {
        async getOnlineState () {
            try {
                const res = await getDesignatedUserOnlineState(this.userID);
                this.isOnline = res !== "离线";
                this.onlineStr = res;
            } catch {
                this.isOnline = false;
            }
        },
        showInfo () {
            uni.$u.route(`/pages/common/userCard/index?sourceID=${this.userID}`);
        },
        goSetting () {
            uni.$u.route('/pages/conversation/groupSettings/index');
        }
    }
};
</script>

<style lang="scss" scoped>
	.chating_header {

		.conversation_info {
			text-align: center;

			.title {
				@include nomalEllipsis();
				max-width: 280rpx;
				font-size: 34rpx;
				font-weight: 500;
				font-family: MiSans-Medium;
			}
		}

		.right_action {
			@include vCenterBox();
			flex-direction: row;
			margin-right: 30rpx;

			.action_item {
				padding: 12rpx;
			}

			.u-icon {
				margin-left: 12rpx;
			}
		}
	}
</style>

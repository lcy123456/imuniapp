<template>
    <view>
        <text class="read_state">
            {{ getReadStateStr }}
        </text>
    </view>
</template>

<script>
import { SessionType } from 'openim-uniapp-polyfill';


export default {
    name: "",
    components: {},
    props: {
        message: Object,
    },
    data () {
        return {

        };
    },
    computed: {
        getReadStateStr () {
            if (this.message.sessionType === SessionType.Single) {
                return this.message.isRead ? '已读' : '未读';
            }
            return '';
        }
    },
};
</script>

<style lang="scss" scoped>
	.read_state {
		// font-size: 26rpx;
		font-size: 0.93rem;
		color: $u-primary;
	}
</style>

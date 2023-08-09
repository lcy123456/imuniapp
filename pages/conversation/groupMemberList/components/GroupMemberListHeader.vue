<template>
    <custom-nav-bar :title="getTitle" />
</template>

<script>
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import {
    ContactChooseTypes
} from '@/constant';
export default {
    name: "",
    components: {
        CustomNavBar
    },
    props: {
        checkVisible: {
            type: Boolean,
            default: false
        },
        groupID: String
    },
    data () {
        return {
				
        };
    },
    computed: {
        getTitle () {
            return this.checkVisible ? '移除群成员' : "群成员";
        }
    },
    methods: {

    }
};
</script>

<style lang="scss">
	.more_container {
		position: relative;

		.more_dot {
			padding: 24rpx;
			margin-right: 20rpx;
		}

		.more_menu {
			position: absolute;
			bottom: 0;
			left: 50%;
			transform: translate(-100%, 100%);
			box-shadow: 0px 0px 6px 2px rgba(0, 0, 0, 0.16);
			width: max-content;
			border-radius: 8rpx;
			background-color: #fff;

			.menu_item {
				padding: 20rpx 48rpx;
				font-size: 28rpx;
				color: $uni-text-color;

				&:nth-child(1) {
					border-bottom: 1px solid #F0F0F0;
				}
			}
		}
	}
</style>

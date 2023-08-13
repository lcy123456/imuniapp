<template>
    <u-navbar
        :title="title"
        placeholder
        class="custom_nav_bar"
        left-icon=""
        :bg-color="isBgColor2 ? bgColor2 : bgColor"
    >
        <template
            v-if="showLeft"
            slot="left"
        >
            <slot name="left">
                <view class="u-nav-slot">
                    <img
                        class="back_icon"
                        width="12"
                        height="20"
                        src="static/images/common_left_arrow.png"
                        alt=""
                        srcset=""
                        @click="leftClick"
                    >
                </view>
            </slot>
        </template>

        <template slot="center">
            <slot name="center" />
        </template>

        <template slot="right">
            <slot name="more">
                <view
                    v-if="more"
                    class="u-nav-slot"
                    @click="rightClick"
                >
                    <u-icon
                        class="more_dot"
                        name="more-dot-fill"
                        size="23"
                        color="#333"
                    />
                </view>
            </slot>
        </template>
    </u-navbar>
</template>

<script>
export default {
    name: "",
    components: {

    },
    props: {
        title: {
            type: String,
            default: ''
        },
        more: {
            type: Boolean,
            default: false
        },
        route: {
            type: Boolean,
            default: true
        },
        showLeft: {
            type: Boolean,
            default: true
        },
        bgColor: {
            type: String,
            default: '#fff'
        },
        isBgColor2: {
            type: Boolean,
            default: false
        },
        bgColor2: {
            type: String,
            default: '#eff1f4'
        }
    },
    data () {
        return {

        };
    },
    methods: {
        leftClick () {
            if (this.route) {
                uni.navigateBack();
            }
            this.$emit('leftClick');
        },
        rightClick () {
            this.$emit('rightClick');
        }
    }
};
</script>

<style lang="scss" scoped>
	.custom_nav_bar {
		/deep/ .u-navbar__content__left {
			padding: 0;
		}

        /deep/ .u-navbar__content, 
        /deep/.u-navbar__content__title {
            font-size: 36rpx;
            font-family: MiSans-Medium;
        }

		/deep/ .u-navbar__content__right {
			padding: 0;
		}

		.back_icon {
			padding: 24rpx;
			margin-left: 20rpx;
		}

		.more_dot {
			padding: 24rpx;
			margin-right: 30rpx;
		}
	}
</style>

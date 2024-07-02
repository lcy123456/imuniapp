<template>
    <view
        class="setting_item"
        :class="{ setting_item_border: border }"
        @click="onClick"
    >
        <slot name="content">
            <view class="setting_left">
                <text class="text">{{ title }}</text>
                <slot name="icon" />
            </view>
            <view class="setting_right">
                <slot name="right" />
                <text v-if="content" class="fz-28 text-grey">
                    {{ content }}
                </text>
                <u-switch
                    v-if="showSwitch"
                    :loading="loading"
                    :async-change="true"
                    size="20"
                    :value="switchValue"
                    inactive-color="#999"
                    @change="switchChange"
                />
                <u-icon
                    v-if="showArrow"
                    name="arrow-right"
                    size="18"
                    color="#999"
                    class="ml-12"
                />
            </view>
            <u-loading-icon v-show="loading" class="loading_icon" />
        </slot>
    </view>
</template>

<script>
export default {
    name: '',
    components: {},
    props: {
        title: {
            type: String,
            default: ''
        },
        content: {
            type: String,
            default: ''
        },
        showArrow: {
            type: Boolean,
            default: false
        },
        showSwitch: {
            type: Boolean,
            default: false
        },
        switchValue: {
            type: Boolean,
            default: false
        },
        loading: {
            type: Boolean,
            default: false
        },
        border: {
            type: Boolean,
            default: false
        },
        arrow: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {};
    },
    methods: {
        onClick() {
            this.$emit('click');
        },
        switchChange(value) {
            this.$emit('switch', value);
        }
    }
};
</script>

<style lang="scss" scoped>
.setting_item {
    @include btwBox();
    height: 130rpx;
    padding: 0 40rpx;
    color: $uni-text-color;
    position: relative;
    background-color: $uni-bg-color;
    border-radius: 30rpx;

    .setting_left,
    .setting_right {
        @include vCenterBox();
    }
    .setting_left {
        .text {
            margin-right: 10rpx;
        }
    }

    &_border {
        border-bottom: 1px solid rgba(153, 153, 153, 0.2);
    }
    .loading_icon {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }
}
</style>

<template>
    <view
        class="setting_item"
        :class="{ setting_item_border: border }"
        @click="onClick"
    >
        <text>{{ title }}</text>
        <u-switch
            v-if="isSwitch"
            :loading="loading"
            :async-change="true"
            size="20"
            :value="switchValue"
            @change="onChange"
        />
        <view
            v-else
            class="setting_right"
        >
            <slot />
            <u-icon
                v-if="arrow"
                name="arrow-right"
                color="#999"
                size="18"
            />
        </view>
    </view>
</template>

<script>
export default {
    name: '',
    components: {},
    props: {
        title: String,
        isSwitch: {
            type: Boolean,
            default: false,
        },
        switchValue: {
            type: Boolean,
            default: false,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        border: {
            type: Boolean,
            default: false,
        },
        arrow: {
            type: Boolean,
            default: true,
        },
    },
    data () {
        return {};
    },
    methods: {
        onClick () {
            this.$emit('click');
        },
        onChange (value) {
            this.$emit('switch', value);
        },
    },
};
</script>

<style lang="scss" scoped>
.setting_item {
    @include btwBox();
    height: 130rpx;
    padding: 0 40rpx;
    color: $uni-text-color;

    .setting_right {
        @include vCenterBox();
    }

    &_border {
        border-bottom: 1px solid rgba(153, 153, 153, 0.2);
    }
}
</style>

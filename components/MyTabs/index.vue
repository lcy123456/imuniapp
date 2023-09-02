<template>
    <view
        :class="['ul flex align-center bg-grey', type === 'square' ? 'line_tab' : 'btn_tab']"
        :style="{
            height: height + 'rpx', 
            'borderRadius': Math.ceil(height / 2) + 'rpx'
        }"
    >
        <view
            v-for="(v, i) in list"
            :key="i"
            :class="['item', active === v.value && 'active']"
            :style="{
                'borderRadius': Math.ceil(height / 2) + 'rpx',
            }"
            @click="change(v)"
        >
            {{ v.label }}
        </view>
    </view>
</template>

<script>
export default {
    name: 'MyTabs',

    props: {
        value: {
            type: [Number, String],
            default: ''
        },
        list: {
            type: Array,
            default: () => ([])
        },
        height: {
            type: Number,
            default: 64
        },
        type: {
            type: String,
            default: ''
        },
    },

    data () {
        return {
            active: ''
        };
    },

    mounted () {
        this.active = this.value || this.list[0].value;
    },

    methods: {
        change (v) {
            this.$emit('change', v);
            this.$emit('input', v.value);
            this.active = v.value;
        }
    },
};
</script>

<style lang="scss" scoped>
.ul {
    padding: 5rpx 0;
    .item {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: $uni-text-color-grey;
        font-family: MiSans-Demibold;

        &.active {
            color: $uni-color-primary;
        }
    }
    &.btn_tab {
        .item {
            flex: 1;

            &.active {
                background-color: $uni-bg-color;
            }
        }
    }
    &.line_tab {
        border-radius: 0 !important;
        .item {
            border-radius: 0 !important;
            flex: none;
            background-color: inherit;
            border-bottom: 4rpx solid $u-primary;
        }
    }
}
</style>
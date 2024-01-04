<template>
    <u-avatar
        :src="getAvatarUrl"
        :text="getAvatarUrl ? undefined : avatarText"
        :default-url="getDdefaultUrl"
        :font-size="fontSize"
        :shape="shape"
        :size="size"
        mode="aspectFill"
        :style="{ background: bgColor }"
        @longpress="longpress"
        @click="click"
        @onError="errorHandle"
    />
</template>

<script>
import defaultAvatars from '@/common/defaultAvatars.js';
import defaultNotifyIcon from '@/static/images/default_notify_icon.png';
import { getFirstCharacter, colors, adjustColor } from '@/util/common';
const defaultGroupIcon = '/static/images/contact_my_group.svg';
export default {
    name: 'MyAvatar',
    props: {
        src: {
            type: String,
            default: ''
        },
        shape: {
            type: String,
            default: 'square'
        },
        fontSize: {
            type: Number,
            default: 18
        },
        size: {
            type: String,
            default: '40'
        },
        isGroup: {
            type: Boolean,
            default: false
        },
        isNotify: {
            type: Boolean,
            default: false
        },
        desc: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            avatarText: undefined,
            bgColor: ''
        };
    },
    computed: {
        getAvatarUrl() {
            if (this.isNotify) {
                return defaultNotifyIcon;
            }
            if (this.src) {
                return defaultAvatars[this.src] ?? this.src;
            }
            if (this.isGroup) {
                return defaultGroupIcon;
            }
            return '';
        },
        getDdefaultUrl() {
            return this.isGroup ? defaultGroupIcon : undefined;
        }
    },
    watch: {
        desc() {
            this.errorHandle();
        }
    },
    methods: {
        errorHandle() {
            this.avatarText = this.desc
                ? this.desc.slice(this.desc.length > 1 ? -2 : -1)
                : '未知';
            const hexColor = colors[getFirstCharacter(this.avatarText)];
            const rgbaColor = adjustColor(hexColor, 30);
            this.bgColor = `radial-gradient(${hexColor}, ${rgbaColor})`;
        },
        click() {
            this.$emit('click');
        },
        longpress() {
            this.$emit('longpress');
        }
    }
};
</script>

<style scoped></style>

<template>
    <view>
        <view
            id="scroll-view"
            class="u-scroll-view"
            @touchstart="dragStart"
            @touchend="dragEnd"
            @touchmove="drag"
        >
            <view
                id="scroll-content"
                class="content"
                :style="style"
                @transitionend="transitionend"
            >
                <slot></slot>
            </view>
        </view>
    </view>
</template>
<script>
import { getEl } from '@/util/common';
export default {
    name: 'UScroll',
    props: {
        isMultipleMsg: {
            type: Boolean,
            default: false
        },
        checkedMsgIds: {
            type: Array,
            default: () => []
        },
        clientMsgID: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            dragging: false,
            isAdd: false,
            height: 0,
            mouseX: 0,
            mouseY: 0,
            initialX: 0,
            initialY: 0,
            offsetX: 0,
            offsetY: 0,
            style: {
                bottom: 0,
                transition: ''
            }
        };
    },
    methods: {
        dragStart(e) {
            e.preventDefault();
            this.dragging = true;
            this.initialY = this.style.bottom ? parseInt(this.style.bottom) : 0;
            this.mouseY = e.clientY || e.touches[0].clientY;
            this.startTime = +new Date();
        },
        async drag(e) {
            // console.log('drag---drag------------drag', this.dragging);
            if (this.dragging) {
                e.preventDefault();
                const mouseY = e.clientY || e.touches[0].clientY;
                this.offsetY = mouseY - this.mouseY;
                const res = await getEl.call(this, '#scroll-content');
                const bottom = `${this.initialY - this.offsetY}px`;
                this.changeBottm =
                    parseFloat(this.style.bottom) - parseFloat(bottom);
                if (this.height !== res.height && this.height) {
                    this.isAdd = bottom;
                }
                this.height = res.height;
                if (bottom === this.isAdd) return;
                console.log('res.top---res.top---res.top', res.top);
                if (res.top >= 100 && this.offsetY > 0) {
                    console.log(
                        'scrolltoupper---scrolltoupper---scrolltoupper'
                    );
                    this.$emit('scrolltoupper');
                } else {
                    this.style.transition = 'all 0.4s ease';
                    this.style.bottom = bottom;
                }
            }
        },
        async dragEnd() {
            if (this.dragging) {
                const changeNum = this.changeBottm * 20;
                const contentEl = await getEl.call(this, '#scroll-content');
                const scrollEl = await getEl.call(this, '#scroll-view');
                const maxBottom = contentEl.height - scrollEl.height;
                const isMax =
                    Math.abs(parseFloat(this.style.bottom) - changeNum) >
                    maxBottom;
                this.dragging = false;
                this.endTime = +new Date();
                this.style.transition = 'all 0.7s ease';
                this.style.bottom =
                    (isMax
                        ? -maxBottom
                        : parseFloat(this.style.bottom) - changeNum) + 'px';
                console.log(
                    'this.style.bottom----this.style.bottom',
                    changeNum
                );
            }
        },
        async transitionend() {
            const contentEl = await getEl.call(this, '#scroll-content');
            console.log('transitionend---transitionend', contentEl.top);
            if (contentEl.top >= 0) {
                this.$emit('scrolltoupper');
            }
        }
    }
};
</script>
<style lang="scss" scoped>
.u-scroll-view {
    flex: 1;
    overflow: hidden;
    position: relative;
    height: 100%;
    .content {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        top: auto;
        border: 1px solid blue;
    }
}
</style>

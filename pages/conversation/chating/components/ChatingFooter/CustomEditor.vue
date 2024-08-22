<!-- eslint-disable vue/attribute-hyphenation -->
<template>
    <view
        :insertImageFlag="insertImageFlag"
        :change:insertImageFlag="input.insertImageFlagUpdate"
        class="editor_wrap"
    >
        <editor
            id="editor2"
            :placeholder="placeholder"
            @ready="editorReady"
            @click="editorFocus"
            @blur="editorBlur"
            @input="editorInput"
            @focus="touchstart"
        />
        <view class="canvas_container">
            <text :class="'canvas_container_name'">
                {{ canvasData.title }}
            </text>
            <canvas
                v-if="canvasData.show"
                id="atCanvas"
                :canvas-id="'atCanvas'"
                :style="{ width: canvasData.width }"
                class="atCanvas"
            />
        </view>
    </view>
</template>

<script>
import { AllType } from '@/enum';
import { mapGetters } from 'vuex';
import { html2Text, draftText2Text } from '@/util/common';
import IMSDK, { IMMethods } from 'openim-uniapp-polyfill';

const editorEmptyValue = '<p><br></p>';

export default {
    props: {
        placeholder: {
            type: String,
            default: 'Say what you think…'
        }
    },
    data() {
        return {
            inputHtml: '',
            editorCtx: null,
            canvasData: {
                width: 0,
                title: '',
                show: false
            },
            imageData: {},
            insertImageFlag: null,
            conversationID: ''
        };
    },
    computed: {
        ...mapGetters(['storeCurrentConversationID', 'storeDraftText'])
    },
    created() {
        this.conversationID = this.storeCurrentConversationID;
        uni.$on('setAtMember', this.setAtMember);
        uni.$on('createCanvasData', this.createCanvasData);
    },
    beforeDestroy() {
        uni.$off('setAtMember', this.setAtMember);
        uni.$off('createCanvasData', this.createCanvasData);
        this.setDraftTextItem();
    },
    methods: {
        editorReady() {
            uni.createSelectorQuery()
                .select('#editor2')
                .context(res => {
                    this.editorCtx = res.context;
                    if (html2Text(draftText2Text(this.storeDraftText))) {
                        this.storeDraftText &&
                            this.insertHtml(this.storeDraftText);
                        this.inputHtml = this.storeDraftText;
                    }
                    this.$emit('ready', res, this.inputHtml);
                })
                .exec();
        },
        getAt() {
            const list = [];
            const customList = this.inputHtml.match(/data-custom="([^"]*)"/g);
            customList &&
                customList.forEach(item => {
                    const sendID =
                        item.match(/sendID=([^&]*)/) &&
                        item.match(/sendID=([^&]*)/)[1];
                    const senderNickname =
                        item.match(/senderNickname=([^"]*)/) &&
                        item.match(/senderNickname=([^"]*)/)[1];
                    if (!sendID) return;
                    if (sendID.includes(',')) {
                        // 所有人
                        // const sendIDList = sendID.split(',');
                        // const groupNicknameList = senderNickname.split(',');
                        // sendIDList.forEach((item, index) => {
                        //     list.push({
                        //         atUserID: item,
                        //         groupNickname: groupNicknameList[index]
                        //     });
                        // });
                        list.push({
                            atUserID: AllType.Code,
                            groupNickname: AllType.Text
                        });
                        return;
                    }
                    list.push({
                        atUserID: sendID,
                        groupNickname: senderNickname
                    });
                });
            return list;
        },
        setAtMember(source, status) {
            const type = Object.prototype.toString
                .call(source)
                .match(/ ([^\]]*)/)[1]
                .toLocaleLowerCase();
            if (type === 'array' && !status) {
                if (source.length === 0) return;
                this.editorCtx.undo();
                this.createCanvasData(
                    source[0].atUserID,
                    source[0].groupNickname,
                    source
                );
                return;
            } else if (status === 'all') {
                // 所有人
                this.editorCtx.undo();
                this.createCanvasData(
                    source.map(v => v.atUserID).join(','),
                    source.map(v => v.groupNickname).join(','),
                    null,
                    'all'
                );
                return;
            }
            const map = this.getAt().find(
                item => item.atUserID === source.atUserID
            );
            if (!map) {
                this.createCanvasData(source.atUserID, source.groupNickname);
            }
        },
        insertHtml(html) {
            this.editorCtx.setContents({
                html
            });
        },
        insertImage(imageData) {
            this.imageData = imageData;
            this.insertImageFlag = true;
        },
        internalInsertImage() {
            this.editorCtx.insertImage({
                ...this.imageData,
                complete: () => {
                    this.insertImageFlag = false;
                    // this.setDraftTextItem();
                }
            });
        },
        setDraftTextItem() {
            IMSDK.asyncApi(IMMethods.SetConversationDraft, IMSDK.uuid(), {
                conversationID: this.conversationID,
                draftText:
                    this.inputHtml === editorEmptyValue ? '' : this.inputHtml
            });
        },
        async createCanvasData(
            sendID,
            senderNickname,
            source,
            type,
            filePathMap
        ) {
            const canvas = this.canvasData;
            canvas.title = !type
                ? '@' + senderNickname
                : `@${this.$t('[Everyone]').slice(1, -1)}`;
            await this.$nextTick();
            setTimeout(() => {
                const query = uni.createSelectorQuery().in(this);
                query
                    .select('.canvas_container_name')
                    .boundingClientRect(style => {
                        let width = parseInt(style.width) + 4 + 8;
                        canvas.width = width + 'px';
                        canvas.show = true;
                        setTimeout(() => {
                            const ctx = uni.createCanvasContext('atCanvas');
                            const fontSize = 16;
                            ctx.setFontSize(fontSize);
                            ctx.setFillStyle('#008dff');
                            let text = canvas.title;
                            if (width >= 300) {
                                const measuredWidth = ctx.measureText(text);
                                const scale = width / measuredWidth;
                                ctx.scale(scale, 1);
                                text = this.transformContent(
                                    ctx,
                                    canvas.title,
                                    width / scale
                                )[0];
                            }
                            ctx.fillText(text, 0, 16);
                            ctx.draw();
                            this.canvasToTempFilePath(
                                sendID,
                                senderNickname,
                                source,
                                filePathMap
                            );
                        }, 50);
                    })
                    .exec();
            }, 100);
        },
        canvasToTempFilePath(sendID, senderNickname, source, filePathMap) {
            const canvas = this.canvasData;
            uni.canvasToTempFilePath({
                canvasId: 'atCanvas',
                success: res => {
                    const m = {
                        src: res.tempFilePath,
                        width: canvas.width,
                        height: '20px',
                        data: {
                            sendID,
                            senderNickname
                        },
                        extClass: 'at_el'
                    };
                    if (filePathMap) {
                        if (!filePathMap.list) {
                            filePathMap.list = [];
                        }
                        filePathMap.list.push(m);
                        if (source && source.length > 1) {
                            source = source.slice(1, source.length);
                            this.createCanvasData(
                                source[0].atUserID,
                                source[0].groupNickname,
                                source,
                                null,
                                filePathMap
                            );
                        } else {
                            typeof filePathMap.callback === 'function' &&
                                filePathMap.callback.call(null, [
                                    ...filePathMap.list
                                ]);
                            filePathMap = null;
                        }
                        return;
                    }
                    this.editorCtx.insertImage({
                        ...m,
                        complete: () => {
                            if (source && source.length > 1) {
                                source = source.slice(1, source.length);
                                this.createCanvasData(
                                    source[0].atUserID,
                                    source[0].groupNickname,
                                    source
                                );
                            }
                        }
                    });
                },
                fail: () => {
                    // console.log('失败失败失败失败失败失败失败失败失败失败');
                }
            });
        },
        transformContent(ctx, text, contentWidth, lineNumber = 1) {
            let textArray = text.split('');
            let textStr = '';
            let row = [];
            const length = textArray.length;
            let index = 0;
            for (let i = 0; i < length; i++) {
                const t = textArray[i];
                index = i;
                const width = ctx.measureText(textStr + t).width + i * 0.2;
                if (width < contentWidth) {
                    textStr += t;
                    if (i === length - 1) {
                        row.push(textStr);
                        textStr = '';
                    }
                } else {
                    row.push(textStr);
                    textStr = t;
                    if (row.length >= lineNumber) {
                        break;
                    }
                }
            }
            if (index < length) {
                //文字未显示完
                const lastIndex = row.length - 1;
                const str = row[lastIndex];
                const strLength = str.length;
                const str2 = '...';
                for (let j = strLength - 1; j > 0; j--) {
                    let s = str.slice(0, j);
                    const str1 = s + str2;
                    const width = ctx.measureText(str1).width + j * 0.2;
                    if (width < contentWidth) {
                        row.splice(lastIndex, 1, str1);
                        break;
                    }
                }
            }
            return row;
        },

        editorFocus() {
            this.$emit('focus');
        },
        editorBlur() {
            this.$emit('blur');
            uni.$emit('inputBlur');
        },
        inputFocus() {
            this.$emit('focus');
            uni.$emit('inputFocus');
        },
        touchstart() {
            uni.$emit('inputFocus');
        },
        editorInput(e) {
            this.inputHtml = e.detail.html;
            this.$emit('input', e);
        }
    }
};
</script>

<script module="input" lang="renderjs">
export default {
	methods: {
		insertImageFlagUpdate(newValue, oldValue, ownerVm, vm) {
			if (newValue === null) {
				return;
			}
               const dom = this.$el.querySelector('.ql-editor');
			if (newValue) {
				dom.setAttribute('inputmode', 'none')
				ownerVm.callMethod('internalInsertImage')
			} else {
                   dom.blur();
				dom.removeAttribute('inputmode')
			}
		},
	},
}
</script>

<style lang="scss" scoped>
.editor_wrap {
    // position: relative;
    background-color: $uni-bg-color-grey;
}

/deep/.ql-container {
    width: 100%;
    min-height: 52rpx;
    height: auto;
    padding: 20rpx 30rpx;

    .ql-editor {
        max-height: 240rpx;
        line-height: 52rpx;
        &.ql-blank:before {
            font-style: normal;
            color: $uni-text-color-placeholder;
        }
        img {
            vertical-align: sub !important;
        }
    }
}

.canvas_container {
    position: fixed;
    bottom: -99px;
    z-index: -100;

    &_name {
        max-width: 480rpx;
        display: inline-block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .atCanvas {
        height: 20px;
    }
}
</style>

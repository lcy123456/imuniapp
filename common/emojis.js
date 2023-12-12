const face_2 = require('@/static/emojis/face_2.png');
const face_3 = require('@/static/emojis/face_3.png');
const face_4 = require('@/static/emojis/face_4.png');
const face_5 = require('@/static/emojis/face_5.png');
const face_6 = require('@/static/emojis/face_6.png');
const face_7 = require('@/static/emojis/face_7.png');
const face_8 = require('@/static/emojis/face_8.png');
const face_9 = require('@/static/emojis/face_9.png');
const face_10 = require('@/static/emojis/face_10.png');
const face_11 = require('@/static/emojis/face_11.png');
const face_12 = require('@/static/emojis/face_12.png');
const face_13 = require('@/static/emojis/face_13.png');
const face_14 = require('@/static/emojis/face_14.png');
const face_15 = require('@/static/emojis/face_15.png');
const face_16 = require('@/static/emojis/face_16.png');
export const emojis = [
    {
        context: '[微笑]',
        reg: new RegExp(/\[微笑\]/g),
        src: face_2,
    },
    {
        context: '[哭泣]',
        reg: new RegExp(/\[哭泣\]/g),
        src: face_3,
    },
    {
        context: '[飞吻]',
        reg: new RegExp(/\[飞吻\]/g),
        src: face_4,
    },
    {
        context: '[疑问]',
        reg: new RegExp(/\[疑问\]/g),
        src: face_5,
    },
    {
        context: '[闭嘴]',
        reg: new RegExp(/\[闭嘴\]/g),
        src: face_6,
    },
    {
        context: '[开心]',
        reg: new RegExp(/\[开心\]/g),
        src: face_7,
    },
    {
        context: '[偷笑]',
        reg: new RegExp(/\[偷笑\]/g),
        src: face_8,
    },
    {
        context: '[发呆]',
        reg: new RegExp(/\[发呆\]/g),
        src: face_9,
    },
    {
        context: '[无语]',
        reg: new RegExp(/\[无语\]/g),
        src: face_10,
    },
    {
        context: '[难过]',
        reg: new RegExp(/\[难过\]/g),
        src: face_11,
    },
    {
        context: '[期待]',
        reg: new RegExp(/\[期待\]/g),
        src: face_12,
    },
    {
        context: '[捂脸笑]',
        reg: new RegExp(/\[捂脸笑\]/g),
        src: face_13,
    },
    {
        context: '[愤怒]',
        reg: new RegExp(/\[愤怒\]/g),
        src: face_14,
    },
    {
        context: '[斜眼看]',
        reg: new RegExp(/\[斜眼看\]/g),
        src: face_15,
    },
    {
        context: '[呲牙]',
        reg: new RegExp(/\[呲牙\]/g),
        src: face_16,
    },
];
export default emojis;

// 正则
export const phoneReg = {
    '+86': /^(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/,
    '+81': /^\d{8,11}$/,
    '+1': /^\d{8,11}$/
};
export const regMap = {
    // 必须含有数字和字母，长度为6-20位
    pwd: /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]{6,20})$/,
    // 必须含有数字和字母
    numberLetter: /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]){2,}$/,
    ...phoneReg
};
export const AudioVideoStatus = {
    Send: 1650,
    Reject: 1651,
    Cancel: 1652,
    NotAnswered: 1653,
    Busy: 1655,
    Done: 1669,
    groupStart: 1704,
    groupDone: 1703
};
export const AudioVideoType = {
    Video: 131,
    Audio: 130
};

export const AllType = {
    Code: '999999999',
    Text: '所有人'
};

export const PlatformMap = {
    1: 'iPhone',
    2: 'Android',
    3: 'Windows',
    4: 'Mac',
    5: 'Web'
};

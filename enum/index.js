// 正则
export const phoneReg = {
    '+86': /^(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/,
    '+81': /^\d{8,11}$/,
    '+1': /^\d{8,11}$/,
};
export const regMap = {
    // 必须含有数字和字母，长度为6-20位
    pwd: /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]{6,20})$/,
    // 必须含有数字和字母
    numberLetter: /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]){2,}$/,
    ...phoneReg
};

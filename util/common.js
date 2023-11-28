import PinYin from './pinyin';
import { AllType } from '@/enum';

export const html2Text = (html, type) => {
    if (!html) {
        return '';
    }
    let text = html
        .replace(/&nbsp;/g, ' ')
        .replace(/<br>/g, '\n')
        .replace(/<p>/g, '')
        .replace(/<\/p>/g, '\n')
        .trim();
    if (!type) {
        text = text.replace(/<([^>]*>)/g, '');
    }
    return text;
};

export const formatInputHtml = (html) => {
    let atUserList = [];
    let text = html2Text(html, 1);
    const imgReg = new RegExp('(i?)(<img)([^>]+>)', 'gmi');
    const customDataReg = /data-custom=".+"/;
    text = text.replace(imgReg, (img) => {
        if (img.includes('class="at_el"')) {
            const atInfoArr = img
                .match(customDataReg)[0]
                .slice(13, -1)
                .split('&amp;');
            atUserList.push({
                atUserID: atInfoArr[0].slice(7),
                groupNickname: atInfoArr[1].slice(15),
            });
            return `@${atInfoArr[0].slice(7).includes(',') ? AllType.Code : atInfoArr[0].slice(7)} `;
        }
        if (img.includes('class="emoji_el"')) {
            return img.match(customDataReg)[0].slice(23, -1);
        }
        return '';
    });
    return {
        text,
        atUserList,
    };
};

export function getEl (el) {
    return new Promise((resolve) => {
        const query = uni.createSelectorQuery().in(this);
        query.select(el).boundingClientRect((data) => {
            // 存在data，且存在宽和高，视为渲染完毕
            resolve(data);
        }).exec();
    });
}

export const getDbDir = () => {
    return new Promise((resolve, reject) => {
        plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs) => {
            fs.root.getDirectory(
                'user',
                {
                    create: true,
                },
                (entry) => {
                    resolve(entry.fullPath);
                },
                (error) => {
                    reject(error);
                }
            );
        });
    });
};

export const formatChooseData = (data, key = 'nickname') => {
    const ucfirst = (l1) => {
        if (l1.length > 0) {
            let first = l1.substr(0, 1).toUpperCase();
            let spare = l1.substr(1, l1.length);
            return first + spare;
        }
    };

    const arraySearch = (l1, l2) => {
        for (let name in PinYin) {
            if (PinYin[name].indexOf(l1) != -1) {
                return ucfirst(name);
            }
        }
        return false;
    };

    const codefans = (l1) => {
        l1 = l1 ?? 'unkown';
        let l2 = l1.length;
        let I1 = '';
        let reg = new RegExp('[a-zA-Z0-9- ]');
        for (let i = 0; i < l2; i++) {
            let val = l1.substr(i, 1);
            let name = arraySearch(val, PinYin);
            if (reg.test(val)) {
                I1 += val;
            } else if (name !== false) {
                I1 += name;
            }
        }
        I1 = I1.replace(/ /g, '-');
        while (I1.indexOf('--') > 0) {
            I1 = I1.replace('--', '-');
        }
        return I1;
    };

    let arr = [],
        firstName;

    for (let i = 0; i < data.length; i++) {
        firstName = data[i].initial = codefans(data[i][key]).substr(0, 1);
        arr.push(firstName.toUpperCase());
    }

    let arrlist = [];
    for (let i = 0; i < arr.length; i++) {
        if (arrlist.indexOf(arr[i]) == -1) {
            arrlist.push(arr[i]);
        }
    }

    let dataSort = [];
    for (let i = 0; i < arrlist.length; i++) {
        dataSort[i] = {
            initial: arrlist[i],
        };
        dataSort[i].data = [];
        for (let j = 0; j < data.length; j++) {
            if (data[j].initial.toUpperCase() == dataSort[i].initial) {
                dataSort[i].data.push(data[j]);
            }
        }
    }
    for (let i = 0; i < dataSort.length - 1; i++) {
        for (let j = 1; j < dataSort.length - i; j++) {
            if (dataSort[j - 1].initial > dataSort[j].initial) {
                let a = dataSort[j];
                dataSort[j] = dataSort[j - 1];
                dataSort[j - 1] = a;
            }
        }
    }
    const NomalInitial = 'QWERTYUIOPLKJHGFDSAZXCVBNM'.split('');
    const special = {
        initial: '#',
        data: [],
    };
    const newFilterData = dataSort.filter((d) => {
        if (!NomalInitial.includes(d.initial)) {
            special.data = [...special.data, ...d.data];
        } else {
            return d;
        }
    });
    if (special.data.length > 0) {
        newFilterData.push(special);
    }
    const indexList = newFilterData.map((item) => item.initial);
    const dataList = newFilterData.map((item) => item.data);
    return {
        indexList,
        dataList,
    };
};

export const getPurePath = (path) => {
    const prefix = 'file://';
    const relativeRrefix = '_doc/';
    if (path.includes(prefix)) {
        path = path.replace(prefix, '');
    }
    if (path.includes(relativeRrefix)) {
        path = plus.io.convertLocalFileSystemURL(path);
    }
    return path;
};

export const filterEmptyValue = (obj) => {
    for (let key in obj) {
        if (obj[key] === '') {
            delete obj[key];
        }
    }
};

export const toastWithCallback = (message, callBack, duration = 1000) => {
    uni.$u.toast(message);
    setTimeout(callBack, duration);
};

export const checkLoginError = (error) => {
    if (!error?.errCode) {
        return '网络异常，请稍后重试';
    }
    switch (error.errCode) {
    case 1001:
        return '输入信息有误';
    case 10001:
        return '密码错误';
    case 10002:
        return '用户不存在';
    case 10003:
        return '账号已注册';
    case 10004:
        return '账号已注册';
    case 10005:
        return '验证码的发送频率太快了！';
    case 10006:
        return '验证码错误';
    case 10007:
        return '验证码已过期';
    case 10008:
        return '验证码失败次数过多';
    case 10009:
        return '验证码已被使用';
    case 10010:
        return '邀请码已被使用';
    case 10011:
        return '邀请码不存在';
    case 10013:
        return '拒绝添加好友';
    default:
        return '网络异常，请稍后重试';
    }
};

export const lightTextStr = (str, key) => {
    return str.replace(new RegExp(key, 'gi'), (text) => {
        return `<text class="primary">${text}</text>`;
    }, 'g');
};
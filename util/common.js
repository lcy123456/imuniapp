import PinYin from './pinyin';
import { AllType } from '@/enum';
import { pinyin } from 'pinyin-pro';

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

export const draftText2Text = draftText => {
    if (!draftText) return '';
    const list = draftText.match(/<img([^>]*)>/g);
    list &&
        list.forEach(img => {
            if (img.includes(`emojiText`)) {
                const text = img.match(/emojiText=([^"]*)/)[1];
                draftText = draftText.replace(img, text);
            }
            if (img.includes(`senderNickname`)) {
                const text = img.match(/senderNickname=([^"]*)/)[1];
                draftText = draftText.replace(img, '@' + text + ' ');
            }
        });
    return draftText;
};

export const formatInputHtml = html => {
    let atUserList = [];
    let text = html2Text(html, 1);
    const imgReg = new RegExp('(i?)(<img)([^>]+>)', 'gmi');
    const customDataReg = /data-custom=".+"/;
    text = text.replace(imgReg, img => {
        if (img.includes('class="at_el"')) {
            const atInfoArr = img
                .match(customDataReg)[0]
                .slice(13, -1)
                .split('&amp;');
            atUserList.push({
                atUserID: atInfoArr[0].slice(7),
                groupNickname: atInfoArr[1].slice(15)
            });
            return `@${
                atInfoArr[0].slice(7).includes(',')
                    ? AllType.Code
                    : atInfoArr[0].slice(7)
            } `;
        }
        if (img.includes('class="emoji_el"')) {
            return img.match(/emojiText=([^"]*)/)
                ? img.match(/emojiText=([^"]*)/)[1]
                : '';
            // return img.match(customDataReg)[0].slice(23, -1);
        }
        return '';
    });
    return {
        text,
        atUserList
    };
};

export function getEl(el) {
    return new Promise(resolve => {
        const query = uni.createSelectorQuery().in(this);
        query
            .select(el)
            .boundingClientRect(data => {
                // 存在data，且存在宽和高，视为渲染完毕
                resolve(data);
            })
            .exec();
    });
}

export const getDbDir = () => {
    return new Promise((resolve, reject) => {
        plus.io.requestFileSystem(plus.io.PRIVATE_DOC, fs => {
            fs.root.getDirectory(
                'user',
                {
                    create: true
                },
                entry => {
                    resolve(entry.fullPath);
                },
                error => {
                    reject(error);
                }
            );
        });
    });
};

export function isNeedRestart(el) {
    return new Promise(() => {
        const query = uni.createSelectorQuery().in(this);
        let isRecovery = true;
        query
            .select(el)
            .boundingClientRect(() => {
                isRecovery = false;
            })
            .exec();

        setTimeout(() => {
            if (isRecovery) {
                plus.runtime.restart();
            }
        }, 800);
    });
}

export const formatChooseData = (data, key = 'nickname') => {
    const ucfirst = l1 => {
        if (l1.length > 0) {
            let first = l1.substr(0, 1).toUpperCase();
            let spare = l1.substr(1, l1.length);
            return first + spare;
        }
    };

    const arraySearch = l1 => {
        for (let name in PinYin) {
            if (PinYin[name].indexOf(l1) != -1) {
                return ucfirst(name);
            }
        }
        return false;
    };

    const codefans = l1 => {
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
            initial: arrlist[i]
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
        data: []
    };
    const newFilterData = dataSort.filter(d => {
        if (!NomalInitial.includes(d.initial)) {
            special.data = [...special.data, ...d.data];
        } else {
            return d;
        }
    });
    if (special.data.length > 0) {
        newFilterData.push(special);
    }
    const indexList = newFilterData.map(item => item.initial);
    const dataList = newFilterData.map(item => item.data);
    return {
        indexList,
        dataList
    };
};

export const getPurePath = path => {
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

export const filterEmptyValue = obj => {
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

export const checkLoginError = error => {
    if (!error?.errCode) {
        return '网络异常，请稍后重试';
    }
    switch (error.errCode) {
        case 1001:
            return '输入信息有误';
        case 1004:
            return '邮箱不存在';
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
    return str.replace(
        new RegExp(key, 'gi'),
        text => {
            return `<text class="primary">${text}</text>`;
        },
        'g'
    );
};
export const colors = {
    A: '#3498db', // 水宝蓝
    B: '#2ecc71', // 翡翠绿
    C: '#e74c3c', // 大红
    D: '#f39c12', // 橙黄
    E: '#1abc9c', // 蓝绿
    F: '#9b59b6', // 紫色
    G: '#27ae60', // 薄荷绿
    H: '#e67e22', // 砖橙
    I: '#34495e', // 暗灰蓝
    J: '#d35400', // 南瓜橙
    K: '#3498db', // 亮蓝
    L: '#2ecc71', // 新翠
    N: '#e74c3c', // 火焰红
    M: '#f39c12', // 高光橙
    O: '#1abc9c', // 海绿
    P: '#9b59b6', // 翠紫
    Q: '#27ae60', // 草绿
    R: '#e67e22', // 橙黄
    S: '#34495e', // 黑蓝
    T: '#d35400', // 橙红
    U: '#3498db', // 蔚蓝
    V: '#2ecc71', // 苍翠
    W: '#e74c3c', // 绛红
    X: '#f39c12', // 金黄
    Y: '#1abc9c', // 蓝绿
    Z: '#9b59b6' // 紫色
};
export const adjustColor = (hex, adjustment, alpha = 1) => {
    hex = hex?.replace(/^#/, '');

    const bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;

    r = Math.max(0, Math.min(255, r + adjustment));
    g = Math.max(0, Math.min(255, g + adjustment));
    b = Math.max(0, Math.min(255, b + adjustment));

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
export const getFirstCharacter = str => {
    const trimmedStr = str.trim();
    if (trimmedStr.length === 0) {
        return 'A';
    } else {
        const firstStr = trimmedStr.charAt(0);
        if (/^[0-9]/.test(firstStr)) {
            return String.fromCharCode('A'.charCodeAt(0) + Number(firstStr));
        }

        if (/^[\u4e00-\u9fa5]/.test(firstStr)) {
            const pinyinArray = pinyin(firstStr, {
                pattern: 'first',
                toneType: 'none',
                type: 'array'
            });
            return pinyinArray[0].toUpperCase();
        }

        return firstStr.toUpperCase();
    }
};

export const getNewText = (newStr, oldStr) => {
    let text = '';
    let type = newStr.length > oldStr.length ? 'add' : 'remove';
    let l1 = (type === 'add' ? newStr : oldStr)
        .split('')
        .filter(item => item !== '\n');
    let l2 = (type === 'add' ? oldStr : newStr)
        .split('')
        .filter(item => item !== '\n');
    let isN = false;
    if (l2.length > l1.length) {
        // 判断\n 的情况
        isN = true;
        let l = [...l2];
        l2 = [...l1];
        l1 = [...l];
    }
    l1.forEach((item, i) => {
        if (text) return;
        if (item !== l2[i]) {
            text = item;
        }
    });
    return {
        type: isN ? 'add' : type,
        text
    };
};

export const getPageRoute = () => {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const page = currentPage.route;
    return page;
};

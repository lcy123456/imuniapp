import store from '@/store';
import CryptoJS from 'crypto-js';
import { CryptoKey } from '@/constant';

export const getParams = () => {
    const cryptoPadding = store.getters.storeCryptoPadding;
    // 前后端约定的加密规则
    const sKey = CryptoJS.enc.Utf8.parse(CryptoKey);
    const iv = CryptoJS.enc.Utf8.parse(cryptoPadding);

    return {
        sKey,
        iv
    };
};

export const EncryptoAES = (text) => {
    // const { sKey, iv } = getParams();

    // let encrypted = CryptoJS.AES.encrypt(text, sKey, {
    //     iv,
    //     mode: CryptoJS.mode.CBC,
    //     padding: CryptoJS.pad.Pkcs7
    // });

    // return encrypted.toString();
    return text;
};

export const DecryptoAES = (text) => {
    // const { sKey, iv } = getParams();

    // const decrypted = CryptoJS.AES.decrypt(text, sKey, {
    //     iv: iv,
    //     mode: CryptoJS.mode.CBC,
    //     padding: CryptoJS.pad.Pkcs7,
    // });
  
    // return decrypted.toString(CryptoJS.enc.Utf8);
    return text;
};

// const res = EncryptoAES("123456");
// console.log('EncryptoAES', res);
// console.log('DecryptoAES', DecryptoAES(res));
const fs = require('fs');
const path = require('path');

// 语言库 JSON 文件路径
const languageJsonPath = '../locale/zh.json';
// 项目文件夹路径
const projectPath = './imCommon.js';

// 读取语言库 JSON 文件
const languageJson = JSON.parse(fs.readFileSync(languageJsonPath, 'utf8'));

// 正则表达式匹配中文字符
const templateTextRegex = />([^<>\u4e00-\u9fa5]*[\u4e00-\u9fa5]+[^<>]*)</g; // 匹配标签内的纯中文文本
const templateAttrRegex = /(\b\w+=")([\u4e00-\u9fa5]+)(")/g; // 匹配属性值中的中文
const chineseRegex = /['"][^'"]*[\u4e00-\u9fa5]+['"]/g;

// 遍历项目文件夹中的所有文件
function traverseDirectory(directory) {
    fs.readdirSync(directory).forEach(file => {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            traverseDirectory(filePath); // 递归遍历子文件夹
        } else if (path.extname(file) === '.vue') {
            replaceChineseText(filePath); // 处理 Vue 文件
        }
    });
}

// 替换文件中的中文文本为 i18n 函数
function replaceChineseText(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 分别提取 <template> 和 <script> 部分
    const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/);
    const scriptMatch = content.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/);

    if (templateMatch) {
        let templateContent = templateMatch[1];

        // 替换标签内的纯中文文本
        templateContent = templateContent.replace(
            templateTextRegex,
            (match, p1) => {
                const key = Object.keys(languageJson).find(
                    key => languageJson[key] === p1.trim()
                );
                if (key) {
                    return `>{{ $t('${key}') }}<`;
                }
                return match;
            }
        );

        // 替换标签属性中的中文文本
        templateContent = templateContent.replace(
            templateAttrRegex,
            (match, p1, p2, p3) => {
                const key = Object.keys(languageJson).find(
                    key => languageJson[key] === p2.trim()
                );
                if (key) {
                    return `:${p1}$t('${key}')${p3}`;
                }
                return match;
            }
        );

        content = content.replace(templateMatch[1], templateContent);
    }

    if (scriptMatch) {
        let scriptContent = scriptMatch[1];
        scriptContent = scriptContent.replace(chineseRegex, match => {
            const _match = match.match(/['"](.*)['"]/)[1];
            const key = Object.keys(languageJson).find(
                key => languageJson[key] === _match
            );
            if (key) {
                return `this.$t('${key}')`; // 替换为 i18n 函数
            } else {
                console.log('未匹配到JSON: ', _match, filePath);
            }
            return match; // 没有匹配到就不替换
        });
        content = content.replace(scriptMatch[1], scriptContent);
    }

    fs.writeFileSync(filePath, content, 'utf8');
}

// 替换文件中的中文文本为 i18n 函数
function replaceJSFileChineseText(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    content = content.replace(chineseRegex, match => {
        console.log('🚀 ~ replaceJSFileChineseText ~ match:', match);
        const _match = match.match(/['"](.*)['"]/)[1];
        const key = Object.keys(languageJson).find(
            key => languageJson[key] === _match
        );
        if (key) {
            return `i18n.t('${key}')`; // 替换为 i18n 函数
        } else {
            console.log('未匹配到JSON: ', _match, filePath);
        }
        return match; // 没有匹配到就不替换
    });

    // fs.writeFileSync(filePath, content, 'utf8');
}

// 开始处理项目文件
// replaceChineseText(projectPath);
// 处理js文件
replaceJSFileChineseText(projectPath);
/* 
语音时长不小于2s
通话正在进行中...
`[对方已拒绝]`
${'Edited '}
已选中{{ checkedMsgIds.length }}条
:content="`确定删除分组 ${operationFolder.name} 吗？`"
<text
    >已在{{
        PlatformMap[platformID] || '客户'
    }}端登录，手机通知已关闭</text
>
<SettingItem
    class="flex-grow"
    title="查找用户/聊天记录"
    show-arrow
    @click="handleRecord"
/>
'确定要退出当前群聊吗？';
*/

// 格式化配置 https://prettier.io/docs/en/options.html
module.exports = {
    printWidth: 80, // 书写宽度
    tabWidth: 4, // tab占位
    useTabs: false, // 空格
    semi: true, // 行尾分号
    singleQuote: true, // 字符串单引号
    'space-before-function-paren': 'off', // 无效 函数括号前前添加空格
    vueIndentScriptAndStyle: false, // !<script> and <style> 缩进问题
    bracketSameLine: false, // 末尾元素的 > 收尾符号不换行
    arrowParens: 'avoid', // 单个参数的箭头函数是否需要括号
    htmlWhitespaceSensitivity: 'strict', // 指定 HTML 的全局空格敏感性
    endOfLine: 'auto', // 行尾换行
    trailingComma: 'none',
    overrides: [
        {
            files: '*.nvue',
            options: {
                parser: 'vue'
            }
        }
    ]
};

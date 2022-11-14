# 配置文件生成器

> 一个简单的配置文件生成器。
>
> <https://configer.hclonely.com/>

[Document](/README.md) | [简体中文](/README_CN.md)

## 配置文件模板说明

**配置文件模板仅支持`yaml`格式！**

### 基础属性

> 配置文件基础属性为**数组**格式！

| 属性 | 值类型 | 是否必需 | 描述 |
| --- | --- | --- | --- |
| name | string | 是 | 配置文件名称 |
| type | 'json'/'yml'/'ini' | 是 | 生成的配置文件格式 |
| filename | string | 是 | 生成的配置文件文件名。`copy`为直接弹出配置结果，不保存文件 |
| quote | string | 否 | 对你的配置文件进行描述 |
| author | string | 否 | 你的名字 |
| body | object | 是 | 详细配置项 |
| body[key] | string | 是 | 配置项变量名，**不要用特殊字符** |
| body[value] | object | 是 | 配置项内容，具体说明请参考[配置项内容说明](#配置项内容说明) |

### 配置项内容说明

| 属性 | 值类型 | 是否必需 | 描述 |
| --- | --- | --- | --- |
| name | string | 是 | 显示名称 |
| desp | string | 否 | 对此选项的描述 |
| type | 'text'/'boolean'/'single-select'/'multi-select'/'array'/'object' | 是 | 配置项类型 |
| inputType | 'text'/'textarea'/'number'/'email'/'password'... | 否 | 输入内容格式，默认为`'text'` |
| placeholder | string | 否 | 输入框背景文字，`type='text'`时生效 |
| required | string | 否 | 是否必须，`type='text'`时生效 |
| validation | string | 否 | 检测用户输入内容是否匹配正则表达式，`type='text'`时生效 |
| defaultValue | string/array | 否 | 默认值 |
| body | array/object | 否 | `type='array'`/`type='object'`时必需，格式同基础属性的`body` |
| repeat | boolean/number | 否 | 此配置的上一级`type='array'`时生效，`repeat=true`：允许用户自行添加此选项，`repeat={number}`：重复生成此选项`number`次 |
| options | array | 否 | `type='single-select'`/`type='multi-select'`时必需，选项内容 |
| optionsName | array | 否 | options对应显示名称 |
| bindValue | object | 否 | `type='single-select'`时可选，有`type`和`body`属性 |

### 示例

请查看[示例文件](/template.yaml.js)及相应的[渲染结果](https://configer.hclonely.com/?fileLink=https%3A%2F%2Fraw.githubusercontent.com%2FHCLonely%2Fconfig-generator%2Fmain%2Ftemplate.yaml.js)。

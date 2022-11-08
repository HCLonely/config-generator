# Config Generator

> A simple configuration file generator.
>
> <https://configer.hclonely.com/>

## Config template

**The config template only supports `yaml` format!**

### Root Options

> The root options of config template file is **array** format!

| Key | Type | Required | Description |
| --- | --- | --- | --- |
| name | string | Y | The name of the config file. |
| type | 'json'/'yml'/'ini' | Y | The format of the generated config file. |
| filename | string | Y | The name of the generated config file. `copy`: Pop up the config result and do not save the file. |
| quote | string | N | Describe your config file |
| author | string | N | Your name |
| body | object | Y | Detailed Configuration Ite |
| body[key] | string | Y | Configuration item variable name. **Do not use special characters!** |
| body[value] | object | Y | Configuration item content. For more information, please see [configuration item description](#configuration-item-description) |

### Configuration item description

| Key | Type | Required | Description |
| --- | --- | --- | --- |
| name | string | Y | The name of the display. |
| desp | string | N | The description of this option. |
| type | 'text'/'boolean'/'single-select'/'multi-select'/'array'/'object' | Y | The type of this option. |
| inputType | 'text'/'textarea'/'number'/'email'/'password'... | N | The format of the input, default value is `'text'`. |
| placeholder | string | N | Background text for the input, effective when `type='text'`. |
| required | string | N | Is it required, effective when `type='text'`. |
| validation | string | N | Detect whether the user input matches the regular expression, effective when `type='text'`. |
| defaultValue | string/array | N | The default value. |
| body | array/object | N | Is it required when `type='array'`/`type='object'`. The format is the same as the `body` of root options. |
| repeat | boolean/number | N | This option takes effect when the previous level of `type='array'`. `repeat=true`: Allow users to add this option themselves. `repeat={number}`: Repeat generating this option `number` times. |
| options | array | N | Is it required when `type='single-select'`/`type='multi-select'`. Option content. |

### 示例

Please check the [sample file](/template.yaml.js?raw=true) and the corresponding [rendering result](https://configer.hclonely.com/?fileLink=https%3A%2F%2Fraw.githubusercontent.com%2FHCLonely%2Fconfig-generator%2Fmain%2Ftemplate.yaml.js).

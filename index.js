const template = `- name: pusher
  type: json
  filename: pusher.json
  body:
    token:
      name: Token
      desp: This is token
      required: true
      type: text
      defaultValue:
      placeholder: Input your token
      inputType: text
    id:
      name: id
      desp: This is id
      required: true
      type: text
      defaultValue: 111
      placeholder: Input your id
      inputType: number
    textarea:
      name: textarea
      desp: This is textarea
      required: true
      type: text
      defaultValue:
      placeholder: Input your token
      inputType: textarea
- name: test
  type: json
  filename: test.json
  body:
    token:
      name: Test
      desp: Testing
      required: true
      type: boolean
      defaultValue:
    select:
      name: Select
      desp: Testing
      required: false
      type: single-select
      defaultValue: 2
      options:
        - a
        - 2
        - 3
    select2:
      name: Select2
      desp: Testing2
      required: false
      type: multi-select
      defaultValue:
        - a
        - 2
      options:
        - a
        - 2
        - 3
        - s
`;

const templateJson = jsyaml.load(template);
console.log(templateJson);

templateJson.map((singleConfig, index) => {
  // 多配置文件处理
  $('div.container').append(`<form id="${singleConfig.name}-config" style="display:none;" data-type="${singleConfig.type || singleConfig.filename.split('.').slice(0, -1).join('.') }" data-filename="${singleConfig.filename || `${singleConfig.name}.${singleConfig.type}`}"></form>`);
  if (index === 0) {
    $('#single-config-name>button').attr('data-name', singleConfig.name);
    $('#single-config-name>button').text(singleConfig.name);
    $(`#${singleConfig.name}-config`).show();
  }
  const singleConfigList = $(`<li><a class="dropdown-item${index === 0 ? ' active' : ''}" href="#">${singleConfig.name}</a></li>`);
  singleConfigList.click(function () {
    const name = $(this).text().trim();
    $('#single-config-name>button').attr('data-name', name);
    $('#single-config-name>button').text(name);
    $('#single-config-name li>a').removeClass('active');
    $(this).children('a').addClass('active');
    // show
    $('form').hide();
    $(`#${name}-config`).show();
  });
  $('#single-config-name>ul').append(singleConfigList);

  // 配置项处理
  Object.entries(singleConfig.body).map(([name, options]) => {
    const id = `${singleConfig.name}-${name}`;
    if (options.type === 'text') {
      if (options.inputType === 'textarea') {
        $(`#${singleConfig.name}-config`).append(`<div class="mb-3">
    <label for="${id}" class="form-label">${options.name || name}</label>
    <textarea type="text" class="form-control" id="${id}" name="${name}"
    ${options.desp ? ` aria-describedby="${id}Help"` : ''}
    ${options.placeholder ? ` placeholder="${options.placeholder}"` : ''}
    ${options.required ? ' required' : ''}
    ${options.defaultValue ? ` value="${options.defaultValue}"` : ''}
    ></textarea>
    ${options.desp ? `<div id="${id}Help" class="form-text">${options.desp}</div>` : ''}
  </div>`);
        return;
      }
      $(`#${singleConfig.name}-config`).append(`<div class="mb-3">
    <label for="${id}" class="form-label">${options.name || name}</label>
    <input type="${options.inputType || 'text'}" class="form-control" id="${id}" name="${name}"
    ${options.desp ? ` aria-describedby="${id}Help"` : ''}
    ${options.placeholder ? ` placeholder="${options.placeholder}"` : ''}
    ${options.required ? ' required' : ''}
    ${options.defaultValue ? ` value="${options.defaultValue}"` : ''}
    />
    ${options.desp ? `<div id="${id}Help" class="form-text">${options.desp}</div>` : ''}
  </div>`);
      return;
    }

    if (options.type === 'boolean') {
      $(`#${singleConfig.name}-config`).append(`<div class="form-check form-switch mb-3">
  <input class="form-check-input" type="checkbox" role="switch" id="${id}" name="${name}"
    ${options.desp ? ` aria-describedby="${id}Help"` : ''}
    ${options.defaultValue ? ` checked="checked"` : ''}
    />
  <label class="form-check-label" for="${id}">${options.name || name}</label>
    ${options.desp ? `<div id="${id}Help" class="form-text">${options.desp}</div>` : ''}
</div>`);
      return;
    }

    if (options.type === 'single-select') {
      $(`#${singleConfig.name}-config`).append(`<div class="mb-3">
      <label class="form-select-label" for="${id}">${options.name || name}</label>
      <select class="form-select" id="${id}" name="${name}"
    ${options.desp ? ` aria-describedby="${id}Help"` : ''}>
      ${options.options.map((option) => `<option value="${option}" ${option === options.defaultValue ? ' selected' : ''}>${option}</option>`).join('')}
</select>
    ${options.desp ? `<div id="${id}Help" class="form-text">${options.desp}</div>` : ''}
</div>`);
      return;
    }

    if (options.type === 'multi-select') {
      $(`#${singleConfig.name}-config`).append(`<div class="mb-3">
      <label class="form-select-label" for="${id}">${options.name || name}</label>
      <select class="form-select" id="${id}" name="${name}" multiple
    ${options.desp ? ` aria-describedby="${id}Help"` : ''}>
      ${options.options.map((option) => `<option value="${option}" ${(options.defaultValue || []).includes(option) ? ' selected' : ''}>${option}</option>`).join('')}
</select>
    ${options.desp ? `<div id="${id}Help" class="form-text">${options.desp}</div>` : ''}
</div>`);
      return;
    }
  });

});

const generatorButton = $(`<button class="btn btn-primary" onclick="return false;">Generator</button>`);
generatorButton.click(function () {
  const form = $(this).parent();
  const config = {};
  form.find('[name]').map((index, element) => {
    if ($(element).attr('type') === 'checkbox') {
      config[$(element).attr('name')] = $(element).prop('checked');
      return;
    }
    if ($(element).attr('type') === 'number') {
      config[$(element).attr('name')] = parseFloat($(element).val(), 10);
      return;
    }
    config[$(element).attr('name')] = $(element).val();
  });

  if (form.attr('data-type') === 'json') {
    download(JSON.stringify('config', null, 2));
    return;
  }
  console.log(config);
  console.log(jsyaml.dump(config));
})
$('form').append(generatorButton);

function download(data, filename, type) {
  const file = new Blob([data], { type });
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(file, filename);
  } else {
    const a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}

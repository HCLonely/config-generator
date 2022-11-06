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
    array:
      name: arrayName
      desp: This is array
      required: true
      type: array
      body:
        - name: id
          desp: This is id
          required: true
          type: text
          defaultValue: 111
          placeholder: Input your id
          inputType: number
        - name: textarea
          desp: This is textarea
          required: true
          type: text
          defaultValue:
          placeholder: Input your token
          inputType: textarea
          repeat: true
        - name: object
          desp: object
          required: true
          type: object
          repeat: true
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
- name: test
  type: yaml
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
    object:
      name: object
      desp: object
      required: true
      type: object
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
`;

const templateJson = jsyaml.load(template);

templateJson.forEach((singleConfig, index) => {
  // 多配置文件处理
  $('div.container').append(`<form id="config-${singleConfig.name}" style="display:none;" data-type="${singleConfig.type || singleConfig.filename.split('.').slice(0, -1).join('.')}" data-filename="${singleConfig.filename || `${singleConfig.name}.${singleConfig.type}`}"></form>`);
  if (index === 0) {
    $('#single-config-name>button').attr('data-name', singleConfig.name);
    $('#single-config-name>button').text(singleConfig.name);
    $(`#config-${singleConfig.name}`).show();
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
    $(`#config-${name}`).show();
  });
  $('#single-config-name>ul').append(singleConfigList);

  // 配置项处理
  Object.entries(singleConfig.body).forEach(([name, options]) => {
    generateBody(singleConfig.name, name, options);
  });

});

$('button.repeat').on('click', repeatButton);
function repeatButton(event) {
  parent = $(event.target).parent().parent();
  const id = $(event.target).attr('data-id');
  const oldNameId = parent.children('div.collapse').attr('name');
  const newNameId = parent.parent().children().length;
  const replaceRule = [new RegExp(`${oldNameId}$`), newNameId];

  const copyElement = $(parent.prop('outerHTML'));
  copyElement.children().map((index, element) => {
    const id = $(element).attr('id');
    if (id) {
      $(element).attr('id', id.replace(...replaceRule));
    }
    const name = $(element).attr('name');
    if (name) {
      $(element).attr('name', newNameId);
    }
  })
  copyElement.children('p').children('a').map((index, element) => {
    const href = $(element).attr('href');
    if (href) {
      $(element).attr('href', href.replace(...replaceRule));
    }
    const ariaControls = $(element).attr('aria-controls');
    if (ariaControls) {
      $(element).attr('aria-controls', ariaControls.replace(...replaceRule));
    }
  })
  copyElement.children('p').children('button').map((index, element) => {
    const dataId = $(element).attr('data-id');
    if (dataId) {
      $(element).attr('data-id', dataId.replace(...replaceRule));
    }
    const dataName = $(element).attr('data-name');
    if (dataName) {
      $(element).attr('data-name', newNameId);
    }
  })
  copyElement.children('div.collapse').children().map((index, element) => {
    const name = $(element).children('[name]').attr('name');
    const childrenReplaceRule = [new RegExp(`${oldNameId}-${name}$`), `${newNameId}-${name}`];
    $(element).children().map((childrenIndex, childrenElement) => {
      const id = $(childrenElement).attr('id');
      if (id) {
        $(childrenElement).attr('id', id.replace(...childrenReplaceRule));
      }
      const dataParent = $(childrenElement).attr('data-parent');
      if (dataParent) {
        $(childrenElement).attr('data-parent', dataParent.replace(...replaceRule));
      }
      const forId = $(childrenElement).attr('for');
      if (forId) {
        $(childrenElement).attr('data-parent', forId.replace(...childrenReplaceRule));
      }
      const ariaDescribedby = $(childrenElement).attr('aria-describedby');
      if (ariaDescribedby) {
        $(childrenElement).attr('aria-describedby', id.replace(...childrenReplaceRule));
      }
    })
  })

  parent.after(copyElement.prop('outerHTML'));

  $('button.repeat').off('click', repeatButton).on('click', repeatButton);
}

const generatorButton = $(`<button class="btn btn-primary" type="submit">Generator</button>`);

$('form').append(generatorButton).submit(function (event) {
  if (!event.target.checkValidity()) {
    event.preventDefault();
    event.stopPropagation();
  }

  event.preventDefault();
  const form = $(this);
  const config = generateData(form);
  console.log(config);

  if (form.attr('data-type') === 'json') {
    download(JSON.stringify(config, null, 2), form.attr('data-filename'), form.attr('data-type'));
    return;
  }
  if (['yml', 'yaml'].includes(form.attr('data-type'))) {
    download(jsyaml.dump(config), form.attr('data-filename'), form.attr('data-type'));
    return;
  }
});

function generateData(parent) {
  const config = {};
  parent.find(`[data-parent="${parent.attr('id').replace('config-', '')}"]`).map((index, element) => {
    if ($(element).attr('type') === 'object') {
      config[$(element).attr('name')] = generateData($(element));
      return;
    }
    if ($(element).attr('type') === 'array') {
      const arrayConfig = generateData($(element));
      config[$(element).attr('name')] = Object.keys(arrayConfig).sort((a, b) => a - b).map((e) => arrayConfig[e]);
      return;
    }
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
  return config;
}
function generateBody(preId, name, options, parentType) {
  const id = `${preId}-${name}`;

  // todo: 重复嵌套array
  // todo: 直接生成重复次数
  // text
  if (options.type === 'text') {
    if (options.inputType === 'textarea') {
      $(`#config-${preId}`).append(`<div class="mb-3">
    <label for="${id}" class="form-label">${options.name || name}${(parentType === 'array' && options.repeat === true) ? `<button type="button" class="btn btn-outline-primary repeat" data-id="${id}" data-name="${name}" style="--bs-btn-padding-y: 0rem; --bs-btn-padding-x: .3rem;--bs-btn-font-size: .55rem;border-radius: 50%;margin-left: .5rem;">+</button>` : ''}</label>
    <textarea type="text" class="form-control item" id="${id}" name="${name}" data-parent="${preId}"
    ${options.desp ? ` aria-describedby="help-${id}"` : ''}
    ${options.placeholder ? ` placeholder="${options.placeholder}"` : ''}
    ${options.required ? ' required' : ''}
    ${options.defaultValue ? ` value="${options.defaultValue}"` : ''}
    ></textarea>
    ${options.desp ? `<div id="help-${id}" class="form-text">${options.desp}</div>` : ''}
  </div>`);
      return;
    }

    $(`#config-${preId}`).append(`<div class="mb-3">
    <label for="${id}" class="form-label">${options.name || name}${(parentType === 'array' && options.repeat === true) ? `<button type="button" class="btn btn-outline-primary repeat" data-id="${id}" data-name="${name}" style="--bs-btn-padding-y: 0rem; --bs-btn-padding-x: .3rem;--bs-btn-font-size: .55rem;border-radius: 50%;margin-left: .5rem;">+</button>` : ''}</label>
    <input type="${options.inputType || 'text'}" class="form-control" id="${id}" name="${name}" data-parent="${preId}"
    ${options.desp ? ` aria-describedby="help-${id}"` : ''}
    ${options.placeholder ? ` placeholder="${options.placeholder}"` : ''}
    ${options.required ? ' required' : ''}
    ${options.defaultValue ? ` value="${options.defaultValue}"` : ''}
    />
    ${options.desp ? `<div id="help-${id}" class="form-text">${options.desp}</div>` : ''}
  </div>`);
    return;
  }

  // boolean
  if (options.type === 'boolean') {
    $(`#config-${preId}`).append(`<div class="form-check form-switch mb-3">
  <input class="form-check-input" type="checkbox" role="switch" id="${id}" name="${name}" data-parent="${preId}"
    ${options.desp ? ` aria-describedby="help-${id}"` : ''}
    ${options.defaultValue ? ` checked="checked"` : ''}
    />
  <label class="form-check-label" for="${id}">${options.name || name}${(parentType === 'array' && options.repeat === true) ? `<button type="button" class="btn btn-outline-primary repeat" data-id="${id}" data-name="${name}" style="--bs-btn-padding-y: 0rem; --bs-btn-padding-x: .3rem;--bs-btn-font-size: .55rem;border-radius: 50%;margin-left: .5rem;">+</button>` : ''}</label>
    ${options.desp ? `<div id="help-${id}" class="form-text">${options.desp}</div>` : ''}
</div>`);
    return;
  }

  // single-select
  if (options.type === 'single-select') {
    $(`#config-${preId}`).append(`<div class="mb-3">
      <label class="form-select-label" for="${id}">${options.name || name}${(parentType === 'array' && options.repeat === true) ? `<button type="button" class="btn btn-outline-primary repeat" data-id="${id}" data-name="${name}" style="--bs-btn-padding-y: 0rem; --bs-btn-padding-x: .3rem;--bs-btn-font-size: .55rem;border-radius: 50%;margin-left: .5rem;">+</button>` : ''}</label>
      <select class="form-select" id="${id}" name="${name}" data-parent="${preId}"
    ${options.desp ? ` aria-describedby="help-${id}"` : ''}>
      ${options.options.map((option) => `<option value="${option}" ${option === options.defaultValue ? ' selected' : ''}>${option}</option>`).join('')}
</select>
    ${options.desp ? `<div id="help-${id}" class="form-text">${options.desp}</div>` : ''}
</div>`);
    return;
  }

  // multi-select
  if (options.type === 'multi-select') {
    $(`#config-${preId}`).append(`<div class="mb-3">
      <label class="form-select-label" for="${id}">${options.name || name}${(parentType === 'array' && options.repeat === true) ? `<button type="button" class="btn btn-outline-primary repeat" data-id="${id}" data-name="${name}" style="--bs-btn-padding-y: 0rem; --bs-btn-padding-x: .3rem;--bs-btn-font-size: .55rem;border-radius: 50%;margin-left: .5rem;">+</button>` : ''}</label>
      <select class="form-select" id="${id}" name="${name}" multiple data-parent="${preId}"
    ${options.desp ? ` aria-describedby="help-${id}"` : ''}>
      ${options.options.map((option) => `<option value="${option}" ${(options.defaultValue || []).includes(option) ? ' selected' : ''}>${option}</option>`).join('')}
</select>
    ${options.desp ? `<div id="help-${id}" class="form-text">${options.desp}</div>` : ''}
</div>`);
    return;
  }

  // object
  if (options.type === 'object') {
    $(`#config-${preId}`).append(`<div class="card card-body" style="padding-bottom:0;margin-bottom:1rem;"><p style="text-align:center;margin-bottom:0;"">
  <a class="btn btn-primary" data-bs-toggle="collapse" href="#config-${preId}-${name}" role="button" aria-expanded="true" aria-controls="config-${preId}-${name}"
  data-bs-toggle="tooltip" data-bs-placement="top" data-bs-custom-class="custom-tooltip" data-bs-title="Click to hide/show the options about ${options.name || name}.">
    ${options.name || name}
  </a>
  ${(parentType === 'array' && options.repeat === true) ? `<button type="button" class="btn btn-outline-primary repeat" data-id="config-${preId}-${name}" data-name="${name}" style="--bs-btn-padding-y: 0rem; --bs-btn-padding-x: .3rem;--bs-btn-font-size: .55rem;border-radius: 50%;margin-left: .5rem;">+</button>` : ''}
    ${options.desp ? `<div id="configHelp-${preId}-${name}" class="form-text">${options.desp}</div>` : ''}
</p><div id="config-${preId}-${name}" class="collapse show" name="${name}" type="object" data-parent="${preId}"></div></div>`);
    Object.entries(options.body).forEach(([subName, subOptions]) => {
      generateBody(`${preId}-${name}`, subName, subOptions, options.type);
    });
  }

  // array
  if (options.type === 'array') {
    $(`#config-${preId}`).append(`<div class="card card-body" style="padding-bottom:0;margin-bottom:1rem;"><p style="text-align:center;margin-bottom:0;">
  <a class="btn btn-primary" data-bs-toggle="collapse" href="#config-${preId}-${name}" role="button" aria-expanded="true" aria-controls="config-${preId}-${name}"
  data-bs-toggle="tooltip" data-bs-placement="top" data-bs-custom-class="custom-tooltip" data-bs-title="Click to hide/show the options about ${options.name || name}.">
    ${options.name || name}
  </a>
  ${(parentType === 'array' && options.repeat === true) ? `<button type="button" class="btn btn-outline-primary repeat" data-id="config-${preId}-${name}" data-name="${name}" style="--bs-btn-padding-y: 0rem; --bs-btn-padding-x: .3rem;--bs-btn-font-size: .55rem;border-radius: 50%;margin-left: .5rem;">+</button>` : ''}
    ${options.desp ? `<div id="configHelp-${preId}-${name}" class="form-text">${options.desp}</div>` : ''}
</p><div id="config-${preId}-${name}" class="collapse show" name="${name}" type="array" data-parent="${preId}"></div></div>`);

  // 直接处理重复
    options.body.forEach((subOptions, subName) => {
      generateBody(`${preId}-${name}`, subName, subOptions, options.type);
    });
  }
}
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

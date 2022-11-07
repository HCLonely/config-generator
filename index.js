(async () => {
  const { fileLink } = Object.fromEntries(window.location.search.replace(/^\?/, '').split('&').map((e) => e.split('=')));

  if (fileLink) {
    const fileUrl = new URL(decodeURIComponent(fileLink));
    if (fileUrl.search) {
      fileUrl.search += `&time=${Date.now()}`;
    } else {
      fileUrl.search += `?time=${Date.now()}`;
    }
    loadRemoteTemplate(decodeURIComponent(fileLink));
    // load
  }
  const [dropArea] = $('#file-selector');

  dropArea.addEventListener('dragover', (event) => {
    event.stopPropagation();
    event.preventDefault();
    // 将拖放作为"复制文件"的操作。
    event.dataTransfer.dropEffect = 'copy';
  });

  dropArea.addEventListener('drop', async (event) => {
    event.stopPropagation();
    event.preventDefault();
    const fileList = event.dataTransfer.files;
    if (fileList.length > 0) {
      const template = await readFile(fileList[0]).then((data) => data).catch((error) => {
        console.log(error);
        showError(error);
        return false;
      });
      if (!template) {
        showError('The file content is empty!');
        return;
      }
      loadTemplate(template);
    }
  });

  $('#readTemplateFile')[0].addEventListener('change', async (event) => {
    if (event.target.files.length === 0) {
      return;
    }

    const template = await readFile(event.target.files[0]).then((data) => data).catch((error) => {
      console.error(error);
      showError(error);
      return false;
    });
    if (!template) {
      showError('The file content is empty!');
      return;
    }
    loadTemplate(template);
  });
  $('#loadRemoteFile').click(async (event) => {
    const remoteUrl = $('#remote-url').val();
    if (!remoteUrl) {
      return;
    }

    $(event.target).attr('disabled', 'disabled')
      .html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Loading...');
    await loadRemoteTemplate(remoteUrl);
    $(event.target).text('Generator').removeAttr('disabled');
  });

  async function loadRemoteTemplate(fileLink) {
    /*
    $.getScript(fileLink, (data, status, jqxhr) => {
      console.log(data);
    });
    */

    const [status, template] = await axios.get(fileLink, {
      validateStatus: (status) => status >= 200 && status < 400
    }).then((response) => [true, response.data]).catch((error) => {
      console.error(error);
      return [false, error];
    });
    if (!status) {
      showError(template.message, 'Get template file failed!');
      return;
    }
    loadTemplate(template);
  }

  function loadTemplate(template) {
    const templateJson = formatChecker(template);
    if (!templateJson) {
      return;
    }
    $('#file-selector,#loadRemoteFileLabel,#loadRemoteFileInput').hide();

    templateJson.forEach((singleConfig, index) => {
      // 多配置文件处理
      $('div.container').append(`<form id="config-${singleConfig.name}" style="display:none;" data-type="${
        singleConfig.type || singleConfig.filename.split('.').slice(0, -1).join('.')
      }" data-filename="${singleConfig.filename || `${singleConfig.name}.${singleConfig.type}`}"></form>`);
      if (index === 0) {
        $('#single-config-name>button').attr('data-name', singleConfig.name);
        $('#single-config-name>button').text(singleConfig.name);
        $(`#config-${singleConfig.name}`).show();
      }
      const singleConfigList = $(`<li><a class="dropdown-item${index === 0 ? ' active' : ''}" href="javascript:void(0);">${singleConfig.name}</a></li>`);
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

    const generatorButton = $('<button class="btn btn-primary" type="submit" style="margin-bottom: 1rem;">Generator</button>');

    $('form').append(generatorButton).submit(function (event) {
      $(this).children('button[type="submit"]').attr('disabled', 'disabled')
        .html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Loading...');
      if (!event.target.checkValidity()) {
        $(this).children('button[type="submit"]').text('Generator')
          .removeAttr('disabled');
        event.stopPropagation();
      }

      event.preventDefault();
      const form = $(this);

      for (const element of $.makeArray(form.find('[data-validation]'))) {
        $(element).removeClass('is-invalid').removeClass('is-valid');
        if (!new RegExp($(element).attr('data-validation')).test($(element).val())) {
          $(element).addClass('is-invalid');
        }
      }
      if (form.find('.is-invalid[data-validation]').length > 0) {
        $(this).children('button[type="submit"]').text('Generator')
          .removeAttr('disabled');
        form.find('.is-invalid[data-validation]')[0].scrollIntoView({ behavior: 'smooth' });
        return;
      }

      const config = generateData(form);
      let result = '';
      console.log(config);

      if (form.attr('data-type') === 'json') {
        result = JSON.stringify(config, null, 2);
      }
      if (['yml', 'yaml'].includes(form.attr('data-type'))) {
        result = jsyaml.dump(config);
      }
      if (['ini'].includes(form.attr('data-type'))) {
        result = object2ini(config);
      }
      if (form.attr('data-filename') === 'copy') {
        $('#modalLabel').html('<span class="badge rounded-pill text-bg-success">Success</span>');
        $('#modalBody>textarea').val(result);
        new bootstrap.Modal('#modal').show();
      } else {
        download(result, form.attr('data-filename'), form.attr('data-type'));
      }
      $(this).children('button[type="submit"]').text('Generator')
        .removeAttr('disabled');
    });
  }
  function repeatButton(event) {
    const parent = $(event.target).parent().parent();
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
      return element;
    });
    copyElement.children('p').children('a').map((index, element) => {
      const href = $(element).attr('href');
      if (href) {
        $(element).attr('href', href.replace(...replaceRule));
      }
      const ariaControls = $(element).attr('aria-controls');
      if (ariaControls) {
        $(element).attr('aria-controls', ariaControls.replace(...replaceRule));
      }
      return element;
    });
    copyElement.children('p').children('button').map((index, element) => {
      const dataId = $(element).attr('data-id');
      if (dataId) {
        $(element).attr('data-id', dataId.replace(...replaceRule));
      }
      const dataName = $(element).attr('data-name');
      if (dataName) {
        $(element).attr('data-name', newNameId);
      }
      return element;
    });
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
        return childrenElement;
      });
      return element;
    });

    parent.after(copyElement.prop('outerHTML'));

    $('button.repeat').off('click', repeatButton).on('click', repeatButton);
  }

  function generateData(parent, isArray) {
    const config = isArray ? [] : {};
    parent.find(`[data-parent="${parent.attr('id').replace('config-', '')}"]`).map((index, element) => {
      if ($(element).attr('type') === 'object') {
        if (isArray) {
          config.push(generateData($(element)));
          return element;
        }
        config[$(element).attr('name')] = generateData($(element));
        return element;
      }
      if ($(element).attr('type') === 'array') {
        const arrayConfig = generateData($(element), true);
        if (isArray) {
          config.push(arrayConfig);
          return element;
        }
        config[$(element).attr('name')] = arrayConfig;
        return element;
      }
      if ($(element).attr('type') === 'checkbox') {
        if (isArray) {
          config.push($(element).prop('checked'));
          return element;
        }
        config[$(element).attr('name')] = $(element).prop('checked');
        return element;
      }
      if ($(element).attr('type') === 'number') {
        if (isArray) {
          config.push(parseFloat($(element).val(), 10));
          return element;
        }
        config[$(element).attr('name')] = parseFloat($(element).val(), 10);
        return element;
      }
      if (isArray) {
        config.push($(element).val());
        return element;
      }
      config[$(element).attr('name')] = $(element).val();
      return element;
    });
    return config;
  }
  function generateBody(preId, name, options, parentType) {
    const id = `${preId}-${name}`;

    // text
    if (options.type === 'text') {
      if (options.inputType === 'textarea') {
        $(`#config-${preId}`).append(`<div class="mb-3">
          <label for="${id}" class="form-label">
            ${options.name || name}${(parentType === 'array' && options.repeat === true) ? `<button type="button" class="btn btn-outline-primary repeat"
            data-id="${id}" data-name="${name}"
            style="--bs-btn-padding-y: 0rem; --bs-btn-padding-x: .3rem;--bs-btn-font-size: .55rem;border-radius: 50%;margin-left: .5rem;">+</button>` : ''}
          </label>
          <textarea type="text" class="form-control item" id="${id}" name="${name}" data-parent="${preId}"
            ${options.desp ? ` aria-describedby="help-${id}"` : ''}
            ${options.placeholder ? ` placeholder="${options.placeholder}"` : ''}
            ${options.required ? ' required' : ''}
            ${options.defaultValue ? ` value="${options.defaultValue}"` : ''}
            ${options.validation ? ` data-validation="${options.validation}"` : ''}
          ></textarea>
          ${options.validation ? '<div class="invalid-feedback">Invalid format!</div>' : ''}
          ${options.desp ? `<div id="help-${id}" class="form-text">${options.desp}</div>` : ''}
        </div>`);
        return;
      }

      $(`#config-${preId}`).append(`<div class="mb-3">
        <label for="${id}" class="form-label">${options.name || name}${(parentType === 'array' && options.repeat === true) ? `<button type="button"
          class="btn btn-outline-primary repeat" data-id="${id}" data-name="${name}"
          style="--bs-btn-padding-y: 0rem; --bs-btn-padding-x: .3rem;--bs-btn-font-size: .55rem;border-radius: 50%;margin-left: .5rem;">+</button>` : ''}
        </label>
        <input type="${options.inputType || 'text'}" class="form-control" id="${id}" name="${name}" data-parent="${preId}"
          ${options.desp ? ` aria-describedby="help-${id}"` : ''}
          ${options.placeholder ? ` placeholder="${options.placeholder}"` : ''}
          ${options.required ? ' required' : ''}
          ${options.defaultValue ? ` value="${options.defaultValue}"` : ''}
          ${options.validation ? ` data-validation="${options.validation}"` : ''}
        />
        ${options.validation ? '<div class="invalid-feedback">Invalid format!</div>' : ''}
        ${options.desp ? `<div id="help-${id}" class="form-text">${options.desp}</div>` : ''}
      </div>`);
      return;
    }

    // boolean
    if (options.type === 'boolean') {
      $(`#config-${preId}`).append(`<div class="form-check form-switch mb-3">
        <input class="form-check-input" type="checkbox" role="switch" id="${id}" name="${name}" data-parent="${preId}"
          ${options.desp ? ` aria-describedby="help-${id}"` : ''}
          ${options.defaultValue ? ' checked="checked"' : ''}
          />
        <label class="form-check-label" for="${id}">${options.name || name}${(parentType === 'array' && options.repeat === true) ? `<button type="button"
          class="btn btn-outline-primary repeat" data-id="${id}" data-name="${name}"
          style="--bs-btn-padding-y: 0rem; --bs-btn-padding-x: .3rem;--bs-btn-font-size: .55rem;border-radius: 50%;margin-left: .5rem;">+</button>` : ''}
        </label>
        ${options.desp ? `<div id="help-${id}" class="form-text">${options.desp}</div>` : ''}
      </div>`);
      return;
    }

    // single-select
    if (options.type === 'single-select') {
      $(`#config-${preId}`).append(`<div class="mb-3">
        <label class="form-select-label" for="${id}">${options.name || name}${(parentType === 'array' && options.repeat === true) ? `<button type="button"
          class="btn btn-outline-primary repeat" data-id="${id}" data-name="${name}"
          style="--bs-btn-padding-y: 0rem; --bs-btn-padding-x: .3rem;--bs-btn-font-size: .55rem;border-radius: 50%;margin-left: .5rem;">+</button>` : ''}
        </label>
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
        <label class="form-select-label" for="${id}">${options.name || name}${(parentType === 'array' && options.repeat === true) ? `<button type="button"
          class="btn btn-outline-primary repeat" data-id="${id}" data-name="${name}"
          style="--bs-btn-padding-y: 0rem; --bs-btn-padding-x: .3rem;--bs-btn-font-size: .55rem;border-radius: 50%;margin-left: .5rem;">+</button>` : ''}
        </label>
        <select class="form-select" id="${id}" name="${name}" multiple data-parent="${preId}"
        ${options.desp ? ` aria-describedby="help-${id}"` : ''}>
          ${options.options.map((option) => `<option value="${option}"
          ${(options.defaultValue || []).includes(option) ? ' selected' : ''}>${option}</option>`).join('')}
        </select>
        ${options.desp ? `<div id="help-${id}" class="form-text">${options.desp}</div>` : ''}
      </div>`);
      return;
    }

    // object
    if (options.type === 'object') {
      $(`#config-${preId}`).append(`<div class="card card-body" style="padding-bottom:0;margin-bottom:1rem;">
        <p style="text-align:center;margin-bottom:0;"">
          <a class="btn btn-primary" data-bs-toggle="collapse" href="#config-${preId}-${name}" role="button" aria-expanded="true"
            aria-controls="config-${preId}-${name}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-custom-class="custom-tooltip"
            data-bs-title="Click to hide/show the options about ${options.name || name}.">
            ${options.name || name}
          </a>
          ${(parentType === 'array' && options.repeat === true) ? `<button type="button" class="btn btn-outline-primary repeat"
            data-id="config-${preId}-${name}" data-name="${name}"
            style="--bs-btn-padding-y: 0rem; --bs-btn-padding-x: .3rem;--bs-btn-font-size: .55rem;border-radius: 50%;margin-left: .5rem;">+</button>` : ''}
          ${options.desp ? `<div id="configHelp-${preId}-${name}" class="form-text">${options.desp}</div>` : ''}
        </p><div id="config-${preId}-${name}" class="collapse show" name="${name}" type="object" data-parent="${preId}"></div>
      </div>`);
      Object.entries(options.body).forEach(([subName, subOptions]) => {
        generateBody(`${preId}-${name}`, subName, subOptions, options.type);
      });
    }

    // array
    if (options.type === 'array') {
      $(`#config-${preId}`).append(`<div class="card card-body" style="padding-bottom:0;margin-bottom:1rem;">
        <p style="text-align:center;margin-bottom:0;">
          <a class="btn btn-primary" data-bs-toggle="collapse" href="#config-${preId}-${name}" role="button" aria-expanded="true"
            aria-controls="config-${preId}-${name}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-custom-class="custom-tooltip"
            data-bs-title="Click to hide/show the options about ${options.name || name}.">
            ${options.name || name}
          </a>
          ${(parentType === 'array' && options.repeat === true) ? `<button type="button" class="btn btn-outline-primary repeat"
            data-id="config-${preId}-${name}" data-name="${name}"
            style="--bs-btn-padding-y: 0rem; --bs-btn-padding-x: .3rem;--bs-btn-font-size: .55rem;border-radius: 50%;margin-left: .5rem;">+</button>` : ''}
          ${options.desp ? `<div id="configHelp-${preId}-${name}" class="form-text">${options.desp}</div>` : ''}
        </p><div id="config-${preId}-${name}" class="collapse show" name="${name}" type="array" data-parent="${preId}"></div>
      </div>`);

      const arrayBody = [];
      options.body.forEach((subOptions) => {
        if (typeof subOptions.repeat === 'number' && subOptions.repeat > 0) {
          arrayBody.push(...(new Array(subOptions.repeat).fill(subOptions)));
          return;
        }

        arrayBody.push(subOptions);
      });
      arrayBody.forEach((subOptions, subName) => {
        generateBody(`${preId}-${name}`, subName, subOptions, options.type);
      });
    }
  }
  function download(data, filename, type) {
    const file = new Blob([data], { type });
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(file, filename);
    } else {
      const a = document.createElement('a');
      const url = URL.createObjectURL(file);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    }
  }
  function formatChecker(template) {
    try {
      const templateJson = jsyaml.load(template);
      console.log(templateJson);

      if (!Array.isArray(templateJson)) {
        showError('The root template must be an array!');
        return false;
      }

      for (let i = 0; i < templateJson.length; i++) {
        // root template check
        if (!templateJson[i].name) {
          showError(`The template of No.${i + 1} has no the key: "name".`);
          return false;
        }
        if (!templateJson[i].body) {
          showError(`The template of No.${i + 1} has no the key: "body".`);
          return false;
        }
        if (!templateJson[i].type && !templateJson[i].filename) {
          showError(`The template of No.${i + 1} has no the keys: "type", "filename".\nYou have to input at least one of them.`);
          return false;
        }
      }
      return templateJson;
    } catch (error) {
      console.error(error);
      showError(error.message);
      return false;
    }
  }

  function showError(message, title = '') {
    $('#modalLabel').html(`<span class="badge rounded-pill text-bg-danger">Error</span>${title || ''}`);
    $('#modalBody>textarea').val(message);
    new bootstrap.Modal('#modal').show();
  }

  function object2ini(data, parentKey = '') {
    return Object.entries(data).map(([key, value]) => {
      if (typeof value === 'object') {
        return object2ini(value, `${parentKey}${key}.`);
      }
      return `${parentKey}${key}=${value}`;
    }).join('\n');
  }

  function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('error', () => {
        console.error(`Error occurred reading file: ${file.name}`);
        reject(`Error occurred reading file: ${file.name}`);
      });

      reader.addEventListener('load', (event) => {
        resolve(event.target.result);
      });
      reader.readAsText(file);
    });
  }
})();

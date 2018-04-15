`use strict`;

(function () {
  const settings = document.querySelector('.settings');
  const settingLineForm = document.querySelector(`.settings__line-form`);
  const settingElements = settingLineForm.querySelectorAll(`.setting`);
  const settingWidthNumber = settingLineForm.querySelector(`.setting--number-width`);
  const settingWidthSelect = settingLineForm.querySelector(`.setting--select-width`);
  const settingWidthRandom = settingLineForm.querySelector(`.setting--random-width`);
  const settingLineColor = settingLineForm.querySelector(`.setting--color`);
  const settingRainbowColor = settingLineForm.querySelector(`.setting--rainbow`);
  const canvas = document.querySelector(`#draw`);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - canvas.offsetTop;
  const ctx = canvas.getContext(`2d`);
  let hue = 0;
  let isRainbow = false;
  let isRandom = false;
  let direction = true;
  let lastX = 0;
  let lastY = 0;

  const params = {
    lineWidth: [`25`, `50`, `100`, `150`],
    strokeStyle: [`#3498db`],
    // lineJoin: [`round`, `bevel`, `miter`],
    lineCap: [`round`, `square`, `butt`],
    globalCompositeOperation: [
      `source-over`,
      // `source-over`,
      // `source-in`,
      // `source-out`,
      // `source-atop`,
      // `destination-over`,
      // `destination-in`,
      // `destination-out`,
      // `destination-atop`,
      `lighter`,
      // `copy`,
      `xor`,
      `multiply`,
      `screen`,
      `overlay`,
      `darken`,
      `lighten`,
      `color-dodge`,
      `color-burn`,
      `hard-light`,
      `soft-light`,
      `difference`,
      `exclusion`,
      `hue`,
      `saturation`,
      `color`,
      `luminosity`
    ]
  };

  initDefaultSettings();
  settingLineForm.addEventListener(`change`, settingLineFormChangeHandler);
  canvas.addEventListener(`mousedown`, startDrawingLine);
  canvas.addEventListener(`mouseup`, stopDrawingLine);
  canvas.addEventListener(`mouseout`, stopDrawingLine);

  /**
   * Возвращает фрагмент с опциями для select`ов
   * @param {Element} param
   * @return {DocumentFragment}
   */
  function createSettingOptions(param) {
    const fragment = document.createDocumentFragment();

    params[param].forEach((el) => {
      const option = document.createElement(`option`);

      option.value = el;
      option.textContent = `${el[0].toUpperCase()}${el.slice(1)}`;
      fragment.appendChild(option);
    });

    return fragment;
  }

  /**
   * Заполняет данными элементы с настройками, инициализирует параметры канваса по умолчанию
   */
  function initDefaultSettings() {
    Array.from(settingElements).forEach(element => {
      const param = element.dataset.param;

      switch (element.tagName.toLowerCase()) {
        case (`select`):
          element.appendChild(createSettingOptions(param));
          break;
        case (`input`):
          element.value = params[param][0];
          break;
      }

      ctx[param] = element.value;
    });
  }

  /**
   * Обработчик изменения состояния формы с настройками
   * @param {Object} event
   */
  function settingLineFormChangeHandler(event) {
    ctx[event.target.dataset.param] = event.target.value;

    if (event.target.tagName.toLowerCase() === `select`) {
      settingWidthNumber.value = event.target.value;
    }

    if (event.target === settingRainbowColor) {
      isRainbow = settingRainbowColor.checked;
    }

    if (event.target === settingWidthRandom) {
      isRandom = settingWidthRandom.checked;
    }

    settingLineColor.disabled = isRainbow;
    settingWidthSelect.disabled = isRandom;
    settingWidthNumber.disabled = isRandom;
  }

  /**
   * Обработчик начала отрисовки линии
   * @param {Object} event
   */
  function startDrawingLine(event) {
    ctx.beginPath();
    ctx.moveTo(event.offsetX, event.offsetY);
    ctx.lineTo(event.offsetX, event.offsetY);
    ctx.stroke();
    [lastX, lastY] = [event.offsetX, event.offsetY];

    canvas.addEventListener(`mousemove`, drawLine);
  }

  /**
   * Обработчик окончания отрисовки линии
   */
  function stopDrawingLine() {
    canvas.removeEventListener(`mousemove`, drawLine);
  }

  /**
   * Обработчик отрисовки линии
   * @param {Object} event
   */
  function drawLine(event) {
    ctx.strokeStyle = (isRainbow) ? `hsl(${hue}, 100%, 50%)` : settingLineColor.value;

    if (isRandom) {
      if (ctx.lineWidth >= 100 || ctx.lineWidth <= 1) {
        direction = !direction;
      }

      if (direction) {
        ctx.lineWidth++;
      } else {
        ctx.lineWidth--;
      }
    } else {
      ctx.lineWidth = settingWidthNumber.value;
    }

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(event.offsetX, event.offsetY);
    ctx.stroke();
    [lastX, lastY] = [event.offsetX, event.offsetY];

    hue++;
  }

  // Обработчики для тач-скринов

  var lastCoords = {};

  canvas.addEventListener('touchstart', (evt) => {
    evt.preventDefault();

    for (var i = 0; i < evt.changedTouches.length; i++) {
      var touch = evt.changedTouches[i];

      lastCoords[touch.identifier] = { x: touch.pageX, y: touch.pageY - settings.offsetHeight};
      ctx.beginPath();
      ctx.moveTo(lastCoords[touch.identifier].x, lastCoords[touch.identifier].y);
      ctx.lineTo(touch.pageX, touch.pageY - settings.offsetHeight);
      ctx.stroke();
    }
  });

  canvas.addEventListener('touchmove', (evt) => {
    evt.preventDefault();

    for (var i = 0; i < evt.changedTouches.length; i++) {
      var touch = evt.changedTouches[i];

      ctx.strokeStyle = (isRainbow) ? `hsl(${hue}, 100%, 50%)` : settingLineColor.value;

      if (isRandom) {
        if (ctx.lineWidth >= 100 || ctx.lineWidth <= 1) {
          direction = !direction;
        }

        if (direction) {
          ctx.lineWidth++;
        } else {
          ctx.lineWidth--;
        }
      } else {
        ctx.lineWidth = settingWidthNumber.value;
      }

      console.log(ctx.strokeStyle)

      ctx.beginPath();
      ctx.moveTo(lastCoords[touch.identifier].x, lastCoords[touch.identifier].y);
      ctx.lineTo(touch.pageX, touch.pageY - settings.offsetHeight);
      ctx.stroke();
      lastCoords[touch.identifier] = { x: touch.pageX, y: touch.pageY - settings.offsetHeight};
    }
  });

  canvas.addEventListener('touchend', touchCancel);
  canvas.addEventListener('touchcancel', touchCancel);

  function touchCancel(evt) {
    for (var i = 0; i < evt.changedTouches.length; i++) {
      var touch = evt.changedTouches[i];

      delete lastCoords[touch.identifier];
    }
  }
}());

export class ResizableWindows {
  static instances = []; // Array para armazenar todas as instâncias de elementos da classe
  static appInFocus = null;

  static getAllInstances() {
    return ResizableWindows.instances; // Retorna todas as instâncias da classe
  }

  constructor(name, source) {
    this.name = name;
    this.source = source;
    this.initialize();
  }
  initialize() {
    this.setupInitialState();
    this.component = this.buildComponent();
    ResizableWindows.instances.push(this.component); // Adiciona a instância atual ao array de instâncias
    ResizableWindows.appInFocus = this.component;
  }
  setupInitialState() {
    this.startX = 0;
    this.startY = 0;
    this.startWidth = 320;
    this.startHeight = 260;
    this.startLeft = 0;
    this.startTop = 0;
    this.dragActiveState = false;
  }

  getComponent() {
    return this.component;
  }

  buildComponent() {
    const addEventsResizer = arrElem => {
      arrElem.forEach(elem => {
        elem.addEventListener("touchstart", event =>
          this.startResizer(event, true)
        );
        elem.addEventListener("touchmove", event => this.resize(event, true));
        elem.addEventListener("mousedown", event =>
          this.startResizer(event, false)
        );
        elem.addEventListener("mouseout", event => this.resize(event, false));
      });
    };
    const createElement = (type, className, content, attr) => {
      const elem = document.createElement(type);
      elem.innerHTML = content;

      className.match(/[\w\-\[\]\/\:]+/gi).forEach(item => {
        elem.classList.add(item);
      });

      if (attr) {
        attr.forEach(item => {
          elem.setAttribute(item.attr, item.value);
        });
      }
      return elem;
    };
    const resizable = createElement(
      "div",
      `w-[320px] h-[260px] border-4 border-gray-800/30 resizable bg-gray-800/30 backdrop-blur-md fixed rounded-md overflow-hidden shadow-md left-8 top-8`,
      ""
    );
    const btnMin = createElement(
      "button",
      "bg-red-400",
      '<i class="fi fi-rr-window-minimize"></i>'
    );
    const btnMax = createElement(
      "button",
      "bg-red-400",
      '<i class="fi fi-rr-window-maximize"></i>'
    );
    const btnClose = createElement(
      "button",
      "bg-red-400",
      '<i class="fi fi-rr-window-x"></i>'
    );

    const head = createElement(
      "header",
      "w-full px-3 h-9 select-none  flex gap-3 items-center justify-between text-white bg-gray-800/30",
      ``
    );
    const headName = createElement(
      "div",
      "w-full whitespace-nowrap overflow-hidden text-ellipsis",
      "Loading..."
    );
    const headOptions = createElement(
      "div",
      "w-fit flex gap-3 items-center",
      ""
    );
    const minWin = createElement(
      "button",
      "size-7 rounded-full bg-green-500",
      ""
    );
    const maxWin = createElement(
      "button",
      "size-7 rounded-full bg-amber-500",
      ""
    );
    const closeWin = createElement(
      "button",
      "size-7 rounded-full bg-red-500",
      ""
    );
    const body = createElement(
      "section",
      "win-body w-full h-full overflow-scroll",
      ""
    );

    const t = createElement(
      "div",
      "top-resizer absolute top-0 left-0 w-full h-2 cursor-ns-resize",
      ""
    );
    const r = createElement(
      "div",
      "right-resizer absolute top-0 right-0 w-2 h-full cursor-ew-resize",
      ""
    );
    const b = createElement(
      "div",
      "bottom-resizer absolute bottom-0 left-0 w-full h-2 cursor-ns-resize",
      ""
    );
    const l = createElement(
      "div",
      "left-resizer absolute top-0 left-0 w-2 h-full cursor-ew-resize",
      ""
    );

    const tl = createElement(
      "div",
      "top-left absolute top-0 left-0 w-3 h-3 cursor-nwse-resize",
      ""
    );
    const tr = createElement(
      "div",
      "top-right absolute top-0 right-0 w-3 h-3 cursor-nesw-resize",
      ""
    );
    const bl = createElement(
      "div",
      "bottom-left absolute bottom-0 left-0 w-3 h-3 cursor-nwse-resize",
      ""
    );
    const br = createElement(
      "div",
      "bottom-right absolute bottom-0 right-0 w-3 h-3 cursor-nesw-resize",
      ""
    );

    addEventsResizer([t, r, b, l, tl, tr, bl, br]);
    maxWin.onclick = () => this.toggleMaximize();
    closeWin.onclick = () => this.destroyWindow()

    head.addEventListener("touchstart", event => this.startDrag(event, true));
    head.addEventListener("touchmove", event => this.drag(event, true));
    head.addEventListener("touchend", event => (this.dragActiveState = false));
    head.addEventListener("mousedown", event => this.startDrag(event, true));
    head.addEventListener("mousemove", event => {
      if (this.dragActiveState) this.startDrag(event, true);
    });
    head.addEventListener("mouseup", event => (this.dragActiveState = false));

    const content =
      typeof this.source === "string"
        ? createElement("iframe", "win-content w-full h-full", "", [
            { attr: "src", value: this.source }
          ])
        : this.source;

    if (content.nodeName === "IFRAME") {
      content.onload = () => {
        headName.textContent = content.contentDocument.title
        content.contentDocument.ontouchstart = () => this.focusIn();
        content.contentDocument.onmousedown = () => this.focusIn();
        try{
      this.component.style.background = getComputedStyle(content.contentDocument.querySelector(":root")).getPropertyValue("--primary") + "66"
    //  nameText.style.color = getComputedStyle(content.contentDocument.querySelector(":root")).getPropertyValue("--primary")
      }catch{}
      };
    } else {
      content.ontouchstart = () => this.focusIn();
      content.onmousedown = () => this.focusIn();
    }
    body.appendChild(content);
    head.appendChild(headName);
    headOptions.appendChild(minWin);
    headOptions.appendChild(maxWin);
    headOptions.appendChild(closeWin);
    head.appendChild(headOptions);
    resizable.appendChild(head);
    resizable.appendChild(body);
    resizable.appendChild(t);
    resizable.appendChild(r);
    resizable.appendChild(b);
    resizable.appendChild(l);
    resizable.appendChild(tl);
    resizable.appendChild(tr);
    resizable.appendChild(bl);
    resizable.appendChild(br);

    return resizable;
  }

  startResizer(event, isTouchEvents) {
    this.focusIn();
    const touch = isTouchEvents ? event.touches[0] : event;
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.startWidth = parseInt(
      window.getComputedStyle(event.target.parentNode).width,
      10
    );

    this.startHeight = parseInt(
      window.getComputedStyle(event.target.parentNode).height,
      10
    );

    this.startLeft = parseInt(
      window.getComputedStyle(event.target.parentNode).left,
      10
    );

    this.startTop = parseInt(
      window.getComputedStyle(event.target.parentNode).top,
      10
    );

    event.stopPropagation();
  }

  resize(event, isTouchEvents) {
    const touch = isTouchEvents ? event.touches[0] : event;
    const dx = touch.clientX - this.startX;
    const dy = touch.clientY - this.startY;

    const resizer = event.target;
    const direction = resizer.classList;

    const resizable = resizer.parentNode;

    if (direction.contains("bottom-right")) {
      const newWidth = this.startWidth + dx;
      const newHeight = this.startHeight + dy;
      if (newWidth >= 320) {
        resizable.style.width = newWidth + "px";
      }
      if (newHeight >= 260) {
        resizable.style.height = newHeight + "px";
      }
    } else if (direction.contains("bottom-left")) {
      const newWidth = this.startWidth - dx;
      const newHeight = this.startHeight + dy;
      if (newWidth >= 320) {
        resizable.style.width = newWidth + "px";
        resizable.style.left = this.startLeft + dx + "px";
      }
      if (newHeight >= 260) {
        resizable.style.height = newHeight + "px";
      }
    } else if (direction.contains("top-right")) {
      const newWidth = this.startWidth + dx;
      const newHeight = this.startHeight - dy;
      if (newWidth >= 320) {
        resizable.style.width = newWidth + "px";
      }
      if (newHeight >= 260) {
        resizable.style.height = newHeight + "px";
        resizable.style.top = this.startTop + dy + "px";
      }
    } else if (direction.contains("top-left")) {
      const newWidth = this.startWidth - dx;
      const newHeight = this.startHeight - dy;
      if (newWidth >= 320) {
        resizable.style.width = newWidth + "px";
        resizable.style.left = this.startLeft + dx + "px";
      }
      if (newHeight >= 260) {
        resizable.style.height = newHeight + "px";
        resizable.style.top = this.startTop + dy + "px";
      }
    } else if (direction.contains("left-resizer")) {
      const newWidth = this.startWidth - dx;
      if (newWidth >= 320) {
        resizable.style.width = newWidth + "px";
        resizable.style.left = this.startLeft + dx + "px";
      }
    } else if (direction.contains("right-resizer")) {
      const newWidth = this.startWidth + dx;
      if (newWidth >= 320) {
        resizable.style.width = newWidth + "px";
      }
    } else if (direction.contains("top-resizer")) {
      const newHeight = this.startHeight - dy;
      if (newHeight >= 260) {
        resizable.style.height = newHeight + "px";
        resizable.style.top = this.startTop + dy + "px";
      }
    } else if (direction.contains("bottom-resizer")) {
      const newHeight = this.startHeight + dy;
      if (newHeight >= 260) {
        resizable.style.height = newHeight + "px";
      }
    }
  }

  startDrag(event, isTouchEvents) {
    const touch = isTouchEvents ? event.touches[0] : event;
    this.focusIn();

    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.startLeft = parseInt(window.getComputedStyle(this.component).left, 10);
    this.startTop = parseInt(window.getComputedStyle(this.component).top, 10);

    this.startWidth = parseInt(
      window.getComputedStyle(this.component).width,
      10
    );

    this.dragActiveState = true;

    event.stopPropagation();
  }

  drag(event, isTouchEvents) {
    const touch = isTouchEvents ? event.touches[0] : event;
    const dx = touch.clientX - this.startX;
    const dy = touch.clientY - this.startY;
    console.log(dx);
    const draggable = this.component;

    draggable.style.left = this.startLeft + dx + "px";
    draggable.style.top = this.startTop + dy + "px";

    const windowWidth = window.innerWidth;
    const maxWidth = windowWidth - this.startWidth;
    if (parseInt(draggable.style.left, 10) < 0) {
      draggable.style.left = 0;
    } else if (parseInt(draggable.style.left, 10) > maxWidth) {
      draggable.style.left = maxWidth + "px";
    }
  }

  focusIn(event) {
    let i = 1;
    ResizableWindows.appInFocus = this.component;
    ResizableWindows.instances.splice(
      ResizableWindows.instances.indexOf(this.component),
      1
    );
    ResizableWindows.instances.push(this.component);
    ResizableWindows.instances.forEach(order => {
      order.style.zIndex = i;
      i++;
    });
  }
  toggleMaximize() {
    this.component.classList.toggle("fullScreenWindow");
  }
  removeMaximizeState() {
    this.component.classList.remove("fullScreenWindow");
    
  }
  
  destroyWindow() {
    this.component.classList.add("destroyer");
    setTimeout(() => {
      this.component.remove();
    }, 200);
  }
}

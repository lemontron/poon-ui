import React, { useMemo, useState, useRef, useEffect, forwardRef, Fragment, useImperativeHandle, Children } from 'react';
import { randomId, createBus, useBus } from '@poon/router/util.js';
import { navigation } from '@poon/router';

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
const bounce = (num, min, max) => {
  if (num > max) return max + (max + num) / 50;
  if (num < min) return min - (min - num) / 50;
  return num;
};
const easeOutCubic = t => --t * t * t + 1;
class AnimatedValue {
  constructor(initialValue) {
    this.listeners = [];
    this.value = initialValue;
    this.checkpoint = initialValue;
  }
  setValue = (value, stopAnimations = true) => {
    if (stopAnimations) delete this.id;
    this.value = value;
    this.listeners.forEach(fn => fn(value));
  };
  spring = (finalValue, duration = 300) => new Promise(resolve => {
    if (finalValue === this.value) return; // cancel unnecessary animation

    const t0 = this.id = performance.now(); // a unique id for this animation lifecycle
    const oldValue = this.value;
    const animate = t => {
      if (t0 !== this.id) return;
      const elapsed = Math.max(0, t - t0); // time hack
      if (elapsed >= duration) {
        this.setValue(finalValue);
        resolve();
      } else {
        const d = (finalValue - oldValue) * easeOutCubic(elapsed / duration);
        // if (this.name === 'sidebar') console.log('delta:', d, 'elapsed:', elapsed, 'duration:', duration, 'ease:', ease);
        this.setValue(oldValue + d, false);
        requestAnimationFrame(animate);
      }
    };
    animate(t0);
  });
  on = fn => {
    this.listeners.push(fn);
    return () => this.listeners = this.listeners.filter(i => i !== fn);
  };
  saveCheckpoint = () => {
    this.checkpoint = this.value;
  };
}
const useAnimatedValue = initialValue => useMemo(() => {
  return new AnimatedValue(initialValue);
}, []);

const c = (...rest) => rest.filter(Boolean).join(' ');

const Touchable = ({
  href,
  onClick,
  className,
  target,
  children,
  disableMenu
}) => {
  const [touched, setTouched] = useState(false);
  const moved = useRef(false);
  const clickButton = e => {
    if (moved.current) return e.preventDefault();
    if (onClick) {
      if (!href) {
        e.preventDefault();
        e.stopPropagation();
      }
      onClick(e);
    }
  };
  const touch = e => {
    if (e.button && e.button !== 0) return; // If mouse, only process left clicks
    e.stopPropagation();
    moved.current = false;
    setTouched(true);
  };
  const leave = () => {
    setTouched(false);
  };
  return /*#__PURE__*/React.createElement(href ? 'a' : 'button', {
    'href': href,
    'onTouchStart': touch,
    'onTouchMove': leave,
    'onTouchEnd': leave,
    'onMouseDown': touch,
    'onMouseUp': leave,
    'onMouseLeave': leave,
    'onClick': clickButton,
    'className': c('touchable', className, touched && 'active', disableMenu && 'disable-menu'),
    'target': target,
    'draggable': false,
    'onContextMenu': disableMenu ? e => {
      e.preventDefault();
      return false;
    } : undefined
  }, children);
};

const iOS = /iPad|iPhone|iPod/.test(navigator.platform);
const iconMap = {
  'os:back': iOS ? 'arrow_back_ios' : 'arrow_back',
  'os:share': iOS ? 'ios_share' : 'share',
  'os:close': iOS ? 'keyboard_arrow_down' : 'close'
};
const Icon = ({
  icon,
  className,
  color,
  title,
  size,
  onClick
}) => /*#__PURE__*/React.createElement("i", {
  className: c('material-icons', className),
  style: {
    color,
    fontSize: size
  },
  title: title,
  onClick: onClick,
  children: iconMap[icon] || icon
});

const TouchableRow = ({
  title,
  meta,
  leftIcon,
  href,
  onClick,
  onPressMore,
  target,
  children,
  caret,
  disabled,
  RightComponent
}) => /*#__PURE__*/React.createElement(Touchable, {
  className: c('touchable-row', disabled && 'disabled'),
  onClick: onClick,
  href: href,
  target: target
}, /*#__PURE__*/React.createElement("div", {
  className: "touchable-row-left"
}, typeof leftIcon === 'string' ? /*#__PURE__*/React.createElement("div", {
  className: "touchable-row-icon"
}, /*#__PURE__*/React.createElement(Icon, {
  icon: leftIcon
})) : null, typeof leftIcon === 'object' ? /*#__PURE__*/React.createElement("div", {
  className: "touchable-row-icon"
}, leftIcon) : null, /*#__PURE__*/React.createElement("div", {
  className: "touchable-row-content"
}, title ? /*#__PURE__*/React.createElement("div", {
  className: "touchable-row-title",
  children: title
}) : null, meta ? /*#__PURE__*/React.createElement("div", {
  className: "meta",
  children: meta
}) : null, children)), RightComponent, onPressMore ? /*#__PURE__*/React.createElement(Touchable, {
  onClick: onPressMore
}, /*#__PURE__*/React.createElement(Icon, {
  icon: "more_vert"
})) : null, caret ? /*#__PURE__*/React.createElement(Icon, {
  icon: "chevron_right"
}) : null);

const FLICK_SPEED = .25; // pixels per ms
const CUTOFF_INTERVAL = 50; // ms
const listenerOptions = {
  capture: false,
  passive: false
};
const getVelocity = (lastV = 0, newV, elapsedTime) => {
  const w1 = Math.min(elapsedTime, CUTOFF_INTERVAL) / CUTOFF_INTERVAL;
  const w0 = 1 - w1;
  return lastV * w0 + newV * w1;
};
const useSize = el => {
  const [size, setSize] = useState({
    'width': el.current?.clientWidth,
    'height': el.current?.clientHeight
  });
  useEffect(() => {
    // observe size of element
    if (!el.current) return;
    const ro = new ResizeObserver(entries => {
      const e = entries[0].borderBoxSize[0];
      setSize({
        'height': e.blockSize,
        'width': e.inlineSize
      });
    });
    ro.observe(el.current);
    return () => ro.disconnect();
  }, [el.current]);
  return size;
};
let responderEl; // The element currently capturing input

const usePanGestures = (el, opts = {}, deps) => {
  const {
    width,
    height
  } = useSize(el);
  const refs = useRef({
    'id': randomId()
  }).current;
  const handlers = useMemo(() => {
    if (!el.current) return {};
    const logVelocity = () => {
      // Log instantaneous velocity
      const now = Date.now();
      const elapsedTime = now - refs.last.ts;
      if (elapsedTime > 0) {
        const vx = (refs.x - refs.last.x) / elapsedTime;
        const vy = (refs.y - refs.last.y) / elapsedTime;
        refs.v = {
          'x': getVelocity(refs.v.x, vx, elapsedTime),
          'y': getVelocity(refs.v.y, vy, elapsedTime)
        };
        refs.last = {
          'x': refs.x,
          'y': refs.y,
          'ts': now
        };
      }
    };
    const down = e => {
      responderEl = null;
      if (e.touches.length > 1) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        refs.pinch = {
          d0: Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
        };
        return;
      }
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      Object.assign(refs, {
        'width': width,
        'height': height,
        'current': {
          x,
          y
        },
        'touch': true,
        'origin': {
          x,
          y
        },
        'locked': false,
        'v': {
          x: 0,
          y: 0
        },
        's': {
          x: 0,
          y: 0
        },
        'd': {
          x: 0,
          y: 0
        },
        'flick': null,
        'last': {
          ts: Date.now(),
          x,
          y
        }
      });
      if (opts.onDown) opts.onDown(refs);
    };
    const shouldCapture = e => {
      if (opts.onCapture) return opts.onCapture(refs, e);
      return true;
    };
    const move = e => {
      if (responderEl && responderEl !== el.current) {
        if (!responderEl.className.includes('scroller')) e.preventDefault();
        return;
      }
      if (refs.pinch) {
        if (e.touches.length === 2) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          refs.pinch.d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
          refs.pinch.ratio = refs.pinch.d / refs.pinch.d0;
        } else {
          delete refs.pinch;
        }
      }
      refs.x = e.touches ? e.touches[0].clientX : e.clientX;
      refs.y = e.touches ? e.touches[0].clientY : e.clientY;
      logVelocity();
      refs.d = {
        'x': refs.x - refs.origin.x,
        'y': refs.y - refs.origin.y
      };
      refs.abs = {
        'x': Math.abs(refs.d.x),
        'y': Math.abs(refs.d.y)
      };
      if (!refs.locked && (refs.abs.y > 10 || refs.abs.x > 10)) {
        // lock scroll direction
        refs.locked = refs.abs.y > refs.abs.x ? 'v' : 'h';
      }
      if (!refs.locked) return e.preventDefault(); // do nothing until locked

      refs.touch = shouldCapture(e);
      if (!refs.touch) return; // Let browser handle touch
      // if (!responderEl) console.log('Capture:', el.current);

      responderEl = el.current; // capture event

      if (refs.locked && opts.onMove) opts.onMove(refs, e);
    };
    const up = () => {
      if (responderEl && responderEl !== el.current) return;
      if (!refs.touch || !refs.locked) return;
      logVelocity();
      refs.s = {
        'x': Math.abs(refs.v.x),
        'y': Math.abs(refs.v.y)
      };
      refs.flick = {
        'x': refs.locked === 'h' && refs.s.x >= FLICK_SPEED && Math.sign(refs.v.x),
        'y': refs.locked === 'v' && refs.s.y >= FLICK_SPEED && Math.sign(refs.v.y)
      };
      if (opts.onUp) opts.onUp(refs);
    };
    return {
      onTouchStart: down,
      onTouchMove: move,
      onTouchEnd: up
    };
  }, [el, height, width, deps]);
  useEffect(() => {
    if (!el.current) return;
    el.current.addEventListener('touchstart', handlers.onTouchStart, listenerOptions);
    el.current.addEventListener('touchmove', handlers.onTouchMove, listenerOptions);
    el.current.addEventListener('touchend', handlers.onTouchEnd, listenerOptions);
    return () => {
      if (!el.current) return;
      el.current.removeEventListener('touchstart', handlers.onTouchStart);
      el.current.removeEventListener('touchmove', handlers.onTouchMove);
      el.current.removeEventListener('touchend', handlers.onTouchEnd);
    };
  }, [handlers, deps]);
  return {
    height,
    width
  };
};

const BottomSheet = /*#__PURE__*/forwardRef(({
  className,
  visible,
  pan,
  children,
  onClose,
  onPress,
  showShade,
  handle
}, ref) => {
  const shadeEl = useRef();
  const sheetEl = useRef();
  const {
    height
  } = usePanGestures(sheetEl, {
    onMove: e => {
      pan.setValue(e.height - Math.max(e.d.y / 100, e.d.y));
    },
    onUp: e => {
      if (e.flick.y === 1 || e.d.y > e.height / 2) {
        close();
      } else {
        pan.spring(e.height);
      }
    }
  });
  const close = () => pan.spring(0).then(onClose);
  useEffect(() => {
    if (!height) return;
    return pan.on(value => {
      sheetEl.current.style.transform = `translateY(-${value}px)`;
      if (shadeEl.current) shadeEl.current.style.opacity = value / height;
    });
  }, [height]);
  useEffect(() => {
    if (!height) return;
    if (visible) {
      // show
      pan.spring(height);
    } else {
      // hide
      pan.spring(0).then(onClose);
    }
  }, [visible, height, onClose]);
  return /*#__PURE__*/React.createElement("div", {
    className: "layer"
  }, visible && showShade ? /*#__PURE__*/React.createElement("div", {
    className: "shade shade-bottom-sheet",
    ref: shadeEl,
    onClick: close
  }) : null, /*#__PURE__*/React.createElement("div", {
    ref: sheetEl,
    className: c('sheet', className),
    onClick: onPress
  }, handle ? /*#__PURE__*/React.createElement("div", {
    className: "handle"
  }) : null, children));
});

const bus = createBus(null);
const pan = new AnimatedValue(0);
const ActionSheet = () => {
  const sheet = useBus(bus);
  const renderOption = (option, i) => {
    const clickOption = e => {
      if (option.onClick) option.onClick();
      if (sheet.callback) sheet.callback(option.value);
      pan.spring(0).then(() => bus.update(0));
    };
    return /*#__PURE__*/React.createElement(TouchableRow, {
      key: i,
      title: option.name,
      leftIcon: option.icon,
      onClick: clickOption,
      disabled: option.disabled,
      target: option.target,
      href: option.href
    });
  };
  if (!sheet) return null;
  return /*#__PURE__*/React.createElement(BottomSheet, {
    pan: pan,
    visible: !!sheet,
    onClose: () => bus.update(null),
    showShade: true
  }, /*#__PURE__*/React.createElement("div", {
    className: "action-sheet-title"
  }, sheet && sheet.title), /*#__PURE__*/React.createElement("hr", null), sheet.options.map(renderOption));
};
const showActionSheet = (title, options, callback) => bus.update({
  title,
  options,
  callback
});

const PullIndicator = /*#__PURE__*/forwardRef(({
  pull
}, ref) => {
  return /*#__PURE__*/React.createElement("div", {
    className: "pull-indicator center",
    ref: ref
  }, /*#__PURE__*/React.createElement(Icon, {
    icon: "refresh",
    color: "#000"
  }));
});

const ScrollView = /*#__PURE__*/forwardRef(({
  children,
  className,
  onRefresh,
  horizontal
}, ref) => {
  const el = ref || useRef();
  const spinnerEl = useRef();
  const refs = useRef({}).current;
  const pull = useAnimatedValue(0);
  usePanGestures(el, {
    onDown: () => {
      refs.canScrollVertical = el.current.scrollHeight > el.current.clientHeight;
      refs.canScrollHorizontal = el.current.scrollWidth > el.current.clientWidth;
      refs.initScrollTop = el.current.scrollTop;
      refs.initScrollLeft = el.current.scrollLeft;
    },
    onCapture: e => {
      if (e.locked === 'v') {
        if (onRefresh && el.current.scrollTop === 0 && e.d.y > 0) return true; // pull to refresh
        if (!refs.canScrollVertical) return false; // not a scroller
        if (refs.initScrollTop === 0 && e.d.y < 0) return true; // beginning to scroll down
        return refs.initScrollTop > 0;
      }
      if (e.locked === 'h') {
        if (!refs.canScrollHorizontal) return false;
        return refs.initScrollLeft > 0;
      }
    },
    onMove: e => {
      if (onRefresh && refs.initScrollTop === 0) pull.setValue(Math.min(70, e.d.y));
    },
    onUp: e => {
      if (onRefresh && refs.initScrollTop === 0) {
        if (e.d.y > 70) {
          pull.spring(0).then(onRefresh);
        } else {
          pull.spring(0);
        }
      }
    }
  });
  useEffect(() => {
    if (!onRefresh) return;
    return pull.on(val => {
      const percent = val / 70;
      spinnerEl.current.style.transform = `translateY(${val}px) rotate(${percent * 360}deg)`;
      spinnerEl.current.style.opacity = percent;
    });
  }, []);
  const scroll = () => {
    navigator.virtualKeyboard?.hide();
    document.activeElement.blur();
  };
  return /*#__PURE__*/React.createElement(Fragment, null, onRefresh ? /*#__PURE__*/React.createElement("div", {
    className: "list-pull"
  }, /*#__PURE__*/React.createElement(PullIndicator, {
    pull: pull,
    ref: spinnerEl
  })) : null, /*#__PURE__*/React.createElement("div", {
    className: c('scroller', className, horizontal ? 'horizontal' : 'vertical'),
    ref: el,
    onScroll: scroll,
    children: children
  }));
});

const alertStore = createBus();
const Alert = ({}) => {
  const data = useBus(alertStore);
  if (!data) return null;
  const {
    title,
    message,
    options,
    callback,
    visible
  } = data;
  const dismiss = () => {
    callback();
    alertStore.update();
  };
  const renderButtons = () => {
    if (options.length === 0) return null;
    const renderButton = (option, i) => {
      const pressButton = e => {
        if (option.onPress) option.onPress();
        callback(option._id || option.value);
        alertStore.update();
      };
      return /*#__PURE__*/React.createElement(Touchable, {
        key: i,
        className: c('alert-button', option.destructive && 'destructive'),
        onClick: pressButton,
        children: option.name,
        disableMenu: true
      });
    };
    return /*#__PURE__*/React.createElement(ScrollView, {
      className: c('alert-buttons', options.length <= 2 && 'alert-buttons-horizontal'),
      children: options.map(renderButton)
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    className: c('layer', 'alert-container', visible && 'visible'),
    onClick: dismiss
  }, /*#__PURE__*/React.createElement("div", {
    className: "alert",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "alert-top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "alert-title"
  }, title), /*#__PURE__*/React.createElement("div", {
    className: "alert-message"
  }, message)), renderButtons()));
};
const showAlert = (title, message, options = [{
  name: 'Close'
}]) => new Promise(resolve => {
  alertStore.update({
    title,
    message,
    options,
    'callback': resolve,
    'visible': true
  });
});

const BreadCrumbs = ({
  path,
  onClickPath
}) => {
  const slugs = path.split('/').filter(Boolean);
  const renderSlug = (slug, i) => /*#__PURE__*/React.createElement(Fragment, {
    key: slug + '_' + i
  }, /*#__PURE__*/React.createElement(Touchable, {
    onClick: () => onClickPath(),
    children: slug
  }), i < slugs.length - 1 ? /*#__PURE__*/React.createElement("span", null, " / ") : null);
  if (slugs.length === 0) return null;
  return /*#__PURE__*/React.createElement(ScrollView, {
    horizontal: true,
    className: "breadcrumbs"
  }, /*#__PURE__*/React.createElement(Icon, {
    icon: "home",
    onClick: () => onClickPath('/')
  }), /*#__PURE__*/React.createElement("span", null, " / "), slugs.map(renderSlug));
};

const Spinner = () => /*#__PURE__*/React.createElement("div", {
  className: "spinner"
});

const Button = ({
  className,
  title,
  onClick,
  onDown,
  icon,
  href,
  tabIndex,
  color,
  textColor,
  disabled,
  width,
  download,
  iconImageUrl,
  loading,
  submit,
  pop
}) => {
  const classes = ['btn'];
  if (className) classes.push(className);
  if (disabled) classes.push('disabled');
  const style = {
    background: color,
    width,
    color: textColor
  };
  const renderInner = () => {
    if (loading) return /*#__PURE__*/React.createElement(Spinner, null);
    return /*#__PURE__*/React.createElement(Fragment, null, iconImageUrl ? /*#__PURE__*/React.createElement("img", {
      src: iconImageUrl,
      alt: title
    }) : null, icon ? /*#__PURE__*/React.createElement(Icon, {
      icon: icon
    }) : null, title ? /*#__PURE__*/React.createElement("span", null, title) : null);
  };
  if (href) return /*#__PURE__*/React.createElement("a", {
    onClick: e => {
      if (download) e.stopPropagation();
    },
    href: href,
    target: href && pop ? '_blank' : null,
    className: classes.join(' '),
    tabIndex: tabIndex,
    style: style,
    children: renderInner()
  });
  return /*#__PURE__*/React.createElement(Touchable, {
    type: submit ? 'submit' : 'button',
    className: classes.join(' '),
    onClick: onClick,
    onTouchStart: onDown,
    tabIndex: tabIndex,
    style: style,
    children: renderInner()
  });
};

const closeImage = {
  'card': 'os:back',
  'modal': 'os:close'
};
const ScreenHeader = ({
  title,
  subtitle,
  presentation,
  onClose,
  headerRight,
  SearchComponent
}) => {
  const pressBack = e => {
    e.stopPropagation();
    e.preventDefault();
    onClose();
  };
  const closeIcon = closeImage[presentation];
  return /*#__PURE__*/React.createElement(Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "header-spacer"
  }, closeIcon && /*#__PURE__*/React.createElement(Touchable, {
    className: "header-close",
    onClick: pressBack,
    children: /*#__PURE__*/React.createElement(Icon, {
      icon: closeIcon
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "header-middle"
  }, /*#__PURE__*/React.createElement("div", {
    className: "header-title"
  }, title), subtitle ? /*#__PURE__*/React.createElement("div", {
    className: "header-subtitle"
  }, subtitle) : null), /*#__PURE__*/React.createElement("div", {
    className: "header-spacer"
  }, headerRight)), SearchComponent);
};

const Placeholder = ({
  className,
  icon,
  title,
  message,
  children
}) => /*#__PURE__*/React.createElement("div", {
  className: c('placeholder', className)
}, icon ? /*#__PURE__*/React.createElement(Icon, {
  icon: icon
}) : null, title ? /*#__PURE__*/React.createElement("div", {
  className: "title"
}, title) : null, message ? /*#__PURE__*/React.createElement("div", {
  className: "placeholder-message"
}, message) : null, children);

const Shade = /*#__PURE__*/forwardRef(({}, ref) => {
  const el = useRef();
  useImperativeHandle(ref, () => ({
    progress: (value, width) => {
      if (el.current) el.current.style.opacity = 1 - value / width;
    }
  }));
  return /*#__PURE__*/React.createElement("div", {
    className: "shade shade-card",
    ref: el
  });
});

const Card = ({
  title,
  subtitle,
  children,
  footer,
  headerRight,
  hasScrollView = true,
  SearchComponent,
  scrollerRef,
  disableGestures,
  onDrop,
  isVisible = true,
  showHeader = true,
  animateIn = true,
  ShadeComponent = Shade
}) => {
  const allowBack = useRef(history.length > 1).current;
  const [dropping, setDropping] = useState(false);
  const shadeEl = useRef();
  const el = useRef();
  const pan = useAnimatedValue(document.body.clientWidth);
  const close = () => pan.spring(width).then(() => {
    if (allowBack) navigation.goBack();
  });
  const {
    width
  } = usePanGestures(el, {
    onCapture: e => {
      if (disableGestures) return;
      return e.locked === 'h' && e.d.x > 0;
    },
    onMove: e => {
      pan.setValue(Math.max(0, e.d.x));
    },
    onUp: e => {
      if (e.flick.x === 1 || e.d.x > e.width / 2) {
        close();
      } else {
        pan.spring(0);
      }
    }
  });

  // Trigger animation on visibility change
  useEffect(() => {
    if (!width) return;
    if (isVisible) {
      pan.spring(0);
    } else {
      pan.spring(width);
    }
  }, [isVisible, width]);
  useEffect(() => {
    return pan.on(value => {
      if (el.current) el.current.style.transform = `translateX(${value}px)`;
      if (shadeEl.current) shadeEl.current.progress(value, width);
    });
  }, [width]);
  const dragOver = e => {
    e.preventDefault();
  };
  const startDrag = e => {
    setDropping(true);
  };
  const cancelDrag = e => {
    setDropping(false);
  };
  const drop = e => {
    setDropping(false);
    onDrop(e);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "layer"
  }, /*#__PURE__*/React.createElement(ShadeComponent, {
    ref: shadeEl
  }), /*#__PURE__*/React.createElement("div", {
    className: "card",
    ref: el,
    onDragOver: onDrop && dragOver,
    onDragEnter: onDrop && startDrag,
    onDragLeave: onDrop && cancelDrag,
    onDrop: onDrop && drop
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    title: title,
    subtitle: subtitle,
    presentation: "card",
    SearchComponent: SearchComponent,
    onClose: close,
    headerRight: headerRight
  }), hasScrollView ? /*#__PURE__*/React.createElement(ScrollView, {
    className: "card-body",
    ref: scrollerRef,
    children: children
  }) : /*#__PURE__*/React.createElement("div", {
    className: "card-body",
    children: children
  }), footer, dropping ? /*#__PURE__*/React.createElement(Placeholder, {
    className: "drop-zone",
    icon: "upload",
    title: "Upload"
  }) : null));
};
Card.defaultProps = {};

const ConnectionIndicator = ({
  status
}) => {
  if (status === 'connected') return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "connection-indicator"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bubble"
  }, /*#__PURE__*/React.createElement(Spinner, null), status));
};

const CornerDialog = ({
  title,
  children,
  isVisible,
  onClose
}) => {
  if (!isVisible) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "corner-dialog"
  }, /*#__PURE__*/React.createElement("div", {
    className: "corner-dialog-title"
  }, title, /*#__PURE__*/React.createElement(Icon, {
    icon: "close",
    onClick: onClose
  })), children);
};

const DashboardIcon = ({
  title,
  icon,
  href
}) => /*#__PURE__*/React.createElement(Touchable, {
  href: href,
  className: "springboard-icon"
}, /*#__PURE__*/React.createElement("div", {
  className: "icon-frame"
}, /*#__PURE__*/React.createElement(Icon, {
  icon: icon
})), /*#__PURE__*/React.createElement("div", null, title));

const Dropdown = ({
  position,
  button,
  content
}) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!visible) return;
    const dismiss = e => {
      const insideDropdown = e.composedPath().some(el => {
        return el.classList && el.classList.contains('dropdown-content');
      });
      // if (debug) console.log('Debug', insideDropdown ? 'Inside' : 'Outside');
      if (!insideDropdown) setVisible(false);
    };
    setTimeout(() => {
      window.addEventListener('click', dismiss, {
        passive: false
      });
    }, 0);
    return () => window.removeEventListener('click', dismiss);
  }, [visible]);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "dropdown"
  }, /*#__PURE__*/React.createElement("div", {
    children: button,
    className: "dropdown-button",
    onClick: () => setVisible(true)
  }), /*#__PURE__*/React.createElement("div", {
    className: c('dropdown-content', position || 'top-right', visible ? 'visible' : 'hidden'),
    children: content
  })));
};

const DropdownItem = ({
  title,
  icon,
  onClick,
  href,
  disabled,
  children,
  active
}) => /*#__PURE__*/React.createElement(TouchableRow, {
  className: "dropdown-item",
  onClick: onClick,
  disabled: disabled,
  active: active,
  children: children,
  href: href,
  leftIcon: icon,
  title: title
});

const FullScreen = ({
  title,
  children,
  footer,
  headerRight,
  SearchComponent
}) => {
  const el = useRef();
  const pan = useAnimatedValue(0);
  const close = () => {
    pan.spring(0).then(() => navigation.goBack());
  };
  useEffect(() => {
    pan.spring(1);
    return pan.on(value => {
      el.current.style.opacity = value;
    });
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    className: "fullscreen",
    ref: el
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    title: title,
    presentation: "full",
    onClose: close,
    headerRight: headerRight,
    SearchComponent: SearchComponent
  }), /*#__PURE__*/React.createElement(ScrollView, {
    className: "card-body"
  }, children), footer);
};

const HeaderButton = ({
  icon,
  title,
  badge,
  loading,
  disabled,
  onClick,
  active,
  href
}) => /*#__PURE__*/React.createElement(Touchable, {
  className: c('header-button center', title === 'Cancel' && 'header-cancel'),
  onClick: onClick,
  loading: loading,
  disabled: disabled,
  active: active,
  href: href
}, icon ? /*#__PURE__*/React.createElement(Icon, {
  icon: icon
}) : null, title ? /*#__PURE__*/React.createElement("span", null, title) : null, badge ? /*#__PURE__*/React.createElement("span", {
  className: "badge"
}, badge) : null);

const Image = ({
  ar,
  url,
  alt,
  className,
  children,
  base64Png
}) => {
  const renderImg = () => {
    if (url) return /*#__PURE__*/React.createElement("img", {
      src: url,
      className: "img-real",
      alt: alt,
      draggable: false
    });
    if (base64Png) return /*#__PURE__*/React.createElement("img", {
      src: `data:image/png;base64,${base64Png}`
    });
    return /*#__PURE__*/React.createElement("div", {
      className: "img-real",
      alt: alt,
      draggable: false
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    className: c('img', className)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: (ar || 1) * 100 + '%'
    }
  }), renderImg(), children ? /*#__PURE__*/React.createElement("div", {
    className: "img-inside"
  }, children) : null);
};

const List = ({
  title,
  items = [],
  keyExtractor = r => r._id,
  renderItem,
  loading,
  className,
  ListEmptyComponent,
  children
}) => {
  const renderList = () => {
    if (loading || !items) return null;
    if (ListEmptyComponent && items.length === 0) return ListEmptyComponent;
    return items.map((item, i) => /*#__PURE__*/React.createElement(Fragment, {
      key: keyExtractor(item)
    }, renderItem(item, i), i < items.length - 1 && /*#__PURE__*/React.createElement("hr", null)));
  };
  const renderChild = (child, i) => /*#__PURE__*/React.createElement(Fragment, {
    key: i
  }, child, i < children.length - 1 && /*#__PURE__*/React.createElement("hr", null));
  return /*#__PURE__*/React.createElement("div", {
    className: c('list', className)
  }, title ? /*#__PURE__*/React.createElement(Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "list-title"
  }, title), /*#__PURE__*/React.createElement("hr", null)) : null, items.length || children ? /*#__PURE__*/React.createElement("div", {
    className: "list-body"
  }, renderList(), Children.map(children, renderChild)) : ListEmptyComponent);
};

const modalState = createBus([]);
const renderModal = modal => /*#__PURE__*/React.createElement("div", {
  key: modal.id,
  className: "absolute",
  children: modal.children
});
const Modal = () => useBus(modalState).map(renderModal);
const showModal = children => modalState.update([...modalState.state, {
  'id': Math.random(),
  'children': children
}]);
const hideModal = () => {
  modalState.update([]);
};

const PercentBar = ({
  percent
}) => /*#__PURE__*/React.createElement("div", {
  className: "percent-bar"
}, /*#__PURE__*/React.createElement("div", {
  className: "percent-bar-inner",
  style: {
    width: `${percent * 100}%`
  }
}));

const state = createBus();
const Toast = () => {
  const message = useBus(state);
  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(() => state.update(null), 2000);
    return () => clearTimeout(timeout);
  }, [message]);
  if (!message) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "toast-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "toast",
    children: message
  }));
};
const toast = state.update;

const PoonOverlays = () => /*#__PURE__*/React.createElement(Fragment, null, /*#__PURE__*/React.createElement(Modal, null), /*#__PURE__*/React.createElement(ActionSheet, null), /*#__PURE__*/React.createElement(Alert, null), /*#__PURE__*/React.createElement(Toast, null));

const ProgressRing = ({
  color = '#fff',
  size = 20,
  percent,
  spinning,
  completedIcon = 'check'
}) => {
  if (spinning || !percent) return /*#__PURE__*/React.createElement(Spinner, null);
  if (percent === 1) return /*#__PURE__*/React.createElement(Icon, {
    icon: completedIcon
  });
  const r = size / 2;
  const ri = r - 1; // inner radius
  const c = ri * 2 * Math.PI; // circumference
  const strokeDashoffset = c - percent * c;
  return /*#__PURE__*/React.createElement("svg", {
    height: size,
    width: size
  }, /*#__PURE__*/React.createElement("circle", {
    stroke: color,
    opacity: .3,
    fill: "transparent",
    strokeWidth: 2,
    r: ri,
    cx: r,
    cy: r
  }), /*#__PURE__*/React.createElement("circle", {
    strokeDasharray: c + ' ' + c,
    style: {
      strokeDashoffset,
      transform: 'rotate(-90deg)',
      transformOrigin: '50% 50%'
    },
    stroke: color,
    fill: "transparent",
    strokeWidth: 2,
    r: ri,
    cx: r,
    cy: r
  }));
};

const SearchInput = ({
  value,
  placeholder,
  onChange,
  loading
}) => /*#__PURE__*/React.createElement("div", {
  className: "search"
}, /*#__PURE__*/React.createElement(Icon, {
  icon: "search"
}), /*#__PURE__*/React.createElement("input", {
  placeholder: placeholder,
  type: "search",
  value: value,
  onChange: e => {
    e.stopPropagation();
    onChange(e.target.value);
  }
}), /*#__PURE__*/React.createElement(Icon, {
  icon: "close",
  onClick: () => onChange(''),
  size: 16
}), loading ? /*#__PURE__*/React.createElement(Spinner, null) : null);

const SegmentedController = ({
  children
}) => /*#__PURE__*/React.createElement("div", {
  className: "segmented",
  children: children
});

const Select = ({
  options,
  value,
  onChangeValue
}) => /*#__PURE__*/React.createElement("select", {
  onChange: e => onChangeValue(e.target.value),
  value: value
}, Object.keys(options).map(key => /*#__PURE__*/React.createElement("option", {
  key: key,
  value: key,
  children: options[key]
})));

const TabularRow = ({
  leftText,
  rightText
}) => /*#__PURE__*/React.createElement("div", {
  className: "tabular-row"
}, /*#__PURE__*/React.createElement("div", {
  className: "tabular-row-left"
}, leftText), /*#__PURE__*/React.createElement("div", {
  className: "tabular-row-right"
}, rightText));

const TextInput = ({
  value,
  type,
  placeholder,
  onChange
}) => /*#__PURE__*/React.createElement("input", {
  placeholder: placeholder,
  className: "text",
  type: type,
  value: value,
  onChange: e => {
    e.stopPropagation();
    onChange(e.target.value);
  }
});

const PagerTabTitle = ({
  title,
  i,
  pan,
  width,
  onPress
}) => {
  const el = useRef();
  useEffect(() => {
    if (!width) return;
    const stop = i * width;
    const tabWidth = width / 3;
    return pan.on(value => {
      const d = Math.min(Math.abs(stop - value), tabWidth);
      el.current.style.opacity = 1.5 - d / tabWidth;
    });
  }, [width]);
  return /*#__PURE__*/React.createElement("div", {
    children: title,
    className: "pager-tabs-title",
    onClick: () => onPress(i),
    ref: el
  });
};
const ViewPager = /*#__PURE__*/forwardRef(({
  titles,
  children,
  vertical
}, ref) => {
  const pan = useAnimatedValue(0);
  const indicatorEl = useRef();
  const scrollerEl = useRef();
  const refs = useRef({}).current;
  useImperativeHandle(ref, () => ({
    scrollToPage: i => {
      if (vertical) {
        pan.spring(i * height);
      } else {
        pan.spring(i * width);
      }
    }
  }));
  const {
    width,
    height
  } = usePanGestures(scrollerEl, {
    onCapture: e => {
      // release control when scrolled to left edge
      if (vertical) {
        if (e.locked === 'v') {
          if (e.d.y < 0) return true;
          return refs.initPan - e.d.y > 0;
        }
      } else {
        if (e.locked === 'h') {
          if (e.d.x < 0) return true;
          return refs.initPan - e.d.x > 0;
        }
      }
    },
    onDown: e => {
      if (vertical) {
        refs.currentPage = Math.round(pan.value / e.height);
        refs.initPan = pan.value;
      } else {
        refs.currentPage = Math.round(pan.value / e.width);
        refs.initPan = pan.value;
      }
    },
    onMove: e => {
      if (vertical) {
        const val = clamp(refs.initPan - e.d.y, 0, e.height * (children.length - 1));
        pan.setValue(val);
      } else {
        const val = clamp(refs.initPan - e.d.x, 0, e.width * (children.length - 1));
        pan.setValue(val);
      }
    },
    onUp: e => {
      if (vertical) {
        if (e.flick.y < 0) {
          // increment page
          pan.spring(height * clamp(refs.currentPage + 1, 0, children.length - 1));
        } else if (e.flick.y > 0) {
          // decrement page
          pan.spring(height * clamp(refs.currentPage - 1, 0, children.length - 1));
        } else {
          const landingPage = clamp(Math.round(pan.value / e.height), 0, children.length - 1);
          pan.spring(landingPage * height);
        }
      } else {
        if (e.flick.x < 0) {
          // increment page
          pan.spring(width * clamp(refs.currentPage + 1, 0, children.length - 1));
        } else if (e.flick.x > 0) {
          // decrement page
          pan.spring(width * clamp(refs.currentPage - 1, 0, children.length - 1));
        } else {
          const landingPage = clamp(Math.round(pan.value / e.width), 0, children.length - 1);
          pan.spring(landingPage * width);
        }
      }
    }
  }, [children]);
  useEffect(() => {
    return pan.on(value => {
      scrollerEl.current.style.transform = `translate${vertical ? 'Y' : 'X'}(-${value}px)`;
      if (indicatorEl.current) indicatorEl.current.style.transform = `translateX(${value / children.length}px)`;
    });
  }, [width]);
  const changeTab = i => {
    pan.spring(i * width);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: c('pager', vertical ? 'vertical' : 'horizontal')
  }, titles ? /*#__PURE__*/React.createElement("div", {
    className: "pager-tabs"
  }, titles.map((title, i) => /*#__PURE__*/React.createElement(PagerTabTitle, {
    key: i,
    title: title,
    pan: pan,
    i: i,
    width: width,
    onPress: changeTab
  })), width ? /*#__PURE__*/React.createElement("div", {
    className: "pager-tabs-indicator",
    ref: indicatorEl,
    style: {
      width: width / titles.length
    }
  }) : null) : null, /*#__PURE__*/React.createElement("div", {
    className: "pager-scroller"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pager-canvas",
    ref: scrollerEl,
    style: {
      transform: vertical ? 'translateX(0px)' : 'translateY(0px)'
    }
  }, React.Children.map(children, (child, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "pager-page",
    children: child
  })))));
});

const Window = /*#__PURE__*/forwardRef(({
  children,
  title,
  search,
  onChangeSearch,
  searchLoading,
  hasScrollView = true,
  headerRight,
  onClose,
  isVisible
}, ref) => {
  const shadeEl = useRef();
  const el = useRef();
  const pan = useAnimatedValue(0);
  const close = () => navigation.goBack(1);
  useImperativeHandle(ref, () => ({
    close
  }));
  const {
    height
  } = usePanGestures(el, {
    onMove: e => {
      pan.setValue(height - Math.max(0, e.d.y));
    },
    onUp: e => {
      if (e.flick.y === 1 || e.d.y > e.height / 2) {
        close();
      } else {
        pan.spring(e.height);
      }
    }
  });
  useEffect(() => {
    if (!height) return;
    if (isVisible) {
      pan.spring(height);
    } else {
      pan.spring(0);
    }
    // return () => pan.setValue(0);
  }, [isVisible, height]);
  useEffect(() => {
    const cards = document.querySelectorAll('.card');
    return pan.on(value => {
      const percent = value / height;
      if (el.current) el.current.style.transform = `translateY(-${value}px)`;
      if (shadeEl.current) {
        shadeEl.current.style.display = value ? 'block' : 'none';
        shadeEl.current.style.opacity = value / height * .8;
      }
      [...cards].forEach(el => {
        el.style.transform = `scale(${1 - .04 * percent})`;
      });
    });
  }, [height]);
  return /*#__PURE__*/React.createElement("div", {
    className: "layer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "window",
    ref: el
  }, /*#__PURE__*/React.createElement("div", {
    className: "window-content"
  }, /*#__PURE__*/React.createElement(ScreenHeader, {
    title: title,
    presentation: "modal",
    onClose: close,
    SearchComponent: onChangeSearch ? /*#__PURE__*/React.createElement("div", {
      className: "header-search"
    }, /*#__PURE__*/React.createElement(TextInput, {
      placeholder: "Search",
      type: "search",
      value: search,
      onChange: onChangeSearch,
      loading: searchLoading
    })) : null,
    headerRight: headerRight
  }), hasScrollView ? /*#__PURE__*/React.createElement(ScrollView, {
    className: "card-body",
    children: children
  }) : /*#__PURE__*/React.createElement("div", {
    className: "card-body",
    children: children
  }))));
});

const vk = navigator.virtualKeyboard;
const useVirtualKeyboard = () => useEffect(() => {
  if (!vk) return;
  vk.overlaysContent = true;
  return () => vk.overlaysContent = false;
}, []);

export { ActionSheet, Alert, AnimatedValue, BottomSheet, BreadCrumbs, Button, Card, ConnectionIndicator, CornerDialog, DashboardIcon, Dropdown, DropdownItem, FLICK_SPEED, FullScreen, HeaderButton, Icon, Image, List, Modal, PercentBar, Placeholder, PoonOverlays, ProgressRing, PullIndicator, ScreenHeader, ScrollView, SearchInput, SegmentedController, Select, Shade, Spinner, TabularRow, TextInput, Toast, Touchable, TouchableRow, ViewPager, Window, bounce, c, clamp, easeOutCubic, hideModal, modalState, showActionSheet, showAlert, showModal, toast, useAnimatedValue, usePanGestures, useSize, useVirtualKeyboard };

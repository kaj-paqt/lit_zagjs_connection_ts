export interface Attrs {
  [key: string]: any;
}

const prevAttrsMap = new WeakMap<HTMLElement, Attrs>();

export function spreadProps(node: HTMLElement, attrs: Attrs): () => void {
  const oldAttrs = prevAttrsMap.get(node) || {};
  const attrKeys = Object.keys(attrs);

  const addEvt = (e: string, f: EventListener) => {
    node.addEventListener(e.toLowerCase(), f);
  };

  const remEvt = (e: string, f: EventListener) => {
    node.removeEventListener(e.toLowerCase(), f);
  };

  const onEvents = (attr: string) =>
    attr.startsWith("on") && typeof attrs[attr] === "function";

  const setup = (attr: string) => {
    const eventName = attr.substring(2).toLowerCase();
    const handler = attrs[attr];
    addEvt(eventName, handler);
  };

  const teardown = (attr: string) => {
    const eventName = attr.substring(2).toLowerCase();
    const handler = oldAttrs[attr];
    remEvt(eventName, handler);
  };

  const apply = (attrName: string) => {
    let value = attrs[attrName];
    const oldValue = oldAttrs[attrName];
    if (value === oldValue) return;

    if (typeof value === "boolean") {
      value = value || undefined;
    }

    if (value != null) {
      node.setAttribute(attrName, value);
    } else {
      node.removeAttribute(attrName);
    }
  };

  // Cleanup removed attributes
  for (const key in oldAttrs) {
    if (attrs[key] == null) {
      node.removeAttribute(key);
    }
  }

  // Remove old event listeners
  const oldEvents = Object.keys(oldAttrs).filter(onEvents);
  oldEvents.forEach(teardown);

  // Add new event listeners and update attributes
  attrKeys.filter(onEvents).forEach(setup);
  attrKeys.filter((key) => !key.startsWith("on")).forEach(apply);

  prevAttrsMap.set(node, attrs);

  return function cleanup() {
    attrKeys.filter(onEvents).forEach(teardown);
  };
}

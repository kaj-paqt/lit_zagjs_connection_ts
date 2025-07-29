import { html, css, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import * as accordion from "@zag-js/accordion";
import { normalizeProps, spreadProps } from "./lib";
import { VanillaMachine } from "./lib";

@customElement("zag-accordion")
export class ZagAccordion extends LitElement {
  static styles = css`
    .accordion-item {
      border: 1px solid #ccc;
      border-radius: 6px;
      margin-bottom: 8px;
      overflow: hidden;
    }

    .accordion-trigger {
      width: 100%;
      background: #f0f0f0;
      border: none;
      padding: 12px;
      font-size: 16px;
      text-align: left;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .accordion-content {
      padding: 12px;
      background: white;
      display: none;
    }

    .accordion-content[data-state="open"] {
      display: block;
    }

    .accordion-indicator {
      transition: transform 0.2s ease;
    }

    .accordion-indicator[data-state="open"] {
      transform: rotate(90deg);
    }
  `;

  @property({ type: Array }) values: string[] = ["a", "b", "c"];
  @property({ type: Array }) labels: string[] = [
    "Accordion A",
    "Accordion B",
    "Accordion C",
  ];

  private machine = new VanillaMachine(accordion.machine, {
    id: "accordion",
    multiple: true,
  });

  private unsubscribe: VoidFunction | null = null;

  @state()
  private api: accordion.Api = {} as accordion.Api;

  connectedCallback() {
    super.connectedCallback();
    this.machine.start();
    this.api = accordion.connect(this.machine.service, normalizeProps);

    this.unsubscribe = this.machine.subscribe(() => {
      this.api = accordion.connect(this.machine.service, normalizeProps);
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.machine.stop();
    this.unsubscribe?.();
  }

  updated() {
    const root = this.renderRoot.querySelector<HTMLElement>(".accordion-root");
    if (!root) return;

    spreadProps(root, this.api.getRootProps());

    this.values.forEach((value) => {
      const item = root.querySelector<HTMLElement>(
        `.accordion-item[data-value="${value}"]`
      );
      const trigger =
        item?.querySelector<HTMLButtonElement>(".accordion-trigger");
      const content = item?.querySelector<HTMLElement>(".accordion-content");
      const indicator = item?.querySelector<HTMLElement>(
        ".accordion-indicator"
      );

      if (!item || !trigger || !content || !indicator) return;

      spreadProps(item, this.api.getItemProps({ value }));
      spreadProps(trigger, this.api.getItemTriggerProps({ value }));
      spreadProps(content, this.api.getItemContentProps({ value }));
      spreadProps(indicator, this.api.getItemIndicatorProps({ value }));
    });
  }

  render() {
    return html`
      <div class="accordion-root">
        ${this.values.map(
          (value, index) => html`
            <div class="accordion-item" data-value=${value}>
              <h3>
                <button class="accordion-trigger">
                  ${this.labels[index]}
                  <span class="accordion-indicator">▶</span>
                </button>
              </h3>
              <div class="accordion-content">
                This is the content for <strong>${value.toUpperCase()}</strong>.
              </div>
            </div>
          `
        )}
      </div>
    `;
  }
}

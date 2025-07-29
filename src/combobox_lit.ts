import { html, css, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import * as combobox from "@zag-js/combobox";
import { matchSorter } from "match-sorter";
import { normalizeProps, spreadProps } from "./lib";
import { VanillaMachine } from "./lib";

const comboboxData = [
  { label: "Zambia", code: "ZA" },
  { label: "Benin", code: "BN" },
  { label: "Canada", code: "CA" },
  { label: "United States", code: "US" },
  { label: "Japan", code: "JP" },
  { label: "Nigeria", code: "NG" },
  { label: "Albania", code: "AL" },
  { label: "Algeria", code: "DZ" },
  { label: "American Samoa", code: "AS" },
  { label: "Andorra", code: "AD" },
  { label: "Angola", code: "AO" },
  { label: "Anguilla", code: "AI" },
  { label: "Antarctica", code: "AQ" },
  { label: "Australia", code: "AU" },
  { label: "Austria", code: "AT" },
  { label: "Azerbaijan", code: "AZ" },
  { label: "Bahamas", code: "BS" },
  { label: "Bahrain", code: "BH" },
  { label: "Madagascar", code: "MG" },
  { label: "Malawi", code: "MW" },
  { label: "Malaysia", code: "MY" },
  { label: "Maldives", code: "MV" },
  { label: "Mali", code: "ML" },
  { label: "Malta", code: "MT" },
  { label: "Togo", code: "TG" },
  { label: "Tokelau", code: "TK" },
  { label: "Tonga", code: "TO" },
  { label: "Trinidad and Tobago", code: "TT" },
  { label: "Tunisia", code: "TN" },
];

@customElement("zag-combobox")
export class ZagCombobox extends LitElement {
  static styles = css`
    .combobox-root {
      position: relative;
      width: 240px;
    }

    .combobox-control {
      display: flex;
      align-items: center;
      border: 1px solid #ccc;
      background: white;
      padding: 6px;
    }

    .combobox-input {
      flex: 1;
      padding: 4px;
      border: none;
      outline: none;
      font-size: 14px;
    }

    .combobox-trigger,
    .combobox-clear-trigger {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      font-size: 14px;
    }

    .combobox-content {
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      border: 1px solid #ccc;
      background: white;
      max-height: 150px;
      overflow-y: auto;
      z-index: 10;
    }

    .combobox-item {
      padding: 8px;
      cursor: pointer;
    }

    .combobox-item[data-highlighted] {
      background: #0070f3;
      color: white;
    }
  `;

  @state() private items = [...comboboxData];

  private machine = new VanillaMachine(combobox.machine, {
    id: "combobox",
    collection: combobox.collection({
      items: comboboxData,
      itemToValue: (item) => item.code,
      itemToString: (item) => item.label,
    }),
    onOpenChange: () => {
      this.items = [...comboboxData];
    },
    onInputValueChange: ({ inputValue }) => {
      const filtered = matchSorter(comboboxData, inputValue, {
        keys: ["label"],
      });
      this.items = filtered.length > 0 ? filtered : [...comboboxData];
    },
  });

  private unsubscribe: VoidFunction | null = null;

  @state() private api: combobox.Api = {} as combobox.Api;

  connectedCallback() {
    super.connectedCallback();
    this.machine.start();
    this.api = combobox.connect(this.machine.service, normalizeProps);
    this.unsubscribe = this.machine.subscribe(() => {
      this.api = combobox.connect(this.machine.service, normalizeProps);
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.machine.stop();
    this.unsubscribe?.();
  }

  updated() {
    const root = this.renderRoot.querySelector<HTMLElement>(".combobox-root")!;
    const input = root.querySelector<HTMLInputElement>(".combobox-input")!;
    const trigger = root.querySelector<HTMLElement>(".combobox-trigger")!;
    const clear = root.querySelector<HTMLElement>(".combobox-clear-trigger")!;
    const content = root.querySelector<HTMLElement>(".combobox-content")!;
    const control = root.querySelector<HTMLElement>(".combobox-control")!;

    spreadProps(root, this.api.getRootProps());
    spreadProps(input, this.api.getInputProps());
    spreadProps(trigger, this.api.getTriggerProps());
    spreadProps(clear, this.api.getClearTriggerProps());
    spreadProps(content, this.api.getContentProps());
    spreadProps(control, this.api.getControlProps());

    input.value = this.api.inputValue;

    root
      .querySelectorAll<HTMLElement>(".combobox-item")
      .forEach((el, index) => {
        const item = this.items[index];
        spreadProps(el, this.api.getItemProps({ item }));
      });
  }

  render() {
    return html`
      <div>
        <div class="combobox-root">
          <div class="combobox-control">
            <input class="combobox-input" />
            <button class="combobox-trigger" aria-label="Toggle dropdown">
              ▾
            </button>
            <button class="combobox-clear-trigger" aria-label="Clear">✕</button>
          </div>
          <div class="combobox-content">
            ${this.items.map(
              (item) => html`<div class="combobox-item">${item.label}</div>`
            )}
          </div>
        </div>
        <button
          onClick=${() => {
            const root =
              this.renderRoot.querySelector<HTMLElement>(".combobox-root")!;
            const input =
              root.querySelector<HTMLInputElement>(".combobox-input")!;
            this.api.clearValue();
            input.value = "";
          }}
        >
          hi
        </button>
      </div>
    `;
  }
}

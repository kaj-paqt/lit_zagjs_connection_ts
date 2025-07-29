import { html, css, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import * as checkbox from "@zag-js/checkbox";
import { normalizeProps, spreadProps } from "./lib";
import { VanillaMachine } from "./lib";

@customElement("zag-checkbox")
export class ZagCheckbox extends LitElement {
  static styles = css`
    .checkbox-control {
      width: 20px;
      height: 20px;
      border: 2px solid #555;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: white;
      transition: background 0.2s, border-color 0.2s;
      position: relative;
    }

    .checkbox-control[data-state="checked"] {
      background: #0070f3;
      border-color: #0070f3;
    }

    .checkbox-control::after {
      content: "";
      width: 10px;
      height: 10px;
      background: white;
      transform: scale(0);
      transition: transform 0.2s;
      border-radius: 2px;
    }

    .checkbox-control[data-state="checked"]::after {
      transform: scale(1);
    }
  `;

  private machine = new VanillaMachine(checkbox.machine, {});
  private unsubscribe: VoidFunction | null = null;

  @state()
  private api: checkbox.Api = {} as checkbox.Api;

  connectedCallback() {
    super.connectedCallback();
    this.machine.start();

    this.api = checkbox.connect(this.machine.service, normalizeProps);

    this.unsubscribe = this.machine.subscribe(() => {
      this.api = checkbox.connect(this.machine.service, normalizeProps);
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.machine.stop();
    this.unsubscribe?.();
  }

  updated() {
    const rootEl =
      this.renderRoot.querySelector<HTMLElement>(".checkbox-root")!;
    const controlEl = rootEl.querySelector<HTMLElement>(".checkbox-control")!;
    const labelEl = rootEl.querySelector<HTMLElement>(".checkbox-label")!;
    const inputEl = rootEl.querySelector<HTMLInputElement>(".checkbox-input")!;

    spreadProps(rootEl, this.api.getRootProps());
    spreadProps(controlEl, this.api.getControlProps());
    spreadProps(labelEl, this.api.getLabelProps());
    spreadProps(inputEl, this.api.getHiddenInputProps());
  }

  render() {
    return html`
      <label class="checkbox-root">
        <span class="checkbox-control"></span>
        <span class="checkbox-label">Label</span>
        <input class="checkbox-input" />
      </label>
    `;
  }
}

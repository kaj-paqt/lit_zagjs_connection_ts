import { html, css, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import * as popover from "@zag-js/popover";
import { normalizeProps, spreadProps } from "./lib";
import { VanillaMachine } from "./lib";

@customElement("zag-popover")
export class ZagPopover extends LitElement {
  static styles = css`
    .popover-trigger {
      position: relative;
      padding: 8px 12px;
      background: #0070f3;
      color: white;
      border: none;
      cursor: pointer;
      border-radius: 4px;
    }

    .popover-content {
      background: white;
      border: 1px solid #ccc;
      border-radius: 6px;
      padding: 16px;
      width: 250px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .popover-arrow {
      position: absolute;
      width: 16px;
      height: 8px;
      top: -8px;
      left: 16px;
      overflow: hidden;
    }

    .popover-arrow-tip {
      width: 16px;
      height: 16px;
      background: white;
      transform: rotate(45deg);
      position: absolute;
      top: 0;
      left: 0;
      box-shadow: -1px -1px 1px rgba(0, 0, 0, 0.1);
    }

    .popover-title {
      font-weight: bold;
      margin-bottom: 8px;
    }

    .popover-description {
      margin-bottom: 12px;
      font-size: 14px;
      color: #555;
    }
  `;

  private machine = new VanillaMachine(popover.machine, {
    id: "popover",
    positioning: {
      placement: "right",
    },
  });

  private unsubscribe: VoidFunction | null = null;

  @state()
  private api: popover.Api = {} as popover.Api;

  connectedCallback() {
    super.connectedCallback();
    this.machine.start();
    this.api = popover.connect(this.machine.service, normalizeProps);
    this.unsubscribe = this.machine.subscribe(() => {
      this.api = popover.connect(this.machine.service, normalizeProps);
      this.requestUpdate();
    });
  }

  createRenderRoot() {
    return this;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.machine.stop();
    this.unsubscribe?.();
  }

  updated() {
    const trigger =
      this.renderRoot.querySelector<HTMLElement>(".popover-trigger")!;
    const content =
      this.renderRoot.querySelector<HTMLElement>(".popover-content")!;
    const positioner = this.renderRoot.querySelector<HTMLElement>(
      ".popover-positioner"
    )!;

    spreadProps(trigger, this.api.getTriggerProps());
    spreadProps(content, this.api.getContentProps());
    spreadProps(positioner, this.api.getPositionerProps());
  }

  render() {
    return html`
      <div class="popover-root">
        <button class="popover-trigger">Click me</button>
        <div class="popover-positioner">
          <div class="popover-content">
            <div class="popover-arrow">
              <div class="popover-arrow-tip"></div>
            </div>
            <div>
              <div class="popover-title"><b>About Tabs</b></div>
              <div class="popover-description">
                Tabs are used to organize and group content into sections that
                the user can navigate between.
              </div>
              <button>Action Button</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

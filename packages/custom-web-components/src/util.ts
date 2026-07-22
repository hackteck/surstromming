import { defineCustomElement, type DefineComponent } from 'vue'

// The app's global reset.scss can't reach inside a shadow root, so the inner
// controls fall back to user-agent styling (grey buttonface, Arial, native
// chrome). Seed each shadow root with the same reset the app uses — `?inline`
// hands it over as a string instead of injecting it, and reset.scss carries no
// @font-face (that's in main.ts), so it's safe to duplicate per element. The
// component's own styles follow and override where they set things.
import shadowReset from '@surstromming/design/reset.scss?inline'

type AnyComponent = DefineComponent<any, any, any> & { styles?: string[] }

// Cast the spread back: it loses the DefineComponent shape, so overload
// resolution otherwise falls through to the constructor signature and fails.
function withShadowReset(component: AnyComponent): AnyComponent {
  return {
    ...component,
    styles: [
      shadowReset,
      ...(component.styles ?? [])
    ]
  } as AnyComponent
}

// Wrap an SFC as a shadow-DOM custom element. VueElement extends HTMLElement at
// runtime, but TS loses that through defineCustomElement's generic return.
export function defineElement(component: AnyComponent): CustomElementConstructor {
  return defineCustomElement(withShadowReset(component), { shadowRoot: true }) as unknown as CustomElementConstructor
}

type FormHost = HTMLElement & { modelValue?: unknown; connectedCallback(): void }

// A form control's native input sits inside the shadow root, where the page
// can't reach it: an outer <form>'s FormData skips it, a <label for> can't
// focus it, and `el.value` consumers have nothing to read — including Vue's
// v-model, which on a custom element tag compiles to the native text-input
// contract (reads/writes `el.value`, listens for the composed `input` event).
// Bridge all three: ElementInternals form association fed by the component's
// update:modelValue emits, a host-side `value` accessor, and delegated focus.
export function defineFormElement(component: AnyComponent): CustomElementConstructor {
  const Base = defineCustomElement(withShadowReset(component), {
    shadowRoot: true,
    shadowRootOptions: { delegatesFocus: true },
  }) as unknown as { new (): FormHost }

  return class extends Base {
    static formAssociated = true

    #internals = this.attachInternals()
    #value = ''

    constructor() {
      super()
      this.addEventListener('update:modelValue', (event) => {
        this.#sync((event as CustomEvent).detail[0])
      })
    }

    connectedCallback() {
      // A `value` assigned before the tag was defined (Vue's v-model mounted
      // hook runs before a consumer's define()) lands as an own data property
      // that shadows this class's accessor forever — the classic custom-element
      // upgrade dance deletes it and replays it through the setter.
      const preUpgrade = Object.getOwnPropertyDescriptor(this, 'value')
      if (preUpgrade) {
        delete (this as Record<'value', unknown>).value
        this.value = preUpgrade.value == null ? '' : String(preUpgrade.value)
      }
      super.connectedCallback()
      // A value set before connection (model-value attribute, pre-upgrade
      // property) must reach the form without waiting for a keystroke.
      if (this.modelValue != null) this.#sync(this.modelValue)
    }

    #sync(value: unknown) {
      this.#value = value == null ? '' : String(value)
      this.#internals.setFormValue(this.#value)
    }

    get value(): string {
      return this.#value
    }

    set value(value: string) {
      this.modelValue = value
      this.#sync(value)
    }

    formResetCallback() {
      this.value = ''
    }
  }
}

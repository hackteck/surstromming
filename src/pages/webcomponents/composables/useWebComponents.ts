import { onMounted } from "vue";
import { defineElement, defineFormElement } from "@surstromming/custom-web-components/util";
import * as webcmp from "@surstromming/custom-web-components";

// Form controls need the form-associated wrapper; everything else is plain.
const formControls = new Set([
    "Input",
]);

export function useWebComponents(prefix: string = "ss") {
    onMounted(() => {
        for (const [name, component] of Object.entries(webcmp)) {
            const componentTag = [prefix, name.toLowerCase()].join('-');
            const define = formControls.has(name) ? defineFormElement : defineElement;
            if (!customElements.get(componentTag)) {
                customElements.define(componentTag, define(component));
            }
        }
    });
}

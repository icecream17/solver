import {
  init,
  classModule,
  propsModule,
  styleModule,
  datasetModule,
  attributesModule,
  eventListenersModule,
  jsx,
} from "snabbdom";

// import * as wasm from "wasm-solver";
// wasm.greet();

const patch = init([
  // Init patch function with chosen modules
  classModule, // makes it easy to toggle classes
  propsModule, // for setting properties on DOM elements
  styleModule, // handles styling on elements with support for animations
  datasetModule, // for setting data attributes on DOM elements
  attributesModule, // for setting attributes on DOM elements
  eventListenersModule, // attaches event listeners
]);

const container = document.getElementById("container")!;

patch(container, <h1>Hello, Snabbdom!</h1>);

// 1. Create a header like Rust book: menu, theme, search, title, github

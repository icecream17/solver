mod utils;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, solver!");
}

#[wasm_bindgen]
pub fn init() {
    // Initialize the panic hook for better error messages
    utils::set_panic_hook();
}

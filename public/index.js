"use strict";
/**
 * Elements
 */
const form = document.getElementById("sj-form");
const address = document.getElementById("sj-address");
const error = document.getElementById("sj-error");
const errorCode = document.getElementById("sj-error-code");
const engineSelector = document.getElementById("engine-selector");


/**
 * Scramjet setup
 */
const { ScramjetController } = $scramjetLoadController();


const scramjet = new ScramjetController({
    files: {
        wasm: "/scram/scramjet.wasm.wasm",
        all: "/scram/scramjet.all.js",
        sync: "/scram/scramjet.sync.js",
    },
});


scramjet.init();


/**
 * BareMux connection
 */
const connection = new BareMux.BareMuxConnection("/baremux/worker.js");


/**
 * Form submit
 */
form.addEventListener("submit", async (event) => {
    event.preventDefault();


    try {
        await registerSW();
    } catch (err) {
        error.textContent = "Service worker failed to register.";
        errorCode.textContent = err.toString();
        return;
    }


    const query = address.value.trim();
    if (!query) return;


    const engine = engineSelector.value;
    const url = search(query, engine);


    try {
        const wispUrl =
            (location.protocol === "https:" ? "wss" : "ws") +
            "://" +
            location.host +
            "/wisp/";


        const current = await connection.getTransport();


        if (current !== "/libcurl/index.mjs") {
            await connection.setTransport("/libcurl/index.mjs", [
                { websocket: wispUrl },
            ]);
        }


        const frame = scramjet.createFrame();
        frame.frame.id = "sj-frame";
        document.body.appendChild(frame.frame);


        frame.go(url);
    } catch (err) {
        error.textContent = "Failed to load page.";
        errorCode.textContent = err.toString();
    }
});


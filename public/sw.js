importScripts("/scram/scramjet.all.js");

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

async function handleRequest(event) {
    await scramjet.loadConfig();

    const url = new URL(event.request.url);
    const host = url.hostname.toLowerCase();

    const blocked = [
        "geforcenow.com",
        "nvidia.com",
        "cloudgaming",
        "gfn"
    ];

    if (blocked.some(d => host.includes(d))) {
        return new Response("Blocked for bandwidth protection", { status: 403 });
    }

    if (scramjet.route(event)) {
        return scramjet.fetch(event);
    }

    return fetch(event.request);
}



self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);
    const host = url.hostname.toLowerCase();

    const blocked = [
        "geforcenow.com",
        "nvidia.com",
        "cloudgaming",
        "gfn"
    ];

    const isBlocked = blocked.some(domain => host.includes(domain));

    if (isBlocked) {
        event.respondWith(
            new Response("Blocked by proxy policy", {
                status: 403,
                headers: { "Content-Type": "text/plain" }
            })
        );
        return;
    }

    event.respondWith(handleRequest(event));
});
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outputDir = path.resolve("assets/showcase");
await mkdir(outputDir, { recursive: true });

const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--no-first-run",
  "--remote-debugging-port=9333",
  `--user-data-dir=${path.resolve(".capture-profile")}`,
  "about:blank",
], { stdio: "ignore", windowsHide: true });

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
for (let tries = 0; tries < 40; tries += 1) {
  try {
    await fetch("http://127.0.0.1:9333/json/version");
    break;
  } catch {
    await wait(250);
  }
}

const target = await fetch("http://127.0.0.1:9333/json/new?about:blank", { method: "PUT" }).then((response) => response.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let nextId = 1;
const pending = new Map();
socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  }
});

function command(method, params = {}) {
  const id = nextId++;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

await command("Page.enable");
await command("Runtime.enable");
await command("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  deviceScaleFactor: 1.5,
  mobile: true,
});

async function navigate(url) {
  await command("Page.navigate", { url });
  await wait(3500);
}

async function evaluate(expression) {
  await command("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  await wait(1200);
}

async function screenshot(filename) {
  const { data } = await command("Page.captureScreenshot", { format: "png", fromSurface: true });
  await writeFile(path.join(outputDir, filename), Buffer.from(data, "base64"));
}

await navigate("http://127.0.0.1:4197/itala/");
await evaluate("closeModal(); document.querySelector('.shell')?.classList.remove('profileLocked'); go('today');");
await screenshot("itala-today.png");
await evaluate("go('journey');");
await screenshot("itala-journey.png");
await evaluate("go('reminders');");
await screenshot("itala-reminders.png");

await navigate("https://tarangeeta.com/");
await screenshot("tarangeeta-home.png");
await navigate("https://tarangeeta.com/products/");
await screenshot("tarangeeta-products.png");
await command("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 520,
  deviceScaleFactor: 1.5,
  mobile: true,
});
await wait(800);
await screenshot("tarangeeta-feature.png");
await evaluate("window.scrollTo({ top: 1180, behavior: 'instant' });");
await screenshot("tarangeeta-collection.png");

await command("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});
await navigate("https://tarangeeta.com/");
await screenshot("tarangeeta-desktop.png");
await navigate("https://tarangeeta.com/products/");
await screenshot("tarangeeta-products-desktop.png");
await evaluate("window.scrollTo({ top: 760, behavior: 'instant' });");
await screenshot("tarangeeta-collection-desktop.png");

socket.close();
chrome.kill();

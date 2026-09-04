import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
for (const variant of ['alert', 'confirm', 'media', 'preview']) {
  assert.ok(html.includes(`id="${variant}-dialog"`));
  assert.ok(html.includes(`data-dialog-open="${variant}-dialog"`));
}
class Dialog {
  dataset = { dialogResult: 'result', dialogConfirmed: 'confirmed', dialogCancelled: 'cancelled' };
  open = false;
  returnValue = '';
  listeners = [];
  addEventListener(type, callback) { if (type === 'close') this.listeners.push(callback); }
  showModal() { this.open = true; }
  close(value) {
    if (value !== undefined) this.returnValue = value;
    this.open = false;
    this.listeners.splice(0).forEach(callback => callback());
  }
  querySelectorAll() { return [{ pause() { paused++; } }]; }
}
let focused = 0;
let paused = 0;
const dialog = new Dialog();
const result = {};
const trigger = {
  dataset: { dialogOpen: 'dialog' }, isConnected: true,
  addEventListener(type, callback) { this.click = callback; },
  focus() { focused++; }
};
const close = {
  dataset: {}, addEventListener(type, callback) { this.click = callback; },
  closest() { return dialog; }
};
const document = {
  getElementById(id) { return id === 'dialog' ? dialog : result; },
  querySelectorAll(selector) { return selector === '[data-dialog-open]' ? [trigger] : [close]; }
};
const functionSource = source.slice(source.indexOf('function initDSDialogs('), source.indexOf('\ninitDSTabs();', source.indexOf('function initDSDialogs(')));
vm.runInNewContext(`${functionSource}\ninitDSDialogs();\ninitDSDialogs();`, { document, HTMLDialogElement: Dialog });
trigger.click();
assert.equal(dialog.open, true);
dialog.close('confirm');
assert.equal(result.textContent, 'confirmed');
trigger.click();
assert.equal(dialog.returnValue, '');
dialog.close(); // Native Escape closes without a new return value.
assert.equal(result.textContent, 'cancelled');
trigger.click();
close.click();
assert.equal(dialog.returnValue, 'cancel');
assert.equal(focused, 3);
assert.equal(paused, 3);
console.log('✓ Four modal variants; confirmation, cancellation, reopening, focus restoration and media pause');

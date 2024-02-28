# KikeyJS

KikeyJS is an easy-to-use shortcut library designed for simple event handling, supporting key sequences and shortcut recording.

For an interactive introduction, visit the KikeyJS homepage: https://fobshippingpoint.github.io/kikey/.

## Installation

To integrate KikeyJS into your project, add the following snippet to your HTML header:

```html
<script src="https://raw.githubusercontent.com/FOBshippingpoint/kikey/master/dist/kikey.js"></script>
```

## Usage

KikeyJS provides a very simple API for key binding, event handling, and recording:
```js
const kikey = Kikey();

// Key registration
const notice = () => alert("You pressed Ctrl+S");
kikey.on("C-s", notice);
// Unregistration
kikey.off(notice);

// Supports key sequences (chains)
kikey.on("A-l l f o r o n e", () => console.log("You pressed Alt+L → L → F → O → R → O → N → E"));

// Key sequence recording
kikey.startRecord();
// ...user presses key strokes...
// Stop recording and obtain the key binding sequence string for user customization
const sequence = kikey.stopRecord();
```

## API

### KiKey

> Kikey(targetElement)

Creates a KikeyJS object that listens for keypress and keyup events on the specified `targetElement`. If no element is provided, it defaults to `document`.

### on

> on(sequence: string, callback: function)

Binds a key sequence to a specified callback function. When the sequence is pressed in the correct order, the callback function is triggered.
- `sequence`: The key sequence, which can be **a single key**, **a combination of keys with modifiers** like Ctrl, Shift, Alt, Meta concatenated with a dash (`-`), or **a series of key bindings** separated by whitespace.
- `callback`: The callback function, which does not receive any arguments.

> on(sequence: string, onComplete: function, onComboChange: function(level))

- `onComplete`: Fired when the **entire sequence** is pressed correctly.
- `onComboChange` (optional): A callback function for a series of key bindings. When a keyboard event is fired, `onComboChange` notifies the client of the current `combo` of the key sequence. `combo=0` indicates that the combo has been broken.

### off

> off(callback: function)

Remove binding for certain callback function.

### enable
### disable
Enable or disable the library.

### startRecord
### stopRecord
Start or stop key sequence recording.

### Modifiers Usage

| Original Key | Notation |
|--------------|----------|
| Ctrl         | C        |
| Shift        | S        |
| Alt          | A        |
| Meta         | M        |

KikeyJS supports modifiers. Use a dash (`-`) to concatenate strokes to form a single key binding. For example, `C` and `S-o` are both key bindings, as is `C-S-A-M-p`.

### Special Keys

Keys with a character length greater than 1 are classified as *Special Keys*. This includes `space` and `dash`, which are used as key sequence delimiters.

```js
const SPECIAL_KEYS = new Set([
  "space",
  "dash",
  "arrowleft",
  "arrowright",
  "arrowup",
  "arrowdown",
  "backspace",
  "enter",
  "escape",
  "capslock",
  "tab",
  "home",
  "pageup",
  "pagedown",
  "end",
  "f1",
  "f2",
  "f3",
  "f4",
  "f5",
  "f6",
  "f7",
  "f8",
  "f9",
  "f10",
  "f11",
  "f12",
]);
```

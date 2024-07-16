import { type KeyBinding, makeBinding } from "./makeBinding";

/**
 * Represents a registry of key bindings.
 * @internal
 */
interface KeyBindingRegistry {
	bindings: KeyBinding[];
	combo: number;
	onComboChange: (combo: number) => void;
}

/**
 * The Kikey instance interface for managing keyboard shortcuts.
 * @public
 */
export interface Kikey {
	/**
	 * Registers a callback for a specified key sequence.
	 *
	 * @param sequence - The key sequence (e.g., "C-s a" for Ctrl+S followed by "a").
	 * @param callback - The function to be called when the key sequence is detected.
	 * @param onComboChange - The function to be called when the key sequence progresses.
	 *
	 * @example
	 * ```typescript
	 * kikey.on("C-s a", () => {
	 *   console.log("Pressed Ctrl+S, then 'a'");
	 * }, (combo) => {
	 *   console.log(`Combo progress: ${combo}`);
	 * });
	 * ```
	 */
	on(
		sequence: string,
		callback?: () => void,
		onComboChange?: (combo: number) => void,
	): void;

	/**
	 * Unregister a callback.
	 *
	 * @param callback - The callback function to remove.
	 *
	 * @example
	 * ```typescript
	 * const notice = () => alert("You pressed Ctrl+S");
	 * kikey.on("C-s", notice);
	 * kikey.off(notice);
	 * ```
	 */
	off(callback: () => void): void;

	/**
	 * Enables the Kikey instance to start listening for keyboard events.
	 */
	enable(): void;

	/**
	 * Disables the Kikey instance from listening to keyboard events.
	 */
	disable(): void;

	/**
	 * Starts recording keyboard events.
	 *
	 * @example
	 * ```typescript
	 * kikey.startRecord();
	 * // User presses key strokes...
	 * const sequence = kikey.stopRecord();
	 * console.log(`Recorded sequence: ${sequence}`);
	 * ```
	 */
	startRecord(): void;

	/**
	 * Stops recording keyboard events and returns the recorded key sequence.
	 *
	 * @returns The recorded key sequence.
	 *
	 * @example
	 * ```typescript
	 * kikey.startRecord();
	 * // User presses key strokes...
	 * const sequence = kikey.stopRecord();
	 * console.log(`Recorded sequence: ${sequence}`);
	 * ```
	 */
	stopRecord(): string;
}

/**
 * Creates a KikeyJS object that listens for keypress and keyup events on the specified `targetElement`.
 * If no element is provided, it defaults to `document`.
 *
 * @param targetElement - The target element to listen for keyboard events. Defaults to the entire document if not specified.
 * @returns An instance of Kikey with methods to manage keyboard shortcuts.
 * @throws Throws an error if the environment is not a browser.
 *
 * @example
 * ```typescript
 * import Kikey from "kikey";
 *
 * const kikey = Kikey();
 * kikey.on("C-s", () => alert("You pressed Ctrl+S"));
 * ```
 *
 * @public
 */
export function createKikey(targetElement?: HTMLElement | Document): Kikey {
	if (typeof document === "undefined") {
		throw Error("Only support browser environment.");
	}
	const target = targetElement ?? document;

	const registry = new Map<() => void, KeyBindingRegistry>();

	let prevKey = "";
	let prevMod = "";
	let isEnabled = true;

	function isModifierKey(key: string): boolean {
		return ["control", "shift", "alt", "meta"].includes(key.toLowerCase());
	}

	function handleKeyEvent(e: KeyboardEvent): void {
		if (!isEnabled) return;

		if (e.type === "keyup" && !isModifierKey(e.key)) {
			prevKey = e.key.toLowerCase();
		} else if (e.type === "keydown") {
			const { ctrlKey, shiftKey, altKey, metaKey } = e;
			const key = e.key.toLowerCase();

			for (const [callback, binding] of registry.entries()) {
				const { onComboChange, combo, bindings } = binding;
				const b = bindings[combo];
				if (
					b.ctrlKey === ctrlKey &&
					b.shiftKey === shiftKey &&
					b.altKey === altKey &&
					b.metaKey === metaKey &&
					b.key === key &&
					(combo === 0 ||
						bindings[combo - 1].key === prevKey ||
						bindings[combo - 1].key === prevMod)
				) {
					binding.combo++;
					onComboChange instanceof Function && onComboChange(binding.combo);
					if (binding.combo === bindings.length) {
						callback();
						binding.combo = 0;
					}
				} else {
					// Reset binding combo to zero because it breaks the order.
					onComboChange(combo);
					binding.combo = 0;
				}
			}

			if (isModifierKey(e.key)) {
				prevMod = e.key;
			}
		}
	}

	target.addEventListener("keydown", handleKeyEvent as (e: Event) => void);
	target.addEventListener("keyup", handleKeyEvent as (e: Event) => void);

	/** Event record */
	let record: KeyboardEvent[] = [];
	/** Event handler for key sequence recording. */
	const pushEvent = (e: KeyboardEvent) => {
		record.push(e);
	};

	return {
		on(
			sequence: string,
			callback: () => void = () => {},
			onComboChange: (combo: number) => void = () => {},
		): void {
			// split by whitespace and remove empty characters
			const bindings = sequence
				.split(" ")
				.filter((v) => v !== "")
				.map(makeBinding);
			registry.set(callback, {
				bindings,
				combo: 0,
				onComboChange,
			});
		},
		off(callback: () => void): void {
			registry.delete(callback);
		},
		enable(): void {
			isEnabled = true;
		},
		disable(): void {
			isEnabled = false;
		},
		startRecord(): void {
			target.addEventListener("keydown", pushEvent as (e: Event) => void);
			target.addEventListener("keyup", pushEvent as (e: Event) => void);
		},
		stopRecord(): string {
			// Clean up
			target.removeEventListener("keydown", pushEvent as (e: Event) => void);
			target.removeEventListener("keyup", pushEvent as (e: Event) => void);

			const sequence: string[] = [];
			let slow = 0;
			let fast = 1;
			while (slow < record.length) {
				const slowKey = record[slow];
				if (slowKey.type === "keydown" && record.at(fast)?.type === "keyup") {
					let b = slowKey.ctrlKey ? "C" : "";
					b += slowKey.shiftKey ? "S" : "";
					b += slowKey.altKey ? "A" : "";
					b += slowKey.metaKey ? "M" : "";
					b = b.split("").join("-");

					let key = slowKey.key.toLowerCase();

					if (key === " ") {
						key = "space";
					} else if (key === "-") {
						key = "dash";
					} else if (isModifierKey(key)) {
						key = "";
					}
					if (b.length > 0 && key) {
						// Combination
						b += `-${key}`;
					} else if (b.length === 0) {
						// Single key
						b = key;
					}
					sequence.push(b);
				}
				slow++;
				fast++;
			}
			record = [];
			return sequence.join(" ");
		},
	};
}

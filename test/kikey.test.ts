import { describe, expect, test, vi } from "vitest";
import { SPECIAL_KEYS } from "../src/constants";
import { createKikey } from "../src/kikey";

interface KeyOpts {
	c?: boolean;
	s?: boolean;
	a?: boolean;
	m?: boolean;
	k: string;
}

describe("kikey", () => {
	// helper
	function fire(
		type: string,
		{ c = false, s = false, a = false, m = false, k }: KeyOpts,
	): void {
		document.dispatchEvent(
			new KeyboardEvent(type, {
				ctrlKey: c,
				shiftKey: s,
				altKey: a,
				metaKey: m,
				key: k,
			}),
		);
	}
	function keydown(...args: [KeyOpts]): void {
		fire("keydown", ...args);
	}
	function keyup(...args: [KeyOpts]): void {
		fire("keyup", ...args);
	}

	const k = createKikey();
	let callback: () => void;
	describe("single binding", () => {
		test("simple", () => {
			callback = vi.fn();
			k.on("C-s", callback);
			keydown({ c: true, k: "s" });
			expect(callback).toHaveBeenCalled();
			k.off(callback);
			keydown({ c: true, k: "s" });
			expect(callback).toHaveBeenCalledOnce();
		});
		test("symbol", () => {
			callback = vi.fn();
			k.on("`", callback);
			keydown({ k: "`" });
			expect(callback).toHaveBeenCalled();

			callback = vi.fn();
			k.on("space", callback);
			keydown({ k: " " });
			expect(callback).toHaveBeenCalled();
		});
		describe("special keys", () => {
			for (const special of SPECIAL_KEYS) {
				test(special, () => {
					callback = vi.fn();
					k.on(special, callback);
					if (special === "space") {
						keydown({ k: " " });
					} else if (special === "dash") {
						keydown({ k: "-" });
					} else {
						keydown({ k: special });
					}
					expect(callback).toHaveBeenCalled();
				});
			}
		});
	});
	test("single modifier only binding", () => {
		callback = vi.fn();
		k.on("A", callback);
		keydown({ a: true, k: "alt" });
		expect(callback).toHaveBeenCalled();
	});
	test("double bindings", () => {
		callback = vi.fn();
		k.on("S-A-s a", callback);
		keydown({ s: true, a: true, k: "s" });
		keyup({ k: "s" });
		expect(callback).not.toHaveBeenCalled();
		keydown({ k: "a" });
		expect(callback).toHaveBeenCalled();

		callback = vi.fn();
		k.on("C a", callback);
		keydown({ c: true, k: "control" });
		keyup({ k: "control" });
		expect(callback).not.toHaveBeenCalled();
		keydown({ k: "a" });
		expect(callback).toHaveBeenCalled();

		callback = vi.fn();
		k.on("S S", callback);
		keydown({ s: true, k: "shift" });
		keyup({ k: "shift" });
		expect(callback).not.toHaveBeenCalled();
		keydown({ s: true, k: "shift" });
		expect(callback).toHaveBeenCalled();
	});
	test("triple bindings", () => {
		callback = vi.fn();
		k.on("a b c", callback);
		keydown({ k: "a" });
		keyup({ k: "a" });
		keydown({ k: "b" });
		keyup({ k: "b" });
		keydown({ k: "c" });
		keyup({ k: "c" });
		expect(callback).toHaveBeenCalled();

		callback = vi.fn();
		k.on("a b c", callback);
		keydown({ k: "a" });
		keydown({ k: "b" });
		keydown({ k: "c" });
		expect(callback).not.toHaveBeenCalled();
	});

	test("once", () => {
		callback = vi.fn();
		k.once("a", callback);
		keydown({ k: "a" });
		keydown({ k: "a" });
		expect(callback).toHaveBeenCalledOnce();
	});

	test("exception on client callback", () => {
		k.on("a b", () => {
			throw new Error("client error");
		});
		expect(() => {
			keydown({ k: "a" });
			keyup({ k: "a" });
			keydown({ k: "b" });
		}).toThrowError("client error");
		expect(() => {
			keydown({ k: "a" });
			keyup({ k: "a" });
			keydown({ k: "b" });
		}).toThrowError("client error");
	});
});

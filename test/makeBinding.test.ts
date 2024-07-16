import { describe, expect, test } from "vitest";
import { makeBinding } from "../src/makeBinding";

describe("makeBinding", () => {
	test("pass illegal sequence", () => {
		expect(() => makeBinding("")).toThrow();
		expect(() => makeBinding("A--")).toThrow();
		expect(() => makeBinding("--")).toThrow();
	});
	test("pass legal sequence", () => {
		expect(makeBinding("C-s")).toEqual({
			ctrlKey: true,
			shiftKey: false,
			altKey: false,
			metaKey: false,
			key: "s",
		});
		expect(makeBinding("C-S-s")).toEqual({
			ctrlKey: true,
			shiftKey: true,
			altKey: false,
			metaKey: false,
			key: "s",
		});
		expect(makeBinding("space")).toEqual({
			ctrlKey: false,
			shiftKey: false,
			altKey: false,
			metaKey: false,
			key: " ",
		});
		expect(makeBinding("dash")).toEqual({
			ctrlKey: false,
			shiftKey: false,
			altKey: false,
			metaKey: false,
			key: "-",
		});
		expect(makeBinding("A-M-dash")).toEqual({
			ctrlKey: false,
			shiftKey: false,
			altKey: true,
			metaKey: true,
			key: "-",
		});
		expect(makeBinding("escape")).toEqual({
			ctrlKey: false,
			shiftKey: false,
			altKey: false,
			metaKey: false,
			key: "escape",
		});
	});
});

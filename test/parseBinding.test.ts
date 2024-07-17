import { describe, expect, test } from "vitest";
import { parseBinding } from "../src/parseBinding";

describe("parseBinding", () => {
	test("pass illegal sequence", () => {
		expect(() => parseBinding("")).toThrow();
		expect(() => parseBinding("A--")).toThrow();
		expect(() => parseBinding("--")).toThrow();
	});
	test("pass legal sequence", () => {
		expect(parseBinding("C-s")).toEqual({
			ctrlKey: true,
			shiftKey: false,
			altKey: false,
			metaKey: false,
			key: "s",
		});
		expect(parseBinding("C-S-s")).toEqual({
			ctrlKey: true,
			shiftKey: true,
			altKey: false,
			metaKey: false,
			key: "s",
		});
		expect(parseBinding("space")).toEqual({
			ctrlKey: false,
			shiftKey: false,
			altKey: false,
			metaKey: false,
			key: " ",
		});
		expect(parseBinding("dash")).toEqual({
			ctrlKey: false,
			shiftKey: false,
			altKey: false,
			metaKey: false,
			key: "-",
		});
		expect(parseBinding("A-M-dash")).toEqual({
			ctrlKey: false,
			shiftKey: false,
			altKey: true,
			metaKey: true,
			key: "-",
		});
		expect(parseBinding("escape")).toEqual({
			ctrlKey: false,
			shiftKey: false,
			altKey: false,
			metaKey: false,
			key: "escape",
		});
	});
});

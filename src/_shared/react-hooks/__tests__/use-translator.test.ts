import { renderHook } from "@testing-library/react-hooks";
import { useTranslate } from "@tolgee/react";
import { ResourceTypes } from "../../consts";
import { parseTranslationKey, useTranslator } from "../use-translator";

// Mock @tolgee/react
jest.mock("@tolgee/react", () => ({
    useTranslate: jest.fn(),
}));

describe("parseTranslationKey", () => {
    it("should parse key with namespace", () => {
        const result = parseTranslationKey("namespace.key");
        expect(result).toEqual({ key: "key", ns: "namespace" });
    });

    it("should parse key without namespace", () => {
        const result = parseTranslationKey("simpleKey");
        expect(result).toEqual({ key: "simpleKey" });
    });
});

describe("useTranslator", () => {
    const mockTranslate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useTranslate as jest.Mock).mockReturnValue({ t: mockTranslate });
    });

    it("should initialize with default namespaces only", () => {
        renderHook(() => useTranslator());
        expect(useTranslate).toHaveBeenCalledWith([ResourceTypes.COMMON, ResourceTypes.GAME_NAMES]);
    });

    it("should initialize with custom namespaces plus defaults", () => {
        const customNs = ["CustomNs1", "CustomNs2"];
        renderHook(() => useTranslator(customNs));
        expect(useTranslate).toHaveBeenCalledWith([
            ...customNs,
            ResourceTypes.COMMON,
            ResourceTypes.GAME_NAMES,
        ]);
    });

    it("should translate key without namespace", () => {
        mockTranslate.mockReturnValue("translated text");
        const { result } = renderHook(() => useTranslator());

        const translation = result.current.t("simpleKey");

        expect(mockTranslate).toHaveBeenCalledWith({
            key: "simpleKey",
            params: undefined,
        });
        expect(translation).toBe("translated text");
    });

    it("should translate key with namespace", () => {
        mockTranslate.mockReturnValue("translated with namespace");
        const { result } = renderHook(() => useTranslator());

        const translation = result.current.t("namespace.key");

        expect(mockTranslate).toHaveBeenCalledWith({
            key: "key",
            ns: "namespace",
            params: undefined,
        });
        expect(translation).toBe("translated with namespace");
    });

    it("should translate with parameters", () => {
        mockTranslate.mockReturnValue("translated with params");
        const { result } = renderHook(() => useTranslator());
        const params = { value: "test" };

        const translation = result.current.t("namespace.key", params);

        expect(mockTranslate).toHaveBeenCalledWith({
            key: "key",
            ns: "namespace",
            params,
        });
        expect(translation).toBe("translated with params");
    });

    it("should translate with additional options", () => {
        mockTranslate.mockReturnValue("translated with options");
        const { result } = renderHook(() => useTranslator());
        const params = { value: "test" };
        const options = { count: 2 };

        const translation = result.current.t("key", params, options);

        expect(mockTranslate).toHaveBeenCalledWith({
            key: "key",
            params,
            count: 2,
        });
        expect(translation).toBe("translated with options");
    });
}); 
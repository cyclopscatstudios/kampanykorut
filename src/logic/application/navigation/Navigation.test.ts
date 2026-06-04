import { beforeEach, describe, expect, it, vi } from "vitest";
import { Navigation } from "./Navigation";

describe("Navigation", () => {
  let navigation: Navigation;

  beforeEach(() => {
    navigation = new Navigation();
  });

  describe("isUrlParamMatch", () => {
    it("returns true when pathname contains the match", () => {
      window.history.pushState({}, "", "/game/2022_ogyv_default");
      expect(navigation.isUrlParamMatch("/game/")).toBe(true);
    });

    it("returns false when pathname does not contain the match", () => {
      window.history.pushState({}, "", "/main-menu");
      expect(navigation.isUrlParamMatch("/game/")).toBe(false);
    });

    it("matches partial strings inside the path", () => {
      window.history.pushState({}, "", "/new-game/classic");
      expect(navigation.isUrlParamMatch("classic")).toBe(true);
    });
  });

  describe("getUrlParams", () => {
    it("returns parsed query string parameters", () => {
      window.history.pushState({}, "", "/game/x?sessionId=abc&foo=bar");
      const params = navigation.getUrlParams();
      expect(params.get("sessionId")).toBe("abc");
      expect(params.get("foo")).toBe("bar");
    });

    it("returns empty params when query string is absent", () => {
      window.history.pushState({}, "", "/main-menu");
      expect(navigation.getUrlParams().get("sessionId")).toBeNull();
    });
  });

  describe("go / back", () => {
    it("forwards go() to the bound navigate function", () => {
      const navigate = vi.fn();
      navigation.setNavigate(navigate);

      navigation.go("/load-game");

      expect(navigate).toHaveBeenCalledWith("/load-game");
    });

    it("forwards back() as navigate(-1)", () => {
      const navigate = vi.fn();
      navigation.setNavigate(navigate);

      navigation.back();

      expect(navigate).toHaveBeenCalledWith(-1);
    });

    it("does nothing when navigate is not set", () => {
      expect(() => navigation.go("/x")).not.toThrow();
      expect(() => navigation.back()).not.toThrow();
    });
  });
});

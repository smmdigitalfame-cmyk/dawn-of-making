import { describe, expect, it } from "vitest";
import { orderPushText } from "@/lib/admin-store";

describe("orderPushText", () => {
  it("matches the Shopify screenshot format with plural items", () => {
    expect(orderPushText(617, 8, 1752.0, "Online Store")).toEqual({
      title: "Order #617",
      body: "from Shopify\n1752.00 USD, 8 items from Online Store",
    });
  });

  it("uses singular 'item' for a single item", () => {
    expect(orderPushText(614, 1, 19.5, "Online Store")).toEqual({
      title: "Order #614",
      body: "from Shopify\n19.50 USD, 1 item from Online Store",
    });
  });

  it("keeps the sales channel in the message", () => {
    expect(orderPushText(619, 2, 29.68, "Facebook & Instagram")).toEqual({
      title: "Order #619",
      body: "from Shopify\n29.68 USD, 2 items from Facebook & Instagram",
    });
  });
});

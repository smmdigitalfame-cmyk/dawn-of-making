import { describe, expect, it } from "vitest";
import { orderPushBody } from "@/lib/admin-store";

describe("orderPushBody", () => {
  it("matches the Shopify order format with plural items", () => {
    expect(orderPushBody("HoH Fashion", 2, 70.49, "Online Store")).toBe(
      "HoH Fashion has a new order for 2 items totaling $70.49 from Online Store.",
    );
  });

  it("uses singular 'item' for a single item", () => {
    expect(orderPushBody("HoH Fashion", 1, 19.5, "Online Store")).toBe(
      "HoH Fashion has a new order for 1 item totaling $19.50 from Online Store.",
    );
  });

  it("keeps the sales channel in the message", () => {
    expect(orderPushBody("HoH Fashion", 2, 29.68, "Facebook & Instagram")).toBe(
      "HoH Fashion has a new order for 2 items totaling $29.68 from Facebook & Instagram.",
    );
  });
});

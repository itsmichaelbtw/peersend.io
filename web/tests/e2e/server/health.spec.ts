import { test, expect } from "@playwright/test";
import { SERVER_URL } from "../../helpers/session";

test.describe("Server health", () => {
  test("GET /health returns 200 with healthy status", async ({ request }) => {
    const res = await request.get(`${SERVER_URL}/health`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("healthy");
    expect(body.version).toBeTruthy();
    expect(body.environment).toBeTruthy();
  });

  test("POST /health returns 405", async ({ request }) => {
    const res = await request.post(`${SERVER_URL}/health`);
    expect(res.status()).toBe(405);
  });
});

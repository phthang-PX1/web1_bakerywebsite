import http from "http";
import app from "./src/app";
import { env } from "./src/config/env";

async function runTests() {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Invalid server address");
  const baseUrl = `http://localhost:${address.port}`;

  console.log(`🚀 Automated Test Server started at ${baseUrl}\n`);

  const results: Array<{ name: string; status: "PASS" | "FAIL"; details?: string }> = [];

  async function testEndpoint(name: string, fn: () => Promise<void>) {
    process.stdout.write(`Testing [${name}] ... `);
    try {
      await fn();
      console.log("✅ PASS");
      results.push({ name, status: "PASS" });
    } catch (err: any) {
      console.log("❌ FAIL");
      console.error(err);
      results.push({ name, status: "FAIL", details: err.message || String(err) });
    }
  }

  // 1. Health check
  await testEndpoint("GET /health", async () => {
    const res = await fetch(`${baseUrl}/health`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const json: any = await res.json();
    if (json.status !== "ok") throw new Error(`Expected status ok, got ${JSON.stringify(json)}`);
  });

  // 2. Auth - Login Admin
  let adminToken = "";
  await testEndpoint("POST /api/auth/login (Admin Account)", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@webee.vn", password: "Admin@123" })
    });
    if (res.status !== 200) {
      const text = await res.text();
      throw new Error(`Expected 200, got ${res.status}: ${text}`);
    }
    const json: any = await res.json();
    if (!json.accessToken) throw new Error("Missing accessToken in response");
    adminToken = json.accessToken;
  });

  // 3. Auth - Login Member
  let memberToken = "";
  await testEndpoint("POST /api/auth/login (Member Account)", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "khach01@webee.vn", password: "Member@123" })
    });
    if (res.status !== 200) {
      const text = await res.text();
      throw new Error(`Expected 200, got ${res.status}: ${text}`);
    }
    const json: any = await res.json();
    if (!json.accessToken) throw new Error("Missing accessToken in response");
    memberToken = json.accessToken;
  });

  // 4. Categories - Get list
  await testEndpoint("GET /api/categories (Public Catalog)", async () => {
    const res = await fetch(`${baseUrl}/api/categories`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const json: any = await res.json();
    if (!Array.isArray(json) || json.length === 0) {
      throw new Error("Category list is empty");
    }
  });

  // 5. Products - Get list
  let productId = "";
  let selectedOptions: string[] = [];
  await testEndpoint("GET /api/products (Public Products & Options)", async () => {
    const res = await fetch(`${baseUrl}/api/products`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const json: any = await res.json();
    const items = json.items || json;
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Product list is empty");
    }
    productId = items[0].productId || items[0].id;

    // Fetch product detail by slug to check for required options
    const slug = items[0].slug;
    const detailRes = await fetch(`${baseUrl}/api/products/${slug}`);
    if (detailRes.status === 200) {
      const detailJson: any = await detailRes.json();
      const optionGroups = detailJson.optionGroups || detailJson.option_groups || [];
      for (const group of optionGroups) {
        if (group.isRequired && group.items && group.items.length > 0) {
          selectedOptions.push(group.items[0].itemId || group.items[0].item_id || group.items[0].id);
        }
      }
    }
  });

  // 6. Cart - Add Item to Redis Cart
  await testEndpoint("POST /api/cart/items (Add to Redis Cart)", async () => {
    const res = await fetch(`${baseUrl}/api/cart/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${memberToken}` },
      body: JSON.stringify({
        product_id: productId,
        quantity: 2,
        option_item_ids: selectedOptions.length > 0 ? selectedOptions : undefined
      })
    });
    if (res.status !== 200 && res.status !== 201) {
      const text = await res.text();
      throw new Error(`Expected 200/201, got ${res.status}: ${text}`);
    }
  });

  // 7. Cart - Get Redis Cart
  await testEndpoint("GET /api/cart (Fetch Redis Cart)", async () => {
    const res = await fetch(`${baseUrl}/api/cart`, {
      headers: { "Authorization": `Bearer ${memberToken}` }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const json: any = await res.json();
    const items = json.items || json.cartItems;
    if (!items || items.length === 0) throw new Error("Cart is empty after adding item");
  });

  // 8. Coupons - Validate Coupon
  await testEndpoint("POST /api/coupons/validate (Validate Coupon Code)", async () => {
    const res = await fetch(`${baseUrl}/api/coupons/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "WELCOME10", order_value: 250000 })
    });
    if (res.status !== 200) {
      const text = await res.text();
      throw new Error(`Expected 200, got ${res.status}: ${text}`);
    }
  });

  // 9. Orders - Create Order (Static QR Payment Info)
  let orderId = "";
  let totalAmount = 0;
  await testEndpoint("POST /api/orders (Create Order & Get QR Static)", async () => {
    const res = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${memberToken}` },
      body: JSON.stringify({
        recipient_name: "Nguyen Van Test",
        phone: "0901234567",
        fulfillment_type: "pickup",
        delivery_date: new Date(Date.now() + 86400000).toISOString(),
        delivery_time_slot: "10:00-12:00",
        payment_method: "transfer",
        note: "Test Order End-to-End"
      })
    });
    if (res.status !== 201 && res.status !== 200) {
      const text = await res.text();
      throw new Error(`Expected 200/201, got ${res.status}: ${text}`);
    }
    const json: any = await res.json();
    orderId = json.order_id || json.orderId || json.id || json.summary?.orderId;
    totalAmount = Number(json.summary?.totalAmount || json.totalAmount || json.total || 150000);
    if (!orderId) throw new Error(`Could not find orderId in response: ${JSON.stringify(json)}`);
  });

  // 10. Webhooks - Simulate Payment Confirmation
  await testEndpoint("POST /api/webhooks/payment (Simulate Bank Transfer)", async () => {
    const res = await fetch(`${baseUrl}/api/webhooks/payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Payment-Webhook-Secret": env.PAYMENT_WEBHOOK_SECRET || ""
      },
      body: JSON.stringify({ order_id: orderId, amount: totalAmount })
    });
    if (res.status !== 200 && res.status !== 204) {
      const text = await res.text();
      throw new Error(`Expected 200/204, got ${res.status}: ${text}`);
    }
  });

  // 11. Orders - Verify Order Status Paid & Confirmed
  await testEndpoint("GET /api/orders/me/:id (Verify Paid & Confirmed)", async () => {
    const res = await fetch(`${baseUrl}/api/orders/me/${orderId}`, {
      headers: { "Authorization": `Bearer ${memberToken}` }
    });
    if (res.status !== 200) {
      const text = await res.text();
      throw new Error(`Expected 200, got ${res.status}: ${text}`);
    }
    const json: any = await res.json();
    const paymentStatus = json.paymentStatus || json.payment_status || json.order?.paymentStatus;
    const orderStatus = json.orderStatus || json.order_status || json.order?.orderStatus;
    if (paymentStatus !== "paid") throw new Error(`Expected paymentStatus paid, got ${paymentStatus}`);
    if (orderStatus !== "confirmed") throw new Error(`Expected orderStatus confirmed, got ${orderStatus}`);
  });

  // 12. Orders - Guest Checkout (Create Order using x-session-id without Bearer token)
  await testEndpoint("POST /api/orders (Guest Checkout with x-session-id)", async () => {
    const guestSessionId = "11111111-2222-3333-4444-555555555555";
    const addRes = await fetch(`${baseUrl}/api/cart/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Session-Id": guestSessionId
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: 1,
        option_item_ids: selectedOptions.length > 0 ? selectedOptions : undefined
      })
    });
    if (addRes.status !== 200 && addRes.status !== 201) {
      const text = await addRes.text();
      throw new Error(`Failed to add item to guest cart: ${addRes.status} ${text}`);
    }

    const orderRes = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Session-Id": guestSessionId
      },
      body: JSON.stringify({
        buyer_name: "Khách vãng lai Test",
        buyer_phone: "0909888777",
        recipient_name: "Khách vãng lai Test",
        email: "",
        phone: "0909888777",
        fulfillment_type: "pickup",
        delivery_date: new Date(Date.now() + 86400000).toISOString(),
        delivery_time_slot: "10:00-12:00",
        payment_method: "cash",
        note: ""
      })
    });
    if (orderRes.status !== 201 && orderRes.status !== 200) {
      const text = await orderRes.text();
      throw new Error(`Guest order placement failed: ${orderRes.status} ${text}`);
    }
  });

  server.close();
  console.log("\n==========================================");
  console.log(`📊 TEST SUMMARY: ${results.filter(r => r.status === "PASS").length} PASSED / ${results.filter(r => r.status === "FAIL").length} FAILED`);
  console.log("==========================================");
  process.exit(results.some((r) => r.status === "FAIL") ? 1 : 0);
}

runTests().catch((err) => {
  console.error("Fatal Test Runner Error:", err);
  process.exit(1);
});

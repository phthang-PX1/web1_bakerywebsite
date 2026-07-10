async function main() {
  const loginUrl = "http://localhost:3000/api/auth/login";
  console.log("Logging in as admin...");
  
  const loginRes = await fetch(loginUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@webee.vn",
      password: "Admin@123"
    })
  });
  
  const loginData = await loginRes.json() as any;
  const token = loginData.accessToken;
  console.log("Logged in successfully. Token acquired:", token ? "YES" : "NO");
  
  const adminHeaders = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };
  
  // Get products list
  const listUrl = "http://localhost:3000/api/admin/products";
  const listRes = await fetch(listUrl, { headers: adminHeaders });
  const listData = await listRes.json() as any;
  const products = listData.items;
  console.log("Total products fetched via API:", products ? products.length : "undefined");
  
  if (products && products.length > 0) {
    const target = products[0];
    const originalName = target.name;
    const updatedName = target.name + " (API TEST)";
    
    console.log(`Updating product ${target.productId} via PUT API to: ${updatedName}`);
    
    const updateUrl = `http://localhost:3000/api/admin/products/${target.productId}`;
    const updateRes = await fetch(updateUrl, {
      method: "PUT",
      headers: adminHeaders,
      body: JSON.stringify({
        name: updatedName,
        basePrice: Number(target.basePrice),
        categoryId: target.categoryId
      })
    });
    
    console.log("API Update response status:", updateRes.status);
    const updateData = await updateRes.json() as any;
    console.log("API Update response data name:", updateData.name);
    
    // Fetch product details again
    const detailRes = await fetch(updateUrl, { headers: adminHeaders });
    const detailData = await detailRes.json() as any;
    console.log("Re-fetched product via API detail name:", detailData.name);
    
    // Revert back
    console.log("Reverting name back...");
    await fetch(updateUrl, {
      method: "PUT",
      headers: adminHeaders,
      body: JSON.stringify({
        name: originalName,
        basePrice: Number(target.basePrice),
        categoryId: target.categoryId
      })
    });
    console.log("Reverted successfully.");
  }
}

main().catch(err => {
  console.error("Error in API test:", err.message);
});

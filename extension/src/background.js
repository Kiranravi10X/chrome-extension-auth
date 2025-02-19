chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  console.log("🔹 BACKGROUND_JS_CORE Received:", request, sender);

  // 🔹 Allow only messages from your React app (localhost or production domain)
  if (!sender.origin || !sender.origin.includes("http://localhost:5173")) {
    console.warn("❌ Unauthorized message received from:", sender.origin);
    sendResponse({ status: "error", message: "Unauthorized sender" });
    return;
  }

  // 🔹 Handle Authentication Sync (Login)
  if (request.action === "syncAuth") {
    console.log("🔐 Received Encrypted Token:", request.token);
    
    // Store token in session storage (optional)
    chrome.storage.session.set({ token: request.token });

    sendResponse({ status: "success", message: "Token saved in extension" });
  }

  // 🔹 Handle Logout
  if (request.action === "logout") {
    console.log("🚪 User logged out");

    // Remove token from storage
    chrome.storage.session.remove("token");

    sendResponse({ status: "success", message: "Token removed" });
  }
});

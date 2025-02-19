// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.action === "syncAuth" && request.token) {
//     chrome.storage.local.set(
//       { authToken: request.token, userData: request.userData },
//       () => {
//         console.log("Securely stored token in local storage");
//         sendResponse({ success: true });
//       }
//     );
//   }

//   if (request.action === "logout") {
//     chrome.storage.local.remove(["authToken", "userData"], () => {
//       console.log("User logged out, token removed");
//       sendResponse({ success: true });
//     });
//   }

//   return true; // Required for async response
// });

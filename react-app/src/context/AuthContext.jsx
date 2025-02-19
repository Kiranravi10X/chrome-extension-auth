import { createContext, useState, useEffect } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [encryptionKey, setEncryptionKey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log("AuthProvider State:", { token, encryptionKey });

  // 🔹 Fetch encryption key from backend
  const fetchEncryptionKey = async (authToken) => {
    try {
      console.log("🔑 Fetching encryption key...");
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/get-key`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setEncryptionKey(res.data.encryptionKey);
      console.log("✅ Encryption Key Received:", res.data.encryptionKey);
      return res.data.encryptionKey;
    } catch (error) {
      console.error("❌ Failed to fetch encryption key:", error);
      return null;
    }
  };

  // 🔹 Encrypt token before saving
  const encryptToken = (plainToken, key) => {
    if (!key) {
      console.warn("⚠️ Encryption key is missing. Storing token in plain text.");
      return plainToken;
    }
    const encrypted = CryptoJS.AES.encrypt(plainToken, key).toString();
    console.log("🔐 Encrypted Token:", encrypted);
    return encrypted;
  };

  // 🔹 Decrypt stored token when needed
  const decryptToken = (encryptedToken) => {
    if (!encryptedToken || !encryptionKey) {
      console.warn("⚠️ Missing encrypted token or encryption key.");
      return null;
    }

    try {
      const bytes = CryptoJS.AES.decrypt(encryptedToken, encryptionKey);
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedData) {
        throw new Error("Decryption resulted in empty data");
      }

      console.log("🔓 Decrypted Token:", decryptedData);
      return decryptedData;
    } catch (error) {
      console.error("❌ Decryption failed:", error);
      return null;
    }
  };

  // 🔹 Login function
  const login = async (email, password) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/login`, { email, password });
      const authToken = res.data.token;

      console.log("🔹 Login Successful! Token Received:", authToken);

      const key = await fetchEncryptionKey(authToken); // Fetch encryption key
      if (key) {
        const encryptedToken = encryptToken(authToken, key); // Encrypt token
        localStorage.setItem("encryptedToken", encryptedToken); // Store encrypted token
        setToken(encryptedToken);

        // 🔹 Send encrypted token to Chrome Extension
        chrome.runtime.sendMessage("dpefibchkgkmdaahbkpdpcnknfjjlmfn", {
          action: "syncAuth",
          token: encryptedToken,
        }, (response) => {
          console.log("🔹 Extension Response:", response);
        });
      }
    } catch (error) {
      console.error("❌ Login failed:", error);
    }
  };

  // 🔹 Logout function
  const logout = () => {
    console.log("🔹 Logging out...");
    localStorage.removeItem("encryptedToken");
    axios.post(`${import.meta.env.VITE_API_BASE_URL}/logout`).catch(console.error);
    setToken(null);
    setEncryptionKey(null);

    // 🔹 Notify Chrome Extension
    chrome.runtime.sendMessage("dpefibchkgkmdaahbkpdpcnknfjjlmfn", { action: "logout" }, (response) => {
      console.log("🔹 Logout Response from Extension:", response);
    });
  };

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Loading authentication...</div>;
  }

  return (
    <AuthContext.Provider value={{ token, encryptionKey, decryptToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

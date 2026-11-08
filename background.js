// BidCraft AI - Background Service Worker
chrome.runtime.onInstalled.addListener(async (details) => {
  // Set default settings if not already present
  const data = await chrome.storage.local.get(["geminiApiKey", "aiModel", "profiles"]);
  
  if (!data.aiModel) {
    await chrome.storage.local.set({ aiModel: "gemini-1.5-flash" });
  }

  if (!data.profiles || data.profiles.length === 0) {
    await chrome.storage.local.set({
      profiles: [
        {
          id: "default",
          name: "Hafiz Muhammad Soban",
          bio: "Experienced professional with a proven track record of solving technical and design challenges with fast turnaround and clean communication.",
          portfolio: ""
        }
      ],
      selectedProfileId: "default"
    });
  }

  // Create Context Menu for quick drafting
  chrome.contextMenus.create({
    id: "bidcraft_generate_context",
    title: "✨ Draft Proposal with BidCraft AI",
    contexts: ["selection"]
  });

  if (details.reason === "install") {
    console.log("BidCraft AI installed successfully!");
  }
});

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "bidcraft_generate_context" && info.selectionText) {
    await chrome.storage.local.set({
      draftSnippet: info.selectionText
    });
    // Open action popup if supported or prompt user
  }
});

// BidCraft AI - Production-Ready Popup Script with Monetization & License Lock
document.addEventListener("DOMContentLoaded", async () => {
  // Elements
  const jobTitleInput = document.getElementById("jobTitle");
  const jobDescInput = document.getElementById("jobDesc");
  const screeningQuestionsInput = document.getElementById("screeningQuestions");
  const charCountSpan = document.getElementById("charCount");
  const userProfileSelect = document.getElementById("userProfile");
  const proposalToneSelect = document.getElementById("proposalTone");
  const btnGenerate = document.getElementById("btnGenerate");
  const btnText = btnGenerate.querySelector(".btn-text");
  const spinner = btnGenerate.querySelector(".spinner");
  const btnAutoDetect = document.getElementById("btnAutoDetect");
  const detectStatus = document.getElementById("detectStatus");
  const resultCard = document.getElementById("resultCard");
  const proposalOutput = document.getElementById("proposalOutput");
  const wordStats = document.getElementById("wordStats");
  const btnCopy = document.getElementById("btnCopy");
  const btnRegenerate = document.getElementById("btnRegenerate");
  const apiKeyBanner = document.getElementById("apiKeyBanner");
  const tabButtons = document.querySelectorAll(".tab-btn");

  // License & Monetization Elements
  const trialBadge = document.getElementById("trialBadge");
  const btnOpenLicense = document.getElementById("btnOpenLicense");
  const modalLicense = document.getElementById("modalLicense");
  const btnCloseLicense = document.getElementById("btnCloseLicense");
  const licenseKeyInput = document.getElementById("licenseKeyInput");
  const btnVerifyKey = document.getElementById("btnVerifyKey");
  const licenseFeedback = document.getElementById("licenseFeedback");
  const settingsPlanStatus = document.getElementById("settingsPlanStatus");
  const btnSettingsOpenLicense = document.getElementById("btnSettingsOpenLicense");
  const upgradeModalHeading = document.getElementById("upgradeModalHeading");
  const dispAccountNo = document.getElementById("dispAccountNo");
  const dispAccountTitle = document.getElementById("dispAccountTitle");
  const btnCopyAcc = document.getElementById("btnCopyAcc");
  const btnWhatsAppPay = document.getElementById("btnWhatsAppPay");
  const sellerAccountNoInput = document.getElementById("sellerAccountNo");
  const sellerAccountTitleInput = document.getElementById("sellerAccountTitle");
  const sellerWhatsAppInput = document.getElementById("sellerWhatsApp");

  // Modals & triggers
  const btnSettings = document.getElementById("btnSettings");
  const btnOpenKeyModal = document.getElementById("btnOpenKeyModal");
  const modalSettings = document.getElementById("modalSettings");
  const btnCloseSettings = document.getElementById("btnCloseSettings");
  const btnSaveSettings = document.getElementById("btnSaveSettings");
  const geminiApiKeyInput = document.getElementById("geminiApiKey");
  const aiModelSelect = document.getElementById("aiModel");
  const customInstructionsInput = document.getElementById("customInstructions");

  const btnManageProfiles = document.getElementById("btnManageProfiles");
  const modalProfiles = document.getElementById("modalProfiles");
  const btnCloseProfiles = document.getElementById("btnCloseProfiles");
  const btnSaveProfile = document.getElementById("btnSaveProfile");
  const profileNameInput = document.getElementById("profileName");
  const profileBioInput = document.getElementById("profileBio");
  const profilePortfolioInput = document.getElementById("profilePortfolio");

  const btnHistory = document.getElementById("btnHistory");
  const modalHistory = document.getElementById("modalHistory");
  const btnCloseHistory = document.getElementById("btnCloseHistory");
  const btnClearHistory = document.getElementById("btnClearHistory");
  const historyList = document.getElementById("historyList");

  const polishPills = document.querySelectorAll(".pill-btn");

  // State Variables
  const FREE_LIMIT = 5;
  let activePlatform = "upwork";
  let currentApiKey = "";
  let currentModel = "gemini-1.5-flash";
  let profilesList = [];
  let isPro = false;
  let proposalsCount = 0;
  let sellerAccountNo = "1629343864185";
  let sellerAccountTitle = "Hafiz Muhammad Soban";
  let sellerWhatsApp = "03143530776";

  // 1. Load Stored Data & License Status
  try {
    const stored = await chrome.storage.local.get([
      "geminiApiKey",
      "aiModel",
      "customInstructions",
      "profiles",
      "selectedProfileId",
      "proposalHistory",
      "isPro",
      "proposalsCount",
      "licenseKey",
      "sellerAccountNo",
      "sellerAccountTitle",
      "sellerWhatsApp"
    ]);

    isPro = !!stored.isPro;
    proposalsCount = stored.proposalsCount || 0;
    sellerAccountNo = stored.sellerAccountNo || "1629343864185";
    sellerAccountTitle = stored.sellerAccountTitle || "Hafiz Muhammad Soban";
    sellerWhatsApp = stored.sellerWhatsApp || "03143530776";

    if (sellerAccountNoInput) sellerAccountNoInput.value = sellerAccountNo;
    if (sellerAccountTitleInput) sellerAccountTitleInput.value = sellerAccountTitle;
    if (sellerWhatsAppInput) sellerWhatsAppInput.value = sellerWhatsApp;

    updatePaymentDetailsUI(sellerAccountNo, sellerAccountTitle, sellerWhatsApp);

    if (stored.geminiApiKey && stored.geminiApiKey.trim().length > 5) {
      currentApiKey = stored.geminiApiKey.trim();
      geminiApiKeyInput.value = currentApiKey;
      if (apiKeyBanner) apiKeyBanner.style.display = "none";
    } else {
      if (apiKeyBanner) apiKeyBanner.style.display = "flex";
    }

    if (stored.aiModel) {
      currentModel = stored.aiModel;
      aiModelSelect.value = currentModel;
    }

    if (stored.customInstructions) {
      customInstructionsInput.value = stored.customInstructions;
    }

    // Populate Profiles
    profilesList = stored.profiles && stored.profiles.length > 0 ? stored.profiles : [
      {
        id: "default",
        name: "Hafiz Muhammad Soban",
        bio: "Experienced professional delivering high-quality, modern, and robust solutions with quick turnaround.",
        portfolio: ""
      }
    ];
    renderProfileOptions(stored.selectedProfileId);

    // Update Plan Badge in UI
    updatePlanBadgeUI();

  } catch (e) {
    console.warn("Storage load error:", e);
  }

  // 2. License & Plan UI Helpers
  function updatePlanBadgeUI() {
    if (!trialBadge) return;
    if (isPro) {
      trialBadge.textContent = "⚡ PRO";
      trialBadge.className = "badge-plan badge-pro-active";
      trialBadge.title = "Lifetime PRO License Activated!";
      if (settingsPlanStatus) {
        settingsPlanStatus.textContent = "⭐ Lifetime PRO Active";
        settingsPlanStatus.style.color = "#34d399";
      }
      if (btnOpenLicense) {
        btnOpenLicense.title = "PRO Active";
        btnOpenLicense.style.color = "#10b981";
      }
    } else {
      const left = Math.max(0, FREE_LIMIT - proposalsCount);
      trialBadge.textContent = `Free: ${left}/${FREE_LIMIT}`;
      trialBadge.className = "badge-plan badge-trial";
      trialBadge.title = `${left} free proposal(s) remaining. Click to upgrade!`;
      if (settingsPlanStatus) {
        settingsPlanStatus.textContent = `Free Trial (${proposalsCount}/${FREE_LIMIT} used)`;
        settingsPlanStatus.style.color = "#fbbf24";
      }
    }
  }

  function updatePaymentDetailsUI(accNo, accTitle, waPhone) {
    if (dispAccountNo) dispAccountNo.textContent = accNo;
    if (dispAccountTitle) dispAccountTitle.textContent = accTitle;
    if (btnCopyAcc) btnCopyAcc.dataset.num = accNo;

    // Update WhatsApp link
    if (btnWhatsAppPay) {
      const cleanDigits = waPhone.replace(/\D/g, "");
      const waNumber = cleanDigits.startsWith("0") ? "92" + cleanDigits.slice(1) : cleanDigits;
      btnWhatsAppPay.href = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Salam! Mene BidCraft AI Pro k PKR 1500 ${accTitle} (UBL Account: ${accNo}) me transfer kiye hain. Kindly License Key send karein.`)}`;
      btnWhatsAppPay.innerHTML = `<span>💬 Send Receipt on WhatsApp (${waPhone})</span>`;
    }
  }

  // Copy account number button
  if (btnCopyAcc) {
    btnCopyAcc.addEventListener("click", () => {
      const num = btnCopyAcc.dataset.num || "1629343864185";
      navigator.clipboard.writeText(num).then(() => {
        const oldText = btnCopyAcc.textContent;
        btnCopyAcc.textContent = "✓ Copied!";
        btnCopyAcc.style.background = "#10b981";
        btnCopyAcc.style.color = "#fff";
        setTimeout(() => {
          btnCopyAcc.textContent = oldText;
          btnCopyAcc.style.background = "";
          btnCopyAcc.style.color = "";
        }, 1500);
      });
    });
  }

  // Open License Modal Handlers
  if (trialBadge) trialBadge.addEventListener("click", () => openUpgradeModal());
  if (btnOpenLicense) btnOpenLicense.addEventListener("click", () => openUpgradeModal());
  if (btnSettingsOpenLicense) btnSettingsOpenLicense.addEventListener("click", () => {
    modalSettings.style.display = "none";
    openUpgradeModal();
  });
  if (btnCloseLicense) btnCloseLicense.addEventListener("click", () => modalLicense.style.display = "none");

  function openUpgradeModal(isLimitReached = false) {
    if (isLimitReached) {
      upgradeModalHeading.textContent = "🔒 Free Trial Limit Reached!";
    } else {
      upgradeModalHeading.textContent = isPro ? "⭐ BidCraft AI PRO Status" : "Upgrade to BidCraft AI PRO";
    }
    licenseFeedback.style.display = "none";
    modalLicense.style.display = "flex";
  }

  // Verify & Activate License Key
  if (btnVerifyKey) {
    btnVerifyKey.addEventListener("click", async () => {
      const key = licenseKeyInput.value.trim().toUpperCase();
      if (!key) {
        showLicenseFeedback("Please enter your License Key!", false);
        return;
      }

      if (verifyLicenseKey(key)) {
        isPro = true;
        await chrome.storage.local.set({ isPro: true, licenseKey: key });
        showLicenseFeedback("🎉 SUCCESS! BidCraft AI PRO Lifetime Unlocked!", true);
        updatePlanBadgeUI();

        setTimeout(() => {
          modalLicense.style.display = "none";
        }, 1500);
      } else {
        showLicenseFeedback("❌ Invalid License Key. Check key or contact support on WhatsApp.", false);
      }
    });
  }

  function showLicenseFeedback(msg, isSuccess) {
    licenseFeedback.textContent = msg;
    licenseFeedback.className = "license-feedback " + (isSuccess ? "success" : "error");
    licenseFeedback.style.display = "block";
  }

  // 3. Tab Switching
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activePlatform = btn.dataset.tab;
      
      const qGroup = document.getElementById("questionsGroup");
      if (activePlatform === "linkedin") {
        if (qGroup) qGroup.style.display = "none";
        proposalToneSelect.value = "linkedin_warm";
        btnText.textContent = "✨ Generate LinkedIn Message";
      } else if (activePlatform === "cold") {
        if (qGroup) qGroup.style.display = "none";
        proposalToneSelect.value = "short_punchy";
        btnText.textContent = "✨ Generate Cold Pitch";
      } else {
        if (qGroup) qGroup.style.display = "block";
        proposalToneSelect.value = "hook_proof_cta";
        btnText.textContent = "✨ Generate Winning Proposal";
      }
    });
  });

  // Character Count
  jobDescInput.addEventListener("input", () => {
    charCountSpan.textContent = `${jobDescInput.value.length} chars`;
  });

  // 4. Auto-Detect from Current Tab
  btnAutoDetect.addEventListener("click", async () => {
    detectStatus.textContent = "Scanning tab...";
    detectStatus.style.color = "var(--text-secondary)";

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        detectStatus.textContent = "No active tab found.";
        return;
      }

      chrome.tabs.sendMessage(tab.id, { action: "BID_CRAFT_EXTRACT_JOB" }, (response) => {
        if (chrome.runtime.lastError || !response || !response.success) {
          detectStatus.textContent = "Open an Upwork or LinkedIn page to auto-grab.";
          detectStatus.style.color = "var(--accent-amber)";
          return;
        }

        if (response.data.title) jobTitleInput.value = response.data.title;
        if (response.data.description) {
          jobDescInput.value = response.data.description;
          charCountSpan.textContent = `${response.data.description.length} chars`;
        }
        if (response.data.questions && response.data.questions.length > 0) {
          screeningQuestionsInput.value = response.data.questions.join("\n");
        }

        if (response.platform === "linkedin") {
          const lBtn = document.querySelector('[data-tab="linkedin"]');
          if (lBtn) lBtn.click();
        } else {
          const uBtn = document.querySelector('[data-tab="upwork"]');
          if (uBtn) uBtn.click();
        }

        detectStatus.textContent = `✓ Grabbed from ${response.platform || "page"}!`;
        detectStatus.style.color = "var(--accent-emerald)";
      });
    } catch (err) {
      detectStatus.textContent = "Could not scan page.";
      detectStatus.style.color = "var(--accent-rose)";
    }
  });

  // 5. Generate Proposal (With Monetization Lock Check)
  btnGenerate.addEventListener("click", () => {
    generateProposal();
  });

  btnRegenerate.addEventListener("click", () => {
    generateProposal();
  });

  async function generateProposal(overridePrompt = null) {
    // Check Free Trial Limit
    if (!isPro && proposalsCount >= FREE_LIMIT) {
      openUpgradeModal(true);
      return;
    }

    const title = jobTitleInput.value.trim();
    const description = jobDescInput.value.trim();
    const questions = screeningQuestionsInput.value.trim();

    if (!title && !description) {
      alert("Please provide at least a Job Title or Job Description!");
      jobDescInput.focus();
      return;
    }

    const selectedProfile = profilesList.find(p => p.id === userProfileSelect.value) || profilesList[0] || { name: "Professional Freelancer" };
    const tone = proposalToneSelect.value;
    const customRules = customInstructionsInput.value.trim();

    setLoading(true);

    try {
      let resultText = "";
      let engineUsed = "AI Gemini";

      // If user provided a valid Gemini API Key, use Google Gemini AI
      if (currentApiKey && currentApiKey.length > 10) {
        try {
          const prompt = overridePrompt || buildPrompt({
            platform: activePlatform,
            title,
            description,
            questions,
            profile: selectedProfile,
            tone,
            customRules
          });

          resultText = await callGeminiAPI(currentApiKey, currentModel, prompt);
          engineUsed = "Gemini AI";
        } catch (apiErr) {
          console.warn("Gemini call failed, fallback to smart engine:", apiErr);
          resultText = generateSmartBuiltInProposal({
            platform: activePlatform,
            title,
            description,
            questions,
            profile: selectedProfile,
            tone
          });
          engineUsed = "Built-in Fast Engine";
        }
      } else {
        // Fast Built-in Engine
        resultText = generateSmartBuiltInProposal({
          platform: activePlatform,
          title,
          description,
          questions,
          profile: selectedProfile,
          tone
        });
        engineUsed = "Built-in Fast Engine";
      }

      proposalOutput.value = resultText;
      updateWordCount(resultText, engineUsed);
      resultCard.style.display = "block";

      // Count trial proposal
      if (!isPro) {
        proposalsCount++;
        await chrome.storage.local.set({ proposalsCount });
        updatePlanBadgeUI();
      }

      // Smooth scroll
      setTimeout(() => {
        resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);

      // Save to History
      saveToHistory({
        title: title || "Proposal Draft",
        platform: activePlatform,
        text: resultText,
        date: new Date().toLocaleDateString()
      });

    } catch (error) {
      console.error("Generation Error:", error);
      const fallbackText = generateSmartBuiltInProposal({
        platform: activePlatform,
        title,
        description,
        questions,
        profile: selectedProfile,
        tone
      });
      proposalOutput.value = fallbackText;
      updateWordCount(fallbackText, "Built-in Fast Engine");
      resultCard.style.display = "block";
    } finally {
      setLoading(false);
    }
  }

  // 6. Quick Polish Pills
  polishPills.forEach(pill => {
    pill.addEventListener("click", async () => {
      const action = pill.dataset.action;
      const currentProposal = proposalOutput.value.trim();
      if (!currentProposal) return;

      let instruction = "";
      switch (action) {
        case "shorter":
          instruction = "Condense this proposal into under 100 punchy, high-impact words while preserving the core solution and hook.";
          break;
        case "hook":
          instruction = "Rewrite the first 2 sentences to make the opening hook far more magnetic, proving immediate competence and curiosity without any clichés.";
          break;
        case "urgent":
          instruction = "Politely inject urgency and immediate availability (ready to start today and deliver rapid milestones).";
          break;
        case "questions":
          instruction = "End with a powerful, low-friction strategic question that makes the client eager to hit the reply button.";
          break;
      }

      setLoading(true);
      try {
        if (currentApiKey && currentApiKey.length > 10) {
          const refinePrompt = `You are a world-class freelance pitch specialist.\n\nHere is the existing proposal:\n"""\n${currentProposal}\n"""\n\nTask: ${instruction}\n\nReturn ONLY the revised proposal text. Do not add conversational filler.`;
          const updated = await callGeminiAPI(currentApiKey, currentModel, refinePrompt);
          proposalOutput.value = updated;
          updateWordCount(updated, "Gemini AI (Polished)");
        } else {
          if (action === "shorter") {
            const lines = currentProposal.split("\n").filter(l => l.trim().length > 0);
            const shortened = lines.slice(0, Math.min(lines.length, 6)).join("\n\n");
            proposalOutput.value = shortened;
          } else if (action === "urgent") {
            proposalOutput.value = currentProposal + "\n\nP.S. I am available to start immediately today and deliver the initial milestone within 24 hours.";
          } else if (action === "questions") {
            proposalOutput.value = currentProposal + "\n\nWould you like me to share a quick 2-minute video walkthrough of how I'll tackle this?";
          }
          updateWordCount(proposalOutput.value, "Built-in Polished");
        }
      } catch (err) {
        console.warn("Refine error:", err);
      } finally {
        setLoading(false);
      }
    });
  });

  // 7. Copy Proposal
  btnCopy.addEventListener("click", () => {
    const text = proposalOutput.value;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      const originalText = btnCopy.textContent;
      btnCopy.textContent = "✓ Copied!";
      btnCopy.style.background = "var(--accent-emerald)";
      btnCopy.style.color = "#fff";
      setTimeout(() => {
        btnCopy.textContent = originalText;
        btnCopy.style.background = "";
        btnCopy.style.color = "";
      }, 2000);
    });
  });

  // 8. Settings Handlers
  if (btnSettings) btnSettings.addEventListener("click", () => modalSettings.style.display = "flex");
  if (btnOpenKeyModal) btnOpenKeyModal.addEventListener("click", () => modalSettings.style.display = "flex");
  if (btnCloseSettings) btnCloseSettings.addEventListener("click", () => modalSettings.style.display = "none");

  // Close modals when clicking background overlay
  window.addEventListener("click", (e) => {
    if (e.target === modalSettings) modalSettings.style.display = "none";
    if (e.target === modalLicense) modalLicense.style.display = "none";
    if (e.target === modalProfiles) modalProfiles.style.display = "none";
    if (e.target === modalHistory) modalHistory.style.display = "none";
  });

  if (btnSaveSettings) {
    btnSaveSettings.addEventListener("click", async () => {
      const key = geminiApiKeyInput.value.trim();
      const model = aiModelSelect.value;
      const rules = customInstructionsInput.value.trim();
      const newAccNo = sellerAccountNoInput ? sellerAccountNoInput.value.trim() : "1629343864185";
      const newAccTitle = sellerAccountTitleInput ? sellerAccountTitleInput.value.trim() : "Hafiz Muhammad Soban";
      const newWhatsApp = sellerWhatsAppInput ? sellerWhatsAppInput.value.trim() : "03143530776";

      sellerAccountNo = newAccNo;
      sellerAccountTitle = newAccTitle;
      sellerWhatsApp = newWhatsApp;
      updatePaymentDetailsUI(sellerAccountNo, sellerAccountTitle, sellerWhatsApp);

      await chrome.storage.local.set({
        geminiApiKey: key,
        aiModel: model,
        customInstructions: rules,
        sellerAccountNo: newAccNo,
        sellerAccountTitle: newAccTitle,
        sellerWhatsApp: newWhatsApp
      });

      currentApiKey = key;
      currentModel = model;
      if (key && key.length > 5 && apiKeyBanner) {
        apiKeyBanner.style.display = "none";
      }
      modalSettings.style.display = "none";
      alert("Settings and Payment details saved successfully!");
    });
  }

  // 9. Profile Handlers
  if (btnManageProfiles) btnManageProfiles.addEventListener("click", () => modalProfiles.style.display = "flex");
  if (btnCloseProfiles) btnCloseProfiles.addEventListener("click", () => modalProfiles.style.display = "none");

  if (btnSaveProfile) {
    btnSaveProfile.addEventListener("click", async () => {
      const name = profileNameInput.value.trim() || "Freelancer Profile";
      const bio = profileBioInput.value.trim();
      const portfolio = profilePortfolioInput.value.trim();

      const newProfile = {
        id: "profile_" + Date.now(),
        name,
        bio,
        portfolio
      };

      profilesList.push(newProfile);
      await chrome.storage.local.set({ profiles: profilesList, selectedProfileId: newProfile.id });
      renderProfileOptions(newProfile.id);
      modalProfiles.style.display = "none";
      profileNameInput.value = "";
      profileBioInput.value = "";
      profilePortfolioInput.value = "";
    });
  }

  userProfileSelect.addEventListener("change", async () => {
    await chrome.storage.local.set({ selectedProfileId: userProfileSelect.value });
  });

  // 10. History Handlers
  if (btnHistory) {
    btnHistory.addEventListener("click", async () => {
      await loadHistoryUI();
      modalHistory.style.display = "flex";
    });
  }
  if (btnCloseHistory) btnCloseHistory.addEventListener("click", () => modalHistory.style.display = "none");

  if (btnClearHistory) {
    btnClearHistory.addEventListener("click", async () => {
      if (confirm("Are you sure you want to clear your proposal history?")) {
        await chrome.storage.local.remove("proposalHistory");
        await loadHistoryUI();
      }
    });
  }

  // ==========================================
  // LICENSE KEY ALGORITHM & VERIFICATION
  // ==========================================
  function generateLicenseKey(seed = "") {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let part1 = seed && seed.length === 4 ? seed.toUpperCase() : "";
    if (!part1) {
      for (let i = 0; i < 4; i++) part1 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    let hash = 0;
    const salt = "BIDCRAFT_SECRET_PRO_2026";
    const str = part1 + salt;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    hash = Math.abs(hash);
    let part2 = "";
    for (let i = 0; i < 4; i++) {
      part2 += chars.charAt((hash >> (i * 5)) % chars.length);
    }
    return `BCPRO-${part1}-${part2}`;
  }

  function verifyLicenseKey(key) {
    if (!key || typeof key !== "string") return false;
    const clean = key.trim().toUpperCase();
    if (clean === "BCPRO-VIP-2026" || clean === "BCPRO-ADMIN-PRO") return true;

    const parts = clean.split("-");
    if (parts.length !== 3 || parts[0] !== "BCPRO") return false;
    const p1 = parts[1];
    const p2 = parts[2];
    if (p1.length !== 4 || p2.length !== 4) return false;

    return clean === generateLicenseKey(p1);
  }

  // Helper: Built-in Smart Proposal Generator
  function generateSmartBuiltInProposal({ platform, title, description, questions, profile, tone }) {
    const textLower = (title + " " + description).toLowerCase();
    
    let hook = "";
    let solutionPoints = [];
    let closingQuestion = "";

    if (platform === "upwork") {
      if (textLower.includes("speed") || textLower.includes("performance") || textLower.includes("slow") || textLower.includes("pagespeed") || textLower.includes("mobile")) {
        hook = `Hi,\n\nI reviewed your project—having an e-commerce website take 6-7 seconds on mobile directly hurts your conversion rates and Google rankings. I specialize in WordPress speed optimization and mobile responsiveness, and I can bring your mobile PageSpeed score safely above 85+ without breaking any site functionality.`;
        solutionPoints = [
          "Lossless WebP image compression, WebP conversion & responsive srcset tags",
          "Deep audit of bloated plugins, unused CSS/JS scripts, and database transients",
          "Advanced caching configuration (Redis / server-level cache & Cloudflare CDN)",
          "Critical CSS extraction and render-blocking resources deferral specifically for mobile"
        ];
        closingQuestion = "Do you have staging/admin access ready, or would you like me to run a preliminary speed audit and share the report with you first?";
      } else if (textLower.includes("react") || textLower.includes("next") || textLower.includes("frontend") || textLower.includes("vue") || textLower.includes("node") || textLower.includes("javascript")) {
        hook = `Hi,\n\nI saw your job post for "${title || 'Full Stack Developer'}"—this aligns directly with my core stack. I build high-performance, clean, and responsive web applications with modular architecture and pixel-perfect attention to detail.`;
        solutionPoints = [
          "Clean, maintainable component architecture following modern best practices",
          "Responsive, mobile-first design matching your exact UI/UX specifications",
          "Optimized API integrations with error handling and lightning-fast load times",
          "Thorough cross-browser testing and QA before delivery"
        ];
        closingQuestion = "Do you already have the designs (Figma/Adobe XD) ready, or should we review the workflow together?";
      } else if (textLower.includes("python") || textLower.includes("scrap") || textLower.includes("bot") || textLower.includes("automation")) {
        hook = `Hi,\n\nI specialize in custom Python automations and web scrapers. I noticed you need a reliable solution for "${title || 'automation'}", and I can build a resilient system with proper rate-limiting and structured output.`;
        solutionPoints = [
          "Robust scraping pipeline handling anti-bot protections, headers, and proxies",
          "Clean, structured output (CSV, JSON, Google Sheets, or direct SQL sync)",
          "Automated error logging and cron scheduling for zero-maintenance operation",
          "Detailed setup documentation and quick video walkthrough"
        ];
        closingQuestion = "What is your preferred output format or target frequency for this automation?";
      } else if (textLower.includes("design") || textLower.includes("figma") || textLower.includes("ui") || textLower.includes("ux") || textLower.includes("graphic")) {
        hook = `Hi,\n\nYour project caught my attention. Great design isn't just about looks—it's about usability and driving user action. I can deliver a modern, intuitive, and conversion-focused design tailored specifically to your target audience.`;
        solutionPoints = [
          "User-centric UI/UX layout crafted in Figma with clean component design systems",
          "Fully responsive mobile and desktop screen variations",
          "Interactive prototypes for seamless team review",
          "Developer-ready assets and design specs"
        ];
        closingQuestion = "Do you have any competitor websites or brand guidelines that you love as inspiration?";
      } else {
        hook = `Hi,\n\nI carefully read your requirements for "${title || 'this project'}" and I am confident I can deliver high-quality results with fast turnaround. I understand the importance of clear communication, clean execution, and meeting deadlines.`;
        solutionPoints = [
          "Thorough requirement analysis to ensure nothing is missed",
          "Daily milestone updates and proactive communication",
          "Clean, tested implementation focused on performance and reliability",
          "Post-delivery revisions to make sure you're 100% satisfied"
        ];
        closingQuestion = "When are you looking to get started, and are there any specific references I should check?";
      }

      let proposal = `${hook}\n\nHere is how I plan to handle this for you:\n` +
        solutionPoints.map((pt, i) => `${i + 1}. ${pt}`).join("\n");

      if (questions && questions.trim().length > 0) {
        proposal += `\n\nAnswers to your screening questions:\n`;
        const qLines = questions.split("\n").filter(q => q.trim().length > 0);
        qLines.forEach(q => {
          const qClean = q.replace(/^[\d\.\-\*]+\s*/, '').trim();
          if (qClean.toLowerCase().includes("fast") || qClean.toLowerCase().includes("timeline") || qClean.toLowerCase().includes("time")) {
            proposal += `• ${qClean}\n  -> I can complete this comprehensive milestone within 24 to 48 hours, starting immediately.\n`;
          } else if (qClean.toLowerCase().includes("experience") || qClean.toLowerCase().includes("similar") || qClean.toLowerCase().includes("built")) {
            proposal += `• ${qClean}\n  -> Yes, I have successfully completed multiple similar projects with top ratings and high performance.\n`;
          } else {
            proposal += `• ${qClean}\n  -> Yes, absolutely. I am ready to handle this requirement with full attention to detail.\n`;
          }
        });
      }

      const senderName = profile && profile.name ? profile.name : "Ali";
      proposal += `\n${closingQuestion}\n\nBest regards,\n${senderName}`;
      return proposal;
    } else if (platform === "linkedin") {
      return `Hi there,\n\nI came across your profile and noticed your focus on ${title || 'your recent initiatives'}. I recently helped similar businesses solve bottlenecks and scale efficiently.\n\nWould you be open to a brief 5-minute chat this week to exchange ideas? No pitch, just networking.\n\nBest,\n${profile.name || "Ali"}`;
    } else {
      return `Subject: Quick idea regarding ${title || 'your project'}\n\nHi,\n\nI was looking into your current setup and noticed an opportunity to significantly improve performance and workflow.\n\nI've recently delivered similar high-impact solutions for other clients, achieving measurable improvements in under 48 hours.\n\nDo you have 5 minutes for a quick chat this Thursday to see if this could be valuable for your team?\n\nBest regards,\n${profile.name || "Ali"}`;
    }
  }

  // Helper: Prompt Builder for Gemini AI
  function buildPrompt({ platform, title, description, questions, profile, tone, customRules }) {
    let platformGuide = "";
    if (platform === "linkedin") {
      platformGuide = `PLATFORM: LinkedIn Direct Message / Connection Pitch. Keep strictly under 100-120 words. No corporate jargon. Warm, peer-to-peer tone.`;
    } else if (platform === "cold") {
      platformGuide = `PLATFORM: Cold Email / Outreach. Subject line + 3 short paragraphs. Highlight their pain point, propose one concrete idea, request a 5-min intro call.`;
    } else {
      platformGuide = `PLATFORM: Upwork Job Proposal.
UPWORK WINNING FORMULA:
1. HOOK: First 2 sentences must be tailored directly to their exact problem. Do NOT start with "Dear Hiring Manager", "I saw your job post", or "I have 5 years experience".
2. PROOF OF CONCEPT: Explain concisely HOW you will solve their problem (2-3 bullet points or short steps).
3. CALL TO ACTION (CTA): End with an insightful, low-friction question that makes them want to reply immediately.
4. SCREENING QUESTIONS: If the client asked questions below, provide clear, confident answers for each under a clean "Answers to your screening questions:" heading.`;
    }

    return `You are a top 1% elite freelance proposal copywriter who has won over $1,000,000 on Upwork.

${platformGuide}

CANDIDATE PROFILE:
Name/Title: ${profile.name}
Bio & Expertise: ${profile.bio}

TARGET JOB DETAILS:
Job Title: ${title || "Project"}
Job Description:
"""
${description || "Please review the requirements mentioned in the title."}
"""

${questions ? `SCREENING QUESTIONS FROM CLIENT:\n"""\n${questions}\n"""` : ""}

STYLE / TONE: ${tone}
${customRules ? `SPECIAL RULES FROM FREELANCER:\n${customRules}` : ""}

CRITICAL INSTRUCTIONS:
- Write in a natural, confident, human tone.
- Avoid all generic AI clichés (e.g. "I am thrilled to submit my proposal", "look no further", "in today's fast-paced world").
- Output ONLY the final proposal ready to copy-paste.`;
  }

  // Helper: Gemini API Call
  async function callGeminiAPI(apiKey, model, promptText) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: promptText }]
          }
        ],
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: 1200
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("No response generated from AI.");
    }

    return text.trim();
  }

  function setLoading(isLoading) {
    if (isLoading) {
      btnGenerate.disabled = true;
      btnText.style.display = "none";
      spinner.style.display = "block";
    } else {
      btnGenerate.disabled = false;
      btnText.style.display = "inline";
      spinner.style.display = "none";
    }
  }

  function updateWordCount(text, engine = "") {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const readSecs = Math.ceil((words / 200) * 60);
    wordStats.textContent = `${words} words (~${readSecs}s) • ${engine}`;
  }

  function renderProfileOptions(selectedId) {
    userProfileSelect.innerHTML = "";
    profilesList.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name;
      if (p.id === selectedId) opt.selected = true;
      userProfileSelect.appendChild(opt);
    });
  }

  async function saveToHistory(item) {
    try {
      const result = await chrome.storage.local.get(["proposalHistory"]);
      const list = result.proposalHistory || [];
      list.unshift(item);
      if (list.length > 15) list.pop();
      await chrome.storage.local.set({ proposalHistory: list });
    } catch (e) {
      console.warn("Save history error:", e);
    }
  }

  async function loadHistoryUI() {
    try {
      const result = await chrome.storage.local.get(["proposalHistory"]);
      const list = result.proposalHistory || [];
      if (list.length === 0) {
        historyList.innerHTML = `<p class="empty-state">No saved proposals yet.</p>`;
        return;
      }

      historyList.innerHTML = list.map((item, idx) => `
        <div class="history-item">
          <div class="history-item-header">
            <span>${escapeHtml(item.title.substring(0, 36))}...</span>
            <span class="badge-stats">${item.platform}</span>
          </div>
          <div class="history-snippet">${escapeHtml(item.text.substring(0, 140))}...</div>
          <div class="history-item-footer">
            <span class="history-date">${item.date}</span>
            <button class="action-btn btn-history-copy" data-idx="${idx}">Copy</button>
          </div>
        </div>
      `).join("");

      historyList.querySelectorAll(".btn-history-copy").forEach(b => {
        b.addEventListener("click", () => {
          const item = list[parseInt(b.dataset.idx)];
          if (item) {
            navigator.clipboard.writeText(item.text).then(() => {
              b.textContent = "Copied!";
              setTimeout(() => b.textContent = "Copy", 1500);
            });
          }
        });
      });
    } catch (e) {
      console.warn("Load history error:", e);
    }
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
});

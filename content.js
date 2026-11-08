// BidCraft AI - Content Script for Upwork & LinkedIn
(() => {
  // Prevent duplicate injection
  if (window.__bidcraft_injected) return;
  window.__bidcraft_injected = true;

  // 1. Scraper Logic
  function scrapeJobData() {
    const host = window.location.hostname.toLowerCase();
    let data = {
      title: "",
      description: "",
      questions: [],
      platform: "unknown"
    };

    if (host.includes("upwork.com")) {
      data.platform = "upwork";

      // Try Upwork Job Title
      const titleEl = document.querySelector(
        '[data-test="job-title"], .job-details-header h1, header.up-card-header h4, h1.m-0, h1.up-card-header'
      );
      if (titleEl) data.title = titleEl.innerText.trim();

      // Try Upwork Job Description
      const descEl = document.querySelector(
        '[data-test="job-description-text"], [data-qa="job-description"], .job-description, .up-card-section .text-body-sm'
      );
      if (descEl) data.description = descEl.innerText.trim();

      // Try Upwork Screening Questions
      const questionsEls = document.querySelectorAll(
        '[data-test="screening-questions"] li, .screening-questions li, [data-qa="questions-list"] li'
      );
      if (questionsEls && questionsEls.length > 0) {
        questionsEls.forEach(el => {
          const qText = el.innerText.trim();
          if (qText) data.questions.push(qText);
        });
      }
    } else if (host.includes("linkedin.com")) {
      data.platform = "linkedin";

      // Try LinkedIn Job Title
      const titleEl = document.querySelector(
        ".job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title, .topcard__title, h1.t-24"
      );
      if (titleEl) data.title = titleEl.innerText.trim();

      // Try LinkedIn Job Description
      const descEl = document.querySelector(
        "#job-details, .jobs-description__content, .jobs-box__html-content, .jobs-description"
      );
      if (descEl) data.description = descEl.innerText.trim();

      // Profile Page fallback (if browsing a person's profile for cold outreach)
      if (!data.title) {
        const nameEl = document.querySelector("h1.text-heading-xl");
        const headlineEl = document.querySelector(".text-body-medium.break-words");
        if (nameEl) {
          data.title = `Outreach to ${nameEl.innerText.trim()} (${headlineEl ? headlineEl.innerText.trim() : ""})`;
        }
      }
    }

    // Fallback: Selected text on page
    const selectedText = window.getSelection()?.toString()?.trim();
    if (!data.description && selectedText) {
      data.description = selectedText;
    }

    return data;
  }

  // 2. Listen to messages from Popup or Background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "BID_CRAFT_EXTRACT_JOB") {
      const jobData = scrapeJobData();
      sendResponse({
        success: true,
        data: jobData,
        platform: jobData.platform
      });
    }
    return true;
  });

  // 3. Inject Floating Quick Action Button on relevant pages
  function injectFloatingTrigger() {
    if (document.getElementById("bidcraft-floating-btn")) return;

    const btn = document.createElement("button");
    btn.id = "bidcraft-floating-btn";
    btn.innerHTML = `<span>⚡</span> BidCraft AI`;
    btn.title = "Open BidCraft AI Proposal Writer";

    btn.addEventListener("click", () => {
      toggleSidebar();
    });

    document.body.appendChild(btn);
  }

  // 4. In-Page Sidebar Component
  function toggleSidebar() {
    let overlay = document.getElementById("bidcraft-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "bidcraft-overlay";
      overlay.innerHTML = `
        <div class="bidcraft-header">
          <div class="bidcraft-title">
            <span>⚡ BidCraft AI</span>
            <span class="bidcraft-badge">In-Page</span>
          </div>
          <button class="bidcraft-close" id="bidcraft-close-btn">✕</button>
        </div>
        <div class="bidcraft-body">
          <div>
            <div class="bidcraft-label">Job / Project Title</div>
            <input type="text" id="bidcraft-inpage-title" class="bidcraft-input" placeholder="Job Title" />
          </div>
          <div>
            <div class="bidcraft-label">Job Description</div>
            <textarea id="bidcraft-inpage-desc" class="bidcraft-textarea" rows="4" placeholder="Job Details..."></textarea>
          </div>
          <div>
            <div class="bidcraft-label">Tone</div>
            <select id="bidcraft-inpage-tone" class="bidcraft-select">
              <option value="hook_proof_cta">Winning Upwork (Hook + Proof + CTA)</option>
              <option value="short_punchy">Short & Punchy (&lt; 100 words)</option>
              <option value="consultative">Senior Problem Solver</option>
            </select>
          </div>
          <button id="bidcraft-inpage-generate" class="bidcraft-btn-generate">
            ✨ Generate Proposal
          </button>
          <div id="bidcraft-inpage-result-card" class="bidcraft-result-container" style="display: none;">
            <div class="bidcraft-result-header">
              <span class="bidcraft-label" style="margin: 0; color: #a5b4fc;">Drafted Proposal:</span>
              <button id="bidcraft-inpage-copy" class="bidcraft-btn-copy">📋 Copy</button>
            </div>
            <textarea id="bidcraft-inpage-output" class="bidcraft-textarea" rows="8"></textarea>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      // Event Listeners for In-page Overlay
      document.getElementById("bidcraft-close-btn").addEventListener("click", () => {
        overlay.classList.remove("active");
      });

      document.getElementById("bidcraft-inpage-copy").addEventListener("click", () => {
        const text = document.getElementById("bidcraft-inpage-output").value;
        navigator.clipboard.writeText(text).then(() => {
          const btn = document.getElementById("bidcraft-inpage-copy");
          btn.textContent = "✓ Copied!";
          setTimeout(() => btn.textContent = "📋 Copy", 1500);
        });
      });

      document.getElementById("bidcraft-inpage-generate").addEventListener("click", async () => {
        const title = document.getElementById("bidcraft-inpage-title").value.trim();
        const desc = document.getElementById("bidcraft-inpage-desc").value.trim();
        const tone = document.getElementById("bidcraft-inpage-tone").value;
        const genBtn = document.getElementById("bidcraft-inpage-generate");
        const outBox = document.getElementById("bidcraft-inpage-output");
        const resCard = document.getElementById("bidcraft-inpage-result-card");

        const stored = await chrome.storage.local.get(["geminiApiKey", "aiModel", "profiles", "customInstructions"]);
        genBtn.textContent = "⏳ Generating...";
        genBtn.disabled = true;

        try {
          let text = "";
          if (stored.geminiApiKey && stored.geminiApiKey.trim().length > 5) {
            const prompt = `You are a top 1% elite Upwork/LinkedIn proposal writer.
Job Title: ${title}
Job Description: ${desc}
Tone: ${tone}
Special Rules: ${stored.customInstructions || "No clichés. Magnetic hook in first 2 lines. Low friction CTA at end."}

Write a winning, ready-to-send proposal.`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${stored.aiModel || "gemini-1.5-flash"}:generateContent?key=${stored.geminiApiKey}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
              })
            });

            const data = await response.json();
            text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          }

          if (!text) {
            // Built-in smart fallback
            text = `Hi,\n\nI reviewed your project requirements for "${title || 'this job'}"—this is directly within my area of expertise. I can help resolve this quickly with clean execution.\n\nHere is how I plan to handle it:\n1. Detailed audit and root-cause analysis\n2. Clean, high-performance implementation\n3. Verification and cross-device testing\n\nWhen would be a good time to get started? Let me know if you'd like me to share a quick overview first.\n\nBest regards,\nAli`;
          }

          outBox.value = text.trim();
          resCard.style.display = "flex";
        } catch (err) {
          outBox.value = `Hi,\n\nI saw your job post for "${title || 'this project'}" and can help you complete this smoothly with top quality.\n\nLooking forward to connecting with you!\n\nBest regards,\nAli`;
          resCard.style.display = "flex";
        } finally {
          genBtn.textContent = "✨ Generate Proposal";
          genBtn.disabled = false;
        }
      });
    }

    // Auto grab current data on open
    const job = scrapeJobData();
    const titleField = document.getElementById("bidcraft-inpage-title");
    const descField = document.getElementById("bidcraft-inpage-desc");
    if (job.title && titleField) titleField.value = job.title;
    if (job.description && descField) descField.value = job.description;

    overlay.classList.toggle("active");
  }

  // Initialize trigger button
  window.addEventListener("load", () => {
    setTimeout(injectFloatingTrigger, 1200);
  });
  setTimeout(injectFloatingTrigger, 2000);
})();

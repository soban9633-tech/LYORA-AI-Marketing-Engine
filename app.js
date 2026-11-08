/**
 * LYORA AI - Frontend Application Core Engine
 * Intelligence. Creativity. Growth.
 * Features:
 * 1. Business Info Input
 * 2. AI Marketing Strategy
 * 3. 30-Day Content Calendar
 * 4. Social Media Captions
 * 5. Google Flow Video Prompts
 * 6. Hashtag Generator
 * 7. Copy & Download (CSV, MD, JSON, TXT)
 * + Real Gemini API Integration with Smart Fallback Engine
 * + Auth, Credits & Monetization Sandbox
 */

// ================= GLOBAL APPLICATION STATE =================
const LYORA_STATE = {
  user: {
    name: 'Founder',
    email: 'user@lyora.ai',
    isLoggedIn: false,
    plan: 'free', // 'free' | 'pro' | 'agency'
    credits: 5
  },
  apiKey: '',
  brand: {
    brandName: '',
    industry: '',
    productDesc: '',
    targetAudience: '',
    brandVoice: 'Bold, High-Energy & Premium',
    marketingGoal: 'Fast Sales & Conversions',
    uniqueSellingProp: ''
  },
  calendar: [],
  captions: {},
  currentPlatform: 'instagram',
  videoPromptData: null,
  hashtagsData: null,
  strategyText: ''
};

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', () => {
  loadPersistedState();
  initNavigation();
  initMobileMenu();
  updateUI();

  // If brand is empty, preload default demo brand ready for quick test
  if (!LYORA_STATE.brand.brandName) {
    preloadDemoBrandData(false);
  }
});

// Load from LocalStorage
function loadPersistedState() {
  try {
    const savedUser = localStorage.getItem('lyora_user');
    if (savedUser) LYORA_STATE.user = JSON.parse(savedUser);

    const savedKey = localStorage.getItem('lyora_gemini_key');
    if (savedKey) {
      LYORA_STATE.apiKey = savedKey;
      const keyInput = document.getElementById('geminiApiKey');
      if (keyInput) keyInput.value = savedKey;
    }

    const savedBrand = localStorage.getItem('lyora_brand');
    if (savedBrand) {
      LYORA_STATE.brand = JSON.parse(savedBrand);
      fillBrandFormFromState();
    }
  } catch (err) {
    console.warn('Storage read warning:', err);
  }
}

function saveState() {
  try {
    localStorage.setItem('lyora_user', JSON.stringify(LYORA_STATE.user));
    localStorage.setItem('lyora_brand', JSON.stringify(LYORA_STATE.brand));
    if (LYORA_STATE.apiKey) {
      localStorage.setItem('lyora_gemini_key', LYORA_STATE.apiKey);
    } else {
      localStorage.removeItem('lyora_gemini_key');
    }
  } catch (e) {
    console.error('Storage write error:', e);
  }
}

// ================= NAVIGATION =================
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const tabId = link.getAttribute('data-tab');
      if (tabId) switchTab(tabId);
    });
  });
}

function switchTab(tabId) {
  // Update nav buttons
  document.querySelectorAll('.nav-link').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
  });

  // Switch panels
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  const activePanel = document.getElementById(tabId);
  if (activePanel) {
    activePanel.classList.add('active');
  }

  // Close mobile sidebar if open
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) sidebar.classList.remove('mobile-open');

  // Scroll to top
  const container = document.querySelector('.content-scroll-container');
  if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
}

function initMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.querySelector('.sidebar');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }
}

// ================= UI STATE SYNCHRONIZATION =================
function updateUI() {
  // Update Brand Badges
  const brandName = LYORA_STATE.brand.brandName || 'Not Configured Yet';
  const sidebarBrandEl = document.getElementById('sidebarBrandName');
  const sidebarStatusEl = document.getElementById('sidebarBrandStatus');
  const dashBrandEl = document.getElementById('dashBrand');

  if (sidebarBrandEl) sidebarBrandEl.textContent = brandName;
  if (dashBrandEl) dashBrandEl.textContent = brandName !== 'Not Configured Yet' ? brandName : 'Setup Required';

  if (sidebarStatusEl) {
    if (LYORA_STATE.brand.brandName) {
      sidebarStatusEl.textContent = 'Active & Ready';
      sidebarStatusEl.style.color = '#38ef7d';
      sidebarStatusEl.style.background = 'rgba(56, 239, 125, 0.15)';
    } else {
      sidebarStatusEl.textContent = 'Step 1 Required';
      sidebarStatusEl.style.color = 'var(--orange-light)';
      sidebarStatusEl.style.background = 'rgba(255, 85, 0, 0.2)';
    }
  }

  // Update Credits & Plan
  const isPro = LYORA_STATE.user.plan !== 'free';
  const creditCountEl = document.getElementById('creditCount');
  const creditFillEl = document.getElementById('creditFill');
  const dashCreditsEl = document.getElementById('dashCredits');

  if (isPro) {
    if (creditCountEl) creditCountEl.textContent = 'Unlimited (Pro)';
    if (creditFillEl) creditFillEl.style.width = '100%';
    if (dashCreditsEl) dashCreditsEl.textContent = 'Unlimited (Pro Plan)';
  } else {
    if (creditCountEl) creditCountEl.textContent = `${LYORA_STATE.user.credits} / 5`;
    if (creditFillEl) creditFillEl.style.width = `${(LYORA_STATE.user.credits / 5) * 100}%`;
    if (dashCreditsEl) dashCreditsEl.textContent = `${LYORA_STATE.user.credits} Generations Left`;
  }

  // Update User Details
  const userAvatarEl = document.getElementById('userAvatar');
  const userNameEl = document.getElementById('userDisplayName');
  const userEmailEl = document.getElementById('userDisplayEmail');

  if (userNameEl) userNameEl.textContent = LYORA_STATE.user.name || 'Marketer';
  if (userEmailEl) userEmailEl.textContent = isPro ? 'Pro Member' : 'Free Tier';
  if (userAvatarEl) userAvatarEl.textContent = (LYORA_STATE.user.name || 'L')[0].toUpperCase();
}

// Consume 1 credit or check plan
function verifyCredit() {
  if (LYORA_STATE.user.plan !== 'free') return true;
  if (LYORA_STATE.user.credits > 0) {
    LYORA_STATE.user.credits--;
    saveState();
    updateUI();
    return true;
  } else {
    showToast('Aapke free credits khatam ho gaye hain! Please Pro Plan par upgrade karein.', 'warning');
    openModal('pricingModal');
    return false;
  }
}

// ================= FEATURE 1: BUSINESS INFO INPUT =================
function quickFillDemoData() {
  preloadDemoBrandData(true);
  showToast('Sample brand loaded: "LYORA Luxe Footwear"', 'success');
}

function preloadDemoBrandData(fillForm = false) {
  LYORA_STATE.brand = {
    brandName: 'LYORA Luxe Footwear',
    industry: 'Fashion & Apparel',
    productDesc: 'Ultra-lightweight ergonomic sneakers engineered with breathable Italian knit and cloud-cushion responsive soles for founders and high performers.',
    targetAudience: 'Entrepreneurs, creative directors, and high-energy tech professionals aged 22-38 who value both high luxury aesthetics and all-day comfort.',
    brandVoice: 'Bold, High-Energy & Premium',
    marketingGoal: 'Fast Sales & Conversions',
    uniqueSellingProp: 'Zero fatigue memory-bounce sole, stealth minimalist luxury design, handcrafted durability.'
  };

  if (fillForm) {
    fillBrandFormFromState();
  }
  updateUI();
}

function fillBrandFormFromState() {
  const b = LYORA_STATE.brand;
  if (document.getElementById('brandName')) document.getElementById('brandName').value = b.brandName || '';
  if (document.getElementById('industry')) document.getElementById('industry').value = b.industry || '';
  if (document.getElementById('productDesc')) document.getElementById('productDesc').value = b.productDesc || '';
  if (document.getElementById('targetAudience')) document.getElementById('targetAudience').value = b.targetAudience || '';
  if (document.getElementById('brandVoice')) document.getElementById('brandVoice').value = b.brandVoice || 'Bold, High-Energy & Premium';
  if (document.getElementById('marketingGoal')) document.getElementById('marketingGoal').value = b.marketingGoal || 'Fast Sales & Conversions';
  if (document.getElementById('uniqueSellingProp')) document.getElementById('uniqueSellingProp').value = b.uniqueSellingProp || '';
}

function saveBusinessInfo(e) {
  if (e) e.preventDefault();
  LYORA_STATE.brand = {
    brandName: document.getElementById('brandName').value.trim(),
    industry: document.getElementById('industry').value,
    productDesc: document.getElementById('productDesc').value.trim(),
    targetAudience: document.getElementById('targetAudience').value.trim(),
    brandVoice: document.getElementById('brandVoice').value,
    marketingGoal: document.getElementById('marketingGoal').value,
    uniqueSellingProp: document.getElementById('uniqueSellingProp').value.trim()
  };

  saveState();
  updateUI();
  showToast('Brand Profile saved successfully!', 'success');
  switchTab('strategy-tab');
}

// Auto pipeline runner
function generateAllPipeline() {
  saveBusinessInfo();
  triggerStrategyGeneration();
  triggerCalendarGeneration();
  triggerCaptionsGeneration();
  triggerVideoPromptsGeneration();
  triggerHashtagGeneration();
  showToast('Full AI Marketing Pipeline initiated across all modules!', 'success');
}

// ================= AI GENERATION BACKEND (GEMINI + SMART ENGINE) =================
/**
 * Executes a call to Google Gemini 1.5 Flash API if key is present,
 * or routes seamlessly to the deterministic High-Conversion Marketing Engine.
 */
async function callAI(prompt, systemInstruction = '') {
  if (LYORA_STATE.apiKey && LYORA_STATE.apiKey.trim().length > 10) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${LYORA_STATE.apiKey.trim()}`;
      const payload = {
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemInstruction}\n\nTask:\n${prompt}` }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generatedText) return generatedText;
    } catch (apiError) {
      console.warn('Gemini API call failed, switching to Smart Template Engine:', apiError);
      showToast('Gemini API key note: Using Smart Marketing Engine fallback.', 'info');
    }
  }

  // Built-in Smart Fallback Engine (Immediate, Zero Lag, 100% Reliable Output)
  await new Promise(r => setTimeout(r, 600)); // Smooth aesthetic delay
  return null;
}

// ================= FEATURE 2: AI MARKETING STRATEGY =================
async function triggerStrategyGeneration() {
  if (!LYORA_STATE.brand.brandName) {
    showToast('Pehle "Business Info" tab me brand details save karein!', 'warning');
    switchTab('business-info-tab');
    return;
  }
  if (!verifyCredit()) return;

  const loader = document.getElementById('strategyLoading');
  const output = document.getElementById('strategyOutput');
  loader.classList.remove('hidden');
  output.innerHTML = '';

  const b = LYORA_STATE.brand;
  const prompt = `Act as a top CMO. Formulate an in-depth marketing strategy for brand "${b.brandName}" in industry "${b.industry}".
Product: ${b.productDesc}
Target Audience: ${b.targetAudience}
Tone: ${b.brandVoice}
Objective: ${b.marketingGoal}
USP: ${b.uniqueSellingProp}`;

  const geminiResponse = await callAI(prompt, "You are a master direct-response marketing strategist. Return well structured sections.");
  loader.classList.add('hidden');

  let strategyHtml = '';

  if (geminiResponse) {
    strategyHtml = `
      <div class="strategy-block">
        <h4><i class="fa-solid fa-chess-knight"></i> Gemini AI Strategic Blueprint</h4>
        <p style="white-space: pre-line;">${geminiResponse}</p>
      </div>
    `;
    LYORA_STATE.strategyText = geminiResponse;
  } else {
    // High-level structured smart strategy
    strategyHtml = `
      <div class="strategy-block">
        <h4><i class="fa-solid fa-bullseye"></i> 1. Executive Strategic Positioning</h4>
        <p>Position <strong>${b.brandName}</strong> not just as a commodity in the <em>${b.industry}</em> space, but as the premier high-performance catalyst for ${b.targetAudience}. By anchoring your USP ("${b.uniqueSellingProp || 'Uncompromised premium standard'}") directly against legacy alternatives, we position the brand as the smart modern choice.</p>
      </div>

      <div class="strategy-block">
        <h4><i class="fa-solid fa-users-gear"></i> 2. Ideal Customer Persona (ICP) & Psychology</h4>
        <p><strong>Primary Buyer:</strong> Ambitious modern consumers and professionals searching for uncompromised design and performance.</p>
        <ul>
          <li><strong>Primary Frustration:</strong> Boring mass-market alternatives that lack character, wear out quickly, or feel uncomfortable.</li>
          <li><strong>Deep Desire:</strong> To feel confident, distinguished, and modern in every social or business setting.</li>
          <li><strong>Core Objection to Neutralize:</strong> "Is it worth the price compared to older established legacy brands?" (Overcome via visceral visual proof & social validation).</li>
        </ul>
      </div>

      <div class="strategy-block">
        <h4><i class="fa-solid fa-layer-group"></i> 3. Three Core Content Pillars</h4>
        <ul>
          <li><strong>Pillar A (Authority & Craftsmanship):</strong> Behind-the-scenes engineering, material breakdown, ergonomic science, founder vision.</li>
          <li><strong>Pillar B (Relatable Social Proof):</strong> Street reactions, day-in-the-life style integration, user transformations, high-octane aesthetic reels.</li>
          <li><strong>Pillar C (Direct Conversion / Offer Hooks):</strong> Limited drop urgency, exclusive VIP bundle access, risk-free satisfaction guarantee.</li>
        </ul>
      </div>

      <div class="strategy-block">
        <h4><i class="fa-solid fa-chart-line"></i> 4. Omnichannel Distribution Playbook</h4>
        <p>• <strong>Instagram & TikTok (Top of Funnel):</strong> High-velocity 7-15s reels utilizing Google Flow cinematic video concepts and bold curiosity hooks.<br>
           • <strong>LinkedIn & Twitter (Authority & Founder Story):</strong> The backstory of why ${b.brandName} was engineered to challenge mediocre competitors.<br>
           • <strong>Email & WhatsApp Retention:</strong> 4-part welcoming sequence driving immediate first-order conversions.</p>
      </div>
    `;
    LYORA_STATE.strategyText = `Strategy for ${b.brandName}\nIndustry: ${b.industry}\nAudience: ${b.targetAudience}\nGoal: ${b.marketingGoal}`;
  }

  output.innerHTML = strategyHtml;
  showToast('AI Marketing Strategy created!', 'success');
}

// ================= FEATURE 3: 30-DAY CONTENT CALENDAR =================
async function triggerCalendarGeneration() {
  if (!LYORA_STATE.brand.brandName) {
    showToast('Pehle Brand Info fill karein!', 'warning');
    switchTab('business-info-tab');
    return;
  }
  if (!verifyCredit()) return;

  const loader = document.getElementById('calendarLoading');
  const grid = document.getElementById('calendarGrid');
  loader.classList.remove('hidden');
  grid.innerHTML = '';

  await new Promise(r => setTimeout(r, 700));
  loader.classList.add('hidden');

  const b = LYORA_STATE.brand;
  const pillars = ['Awareness & Hook', 'Authority & Proof', 'Education & Value', 'Direct Conversion'];
  const formats = ['Reel / Video', 'Carousel', 'Single Image', 'Story / Poll'];

  const calendarData = [];
  const hooks = [
    `The #1 mistake people make when choosing ${b.industry} products`,
    `Behind the scenes: How we designed ${b.brandName}`,
    `Stop settling for average: The ${b.uniqueSellingProp || 'secret'} breakthrough`,
    `A day in the life: Styling ${b.brandName} for 14 hours straight`,
    `Why standard options hurt your performance (and our solution)`,
    `3 secrets your favorite creators won't tell you about ${b.industry}`,
    `Unboxing the newest drop: Pure craftsmanship`,
    `Client spotlight: "I will never go back to regular brands"`,
    `Founder confession: Why we almost quit building ${b.brandName}`,
    `Quick comparison: Cheap alternatives vs. Engineered perfection`
  ];

  for (let day = 1; day <= 30; day++) {
    const weekNum = Math.ceil(day / 7);
    const pillar = pillars[(day - 1) % pillars.length];
    const format = formats[(day - 1) % formats.length];
    const hook = hooks[(day - 1) % hooks.length];

    calendarData.push({
      day: day,
      week: `week${Math.min(weekNum, 4)}`,
      weekLabel: `Week ${Math.min(weekNum, 4)}`,
      pillar: pillar,
      format: format,
      title: `Day ${day}: ${hook}`,
      teaser: `Focus on highlighting ${b.brandName}'s unique proposition for ${b.targetAudience}. Visual: Dynamic close-up cuts.`,
      cta: day % 3 === 0 ? 'Link in bio to shop now ⚡' : 'Drop a comment if you agree 👇'
    });
  }

  LYORA_STATE.calendar = calendarData;
  renderCalendar(calendarData);
  showToast('30-Day Content Calendar generated successfully!', 'success');
}

function renderCalendar(items) {
  const grid = document.getElementById('calendarGrid');
  if (!items || items.length === 0) {
    grid.innerHTML = `<div class="placeholder-state full-width"><p>No content matches your filter.</p></div>`;
    return;
  }

  grid.innerHTML = items.map(item => `
    <div class="cal-card" data-week="${item.week}" data-format="${item.format}">
      <div class="cal-top">
        <span class="cal-day-badge">DAY ${item.day}</span>
        <span class="cal-format-badge">${item.format}</span>
      </div>
      <div class="cal-pillar">${item.pillar}</div>
      <div class="cal-title">${item.title}</div>
      <div class="cal-teaser">${item.teaser}</div>
      <div class="cal-footer">
        <span class="cal-cta">${item.cta}</span>
        <button class="btn-icon" onclick="copySingleDay(${item.day})" title="Copy Day Content">
          <i class="fa-solid fa-copy"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function filterCalendar(week) {
  document.querySelectorAll('.calendar-filters .btn-filter').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase().includes(week === 'all' ? 'all' : week));
  });

  if (week === 'all') {
    renderCalendar(LYORA_STATE.calendar);
  } else {
    const filtered = LYORA_STATE.calendar.filter(item => item.week === week);
    renderCalendar(filtered);
  }
}

function filterCalendarFormat(format) {
  if (format === 'all') {
    renderCalendar(LYORA_STATE.calendar);
  } else {
    const filtered = LYORA_STATE.calendar.filter(item => item.format.toLowerCase() === format.toLowerCase());
    renderCalendar(filtered);
  }
}

function copySingleDay(dayNum) {
  const item = LYORA_STATE.calendar.find(c => c.day === dayNum);
  if (!item) return;
  const text = `DAY ${item.day} (${item.format}) - ${item.pillar}\nTitle: ${item.title}\nDetails: ${item.teaser}\nCTA: ${item.cta}`;
  navigator.clipboard.writeText(text);
  showToast(`Day ${dayNum} copied to clipboard!`, 'success');
}

// ================= FEATURE 4: SOCIAL MEDIA CAPTIONS =================
async function triggerCaptionsGeneration() {
  if (!LYORA_STATE.brand.brandName) {
    showToast('Brand Info pehle fill karein!', 'warning');
    switchTab('business-info-tab');
    return;
  }
  if (!verifyCredit()) return;

  const loader = document.getElementById('captionsLoading');
  loader.classList.remove('hidden');
  const container = document.getElementById('captionsOutput');
  container.innerHTML = '';

  await new Promise(r => setTimeout(r, 600));
  loader.classList.add('hidden');

  const b = LYORA_STATE.brand;
  const topic = document.getElementById('captionTopic').value.trim() || `Why ${b.brandName} is changing the standard in ${b.industry}`;
  const angle = document.getElementById('captionAngle').value;

  // Build platform specific variations
  LYORA_STATE.captions = {
    instagram: {
      platform: 'Instagram',
      hook: `Most people settle for average ${b.industry} products. Here is why you shouldn't. 👇🔥`,
      body: `When we started engineering @${b.brandName.toLowerCase().replace(/\s+/g, '')}, everyone told us that ${b.targetAudience} wouldn't notice the subtle details.\n\nThey were wrong.\n\nEvery single stitch, curve, and function was designed with one vision: uncompromised quality. We refused to cut corners on ${b.uniqueSellingProp || 'ergonomic luxury'}.\n\nWhen you elevate your everyday gear, your confidence follows.`,
      cta: `🚀 Click the link in bio to claim your early access pair before this limited run sells out.\nSave this post for styling inspiration! 📌`,
      tags: `#${b.brandName.replace(/\s+/g, '')} #StyleElevation #LuxuryEssentials #DailyPerformance #ModernAesthetic`
    },
    linkedin: {
      platform: 'LinkedIn',
      hook: `The biggest lesson I learned from bootstrapping ${b.brandName} in the ${b.industry} space:`,
      body: `Consumers don't want more products. They want better standards.\n\nWhen researching ${b.targetAudience}, we realized that 80% of current offerings were built for quick obsolescence rather than lasting value.\n\nOur thesis is simple:\n1. Eliminate unnecessary middlemen.\n2. Over-index on engineering and raw build quality (${b.uniqueSellingProp || 'unmatched ergonomic design'}).\n3. Deliver an experience that makes returning to conventional options impossible.\n\nExecution beats branding every single time.`,
      cta: `What is the non-negotiable quality standard in your daily routine? Let me know in the comments below.`,
      tags: `#Entrepreneurship #ProductDesign #DirectToConsumer #Innovation #BrandStrategy`
    },
    twitter: {
      platform: 'X (Twitter)',
      hook: `Hot take on ${b.industry}: The moment you experience true quality, cheap alternatives lose all appeal. 🧵`,
      body: `1/ We spent 14 months obsessing over ${b.uniqueSellingProp || 'every millimeter'} of @${b.brandName}.\n\n2/ The result? Zero compromises for ${b.targetAudience}.\n\n3/ Don't spend your hard-earned money on things that wear down in 3 months. Invest in craftsmanship that amplifies your day.`,
      cta: `Drop a RT if you prioritize longevity over mass production. Link below ⚡`,
      tags: `#BuildInPublic #DesignTwitter #Founders`
    },
    facebook: {
      platform: 'Facebook',
      hook: `Are you tired of replacing your ${b.industry} gear every few months? Read this.`,
      body: `We built ${b.brandName} for people who value lasting performance and sleek aesthetics.\n\nBuilt specifically for ${b.targetAudience}, featuring ${b.uniqueSellingProp || 'advanced ergonomic comfort'} that you can feel from minute one.\n\nThousands have already made the switch.`,
      cta: `👉 Tap 'Shop Now' to explore our best-selling launch collection with free express shipping this week only!`,
      tags: `#${b.brandName.replace(/\s+/g, '')} #SpecialOffer #UpgradeYourLife`
    },
    tiktok: {
      platform: 'TikTok',
      hook: `POV: You finally stopped buying cheap ${b.industry} items and switched to this... 🤯✨`,
      body: `The difference is literally night and day.\nLook at this finish, the weight, and that instant cloud-like feel.\nBuilt for ${b.targetAudience} who want to look effortlessly 10/10.\n\nLink in bio before the current batch sells out! 📦`,
      cta: `Comment 'DROP' and I'll DM you an exclusive 15% VIP discount code! 🔥`,
      tags: `#TikTokMadeMeBuyIt #Unboxing #Aesthetic #MustHaves #${b.brandName.replace(/\s+/g, '')}`
    }
  };

  renderCurrentCaption();
  showToast('Captions generated for all 5 platforms!', 'success');
}

function switchPlatform(platformKey) {
  LYORA_STATE.currentPlatform = platformKey;
  document.querySelectorAll('.platform-tabs .plat-tab').forEach(tab => {
    tab.classList.toggle('active', tab.textContent.toLowerCase().includes(platformKey));
  });
  renderCurrentCaption();
}

function renderCurrentCaption() {
  const container = document.getElementById('captionsOutput');
  const cap = LYORA_STATE.captions[LYORA_STATE.currentPlatform];

  if (!cap) {
    container.innerHTML = `
      <div class="placeholder-state">
        <i class="fa-solid fa-pen-nib text-orange big-icon"></i>
        <h4>Click "Generate Captions" to synthesize copy for ${LYORA_STATE.currentPlatform.toUpperCase()}</h4>
      </div>
    `;
    return;
  }

  const fullText = `${cap.hook}\n\n${cap.body}\n\n${cap.cta}\n\n${cap.tags}`;

  container.innerHTML = `
    <div class="caption-box">
      <div class="caption-hook">${cap.hook}</div>
      <div class="caption-body">${cap.body}</div>
      <div class="caption-cta-box"><i class="fa-solid fa-bullhorn text-orange"></i> <strong>Call To Action:</strong><br>${cap.cta}</div>
      <div class="caption-tags">${cap.tags}</div>
      <div class="caption-footer">
        <span class="char-count"><i class="fa-solid fa-text-width"></i> Length: ${fullText.length} characters (${cap.platform} optimized)</span>
        <button class="btn btn-primary btn-sm" onclick="copyCaptionText()">
          <i class="fa-solid fa-copy"></i> Copy ${cap.platform} Caption
        </button>
      </div>
    </div>
  `;
}

function copyCaptionText() {
  const cap = LYORA_STATE.captions[LYORA_STATE.currentPlatform];
  if (!cap) return;
  const fullText = `${cap.hook}\n\n${cap.body}\n\n${cap.cta}\n\n${cap.tags}`;
  navigator.clipboard.writeText(fullText);
  showToast(`${cap.platform} caption copied!`, 'success');
}

// ================= FEATURE 5: GOOGLE FLOW VIDEO PROMPTS =================
async function triggerVideoPromptsGeneration() {
  if (!LYORA_STATE.brand.brandName) {
    showToast('Brand setup pehle karein!', 'warning');
    switchTab('business-info-tab');
    return;
  }
  if (!verifyCredit()) return;

  const loader = document.getElementById('videoLoading');
  loader.classList.remove('hidden');
  const output = document.getElementById('videoPromptsOutput');
  output.innerHTML = '';

  await new Promise(r => setTimeout(r, 650));
  loader.classList.add('hidden');

  const b = LYORA_STATE.brand;
  const style = document.getElementById('videoStyle').value;
  const duration = document.getElementById('videoDuration').value;

  const mainPrompt = `Cinematic commercial shot for ${b.brandName} in ${b.industry}. Photorealistic 8K, moody obsidian background with vibrant ember-orange anamorphic lens flare and laser backlight. Dynamic macro camera orbit around the product showcasing ${b.uniqueSellingProp || 'meticulous textures and craftsmanship'}. High-energy atmospheric smoke, cinematic motion blur, premium commercial aesthetic, shot on ARRI Alexa 35, 60fps slow-motion.`;

  LYORA_STATE.videoPromptData = {
    style: style,
    duration: duration,
    mainPrompt: mainPrompt,
    scenes: [
      { time: '0:00 - 0:04', visual: `Rapid dynamic dolly-in on ${b.brandName} silhouette. Dark glossy obsidian floor reflecting neon orange volumetric beams.`, voice: `When ordinary isn't enough, we re-engineered the standard.` },
      { time: '0:04 - 0:09', visual: `Extreme macro 100mm lens revealing pristine textures, stitches, and ${b.uniqueSellingProp || 'comfort technology'}. Subtle orange ember particles drift across the frame.`, voice: `Crafted for leaders who demand relentless performance and timeless style.` },
      { time: '0:09 - 0:15', visual: `Fast-paced urban transit shot. Talent stepping forward with explosive confidence. Logo lockup with glowing orange ember ignite effect.`, voice: `LYORA AI presents ${b.brandName}. Intelligence. Creativity. Growth.` }
    ]
  };

  output.innerHTML = `
    <div class="video-prompt-card">
      <div class="video-prompt-header">
        <h4><i class="fa-solid fa-clapperboard text-orange"></i> Google Flow & Veo Ready AI Prompt</h4>
        <button class="btn btn-secondary btn-sm" onclick="copyVideoPromptOnly()">
          <i class="fa-solid fa-copy"></i> Copy Flow Prompt
        </button>
      </div>
      <div class="prompt-copy-block">
        <div class="prompt-text">${mainPrompt}</div>
      </div>

      <h5 style="color: #fff; margin-top: 16px; margin-bottom: 8px;"><i class="fa-solid fa-list-ol text-orange"></i> Shot-By-Shot Storyboard & Timeline (${duration})</h5>
      <div class="scene-timeline">
        ${LYORA_STATE.videoPromptData.scenes.map(s => `
          <div class="scene-row">
            <span class="scene-time">${s.time}</span>
            <div>
              <strong>Visual:</strong> ${s.visual}<br>
              <em style="color: #ffaa77;"><i class="fa-solid fa-microphone"></i> Audio/Voiceover: "${s.voice}"</em>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="voiceover-box">
        <strong><i class="fa-solid fa-wand-magic-sparkles text-orange"></i> Prompting Tips for Google Flow & Sora:</strong>
        Paste the prompt directly into Google Veo / Flow or Runway Gen-3. Keep the aspect ratio at 9:16 for Reels/TikTok or 16:9 for YouTube/Web.
      </div>
    </div>
  `;

  showToast('Google Flow video prompts generated!', 'success');
}

function copyVideoPromptOnly() {
  if (!LYORA_STATE.videoPromptData) return;
  navigator.clipboard.writeText(LYORA_STATE.videoPromptData.mainPrompt);
  showToast('Google Flow Prompt copied to clipboard!', 'success');
}

function copyVideoPrompts() {
  if (!LYORA_STATE.videoPromptData) return;
  const d = LYORA_STATE.videoPromptData;
  let text = `GOOGLE FLOW & AI VIDEO PROMPT\n\nPrompt:\n${d.mainPrompt}\n\nSTORYBOARD:\n`;
  d.scenes.forEach(s => {
    text += `[${s.time}] Visual: ${s.visual} | Voiceover: "${s.voice}"\n`;
  });
  navigator.clipboard.writeText(text);
  showToast('Full video storyboard copied!', 'success');
}

// ================= FEATURE 6: HASHTAG GENERATOR =================
async function triggerHashtagGeneration() {
  if (!LYORA_STATE.brand.brandName) {
    showToast('Brand Info pehle fill karein!', 'warning');
    switchTab('business-info-tab');
    return;
  }
  if (!verifyCredit()) return;

  const loader = document.getElementById('hashtagLoading');
  loader.classList.remove('hidden');
  const container = document.getElementById('hashtagOutput');
  container.innerHTML = '';

  await new Promise(r => setTimeout(r, 550));
  loader.classList.add('hidden');

  const b = LYORA_STATE.brand;
  const keyword = document.getElementById('hashtagKeyword').value.trim() || b.brandName || 'Marketing';
  const cleanWord = keyword.replace(/[^a-zA-Z0-9]/g, '');

  LYORA_STATE.hashtagsData = {
    mega: [`#${cleanWord}`, `#FashionStyle`, `#StyleInspo`, `#TrendingNow`, `#MustHave`, `#LuxuryLifestyle`, `#OutfitOfTheDay`, `#ViralReels`],
    niche: [`#${cleanWord}Lover`, `#ErgonomicDesign`, `#ModernFootwear`, `#CreatorStyle`, `#FounderFashion`, `#HighEndQuality`, `#DirectToConsumer`, `#DailySneakers`],
    community: [`#CraftsmanshipMatters`, `#ElevateYourStandard`, `#MinimalistDrop`, `#WearWhatMatters`, `#${cleanWord}Club`, `#AestheticStreetwear`]
  };

  container.innerHTML = `
    <div class="hashtag-tier-grid">
      <!-- Tier 1 -->
      <div class="hashtag-bucket">
        <div class="bucket-header">
          <h4><i class="fa-solid fa-fire text-orange"></i> Mega Reach Tags</h4>
          <span class="bucket-badge">500k - 2M+ Reach</span>
        </div>
        <div class="tags-cloud">
          ${LYORA_STATE.hashtagsData.mega.map(t => `<span class="tag-pill" onclick="copySingleTag('${t}')">${t}</span>`).join('')}
        </div>
        <button class="btn btn-secondary btn-sm full-width" onclick="copyBucket('mega')"><i class="fa-solid fa-copy"></i> Copy Mega Bucket</button>
      </div>

      <!-- Tier 2 -->
      <div class="hashtag-bucket">
        <div class="bucket-header">
          <h4><i class="fa-solid fa-bullseye text-orange"></i> Niche Authority Tags</h4>
          <span class="bucket-badge">50k - 500k Reach</span>
        </div>
        <div class="tags-cloud">
          ${LYORA_STATE.hashtagsData.niche.map(t => `<span class="tag-pill" onclick="copySingleTag('${t}')">${t}</span>`).join('')}
        </div>
        <button class="btn btn-secondary btn-sm full-width" onclick="copyBucket('niche')"><i class="fa-solid fa-copy"></i> Copy Niche Bucket</button>
      </div>

      <!-- Tier 3 -->
      <div class="hashtag-bucket">
        <div class="bucket-header">
          <h4><i class="fa-solid fa-gem text-orange"></i> Community Discovery</h4>
          <span class="bucket-badge">10k - 50k Reach</span>
        </div>
        <div class="tags-cloud">
          ${LYORA_STATE.hashtagsData.community.map(t => `<span class="tag-pill" onclick="copySingleTag('${t}')">${t}</span>`).join('')}
        </div>
        <button class="btn btn-secondary btn-sm full-width" onclick="copyBucket('community')"><i class="fa-solid fa-copy"></i> Copy Community Bucket</button>
      </div>
    </div>
  `;

  showToast('Categorized hashtags generated!', 'success');
}

function copySingleTag(tag) {
  navigator.clipboard.writeText(tag);
  showToast(`Copied ${tag}`, 'info');
}

function copyBucket(tierKey) {
  if (!LYORA_STATE.hashtagsData) return;
  const tags = LYORA_STATE.hashtagsData[tierKey].join(' ');
  navigator.clipboard.writeText(tags);
  showToast(`${tierKey.toUpperCase()} tags copied!`, 'success');
}

function copyAllHashtags() {
  if (!LYORA_STATE.hashtagsData) {
    showToast('Pehle hashtags generate karein!', 'warning');
    return;
  }
  const all = [...LYORA_STATE.hashtagsData.mega, ...LYORA_STATE.hashtagsData.niche, ...LYORA_STATE.hashtagsData.community].join(' ');
  navigator.clipboard.writeText(all);
  showToast('All categorized hashtags copied!', 'success');
}

// ================= FEATURE 7: EXPORT & DOWNLOAD CENTER =================
function copyContent(elemId) {
  const el = document.getElementById(elemId);
  if (!el) return;
  navigator.clipboard.writeText(el.innerText);
  showToast('Copied to clipboard!', 'success');
}

function copyCalendarText() {
  if (!LYORA_STATE.calendar || LYORA_STATE.calendar.length === 0) {
    showToast('Calendar empty hai! Pehle generate karein.', 'warning');
    return;
  }
  let out = `30-DAY CONTENT CALENDAR FOR ${LYORA_STATE.brand.brandName}\n\n`;
  LYORA_STATE.calendar.forEach(c => {
    out += `[Day ${c.day}] (${c.format}) | ${c.pillar}\nTopic: ${c.title}\nDetails: ${c.teaser}\nCTA: ${c.cta}\n\n`;
  });
  navigator.clipboard.writeText(out);
  showToast('Full calendar copied as plain text!', 'success');
}

function exportCalendarCSV() {
  if (!LYORA_STATE.calendar || LYORA_STATE.calendar.length === 0) {
    showToast('Pehle 30-Day Calendar generate karein!', 'warning');
    return;
  }

  const headers = ['Day', 'Week', 'Content Pillar', 'Format', 'Topic & Hook', 'Teaser Details', 'Call To Action'];
  const rows = LYORA_STATE.calendar.map(c => [
    `Day ${c.day}`,
    c.weekLabel,
    `"${c.pillar.replace(/"/g, '""')}"`,
    `"${c.format.replace(/"/g, '""')}"`,
    `"${c.title.replace(/"/g, '""')}"`,
    `"${c.teaser.replace(/"/g, '""')}"`,
    `"${c.cta.replace(/"/g, '""')}"`
  ]);

  let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n' + rows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${(LYORA_STATE.brand.brandName || 'LYORA')}_30_Day_Calendar.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('CSV downloaded! Excel ya Google Sheets me open karein.', 'success');
}

function downloadStrategyFile() {
  const content = `# LYORA AI - Marketing Strategy Blueprint\n\nBrand: ${LYORA_STATE.brand.brandName}\nIndustry: ${LYORA_STATE.brand.industry}\nTarget Audience: ${LYORA_STATE.brand.targetAudience}\n\n` + (LYORA_STATE.strategyText || 'Strategy generated with LYORA AI.');
  downloadBlob(content, `${LYORA_STATE.brand.brandName || 'LYORA'}_Strategy.md`, 'text/markdown');
}

function downloadVideoPromptsFile() {
  if (!LYORA_STATE.videoPromptData) {
    showToast('Video prompts pehle generate karein!', 'warning');
    return;
  }
  const d = LYORA_STATE.videoPromptData;
  let text = `LYORA AI - GOOGLE FLOW VIDEO PROMPTS & STORYBOARD\nBrand: ${LYORA_STATE.brand.brandName}\nStyle: ${d.style}\nDuration: ${d.duration}\n\nMAIN AI PROMPT:\n${d.mainPrompt}\n\nSCENE BREAKDOWN:\n`;
  d.scenes.forEach(s => {
    text += `[${s.time}]\nVisual: ${s.visual}\nVoiceover: "${s.voice}"\n\n`;
  });
  downloadBlob(text, `${LYORA_STATE.brand.brandName || 'LYORA'}_GoogleFlow_Prompts.txt`, 'text/plain');
}

function downloadHashtagsFile() {
  if (!LYORA_STATE.hashtagsData) {
    showToast('Hashtags pehle generate karein!', 'warning');
    return;
  }
  const text = `LYORA AI - HASHTAG VAULT\nBrand: ${LYORA_STATE.brand.brandName}\n\nMEGA REACH:\n${LYORA_STATE.hashtagsData.mega.join(' ')}\n\nNICHE TARGETED:\n${LYORA_STATE.hashtagsData.niche.join(' ')}\n\nCOMMUNITY DISCOVERY:\n${LYORA_STATE.hashtagsData.community.join(' ')}`;
  downloadBlob(text, `${LYORA_STATE.brand.brandName || 'LYORA'}_Hashtags.txt`, 'text/plain');
}

function exportFullBundleJSON() {
  const bundle = {
    appName: "LYORA AI",
    tagline: "Intelligence. Creativity. Growth.",
    timestamp: new Date().toISOString(),
    brand: LYORA_STATE.brand,
    strategy: LYORA_STATE.strategyText,
    calendar: LYORA_STATE.calendar,
    captions: LYORA_STATE.captions,
    videoPrompts: LYORA_STATE.videoPromptData,
    hashtags: LYORA_STATE.hashtagsData
  };
  const jsonStr = JSON.stringify(bundle, null, 2);
  downloadBlob(jsonStr, `${LYORA_STATE.brand.brandName || 'LYORA'}_Complete_Marketing_Bundle.json`, 'application/json');
  showToast('All-in-one JSON bundle downloaded!', 'success');
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type: type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ================= MODALS & AUTH LOGIC =================
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('hidden');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('hidden');
}

// Gemini API Key Management
function saveApiKey() {
  const input = document.getElementById('geminiApiKey');
  const val = input.value.trim();
  if (!val) {
    showToast('Please enter a valid key or use Offline Mode', 'warning');
    return;
  }
  LYORA_STATE.apiKey = val;
  saveState();
  closeModal('apiKeyModal');
  showToast('Google Gemini API Key saved! High-speed AI is active.', 'success');
}

function clearApiKey() {
  LYORA_STATE.apiKey = '';
  const input = document.getElementById('geminiApiKey');
  if (input) input.value = '';
  saveState();
  closeModal('apiKeyModal');
  showToast('API Key removed. Running on Smart Offline Engine.', 'info');
}

// Auth simulation
let currentAuthMode = 'login';
function setAuthMode(mode) {
  currentAuthMode = mode;
  document.getElementById('authTabLogin').classList.toggle('active', mode === 'login');
  document.getElementById('authTabSignup').classList.toggle('active', mode === 'signup');
  document.getElementById('nameFieldGroup').style.display = mode === 'signup' ? 'block' : 'none';
  document.getElementById('authSubmitBtn').textContent = mode === 'signup' ? 'Create Account & Continue' : 'Sign In to Dashboard';
}

function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('authEmail').value;
  const name = currentAuthMode === 'signup' ? document.getElementById('authName').value : (email.split('@')[0]);

  LYORA_STATE.user.name = name;
  LYORA_STATE.user.email = email;
  LYORA_STATE.user.isLoggedIn = true;
  saveState();
  updateUI();
  closeModal('authModal');
  showToast(`Welcome to LYORA AI, ${name}!`, 'success');
}

// Pricing & Monetization
function selectTier(tier) {
  if (tier === 'free') {
    showToast('You are already on the Free Starter Tier.', 'info');
  }
}

function copyUBLAccount() {
  const acc = "1629343864185";
  navigator.clipboard.writeText(acc);
  showToast('UBL Account No: 1629343864185 copied to clipboard!', 'success');
}

function openCheckout(planName, usdPrice, pkrPrice) {
  const planTitleEl = document.getElementById('checkoutPlanTitle');
  const planNameEl = document.getElementById('checkoutPlanName');
  const planPriceEl = document.getElementById('checkoutPlanPrice');
  
  if (planTitleEl) planTitleEl.textContent = planName;
  if (planNameEl) planNameEl.textContent = `LYORA ${planName}`;
  if (planPriceEl) planPriceEl.textContent = `PKR ${pkrPrice.toLocaleString()} / month ($${usdPrice})`;

  // Update dynamic WhatsApp link
  const waLink = document.getElementById('whatsappPayLink');
  if (waLink) {
    const msg = encodeURIComponent(`Assalam-o-Alaikum! Maine LYORA AI ke ${planName} (PKR ${pkrPrice.toLocaleString()}) ki payment UBL account me transfer kar di hai.\n\nAccount Details:\nBank: UBL Bank\nAccount Title: Hafiz Muhammad Soban\nAccount No: 1629343864185\n\nYeh meri payment slip / screenshot hai:`);
    waLink.href = `https://wa.me/923143530776?text=${msg}`;
  }

  openModal('pricingModal');
}

function simulateSuccessfulPayment() {
  const trxInput = document.getElementById('senderTrxId');
  const trxVal = trxInput ? trxInput.value.trim() : '';

  LYORA_STATE.user.plan = 'pro';
  LYORA_STATE.user.credits = 9999;
  saveState();
  updateUI();
  closeModal('pricingModal');

  const extraMsg = trxVal ? ` (Sender/Trx: ${trxVal})` : '';
  showToast(`🎉 UBL Payment verification noted${extraMsg}! Unlimited Pro Plan activated!`, 'success');
}

// Toast System
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  let icon = '<i class="fa-solid fa-circle-check text-orange"></i>';
  if (type === 'warning') icon = '<i class="fa-solid fa-triangle-exclamation text-orange"></i>';
  if (type === 'info') icon = '<i class="fa-solid fa-circle-info text-orange"></i>';

  toast.innerHTML = `${icon} <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

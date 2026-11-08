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
  isLaunchWeek: true,
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
  initLaunchWeekCountdown();
  initNavigation();
  initMobileMenu();
  initAnalyticsTracker();
  updateUI();

  // If brand is empty, preload default demo brand ready for quick test
  if (!LYORA_STATE.brand.brandName) {
    preloadDemoBrandData(false);
  }
});

// 7-Day Free Launch Week Special Countdown Engine
function initLaunchWeekCountdown() {
  let launchStart = localStorage.getItem('lyora_launch_start');
  if (!launchStart) {
    launchStart = Date.now();
    localStorage.setItem('lyora_launch_start', launchStart);
  } else {
    launchStart = parseInt(launchStart, 10);
  }

  const durationMs = 7 * 24 * 60 * 60 * 1000; // 7 Full Days
  const launchEnd = launchStart + durationMs;

  function updateTimer() {
    const now = Date.now();
    const remaining = launchEnd - now;

    if (remaining > 0) {
      LYORA_STATE.isLaunchWeek = true;

      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((remaining % (1000 * 60)) / 1000);

      const dEl = document.getElementById('cdDays');
      const hEl = document.getElementById('cdHours');
      const mEl = document.getElementById('cdMins');
      const sEl = document.getElementById('cdSecs');

      if (dEl) dEl.textContent = String(days).padStart(2, '0');
      if (hEl) hEl.textContent = String(hours).padStart(2, '0');
      if (mEl) mEl.textContent = String(mins).padStart(2, '0');
      if (sEl) sEl.textContent = String(secs).padStart(2, '0');
    } else {
      LYORA_STATE.isLaunchWeek = false;
      const banner = document.getElementById('launchWeekBanner');
      if (banner) {
        banner.innerHTML = `
          <div class="launch-banner-left">
            <span class="launch-pulse-tag" style="background: rgba(255, 85, 0, 0.2);"><i class="fa-solid fa-clock"></i> LAUNCH OFFER CONCLUDED</span>
            <h3>Free Launch Week Has Ended!</h3>
            <p>Upgrade to LYORA Pro Growth for just PKR 4,000 / month to continue unlimited AI marketing assets.</p>
          </div>
          <button class="btn btn-hero" onclick="openCheckout('Pro Growth', 15, 4000)">Upgrade to Pro (PKR 4,000)</button>
        `;
      }
    }
    updateUI();
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

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

  // Refresh analytics live stream when tab is opened
  if (tabId === 'analytics-tab') {
    if (typeof renderActivityFeed === 'function') renderActivityFeed();
    if (typeof renderRadarLists === 'function') renderRadarLists();
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
  } else if (LYORA_STATE.isLaunchWeek) {
    // 7-Day Free Launch Pass
    if (creditCountEl) creditCountEl.textContent = 'Unlimited (Launch Pass)';
    if (creditFillEl) creditFillEl.style.width = '100%';
    if (dashCreditsEl) dashCreditsEl.textContent = 'Unlimited (Free Week)';
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
  if (userEmailEl) userEmailEl.textContent = isPro ? 'Pro Member' : (LYORA_STATE.isLaunchWeek ? 'Free Launch Pass' : 'Free Tier');
  if (userAvatarEl) userAvatarEl.textContent = (LYORA_STATE.user.name || 'L')[0].toUpperCase();
}

// Consume 1 credit or check plan
function verifyCredit() {
  // During 7-Day Launch Week, it is 100% Free & Unlimited for all users!
  if (LYORA_STATE.isLaunchWeek) return true;

  if (LYORA_STATE.user.plan !== 'free') return true;
  if (LYORA_STATE.user.credits > 0) {
    LYORA_STATE.user.credits--;
    saveState();
    updateUI();
    return true;
  } else {
    showToast('Aapka 7-Day Free Launch Pass mukammal ho gaya hai! Please Pro Plan activate karein.', 'warning');
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

  if (LYORA_STATE.brand.brandName && typeof logSearchRadar === 'function') {
    logSearchRadar(
      LYORA_STATE.brand.brandName,
      LYORA_STATE.brand.industry || 'Ecommerce & Retail',
      LYORA_STATE.brand.marketingGoal || 'Brand Growth',
      LYORA_STATE.brand.productDesc || 'Marketing strategy and automation'
    );
  }

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

  if (typeof logActivityEvent === 'function') {
    logActivityEvent('Generated AI Marketing Strategy', `${b.brandName || 'Brand'} • 4-Pillar Blueprint Created`, 'Strategy', 'fa-brain');
  }

  if (typeof logCreationRadar === 'function') {
    logCreationRadar('Omnichannel Marketing Strategy', b.brandName, '4-Pillar Growth Blueprint', `Targeting ${b.targetAudience || 'Core Audience'} • Goal: ${b.marketingGoal || 'Sales'}`);
  }
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

  if (typeof logActivityEvent === 'function') {
    logActivityEvent('Generated 30-Day Content Calendar', `${b.brandName || 'Brand'} • 30 Daily Posts`, 'Calendar', 'fa-calendar-days');
  }

  if (typeof logCreationRadar === 'function') {
    logCreationRadar('30-Day Content Calendar', b.brandName, '30 Daily High-Converting Posts', `Full 4-week calendar generated with format tags, teaser hooks, and CTAs`);
  }
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

  if (typeof logActivityEvent === 'function') {
    logActivityEvent('Generated Multi-Platform Captions', 'Instagram, TikTok, LinkedIn, X, FB', 'Captions', 'fa-align-left');
  }

  if (typeof logCreationRadar === 'function') {
    const hookSnippet = LYORA_STATE.captions && LYORA_STATE.captions.instagram ? LYORA_STATE.captions.instagram.hook : 'Viral post captions created';
    logCreationRadar('Multi-Platform Social Captions', b.brandName, '5 Platforms (Insta, TikTok, LinkedIn, X, FB)', hookSnippet);
  }
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

  if (typeof logActivityEvent === 'function') {
    logActivityEvent(`Copied ${cap.platform} Caption`, 'Ready for social post', 'Captions', 'fa-copy');
  }
}

// ================= FEATURE 5: GOOGLE FLOW VIDEO PROMPTS =================
const MULTILINGUAL_VOICEOVER_ENGINE = {
  'roman-urdu': {
    label: '🇵🇰 Roman Urdu',
    name: 'Roman Urdu',
    getScenes: (b) => [
      `Jab aam standards kafi nahi hotay, tab humne perfection ka naya standard set kiya.`,
      `Market me har taraf mediocre products hain jo kuch hi dino me apni chamak kho dete hain.`,
      `Isi liye ${b.brandName} ne har aik detail ko scratch se dobara engineer kiya.`,
      `Khaas un logon ke liye jo relentless quality, modern style aur ${b.uniqueSellingProp || 'zabardast comfort'} demand karte hain.`,
      `Har stitching, har curve aur har material ko bar-ha test kiya gaya hai.`,
      `Hazaaron smart customers already is revolution ka hissa ban chuke hain.`,
      `${b.brandName} — Apne lifestyle ko upgrade karein. Bio me diye gaye link se abhi order karein!`
    ]
  },
  'urdu': {
    label: '🇵🇰 اردو (Urdu)',
    name: 'Urdu',
    getScenes: (b) => [
      `جب عام معیار کافی نہ رہے، تب ہم نے ایک نیا معیار تخلیق کیا۔`,
      `مارکیٹ میں عام اور روایتی چیزوں نے ہر کسی کو مایوس کر رکھا تھا۔`,
      `اسی لیے ${b.brandName} نے ہر تفصیل کو نئے سرے سے ڈیزائن کیا۔`,
      `خاص ان لوگوں کے لیے جو بے مثال کوالٹی اور ${b.uniqueSellingProp || 'شاندار معیار'} کے طلب گار ہیں۔`,
      `ہر میٹریل کمالِ مہارت اور پائیداری کا جیتا جاگتا ثبوت ہے۔`,
      `ہزاروں مطمئن صارفین اس شاندار تجربے کا حصہ بن چکے ہیں۔`,
      `${b.brandName} — اپنے انداز کو ایک نئی پہچان دیں۔ ابھی بائیو میں دیے گئے لنک سے آرڈر کریں۔`
    ]
  },
  'hindi': {
    label: '🇮🇳 हिन्दी (Hindi)',
    name: 'Hindi',
    getScenes: (b) => [
      `जब साधारण चीज़ें काफी नहीं होतीं, तब हमने एक नया स्टैंडर्ड बनाया।`,
      `मार्केट के पुराने और बोरिंग प्रोडक्ट्स ने सबको निराश कर दिया था।`,
      `इसीलिए ${b.brandName} ने हर डिटेल को एक नए विज़न के साथ तैयार किया।` ,
      `खास उनके लिए जो बेहतरीन क्वालिटी और ${b.uniqueSellingProp || 'अनोखे कम्फर्ट'} की तलाश में हैं।`,
      `हर एक फैब्रिक और कारीगरी को घंटों की मेहनत से तराशा गया है।`,
      `हजारों संतुष्ट ग्राहक इस बदलाव का हिस्सा बन चुके हैं।`,
      `${b.brandName} — अपने स्टाइल को एक नया मुकाम दें। अभी बायो में दिए लिंक से ऑर्डर करें!`
    ]
  },
  'roman-hindi': {
    label: '🇮🇳 Hinglish',
    name: 'Roman Hindi / Hinglish',
    getScenes: (b) => [
      `Jab ordinary products kaafi nahi hote, tab humne redefine kiya quality standard.`,
      `Har jagah boring aur outdated options dekh kar thak chuke hain?`,
      `Isiliye ${b.brandName} ne introduce kiya ek bilkul fresh aur modern approach.`,
      `Specially crafted unke liye jo chahte hain unbeatable durability aur ${b.uniqueSellingProp || 'ultimate style'}.`,
      `Har ek feature ko meticulously test kiya gaya hai maximum satisfaction ke liye.`,
      `Join karein thousands of customers jo isko daily choose kar rahe hain.`,
      `${b.brandName} — Aaj hi explore karein. Link in bio to grab your exclusive drop now!`
    ]
  },
  'english': {
    label: '🇬🇧 English',
    name: 'English (Global)',
    getScenes: (b) => [
      `When ordinary isn't enough, we re-engineered the standard from the ground up.`,
      `A landscape cluttered with mediocrity demanded something truly uncompromising.`,
      `That is why ${b.brandName} was engineered to challenge conventional design.`,
      `Crafted for visionaries who demand relentless performance, timeless aesthetic, and ${b.uniqueSellingProp || 'uncompromised craftsmanship'}.`,
      `Every single contour and composite subjected to rigorous real-world torture tests.`,
      `Thousands across the globe have already upgraded their daily standard.`,
      `LYORA presents ${b.brandName}. Intelligence. Creativity. Growth. Shop the exclusive drop today.`
    ]
  },
  'arabic': {
    label: '🇸🇦 العربية',
    name: 'Arabic',
    getScenes: (b) => [
      `عندما لا تكون المعايير العادية كافية، نعيد هندسة التميز من البداية.`,
      `الأسواق المليئة بالمنتجات التقليدية كانت بحاجة إلى ابتكار حقيقي.`,
      `لهذا السبب صُممت ${b.brandName} لتعيد صياغة مفاهيم الجودة والأناقة.`,
      `صُمم خصيصاً لأولئك الذين يطلبون أعلى درجات الفخامة و${b.uniqueSellingProp || 'الراحة الفائقة'}.`,
      `كل تفصيلة وكل مادة خضعت لأدق الاختبارات الهندسية لضمان أقصى درجات التحمل.`,
      `آلاف العملاء في جميع أنحاء العالم اختاروا هذا التميز اليومي.`,
      `${b.brandName} — ارتقِ بأسلوب حياتك الآن. اطلب عبر الرابط في البايو اليوم!`
    ]
  },
  'spanish': {
    label: '🇪🇸 Español',
    name: 'Spanish',
    getScenes: (b) => [
      `Cuando lo ordinario no es suficiente, reinventamos los estándares desde cero.`,
      `Un mercado saturado de mediocridad exigía algo verdaderamente extraordinario.`,
      `Por eso ${b.brandName} nació para desafiar lo convencional.`,
      `Diseñado para quienes exigen rendimiento implacable, diseño atemporal y ${b.uniqueSellingProp || 'excelencia sin límites'}.`,
      `Cada costura y textura probada exhaustivamente para garantizar máxima durabilidad.`,
      `Miles de personas ya han elevado su estándar diario con nosotros.`,
      `${b.brandName} — Redefine tu estilo hoy mismo. ¡Haz clic en el enlace para ordenar!`
    ]
  },
  'french': {
    label: '🇫🇷 Français',
    name: 'French',
    getScenes: (b) => [
      `Quand l'ordinaire ne suffit plus, nous réinventons l'excellence et la précision.`,
      `Un marché saturé d'options ordinaires exigeait une vision sans compromis.`,
      `C'est pour cela que ${b.brandName} repousse toutes les limites.`,
      `Conçu pour ceux qui exigent une performance irréprochable et ${b.uniqueSellingProp || 'un savoir-faire unique'}.`,
      `Chaque détail est soumis à des tests rigoureux de perfection et de longévité.`,
      `Des milliers d'utilisateurs exigeants ont déjà adopté notre signature.`,
      `${b.brandName} — Redéfinissez votre distinction. Commandez via le lien en bio dès aujourd'hui.`
    ]
  },
  'german': {
    label: '🇩🇪 Deutsch',
    name: 'German',
    getScenes: (b) => [
      `Wenn das Gewöhnliche nicht ausreicht, setzen wir völlig neue Maßstäbe.`,
      `Ein Markt voller Kompromisse verlangte nach echter technologischer Meisterschaft.`,
      `Deshalb wurde ${b.brandName} entwickelt, um den Status quo zu verändern.`,
      `Entwickelt für höchste Ansprüche an Zuverlässigkeit, zeitloses Design und ${b.uniqueSellingProp || 'überlegene Qualität'}.`,
      `Jede Kontur und Komponente unter härtesten Alltagsbedingungen geprüft.`,
      `Tausende Kunden weltweit vertrauen bereits auf diesen Unterschied.`,
      `${b.brandName} — Erleben Sie den spürbaren Unterschied. Jetzt online sichern!`
    ]
  },
  'turkish': {
    label: '🇹🇷 Türkçe',
    name: 'Turkish',
    getScenes: (b) => [
      `Sıradan olan yetmediğinde, mükemmellik standartlarını baştan yazdık.`,
      `Her yerde aynı sıkıcı ürünleri görmekten yorulanlar için bir devrim başlattık.`,
      `İşte bu yüzden ${b.brandName} sınırları zorlamak için üretildi.`,
      `En yüksek kalite, benzersiz konfor ve ${b.uniqueSellingProp || 'çağdaş tasarım'} arayanlar için özel üretildi.`,
      `Her bir dikiş ve yüzey, üstün dayanıklılık için titizlikle test edildi.`,
      `Binlerce bilinçli kullanıcı bu ayrıcalığın tadını çıkarıyor.`,
      `${b.brandName} — Tarzınızı zirveye taşıyın. Bio'daki linke tıklayarak hemen sipariş verin!`
    ]
  }
};

function getScenesTimeline(duration, b) {
  const durStr = (duration || '').toLowerCase();

  if (durStr.includes('10-second')) {
    return [
      { time: '0:00 - 0:05', visual: `Rapid dynamic dolly-in on ${b.brandName} silhouette. Dark glossy obsidian floor reflecting neon orange volumetric beams.` },
      { time: '0:05 - 0:10', visual: `Fast-paced macro product reveal with energetic orange particle embers. High-impact logo lockup with glowing call-to-action.` }
    ];
  } else if (durStr.includes('15-second')) {
    return [
      { time: '0:00 - 0:04', visual: `Rapid dynamic dolly-in on ${b.brandName} silhouette. Dark glossy obsidian floor reflecting neon orange volumetric beams.` },
      { time: '0:04 - 0:09', visual: `Extreme macro 100mm lens revealing pristine textures, stitches, and ${b.uniqueSellingProp || 'comfort technology'}. Subtle orange ember particles drift across the frame.` },
      { time: '0:09 - 0:15', visual: `Fast-paced urban transit shot. Talent stepping forward with explosive confidence. Logo lockup with glowing orange ember ignite effect.` }
    ];
  } else if (durStr.includes('30-second')) {
    return [
      { time: '0:00 - 0:07', visual: `Moody cinematic opening. Character navigating mundane, ordinary world with subtle slow-motion camera drift.` },
      { time: '0:07 - 0:15', visual: `Dramatic transition: Vibrant neon orange backlight ignites. 360-degree orbital camera showcasing ${b.brandName} in hyper-realistic 8K.` },
      { time: '0:15 - 0:22', visual: `Action montage: Dynamic close-ups of product in motion, showing tactile feedback and superior ergonomics.` },
      { time: '0:22 - 0:30', visual: `Hero wide-angle shot of talent bathed in cinematic rim lighting. Bold typography overlay and seamless CTA.` }
    ];
  } else if (durStr.includes('60-second') || durStr.includes('1 min')) {
    return [
      { time: '0:00 - 0:10', visual: `Act I (The Problem): Gritty urban atmosphere, black and white tone with solitary talent moving through crowded city.` },
      { time: '0:10 - 0:22', visual: `Act II (The Discovery): Cinematic slow-motion color bloom. Warm ember rays break through shadow as ${b.brandName} is revealed.` },
      { time: '0:22 - 0:38', visual: `Act III (The Craft): Extreme macro photogrammetry showing precision manufacturing, raw materials, and ${b.uniqueSellingProp || 'ergonomic mastery'}.` },
      { time: '0:38 - 0:50', visual: `Act IV (The Peak): Fast rhythmic cross-cutting sequence of athletes and creators performing at their peak with unmatched confidence.` },
      { time: '0:50 - 1:00', visual: `Act V (The Resolve): Iconic silhouette shot against orange horizon. High-definition title lockup and exclusive website link.` }
    ];
  } else if (durStr.includes('90-second') || durStr.includes('1.5 min')) {
    return [
      { time: '0:00 - 0:15', visual: `Prologue: Atmospheric establishing drone shot over industrial workshop. Moody mist and anamorphic amber flares.` },
      { time: '0:15 - 0:35', visual: `The Genesis: Hands of master artisan sketching designs and testing materials for ${b.brandName}.` },
      { time: '0:35 - 0:55', visual: `Product Breakdown: 3D exploded view detailing internal layers, shock-absorption, and ${b.uniqueSellingProp || 'durable engineering'}.` },
      { time: '0:55 - 1:15', visual: `Real-World Stress Test: High-octane field testing in extreme elements, rain reflections on obsidian glass.` },
      { time: '1:15 - 1:30', visual: `The Legacy: Visionary statement from talent looking directly into lens. Minimalist brand card and order prompt.` }
    ];
  } else if (durStr.includes('2-minute')) {
    return [
      { time: '0:00 - 0:20', visual: `Act 1: Narrative cold-open. Deep conversational documentary lighting showcasing market struggles.` },
      { time: '0:20 - 0:45', visual: `Act 2: The Breakthrough. First prototype emergence with fiery orange volumetric backlights.` },
      { time: '0:45 - 1:15', visual: `Act 3: Scientific Examination. Macro laboratory testing of materials and ergonomics.` },
      { time: '1:15 - 1:40', visual: `Act 4: User Transformations. Authentic customer lifestyle vignettes across global metropolises.` },
      { time: '1:40 - 2:00', visual: `Act 5: Final Manifesto. Orchestral musical swell, epic drone pan-out, and official launch invitation.` }
    ];
  } else if (durStr.includes('3-minute')) {
    return [
      { time: '0:00 - 0:25', visual: `Chapter 1: The Frustration. Documentary cinematography exploring why conventional solutions fail modern consumers.` },
      { time: '0:25 - 0:55', visual: `Chapter 2: The Vision. Founder sketchbook, design studio whiteboard sessions, and radical blue-sky thinking.` },
      { time: '0:55 - 1:30', visual: `Chapter 3: Material Obsession. Extreme close-ups of custom metallurgy, aerospace fabric, and seamless joinery.` },
      { time: '1:30 - 2:05', visual: `Chapter 4: The Crucible. Stress testing under extreme thermal, kinetic, and real-world conditions.` },
      { time: '2:05 - 2:35', visual: `Chapter 5: Cultural Impact. Influential tastemakers unboxing and experiencing the product on camera.` },
      { time: '2:35 - 3:00', visual: `Chapter 6: The Invitation. Sunset silhouette with fiery ember typography. Direct call-to-action.` }
    ];
  } else if (durStr.includes('4-minute')) {
    return [
      { time: '0:00 - 0:35', visual: `Part 1: The Landscape. Deep investigative look into industry bottlenecks and stagnant innovation.` },
      { time: '0:35 - 1:15', visual: `Part 2: The Engineering Journey. 18 months of R&D compressed into high-speed archival film footage.` },
      { time: '1:15 - 1:55', visual: `Part 3: The Architecture of Quality. Interactive 3D holographic breakdown of ${b.brandName}.` },
      { time: '1:55 - 2:40', visual: `Part 4: The Human Element. Candid interviews with the engineers, designers, and early adopters.` },
      { time: '2:40 - 3:25', visual: `Part 5: The Testimonials. Emotional stories of daily productivity and confidence boosts.` },
      { time: '3:25 - 4:00', visual: `Part 6: Conclusion. A bold cinematic salute to forward-thinkers. Limited-edition VIP invitation.` }
    ];
  } else {
    // 5-Minute Epic Brand Film
    return [
      { time: '0:00 - 0:40', visual: `Movement I (The Silence): Hypnotic slow-motion visuals of modern city life in black and orange neon reflections.` },
      { time: '0:40 - 1:25', visual: `Movement II (The Spark): Behind locked studio doors, the birth of ${b.brandName}'s core philosophy.` },
      { time: '1:25 - 2:10', visual: `Movement III (The Architecture): Microscopic scan of raw composite materials and custom bespoke finishes.` },
      { time: '2:10 - 2:55', visual: `Movement IV (The Gauntlet): Unrelenting torture testing in desert dunes, alpine cold, and midnight torrential rain.` },
      { time: '2:55 - 3:45', visual: `Movement V (The Voices): Raw, unscripted reactions from pioneers who refuse to settle for ordinary.` },
      { time: '3:45 - 4:30', visual: `Movement VI (The Philosophy): Cinematic monologue on what it means to build something that lasts generations.` },
      { time: '4:30 - 5:00', visual: `Movement VII (The Horizon): Epic panoramic aerial crane shot rising above clouds. Final brand crescendo and VIP launch access.` }
    ];
  }
}

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
  const lang = document.getElementById('videoLanguage') ? document.getElementById('videoLanguage').value : 'roman-urdu';

  const mainPrompt = `Cinematic commercial shot for ${b.brandName} in ${b.industry}. Photorealistic 8K, moody obsidian background with vibrant ember-orange anamorphic lens flare and laser backlight. Dynamic macro camera orbit around the product showcasing ${b.uniqueSellingProp || 'meticulous textures and craftsmanship'}. High-energy atmospheric smoke, cinematic motion blur, premium commercial aesthetic, shot on ARRI Alexa 35, 60fps slow-motion. Duration target: ${duration}.`;

  const langConfig = MULTILINGUAL_VOICEOVER_ENGINE[lang] || MULTILINGUAL_VOICEOVER_ENGINE['roman-urdu'];
  const voices = langConfig.getScenes(b);
  const timeline = getScenesTimeline(duration, b);

  LYORA_STATE.videoPromptData = {
    style: style,
    duration: duration,
    selectedLanguage: lang,
    mainPrompt: mainPrompt,
    scenes: timeline.map((item, idx) => ({
      time: item.time,
      visual: item.visual,
      voice: voices[idx] || voices[voices.length - 1]
    }))
  };

  renderVideoStoryboard();
  showToast(`Google Flow prompts generated (${duration} in ${langConfig.name})!`, 'success');

  if (typeof logActivityEvent === 'function') {
    logActivityEvent(`Generated Video Storyboard (${duration})`, 'Google Flow & Veo Prompts', 'Video', 'fa-video');
  }

  if (typeof logCreationRadar === 'function') {
    const videoSnippet = LYORA_STATE.videoPromptData ? LYORA_STATE.videoPromptData.mainPrompt.slice(0, 110) + '...' : 'Cinematic video prompt';
    logCreationRadar(`Google Flow Video (${duration})`, LYORA_STATE.brand.brandName, 'Cinematic AI Storyboard', videoSnippet);
  }
}

function renderVideoStoryboard() {
  const output = document.getElementById('videoPromptsOutput');
  if (!output || !LYORA_STATE.videoPromptData) return;

  const d = LYORA_STATE.videoPromptData;
  const currentLang = d.selectedLanguage || 'roman-urdu';
  const langConfig = MULTILINGUAL_VOICEOVER_ENGINE[currentLang] || MULTILINGUAL_VOICEOVER_ENGINE['roman-urdu'];

  output.innerHTML = `
    <div class="video-prompt-card">
      <div class="video-prompt-header">
        <div>
          <h4><i class="fa-solid fa-clapperboard text-orange"></i> Google Flow, Veo & Sora Ready AI Prompt</h4>
          <span style="font-size: 12px; color: var(--text-muted); display: block; margin-top: 3px;">
            <i class="fa-solid fa-clock text-orange"></i> Length: <strong>${d.duration}</strong> • <i class="fa-solid fa-language text-orange"></i> Voiceover: <strong>${langConfig.name}</strong> • ${d.style}
          </span>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="copyVideoPromptOnly()">
          <i class="fa-solid fa-copy"></i> Copy Flow Prompt
        </button>
      </div>

      <div class="prompt-copy-block">
        <div class="prompt-text">${d.mainPrompt}</div>
      </div>

      <!-- Quick Multi-Lingual Voiceover Switcher Pills -->
      <div class="lang-pills-bar">
        <span class="lang-pills-label"><i class="fa-solid fa-language text-orange"></i> Switch Voiceover (زبان بدلیں):</span>
        ${Object.keys(MULTILINGUAL_VOICEOVER_ENGINE).map(key => `
          <button class="lang-pill-btn ${key === currentLang ? 'active' : ''}" onclick="switchVideoVoiceLanguage('${key}')">
            ${MULTILINGUAL_VOICEOVER_ENGINE[key].label}
          </button>
        `).join('')}
      </div>

      <h5 style="color: #fff; margin-top: 16px; margin-bottom: 8px;">
        <i class="fa-solid fa-list-ol text-orange"></i> Shot-By-Shot Storyboard & Timeline (${d.duration} • ${d.scenes.length} Scenes)
      </h5>

      <div class="scene-timeline">
        ${d.scenes.map(s => `
          <div class="scene-row">
            <span class="scene-time">${s.time}</span>
            <div>
              <strong>Visual:</strong> ${s.visual}<br>
              <em style="color: #ffaa77;"><i class="fa-solid fa-microphone"></i> Audio/Voiceover (${langConfig.name}): "${s.voice}"</em>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="voiceover-box">
        <strong><i class="fa-solid fa-wand-magic-sparkles text-orange"></i> Multi-Lingual Video Generation Tips:</strong>
        Copy the visual prompt directly into Google Veo, Flow, or Runway Gen-3. Then use the translated voiceover script with AI voice generators (ElevenLabs, Murf AI, or CapCut) in your chosen language (${langConfig.name})!
      </div>
    </div>
  `;
}

function switchVideoVoiceLanguage(langKey) {
  if (!LYORA_STATE.videoPromptData) return;
  const langConfig = MULTILINGUAL_VOICEOVER_ENGINE[langKey];
  if (!langConfig) return;

  LYORA_STATE.videoPromptData.selectedLanguage = langKey;
  const b = LYORA_STATE.brand;
  const voices = langConfig.getScenes(b);

  LYORA_STATE.videoPromptData.scenes.forEach((scene, idx) => {
    scene.voice = voices[idx] || voices[voices.length - 1];
  });

  renderVideoStoryboard();
  showToast(`Voiceover language switched to ${langConfig.name}!`, 'success');
}

function copyVideoPromptOnly() {
  if (!LYORA_STATE.videoPromptData) return;
  navigator.clipboard.writeText(LYORA_STATE.videoPromptData.mainPrompt);
  showToast('Google Flow Prompt copied to clipboard!', 'success');

  if (typeof logActivityEvent === 'function') {
    logActivityEvent('Copied AI Video Prompt', 'Ready for Veo / Sora', 'Video', 'fa-copy');
  }
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

  if (typeof logActivityEvent === 'function') {
    logActivityEvent('Generated Viral Hashtags', 'Tiered Reach, Niche & Community Tags', 'Hashtags', 'fa-hashtag');
  }

  if (typeof logCreationRadar === 'function') {
    logCreationRadar('Viral Hashtags Stack', LYORA_STATE.brand.brandName, 'Categorized Discovery Buckets', 'Mega Reach, Niche Authority, and Community discovery hashtags');
  }
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

  if (typeof logActivityEvent === 'function') {
    logActivityEvent('Exported 30-Day Calendar (CSV)', 'Downloaded for Excel & Google Sheets', 'Export', 'fa-file-excel');
  }
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

function openStatModal(id) {
  openModal(id);
  const visits = localStorage.getItem('lyora_total_visits') || '59';
  const gens = localStorage.getItem('lyora_total_gens') || '128';
  const modalVisits = document.getElementById('modalVisitsCount');
  const modalGens = document.getElementById('modalGenCount');
  if (modalVisits) modalVisits.textContent = `${visits} Visitors`;
  if (modalGens) modalGens.textContent = `${gens} Assets`;
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

  if (typeof logActivityEvent === 'function') {
    logActivityEvent('Copied UBL Official Account Number', 'Hafiz Muhammad Soban (1629343864185)', 'UBL Bank', 'fa-building-columns');
  }
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
    waLink.onclick = () => {
      let waClicks = parseInt(localStorage.getItem('lyora_wa_clicks') || '6', 10) + 1;
      localStorage.setItem('lyora_wa_clicks', waClicks.toString());
      if (typeof logActivityEvent === 'function') {
        logActivityEvent('Initiated WhatsApp Slip Verification', `${planName} (PKR ${pkrPrice.toLocaleString()})`, 'Payment', 'fa-whatsapp');
      }
    };
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

// ================= AUDIENCE INSIGHTS & REAL-TIME ACTIVITY TRACKER =================
const DEFAULT_ACTIVITIES = [
  { action: "Generated 30-Day Content Calendar", meta: "Lahore, Pakistan • Retail Brand", badge: "Calendar", icon: "fa-calendar-days", time: "2m ago" },
  { action: "Copied TikTok & Instagram Captions", meta: "Karachi, Pakistan • Fashion Store", badge: "Captions", icon: "fa-copy", time: "7m ago" },
  { action: "Generated Cinematic Video Storyboard", meta: "Islamabad, Pakistan • Tech Startup", badge: "Video", icon: "fa-video", time: "14m ago" },
  { action: "Downloaded Strategy & Plan (CSV)", meta: "Dubai, UAE • Real Estate Agency", badge: "Export", icon: "fa-file-arrow-down", time: "26m ago" },
  { action: "Initiated WhatsApp Slip Verification", meta: "Faisalabad, Pakistan • Pro Plan Inquiry", badge: "Payment", icon: "fa-whatsapp", time: "42m ago" },
  { action: "Copied UBL Official Account Number", meta: "Rawalpindi, Pakistan • Bank Transfer", badge: "UBL Bank", icon: "fa-building-columns", time: "1h ago" },
  { action: "Explored AI Marketing Blueprint", meta: "London, UK • Ecommerce Store", badge: "Strategy", icon: "fa-brain", time: "2h ago" }
];

function initAnalyticsTracker() {
  if (!localStorage.getItem('lyora_activity_log')) {
    localStorage.setItem('lyora_activity_log', JSON.stringify(DEFAULT_ACTIVITIES));
  }
  
  // Track this user's visit
  let visits = parseInt(localStorage.getItem('lyora_total_visits') || '58', 10);
  if (!sessionStorage.getItem('lyora_session_active')) {
    sessionStorage.setItem('lyora_session_active', 'true');
    visits += 1;
    localStorage.setItem('lyora_total_visits', visits.toString());
  }

  renderActivityFeed();
  initRadarTracker();
  startLiveVisitorSimulation();
}

function logActivityEvent(action, meta, badge, icon) {
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem('lyora_activity_log')) || [];
  } catch(e) {
    list = DEFAULT_ACTIVITIES;
  }
  
  list.unshift({
    action: action,
    meta: meta || 'Active User',
    badge: badge || 'Activity',
    icon: icon || 'fa-bolt',
    time: 'Just now'
  });

  if (list.length > 25) list = list.slice(0, 25);
  localStorage.setItem('lyora_activity_log', JSON.stringify(list));

  // Increment total assets generated counter
  let gens = parseInt(localStorage.getItem('lyora_total_gens') || '128', 10);
  gens += 1;
  localStorage.setItem('lyora_total_gens', gens.toString());

  renderActivityFeed();
}

function renderActivityFeed() {
  const feedEl = document.getElementById('activityFeedList');
  if (!feedEl) return;

  let list = [];
  try {
    list = JSON.parse(localStorage.getItem('lyora_activity_log')) || DEFAULT_ACTIVITIES;
  } catch(e) {
    list = DEFAULT_ACTIVITIES;
  }

  feedEl.innerHTML = list.map(item => `
    <div class="activity-feed-item">
      <div class="feed-icon"><i class="fa-solid ${item.icon}"></i></div>
      <div class="feed-content">
        <div class="feed-action">${item.action}</div>
        <div class="feed-meta">
          <span>${item.meta}</span>
          <span class="feed-badge">${item.badge}</span>
        </div>
      </div>
      <div class="feed-time">${item.time}</div>
    </div>
  `).join('');

  // Update counts
  const visitsEl = document.getElementById('todayVisitsCount');
  const genEl = document.getElementById('totalGenCount');
  const waEl = document.getElementById('whatsappInquiriesCount');

  const visits = localStorage.getItem('lyora_total_visits') || '58';
  const gens = localStorage.getItem('lyora_total_gens') || '128';
  const waClicks = localStorage.getItem('lyora_wa_clicks') || '6';

  if (visitsEl) visitsEl.textContent = `${visits} Visitors`;
  if (genEl) genEl.textContent = `${gens} Assets`;
  if (waEl) waEl.textContent = `${waClicks} Clicks`;
}

function refreshAnalyticsData() {
  renderActivityFeed();
  renderRadarLists();
  showToast('Live Analytics refreshed with latest traffic stream!', 'info');
}

function startLiveVisitorSimulation() {
  // Fluctuates realistically between 4 and 9 active users
  const updateCount = () => {
    const liveEl = document.getElementById('liveUsersCount');
    if (liveEl) {
      const active = Math.floor(Math.random() * 6) + 4; // 4 to 9
      liveEl.textContent = `${active} Active`;
    }
  };
  updateCount();
  setInterval(updateCount, 15000);
}

// ================= LIVE SEARCH & CONTENT CREATION RADAR =================
const DEFAULT_SEARCHES = [
  { brand: "Urban Edge Outfitters", industry: "Fashion & Streetwear", goal: "Boost Online Orders", location: "Lahore, Pakistan", snippet: "Oversized graphic hoodies and cargo pants for Gen-Z youth.", time: "1m ago" },
  { brand: "DermaPure Botanicals", industry: "Health & Beauty", goal: "Lead Generation", location: "Karachi, Pakistan", snippet: "Natural chemical-free serums and organic skin barrier repair oils.", time: "4m ago" },
  { brand: "The Chai Story Cafe", industry: "Food & Beverage", goal: "Footfall & Brand Awareness", location: "Islamabad, Pakistan", snippet: "Artisan karak chai and midnight gourmet bun kabab hangout spot.", time: "9m ago" },
  { brand: "Skyline Grand Residencies", industry: "Real Estate & Construction", goal: "High-Ticket Client Acquisition", location: "Dubai / Overseas", snippet: "Luxury 2-bedroom investment apartments with 8% guaranteed ROI.", time: "18m ago" },
  { brand: "LeatherCraft Rawalpindi", industry: "Ecommerce & Leather Goods", goal: "Festive Discount Campaign", location: "Rawalpindi, Pakistan", snippet: "Hand-stitched genuine leather wallets and laptop messenger bags.", time: "27m ago" },
  { brand: "PixelScale Digital Agency", industry: "Digital Marketing & Tech", goal: "Retainer Client Acquisition", location: "Faisalabad, Pakistan", snippet: "Performance marketing and ROAS-focused Meta ads for DTC brands.", time: "45m ago" }
];

const DEFAULT_CREATIONS = [
  { type: "30-Day Content Calendar", brand: "Urban Edge Outfitters", title: "30 Daily Reel & Carousel Posts", snippet: "Day 3 (Behind-the-scenes): How our heavyweight 400GSM cotton is knitted in Faisalabad mills.", location: "Lahore, PK", time: "Just now" },
  { type: "Google Veo / Sora Video Storyboard", brand: "The Chai Story Cafe", title: "Cinematic Slow-Motion Food Reel", snippet: "Visual: Steam rising in golden light as rich saffron chai is poured from copper kettle. Voiceover: 'Sukoon ki talash yahan khatam hoti hai.'", location: "Islamabad, PK", time: "3m ago" },
  { type: "Multi-Platform Social Captions", brand: "DermaPure Botanicals", title: "Instagram & TikTok Viral Hook", snippet: "Hook: 'Agar aapka skin barrier damage ho chuka hai, to yeh 2 galtiyan foran rok dein...' CTA: 'Tap link in bio for free skin test!'", location: "Karachi, PK", time: "6m ago" },
  { type: "Omnichannel Strategy Blueprint", brand: "Skyline Grand Residencies", title: "High-Net-Worth Lead Funnel", snippet: "Pillar A: Construction progress transparency. Pillar B: Investor case studies. WhatsApp nurturing automation sequence.", location: "Dubai, UAE", time: "15m ago" },
  { type: "Viral Hashtags Stack", brand: "LeatherCraft Rawalpindi", title: "Mega & Niche Reach Buckets", snippet: "#pakistanleather #handmadebags #lahoreshopping #rawalpindifashion #pakistanidocuments", location: "Rawalpindi, PK", time: "22m ago" },
  { type: "30-Day Content Calendar", brand: "PixelScale Digital", title: "B2B LinkedIn & X Calendar", snippet: "Day 12: How we scaled a local apparel brand from 2 ROAS to 5.4 ROAS without burning ad spend.", location: "Faisalabad, PK", time: "38m ago" },
  { type: "Social Media Captions", brand: "Bling & Sparkle Jewelry", title: "Festive Wedding Season Hooks", snippet: "Hook: 'Bridal look complete nahi hoti bina statement chokar ke.' Body: Handcrafted zircon sets with lifetime polish guarantee.", location: "Lahore, PK", time: "52m ago" },
  { type: "Google Flow Video Prompts", brand: "FitFuel Nutrition", title: "High-Energy Gym Pre-Workout Reel", snippet: "Visual: Macro close-up of water splash hitting energizing citrus powder. High-tempo EDM sync cuts.", location: "Karachi, PK", time: "1h ago" }
];

function initRadarTracker() {
  if (!localStorage.getItem('lyora_searches_radar')) {
    localStorage.setItem('lyora_searches_radar', JSON.stringify(DEFAULT_SEARCHES));
  }
  if (!localStorage.getItem('lyora_creations_radar')) {
    localStorage.setItem('lyora_creations_radar', JSON.stringify(DEFAULT_CREATIONS));
  }
  renderRadarLists();
}

function logSearchRadar(brandName, industry, goal, querySnippet) {
  if (!brandName) return;
  let searches = [];
  try {
    searches = JSON.parse(localStorage.getItem('lyora_searches_radar')) || DEFAULT_SEARCHES;
  } catch(e) {
    searches = DEFAULT_SEARCHES;
  }

  searches.unshift({
    brand: brandName,
    industry: industry || 'Ecommerce',
    goal: goal || 'Growth',
    location: 'Active Visitor',
    snippet: querySnippet ? (querySnippet.slice(0, 100) + (querySnippet.length > 100 ? '...' : '')) : 'Custom marketing blueprint search',
    time: 'Just now'
  });

  if (searches.length > 20) searches = searches.slice(0, 20);
  localStorage.setItem('lyora_searches_radar', JSON.stringify(searches));
  renderRadarLists();
}

function logCreationRadar(type, brandName, title, snippet) {
  let creations = [];
  try {
    creations = JSON.parse(localStorage.getItem('lyora_creations_radar')) || DEFAULT_CREATIONS;
  } catch(e) {
    creations = DEFAULT_CREATIONS;
  }

  creations.unshift({
    type: type || 'AI Asset',
    brand: brandName || (LYORA_STATE.brand ? LYORA_STATE.brand.brandName : 'Brand'),
    title: title || 'Marketing Content',
    snippet: snippet ? (snippet.slice(0, 120) + (snippet.length > 120 ? '...' : '')) : 'AI Marketing Generation',
    location: 'Active Visitor',
    time: 'Just now'
  });

  if (creations.length > 20) creations = creations.slice(0, 20);
  localStorage.setItem('lyora_creations_radar', JSON.stringify(creations));
  renderRadarLists();
}

function renderRadarLists() {
  const searchesEl = document.getElementById('searchesRadarList');
  const creationsEl = document.getElementById('creationsRadarList');
  const allCountEl = document.getElementById('radarAllCount');
  const searchCountEl = document.getElementById('radarSearchCount');
  const creationCountEl = document.getElementById('radarCreationCount');

  let searches = [];
  let creations = [];
  try {
    searches = JSON.parse(localStorage.getItem('lyora_searches_radar')) || DEFAULT_SEARCHES;
  } catch(e) {
    searches = DEFAULT_SEARCHES;
  }
  try {
    creations = JSON.parse(localStorage.getItem('lyora_creations_radar')) || DEFAULT_CREATIONS;
  } catch(e) {
    creations = DEFAULT_CREATIONS;
  }

  if (searchCountEl) searchCountEl.textContent = searches.length;
  if (creationCountEl) creationCountEl.textContent = creations.length;
  if (allCountEl) allCountEl.textContent = searches.length + creations.length;

  if (searchesEl) {
    searchesEl.innerHTML = searches.map(item => `
      <div class="radar-item">
        <div class="radar-item-top">
          <div class="radar-item-title">
            <i class="fa-solid fa-store text-orange"></i>
            ${item.brand}
          </div>
          <span class="radar-item-time">${item.time}</span>
        </div>
        <div class="radar-badges">
          <span class="radar-tag orange"><i class="fa-solid fa-briefcase"></i> ${item.industry}</span>
          <span class="radar-tag blue"><i class="fa-solid fa-bullseye"></i> ${item.goal}</span>
          <span class="radar-tag"><i class="fa-solid fa-location-dot"></i> ${item.location}</span>
        </div>
        <div class="radar-snippet">"${item.snippet}"</div>
      </div>
    `).join('');
  }

  if (creationsEl) {
    creationsEl.innerHTML = creations.map(item => `
      <div class="radar-item">
        <div class="radar-item-top">
          <div class="radar-item-title">
            <i class="fa-solid fa-wand-magic-sparkles" style="color: #38ef7d;"></i>
            ${item.brand}
          </div>
          <span class="radar-item-time">${item.time}</span>
        </div>
        <div class="radar-badges">
          <span class="radar-tag green"><i class="fa-solid fa-bolt"></i> ${item.type}</span>
          <span class="radar-tag"><i class="fa-solid fa-tag"></i> ${item.title}</span>
          <span class="radar-tag"><i class="fa-solid fa-location-dot"></i> ${item.location}</span>
        </div>
        <div class="radar-snippet">"${item.snippet}"</div>
      </div>
    `).join('');
  }
}

function filterRadar(filterType) {
  const btnAll = document.getElementById('radarTabAll');
  const btnSearch = document.getElementById('radarTabSearch');
  const btnCreation = document.getElementById('radarTabCreation');
  const searchesBox = document.getElementById('radarSearchesBox');
  const creationsBox = document.getElementById('radarCreationsBox');
  const dualGrid = document.getElementById('radarDualGrid');

  if (btnAll) btnAll.classList.toggle('active', filterType === 'all');
  if (btnSearch) btnSearch.classList.toggle('active', filterType === 'search');
  if (btnCreation) btnCreation.classList.toggle('active', filterType === 'creation');

  if (!searchesBox || !creationsBox || !dualGrid) return;

  if (filterType === 'all') {
    searchesBox.style.display = 'flex';
    creationsBox.style.display = 'flex';
    dualGrid.style.gridTemplateColumns = window.innerWidth <= 900 ? '1fr' : '1fr 1fr';
  } else if (filterType === 'search') {
    searchesBox.style.display = 'flex';
    creationsBox.style.display = 'none';
    dualGrid.style.gridTemplateColumns = '1fr';
  } else if (filterType === 'creation') {
    searchesBox.style.display = 'none';
    creationsBox.style.display = 'flex';
    dualGrid.style.gridTemplateColumns = '1fr';
  }
}

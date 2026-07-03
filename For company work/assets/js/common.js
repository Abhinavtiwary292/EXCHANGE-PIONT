/**
 * Exchange Point - Shared Global Script
 * Manages dynamic header/footer rendering, mobile navigation toggles,
 * theme adjustments on scroll, and utility formatters.
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Inject Header & Footer & Modals
    injectGlobalHeader();
    injectGlobalFooter();
    injectGlobalModals();
    updateLoginState();

    // 2. Scroll Event for Sticky Header
    const header = document.getElementById("main-header");
    if (header) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 50) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
        });
    }

    // 3. Mobile Navigation Menu Toggle
    const navToggle = document.getElementById("nav-toggle");
    const navMenu = document.getElementById("nav-menu");

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", () => {
            navToggle.classList.toggle("active");
            navMenu.classList.toggle("active");
            
            // Prevent body scroll when menu is active on mobile
            if (navMenu.classList.contains("active")) {
                document.body.style.overflow = "hidden";
            } else {
                document.body.style.overflow = "";
            }
        });

        // Close menu when clicking navigation links
        const navLinks = navMenu.querySelectorAll(".nav-link");
        navLinks.forEach(link => {
            link.addEventListener("click", () => {
                navToggle.classList.remove("active");
                navMenu.classList.remove("active");
                document.body.style.overflow = "";
            });
        });
    }

    // Initialize search routing if search bar is present in header
    setupHeaderSearch();
});

/**
 * Dynamically injects the standard header navigation into elements matching #global-header
 */
function injectGlobalHeader() {
    const container = document.getElementById("global-header");
    if (!container) return;

    // Get current filename to apply active state
    const currentPath = window.location.pathname;
    const filename = currentPath.substring(currentPath.lastIndexOf('/') + 1) || "index.html";

    container.innerHTML = `
        <header class="header" id="main-header">
            <div class="container nav-container">
                <!-- Left brand logo & City selector side-by-side -->
                <div class="nav-brand-group">
                    <a href="index.html" class="nav-logo">
                        <span class="nav-logo-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
                        </span>
                        EXCHANGE<span>POINT</span>
                    </a>
                    
                    <div class="header-city-container" id="header-city-trigger" style="cursor:pointer;" title="Select City">
                        <span class="city-marker-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        </span>
                        <span id="current-selected-city" style="font-size:0.85rem; font-weight:600; color:var(--primary-navy); margin-left: 4px; margin-right: 4px;">Delhi NCR</span>
                        <span class="city-chevron-icon" style="display:flex; align-items:center; opacity:0.6;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                        </span>
                    </div>
                </div>

                <!-- Navigation Links & Drawer items -->
                <ul class="nav-menu" id="nav-menu">
                    <!-- Mobile Drawer Header profile -->
                    <li class="mobile-only-menu-header">
                        <div class="user-profile-summary">
                            <div class="user-avatar-circle">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            </div>
                            <div class="profile-links">
                                <strong style="display:block; color:var(--secondary-silver); font-size:1.05rem; font-family:var(--font-heading);">Welcome, Guest</strong>
                                <a href="#" class="mobile-login-link" style="color:var(--accent-gold); font-size:0.85rem; font-weight:700;">Login / Sign In</a>
                            </div>
                        </div>
                    </li>
                    <li><a href="index.html" class="nav-link ${filename === 'index.html' ? 'active' : ''}">Home</a></li>
                    <li><a href="inventory.html" class="nav-link ${filename === 'inventory.html' ? 'active' : ''}">Buy Cars</a></li>
                    <li><a href="index.html#how-it-works" class="nav-link">How It Works</a></li>
                    
                    <!-- Mobile Drawer footer contacts -->
                    <li class="mobile-only-menu-footer">
                        <a href="#" class="mobile-call-link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                            Call Support: +91 99999-88888
                        </a>
                    </li>
                </ul>

                <!-- CTAs (Desktop and Toggle Controls) -->
                <div class="nav-actions">
                    <button class="btn btn-outline btn-sm nav-call-btn" id="header-call-btn" title="Request Call Back">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        <span>Call Us</span>
                    </button>
                    <button class="btn btn-outline btn-sm nav-login-btn" id="nav-login-btn">Login / Sign In</button>
                    
                    <button class="nav-toggle" id="nav-toggle" aria-label="Toggle Menu">
                        <span class="nav-toggle-icon"></span>
                    </button>
                </div>
            </div>
        </header>
    `;
}

/**
 * Dynamically injects center city modals and slide-out callback drawer widgets
 */
function injectGlobalModals() {
    if (document.getElementById("city-selector-modal")) return;

    const modalsContainer = document.createElement("div");
    modalsContainer.id = "global-modals-container";

    const citiesList = [
        { name: "Delhi NCR", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=150&h=100&q=80" },
        { name: "Bangalore", image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=150&h=100&q=80" },
        { name: "Mumbai", image: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=150&h=100&q=80" },
        { name: "Hyderabad", image: "https://images.unsplash.com/photo-1605007493699-af65834f8a00?auto=format&fit=crop&w=150&h=100&q=80" },
        { name: "Ahmedabad", image: "https://images.unsplash.com/photo-1600256698643-1d84610a8ee9?auto=format&fit=crop&w=150&h=100&q=80" },
        { name: "Chennai", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=150&h=100&q=80" },
        { name: "Pune", image: "https://images.unsplash.com/photo-1601919051950-bb9f3ffb3fee?auto=format&fit=crop&w=150&h=100&q=80" },
        { name: "New Delhi", image: "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=150&h=100&q=80" },
        { name: "Gurgaon", image: "https://images.unsplash.com/photo-1602927237894-399fb2193b2a?auto=format&fit=crop&w=150&h=100&q=80" },
        { name: "Noida", image: "https://images.unsplash.com/photo-1590050752117-238cb061295a?auto=format&fit=crop&w=150&h=100&q=80" },
        { name: "Ghaziabad", image: "https://images.unsplash.com/photo-1610483178766-8092dcc6d447?auto=format&fit=crop&w=150&h=100&q=80" },
        { name: "Lucknow", image: "https://images.unsplash.com/photo-1588528416453-61109a96e857?auto=format&fit=crop&w=150&h=100&q=80" },
        { name: "Jaipur", image: "https://images.unsplash.com/photo-1477584322811-5aa3aeee8061?auto=format&fit=crop&w=150&h=100&q=80" },
        { name: "Kolkata", image: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=150&h=100&q=80" },
        { name: "Kochi", image: "https://images.unsplash.com/photo-1587309401342-d6c4299b8287?auto=format&fit=crop&w=150&h=100&q=80" },
        { name: "Nagpur", image: "https://images.unsplash.com/photo-1600329972322-be16dbf59bf0?auto=format&fit=crop&w=150&h=100&q=80" },
        { name: "Coimbatore", image: "https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&w=150&h=100&q=80" },
        { name: "Indore", image: "https://images.unsplash.com/photo-1616803689943-5601631c7fec?auto=format&fit=crop&w=150&h=100&q=80" },
        { name: "Patna", image: "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=150&h=100&q=80" },
        { name: "Chandigarh Tricity", image: "https://images.unsplash.com/photo-1619842426367-4e3bec7e4c74?auto=format&fit=crop&w=150&h=100&q=80" },
        { name: "Surat", image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=150&h=100&q=80" },
        { name: "Chandigarh", image: "https://images.unsplash.com/photo-1606298246186-08868ab77562?auto=format&fit=crop&w=150&h=100&q=80" },
        { name: "Rajkot", image: "https://images.unsplash.com/photo-1597075687490-8f673c6c17f6?auto=format&fit=crop&w=150&h=100&q=80" }
    ];

    let cityCardsHTML = "";
    citiesList.forEach(city => {
        cityCardsHTML += `
            <div class="modal-city-card" data-city="${city.name}">
                <div class="modal-city-thumb" style="background-image: url('${city.image}');"></div>
                <div class="modal-city-name">${city.name}</div>
            </div>
        `;
    });

    // Add View all cities card at the end
    cityCardsHTML += `
        <div class="modal-city-card view-all-cities-card" id="city-modal-view-all" style="cursor:pointer;">
            <div class="modal-city-thumb view-all-thumb" style="display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--accent-gold); border: 1.5px dashed var(--accent-gold); background: rgba(245, 158, 11, 0.05); border-radius: var(--radius-md); box-sizing: border-box;">
                <span style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.5px;">View all</span>
            </div>
            <div class="modal-city-name" style="color:var(--accent-gold); font-weight:700;">View all cities</div>
        </div>
    `;

    modalsContainer.innerHTML = `
        <!-- City Selector Centered Modal Overlay -->
        <div class="city-modal-overlay" id="city-selector-modal">
            <div class="city-modal-card">
                <button class="city-modal-close" id="city-modal-close-btn" aria-label="Close City Selector">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                
                <h3 class="city-modal-title">Select your city to view cars</h3>
                
                <div class="city-modal-search-box">
                    <span class="search-box-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </span>
                    <input type="text" id="city-search-input" placeholder="Search for your city..." class="city-search-input">
                </div>
                
                <button id="modal-gps-btn" class="modal-gps-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/><circle cx="12" cy="12" r="3"/><path d="M12 2a10 10 0 0 1 10 10v0a10 10 0 0 1-10 10v0A10 10 0 0 1 2 12v0A10 10 0 0 1 12 2z"/></svg>
                    <span>Use current location</span>
                </button>
                
                <div class="modal-cities-grid" id="modal-cities-grid">
                    ${cityCardsHTML}
                </div>
            </div>
        </div>

        <!-- Request Call Back Slide-Out Sidebar Card -->
        <div class="callback-sidebar-overlay" id="callback-sidebar">
            <div class="callback-sidebar-card">
                <button class="callback-sidebar-close" id="callback-close-btn" aria-label="Close Callback Request">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                
                <h3 class="callback-title">Request a call back</h3>
                
                <form id="callback-form" class="callback-form">
                    <div class="form-group-custom">
                        <label for="callback-phone" class="form-label-custom">Phone Number *</label>
                        <input type="tel" id="callback-phone" placeholder="Enter 10-digit mobile number" maxlength="10" class="form-input-custom" required>
                        <span class="phone-error-msg" id="phone-validation-error" style="color:var(--danger); font-size:0.75rem; display:none; margin-top:4px;">Please enter exactly 10 digits.</span>
                    </div>
                    
                    <div class="form-group-custom">
                        <label for="callback-lang" class="form-label-custom">Language Preference</label>
                        <select id="callback-lang" class="form-input-custom">
                            <option value="Hindi" selected>Hindi</option>
                            <option value="English">English</option>
                            <option value="Punjabi">Punjabi</option>
                            <option value="Tamil">Tamil</option>
                            <option value="Kannada">Kannada</option>
                            <option value="Telugu">Telugu</option>
                            <option value="Bengali">Bengali</option>
                        </select>
                    </div>
                    
                    <div class="form-group-custom">
                        <label for="callback-message" class="form-label-custom">Tell us what you need help with</label>
                        <textarea id="callback-message" rows="3" placeholder="Tell us what you need help with" class="form-input-custom textarea-custom"></textarea>
                    </div>
                    
                    <p class="callback-disclaimer">To have an Exchange Point representative call you, please click below. We are operational between 9 AM - 8 PM.</p>
                    
                    <button type="submit" id="callback-submit-btn" class="btn btn-primary btn-block btn-callback" disabled>CALL ME</button>
                </form>
                
                <!-- Success State Overlay inside Sidebar -->
                <div class="callback-success-state" id="callback-success-state">
                    <div class="success-icon-circle" style="background-color: var(--success); color:#FFFFFF; width:54px; height:54px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin: 0 auto var(--space-md);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <h4 style="font-size:1.25rem; font-weight:700; color:var(--primary-navy); margin-bottom:4px;">Request Received!</h4>
                    <p style="color:var(--secondary-silver-muted); font-size:0.9rem;">An Exchange Point expert will call you shortly.</p>
                </div>
            </div>
        </div>

        <!-- Login Modal Centered Overlay -->
        <div class="login-modal-overlay" id="login-selector-modal">
            <div class="login-modal-card">
                <button class="login-modal-close" id="login-modal-close-btn" aria-label="Close Login Selector">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                
                <h3 class="login-modal-title" id="login-modal-title-text">Login to Exchange Point</h3>
                <p style="color:var(--secondary-silver-muted); font-size:0.85rem; margin-top:-8px; margin-bottom:var(--space-md);">Access inspections, valuation reports, and order history.</p>
                
                <form id="login-modal-form" class="login-form">
                    <div class="form-group-custom">
                        <label for="login-email" class="form-label-custom">Email or Phone Number</label>
                        <input type="text" id="login-email" placeholder="Enter email or 10-digit mobile number" class="form-input-custom" required>
                    </div>
                    
                    <div class="form-group-custom">
                        <label for="login-pass" class="form-label-custom">Password / OTP</label>
                        <input type="password" id="login-pass" placeholder="Enter password or 4-digit OTP" class="form-input-custom" required>
                    </div>
                    
                    <div style="display:flex; align-items:center; gap:8px; margin-top:2px;">
                        <input type="checkbox" id="login-remember" checked style="width:auto; cursor:pointer;">
                        <label for="login-remember" style="font-size:0.8rem; color:var(--primary-navy-light); cursor:pointer; user-select:none;">Keep me logged in</label>
                    </div>
                    
                    <button type="submit" id="login-submit-btn" class="btn btn-primary btn-block btn-callback" style="margin-top:var(--space-md);">Sign In</button>
                </form>
                
                <div style="text-align:center; margin-top:var(--space-md); font-size:0.85rem; color:var(--secondary-silver-muted);">
                    Don't have an account? <a href="#" id="login-toggle-signup" style="color:var(--accent-gold); font-weight:700;">Sign Up</a>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modalsContainer);
    setupModalBindings();
}

function setupModalBindings() {
    const cityModal = document.getElementById("city-selector-modal");
    const cityClose = document.getElementById("city-modal-close-btn");
    const cityTrigger = document.getElementById("header-city-trigger");
    const currentCityText = document.getElementById("current-selected-city");
    
    const searchInput = document.getElementById("city-search-input");
    const cityCards = document.querySelectorAll(".modal-city-card");
    const modalGpsBtn = document.getElementById("modal-gps-btn");

    const callbackSidebar = document.getElementById("callback-sidebar");
    const callbackClose = document.getElementById("callback-close-btn");
    const callbackTriggers = [
        document.getElementById("header-call-btn"),
        document.querySelector(".mobile-call-link")
    ];
    
    const callbackForm = document.getElementById("callback-form");
    const phoneInput = document.getElementById("callback-phone");
    const phoneError = document.getElementById("phone-validation-error");
    const submitBtn = document.getElementById("callback-submit-btn");
    const successOverlay = document.getElementById("callback-success-state");

    const loginModal = document.getElementById("login-selector-modal");
    const loginClose = document.getElementById("login-modal-close-btn");
    const loginBtn = document.getElementById("nav-login-btn");
    const loginForm = document.getElementById("login-modal-form");
    const loginEmailInput = document.getElementById("login-email");
    const loginSubmitBtn = document.getElementById("login-submit-btn");
    const loginToggleSignup = document.getElementById("login-toggle-signup");
    const loginModalTitleText = document.getElementById("login-modal-title-text");

    let isSignUpMode = false;

    // Toggle Sign Up Mode
    function setupLoginToggleBinding() {
        const toggleBtn = document.getElementById("login-toggle-signup");
        if (toggleBtn && loginModalTitleText && loginSubmitBtn) {
            toggleBtn.addEventListener("click", (e) => {
                e.preventDefault();
                isSignUpMode = !isSignUpMode;
                if (isSignUpMode) {
                    loginModalTitleText.textContent = "Create an Account";
                    loginSubmitBtn.textContent = "Sign Up";
                    toggleBtn.parentElement.innerHTML = `Already have an account? <a href="#" id="login-toggle-signup" style="color:var(--accent-gold); font-weight:700;">Sign In</a>`;
                } else {
                    loginModalTitleText.textContent = "Login to Exchange Point";
                    loginSubmitBtn.textContent = "Sign In";
                    toggleBtn.parentElement.innerHTML = `Don't have an account? <a href="#" id="login-toggle-signup" style="color:var(--accent-gold); font-weight:700;">Sign Up</a>`;
                }
                setupLoginToggleBinding();
            });
        }
    }
    setupLoginToggleBinding();

    // Trigger opening login modal
    if (loginBtn && loginModal) {
        loginBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const isLoggedIn = localStorage.getItem("userLoggedIn") === "true";
            if (isLoggedIn) {
                // Log out
                triggerLogout();
            } else {
                // Log in
                loginModal.classList.add("active");
                document.body.style.overflow = "hidden";
            }
        });
    }

    if (loginClose && loginModal) {
        loginClose.addEventListener("click", () => {
            loginModal.classList.remove("active");
            if (!document.getElementById("nav-menu").classList.contains("active")) {
                document.body.style.overflow = "";
            }
        });

        loginModal.addEventListener("click", (e) => {
            if (e.target === loginModal) {
                loginModal.classList.remove("active");
                if (!document.getElementById("nav-menu").classList.contains("active")) {
                    document.body.style.overflow = "";
                }
            }
        });
    }

    // Login submit action
    if (loginForm && loginModal) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            loginSubmitBtn.disabled = true;
            loginSubmitBtn.innerHTML = '<span class="loading-spinner-small"></span> AUTHENTICATING...';

            setTimeout(() => {
                localStorage.setItem("userLoggedIn", "true");
                showToast(isSignUpMode ? "Account registered successfully!" : "Logged in successfully!", "success");
                updateLoginState();

                // Reset button text
                loginSubmitBtn.disabled = false;
                loginSubmitBtn.textContent = isSignUpMode ? "Sign Up" : "Sign In";
                loginForm.reset();

                // Close modal
                loginModal.classList.remove("active");
                document.body.style.overflow = "";
            }, 1200);
        });
    }

    // Persist Selected City on Load
    if (currentCityText) {
        const savedCity = localStorage.getItem("selectedCity") || "Delhi NCR";
        currentCityText.textContent = savedCity;
    }

    // Open/Close city overlay
    if (cityTrigger && cityModal) {
        cityTrigger.addEventListener("click", (e) => {
            e.preventDefault();
            cityModal.classList.add("active");
            document.body.style.overflow = "hidden";
        });
    }

    if (cityClose && cityModal) {
        cityClose.addEventListener("click", () => {
            cityModal.classList.remove("active");
            if (!document.getElementById("nav-menu").classList.contains("active")) {
                document.body.style.overflow = "";
            }
        });
        
        cityModal.addEventListener("click", (e) => {
            if (e.target === cityModal) {
                cityModal.classList.remove("active");
                if (!document.getElementById("nav-menu").classList.contains("active")) {
                    document.body.style.overflow = "";
                }
            }
        });
    }

    // City Selection trigger
    cityCards.forEach(card => {
        card.addEventListener("click", () => {
            const cityName = card.dataset.city;
            if (!cityName) return; // Ignore "View all" trigger
            if (currentCityText) {
                currentCityText.textContent = cityName;
            }
            localStorage.setItem("selectedCity", cityName);
            showToast(`City changed to: ${cityName}`, "success");
            
            const cityChangeEvent = new CustomEvent("cityChange", { detail: cityName });
            window.dispatchEvent(cityChangeEvent);

            cityModal.classList.remove("active");
            document.body.style.overflow = "";
        });
    });

    // View All Trigger Binder
    const viewAllBtn = document.getElementById("city-modal-view-all");
    if (viewAllBtn && cityModal) {
        viewAllBtn.addEventListener("click", () => {
            showToast("All 100+ cities unlocked! Connecting server...", "success");
            cityModal.classList.remove("active");
            document.body.style.overflow = "";
        });
    }

    // Realtime search query filtering
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            cityCards.forEach(card => {
                const cityName = card.dataset.city.toLowerCase();
                if (cityName.includes(query)) {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none";
                }
            });
        });
    }

    // Geolocation trigger
    if (modalGpsBtn) {
        modalGpsBtn.addEventListener("click", () => {
            if (navigator.geolocation) {
                modalGpsBtn.style.opacity = "0.5";
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        modalGpsBtn.style.opacity = "1";
                        const cities = ["Delhi NCR", "Bangalore", "Mumbai", "Hyderabad", "Ahmedabad", "Chennai", "Pune"];
                        const detectedCity = cities[Math.floor(Math.random() * cities.length)];
                        
                        if (currentCityText) currentCityText.textContent = detectedCity;
                        localStorage.setItem("selectedCity", detectedCity);
                        showToast(`GPS Position verified! City set to: ${detectedCity}`, "success");
                        
                        const cityChangeEvent = new CustomEvent("cityChange", { detail: detectedCity });
                        window.dispatchEvent(cityChangeEvent);

                        cityModal.classList.remove("active");
                        document.body.style.overflow = "";
                    },
                    (error) => {
                        modalGpsBtn.style.opacity = "1";
                        showToast("Location request timed out. Selected Delhi NCR.", "info");
                        
                        if (currentCityText) currentCityText.textContent = "Delhi NCR";
                        localStorage.setItem("selectedCity", "Delhi NCR");
                        cityModal.classList.remove("active");
                        document.body.style.overflow = "";
                    },
                    { timeout: 5000 }
                );
            } else {
                showToast("GPS is not supported by your browser.", "error");
            }
        });
    }

    // Call Support slide-out overlays
    callbackTriggers.forEach(trigger => {
        if (trigger) {
            trigger.addEventListener("click", (e) => {
                e.preventDefault();
                callbackSidebar.classList.add("active");
                document.body.style.overflow = "hidden";
            });
        }
    });

    if (callbackClose && callbackSidebar) {
        callbackClose.addEventListener("click", () => {
            callbackSidebar.classList.remove("active");
            if (!document.getElementById("nav-menu").classList.contains("active")) {
                document.body.style.overflow = "";
            }
        });
        
        callbackSidebar.addEventListener("click", (e) => {
            if (e.target === callbackSidebar) {
                callbackSidebar.classList.remove("active");
                if (!document.getElementById("nav-menu").classList.contains("active")) {
                    document.body.style.overflow = "";
                }
            }
        });
    }

    // Enforce 10 digit mobile numbers
    if (phoneInput && submitBtn) {
        phoneInput.addEventListener("input", (e) => {
            let val = e.target.value.replace(/\D/g, "");
            phoneInput.value = val;

            if (val.length === 10) {
                submitBtn.disabled = false;
                phoneError.style.display = "none";
            } else {
                submitBtn.disabled = true;
                if (val.length > 0) {
                    phoneError.style.display = "block";
                } else {
                    phoneError.style.display = "none";
                }
            }
        });
    }

    // Callback Request submissions
    if (callbackForm && successOverlay) {
        callbackForm.addEventListener("submit", (e) => {
            e.preventDefault();
            submitBtn.disabled = true;
            submitBtn.textContent = "SECURING CALL...";

            setTimeout(() => {
                successOverlay.classList.add("active");

                callbackForm.reset();
                submitBtn.textContent = "CALL ME";
                submitBtn.disabled = true;

                setTimeout(() => {
                    successOverlay.classList.remove("active");
                    callbackSidebar.classList.remove("active");
                    document.body.style.overflow = "";
                }, 2500);
            }, 1200);
        });
    }
}

/**
 * Dynamically injects the standard footer & trust badges into elements matching #global-footer
 */
function injectGlobalFooter() {
    const container = document.getElementById("global-footer");
    if (!container) return;

    container.innerHTML = `
        <!-- Trust Factors Row -->
        <section class="trust-badges-bar">
            <div class="container trust-badges-container">
                <div class="trust-badge-item">
                    <div class="trust-badge-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <div class="trust-badge-text">
                        <h4>Verified History</h4>
                        <p>100% genuine background checks</p>
                    </div>
                </div>
                <div class="trust-badge-item">
                    <div class="trust-badge-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0 5.4 5.4 0 0 0 0 7.66l.77.78L12 21l7.65-7.66.77-.78a5.4 5.4 0 0 0 0-7.66z"/></svg>
                    </div>
                    <div class="trust-badge-text">
                        <h4>5-Day Money Back</h4>
                        <p>No questions asked return guarantee</p>
                    </div>
                </div>
                <div class="trust-badge-item">
                    <div class="trust-badge-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </div>
                    <div class="trust-badge-text">
                        <h4>Easy Loan Financing</h4>
                        <p>Low interest rates & instant approval</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Main Footer Links & Contact Info -->
        <footer class="footer section-padding">
            <div class="container footer-top">
                <div class="footer-brand">
                    <h3>EXCHANGE<span>POINT</span></h3>
                    <p>Drive in with old, drive out with bold. The premium pre-owned car hub where certified quality meets absolute trust.</p>
                    <div class="social-links">
                        <a href="#" class="social-btn" aria-label="Facebook">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                        </a>
                        <a href="#" class="social-btn" aria-label="Instagram">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                        </a>
                        <a href="#" class="social-btn" aria-label="Twitter">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
                        </a>
                    </div>
                </div>

                <div class="footer-links-col">
                    <h4>Quick Links</h4>
                    <ul class="footer-links-list">
                        <li><a href="index.html">Home</a></li>
                        <li><a href="inventory.html">Browse Inventory</a></li>
                        <li><a href="sell.html">Sell Your Car</a></li>
                        <li><a href="index.html#how-it-works">How We Inspect</a></li>
                        <li><a href="inventory.html?fuel=Electric">EV Collection</a></li>
                    </ul>
                </div>

                <div class="footer-links-col">
                    <h4>Services</h4>
                    <ul class="footer-links-list">
                        <li><a href="#">Car Evaluation</a></li>
                        <li><a href="#">Car Financing</a></li>
                        <li><a href="#">Warranty Extension</a></li>
                        <li><a href="#">Car Insurance</a></li>
                        <li><a href="#">RTO Transfer Assistance</a></li>
                    </ul>
                </div>

                <div class="footer-contact">
                    <h4>Contact Us</h4>
                    <div class="contact-info-item">
                        <div class="contact-info-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        </div>
                        <div>
                            <strong>Exchange Point Hub</strong><br>
                            Plot No. 42, Sector 18, Opp. Metro Station,<br>
                            Gurugram, Haryana 122015
                        </div>
                    </div>
                    <div class="contact-info-item">
                        <div class="contact-info-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        </div>
                        <div>
                            +91 99999-88888 / +91 124-4008888<br>
                            support@exchangepoint.com
                        </div>
                    </div>
                    
                    <!-- Embedded Google Map -->
                    <div class="map-placeholder">
                        <iframe 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14030.735160897645!2d77.06734185!3d28.4594965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d18e2bf65d4b5%3A0xc07cff8d279cf43f!2sSector%2018%2C%20Gurugram%2C%20Haryana!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                            allowfullscreen="" 
                            loading="lazy" 
                            referrerpolicy="no-referrer-when-downgrade">
                        </iframe>
                    </div>
                </div>
            </div>
            
            <div class="container footer-bottom">
                <div>
                    &copy; 2026 Exchange Point Technologies Private Limited. All Rights Reserved.
                </div>
                <div class="footer-bottom-links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms & Conditions</a>
                    <a href="#">Sitemap</a>
                </div>
            </div>
        </footer>
    `;
}

/**
 * Set up search handler for a simple search input in header (if ever added)
 */
function setupHeaderSearch() {
    // Placeholder for header search integrations
}

/**
 * Format KM values into a standard read format (e.g. 18200 -> 18,200 km)
 */
export function formatKM(km) {
    return new Intl.NumberFormat('en-IN').format(km) + " km";
}

/**
 * Format Price values into a standard Indian Lakhs format (e.g. 6.85 -> ₹6.85 Lakh)
 */
export function formatPrice(price) {
    return "₹" + price.toFixed(2) + " Lakh";
}

/**
 * Parse URL Query String parameters
 */
export function getQueryParams() {
    const params = {};
    const search = window.location.search.substring(1);
    if (!search) return params;
    
    const pairs = search.split("&");
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i].split("=");
        const key = decodeURIComponent(pair[0]);
        const val = decodeURIComponent(pair[1] || "");
        if (key) {
            // Support comma separated parameters or array style values
            if (val.includes(",")) {
                params[key] = val.split(",");
            } else {
                params[key] = val;
            }
        }
    }
    return params;
}

/**
 * Injects a global Notification Toast
 */
export function showToast(message, type = "success") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.style.position = "fixed";
        container.style.bottom = "24px";
        container.style.right = "24px";
        container.style.zIndex = "9999";
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.gap = "10px";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.style.background = type === "success" ? "#1E293B" : "#EF4444";
    toast.style.color = "#FFFFFF";
    toast.style.padding = "12px 24px";
    toast.style.borderRadius = "8px";
    toast.style.fontSize = "0.9rem";
    toast.style.fontWeight = "600";
    toast.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
    toast.style.display = "flex";
    toast.style.alignItems = "center";
    toast.style.gap = "8px";
    toast.style.transform = "translateY(20px)";
    toast.style.opacity = "0";
    toast.style.transition = "all 0.3s ease";
    
    // Add icon
    const checkIcon = type === "success" 
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

    toast.innerHTML = `${checkIcon} <span>${message}</span>`;
    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.style.transform = "translateY(0)";
        toast.style.opacity = "1";
    }, 10);

    // Auto-remove
    setTimeout(() => {
        toast.style.transform = "translateY(-10px)";
        toast.style.opacity = "0";
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3500);
}

/**
 * Generates an SVG schematic/blueprint drawing of a car.
 * viewType can be "side", "front", or "rear".
 */
export function getCarSVG(viewType, color = "currentColor") {
    if (viewType === "front") {
        return `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60" fill="none" stroke="${color}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" style="width: 50%; height: auto; max-height: 80%;">
                <path d="M15 42 h70 v-6 c0-5-3-9-8-10 l-7-15 h-40 l-7 15 c-5 1-8 5-8 10 z" />
                <path d="M28 28 h44 l-5-12 h-34 z" />
                <rect x="20" y="34" width="10" height="4" rx="1" />
                <rect x="70" y="34" width="10" height="4" rx="1" />
                <rect x="36" y="34" width="28" height="6" rx="1" />
                <rect x="18" y="42" width="8" height="5" />
                <rect x="74" y="42" width="8" height="5" />
            </svg>
        `;
    } else if (viewType === "rear") {
        return `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60" fill="none" stroke="${color}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" style="width: 50%; height: auto; max-height: 80%;">
                <path d="M15 42 h70 v-15 c0-5-4-8-9-9 h-52 c-5 1-9 4-9 9 z" />
                <path d="M24 23 h52 l-4-10 h-44 z" />
                <rect x="18" y="29" width="12" height="4" rx="1" />
                <rect x="70" y="29" width="12" height="4" rx="1" />
                <rect x="40" y="31" width="20" height="6" rx="1" />
                <circle cx="25" cy="43" r="2" />
                <rect x="18" y="42" width="8" height="3" />
                <rect x="74" y="42" width="8" height="3" />
            </svg>
        `;
    } else {
        // default "side" view
        return `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60" fill="none" stroke="${color}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" style="width: 60%; height: auto; max-height: 80%;">
                <path d="M10 38 h10 c2-5 8-5 10 0 h40 c2-5 8-5 10 0 h10 v-6 c0-4-3-7-7-8 l-10-6 h-30 l-18 10 h-10 c-3 0-5 2-5 5 z" />
                <path d="M48 20 l10 6 h15 l8 6 h-33 z" />
                <path d="M28 32 l15-8 h5 v8 z" />
                <circle cx="25" cy="38" r="6" stroke-dasharray="2,2" />
                <circle cx="25" cy="38" r="3" />
                <circle cx="75" cy="38" r="6" stroke-dasharray="2,2" />
                <circle cx="75" cy="38" r="3" />
                <path d="M5 31 h5" />
                <path d="M95 32 h3" />
            </svg>
        `;
    }
}

/**
 * Renders the HTML structure for a car card or a structure-ready placeholder skeleton.
 */
export function renderCarCardHTML(car, isPlaceholder = false) {
    const cardId = isPlaceholder ? 'placeholder-card' : `car-card-${car.id}`;
    const badgeText = isPlaceholder ? 'Certified' : (car.isReserved ? 'Reserved' : 'Certified');
    const badgeClass = isPlaceholder ? 'certified' : (car.isReserved ? 'reserved' : 'certified');
    
    const brand = isPlaceholder ? 'Car Brand' : car.brand;
    const model = isPlaceholder ? 'Model' : car.model;
    const year = isPlaceholder ? '2025' : car.year;
    const variant = isPlaceholder ? 'Variant LXI/VXI/SX' : car.variant;
    
    const km = isPlaceholder ? '12,000 km' : formatKM(car.km);
    const fuel = isPlaceholder ? 'Petrol/Diesel/EV' : car.fuel;
    const transmission = isPlaceholder ? 'AMT/MT' : (car.transmission === "Automatic" ? "AMT" : "MT");
    const price = isPlaceholder ? '₹0.00 Lakh' : formatPrice(car.price);
    
    // Placeholder image styling using real image element container
    const imageHTML = isPlaceholder 
        ? `<div class="car-image-placeholder">
             <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.4; color:var(--primary-navy);"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
             <span style="font-size:0.7rem; color:var(--secondary-silver-muted); font-weight:600; margin-top:8px; text-transform:uppercase; letter-spacing:0.5px;">Real Car Image</span>
           </div>`
        : `<div class="car-image-container">
             <img src="${car.imageUrl || 'assets/images/placeholder.jpg'}" alt="${brand} ${model}" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\'car-image-placeholder\'><svg xmlns=\'http://www.w3.org/2000/svg\' width=\'36\' height=\'36\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\' style=\'opacity:0.4; color:var(--primary-navy);\'><rect width=\'18\' height=\'18\' x=\'3\' y=\'3\' rx=\'2\' ry=\'2\'/><circle cx=\'9\' cy=\'9\' r=\'2\'/><path d=\'m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\'/></svg><span style=\'font-size:0.7rem; color:var(--secondary-silver-muted); font-weight:600; margin-top:8px; text-transform:uppercase; letter-spacing:0.5px;\'>Real Car Image</span></div>';">
           </div>`;

    return `
        <article class="car-card" id="${cardId}">
            <span class="car-tag ${badgeClass}">${badgeText}</span>
            <div class="car-card-image">
                ${imageHTML}
                ${isPlaceholder ? '' : `
                <div class="car-heart ${localStorage.getItem('fav_' + car.id) ? 'active' : ''}" data-id="${car.id}" aria-label="Add to wishlist">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="${localStorage.getItem('fav_' + car.id) ? 'var(--danger)' : 'none'}" stroke="${localStorage.getItem('fav_' + car.id) ? 'var(--danger)' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </div>
                `}
            </div>
            <div class="car-card-body">
                <div class="car-card-header">
                    <span class="car-card-year">${year}</span>
                    <h3 class="car-card-title">${brand} ${model}</h3>
                    <p style="font-size:0.8rem; color:var(--secondary-silver-muted); margin-top:2px; height:18px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${variant}</p>
                </div>
                <div class="car-card-specs">
                    <div class="spec-item">
                        KM
                        <span>${km}</span>
                    </div>
                    <div class="spec-item">
                        Fuel
                        <span>${fuel}</span>
                    </div>
                    <div class="spec-item">
                        Type
                        <span>${transmission}</span>
                    </div>
                </div>
                <div class="car-card-footer">
                    <div class="car-price-box">
                        <span class="car-price-label">Fixed Price</span>
                        <span class="car-price">${price}</span>
                    </div>
                    <a href="${isPlaceholder ? '#' : `car-details.html?id=${car.id}`}" class="btn btn-secondary btn-sm ${isPlaceholder ? 'disabled' : ''}" style="${isPlaceholder ? 'pointer-events: none; opacity: 0.6;' : ''}">View Details</a>
                </div>
            </div>
        </article>
    `;
}

/**
 * Handles toggling user Sign In/Logout layout details on header elements
 */
export function updateLoginState() {
    const isLoggedIn = localStorage.getItem("userLoggedIn") === "true";
    const loginBtn = document.getElementById("nav-login-btn");
    const mobileProfileHeader = document.querySelector(".mobile-only-menu-header");

    if (isLoggedIn) {
        // Desktop button -> Logout
        if (loginBtn) {
            loginBtn.textContent = "Logout";
            loginBtn.classList.remove("btn-outline");
            loginBtn.style.borderColor = "var(--danger)";
            loginBtn.style.color = "var(--danger)";
        }

        // Mobile profile header -> Logged in state
        if (mobileProfileHeader) {
            mobileProfileHeader.innerHTML = `
                <div class="user-profile-summary">
                    <div class="user-avatar-circle" style="background-color: var(--accent-gold); color: var(--primary-navy);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <div class="profile-links">
                        <strong style="display:block; color:var(--accent-gold); font-size:1.05rem; font-family:var(--font-heading);">Ashish Sharma</strong>
                        <a href="#" class="mobile-logout-link" style="color:var(--danger); font-size:0.85rem; font-weight:700;">Logout</a>
                    </div>
                </div>
            `;
            
            // Bind mobile logout link
            const mobileLogout = mobileProfileHeader.querySelector(".mobile-logout-link");
            if (mobileLogout) {
                mobileLogout.addEventListener("click", (e) => {
                    e.preventDefault();
                    triggerLogout();
                });
            }
        }
    } else {
        // Desktop button -> Login / Sign In
        if (loginBtn) {
            loginBtn.textContent = "Login / Sign In";
            loginBtn.classList.add("btn-outline");
            loginBtn.style.borderColor = "";
            loginBtn.style.color = "";
        }

        // Mobile profile header -> Guest state
        if (mobileProfileHeader) {
            mobileProfileHeader.innerHTML = `
                <div class="user-profile-summary">
                    <div class="user-avatar-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <div class="profile-links">
                        <strong style="display:block; color:var(--secondary-silver); font-size:1.05rem; font-family:var(--font-heading);">Welcome, Guest</strong>
                        <a href="#" class="mobile-login-link" style="color:var(--accent-gold); font-size:0.85rem; font-weight:700;">Login / Sign In</a>
                    </div>
                </div>
            `;
            
            // Rebind mobile login trigger
            const mobileLogin = mobileProfileHeader.querySelector(".mobile-login-link");
            if (mobileLogin) {
                mobileLogin.addEventListener("click", (e) => {
                    e.preventDefault();
                    const loginModal = document.getElementById("login-selector-modal");
                    if (loginModal) {
                        loginModal.classList.add("active");
                        document.body.style.overflow = "hidden";
                    }
                });
            }
        }
    }
}

export function triggerLogout() {
    localStorage.removeItem("userLoggedIn");
    showToast("Logged out successfully!", "success");
    updateLoginState();
    
    // Close mobile nav drawer if active
    const navToggle = document.getElementById("nav-toggle");
    const navMenu = document.getElementById("nav-menu");
    if (navToggle && navMenu) {
        navToggle.classList.remove("active");
        navMenu.classList.remove("active");
        document.body.style.overflow = "";
    }
}

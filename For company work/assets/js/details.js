/**
 * Exchange Point - Car Details Page Controller
 * Handles photo gallery thumbnails, inspection score animations, 
 * test drive leads, and checkout reservation modals.
 */

import { getCarById, saveLead, reserveCarToken } from './db.js';
import { formatKM, formatPrice, getQueryParams, showToast, getCarSVG } from './common.js';

let activeCar = null;

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Parse car ID from URL query parameters
    const params = getQueryParams();
    const carId = params.id;

    if (!carId) {
        showToast("No vehicle selected. Redirecting to inventory...", "error");
        setTimeout(() => {
            window.location.href = "inventory.html";
        }, 1500);
        return;
    }

    try {
        // 2. Fetch specific car details
        activeCar = await getCarById(carId);
        
        // 3. Render page content
        renderCarDetails();

        // 4. Set up reservation modal listeners
        setupReservationModal();

        // 5. Set up test drive form
        setupTestDriveForm();

    } catch (err) {
        console.error("Error loading car details:", err);
        showToast("Error loading car details. Redirecting...", "error");
        setTimeout(() => {
            window.location.href = "inventory.html";
        }, 2000);
    }
});

/**
 * Populates all specifications, dynamic values, feature lists, and gallery images.
 */
function renderCarDetails() {
    if (!activeCar) return;

    // A. Identity Header & Breadcrumbs
    document.getElementById("breadcrumb-car-name").textContent = `${activeCar.brand} ${activeCar.model}`;
    document.getElementById("detail-title").textContent = `${activeCar.brand} ${activeCar.model}`;
    document.getElementById("detail-variant").textContent = activeCar.variant;
    document.getElementById("detail-year").textContent = activeCar.year;
    document.getElementById("detail-rto-tag").textContent = activeCar.rto.split(" ")[0]; // Get code like MH-02

    // B. Main Photo Gallery image rendering
    const mainImgViewport = document.querySelector(".main-image-viewport");
    
    const isUrl = (str) => typeof str === 'string' && (str.startsWith('http') || str.startsWith('assets/') || str.startsWith('data:'));
    
    const getMainImageHTML = (imgSrc) => {
        if (isUrl(imgSrc)) {
            return `<div class="car-image-container"><img src="${imgSrc}" alt="${activeCar.brand} ${activeCar.model}" style="width:100%; height:100%; object-fit:cover;"></div>`;
        } else {
            return `<div class="car-image-placeholder" style="height: 100%;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.4; color:var(--primary-navy);"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                      <span style="font-size:0.85rem; color:var(--secondary-silver-muted); font-weight:600; margin-top:8px; text-transform:uppercase; letter-spacing:0.5px;">Real Car Image</span>
                    </div>`;
        }
    };

    mainImgViewport.innerHTML = getMainImageHTML(activeCar.images[0]);

    const thumbStrip = document.getElementById("detail-thumb-strip");
    thumbStrip.innerHTML = ""; // Clear placeholders

    activeCar.images.forEach((imgSrc, index) => {
        const thumbContent = isUrl(imgSrc)
            ? `<img src="${imgSrc}" alt="${activeCar.brand} ${activeCar.model}" style="width:100%; height:100%; object-fit:cover;">`
            : `<div class="car-image-placeholder" style="height:100%;">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.4; color:var(--primary-navy);"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
               </div>`;
               
        const thumbHTML = `
            <div class="thumb-item ${index === 0 ? 'active' : ''}" data-index="${index}" data-img="${imgSrc}">
                ${thumbContent}
            </div>
        `;
        thumbStrip.insertAdjacentHTML("beforeend", thumbHTML);
    });

    // Gallery Swap bindings
    const thumbs = thumbStrip.querySelectorAll(".thumb-item");
    thumbs.forEach(thumb => {
        thumb.addEventListener("click", () => {
            thumbs.forEach(t => t.classList.remove("active"));
            thumb.classList.add("active");
            mainImgViewport.innerHTML = getMainImageHTML(thumb.dataset.img);
        });
    });

    // C. Key Specifications Table
    document.getElementById("spec-km").textContent = formatKM(activeCar.km);
    document.getElementById("spec-fuel").textContent = activeCar.fuel;
    document.getElementById("spec-trans").textContent = activeCar.transmission;
    document.getElementById("spec-owners").textContent = activeCar.owners;
    document.getElementById("spec-rto").textContent = activeCar.rto;
    document.getElementById("spec-insurance").textContent = activeCar.insurance.split(" (")[0]; // Simple clean text

    // D. Narratives & Description
    document.getElementById("detail-description").textContent = activeCar.description;

    // E. Pricing Card & EMI calculations
    document.getElementById("detail-price").textContent = formatPrice(activeCar.price);
    
    // EMI Calculation (Estimate: Principal * r * (1+r)^n / ((1+r)^n - 1))
    // Let's do a simple mock monthly EMI: ₹2000 per Lakh of loan for 5 years
    const loanAmt = activeCar.price * 0.85; // 85% finance
    const estimatedEMI = Math.round(loanAmt * 1900);
    document.getElementById("detail-onroad-est").textContent = `EST. EMI: ₹${new Intl.NumberFormat('en-IN').format(estimatedEMI)}/mo`;

    // F. Dynamic Feature List Grid
    const featuresGrid = document.getElementById("detail-features-grid");
    featuresGrid.innerHTML = "";
    activeCar.features.forEach(feature => {
        const featureHTML = `
            <div class="feature-check-item">
                <span class="feature-check-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                ${feature}
            </div>
        `;
        featuresGrid.insertAdjacentHTML("beforeend", featureHTML);
    });

    // G. Certified Inspection dashboard numbers & circular SVG loaders
    document.getElementById("gauge-overall").textContent = activeCar.inspection.overallScore.toFixed(1);
    
    // Convert scores out of 10 to a percentage for the SVG dasharray (circumference of 100)
    animateCircularGauge("circle-engine", "text-engine", activeCar.inspection.categories.engine);
    animateCircularGauge("circle-ac", "text-ac", activeCar.inspection.categories.ac);
    animateCircularGauge("circle-tyres", "text-tyres", activeCar.inspection.categories.tyres);
    animateCircularGauge("circle-electricals", "text-electricals", activeCar.inspection.categories.electricals);

    // Dynamic appraisal title based on score
    const score = activeCar.inspection.overallScore;
    let verdict = "Excellent Condition";
    if (score < 8.8) verdict = "Good Certified Condition";
    if (score > 9.4) verdict = "Like-New Pristine Condition";
    document.getElementById("inspection-verdict-title").textContent = verdict;

    // H. Adjust UI state if Reserved
    applyReservedStateUI();
}

/**
 * Animates a circle progress stroke and numeric score text.
 */
function animateCircularGauge(svgId, textId, score) {
    const percent = score * 10;
    const svgCircle = document.getElementById(svgId);
    const textNode = document.getElementById(textId);

    if (svgCircle && textNode) {
        // Trigger reflow/timeout to animate transition
        setTimeout(() => {
            svgCircle.setAttribute("stroke-dasharray", `${percent}, 100`);
            textNode.textContent = score.toFixed(1);
        }, 100);
    }
}

/**
 * Adjusts buttons and badges if the vehicle is reserved.
 */
function applyReservedStateUI() {
    const reserveBtn = document.getElementById("reserve-car-btn");
    const certTag = document.getElementById("detail-certified-tag");

    if (activeCar.isReserved) {
        certTag.className = "car-tag reserved";
        certTag.textContent = "Reserved";

        if (reserveBtn) {
            reserveBtn.disabled = true;
            reserveBtn.style.backgroundColor = "var(--danger)";
            reserveBtn.style.borderColor = "var(--danger)";
            reserveBtn.style.color = "#FFFFFF";
            reserveBtn.style.cursor = "not-allowed";
            reserveBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                Vehicle Reserved
            `;
        }
    }
}

/**
 * Controls payment modal interactions, checkout form validations, and token submission.
 */
function setupReservationModal() {
    const modal = document.getElementById("checkout-modal");
    const openBtn = document.getElementById("reserve-car-btn");
    const closeBtn = document.getElementById("close-checkout-btn");
    const formContent = document.getElementById("checkout-modal-form-content");
    const successContent = document.getElementById("checkout-modal-success-content");
    const reservationForm = document.getElementById("reservation-form");

    if (!modal || !openBtn) return;

    // Open Modal
    openBtn.addEventListener("click", () => {
        if (activeCar.isReserved) return;

        // Reset display structures
        formContent.style.display = "block";
        successContent.style.display = "none";
        
        // Populate car preview in checkout
        const modalImgContainer = document.getElementById("modal-car-blueprint-container");
        if (isUrl(activeCar.images[0])) {
            modalImgContainer.innerHTML = `<div class="car-image-container" style="width:100%; height:100%;"><img src="${activeCar.images[0]}" alt="${activeCar.brand} ${activeCar.model}" style="width:100%; height:100%; object-fit:cover;"></div>`;
        } else {
            modalImgContainer.innerHTML = `<div class="car-image-placeholder" style="width:100%; height:100%;">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.4; color:var(--primary-navy);"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
               </div>`;
        }
        document.getElementById("modal-car-name").textContent = `${activeCar.brand} ${activeCar.model}`;
        document.getElementById("modal-car-desc").textContent = `${activeCar.year} • ${activeCar.fuel} • ${formatKM(activeCar.km)}`;

        modal.classList.add("active");
        document.body.style.overflow = "hidden";
    });

    // Close Modal helpers
    const closeModal = () => {
        modal.classList.remove("active");
        document.body.style.overflow = "";
    };

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    document.querySelector(".modal-overlay").addEventListener("click", closeModal);

    // Handle checkout payment form submit
    reservationForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById("submit-payment-btn");
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="spinner" style="animation: spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
            Processing Payment...
        `;

        const buyerDetails = {
            name: document.getElementById("res-name").value,
            email: document.getElementById("res-email").value,
            phone: document.getElementById("res-phone").value
        };

        try {
            // Call mock DB reserve endpoint
            const receipt = await reserveCarToken(activeCar.id, buyerDetails);
            
            // Swap Modal Content Views
            formContent.style.display = "none";
            successContent.style.display = "block";

            // Fill receipt details
            document.getElementById("receipt-booking-id").textContent = receipt.bookingId;
            document.getElementById("receipt-car-name").textContent = `${activeCar.brand} ${activeCar.model}`;
            
            // Calculate reserve expiry date (48 hours out)
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 48);
            document.getElementById("receipt-expiry").textContent = expiryDate.toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short'
            });

            // Local state updates
            activeCar.isReserved = true;
            applyReservedStateUI();
            showToast("Reservation Secured Successfully!");

        } catch (error) {
            console.error("Reservation Error:", error);
            showToast(error.message || "Payment Processing Failed", "error");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });

    // Close success layout handler
    document.getElementById("success-done-btn").addEventListener("click", () => {
        closeModal();
    });
}

/**
 * Validates and saves lead details for test drive schedules.
 */
function setupTestDriveForm() {
    const tdForm = document.getElementById("test-drive-form");
    if (!tdForm) return;

    // Block dates in the past (minimum selectable is today)
    const todayStr = new Date().toISOString().split("T")[0];
    document.getElementById("td-date").setAttribute("min", todayStr);

    tdForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn = tdForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Booking slot...";

        const leadData = {
            carId: activeCar.id,
            carName: `${activeCar.brand} ${activeCar.model}`,
            name: document.getElementById("td-name").value,
            phone: document.getElementById("td-phone").value,
            date: document.getElementById("td-date").value,
            hub: document.getElementById("td-hub").value
        };

        try {
            await saveLead("test_drive_booking", leadData);
            showToast("Test Drive Booked! Confirmation SMS sent.");
            tdForm.reset();
        } catch (error) {
            console.error("Booking error:", error);
            showToast("Could not book slot. Please retry.", "error");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

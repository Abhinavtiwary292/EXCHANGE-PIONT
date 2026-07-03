/**
 * Exchange Point - Sell & Exchange Controller
 * Populates target upgrade listings, calculates trade-ins,
 * and controls validation appraisal details.
 */

import { getCars, calculateCarValuation, saveLead } from './db.js';
import { formatPrice, showToast } from './common.js';

let targetCarsList = [];
let lastCalculatedValuation = null;

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Load active inventory cars for the trade-in dropdown list
    await loadExchangeCarDropdown();

    // 2. Setup toggle button collapsible interactions
    setupExchangeToggle();

    // 3. Setup form submission for valuation calculator
    setupValuationForm();

    // 4. Setup inspection booking modal
    setupInspectionBooking();
});

/**
 * Queries database inventory and renders options for the upgrade target dropdown.
 */
async function loadExchangeCarDropdown() {
    const selectNode = document.getElementById("val-target-car");
    if (!selectNode) return;

    try {
        targetCarsList = await getCars(); // Retrieve all
        
        selectNode.innerHTML = '<option value="">Choose from Inventory...</option>';
        targetCarsList.forEach(car => {
            if (car.isReserved) return; // Skip reserved cars
            
            const option = document.createElement("option");
            option.value = car.id;
            option.dataset.price = car.price;
            option.textContent = `${car.brand} ${car.model} (${car.year}) — ₹${car.price.toFixed(2)} Lakh`;
            selectNode.appendChild(option);
        });
    } catch (err) {
        console.error("Error loading exchange listings:", err);
    }
}

/**
 * Smooth transition collapsibles for the upgrade fields.
 */
function setupExchangeToggle() {
    const check = document.getElementById("val-exchange-check");
    const container = document.getElementById("exchange-toggle-box");
    const fields = document.getElementById("exchange-fields");

    if (!check || !fields) return;

    check.addEventListener("change", () => {
        if (check.checked) {
            container.classList.add("active");
            fields.classList.add("open");
            document.getElementById("val-target-car").setAttribute("required", "true");
        } else {
            container.classList.remove("active");
            fields.classList.remove("open");
            document.getElementById("val-target-car").removeAttribute("required");
            document.getElementById("val-target-car").value = "";
            
            // Hide active trade breakdown if calculating while unchecked
            document.getElementById("trade-breakdown-container").style.display = "none";
        }
    });
}

/**
 * Handles appraisal submission, calls algorithm, and displays estimated payouts.
 */
function setupValuationForm() {
    const valForm = document.getElementById("car-valuation-form");
    if (!valForm) return;

    valForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById("calc-submit-btn");
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Calculating parameters...";

        // Extract inputs
        const brand = document.getElementById("val-brand").value;
        const year = document.getElementById("val-year").value;
        const fuel = document.getElementById("val-fuel").value;
        const km = parseInt(document.getElementById("val-km").value);
        const condition = document.getElementById("val-condition").value;
        const isExchange = document.getElementById("val-exchange-check").checked;
        const targetCarId = document.getElementById("val-target-car").value;

        try {
            // Call mock calculation engine
            const appraisal = await calculateCarValuation(brand, year, km, condition);
            lastCalculatedValuation = appraisal;

            // Render Output details
            document.getElementById("valuation-pre-state").style.display = "none";
            document.getElementById("valuation-active-state").style.display = "block";

            document.getElementById("val-result-title").textContent = `${brand} (${year})`;
            document.getElementById("val-result-price").textContent = formatPrice(appraisal.estimatedValue);
            document.getElementById("val-result-range").textContent = `Range: ₹${appraisal.minEstimate.toFixed(2)}L - ₹${appraisal.maxEstimate.toFixed(2)}L`;

            // Trade breakdown calculator
            const breakdownBox = document.getElementById("trade-breakdown-container");
            if (isExchange && targetCarId) {
                const targetOption = document.querySelector(`#val-target-car option[value="${targetCarId}"]`);
                const targetPrice = parseFloat(targetOption.dataset.price);

                const netDifference = Math.max(0, targetPrice - appraisal.estimatedValue);

                document.getElementById("breakdown-target-price").textContent = formatPrice(targetPrice);
                document.getElementById("breakdown-credit-price").textContent = `-${formatPrice(appraisal.estimatedValue)}`;
                document.getElementById("breakdown-net-pay").textContent = formatPrice(netDifference);
                
                breakdownBox.style.display = "block";
            } else {
                breakdownBox.style.display = "none";
            }

            // UI feedback scroll on mobile
            if (window.innerWidth < 992) {
                document.getElementById("valuation-card").scrollIntoView({ behavior: 'smooth' });
            }

            showToast("Valuation Completed Successfully!");

        } catch (error) {
            console.error("Valuation Error:", error);
            showToast("Calculation failed. Please double check inputs.", "error");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

/**
 * Booking leads details capture modal windows toggles.
 */
function setupInspectionBooking() {
    const modal = document.getElementById("lead-modal");
    const openBtn = document.getElementById("book-inspection-btn");
    const closeBtn = document.getElementById("close-lead-btn");
    const doneBtn = document.getElementById("lead-close-done-btn");

    if (!modal || !openBtn) return;

    const openModal = () => {
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
        modal.classList.remove("active");
        document.body.style.overflow = "";
    };

    openBtn.addEventListener("click", async () => {
        // Collect lead details automatically from form states
        const brand = document.getElementById("val-brand").value;
        const year = document.getElementById("val-year").value;
        
        const leadDetails = {
            profile: `${brand} ${year}`,
            valuation: lastCalculatedValuation ? lastCalculatedValuation.estimatedValue : null,
            exchangeTarget: document.getElementById("val-target-car").value
        };

        // Save valuation lead
        await saveLead("store_inspection_booking", leadDetails);
        openModal();
    });

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (doneBtn) doneBtn.addEventListener("click", closeModal);
    document.querySelector(".modal-overlay").addEventListener("click", closeModal);
}

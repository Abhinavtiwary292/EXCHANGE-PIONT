/**
 * Exchange Point - Inventory Listing Controller
 * Dynamic filtering, sorting, search, and page state logic.
 */

import { getCars } from './db.js';
import { formatKM, formatPrice, getQueryParams, getCarSVG, renderCarCardHTML } from './common.js';

// DOM Selectors
const gridContainer = document.getElementById("inventory-cars-grid");
const countText = document.getElementById("results-count-text");
const searchInput = document.getElementById("inventory-search-input");
const sortSelect = document.getElementById("inventory-sort-select");
const budgetSlider = document.getElementById("filter-budget-slider");
const budgetValue = document.getElementById("budget-value");
const clearBtn = document.getElementById("clear-filters-btn");

// Mobile elements
const filterPanel = document.getElementById("filter-panel");
const mobileTrigger = document.getElementById("mobile-filter-trigger");
const closeMobileFiltersBtn = document.getElementById("close-filters-btn");
const applyMobileFiltersBtn = document.getElementById("apply-mobile-filters-btn");

// Initial state loaded on execution
document.addEventListener("DOMContentLoaded", async () => {
    // 1. Check URL Query Parameters (from Homepage redirects)
    applyURLQueryParams();

    // 2. Initialize filter events
    setupFilterEvents();

    // 3. Setup mobile overlay triggers
    setupMobileResponsiveFilters();

    // 4. Initial rendering
    await updateInventory();
});

/**
 * Reads any active GET parameters from the URL and applies them to the DOM filters.
 */
function applyURLQueryParams() {
    const params = getQueryParams();
    
    // Search input
    if (params.search) {
        searchInput.value = params.search;
    }
    
    // Budget slider
    if (params.maxPrice) {
        budgetSlider.value = params.maxPrice;
        budgetValue.textContent = `Under ₹${params.maxPrice} Lakhs`;
    }

    // Brands
    if (params.brand) {
        const brands = Array.isArray(params.brand) ? params.brand : [params.brand];
        brands.forEach(b => {
            const checkbox = document.querySelector(`input[name="brand"][value="${b}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }

    // Fuel types
    if (params.fuel) {
        const fuels = Array.isArray(params.fuel) ? params.fuel : [params.fuel];
        fuels.forEach(f => {
            const checkbox = document.querySelector(`input[name="fuel"][value="${f}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }

    // Body types
    if (params.bodyType) {
        const bodyTypes = Array.isArray(params.bodyType) ? params.bodyType : [params.bodyType];
        bodyTypes.forEach(bt => {
            const checkbox = document.querySelector(`input[name="bodyType"][value="${bt}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
}

/**
 * Binds input changes across all inputs to trigger a dynamic inventory query refresh.
 */
function setupFilterEvents() {
    // Budget slider value indicator updates live
    budgetSlider.addEventListener("input", (e) => {
        const val = e.target.value;
        if (parseFloat(val) === 30) {
            budgetValue.textContent = "Any Budget";
        } else {
            budgetValue.textContent = `Under ₹${val} Lakhs`;
        }
        
        // Dynamic search update (on slider release or drag for local data)
        updateInventory();
    });

    // Checkboxes triggers (brand, body type, transmission, fuel pills)
    const filterInputs = document.querySelectorAll(
        'input[name="brand"], input[name="bodyType"], input[name="transmission"], input[name="fuel"]'
    );
    filterInputs.forEach(input => {
        input.addEventListener("change", () => {
            // Immediately run update if on desktop
            if (window.innerWidth > 992) {
                updateInventory();
            }
        });
    });

    // Live search input logic (with debounce)
    let searchTimeout;
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                updateInventory();
            }, 200);
        });

        // Bind Enter keypress to run search immediately
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                clearTimeout(searchTimeout);
                updateInventory();
            }
        });
    }

    // Bind Search Button Click
    const searchSubmitBtn = document.getElementById("inventory-search-submit-btn");
    if (searchSubmitBtn) {
        searchSubmitBtn.addEventListener("click", (e) => {
            e.preventDefault();
            clearTimeout(searchTimeout);
            updateInventory();
        });
    }

    // Sort select change
    sortSelect.addEventListener("change", () => {
        updateInventory();
    });

    // Clear all filters trigger
    clearBtn.addEventListener("click", () => {
        resetAllFilters();
    });
}

/**
 * Handles mobile overlay drawer opening, closing, and applying filters.
 */
function setupMobileResponsiveFilters() {
    if (mobileTrigger && filterPanel) {
        // Open drawer
        mobileTrigger.addEventListener("click", () => {
            filterPanel.classList.add("active");
            document.body.style.overflow = "hidden";
            // Show close buttons in mobile view
            if (closeMobileFiltersBtn) closeMobileFiltersBtn.style.display = "block";
            if (applyMobileFiltersBtn) applyMobileFiltersBtn.style.display = "block";
        });

        // Close drawer (X button)
        if (closeMobileFiltersBtn) {
            closeMobileFiltersBtn.addEventListener("click", () => {
                filterPanel.classList.remove("active");
                document.body.style.overflow = "";
            });
        }

        // Apply CTA (mobile only)
        if (applyMobileFiltersBtn) {
            applyMobileFiltersBtn.addEventListener("click", () => {
                filterPanel.classList.remove("active");
                document.body.style.overflow = "";
                updateInventory();
            });
        }
    }
}

/**
 * Resets all inputs and selection checkboxes to their default empty states.
 */
function resetAllFilters() {
    searchInput.value = "";
    sortSelect.value = "year_desc";
    budgetSlider.value = "30";
    budgetValue.textContent = "Any Budget";
    
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);

    // Update listings
    updateInventory();
}

/**
 * Compiles input values, queries `db.js`, and updates the DOM results grid.
 */
async function updateInventory() {
    // 1. Gather all active filters
    const filters = {
        search: searchInput.value.trim(),
        brand: getSelectedCheckboxes("brand"),
        fuel: getSelectedCheckboxes("fuel"),
        bodyType: getSelectedCheckboxes("bodyType"),
        transmission: getSelectedCheckboxes("transmission"),
        sortBy: sortSelect.value
    };

    // Parse max price if not standard 30
    const maxPrice = parseFloat(budgetSlider.value);
    if (maxPrice < 30) {
        filters.maxPrice = maxPrice;
    }

    // 2. Render Loading State
    gridContainer.innerHTML = `
        <div style="text-align: center; grid-column: 1 / -1; padding: var(--space-xxl) 0;">
            <p style="color: var(--secondary-silver-muted); font-weight: 500;">Searching matching certified vehicles...</p>
        </div>
    `;

    try {
        // 3. Fetch matched data
        const cars = await getCars(filters);
        
        // 4. Update Header Count Text
        countText.textContent = cars.length === 1 ? "Showing 1 Car" : `Showing ${cars.length} Cars`;

        // 5. Build Grid Contents
        gridContainer.innerHTML = ""; // Clear loader

        if (cars.length === 0) {
            renderEmptyState();
            return;
        }

        cars.forEach(car => {
            const cardHTML = renderCarCardHTML(car, false);
            gridContainer.insertAdjacentHTML("beforeend", cardHTML);
        });

        // 6. Rebind Wishlist Heart Clicks
        bindWishlistClicks();

    } catch (err) {
        console.error("Error updates listing grid:", err);
        gridContainer.innerHTML = `
            <div style="text-align: center; grid-column: 1 / -1; color: var(--danger); padding: var(--space-xl) 0;">
                <p>Failed to retrieve cars. Please refresh and check configuration.</p>
            </div>
        `;
    }
}

/**
 * Returns an array of values checked for a given checkbox input group name.
 */
function getSelectedCheckboxes(name) {
    const checked = [];
    const inputs = document.querySelectorAll(`input[name="${name}"]:checked`);
    inputs.forEach(input => checked.push(input.value));
    return checked;
}

/**
 * Renders a visual empty state graphic with reset capabilities.
 */
function renderEmptyState() {
    gridContainer.innerHTML = `
        <div class="db-ready-banner" style="grid-column: 1 / -1; background-color: rgba(245, 158, 11, 0.05); border: 1px solid var(--accent-gold); border-radius: var(--radius-md); padding: var(--space-lg); margin-bottom: var(--space-lg); text-align: left; display: flex; align-items: center; gap: var(--space-md); animation: pulse 2.5s infinite;">
            <div style="background-color: var(--accent-gold); color: var(--primary-navy); width: 48px; height: 48px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1.5rem;">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-2.239 10-5V5c0-2.761-4.477-5-10-5S2 2.239 2 5v12c0 2.761 4.477 5 10 5z"/><path d="M22 5c0 2.761-4.477 5-10 5S2 7.761 2 5"/><path d="M2 11c0 2.761 4.477 5 10 5s10-2.239 10-5"/></svg>
            </div>
            <div>
                <h4 style="font-weight: 700; color: var(--primary-navy); margin-bottom: 2px;">Dynamic Database Connection Ready</h4>
                <p style="font-size: 0.9rem; color: var(--primary-navy-light); margin-top:2px;">This dynamic grid layout is fully structure-ready to load inventory. Connect your external Google Sheet, Airtable, or REST API source to fetch inventory, or adjust active filters above.</p>
            </div>
        </div>
    `;

    // Render 4 structure-ready placeholder template cards
    for (let i = 0; i < 4; i++) {
        gridContainer.insertAdjacentHTML("beforeend", renderCarCardHTML(null, true));
    }
}

/**
 * Wishlist handlers using LocalStorage for active state persistence.
 */
function bindWishlistClicks() {
    const hearts = gridContainer.querySelectorAll(".car-heart");
    hearts.forEach(heart => {
        heart.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const carId = heart.dataset.id;
            heart.classList.toggle("active");
            
            const svg = heart.querySelector("svg");
            if (heart.classList.contains("active")) {
                localStorage.setItem('fav_' + carId, 'true');
                svg.setAttribute("fill", "var(--danger)");
                svg.setAttribute("stroke", "var(--danger)");
            } else {
                localStorage.removeItem('fav_' + carId);
                svg.setAttribute("fill", "none");
                svg.setAttribute("stroke", "currentColor");
            }
        });
    });
}

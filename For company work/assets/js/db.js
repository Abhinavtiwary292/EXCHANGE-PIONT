/**
 * Exchange Point - Mock Database & Abstraction Layer
 * This module behaves like an asynchronous API client, making it extremely easy 
 * to swap this static data source for a Google Sheet, Airtable, or custom REST backend later.
 */

// Central Car Data Storage
const CARS_DATABASE = [];

// Helper database for storing lead submissions (Test drives, trade-ins, queries)
const LEADS_DATABASE = [];

/**
 * Fetch all available cars, filtered by multiple criteria.
 * Simulates a DB Query.
 */
export function getCars(filters = {}) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let results = [...CARS_DATABASE];

            // 1. Search Query (matches brand, model, or body type)
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                results = results.filter(car =>
                    car.brand.toLowerCase().includes(searchLower) ||
                    car.model.toLowerCase().includes(searchLower) ||
                    car.variant.toLowerCase().includes(searchLower)
                );
            }

            // 2. Filter by Brand
            if (filters.brand && filters.brand.length > 0) {
                results = results.filter(car => filters.brand.includes(car.brand));
            }

            // 3. Filter by Body Type (SUV, Sedan, Hatchback)
            if (filters.bodyType && filters.bodyType.length > 0) {
                results = results.filter(car => filters.bodyType.includes(car.bodyType));
            }

            // 4. Filter by Fuel Type (Petrol, Diesel, CNG, Electric)
            if (filters.fuel && filters.fuel.length > 0) {
                results = results.filter(car => filters.fuel.includes(car.fuel));
            }

            // 5. Filter by Transmission (Manual, Automatic)
            if (filters.transmission && filters.transmission.length > 0) {
                results = results.filter(car => filters.transmission.includes(car.transmission));
            }

            // 6. Filter by Budget (Max price in Lakhs)
            if (filters.maxPrice) {
                results = results.filter(car => car.price <= parseFloat(filters.maxPrice));
            }
            if (filters.minPrice) {
                results = results.filter(car => car.price >= parseFloat(filters.minPrice));
            }

            // Sort Results
            if (filters.sortBy) {
                if (filters.sortBy === "price_asc") {
                    results.sort((a, b) => a.price - b.price);
                } else if (filters.sortBy === "price_desc") {
                    results.sort((a, b) => b.price - a.price);
                } else if (filters.sortBy === "km_asc") {
                    results.sort((a, b) => a.km - b.km);
                } else if (filters.sortBy === "year_desc") {
                    results.sort((a, b) => b.year - a.year);
                }
            }

            resolve(results);
        }, 300); // 300ms simulated latency
    });
}

/**
 * Get a specific car by its Unique ID
 */
export function getCarById(id) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const car = CARS_DATABASE.find(c => c.id === id);
            if (car) {
                resolve({ ...car });
            } else {
                reject(new Error(`Car with ID ${id} not found.`));
            }
        }, 150);
    });
}

/**
 * Get featured certified cars for homepage highlights
 */
export function getFeaturedCars() {
    return new Promise((resolve) => {
        setTimeout(() => {
            const featured = CARS_DATABASE.filter(car => car.featured);
            resolve(featured);
        }, 150);
    });
}

/**
 * Save a new user lead (Test Drive booking, Selling request)
 */
export function saveLead(leadType, leadData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const submission = {
                id: Date.now().toString(),
                type: leadType,
                data: leadData,
                timestamp: new Date().toISOString()
            };
            LEADS_DATABASE.push(submission);
            console.log(`[DB SUCCESS] Saved new ${leadType} lead:`, submission);
            resolve({ success: true, leadId: submission.id });
        }, 500);
    });
}

/**
 * Reserve a Car by ID (Simulates payment gateway integration)
 */
export function reserveCarToken(carId, buyerDetails) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const car = CARS_DATABASE.find(c => c.id === carId);
            if (!car) {
                return reject(new Error("Car not found."));
            }
            if (car.isReserved) {
                return reject(new Error("Car is already reserved by another customer."));
            }

            // Perform reservation
            car.isReserved = true;

            // Add a lead
            const reservationLead = {
                carId,
                carName: `${car.brand} ${car.model}`,
                price: car.price,
                buyerDetails
            };

            saveLead("car_reservation", reservationLead);
            resolve({ success: true, bookingId: `EP-RES-${Date.now()}` });
        }, 800);
    });
}

/**
 * Mock Trade-in Valuation calculator
 * Computes an estimated value based on factors: brand, year, km, fuel, overall condition
 */
export function calculateCarValuation(brand, year, km, condition) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Base values in Lakhs
            const baseRates = {
                "maruti suzuki": 5.0,
                "hyundai": 6.0,
                "honda": 6.5,
                "tata": 5.5,
                "mahindra": 7.5,
                "toyota": 9.0,
                "ford": 4.5,
                "kia": 7.0,
                "skoda": 8.0,
                "mg": 7.5,
                "other": 4.5
            };

            const brandKey = brand.toLowerCase();
            const baseValue = baseRates[brandKey] || baseRates["other"];

            // Age factor adjustment (current year is 2026 as per context)
            const age = 2026 - parseInt(year);
            let ageMultiplier = 1.0;
            if (age > 0) {
                ageMultiplier = Math.max(0.3, 1 - (age * 0.08)); // -8% each year down to 30%
            }

            // Mileage factor adjustment
            let kmMultiplier = 1.0;
            if (km > 100000) kmMultiplier = 0.65;
            else if (km > 60000) kmMultiplier = 0.8;
            else if (km > 30000) kmMultiplier = 0.92;

            // Condition factor adjustment
            const conditionMultipliers = {
                "excellent": 1.1,
                "good": 0.95,
                "fair": 0.8,
                "poor": 0.55
            };
            const condMultiplier = conditionMultipliers[condition.toLowerCase()] || 0.95;

            // Calculate valuation range
            const rawValuation = baseValue * ageMultiplier * kmMultiplier * condMultiplier;
            const finalValuation = Math.round(rawValuation * 100) / 100; // Round to 2 decimals

            // Valuation Range (+/- 7%)
            const minVal = Math.round((finalValuation * 0.93) * 100) / 100;
            const maxVal = Math.round((finalValuation * 1.07) * 100) / 100;

            resolve({
                estimatedValue: finalValuation,
                minEstimate: Math.max(0.5, minVal),
                maxEstimate: Math.max(0.8, maxVal)
            });
        }, 400);
    });
}


// API Configuration - USING FREE APIS
const NINJAS_API_KEY = 'YOUR_API_NINJAS_KEY'; // Get free from https://api-ninjas.com/
const NUTRITIONIX_APP_ID = 'YOUR_APP_ID'; // Get free from https://www.nutritionix.com/
const NUTRITIONIX_APP_KEY = 'YOUR_APP_KEY';

// State management
let dailyTotal = 0;
let currentCalories = 0;
let currentFoodName = '';
let stream = null;

// DOM Elements
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const preview = document.getElementById('preview');
const startCameraBtn = document.getElementById('startCamera');
const captureBtn = document.getElementById('capture');
const retakeBtn = document.getElementById('retake');
const analyzeBtn = document.getElementById('analyze');
const previewContainer = document.getElementById('previewContainer');
const resultDiv = document.getElementById('result');
const resultContent = document.getElementById('resultContent');
const addToTotalBtn = document.getElementById('addToTotal');
const totalCaloriesSpan = document.getElementById('totalCalories');
const foodLog = document.getElementById('foodLog');
const foodSearch = document.getElementById('foodSearch');
const searchFoodBtn = document.getElementById('searchFood');

// South Asian food database (fallback when API fails)
const southAsianFoodDatabase = {
    'biryani': { calories: 300, serving: '1 cup' },
    'samosa': { calories: 260, serving: '1 piece' },
    'naan': { calories: 320, serving: '1 piece' },
    'butter chicken': { calories: 450, serving: '1 cup' },
    'dal': { calories: 200, serving: '1 cup' },
    'paneer tikka': { calories: 350, serving: '1 serving' },
    'chole bhature': { calories: 500, serving: '1 serving' },
    'dosa': { calories: 150, serving: '1 piece' },
    'idli': { calories: 60, serving: '1 piece' },
    'vada': { calories: 150, serving: '1 piece' },
    'pav bhaji': { calories: 400, serving: '1 plate' },
    'roti': { calories: 100, serving: '1 piece' },
    'paratha': { calories: 300, serving: '1 piece' },
    'pulao': { calories: 250, serving: '1 cup' },
    'korma': { calories: 400, serving: '1 cup' },
    'tandoori chicken': { calories: 300, serving: '1 piece' },
    'pakora': { calories: 150, serving: '1 piece' },
    'gulab jamun': { calories: 150, serving: '1 piece' },
    'jalebi': { calories: 200, serving: '1 serving' },
    'rasgulla': { calories: 100, serving: '1 piece' }
};

// Camera functionality
startCameraBtn.addEventListener('click', async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 400, height: 300 } 
        });
        video.srcObject = stream;
        captureBtn.disabled = false;
        startCameraBtn.disabled = true;
    } catch (err) {
        alert('Error accessing camera: ' + err.message);
    }
});

captureBtn.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    preview.src = canvas.toDataURL('image/png');
    previewContainer.style.display = 'block';
    retakeBtn.disabled = false;
    captureBtn.disabled = true;
});

retakeBtn.addEventListener('click', () => {
    previewContainer.style.display = 'none';
    captureBtn.disabled = false;
    retakeBtn.disabled = true;
    resultDiv.style.display = 'none';
});

// Analyze food from image
analyzeBtn.addEventListener('click', async () => {
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analyzing...';
    
    try {
        // Convert canvas to blob for API upload
        canvas.toBlob(async (blob) => {
            try {
                // For this demo, we'll use manual search since free image recognition APIs are limited
                // In a production app, you'd use Google Vision, Clarifai, or custom ML model
                await analyzeWithComputerVision(blob);
            } catch (error) {
                console.error('Image analysis failed:', error);
                // Fallback to manual entry
                showManualSearchPrompt();
            }
        }, 'image/jpeg');
    } catch (error) {
        console.error('Analysis error:', error);
        showManualSearchPrompt();
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Analyze Food & Calories';
    }
});

// Manual search functionality
searchFoodBtn.addEventListener('click', () => {
    const query = foodSearch.value.trim().toLowerCase();
    if (query) {
        searchFoodCalories(query);
    }
});

foodSearch.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchFoodBtn.click();
    }
});

// Food analysis functions
async function analyzeWithComputerVision(imageBlob) {
    // Simulate AI analysis - in real implementation, use:
    // 1. Google Cloud Vision API
    // 2. Custom TensorFlow.js model
    // 3. Clarifai Food Model
    
    // For demo purposes, we'll extract text and search (simulated)
    showResult('Taking photo of food... Analysis would use AI to identify food items. For now, please use manual search below.', 0, 'Unknown Food');
}

async function searchFoodCalories(foodName) {
    try {
        showResult('Searching for nutrition information...', 0, foodName);
        
        // Try API Ninjas first
        let nutritionData = await searchWithApiNinjas(foodName);
        
        if (!nutritionData) {
            // Fallback to Nutritionix
            nutritionData = await searchWithNutritionix(foodName);
        }
        
        if (!nutritionData) {
            // Final fallback to local database
            nutritionData = searchLocalDatabase(foodName);
        }
        
        if (nutritionData) {
            displayNutritionResult(foodName, nutritionData);
        } else {
            showResult(`No nutrition data found for "${foodName}". Please try a different name or be more specific.`, 0, foodName);
        }
    } catch (error) {
        console.error('Search error:', error);
        const localData = searchLocalDatabase(foodName);
        if (localData) {
            displayNutritionResult(foodName, localData);
        } else {
            showResult(`Error searching for "${foodName}". Please check your spelling or try another food.`, 0, foodName);
        }
    }
}

async function searchWithApiNinjas(foodName) {
    try {
        const response = await fetch(
            `https://api.api-ninjas.com/v1/nutrition?query=${encodeURIComponent(foodName + ' indian')}`,
            {
                headers: {
                    'X-Api-Key': NINJAS_API_KEY
                }
            }
        );
        
        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                const item = data[0];
                return {
                    calories: Math.round(item.calories),
                    serving: item.serving_size_g ? `${item.serving_size_g}g` : '1 serving',
                    protein: Math.round(item.protein_g),
                    carbs: Math.round(item.carbohydrates_total_g),
                    fat: Math.round(item.fat_total_g)
                };
            }
        }
    } catch (error) {
        console.log('ApiNinjas failed, trying fallback...');
    }
    return null;
}

async function searchWithNutritionix(foodName) {
    try {
        const response = await fetch(
            `https://trackapi.nutritionix.com/v2/search/instant?query=${encodeURIComponent(foodName)}`,
            {
                headers: {
                    'x-app-id': NUTRITIONIX_APP_ID,
                    'x-app-key': NUTRITIONIX_APP_KEY
                }
            }
        );
        
        if (response.ok) {
            const data = await response.json();
            if (data.common && data.common.length > 0) {
                // Get detailed nutrition for the first result
                const detailed = await getNutritionixDetail(data.common[0].food_name);
                return detailed;
            }
        }
    } catch (error) {
        console.log('Nutritionix failed, using local database...');
    }
    return null;
}

async function getNutritionixDetail(foodName) {
    try {
        const response = await fetch(
            'https://trackapi.nutritionix.com/v2/natural/nutrients',
            {
                method: 'POST',
                headers: {
                    'x-app-id': NUTRITIONIX_APP_ID,
                    'x-app-key': NUTRITIONIX_APP_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: foodName
                })
            }
        );
        
        if (response.ok) {
            const data = await response.json();
            if (data.foods && data.foods.length > 0) {
                const food = data.foods[0];
                return {
                    calories: Math.round(food.nf_calories),
                    serving: food.serving_unit ? `${food.serving_qty} ${food.serving_unit}` : '1 serving',
                    protein: Math.round(food.nf_protein),
                    carbs: Math.round(food.nf_total_carbohydrate),
                    fat: Math.round(food.nf_total_fat)
                };
            }
        }
    } catch (error) {
        console.log('Nutritionix detail failed');
    }
    return null;
}

function searchLocalDatabase(foodName) {
    // Direct match
    if (southAsianFoodDatabase[foodName]) {
        return southAsianFoodDatabase[foodName];
    }
    
    // Fuzzy match - find closest food name
    for (const [key, value] of Object.entries(southAsianFoodDatabase)) {
        if (foodName.includes(key) || key.includes(foodName)) {
            return value;
        }
    }
    
    return null;
}

// UI update functions
function showResult(message, calories, foodName) {
    currentCalories = calories;
    currentFoodName = foodName;
    
    resultContent.innerHTML = message;
    resultDiv.style.display = 'block';
    
    addToTotalBtn.style.display = calories > 0 ? 'block' : 'none';
}

function displayNutritionResult(foodName, nutritionData) {
    const message = `
        <strong>${foodName.charAt(0).toUpperCase() + foodName.slice(1)}</strong><br>
        Calories: <strong>${nutritionData.calories} kcal</strong><br>
        Serving: ${nutritionData.serving}<br>
        ${nutritionData.protein ? `Protein: ${nutritionData.protein}g | Carbs: ${nutritionData.carbs}g | Fat: ${nutritionData.fat}g` : ''}
    `;
    showResult(message, nutritionData.calories, foodName);
}

function showManualSearchPrompt() {
    showResult('Camera analysis not available in demo. Please use the manual search below to find your food.', 0, 'Unknown');
}

// Add to daily total
addToTotalBtn.addEventListener('click', () => {
    if (currentCalories > 0) {
        dailyTotal += currentCalories;
        updateDailyTotal();
        addToFoodLog(currentFoodName, currentCalories);
        resultDiv.style.display = 'none';
        foodSearch.value = '';
    }
});

function updateDailyTotal() {
    totalCaloriesSpan.textContent = dailyTotal;
}

function addToFoodLog(foodName, calories) {
    const logEntry = document.createElement('div');
    logEntry.className = 'food-item';
    logEntry.innerHTML = `
        <span>${foodName.charAt(0).toUpperCase() + foodName.slice(1)}</span>
        <span>${calories} kcal</span>
    `;
    foodLog.appendChild(logEntry);
}

// Initialize
function init() {
    // Load saved data from localStorage
    const savedTotal = localStorage.getItem('dailyCalories');
    const savedLog = localStorage.getItem('foodLog');
    
    if (savedTotal) {
        dailyTotal = parseInt(savedTotal);
        updateDailyTotal();
    }
    
    if (savedLog) {
        foodLog.innerHTML = savedLog;
    }
    
    // Save data periodically
    setInterval(saveData, 5000);
}

function saveData() {
    localStorage.setItem('dailyCalories', dailyTotal.toString());
    localStorage.setItem('foodLog', foodLog.innerHTML);
}

// Start the application
init();
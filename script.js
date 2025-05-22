// Global variables
let currentUser = '';
let currentUserColor = '#3498db';
let currentDate = new Date();
let selectedDates = new Set();
let allUserDates = [];

// Predefined color palette for users
const USER_COLORS = [
    '#e74c3c', // Red
    '#3498db', // Blue
    '#2ecc71', // Green
    '#f39c12', // Orange
    '#9b59b6', // Purple
    '#1abc9c', // Teal
    '#e67e22', // Dark Orange
    '#34495e', // Dark Blue Gray
    '#f1c40f', // Yellow
    '#e91e63', // Pink
    '#ff5722', // Deep Orange
    '#607d8b', // Blue Gray
    '#795548', // Brown
    '#009688', // Cyan
    '#ff9800', // Amber
    '#8bc34a', // Light Green
    '#673ab7', // Deep Purple
    '#03a9f4', // Light Blue
    '#4caf50', // Green
    '#ffc107'  // Golden Yellow
];

// Wait for Supabase to load, then initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Supabase client
    const SUPABASE_URL = 'https://yvnxjbcfodlvkrtknzsu.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnhqYmNmb2RsdmtydGtuenN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MjgwNzQsImV4cCI6MjA2MzUwNDA3NH0.QIkw49Pk11TBv2I6ZczM-6mSAhy6mWcdkQD_q1hLkJo';

    // Check if Supabase is available
    if (typeof window.supabase === 'undefined') {
        console.error('Supabase library not loaded');
        showError('Error loading application. Please refresh the page.', 'errorMessage');
        return;
    }

    // Initialize Supabase client
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elements
const nameEntry = document.getElementById('nameEntry');
const pinSetup = document.getElementById('pinSetup');
const loginScreen = document.getElementById('loginScreen');
const calendarContainer = document.getElementById('calendarContainer');

// Name entry elements
const nameInput = document.getElementById('nameInput');
const submitNameBtn = document.getElementById('submitName');
const errorMessage = document.getElementById('errorMessage');

// PIN setup elements
const pinInput = document.getElementById('pinInput');
const submitPinBtn = document.getElementById('submitPin');
const pinErrorMessage = document.getElementById('pinErrorMessage');

// Login elements
const loginUserName = document.getElementById('loginUserName');
const loginPinInput = document.getElementById('loginPinInput');
const submitLoginPinBtn = document.getElementById('submitLoginPin');
const loginErrorMessage = document.getElementById('loginErrorMessage');
const backToNameBtn = document.getElementById('backToName');

// Calendar elements
const userName = document.getElementById('userName');
const userColorDisplay = document.getElementById('userColorDisplay');
const monthYear = document.getElementById('monthYear');
const calendarBody = document.getElementById('calendarBody');
const saveBtn = document.getElementById('saveBtn');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const colorKey = document.getElementById('colorKey');
const userList = document.getElementById('userList');

    // Debug: Check which elements are missing
    const elements = {
        nameEntry, pinSetup, loginScreen, calendarContainer,
        nameInput, submitNameBtn, errorMessage,
        pinInput, submitPinBtn, pinErrorMessage,
        loginUserName, loginPinInput, submitLoginPinBtn, loginErrorMessage, backToNameBtn,
        userName, userColorDisplay, monthYear, calendarBody, saveBtn, prevMonthBtn, nextMonthBtn, colorKey, userList
    };
    
    Object.entries(elements).forEach(([name, element]) => {
        if (!element) {
            console.error(`Missing element: ${name}`);
        }
    });

    // Event listeners with null checks
    if (submitNameBtn) {
        submitNameBtn.addEventListener('click', handleNameSubmit);
    }
    if (nameInput) {
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleNameSubmit();
        });
    }

    if (submitPinBtn) {
        submitPinBtn.addEventListener('click', handlePinSubmit);
    }
    if (pinInput) {
        pinInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handlePinSubmit();
        });
        pinInput.addEventListener('input', (e) => {
            // Ensure only 4 digits
            if (e.target.value.length > 4) {
                e.target.value = e.target.value.slice(0, 4);
            }
        });
    }

    if (submitLoginPinBtn) {
        submitLoginPinBtn.addEventListener('click', handleLoginSubmit);
    }
    if (loginPinInput) {
        loginPinInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLoginSubmit();
        });
        loginPinInput.addEventListener('input', (e) => {
            // Ensure only 4 digits
            if (e.target.value.length > 4) {
                e.target.value = e.target.value.slice(0, 4);
            }
        });
    }

    if (backToNameBtn) {
        backToNameBtn.addEventListener('click', () => {
            showNameEntry();
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', saveSelectedDates);
    }
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => navigateMonth(-1));
    }
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => navigateMonth(1));
    }

    // Focus on name input if it exists
    if (nameInput) {
        nameInput.focus();
    }
});

// Show different screens
function showNameEntry() {
    nameEntry.style.display = 'block';
    pinSetup.style.display = 'none';
    loginScreen.style.display = 'none';
    calendarContainer.style.display = 'none';
    nameInput.value = '';
    nameInput.focus();
}

function showPinSetup() {
    nameEntry.style.display = 'none';
    pinSetup.style.display = 'block';
    loginScreen.style.display = 'none';
    calendarContainer.style.display = 'none';
    pinInput.value = '';
    pinInput.focus();
}

function showLogin(userName) {
    nameEntry.style.display = 'none';
    pinSetup.style.display = 'none';
    loginScreen.style.display = 'block';
    calendarContainer.style.display = 'none';
    loginUserName.textContent = userName;
    loginPinInput.value = '';
    loginPinInput.focus();
}

function showCalendar() {
    nameEntry.style.display = 'none';
    pinSetup.style.display = 'none';
    loginScreen.style.display = 'none';
    calendarContainer.style.display = 'block';
    userName.textContent = currentUser;
    userColorDisplay.style.backgroundColor = currentUserColor;
    loadCalendarData();
    renderCalendar();
}

// Get available color for new user
async function getAvailableColor() {
    try {
        // Get all used colors
        const { data, error } = await window.supabaseClient
            .from('users')
            .select('color');

        if (error) throw error;

        const usedColors = data ? data.map(user => user.color) : [];
        
        // Find first available color
        for (const color of USER_COLORS) {
            if (!usedColors.includes(color)) {
                return color;
            }
        }
        
        // If all predefined colors are used, generate a random one
        return `#${Math.floor(Math.random()*16777215).toString(16)}`;
        
    } catch (error) {
        console.error('Error getting available color:', error);
        // Fallback to random color
        return `#${Math.floor(Math.random()*16777215).toString(16)}`;
    }
}

// Handle name submission
async function handleNameSubmit() {
    const name = nameInput.value.trim();
    
    if (!name) {
        showError('Please enter a name', 'errorMessage');
        return;
    }

    if (name.length < 2) {
        showError('Name must be at least 2 characters', 'errorMessage');
        return;
    }

    // Check if name exists in database
    try {
        const { data, error } = await window.supabaseClient
            .from('users')
            .select('name, color')
            .eq('name', name);

        if (error) throw error;

        if (data && data.length > 0) {
            // User exists, show login screen
            currentUser = name;
            currentUserColor = data[0].color;
            showLogin(name);
        } else {
            // New user, get available color and show PIN setup
            currentUser = name;
            currentUserColor = await getAvailableColor();
            showPinSetup();
        }
        
    } catch (error) {
        console.error('Error checking name:', error);
        showError('Error connecting to database. Please try again.', 'errorMessage');
    }
}

// Handle PIN setup submission
async function handlePinSubmit() {
    const pin = pinInput.value.trim();
    
    if (!pin) {
        showError('Please enter a PIN', 'pinErrorMessage');
        return;
    }

    if (pin.length !== 4) {
        showError('PIN must be exactly 4 digits', 'pinErrorMessage');
        return;
    }

    if (!/^\d{4}$/.test(pin)) {
        showError('PIN must contain only numbers', 'pinErrorMessage');
        return;
    }

    // Add user to database with PIN
    try {
        const { error } = await window.supabaseClient
            .from('users')
            .insert([{ 
                name: currentUser, 
                color: currentUserColor,
                pin: pin
            }]);

        if (error) throw error;

        // Success, show calendar
        showCalendar();
        
    } catch (error) {
        console.error('Error creating user:', error);
        showError('Error creating account. Please try again.', 'pinErrorMessage');
    }
}

// Handle login submission
async function handleLoginSubmit() {
    const pin = loginPinInput.value.trim();
    
    if (!pin) {
        showError('Please enter your PIN', 'loginErrorMessage');
        return;
    }

    if (pin.length !== 4) {
        showError('PIN must be exactly 4 digits', 'loginErrorMessage');
        return;
    }

    // Verify PIN
    try {
        const { data, error } = await window.supabaseClient
            .from('users')
            .select('name, color, pin')
            .eq('name', currentUser)
            .eq('pin', pin);

        if (error) throw error;

        if (data && data.length > 0) {
            // Correct PIN, load user data and show calendar
            currentUserColor = data[0].color;
            showCalendar();
        } else {
            showError('Incorrect PIN. Please try again.', 'loginErrorMessage');
        }
        
    } catch (error) {
        console.error('Error verifying PIN:', error);
        showError('Error logging in. Please try again.', 'loginErrorMessage');
    }
}

// Show error message
function showError(message, elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    setTimeout(() => {
        errorElement.textContent = '';
    }, 5000);
}

// Load calendar data from database
async function loadCalendarData() {
    try {
        const { data, error } = await window.supabaseClient
            .from('calendar_entries')
            .select('*');

        if (error) throw error;

        allUserDates = data || [];
        updateCalendarDisplay();
        loadUserColorKey();
        
    } catch (error) {
        console.error('Error loading calendar data:', error);
    }
}

// Load and display user color key
async function loadUserColorKey() {
    try {
        const { data, error } = await window.supabaseClient
            .from('users')
            .select('name, color')
            .order('name');

        if (error) throw error;

        const users = data || [];
        
        // Clear existing user list
        userList.innerHTML = '';
        
        if (users.length === 0) {
            userList.innerHTML = '<div style="color: #666; font-style: italic;">No users yet</div>';
            return;
        }
        
        // Create user items
        users.forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            
            const colorDot = document.createElement('div');
            colorDot.className = 'user-color-dot';
            colorDot.style.backgroundColor = user.color;
            
            const userName = document.createElement('span');
            userName.textContent = user.name;
            
            userItem.appendChild(colorDot);
            userItem.appendChild(userName);
            userList.appendChild(userItem);
        });
        
    } catch (error) {
        console.error('Error loading user colors:', error);
        userList.innerHTML = '<div style="color: #e74c3c;">Error loading users</div>';
    }
}

// Navigate months
function navigateMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    renderCalendar();
}

// Render calendar
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update month/year display
    monthYear.textContent = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric'
    }).format(currentDate);

    // Clear calendar body
    calendarBody.innerHTML = '';

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // Generate calendar weeks
    for (let week = 0; week < 6; week++) {
        const row = document.createElement('tr');
        
        for (let day = 0; day < 7; day++) {
            const cell = document.createElement('td');
            const cellDate = new Date(startDate);
            cellDate.setDate(startDate.getDate() + (week * 7) + day);
            
            const dateStr = cellDate.toISOString().split('T')[0];
            cell.textContent = cellDate.getDate();
            cell.dataset.date = dateStr;
            
            // Mark cells from other months
            if (cellDate.getMonth() !== month) {
                cell.classList.add('other-month');
            }
            
            // Mark selected dates
            if (selectedDates.has(dateStr)) {
                cell.classList.add('selected');
            }
            
            // Add click handler
            cell.addEventListener('click', () => toggleDate(dateStr, cell));
            
            // Add dots for existing entries
            addDateDots(cell, dateStr);
            
            row.appendChild(cell);
        }
        
        calendarBody.appendChild(row);
    }
}

// Toggle date selection
function toggleDate(dateStr, cell) {
    if (cell.classList.contains('other-month')) return;
    
    if (selectedDates.has(dateStr)) {
        selectedDates.delete(dateStr);
        cell.classList.remove('selected');
    } else {
        selectedDates.add(dateStr);
        cell.classList.add('selected');
    }
    
    saveBtn.disabled = selectedDates.size === 0;
}

// Add dots for existing entries
function addDateDots(cell, dateStr) {
    const existingEntries = allUserDates.filter(entry => entry.date === dateStr);
    
    if (existingEntries.length > 0) {
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'date-dots';
        
        existingEntries.forEach(entry => {
            const dot = document.createElement('div');
            dot.className = 'date-dot';
            dot.style.backgroundColor = entry.color;
            dot.title = entry.user_name;
            dotsContainer.appendChild(dot);
        });
        
        cell.appendChild(dotsContainer);
    }
}

// Update calendar display
function updateCalendarDisplay() {
    renderCalendar();
}

// Save selected dates
async function saveSelectedDates() {
    if (selectedDates.size === 0) return;
    
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    
    try {
        // Delete existing entries for this user
        await window.supabaseClient
            .from('calendar_entries')
            .delete()
            .eq('user_name', currentUser);

        // Insert new entries
        const entries = Array.from(selectedDates).map(date => ({
            user_name: currentUser,
            date: date,
            color: currentUserColor
        }));

        const { error } = await window.supabaseClient
            .from('calendar_entries')
            .insert(entries);

        if (error) throw error;

        // Reload data and update display
        await loadCalendarData();
        selectedDates.clear();
        
        saveBtn.textContent = 'Saved!';
        setTimeout(() => {
            saveBtn.textContent = 'Save Selected Dates';
            saveBtn.disabled = false;
        }, 2000);
        
    } catch (error) {
        console.error('Error saving dates:', error);
        saveBtn.textContent = 'Error - Try Again';
        setTimeout(() => {
            saveBtn.textContent = 'Save Selected Dates';
            saveBtn.disabled = false;
        }, 3000);
    }
}
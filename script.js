// Wait for Supabase to load, then initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Supabase client
  const SUPABASE_URL = 'https://yvnxjbcfodlvkrtknzsu.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnhqYmNmb2RsdmtydGtuenN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MjgwNzQsImV4cCI6MjA2MzUwNDA3NH0.QIkw49Pk11TBv2I6ZczM-6mSAhy6mWcdkQD_q1hLkJo';

  // Check if Supabase is available
  if (typeof window.supabase === 'undefined') {
      console.error('Supabase library not loaded');
      showError('Error loading application. Please refresh the page.');
      return;
  }

  // Initialize Supabase client
  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global variables
let currentUser = '';
let currentUserColor = '#3498db';
let currentDate = new Date();
let selectedDates = new Set();
let allUserDates = [];

// DOM elements
const nameEntry = document.getElementById('nameEntry');
const calendarContainer = document.getElementById('calendarContainer');
const nameInput = document.getElementById('nameInput');
const submitNameBtn = document.getElementById('submitName');
const errorMessage = document.getElementById('errorMessage');
const userName = document.getElementById('userName');
const userColorDisplay = document.getElementById('userColorDisplay');
const monthYear = document.getElementById('monthYear');
const calendarBody = document.getElementById('calendarBody');
const colorPicker = document.getElementById('colorPicker');
const saveBtn = document.getElementById('saveBtn');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');

  // Event listeners
  submitNameBtn.addEventListener('click', handleNameSubmit);
  nameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleNameSubmit();
  });
  colorPicker.addEventListener('change', (e) => {
      currentUserColor = e.target.value;
      userColorDisplay.style.backgroundColor = currentUserColor;
  });
  saveBtn.addEventListener('click', saveSelectedDates);
  prevMonthBtn.addEventListener('click', () => navigateMonth(-1));
  nextMonthBtn.addEventListener('click', () => navigateMonth(1));

  // Focus on name input
  nameInput.focus();
});

// Handle name submission
async function handleNameSubmit() {
  const name = nameInput.value.trim();
  
  if (!name) {
      showError('Please enter a name');
      return;
  }

  if (name.length < 2) {
      showError('Name must be at least 2 characters');
      return;
  }

  // Check if name exists in database
  try {
      const { data, error } = await window.supabaseClient
          .from('users')
          .select('name')
          .eq('name', name);

      if (error) throw error;

      if (data && data.length > 0) {
          showError('This name is already taken. Please choose a different name.');
          return;
      }

      // Name is available, proceed to calendar
      currentUser = name;
      await addUserToDatabase();
      showCalendar();
      
  } catch (error) {
      console.error('Error checking name:', error);
      showError('Error connecting to database. Please try again.');
  }
}

// Add user to database
async function addUserToDatabase() {
  try {
      const { error } = await window.supabaseClient
          .from('users')
          .insert([{ name: currentUser, color: currentUserColor }]);

      if (error) throw error;
  } catch (error) {
      console.error('Error adding user:', error);
  }
}

// Show error message
function showError(message) {
  errorMessage.textContent = message;
  setTimeout(() => {
      errorMessage.textContent = '';
  }, 5000);
}

// Show calendar screen
function showCalendar() {
  nameEntry.style.display = 'none';
  calendarContainer.style.display = 'block';
  userName.textContent = currentUser;
  userColorDisplay.style.backgroundColor = currentUserColor;
  loadCalendarData();
  renderCalendar();
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
      
  } catch (error) {
      console.error('Error loading calendar data:', error);
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
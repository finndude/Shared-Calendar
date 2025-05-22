import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://xfmrylskukifczqultje.supabase.co'; // Replace this
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbXJ5bHNrdWtpZmN6cXVsdGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTI3OTAsImV4cCI6MjA2MzQ4ODc5MH0.0d5h-3__0v9ZS6QTib_0hKE1ir3mNR9e_qd2ClWpqRw';                    // Replace this
const supabase = createClient(supabaseUrl, supabaseKey);

const calendar = document.getElementById('calendar');
const usernameInput = document.getElementById('username');
const status = document.getElementById('status');

// Generate next 30 days
const today = new Date();
for (let i = 0; i < 30; i++) {
  const date = new Date();
  date.setDate(today.getDate() + i);
  const dateStr = date.toISOString().split('T')[0];

  const div = document.createElement('div');
  div.classList.add('day');
  div.dataset.date = dateStr;
  div.textContent = dateStr;

  div.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    if (!username) {
      alert('Please enter your name.');
      return;
    }

    const { error } = await supabase.from('availability').insert([
      { user_name: username, date: dateStr }
    ]);

    if (!error) {
      div.classList.add('selected');
      status.textContent = `Marked ${dateStr} as available.`;
    } else {
      status.textContent = `Error: ${error.message}`;
    }
  });

  calendar.appendChild(div);
}

// Load initial availability
async function loadAvailability() {
  const { data, error } = await supabase.from('availability').select('*');

  if (data) {
    data.forEach(entry => {
      const el = document.querySelector(`.day[data-date='${entry.date}']`);
      if (el) {
        el.classList.add('selected');
        el.title += `${entry.user_name} is free\n`;
      }
    });
  }
}

loadAvailability();

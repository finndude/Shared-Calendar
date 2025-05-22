import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://xfmrylskukifczqultje.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbXJ5bHNrdWtpZmN6cXVsdGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTI3OTAsImV4cCI6MjA2MzQ4ODc5MH0.0d5h-3__0v9ZS6QTib_0hKE1ir3mNR9e_qd2ClWpqRw';
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

    const userId = Math.abs(username.hashCode()); // simple hash for user_id

    const { error } = await supabase.from('availability').insert([
      { user_id: userId, user_name: username, available_date: dateStr }
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
      const el = document.querySelector(`.day[data-date='${entry.available_date}']`);
      if (el) {
        el.classList.add('selected');
        el.title += `${entry.user_name} is free\n`;
      }
    });
  }
}

// Add simple hashCode function for user_id generation
String.prototype.hashCode = function () {
  let hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
};

loadAvailability();

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const authArea = document.getElementById('authArea');
const authForm = document.getElementById('authForm');
const authSubmit = document.getElementById('authSubmit');
const formMsg = document.getElementById('formMsg');
const loginHeading = document.getElementById('loginHeading');
const loginSub = document.getElementById('loginSub');
const fullNameField = document.getElementById('fullNameField');
const tabs = document.querySelectorAll('.login-tabs [role="tab"]');

let mode = 'signin'; // 'signin' | 'signup'

// ---------- Tab switching (Log in / Sign up) ----------
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    mode = tab.dataset.mode;
    tabs.forEach(t => {
      t.classList.toggle('active', t === tab);
      t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
    });
    setMsg('');

    if (mode === 'signup') {
      loginHeading.textContent = 'Create your account';
      loginSub.textContent = 'Sign up to start your IC-38 preparation.';
      fullNameField.hidden = false;
      authSubmit.textContent = 'Sign up';
    } else {
      loginHeading.textContent = 'Welcome back';
      loginSub.textContent = 'Log in to continue your IC-38 preparation.';
      fullNameField.hidden = true;
      authSubmit.textContent = 'Log in';
    }
  });
});

function setMsg(text, isError = false) {
  formMsg.textContent = text;
  formMsg.style.color = isError ? '#c0392b' : 'var(--green)';
}

// ---------- Form submit ----------
authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const fullName = document.getElementById('fullName').value.trim();

  authSubmit.disabled = true;
  setMsg(mode === 'signup' ? 'Creating your account…' : 'Logging in…');

  try {
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });
      if (error) throw error;
      setMsg('Account created. Check your email to confirm, then log in.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setMsg('Logged in.');
      authForm.reset();
    }
  } catch (err) {
    setMsg(err.message || 'Something went wrong.', true);
  } finally {
    authSubmit.disabled = false;
  }
});

// ---------- Keep the top bar in sync with login state ----------
async function renderAuthArea(session) {
  if (!session) {
    authArea.innerHTML = `<a class="btn btn-ghost" href="#login">Login</a>`;
    return;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', session.user.id)
    .single();

  const name = profile?.full_name || session.user.email.split('@')[0];
  const badge = profile?.role === 'admin' ? ' <span class="role-badge">Admin</span>' : '';

  authArea.innerHTML = `
    <span class="user-chip">Hi, ${name}${badge}</span>
    <button class="btn btn-ghost" id="logoutBtn" type="button">Log out</button>
  `;

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await supabase.auth.signOut();
  });
}

supabase.auth.onAuthStateChange((_event, session) => {
  renderAuthArea(session);
});

supabase.auth.getSession().then(({ data: { session } }) => {
  renderAuthArea(session);
});

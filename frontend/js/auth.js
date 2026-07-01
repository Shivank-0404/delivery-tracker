function getUser() {
  const userStr = localStorage.getItem('dt_user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
}

function getToken() {
  return localStorage.getItem('dt_token');
}

function logout() {
  localStorage.removeItem('dt_token');
  localStorage.removeItem('dt_user');
  window.location.href = '/index.html';
}

function requireAuth(role) {
  const token = getToken();
  const user = getUser();
  
  if (!token || !user) {
    window.location.href = '/index.html';
    return;
  }
  
  if (role && user.role !== role) {
    // Redirect appropriately based on role
    if (user.role === 'admin') window.location.href = '/admin/dashboard.html';
    else if (user.role === 'customer') window.location.href = '/customer/dashboard.html';
    else if (user.role === 'agent') window.location.href = '/agent/dashboard.html';
    else window.location.href = '/index.html';
  }
}

function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerText = message;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Global exposure
window.getUser = getUser;
window.getToken = getToken;
window.logout = logout;
window.requireAuth = requireAuth;
window.showToast = showToast;

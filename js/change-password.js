document.addEventListener("DOMContentLoaded", ()=>{

        document.getElementById("logoutBtn").addEventListener("click", async ()=> {
        await window.auth.logout();
        sessionStorage.setItem("loggedOut", "true");
        window.location.href = "login.html";
    });

    
     const form = document.getElementById('changeForm');
    const message = document.getElementById('message');
    const submitBtn = document.getElementById('submitBtn');

    function show(text, type) {
      message.textContent = text;
      message.className = type;
    }


    (async () => {
      const user = await window.auth.currentUser();
      if (!user) window.location.replace('login.html');
    })();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (newPassword.length < 6) return show('New password must be at least 6 characters.', 'error');
      if (newPassword !== confirmPassword) return show('New passwords do not match.', 'error');
      if (newPassword === currentPassword) return show('New password must be different from the current one.', 'error');

      submitBtn.disabled = true;
      const res = await window.auth.changePassword({ currentPassword, newPassword });
      submitBtn.disabled = false;

      if (!res.ok) return show(res.error, 'error');

      show('Password updated! Redirecting...', 'success');
      setTimeout(() => window.location.replace('index.html'), 1200);
    });
});
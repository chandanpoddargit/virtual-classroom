const token = localStorage.getItem('token');

async function fetchUserData() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/user', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('User data:', data);
    document.getElementById('user-name').textContent = data.username;
  } catch (error) {
    console.error('Error fetching user data:', error);
    if (error.message.includes('401')) {
      window.location.href = 'login.html';
    }
  }
}

document.addEventListener('DOMContentLoaded', fetchUserData);
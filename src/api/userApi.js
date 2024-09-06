const API_BASE_URL = 'https://1349-78-84-19-24.ngrok-free.app';

export const createOrGetUser = async (userData) => {
  try {
    const initData = window.Telegram.WebApp.initData;
    const response = await fetch(`${API_BASE_URL}/api/users/create-or-get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...userData, initData }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating or getting user:', error);
    throw error;
  }
};

export const updateUserWallet = async (telegramId, walletAddress) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${telegramId}/wallet`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating user wallet:', error);
    throw error;
  }
};
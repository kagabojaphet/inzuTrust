// utils/auth.js
export const setAuthData = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
};

export const getAuthToken = () => localStorage.getItem('token');

export const getUserData = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

export const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
};
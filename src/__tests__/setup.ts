import '@testing-library/jest-dom';

// Clean localStorage between every test
beforeEach(() => {
  localStorage.clear();
});

// Remove dark class from documentElement between tests
afterEach(() => {
  document.documentElement.classList.remove('dark');
});

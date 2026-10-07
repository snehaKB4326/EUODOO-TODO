/**
 * Euodoo To Do List - Login Script (js/login.js)
 * Handles client-side validation, password toggle, and navigation.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const loginForm = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const employeeIdInput = document.getElementById("employee-id");
  const passwordInput = document.getElementById("password");
  const passwordToggleBtn = document.getElementById("password-toggle-btn");
  const eyeOpenIcon = document.getElementById("eye-open-icon");
  const eyeClosedIcon = document.getElementById("eye-closed-icon");

  // Error message elements
  const emailError = document.getElementById("email-error");
  const employeeIdError = document.getElementById("employee-id-error");
  const passwordError = document.getElementById("password-error");

  // 1. Password Show/Hide Toggle
  if (passwordToggleBtn && passwordInput) {
    passwordToggleBtn.addEventListener("click", () => {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";

      if (eyeOpenIcon && eyeClosedIcon) {
        eyeOpenIcon.style.display = isPassword ? "none" : "block";
        eyeClosedIcon.style.display = isPassword ? "block" : "none";
      }

      passwordToggleBtn.setAttribute(
        "aria-label",
        isPassword ? "Hide password" : "Show password"
      );
    });
  }

  // 2. Real-time error clearing on input
  function clearFieldError(input, errorElement) {
    input.classList.remove("has-error");
    if (errorElement) {
      errorElement.textContent = "";
      errorElement.classList.remove("visible");
    }
  }

  emailInput?.addEventListener("input", () => clearFieldError(emailInput, emailError));
  employeeIdInput?.addEventListener("input", () => clearFieldError(employeeIdInput, employeeIdError));
  passwordInput?.addEventListener("input", () => clearFieldError(passwordInput, passwordError));

  // Email format validation helper
  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  }

  // 3. Form Submission & Validation
  loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    let isValid = true;

    // Reset errors
    clearFieldError(emailInput, emailError);
    clearFieldError(employeeIdInput, employeeIdError);
    clearFieldError(passwordInput, passwordError);

    const emailVal = emailInput.value.trim();
    const employeeIdVal = employeeIdInput.value.trim();
    const passwordVal = passwordInput.value;

    // Email validation
    if (!emailVal) {
      emailInput.classList.add("has-error");
      emailError.textContent = "Please enter your email.";
      emailError.classList.add("visible");
      isValid = false;
    } else if (!isValidEmail(emailVal)) {
      emailInput.classList.add("has-error");
      emailError.textContent = "Please enter a valid email address.";
      emailError.classList.add("visible");
      isValid = false;
    }

    // Employee ID validation
    if (!employeeIdVal) {
      employeeIdInput.classList.add("has-error");
      employeeIdError.textContent = "Employee ID is required.";
      employeeIdError.classList.add("visible");
      isValid = false;
    }

    // Password validation
    if (!passwordVal) {
      passwordInput.classList.add("has-error");
      passwordError.textContent = "Password is required.";
      passwordError.classList.add("visible");
      isValid = false;
    } else if (passwordVal.length < 6) {
      passwordInput.classList.add("has-error");
      passwordError.textContent = "Password must be at least 6 characters.";
      passwordError.classList.add("visible");
      isValid = false;
    }

    // If all validation passes, store login state and redirect
    if (isValid) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", emailVal);
      localStorage.setItem("employeeId", employeeIdVal);

      // Navigate to dashboard
      window.location.href = "dashboard.html";
    }
  });
});

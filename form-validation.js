'use strict';

/* ==========================================================================
   VELORA KITCHEN — BOOKING FORM VALIDATION
   Data-driven validation config (FIELD_RULES) applied to the reservation form.
   ========================================================================== */

const IS_DEV = false;

const devWarn = (...args) => {
  if (IS_DEV) console.warn(...args);
};

/**
 * Each entry describes how to validate one field.
 * test(value) returns true when the value is valid.
 * message is shown when the field is invalid.
 */
const FIELD_RULES = {
  fullName: {
    required: true,
    test: (value) => value.trim().length >= 2,
    message: 'Please enter your full name (at least 2 characters).',
  },
  phone: {
    required: true,
    test: (value) => /^[+\d][\d\s-]{7,14}$/.test(value.trim()),
    message: 'Please enter a valid phone number.',
  },
  email: {
    required: true,
    test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
    message: 'Please enter a valid email address.',
  },
  date: {
    required: true,
    test: (value) => {
      if (!value) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const chosen = new Date(value);
      return chosen >= today;
    },
    message: 'Please choose today or a future date.',
  },
  time: {
    required: true,
    test: (value) => value.trim().length > 0,
    message: 'Please choose a reservation time.',
  },
  guests: {
    required: true,
    test: (value) => value.trim().length > 0,
    message: 'Please select the number of guests.',
  },
};

const getField = (form, name) => form.elements.namedItem(name);

const getErrorElement = (fieldName) =>
  document.getElementById(`${toKebabCase(fieldName)}-error`);

const toKebabCase = (str) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

const validateField = (form, fieldName) => {
  const rule = FIELD_RULES[fieldName];
  if (!rule) return true;

  const field = getField(form, fieldName);
  const errorEl = getErrorElement(fieldName);
  if (!field) {
    devWarn(`[form] No field found for "${fieldName}".`);
    return true;
  }

  const value = field.value || '';
  const isValid = rule.test(value);

  if (errorEl) {
    errorEl.textContent = isValid ? '' : rule.message;
  }
  field.setAttribute('aria-invalid', String(!isValid));

  return isValid;
};

const validateAllFields = (form) =>
  Object.keys(FIELD_RULES)
    .map((fieldName) => validateField(form, fieldName))
    .every(Boolean);

const attachLiveValidation = (form) => {
  Object.keys(FIELD_RULES).forEach((fieldName) => {
    const field = getField(form, fieldName);
    if (!field) return;

    const eventName = field.tagName === 'SELECT' ? 'change' : 'blur';
    field.addEventListener(eventName, () => validateField(form, fieldName));

    // Clear the error as soon as the user starts fixing it.
    field.addEventListener('input', () => {
      const errorEl = getErrorElement(fieldName);
      if (errorEl && errorEl.textContent) {
        errorEl.textContent = '';
        field.setAttribute('aria-invalid', 'false');
      }
    });
  });
};

const showFormStatus = (statusEl, message, isSuccess) => {
  statusEl.textContent = message;
  statusEl.style.color = isSuccess ? 'var(--color-gold-bright)' : '#e8927c';
};

const setMinDateToday = (form) => {
  const dateField = getField(form, 'date');
  if (!dateField) return;
  const today = new Date().toISOString().split('T')[0];
  dateField.setAttribute('min', today);
};

const initBookingForm = () => {
  const form = document.getElementById('booking-form');
  if (!form) return;

  const statusEl = document.getElementById('form-status');

  setMinDateToday(form);
  attachLiveValidation(form);

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const isValid = validateAllFields(form);

    if (!isValid) {
      showFormStatus(statusEl, 'Please fix the highlighted fields and try again.', false);
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // No backend is connected yet — confirm locally and reset the form.
    const name = getField(form, 'fullName').value.trim();
    showFormStatus(statusEl, `Thank you, ${name}! Your reservation request has been received.`, true);
    form.reset();

    Object.keys(FIELD_RULES).forEach((fieldName) => {
      const errorEl = getErrorElement(fieldName);
      if (errorEl) errorEl.textContent = '';
    });
  });
};

document.addEventListener('DOMContentLoaded', initBookingForm);

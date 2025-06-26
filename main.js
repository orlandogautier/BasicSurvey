document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('survey-form');
  const ageInput = document.getElementById('number');
  const nameInput = document.getElementById('name');

  // Mostrar mensaje de error junto al input o fieldset
  function showError(element, message) {
    let container = element.parentNode;
    if (element.tagName === 'FIELDSET') {
      container = element;
    }
    let error = container.querySelector('.error-message');
    if (!error) {
      error = document.createElement('span');
      error.className = 'error-message';
      container.appendChild(error);
    }
    error.textContent = message;
    if (element.tagName !== 'FIELDSET') {
      element.setAttribute('aria-invalid', 'true');
    }
  }

  // Limpiar mensaje de error
  function clearError(element) {
    let container = element.parentNode;
    if (element.tagName === 'FIELDSET') {
      container = element;
    }
    const error = container.querySelector('.error-message');
    if (error) {
      error.textContent = '';
    }
    if (element.tagName !== 'FIELDSET') {
      element.removeAttribute('aria-invalid');
    }
  }

  // Validar input individual (text, email, number, select)
  function validateInput(input) {
    if (input.hasAttribute('required') && !input.value.trim()) {
      showError(input, 'This field is required');
      return false;
    }

    if (input.id === 'name') {
      // Validar que no contenga números ni caracteres especiales
      const regexName = /^[a-zA-Z\s]+$/;
      if (!regexName.test(input.value.trim())) {
        showError(input, 'Name cannot contain numbers or special characters');
        return false;
      }
    }

    if (input.type === 'email') {
      const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regexEmail.test(input.value.trim())) {
        showError(input, 'Please enter a valid email');
        return false;
      }
    }

    if (input.id === 'number') {
      const val = Number(input.value);
      if (val < 18 || val > 70) {
        showError(input, 'Value must be between 18 and 70');
        return false;
      }
    }

    clearError(input);
    return true;
  }

  // Validar grupo de radio buttons
  function validateRadioGroup(name) {
    const radios = form.querySelectorAll(`input[name="${name}"]`);
    const container = radios[0].closest('fieldset');
    const isChecked = Array.from(radios).some(radio => radio.checked);

    if (!isChecked) {
      showError(container, 'Please select an option');
      return false;
    } else {
      clearError(container);
      return true;
    }
  }

  // Validar grupo de checkboxes (al menos uno seleccionado)
  function validateCheckboxGroup(name) {
    const checkboxes = form.querySelectorAll(`input[name="${name}"]`);
    const container = checkboxes[0].closest('fieldset');
    const isChecked = Array.from(checkboxes).some(cb => cb.checked);

    if (!isChecked) {
      showError(container, 'Please select at least one option');
      return false;
    } else {
      clearError(container);
      return true;
    }
  }

  // Validación en tiempo real
  form.querySelectorAll('input, select').forEach(input => {
    if (input.type === 'checkbox' || input.type === 'radio') {
      input.addEventListener('change', () => {
        if (input.type === 'radio') {
          validateRadioGroup(input.name);
        } else if (input.type === 'checkbox') {
          validateCheckboxGroup(input.name);
        }
      });
    } else {
      input.addEventListener('input', () => {
        validateInput(input);
      });
    }
  });

  // Validar el campo edad en tiempo real para evitar fuera de rango y solo números
  ageInput.addEventListener('input', () => {
    // Quitar todo lo que no sea dígito
    ageInput.value = ageInput.value.replace(/[^0-9]/g, '');

    if (ageInput.value !== '') {
      let val = parseInt(ageInput.value, 10);
      if (val > 70) {
        ageInput.value = '70';
      } else if (val < 18) {
        ageInput.value = '18';
      }
    }
  });

  // Validar que en nombre no se puedan escribir números ni caracteres especiales (en tiempo real)
  nameInput.addEventListener('input', () => {
    nameInput.value = nameInput.value.replace(/[^a-zA-Z\s]/g, '');
  });

  // Validar todo al enviar
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    // Validar inputs y selects
    form.querySelectorAll('input[required], select[required]').forEach(input => {
      if (input.type === 'radio') {
        if (!validateRadioGroup(input.name)) isValid = false;
      } else if (input.type === 'checkbox') {
        // ignore aquí, validado luego por grupo
      } else {
        if (!validateInput(input)) isValid = false;
      }
    });

    // Validar grupos de radio (solo una vez por grupo)
    const radioNames = new Set();
    form.querySelectorAll('input[type="radio"][required]').forEach(radio => {
      radioNames.add(radio.name);
    });
    radioNames.forEach(name => {
      if (!validateRadioGroup(name)) isValid = false;
    });

    // Validar grupo checkbox "source" (solo una vez)
    if (!validateCheckboxGroup('source')) isValid = false;

    if (isValid) {
      form.submit();
    }
  });
});

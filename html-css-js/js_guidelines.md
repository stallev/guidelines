# JavaScript Development Guidelines

## Core Principles

### File Organization
- **Single JavaScript file**: All code must be in one file (`assets/js/script.js`)
- **No inline scripts**: Prohibit inline JavaScript or multiple JS files
- **Assets organization**: All resources (CSS, JS, images, icons) must be in `assets/` directory
- **Modular structure**: Organize code in functions or classes, avoid global variables
- **IIFE isolation**: Wrap each functional area in anonymous functions for isolation

### Modern JavaScript Standards
- Use pure JavaScript (no jQuery, Bootstrap JS, or legacy libraries)
- Use modern ES6+ features: arrow functions, const/let, template literals, destructuring
- Implement proper error handling and validation
- Ensure graceful degradation (functionality without JavaScript)

## Code Structure and Organization

### IIFE Pattern for Module Isolation
```javascript
// Mobile Menu Module
(function() {
  'use strict';
  
  const mobileMenu = {
    init() {
      this.bindEvents();
    },
    
    bindEvents() {
      const menuToggle = document.querySelector('.menu-toggle');
      const menu = document.querySelector('.mobile-menu');
      
      if (menuToggle && menu) {
        menuToggle.addEventListener('click', this.toggleMenu.bind(this));
        document.addEventListener('click', this.handleOutsideClick.bind(this));
        document.addEventListener('keydown', this.handleKeydown.bind(this));
      }
    },
    
    toggleMenu() {
      const menu = document.querySelector('.mobile-menu');
      const toggle = document.querySelector('.menu-toggle');
      
      menu.classList.toggle('active');
      toggle.setAttribute('aria-expanded', 
        menu.classList.contains('active') ? 'true' : 'false'
      );
    },
    
    handleOutsideClick(event) {
      const menu = document.querySelector('.mobile-menu');
      const toggle = document.querySelector('.menu-toggle');
      
      if (!menu.contains(event.target) && !toggle.contains(event.target)) {
        this.closeMenu();
      }
    },
    
    handleKeydown(event) {
      if (event.key === 'Escape') {
        this.closeMenu();
      }
    },
    
    closeMenu() {
      const menu = document.querySelector('.mobile-menu');
      const toggle = document.querySelector('.menu-toggle');
      
      menu.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    }
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => mobileMenu.init());
  } else {
    mobileMenu.init();
  }
})();

// Modal Window Module
(function() {
  'use strict';
  
  const modal = {
    init() {
      this.bindEvents();
    },
    
    bindEvents() {
      // Modal triggers
      document.addEventListener('click', (event) => {
        if (event.target.matches('[data-modal-trigger]')) {
          event.preventDefault();
          this.openModal(event.target.dataset.modalTrigger);
        }
      });
      
      // Modal close buttons
      document.addEventListener('click', (event) => {
        if (event.target.matches('.modal__close, .modal__overlay')) {
          this.closeModal();
        }
      });
      
      // Keyboard navigation
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && this.isModalOpen()) {
          this.closeModal();
        }
      });
    },
    
    openModal(modalId) {
      const modal = document.getElementById(modalId);
      if (!modal) return;
      
      // Store previous focus
      this.previousFocus = document.activeElement;
      
      // Show modal
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      
      // Focus management
      const firstFocusable = modal.querySelector('input, button, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) {
        firstFocusable.focus();
      }
      
      // Trap focus
      this.trapFocus(modal);
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    },
    
    closeModal() {
      const activeModal = document.querySelector('.modal.active');
      if (!activeModal) return;
      
      // Hide modal
      activeModal.classList.remove('active');
      activeModal.setAttribute('aria-hidden', 'true');
      
      // Restore body scroll
      document.body.style.overflow = '';
      
      // Return focus
      if (this.previousFocus) {
        this.previousFocus.focus();
      }
    },
    
    isModalOpen() {
      return document.querySelector('.modal.active') !== null;
    },
    
    trapFocus(modal) {
      const focusableElements = modal.querySelectorAll(
        'input, button, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      modal.addEventListener('keydown', (event) => {
        if (event.key === 'Tab') {
          if (event.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              event.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              event.preventDefault();
            }
          }
        }
      });
    }
  };
  
  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => modal.init());
  } else {
    modal.init();
  }
})();
```

## Event Handling

### Modern Event Listeners
- Use `addEventListener` instead of inline handlers
- Implement proper event delegation
- Handle keyboard events for accessibility
- Clean up event listeners when needed

### Event Handling Examples
```javascript
// Form Validation Module
(function() {
  'use strict';
  
  const formValidation = {
    init() {
      this.bindFormEvents();
    },
    
    bindFormEvents() {
      const forms = document.querySelectorAll('form[data-validate]');
      forms.forEach(form => {
        form.addEventListener('submit', this.handleSubmit.bind(this));
        
        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
          input.addEventListener('blur', () => this.validateField(input));
          input.addEventListener('input', () => this.clearFieldError(input));
        });
      });
    },
    
    handleSubmit(event) {
      event.preventDefault();
      
      const form = event.target;
      const formData = new FormData(form);
      const isValid = this.validateForm(form);
      
      if (isValid) {
        this.submitForm(form, formData);
      }
    },
    
    validateForm(form) {
      let isValid = true;
      const requiredFields = form.querySelectorAll('[required]');
      
      requiredFields.forEach(field => {
        if (!this.validateField(field)) {
          isValid = false;
        }
      });
      
      return isValid;
    },
    
    validateField(field) {
      const value = field.value.trim();
      const type = field.type;
      const required = field.hasAttribute('required');
      
      // Clear previous errors
      this.clearFieldError(field);
      
      // Required field validation
      if (required && !value) {
        this.showFieldError(field, 'This field is required');
        return false;
      }
      
      // Type-specific validation
      if (value) {
        switch (type) {
          case 'email':
            if (!this.isValidEmail(value)) {
              this.showFieldError(field, 'Please enter a valid email address');
              return false;
            }
            break;
          case 'tel':
            if (!this.isValidPhone(value)) {
              this.showFieldError(field, 'Please enter a valid phone number');
              return false;
            }
            break;
        }
      }
      
      return true;
    },
    
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
    
    isValidPhone(phone) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      return phoneRegex.test(phone.replace(/\D/g, ''));
    },
    
    showFieldError(field, message) {
      field.setAttribute('aria-invalid', 'true');
      
      let errorElement = field.parentNode.querySelector('.field-error');
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.setAttribute('role', 'alert');
        field.parentNode.appendChild(errorElement);
      }
      
      errorElement.textContent = message;
    },
    
    clearFieldError(field) {
      field.removeAttribute('aria-invalid');
      const errorElement = field.parentNode.querySelector('.field-error');
      if (errorElement) {
        errorElement.remove();
      }
    }
  };
  
  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => formValidation.init());
  } else {
    formValidation.init();
  }
})();
```

## Phone Mask Implementation

### Phone Masking Function
```javascript
// Phone Mask Module
(function() {
  'use strict';
  
  const phoneMask = {
    init() {
      this.bindPhoneInputs();
    },
    
    bindPhoneInputs() {
      const phoneInputs = document.querySelectorAll('input[type="tel"]');
      phoneInputs.forEach(input => {
        input.addEventListener('input', (event) => {
          this.applyMask(event.target);
        });
        
        input.addEventListener('keydown', (event) => {
          this.handleKeydown(event);
        });
      });
    },
    
    applyMask(input) {
      let value = input.value.replace(/\D/g, '');
      let formattedValue = '';
      
      if (value.length > 0) {
        if (value.length <= 3) {
          formattedValue = `+${value}`;
        } else if (value.length <= 6) {
          formattedValue = `+${value.slice(0, 3)} (${value.slice(3)})`;
        } else if (value.length <= 9) {
          formattedValue = `+${value.slice(0, 3)} (${value.slice(3, 6)}) ${value.slice(6)}`;
        } else {
          formattedValue = `+${value.slice(0, 3)} (${value.slice(3, 6)}) ${value.slice(6, 9)}-${value.slice(9, 11)}-${value.slice(11, 13)}`;
        }
      }
      
      input.value = formattedValue;
    },
    
    handleKeydown(event) {
      // Allow: backspace, delete, tab, escape, enter
      if ([8, 9, 27, 13, 46].indexOf(event.keyCode) !== -1 ||
          // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
          (event.keyCode === 65 && event.ctrlKey === true) ||
          (event.keyCode === 67 && event.ctrlKey === true) ||
          (event.keyCode === 86 && event.ctrlKey === true) ||
          (event.keyCode === 88 && event.ctrlKey === true)) {
        return;
      }
      // Ensure that it is a number and stop the keypress
      if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105)) {
        event.preventDefault();
      }
    }
  };
  
  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => phoneMask.init());
  } else {
    phoneMask.init();
  }
})();
```

## Animation and Intersection Observer

### Scroll Animations
```javascript
// Animation Module
(function() {
  'use strict';
  
  const animations = {
    init() {
      this.setupIntersectionObserver();
    },
    
    setupIntersectionObserver() {
      const animatedElements = document.querySelectorAll('[data-animate]');
      
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.animateElement(entry.target);
              observer.unobserve(entry.target);
            }
          });
        }, {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
        });
        
        animatedElements.forEach(element => {
          observer.observe(element);
        });
      } else {
        // Fallback for older browsers
        animatedElements.forEach(element => {
          this.animateElement(element);
        });
      }
    },
    
    animateElement(element) {
      const animationType = element.dataset.animate || 'fadeInUp';
      element.classList.add('animate', `animate--${animationType}`);
    }
  };
  
  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => animations.init());
  } else {
    animations.init();
  }
})();
```

## Form Submission and AJAX

### AJAX Form Handling
```javascript
// Form Submission Module
(function() {
  'use strict';
  
  const formSubmission = {
    init() {
      this.bindFormEvents();
    },
    
    bindFormEvents() {
      const forms = document.querySelectorAll('form[data-ajax]');
      forms.forEach(form => {
        form.addEventListener('submit', this.handleSubmit.bind(this));
      });
    },
    
    async handleSubmit(event) {
      event.preventDefault();
      
      const form = event.target;
      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      
      // Show loading state
      submitButton.textContent = 'Sending...';
      submitButton.disabled = true;
      
      try {
        const formData = new FormData(form);
        const response = await this.submitForm(form.action, formData);
        
        if (response.success) {
          this.showSuccess(form);
        } else {
          this.showError(form, response.message || 'An error occurred');
        }
      } catch (error) {
        this.showError(form, 'Network error. Please try again.');
      } finally {
        // Reset button
        submitButton.textContent = originalText;
        submitButton.disabled = false;
      }
    },
    
    async submitForm(url, formData) {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    },
    
    showSuccess(form) {
      const successMessage = form.querySelector('.form-success') || this.createMessageElement('success');
      successMessage.textContent = 'Thank you! Your message has been sent successfully.';
      successMessage.style.display = 'block';
      
      // Reset form
      form.reset();
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        successMessage.style.display = 'none';
      }, 5000);
    },
    
    showError(form, message) {
      const errorMessage = form.querySelector('.form-error') || this.createMessageElement('error');
      errorMessage.textContent = message;
      errorMessage.style.display = 'block';
      
      // Hide error message after 5 seconds
      setTimeout(() => {
        errorMessage.style.display = 'none';
      }, 5000);
    },
    
    createMessageElement(type) {
      const element = document.createElement('div');
      element.className = `form-${type}`;
      element.setAttribute('role', 'alert');
      element.style.display = 'none';
      return element;
    }
  };
  
  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => formSubmission.init());
  } else {
    formSubmission.init();
  }
})();
```

## Accessibility Features

### Keyboard Navigation
```javascript
// Accessibility Module
(function() {
  'use strict';
  
  const accessibility = {
    init() {
      this.setupKeyboardNavigation();
      this.setupAriaLiveRegions();
    },
    
    setupKeyboardNavigation() {
      // Handle Enter and Space on buttons
      document.addEventListener('keydown', (event) => {
        if (event.target.matches('button, [role="button"]')) {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.target.click();
          }
        }
      });
      
      // Handle arrow keys for custom components
      document.addEventListener('keydown', (event) => {
        if (event.target.matches('[data-keyboard-navigation]')) {
          this.handleArrowKeys(event);
        }
      });
    },
    
    handleArrowKeys(event) {
      const component = event.target.closest('[data-keyboard-navigation]');
      const items = component.querySelectorAll('[data-keyboard-item]');
      const currentIndex = Array.from(items).indexOf(event.target);
      
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          const nextIndex = (currentIndex + 1) % items.length;
          items[nextIndex].focus();
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
          items[prevIndex].focus();
          break;
      }
    },
    
    setupAriaLiveRegions() {
      // Create live region for dynamic content
      if (!document.getElementById('aria-live-region')) {
        const liveRegion = document.createElement('div');
        liveRegion.id = 'aria-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-10000px';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.overflow = 'hidden';
        document.body.appendChild(liveRegion);
      }
    },
    
    announceToScreenReader(message) {
      const liveRegion = document.getElementById('aria-live-region');
      if (liveRegion) {
        liveRegion.textContent = message;
      }
    }
  };
  
  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => accessibility.init());
  } else {
    accessibility.init();
  }
})();
```

## Performance Optimization

### Code Optimization
- Minimize DOM queries by caching elements
- Use event delegation for dynamic content
- Implement debouncing for scroll/resize events
- Use `requestAnimationFrame` for smooth animations
- Minimize JavaScript for production builds

### Performance Examples
```javascript
// Debounced Scroll Handler
(function() {
  'use strict';
  
  const scrollHandler = {
    init() {
      this.setupScrollHandler();
    },
    
    setupScrollHandler() {
      let ticking = false;
      
      const handleScroll = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            this.onScroll();
            ticking = false;
          });
          ticking = true;
        }
      };
      
      window.addEventListener('scroll', handleScroll, { passive: true });
    },
    
    onScroll() {
      // Scroll-based functionality
      const scrollY = window.scrollY;
      const header = document.querySelector('.header');
      
      if (scrollY > 100) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
    }
  };
  
  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => scrollHandler.init());
  } else {
    scrollHandler.init();
  }
})();
```

## JavaScript Validation Checklist

### Code Quality
- [ ] Single JavaScript file structure
- [ ] IIFE pattern for module isolation
- [ ] Modern ES6+ syntax
- [ ] Proper event handling with addEventListener
- [ ] Accessibility features (keyboard navigation, ARIA)
- [ ] Form validation and phone masking
- [ ] Graceful degradation
- [ ] Error handling and user feedback
- [ ] Performance optimization
- [ ] Clean, maintainable code structure

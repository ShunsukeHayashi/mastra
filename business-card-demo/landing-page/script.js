document.addEventListener('DOMContentLoaded', function() {
  // Add fade-in effect to elements with fade-in class
  const fadeElements = document.querySelectorAll('.fade-in');
  fadeElements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.animationDelay = `${index * 0.1}s`;
    setTimeout(() => {
      el.style.opacity = '1';
    }, 100);
  });
  
  const form = document.getElementById('lead-form');
  const formSuccess = document.getElementById('form-success');
  
  if (form) {
    // Enhance form field interactions
    const formFields = form.querySelectorAll('input, textarea');
    formFields.forEach(field => {
      field.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
      });
      field.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
      });
    });
    
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form data
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const company = document.getElementById('company').value;
      const message = document.getElementById('message').value;
      
      // Validate form
      if (!name || !email || !message) {
        alert('必須項目を入力してください');
        return;
      }
      
      // Send data to server
      fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, company, message }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Show success message
          form.reset();
          formSuccess.classList.remove('hidden');
          formSuccess.classList.add('fade-in');
          
          // Hide success message after 5 seconds
          setTimeout(() => {
            formSuccess.classList.add('fade-out');
            setTimeout(() => {
              formSuccess.classList.add('hidden');
              formSuccess.classList.remove('fade-out');
            }, 500);
          }, 5000);
        } else {
          alert(data.error || 'エラーが発生しました。もう一度お試しください。');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('エラーが発生しました。もう一度お試しください。');
      });
    });
  }
});

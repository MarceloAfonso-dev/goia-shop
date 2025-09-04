// Abrir popup
document.querySelectorAll('.popup-trigger').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      const title = this.getAttribute('data-title');
      const desc = this.getAttribute('data-description');
  
      if (!title || !desc) {
        console.error("Erro: falta data-title ou data-description");
        return;
      }
  
      document.getElementById('popup-title').textContent = title;
      document.getElementById('popup-description').textContent = desc;
      document.getElementById('popup').classList.remove('hidden');
    });
  });
  
  // Fechar popup
  document.querySelector('.popup-close').addEventListener('click', function() {
    document.getElementById('popup').classList.add('hidden');
  });
  
  // Fechar ao clicar fora
  window.addEventListener('click', function(e) {
    if (e.target === document.getElementById('popup')) {
      document.getElementById('popup').classList.add('hidden');
    }
  });
  
  // FAQ Toggle
  document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', function() {
      const answer = this.querySelector('.faq-answer');
      const plus = this.querySelector('.plus');
      answer.classList.toggle('hidden');
      plus.textContent = answer.classList.contains('hidden') ? '+' : '-';
    });
  });
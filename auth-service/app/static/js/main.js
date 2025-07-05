document.addEventListener('DOMContentLoaded', function () {
  const messages = document.querySelectorAll('.error, .ok');
  messages.forEach(function (msg) {
    setTimeout(function () {
      msg.classList.add('fade');
    }, 4000);
  });
});
const backdrop = document.querySelector('.backdrop');
const sideDrawer = document.querySelector('.mobile-nav');
const menuToggle = document.querySelector('#side-menu-toggle');

if (backdrop && sideDrawer && menuToggle) {
  function backdropClickHandler() {
    backdrop.style.display = 'none';
    sideDrawer.classList.remove('open');
  }

  function menuToggleClickHandler() {
    backdrop.style.display = 'block';
    sideDrawer.classList.add('open');
  }

  backdrop.addEventListener('click', backdropClickHandler);
  menuToggle.addEventListener('click', menuToggleClickHandler);
}

const toastCloseButtons = document.querySelectorAll('.toast__close');
toastCloseButtons.forEach(button => {
  button.addEventListener('click', () => {
    const toast = button.closest('.toast');
    if (toast) {
      toast.classList.add('toast--hide');
      setTimeout(() => toast.remove(), 250);
    }
  });
});

const toast = document.querySelector('.toast');
if (toast) {
  setTimeout(() => {
    toast.classList.add('toast--hide');
    setTimeout(() => toast.remove(), 250);
  }, 4500);
}

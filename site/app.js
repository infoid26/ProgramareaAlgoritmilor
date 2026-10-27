const roadmap = document.querySelector('#roadmap');
function navigate() {
let id = ['acasa', 'curs-python', 'lectie-python', 'traseu', 'practica', 'capitol'].includes(location.hash.slice(1).split('/')[0]) ? location.hash.slice(1).split('/')[0] : 'acasa';
if (id === 'traseu' || id === 'curs-python') { id = 'acasa'; }
const navId = id === 'practica' ? (location.hash.split('/')[1]?.startsWith('intro-') ? 'curs-python' : 'traseu') : id === 'lectie-python' ? 'curs-python' : id === 'capitol' ? 'traseu' : id;
document.querySelectorAll('.view').forEach(view => { view.hidden = view.id !== id; });
document.querySelectorAll('nav a').forEach(link => { link.classList.toggle('active', link.hash === '#' + navId); if (link.hash === '#' + navId) { link.setAttribute('aria-current', 'page'); } else { link.removeAttribute('aria-current'); } });
document.title = `${{ acasa: 'Acasă', capitol: 'Recapitulare', traseu: 'Traseul de învățare', practica: 'Rezolvă exercițiul', 'curs-python': 'Curs Python', 'lectie-python': 'Lecție Python' }[id]} · PA`;
window.scrollTo(0, 0);
}
window.addEventListener('hashchange', navigate);
navigate();

document.querySelector('.skip').addEventListener('click', event => { event.preventDefault(); const main = document.querySelector('#continut'); main.tabIndex = -1; main.focus(); });

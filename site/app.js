const stages = window.PA_CONTENT.chapters;
const roadmap = document.querySelector('#roadmap');
document.querySelector('#curriculum-summary').textContent = `${window.PA_CONTENT.exercises.length} exerciții · ${window.PA_CONTENT.chapters.length} capitole · în ritmul tău`;
stages.forEach((stage, index) => {
const card = document.createElement('article');
card.className = 'road-card';
card.innerHTML = `<span class="road-number">${String(index + 1).padStart(2, '0')}</span><div><h2>${stage.title.slice(5)}</h2><p>${stage.lesson[0]}</p><small>${window.PA_CONTENT.exercises.filter(item => item.chapter === stage.id).length} exerciții · recapitulare · exemple</small></div><a class="text-link" href="#capitol/${stage.id}">Deschide →</a>`;
roadmap.append(card);
});
function navigate() {
let id = ['acasa', 'curs-python', 'lectie-python', 'traseu', 'practica', 'exercitii', 'capitol'].includes(location.hash.slice(1).split('/')[0]) ? location.hash.slice(1).split('/')[0] : 'acasa';
if (id === 'traseu' || id === 'curs-python') { id = 'acasa'; }
const navId = id === 'practica' ? (location.hash.split('/')[1]?.startsWith('intro-') ? 'curs-python' : 'exercitii') : id === 'lectie-python' ? 'curs-python' : id === 'capitol' ? 'traseu' : id;
document.querySelectorAll('.view').forEach(view => { view.hidden = view.id !== id; });
document.querySelectorAll('nav a').forEach(link => { link.classList.toggle('active', link.hash === '#' + navId); if (link.hash === '#' + navId) { link.setAttribute('aria-current', 'page'); } else { link.removeAttribute('aria-current'); } });
document.title = `${{ acasa: 'Acasă', exercitii: 'Exerciții', capitol: 'Recapitulare', traseu: 'Traseul de învățare', practica: 'Rezolvă exercițiul', 'curs-python': 'Curs Python', 'lectie-python': 'Lecție Python' }[id]} · PA`;
window.scrollTo(0, 0);
}
window.addEventListener('hashchange', navigate);
navigate();

document.querySelector('.skip').addEventListener('click', event => { event.preventDefault(); const main = document.querySelector('#continut'); main.tabIndex = -1; main.focus(); });

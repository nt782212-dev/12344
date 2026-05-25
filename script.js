"use strict";


document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar scroll effect
    const nav = document.getElementById('mainNav');
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 50);
    });

    // 2. Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
            }
            const navCollapse = document.getElementById('navbarContent');
            if (navCollapse.classList.contains('show')) {
                bootstrap.Collapse.getInstance(navCollapse).hide();
            }
        });
    });

    // 3. Fade-in animation on scroll
    const faders = document.querySelectorAll('.fade-in');
    const appearOptions = { threshold: 0.12, rootMargin: "0px 0px -50px 0px" };
    const appearOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, appearOptions);
    faders.forEach(fader => appearOnScroll.observe(fader));

    // 4. Counter animation
    const statsSection = document.getElementById('stats');
    let counted = false;
    const statsObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !counted) {
            counted = true;
            document.querySelectorAll('.stat-number').forEach(counter => {
                const target = +counter.getAttribute('data-target');
                const duration = 2000;
                const step = Math.ceil(target / (duration / 16));
                let current = 0;
                const update = () => {
                    current += step;
                    if (current >= target) counter.textContent = target.toLocaleString('ru-RU');
                    else { counter.textContent = current.toLocaleString('ru-RU'); requestAnimationFrame(update); }
                };
                update();
            });
        }
    }, { threshold: 0.5 });
    if (statsSection) statsObserver.observe(statsSection);

    // ===== 5. Catalog Price Toggle Logic =====
    document.querySelectorAll('.btn-price-toggle').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();

            const card = this.closest('.product-card');
            const priceBlock = card.querySelector('.price-hidden');
            const isExpanded = card.classList.contains('expanded');

            if (!isExpanded) {
                // Раскрываем
                card.classList.add('expanded');
                // Динамически задаём высоту под контент
                priceBlock.style.maxHeight = priceBlock.scrollHeight + 'px';

                this.innerHTML = '<i class="fa-solid fa-chevron-up me-2"></i> Скрыть цену';
                this.classList.remove('btn-outline-primary');
                this.classList.add('btn-outline-success');
            } else {
                // Сворачиваем
                priceBlock.style.maxHeight = '0';
                card.classList.remove('expanded');

                this.innerHTML = 'Узнать оптовую цену <i class="fa-solid fa-chevron-down ms-1"></i>';
                this.classList.remove('btn-outline-success');
                this.classList.add('btn-outline-primary');
            }
        });
    });

    // 6. Form submission simulation (исправлено: одно сообщение, единый обработчик)
    const handleForm = (formId, successMsg) => {
        const form = document.getElementById(formId);
        if (!form) return;

        // Удаляем старый обработчик, если он уже был, чтобы не дублировать
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);

        // Вешаем обработчик на "свежую" форму
        newForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Блокируем повторную отправку, пока текущая не завершена
            if (newForm.hasAttribute('data-submitting')) return;
            newForm.setAttribute('data-submitting', 'true');

            const btn = newForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;

            btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Отправка...';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = '<i class="fa-solid fa-check me-2"></i> Отправлено!';
                btn.classList.remove('btn-cta');
                btn.classList.add('btn-success');

                newForm.reset();

                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    btn.classList.remove('btn-success');
                    btn.classList.add('btn-cta');

                    // Снимаем блокировку
                    newForm.removeAttribute('data-submitting');

                    // ✅ alert выводится ТОЛЬКО один раз
                    alert(successMsg);
                }, 1500);
            }, 1200);
        });
    };

    // Инициализация форм
    handleForm('orderForm', 'Спасибо! Ваша заявка на сотрудничество принята.');
    handleForm('feedbackForm', 'Сообщение отправлено. Мы скоро вам ответим :)');

    // 7. АДАПТИВНЫЙ ПОИСК ПО РАЗДЕЛАМ
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchFeedback = document.getElementById('searchFeedback');

    // Карта соответствия: Раздел -> Массив ключевых слов
    const sectionKeywords = {
        '#hero': ['главная', 'home', 'начало', 'старт', 'кубаночка'],
        '#about': ['о нас', 'about', 'производство', 'история', 'фирма', 'компания', '15 лет', 'завод'],
        '#catalog': ['каталог', 'продукция', 'масло', 'нерафинированное', 'рафинированное', 'оливковое', 'цены', 'палета', 'цена', 'купить', 'заказать', 'товар'],
        '#partners': ['партнёры', 'партнеры', 'сертификаты', 'partners', 'доверие', 'сотрудничество', 'сети', 'дистрибьюторы', 'x5', 'озон', 'магнит'],
        '#reviews': ['отзывы', 'review', 'feedback', 'вопрос', 'мнение', 'задать', 'обратная связь'],
        '#contact': ['контакты', 'contact', 'заявка', 'форма', 'связь', 'телефон', 'адрес', 'почта', 'email']
    };

    const performSearch = () => {
        const query = searchInput.value.trim().toLowerCase();
        if (!query) {
            searchFeedback.textContent = 'Введите слово для поиска...';
            return;
        }

        let foundSection = null;
        for (const [section, keywords] of Object.entries(sectionKeywords)) {
            const isMatch = keywords.some(k => k.includes(query) || query.includes(k));
            if (isMatch) { foundSection = section; break; }
        }

        if (foundSection) {
            const target = document.querySelector(foundSection);
            if (target) {
                searchFeedback.textContent = '';
                searchInput.value = '';
                const modal = bootstrap.Modal.getInstance(document.getElementById('searchModal'));
                modal.hide();
                setTimeout(() => {
                    window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
                }, 350);
            }
        } else {
            searchFeedback.innerHTML = `<span class="text-danger">Раздел не найден. Попробуйте: Каталог, Отзывы, Контакты...</span>`;
        }
    };

    if (searchBtn) searchBtn.addEventListener('click', performSearch);
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(); });
        searchInput.addEventListener('input', () => { searchFeedback.textContent = ''; });
    }
    const searchModalEl = document.getElementById('searchModal');
    searchModalEl.addEventListener('hidden.bs.modal', () => {
        searchInput.value = '';
        searchFeedback.textContent = '';
    });
});
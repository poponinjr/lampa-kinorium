(function () {
    'use strict';

    let token = '';

    function init() {
        // Загружаем токен из настроек
        token = Lampa.Storage.get('kinorium_token') || '';

        // Добавляем пункт в настройки Лампы
        Lampa.Settings.add({
            title: 'Kinorium Scrobble',
            name: 'kinorium_token',
            value: token,
            description: 'API-токен Кинориума (получи в https://ru.kinorium.com/insider/api/)',
            type: 'input',
            onChange: function (value) {
                token = value.trim();
                Lampa.Storage.set('kinorium_token', token);
                Lampa.Noty.show('Токен Кинориума сохранён');
            }
        });

        // Слушаем события плеера
        Lampa.Listener.on('player', 'start', onStart);
        Lampa.Listener.on('player', 'progress', onProgress);  // каждые ~10 сек
        Lampa.Listener.on('player', 'end', onEnd);
    }

    function getKinoriumData(item) {
        return {
            kinopoisk_id: item.kinopoisk_id || item.id,
            title: item.title || item.name,
            type: item.type === 'tv' ? 'tv' : 'movie',
            year: item.year,
            episode: item.episode ? item.episode.number : null,
            season: item.season ? item.season.number : null
        };
    }

    function sendToKinorium(data, action) {
        if (!token) return;

        const url = 'https://ru.kinorium.com/api/user/history';  // основной endpoint (может измениться)

        fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Lampa-Kinorum-Plugin/1.0'
            },
            body: JSON.stringify({
                ...data,
                action: action,           // start / progress / end
                progress: data.progress || 0
            })
        })
        .then(r => r.json())
        .then(res => {
            console.log(`[Kinorium] ${action} OK:`, res);
        })
        .catch(err => {
            console.error('[Kinorium] Ошибка:', err);
        });
    }

    function onStart(data) {
        const item = data.object || data.card;
        if (!item) return;

        const kinData = getKinoriumData(item);
        sendToKinorium(kinData, 'start');
    }

    function onProgress(data) {
        const item = data.object || data.card;
        if (!item) return;

        const kinData = getKinoriumData(item);
        kinData.progress = Math.round(data.time * 100 / data.duration);  // % просмотра
        sendToKinorium(kinData, 'progress');
    }

    function onEnd(data) {
        const item = data.object || data.card;
        if (!item) return;

        const kinData = getKinoriumData(item);
        sendToKinorium(kinData, 'end');
    }

    // Регистрируем плагин
    Lampa.Plugin.create({
        name: 'Kinorium Scrobble',
        version: '1.0.0',
        description: 'Автоматическое отслеживание просмотра в Кинориуме',
        onCreate: init
    });
})();

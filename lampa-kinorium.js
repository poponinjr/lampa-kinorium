(function () {
    'use strict';

    if (!window.Lampa) return;

    function openKinorium(item) {
        if (!item || !item.id) return;

        const type = item.type === 'movie' ? 'movie' : 'tv';
        const url = `https://ru.kinorium.com/search/?q=${item.id}&type=${type}&source=tmdb`;

        window.open(url, '_blank');
    }

    Lampa.Listener.follow('full', function (e) {
        if (e.type !== 'complite') return;

        const item = e.data.movie;
        if (!item) return;

        Lampa.Buttons.add({
            title: 'Кинориум',
            onSelect: function () {
                openKinorium(item);
            }
        });
    });

    console.log('Lampa → Kinorium plugin loaded');
})();

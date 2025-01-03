        let currentLanguage = localStorage.getItem('preferredLanguage') || 'sub';
        let currentSeason = 'season1';
        let currentEpisodeButton = null;
        let autoNext = JSON.parse(localStorage.getItem('autoNext')) || false;

        function toggleLanguage(lang) {
            if (episodes[lang] && episodes[lang][currentSeason]) {
            currentLanguage = lang;
            localStorage.setItem('preferredLanguage', lang);
            } else {
            currentLanguage = lang === 'sub' ? 'dub' : 'sub';
            localStorage.setItem('preferredLanguage', currentLanguage);
            }
            updateButtonStyles('toggle-options', currentLanguage);
            loadEpisodes();
        }

        function selectSeason(seasonNumber) {
            currentSeason = 'season' + seasonNumber;
            updateButtonStyles('season-selector', currentSeason);
            loadEpisodes();
        }

        function loadEpisodes() {
            const episodeContainer = document.getElementById('episode-list');
            episodeContainer.innerHTML = '';
            const currentEpisodes = episodes[currentLanguage][currentSeason];

            currentEpisodes.forEach(ep => {
            const button = document.createElement('button');
            button.textContent = ep.title;
            button.dataset.url = ep.url;
            button.onclick = () => changeVideo(ep.url, button);
            episodeContainer.appendChild(button);
            });

            updateNavigationButtons();
        }

        function changeVideo(videoUrl, button) {
            const player = videojs('my-video');
            const savedTime = loadProgress(videoUrl);
            player.src({ type: 'video/mp4', src: videoUrl });
            player.currentTime(savedTime);
            player.play();

            if (currentEpisodeButton) {
            currentEpisodeButton.classList.remove('active');
            }
            button.classList.add('active');
            currentEpisodeButton = button;

            player.off('timeupdate');
            player.off('error');
            player.off('ended');

            player.on('timeupdate', function() {
            saveProgress(videoUrl, player.currentTime());
            });

            player.on('error', function() {
            player.src({ type: 'video/mp4', src: videoUrl });
            player.play();
            });

            player.on('ended', function() {
            if (autoNext) {
                playNextEpisode();
            }
            });

            updateNavigationButtons();
        }

        function playNextEpisode() {
            const currentEpisodes = episodes[currentLanguage][currentSeason];
            const currentIndex = currentEpisodes.findIndex(ep => ep.url === currentEpisodeButton.dataset.url);
            const nextIndex = currentIndex + 1;

            if (nextIndex < currentEpisodes.length) {
            const nextEpisode = currentEpisodes[nextIndex];
            const nextButton = document.querySelector(`button[data-url="${nextEpisode.url}"]`);
            changeVideo(nextEpisode.url, nextButton);
            }
        }

        function playPreviousEpisode() {
            const currentEpisodes = episodes[currentLanguage][currentSeason];
            const currentIndex = currentEpisodes.findIndex(ep => ep.url === currentEpisodeButton.dataset.url);
            const prevIndex = currentIndex - 1;

            if (prevIndex >= 0) {
            const prevEpisode = currentEpisodes[prevIndex];
            const prevButton = document.querySelector(`button[data-url="${prevEpisode.url}"]`);
            changeVideo(prevEpisode.url, prevButton);
            }
        }

        function updateButtonStyles(containerClass, activeId) {
            document.querySelectorAll(`.${containerClass} button`).forEach(button => {
            button.classList.remove('active');
            });
            document.getElementById(activeId + 'Button').classList.add('active');
        }

        function saveProgress(videoUrl, currentTime) {
            let progressData = JSON.parse(localStorage.getItem('progressData')) || {};
            if (!progressData[currentLanguage]) {
            progressData[currentLanguage] = {};
            }
            if (!progressData[currentLanguage][currentSeason]) {
            progressData[currentLanguage][currentSeason] = {};
            }
            progressData[currentLanguage][currentSeason][videoUrl] = currentTime;
            localStorage.setItem('progressData', JSON.stringify(progressData));
        }

        function loadProgress(videoUrl) {
            let progressData = JSON.parse(localStorage.getItem('progressData')) || {};
            return progressData[currentLanguage]?.[currentSeason]?.[videoUrl] || 0;
        }

        function toggleAutoNext() {
            autoNext = !autoNext;
            localStorage.setItem('autoNext', JSON.stringify(autoNext));
            document.getElementById('autonextButton').classList.toggle('active', autoNext);
        }

        function updateNavigationButtons() {
            const currentEpisodes = episodes[currentLanguage][currentSeason];
            const currentIndex = currentEpisodes.findIndex(ep => ep.url === currentEpisodeButton?.dataset.url);

            document.getElementById('previousButton').disabled = currentIndex <= 0;
            document.getElementById('nextButton').disabled = currentIndex >= currentEpisodes.length - 1;
        }

        // Load episodes initially
        toggleLanguage(currentLanguage);
        document.getElementById('autonextButton').classList.toggle('active', autoNext);
// Aplicativo de Clima Moderno
// Consumindo a API Open-Meteo

class WeatherApp {
    constructor() {
        // Configurações iniciais
        this.apiBaseUrl = 'https://api.open-meteo.com/v1';
        this.geocodingApiUrl = 'https://geocoding-api.open-meteo.com/v1';
        
        // Elementos DOM
        this.elements = {
            loading: document.getElementById('loading'),
            mainContent: document.getElementById('main-content'),
            weatherBackground: document.getElementById('weather-background'),
            cityInput: document.getElementById('city-input'),
            searchBtn: document.getElementById('search-btn'),
            currentLocationBtn: document.getElementById('current-location-btn'),
            coordinatesBtn: document.getElementById('coordinates-btn'),
            cityName: document.getElementById('city-name'),
            currentDate: document.getElementById('current-date'),
            currentTemp: document.getElementById('current-temp'),
            weatherDesc: document.getElementById('weather-desc'),
            feelsLikeTemp: document.getElementById('feels-like-temp'),
            weatherIcon: document.getElementById('weather-icon'),
            windSpeed: document.getElementById('wind-speed'),
            humidity: document.getElementById('humidity'),
            rainProb: document.getElementById('rain-prob'),
            sunriseSunset: document.getElementById('sunrise-sunset'),
            hourlyScroll: document.getElementById('hourly-scroll'),
            weeklyForecast: document.getElementById('weekly-forecast'),
            themeSwitch: document.getElementById('theme-switch'),
            coordinatesModal: document.getElementById('coordinates-modal'),
            latitudeInput: document.getElementById('latitude-input'),
            longitudeInput: document.getElementById('longitude-input'),
            cancelCoordinates: document.getElementById('cancel-coordinates'),
            confirmCoordinates: document.getElementById('confirm-coordinates'),
            lastUpdate: document.getElementById('last-update'),
            appName: document.getElementById('app-name'),
            scrollLeft: document.getElementById('scroll-left'),
            scrollRight: document.getElementById('scroll-right'),
            notification: document.getElementById('notification')
        };
        
        // Estado da aplicação
        this.state = {
            currentLocation: null,
            currentWeather: null,
            hourlyForecast: null,
            dailyForecast: null,
            isDarkMode: false,
            lastUpdateTime: null,
            favoriteCity: null
        };
        
        // Mapeamento de códigos de clima para ícones
        this.weatherIcons = {
            0: { icon: 'fa-sun', label: 'Céu limpo' },
            1: { icon: 'fa-cloud-sun', label: 'Pouco nublado' },
            2: { icon: 'fa-cloud', label: 'Parcialmente nublado' },
            3: { icon: 'fa-cloud', label: 'Nublado' },
            45: { icon: 'fa-smog', label: 'Nevoeiro' },
            48: { icon: 'fa-smog', label: 'Nevoeiro com geada' },
            51: { icon: 'fa-cloud-rain', label: 'Chuvisco leve' },
            53: { icon: 'fa-cloud-rain', label: 'Chuvisco moderado' },
            55: { icon: 'fa-cloud-rain', label: 'Chuvisco intenso' },
            56: { icon: 'fa-snowflake', label: 'Chuvisco congelante leve' },
            57: { icon: 'fa-snowflake', label: 'Chuvisco congelante intenso' },
            61: { icon: 'fa-cloud-rain', label: 'Chuva leve' },
            63: { icon: 'fa-cloud-rain', label: 'Chuva moderada' },
            65: { icon: 'fa-cloud-showers-heavy', label: 'Chuva intensa' },
            66: { icon: 'fa-snowflake', label: 'Chuva congelante leve' },
            67: { icon: 'fa-snowflake', label: 'Chuva congelante intensa' },
            71: { icon: 'fa-snowflake', label: 'Queda de neve leve' },
            73: { icon: 'fa-snowflake', label: 'Queda de neve moderada' },
            75: { icon: 'fa-snowflake', label: 'Queda de neve intensa' },
            77: { icon: 'fa-snowflake', label: 'Grãos de neve' },
            80: { icon: 'fa-cloud-showers-heavy', label: 'Pancadas de chuva leves' },
            81: { icon: 'fa-cloud-showers-heavy', label: 'Pancadas de chuva moderadas' },
            82: { icon: 'fa-cloud-showers-heavy', label: 'Pancadas de chuva fortes' },
            85: { icon: 'fa-snowflake', label: 'Pancadas de neve leves' },
            86: { icon: 'fa-snowflake', label: 'Pancadas de neve fortes' },
            95: { icon: 'fa-bolt', label: 'Tempestade leve' },
            96: { icon: 'fa-bolt', label: 'Tempestade com granizo leve' },
            99: { icon: 'fa-bolt', label: 'Tempestade com granizo forte' }
        };
        
        // Mapeamento de condições climáticas para backgrounds
        this.weatherBackgrounds = {
            sunny: 'sunny-bg',
            rainy: 'rainy-bg',
            snowy: 'snowy-bg',
            stormy: 'stormy-bg',
            cloudy: 'cloudy-bg'
        };
        
        // Inicialização
        this.init();
    }
    
    // Inicializa a aplicação
    init() {
        this.setupEventListeners();
        this.loadPreferences();
        this.setupBackgroundAnimations();
        this.detectLanguage();
        
        // Tenta carregar a localização salva ou usar geolocalização
        if (this.state.favoriteCity) {
            this.searchCity(this.state.favoriteCity);
        } else {
            this.getUserLocation();
        }
        
        // Atualiza título da página
        this.updatePageTitle();
    }
    
    // Configura listeners de eventos
    setupEventListeners() {
        // Busca por cidade
        this.elements.searchBtn.addEventListener('click', () => {
            const city = this.elements.cityInput.value.trim();
            if (city) {
                this.searchCity(city);
            }
        });
        
        this.elements.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const city = this.elements.cityInput.value.trim();
                if (city) {
                    this.searchCity(city);
                }
            }
        });
        
        // Localização atual
        this.elements.currentLocationBtn.addEventListener('click', () => {
            this.getUserLocation();
        });
        
        // Busca por coordenadas
        this.elements.coordinatesBtn.addEventListener('click', () => {
            this.showCoordinatesModal();
        });
        
        this.elements.cancelCoordinates.addEventListener('click', () => {
            this.hideCoordinatesModal();
        });
        
        this.elements.confirmCoordinates.addEventListener('click', () => {
            this.searchByCoordinates();
        });
        
        // Alternador de tema
        this.elements.themeSwitch.addEventListener('change', () => {
            this.toggleDarkMode();
        });
        
        // Botões de rolagem horizontal
        this.elements.scrollLeft.addEventListener('click', () => {
            this.scrollHourlyForecast('left');
        });
        
        this.elements.scrollRight.addEventListener('click', () => {
            this.scrollHourlyForecast('right');
        });
        
        // Fechar modal ao clicar fora
        window.addEventListener('click', (e) => {
            if (e.target === this.elements.coordinatesModal) {
                this.hideCoordinatesModal();
            }
        });
    }
    
    // Configura animações de fundo
    setupBackgroundAnimations() {
        // Criar gotas de chuva
        this.createRainDrops();
        
        // Criar flocos de neve
        this.createSnowflakes();
    }
    
    createRainDrops() {
        const bg = this.elements.weatherBackground;
        const rainContainer = document.createElement('div');
        rainContainer.className = 'rain-drops';
        
        for (let i = 0; i < 60; i++) {
            const drop = document.createElement('div');
            drop.className = 'rain-drop';
            drop.style.left = `${Math.random() * 100}%`;
            drop.style.animationDelay = `${Math.random() * 2}s`;
            drop.style.opacity = `${0.3 + Math.random() * 0.5}`;
            rainContainer.appendChild(drop);
        }
        
        bg.appendChild(rainContainer);
    }
    
    createSnowflakes() {
        const bg = this.elements.weatherBackground;
        const snowContainer = document.createElement('div');
        snowContainer.className = 'snowflakes';
        
        for (let i = 0; i < 100; i++) {
            const flake = document.createElement('div');
            flake.className = 'snowflake';
            flake.style.left = `${Math.random() * 100}%`;
            flake.style.width = `${5 + Math.random() * 10}px`;
            flake.style.height = flake.style.width;
            flake.style.animationDelay = `${Math.random() * 10}s`;
            flake.style.animationDuration = `${5 + Math.random() * 10}s`;
            snowContainer.appendChild(flake);
        }
        
        bg.appendChild(snowContainer);
    }
    
    // Carrega preferências do usuário
    loadPreferences() {
        // Carregar modo escuro
        const savedDarkMode = localStorage.getItem('weatherDarkMode');
        this.state.isDarkMode = savedDarkMode === 'true';
        
        if (this.state.isDarkMode) {
            document.body.classList.add('dark-mode');
            this.elements.themeSwitch.checked = true;
        }
        
        // Carregar cidade favorita
        this.state.favoriteCity = localStorage.getItem('favoriteCity');
        
        // Configurar idioma (PT-BR por padrão)
        this.setLanguage('pt-BR');
    }
    
    // Detecta idioma do navegador
    detectLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('pt')) {
            this.setLanguage('pt-BR');
        } else {
            this.setLanguage('en');
        }
    }
    
    // Define o idioma da aplicação
    setLanguage(lang) {
        // Implementação básica de internacionalização
        const translations = {
            'pt-BR': {
                appName: 'Clima',
                searchPlaceholder: 'Buscar cidade...',
                currentLocation: 'Localização Atual',
                coordinates: 'Coordenadas',
                feelsLike: 'Sensação',
                wind: 'Vento',
                humidity: 'Umidade',
                rain: 'Chuva',
                sun: 'Sol',
                hourlyForecast: 'Previsão por Hora',
                weeklyForecast: 'Previsão para 7 Dias',
                searchByCoords: 'Buscar por Coordenadas',
                latitude: 'Latitude',
                longitude: 'Longitude',
                cancel: 'Cancelar',
                search: 'Buscar',
                lastUpdate: 'Última atualização',
                loading: 'Buscando dados do clima...',
                locationError: 'Não foi possível obter sua localização',
                cityError: 'Cidade não encontrada',
                apiError: 'Erro ao buscar dados do clima'
            },
            'en': {
                appName: 'Weather',
                searchPlaceholder: 'Search city...',
                currentLocation: 'Current Location',
                coordinates: 'Coordinates',
                feelsLike: 'Feels like',
                wind: 'Wind',
                humidity: 'Humidity',
                rain: 'Rain',
                sun: 'Sun',
                hourlyForecast: 'Hourly Forecast',
                weeklyForecast: '7-Day Forecast',
                searchByCoords: 'Search by Coordinates',
                latitude: 'Latitude',
                longitude: 'Longitude',
                cancel: 'Cancel',
                search: 'Search',
                lastUpdate: 'Last update',
                loading: 'Fetching weather data...',
                locationError: 'Unable to get your location',
                cityError: 'City not found',
                apiError: 'Error fetching weather data'
            }
        };
        
        this.language = lang;
        this.translations = translations[lang] || translations['pt-BR'];
        
        // Atualizar elementos com textos traduzidos
        this.updateUITexts();
    }
    
    // Atualiza textos da interface
    updateUITexts() {
        if (this.elements.appName) {
            this.elements.appName.textContent = this.translations.appName;
        }
        
        if (this.elements.cityInput) {
            this.elements.cityInput.placeholder = this.translations.searchPlaceholder;
        }
    }
    
    // Alterna entre modo claro e escuro
    toggleDarkMode() {
        this.state.isDarkMode = !this.state.isDarkMode;
        document.body.classList.toggle('dark-mode', this.state.isDarkMode);
        localStorage.setItem('weatherDarkMode', this.state.isDarkMode);
    }
    
    // Mostra modal de coordenadas
    showCoordinatesModal() {
        this.elements.coordinatesModal.style.display = 'flex';
    }
    
    // Esconde modal de coordenadas
    hideCoordinatesModal() {
        this.elements.coordinatesModal.style.display = 'none';
        this.elements.latitudeInput.value = '';
        this.elements.longitudeInput.value = '';
    }
    
    // Busca clima por coordenadas
    searchByCoordinates() {
        const lat = parseFloat(this.elements.latitudeInput.value);
        const lon = parseFloat(this.elements.longitudeInput.value);
        
        if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            this.showNotification('Por favor, insira coordenadas válidas', 'error');
            return;
        }
        
        this.hideCoordinatesModal();
        this.fetchWeatherData(lat, lon);
    }
    
    // Obtém localização do usuário
    getUserLocation() {
        this.showLoading();
        
        if (!navigator.geolocation) {
            this.showNotification('Geolocalização não suportada pelo navegador', 'error');
            this.fetchWeatherData(-23.5505, -46.6333); // São Paulo como fallback
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                this.fetchWeatherData(lat, lon);
                this.reverseGeocode(lat, lon);
            },
            (error) => {
                console.error('Erro na geolocalização:', error);
                this.showNotification(this.translations.locationError, 'error');
                this.fetchWeatherData(-23.5505, -46.6333); // São Paulo como fallback
            }
        );
    }
    
    // Busca cidade pelo nome
    async searchCity(city) {
        this.showLoading();
        
        try {
            const response = await fetch(
                `${this.geocodingApiUrl}/search?name=${encodeURIComponent(city)}&count=1&language=${this.language}`
            );
            
            if (!response.ok) {
                throw new Error('Erro na busca da cidade');
            }
            
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                const location = data.results[0];
                this.fetchWeatherData(location.latitude, location.longitude);
                this.updateLocationInfo(location.name, location.country);
                
                // Salvar como favorita
                this.saveFavoriteCity(city);
            } else {
                this.showNotification(this.translations.cityError, 'error');
                this.hideLoading();
            }
        } catch (error) {
            console.error('Erro ao buscar cidade:', error);
            this.showNotification(this.translations.cityError, 'error');
            this.hideLoading();
        }
    }
    
    // Faz geocodificação reversa (coordenadas para nome)
    async reverseGeocode(lat, lon) {
        try {
            const response = await fetch(
                `${this.geocodingApiUrl}/reverse?latitude=${lat}&longitude=${lon}&language=${this.language}`
            );
            
            if (response.ok) {
                const data = await response.json();
                if (data.results && data.results.length > 0) {
                    const location = data.results[0];
                    this.updateLocationInfo(location.name, location.country);
                }
            }
        } catch (error) {
            console.error('Erro na geocodificação reversa:', error);
        }
    }
    
    // Busca dados do clima
    async fetchWeatherData(lat, lon) {
        this.showLoading();
        
        try {
            // Parâmetros da API
            const params = new URLSearchParams({
                latitude: lat,
                longitude: lon,
                current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,rain,showers',
                hourly: 'temperature_2m,weather_code,rain,showers',
                daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,rain_sum',
                timezone: 'auto',
                forecast_days: 8
            });
            
            const response = await fetch(`${this.apiBaseUrl}/forecast?${params}`);
            
            if (!response.ok) {
                throw new Error('Erro na API de clima');
            }
            
            const data = await response.json();
            
            // Atualizar estado
            this.state.currentLocation = { lat, lon };
            this.state.currentWeather = data.current;
            this.state.hourlyForecast = data.hourly;
            this.state.dailyForecast = data.daily;
            this.state.lastUpdateTime = new Date();
            
            // Atualizar interface
            this.updateCurrentWeather();
            this.updateHourlyForecast();
            this.updateWeeklyForecast();
            this.updateBackground();
            this.updatePageTitle();
            
            // Esconder loading
            this.hideLoading();
            
            // Mostrar notificação de sucesso
            this.showNotification('Dados do clima atualizados!', 'success');
            
        } catch (error) {
            console.error('Erro ao buscar dados do clima:', error);
            this.showNotification(this.translations.apiError, 'error');
            this.hideLoading();
        }
    }
    
    // Atualiza informações do clima atual
    updateCurrentWeather() {
        const current = this.state.currentWeather;
        const weatherCode = current.weather_code;
        const weatherInfo = this.weatherIcons[weatherCode] || this.weatherIcons[0];
        
        // Atualizar temperatura
        this.elements.currentTemp.innerHTML = `${Math.round(current.temperature_2m)}<span>°C</span>`;
        
        // Atualizar descrição
        this.elements.weatherDesc.textContent = weatherInfo.label;
        
        // Atualizar sensação térmica
        this.elements.feelsLikeTemp.textContent = `${Math.round(current.apparent_temperature)}°C`;
        
        // Atualizar ícone
        this.elements.weatherIcon.innerHTML = `<i class="fas ${weatherInfo.icon}"></i>`;
        
        // Atualizar detalhes
        this.elements.windSpeed.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
        this.elements.humidity.textContent = `${Math.round(current.relative_humidity_2m)} %`;
        
        // Calcular probabilidade de chuva
        const rainProb = current.rain || current.showers || 0;
        this.elements.rainProb.textContent = `${Math.round(rainProb)} %`;
        
        // Atualizar data atual
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        this.elements.currentDate.textContent = now.toLocaleDateString(this.language, options);
        
        // Atualizar nascer/pôr do sol (do primeiro dia da previsão)
        if (this.state.dailyForecast) {
            const sunrise = new Date(this.state.dailyForecast.sunrise[0]);
            const sunset = new Date(this.state.dailyForecast.sunset[0]);
            
            const timeOptions = { hour: '2-digit', minute: '2-digit' };
            const sunriseStr = sunrise.toLocaleTimeString(this.language, timeOptions);
            const sunsetStr = sunset.toLocaleTimeString(this.language, timeOptions);
            
            this.elements.sunriseSunset.textContent = `${sunriseStr} / ${sunsetStr}`;
        }
        
        // Atualizar última atualização
        if (this.state.lastUpdateTime) {
            const updateTime = this.state.lastUpdateTime.toLocaleTimeString(this.language, { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            this.elements.lastUpdate.textContent = updateTime;
        }
    }
    
    // Atualiza previsão por hora
    updateHourlyForecast() {
        if (!this.state.hourlyForecast) return;
        
        this.elements.hourlyScroll.innerHTML = '';
        
        // Mostrar próximas 24 horas
        for (let i = 0; i < 24; i++) {
            const time = new Date(this.state.hourlyForecast.time[i]);
            const temp = Math.round(this.state.hourlyForecast.temperature_2m[i]);
            const weatherCode = this.state.hourlyForecast.weather_code[i];
            const weatherInfo = this.weatherIcons[weatherCode] || this.weatherIcons[0];
            
            // Formatar hora
            const hourStr = time.toLocaleTimeString(this.language, { hour: '2-digit' });
            
            // Criar card da hora
            const hourCard = document.createElement('div');
            hourCard.className = 'hour-card';
            hourCard.innerHTML = `
                <div class="hour-time">${hourStr}</div>
                <div class="hour-icon"><i class="fas ${weatherInfo.icon}"></i></div>
                <div class="hour-temp">${temp}°</div>
            `;
            
            this.elements.hourlyScroll.appendChild(hourCard);
        }
    }
    
    // Atualiza previsão semanal
    updateWeeklyForecast() {
        if (!this.state.dailyForecast) return;
        
        this.elements.weeklyForecast.innerHTML = '';
        
        // Mostrar 7 dias (começando de amanhã)
        for (let i = 1; i <= 7; i++) {
            const date = new Date(this.state.dailyForecast.time[i]);
            const maxTemp = Math.round(this.state.dailyForecast.temperature_2m_max[i]);
            const minTemp = Math.round(this.state.dailyForecast.temperature_2m_min[i]);
            const weatherCode = this.state.dailyForecast.weather_code[i];
            const weatherInfo = this.weatherIcons[weatherCode] || this.weatherIcons[0];
            
            // Formatar dia da semana
            const dayOptions = { weekday: 'short' };
            const dayStr = date.toLocaleDateString(this.language, dayOptions);
            
            // Formatar data
            const dateOptions = { day: 'numeric', month: 'short' };
            const dateStr = date.toLocaleDateString(this.language, dateOptions);
            
            // Criar card do dia
            const dayCard = document.createElement('div');
            dayCard.className = 'day-card';
            dayCard.innerHTML = `
                <div class="day-name">${dayStr}</div>
                <div class="day-date">${dateStr}</div>
                <div class="day-icon"><i class="fas ${weatherInfo.icon}"></i></div>
                <div class="day-temps">
                    <span class="day-high">${maxTemp}°</span>
                    <span class="day-low">${minTemp}°</span>
                </div>
            `;
            
            this.elements.weeklyForecast.appendChild(dayCard);
        }
    }
    
    // Atualiza background conforme o clima
    updateBackground() {
        if (!this.state.currentWeather) return;
        
        const weatherCode = this.state.currentWeather.weather_code;
        let backgroundClass = '';
        
        // Determinar tipo de clima
        if (weatherCode === 0 || weatherCode === 1) {
            backgroundClass = this.weatherBackgrounds.sunny;
        } else if (weatherCode >= 45 && weatherCode <= 57) {
            backgroundClass = this.weatherBackgrounds.rainy;
        } else if (weatherCode >= 71 && weatherCode <= 77) {
            backgroundClass = this.weatherBackgrounds.snowy;
        } else if (weatherCode >= 95 && weatherCode <= 99) {
            backgroundClass = this.weatherBackgrounds.stormy;
        } else {
            backgroundClass = this.weatherBackgrounds.cloudy;
        }
        
        // Remover classes anteriores
        this.elements.weatherBackground.className = '';
        
        // Adicionar nova classe
        this.elements.weatherBackground.classList.add(backgroundClass);
        
        // Atualizar favicon dinamicamente
        this.updateFavicon(weatherCode);
    }
    
    // Atualiza favicon conforme o clima
    updateFavicon(weatherCode) {
        const weatherInfo = this.weatherIcons[weatherCode] || this.weatherIcons[0];
        const iconClass = weatherInfo.icon;
        
        // Mapear classes FontAwesome para emojis
        const iconMap = {
            'fa-sun': '☀️',
            'fa-cloud-sun': '🌤️',
            'fa-cloud': '☁️',
            'fa-cloud-rain': '🌧️',
            'fa-cloud-showers-heavy': '🌧️',
            'fa-snowflake': '❄️',
            'fa-bolt': '⛈️',
            'fa-smog': '🌫️'
        };
        
        const emoji = iconMap[iconClass] || '🌤️';
        
        // Atualizar título da página
        const temp = Math.round(this.state.currentWeather.temperature_2m);
        document.title = `${emoji} ${temp}°C – ${this.translations.appName}`;
        
        // Atualizar favicon (usando emoji como favicon)
        const favicon = document.querySelector("link[rel='icon']");
        if (favicon) {
            favicon.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${emoji}</text></svg>`;
        }
    }
    
    // Atualiza título da página
    updatePageTitle() {
        if (this.state.currentWeather) {
            const temp = Math.round(this.state.currentWeather.temperature_2m);
            const weatherCode = this.state.currentWeather.weather_code;
            const weatherInfo = this.weatherIcons[weatherCode] || this.weatherIcons[0];
            const iconClass = weatherInfo.icon;
            
            const iconMap = {
                'fa-sun': '☀️',
                'fa-cloud-sun': '🌤️',
                'fa-cloud': '☁️',
                'fa-cloud-rain': '🌧️',
                'fa-cloud-showers-heavy': '🌧️',
                'fa-snowflake': '❄️',
                'fa-bolt': '⛈️',
                'fa-smog': '🌫️'
            };
            
            const emoji = iconMap[iconClass] || '🌤️';
            document.title = `${emoji} ${temp}°C – ${this.translations.appName}`;
        } else {
            document.title = `${this.translations.appName} – Carregando...`;
        }
    }
    
    // Atualiza informações de localização
    updateLocationInfo(city, country) {
        this.elements.cityName.textContent = `${city}, ${country}`;
    }
    
    // Salva cidade favorita
    saveFavoriteCity(city) {
        this.state.favoriteCity = city;
        localStorage.setItem('favoriteCity', city);
    }
    
    // Rola a previsão por hora
    scrollHourlyForecast(direction) {
        const scrollAmount = 200;
        const currentScroll = this.elements.hourlyScroll.scrollLeft;
        
        if (direction === 'left') {
            this.elements.hourlyScroll.scrollLeft = currentScroll - scrollAmount;
        } else {
            this.elements.hourlyScroll.scrollLeft = currentScroll + scrollAmount;
        }
    }
    
    // Mostra tela de carregamento
    showLoading() {
        if (this.elements.loading) {
            this.elements.loading.style.display = 'flex';
        }
        if (this.elements.mainContent) {
            this.elements.mainContent.style.opacity = '0.5';
        }
    }
    
    // Esconde tela de carregamento
    hideLoading() {
        if (this.elements.loading) {
            this.elements.loading.style.display = 'none';
        }
        if (this.elements.mainContent) {
            this.elements.mainContent.style.opacity = '1';
        }
    }
    
    // Mostra notificação
    showNotification(message, type = 'info') {
        const notification = this.elements.notification;
        notification.textContent = message;
        notification.className = 'notification';
        
        // Adicionar classe baseada no tipo
        if (type === 'error') {
            notification.style.backgroundColor = this.state.isDarkMode ? '#c0392b' : '#e74c3c';
            notification.style.color = 'white';
        } else if (type === 'success') {
            notification.style.backgroundColor = this.state.isDarkMode ? '#27ae60' : '#2ecc71';
            notification.style.color = 'white';
        }
        
        notification.classList.add('show');
        
        // Esconder após 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Inicializa a aplicação quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});
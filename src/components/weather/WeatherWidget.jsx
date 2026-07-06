import { useEffect, useState } from 'react';
import { getWeather, getWeatherEmoji } from '../../lib/weather';
import { HAS_WEATHER_KEY } from '../../lib/demoMode';

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(HAS_WEATHER_KEY);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!HAS_WEATHER_KEY) return;
    getWeather()
      .then(setWeather)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (!HAS_WEATHER_KEY) {
    return (
      <div className="bg-white/10 rounded-2xl p-4 flex items-center gap-4">
        <div className="text-4xl">🌤️</div>
        <div className="flex-1">
          <p className="text-white text-sm font-bold">Weather — Demo Mode</p>
          <p className="text-white/60 text-xs mt-0.5">Add an OpenWeather API key in .env for live Delhi weather.</p>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="bg-white/10 rounded-2xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 bg-white/20 rounded-xl shimmer" />
      <div className="flex-1">
        <div className="h-3 bg-white/20 rounded w-1/2 mb-1.5" />
        <div className="h-2.5 bg-white/20 rounded w-1/3" />
      </div>
    </div>
  );

  if (error || !weather) return (
    <div className="bg-white/10 rounded-2xl p-4">
      <p className="text-white/60 text-xs">Weather unavailable</p>
    </div>
  );

  return (
    <div className="bg-white/10 rounded-2xl p-4 flex items-center gap-4">
      <div className="text-4xl">{getWeatherEmoji(weather.condition)}</div>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white">{weather.temp}°</span>
          <span className="text-white/70 text-sm capitalize">{weather.description}</span>
        </div>
        <p className="text-white/60 text-xs mt-0.5">
          Feels like {weather.feelsLike}° · {weather.city}
        </p>
      </div>
    </div>
  );
}

export function useWeatherData() {
  const [weather, setWeather] = useState(null);
  useEffect(() => {
    if (!HAS_WEATHER_KEY) return;
    getWeather().then(setWeather).catch(() => {});
  }, []);
  return weather;
}

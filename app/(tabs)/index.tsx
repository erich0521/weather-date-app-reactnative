
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import Ionicons from '@expo/vector-icons/Ionicons';

const COLORS = {
  deepCrimson: '#4A0E17',
  darkBurgundy: '#2A080C',
  metallicGold: '#D4AF37',
  pureWhite: '#FFFFFF',
  mediumGray: '#A3A3A3',
  softWhiteBorder: 'rgba(255,255,255,0.1)',
  translucentBlack: 'rgba(0,0,0,0.25)',
};

type WeatherData = {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
};

const WEATHER_CODES: Record<number, string> = {
  0: 'Clear Sky',
  1: 'Mostly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Foggy',
  51: 'Light Drizzle',
  53: 'Drizzle',
  55: 'Heavy Drizzle',
  61: 'Light Rain',
  63: 'Rain',
  65: 'Heavy Rain',
  71: 'Light Snow',
  73: 'Snow',
  75: 'Heavy Snow',
  80: 'Rain Showers',
  95: 'Thunderstorm',
};

export default function HomeScreen() {
  const [now, setNow] = useState(new Date());
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Location permission denied');
          setLoading(false);
          return;
        }

        const position = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = position.coords;

        const places = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (places.length > 0) {
          const place = places[0];
          const city = place.city || place.subregion || place.district || '';
          const region = place.region || '';
          const country = place.isoCountryCode || place.country || '';
          setLocationLabel([city, region, country].filter(Boolean).join(', ').toUpperCase());
        }

    const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`
        );
        const data = await response.json();
        const current = data.current;

        setWeather({
          temperature: Math.round(current.temperature_2m),
          condition: WEATHER_CODES[current.weather_code] ?? 'Unknown',
          humidity: Math.round(current.relative_humidity_2m),
          windSpeed: Math.round(current.wind_speed_10m),
        });
      } catch {
        setErrorMsg('Could not load location or weather');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const timeString = now.toLocaleTimeString('en-US', { hour12: true });
  const dateString = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <LinearGradient colors={[COLORS.deepCrimson, COLORS.darkBurgundy]} style={styles.background}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.locationRow}>
            <View style={styles.locationPill}>
              <Ionicons name="location-outline" size={14} color={COLORS.metallicGold} />
              <Text style={styles.locationText}>
                {locationLabel ?? (loading ? 'LOCATING...' : 'LOCATION UNAVAILABLE')}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="time-outline" size={14} color={COLORS.metallicGold} />
              <Text style={styles.cardLabel}>CURRENT TIME</Text>
            </View>
            <Text style={styles.bigText}>{timeString}</Text>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={12} color={COLORS.mediumGray} />
              <Text style={styles.dateText}>{dateString}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="help-circle-outline" size={14} color={COLORS.metallicGold} />
              <Text style={styles.cardLabel}>WEATHER UPDATES</Text>
            </View>

            {loading ? (
              <ActivityIndicator color={COLORS.metallicGold} style={styles.loader} />
            ) : weather ? (
              <>
                <Text style={styles.tempText}>{weather.temperature}°C</Text>
                <Text style={styles.weatherText}>{weather.condition}</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statPill}>
                    <Text style={styles.statLabel}>HUMIDITY</Text>
                    <Text style={styles.statValue}>{weather.humidity}%</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statPill}>
                    <Text style={styles.statLabel}>WIND</Text>
                    <Text style={styles.statValue}>{weather.windSpeed} km/h</Text>
                  </View>
                </View>
              </>
            ) : (
              <Text style={styles.subText}>{errorMsg ?? 'No data'}</Text>
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="logo-react" size={14} color={COLORS.metallicGold} />
              <Text style={styles.cardLabel}>REACT NATIVE</Text>
            </View>
            <View style={styles.brandRow}>
              <Text style={styles.bigText}>SIR MAGS</Text>
            </View>
          </View>

          <View style={styles.footerRow}>
            <Ionicons name="logo-react" size={11} color={COLORS.mediumGray} />
            <Text style={styles.footer}>REACT NATIVE · LIVE MONITORS</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },
scrollContent: {
  paddingHorizontal: 18,
  paddingTop: 50,
  paddingBottom: 24,
  gap: 20,
},

  locationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 6,
  },

  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.softWhiteBorder,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  locationText: {
    color: '#C7C7C7',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },

  card: {
  backgroundColor: 'rgba(255,255,255,0.01)',
    borderWidth: 1,
    borderColor: COLORS.softWhiteBorder,
    borderRadius: 20,
    padding: 30,
  
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 40,
  },

  cardLabel: {
    color: COLORS.metallicGold,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: -1,
  },

bigText: {
    color: COLORS.pureWhite,
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 26,
  },


  subText: {
    color: '#B5B5B5',
    fontSize: 12,
    marginTop: 8,
  },

  loader: {
    marginTop: 14,
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },

  dateText: {
    color: '#B5B5B5',
    fontSize: 12,
  },

  tempText: {
    color: COLORS.pureWhite,
    fontSize: 44,
    fontWeight: '800',
    lineHeight: 48,
  },

  weatherText: {
    color: COLORS.pureWhite,
    fontSize: 15,
    fontWeight: '500',
    marginTop: -2,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 16,
    backgroundColor: COLORS.translucentBlack,
    borderRadius: 14,
    overflow: 'hidden',

  },

  statPill: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },

  statDivider: {
    width: 1,
    backgroundColor: COLORS.softWhiteBorder,
    marginVertical: 10,
  },

  statLabel: {
    color: '#9A9A9A',
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },

  statValue: {
    color: COLORS.pureWhite,
    fontSize: 14,
    fontWeight: '700',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    marginTop: 4,
  },

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 169,
  },

  footer: {
    color: '#8E8E8E',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 0,
  },
});
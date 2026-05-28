import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  Easing, 
  withSequence, 
  withRepeat,
  runOnJS
} from 'react-native-reanimated';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { Colors } from '../constants/theme';

const { width, height } = Dimensions.get('window');
const PARTICLE_COUNT = 12;

export default function SplashScreen() {
  const router = useRouter();
  const { initializeAuth } = useAuthStore();
  const { initializeTheme, getIsDark } = useThemeStore();
  const isDark = getIsDark();
  const activeColors = isDark ? Colors.dark : Colors.light;

  // Animation values
  const irisScale = useSharedValue(0.1);
  const irisOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  
  // Particles
  const particleRadius = useSharedValue(0);
  const particleOpacity = useSharedValue(1);

  useEffect(() => {
    // Initialize services
    const init = async () => {
      await initializeTheme();
      await initializeAuth();
    };
    init();

    // Trigger animations
    irisOpacity.value = withTiming(1, { duration: 600 });
    irisScale.value = withTiming(1.2, { 
      duration: 1000, 
      easing: Easing.bezier(0.25, 1, 0.5, 1) 
    });

    // Logo fade & scale
    logoOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));
    logoScale.value = withDelay(400, withTiming(1, { 
      duration: 1000, 
      easing: Easing.out(Easing.back(1.5)) 
    }));

    // Tagline fade
    taglineOpacity.value = withDelay(900, withTiming(1, { duration: 600 }));

    // Particle Burst trigger
    particleRadius.value = withDelay(800, withTiming(width * 0.45, { 
      duration: 1200, 
      easing: Easing.bezier(0.1, 0.8, 0.2, 1) 
    }));
    
    particleOpacity.value = withDelay(1400, withTiming(0, { duration: 600 }));

    // Final Iris Expand Reveal & Route Redirect
    const redirect = () => {
      router.replace(useAuthStore.getState().isAuthenticated ? '/(drawer)' : '/(auth)/welcome');
    };

    irisScale.value = withDelay(2100, withTiming(15, { 
      duration: 800, 
      easing: Easing.bezier(0.7, 0, 0.84, 0)
    }));
    
    irisOpacity.value = withDelay(2400, withTiming(0, { 
      duration: 500 
    }, (finished) => {
      if (finished) {
        runOnJS(redirect)();
      }
    }));

  }, []);

  // Animated styles
  const irisStyle = useAnimatedStyle(() => ({
    transform: [{ scale: irisScale.value }],
    opacity: irisOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  return (
    <View style={[styles.container, { backgroundColor: activeColors.background }]}>
      {/* Background Starry Particles (Static Ambient Theme) */}
      <View style={StyleSheet.absoluteFill}>
        {[...Array(20)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.ambientStar,
              {
                top: Math.random() * height,
                left: Math.random() * width,
                opacity: Math.random() * 0.4 + 0.1,
                backgroundColor: activeColors.primary,
              },
            ]}
          />
        ))}
      </View>

      {/* Particle Burst Layer */}
      {[...Array(PARTICLE_COUNT)].map((_, index) => {
        const angle = (index * 2 * Math.PI) / PARTICLE_COUNT;
        
        const animatedParticleStyle = useAnimatedStyle(() => {
          const x = Math.cos(angle) * particleRadius.value;
          const y = Math.sin(angle) * particleRadius.value;
          return {
            transform: [{ translateX: x }, { translateY: y }],
            opacity: particleOpacity.value,
          };
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              { backgroundColor: activeColors.primary },
              animatedParticleStyle
            ]}
          />
        );
      })}

      {/* Main Circular Iris Layer */}
      <Animated.View style={[styles.irisContainer, irisStyle]}>
        <View style={[styles.irisOuter, { borderColor: activeColors.primary }]}>
          <View style={[styles.irisMiddle, { backgroundColor: activeColors.primaryGlow }]}>
            <View style={[styles.irisCore, { backgroundColor: activeColors.primary }]} />
          </View>
        </View>
      </Animated.View>

      {/* Logo & Tagline Container */}
      <View style={styles.contentContainer}>
        <Animated.Text style={[styles.logoText, { color: activeColors.text }, logoStyle]}>
          EYE 1
        </Animated.Text>
        <Animated.Text style={[styles.taglineText, { color: activeColors.textMuted }, taglineStyle]}>
          PREMIUM INTELLIGENT INTERFACE
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: height * 0.15,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 8,
    textShadowColor: 'rgba(99, 102, 241, 0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 15,
  },
  taglineText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 4,
    marginTop: 12,
  },
  irisContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  irisOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  irisMiddle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  irisCore: {
    width: 40,
    height: 40,
    borderRadius: 20,
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  ambientStar: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
});

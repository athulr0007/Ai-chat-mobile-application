import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat,
  withSequence,
  Easing,
  withDelay
} from 'react-native-reanimated';
import { useThemeStore } from '../store/useThemeStore';
import { Colors, Spacing, Typography } from '../constants/theme';

function WaveBar({ delay }: { delay: number }) {
  const heightVal = useSharedValue(8);

  useEffect(() => {
    heightVal.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(45, { duration: 400, easing: Easing.bezier(0.25, 1, 0.5, 1) }),
          withTiming(8, { duration: 400, easing: Easing.bezier(0.25, 1, 0.5, 1) })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    height: heightVal.value,
  }));

  return <Animated.View style={[styles.waveBar, animatedStyle]} />;
}

export default function VoiceWaveform() {
  const { getIsDark } = useThemeStore();
  const isDark = getIsDark();
  const activeColors = isDark ? Colors.dark : Colors.light;

  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 600, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View style={[styles.overlayContainer, { backgroundColor: 'rgba(0,0,0,0.85)' }]}>
      <View style={styles.contentContainer}>
        {/* Pulsing Red Recording Indicator */}
        <View style={styles.indicatorContainer}>
          <Animated.View style={[styles.pulseCircle, animatedPulseStyle]} />
          <View style={styles.solidCircle} />
        </View>

        <Text style={styles.recordingText}>Listening...</Text>

        {/* Oscillating Audio Wave bars */}
        <View style={styles.waveContainer}>
          <WaveBar delay={0} />
          <WaveBar delay={100} />
          <WaveBar delay={200} />
          <WaveBar delay={300} />
          <WaveBar delay={200} />
          <WaveBar delay={100} />
          <WaveBar delay={0} />
        </View>

        <Text style={styles.hintText}>Release button to send to Groq Whisper</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
  },
  indicatorContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(239, 68, 68, 0.4)',
  },
  solidCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EF4444',
  },
  recordingText: {
    color: '#FFF',
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 1,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    gap: 6,
    marginVertical: Spacing.two,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: '#EF4444',
  },
  hintText: {
    color: '#9CA3AF',
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
  },
});

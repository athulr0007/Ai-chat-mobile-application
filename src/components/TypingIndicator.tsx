import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  withRepeat,
  withSequence,
  Easing
} from 'react-native-reanimated';
import { useThemeStore } from '../store/useThemeStore';
import { Colors, Spacing } from '../constants/theme';

function Dot({ delay }: { delay: number }) {
  const { getIsDark } = useThemeStore();
  const isDark = getIsDark();
  const activeColors = isDark ? Colors.dark : Colors.light;
  
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-6, { duration: 300, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 300, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // Loop infinitely
        true // Reverse direction
      )
    );

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.4, { duration: 300 })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View 
      style={[
        styles.dot, 
        { backgroundColor: activeColors.textMuted }, 
        animatedStyle
      ]} 
    />
  );
}

export default function TypingIndicator() {
  const { getIsDark } = useThemeStore();
  const isDark = getIsDark();
  const activeColors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: activeColors.aiBubble }]}>
      <Dot delay={0} />
      <Dot delay={150} />
      <Dot delay={300} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
    marginLeft: Spacing.four,
    marginBottom: Spacing.two,
    width: 60,
    height: 36,
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

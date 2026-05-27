import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat,
  withSequence,
  Easing
} from 'react-native-reanimated';
import { useThemeStore } from '../store/useThemeStore';
import { Colors, Spacing } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function SkeletonLoader() {
  const { getIsDark } = useThemeStore();
  const isDark = getIsDark();
  const activeColors = isDark ? Colors.dark : Colors.light;

  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 750, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 750, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.bubbleContainer}>
      <Animated.View 
        style={[
          styles.bubble, 
          { backgroundColor: activeColors.aiBubble }, 
          animatedStyle
        ]}
      >
        {/* Mock Title Shimmer */}
        <View style={[styles.shimmerLine, { width: '40%', backgroundColor: activeColors.border }]} />
        
        {/* Mock Content Shimmers */}
        <View style={[styles.shimmerLine, { width: '85%', backgroundColor: activeColors.border }]} />
        <View style={[styles.shimmerLine, { width: '92%', backgroundColor: activeColors.border }]} />
        <View style={[styles.shimmerLine, { width: '65%', backgroundColor: activeColors.border }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubbleContainer: {
    alignSelf: 'flex-start',
    width: '80%',
    paddingLeft: Spacing.four,
    marginBottom: Spacing.four,
  },
  bubble: {
    padding: Spacing.four,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    gap: Spacing.two,
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  shimmerLine: {
    height: 12,
    borderRadius: 6,
  },
});

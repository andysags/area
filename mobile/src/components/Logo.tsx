import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  size?: number;
  color?: string;
};

export default function Logo({ size = 32 }: Props) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    spinAnimation.start();
    pulseAnimation.start();

    return () => {
        spinAnimation.stop();
        pulseAnimation.stop();
    };
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg viewBox="0 0 100 100" width="100%" height="100%">
        <Defs>
          <LinearGradient id="nexusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#3b82f6" />
            <Stop offset="100%" stopColor="#4f46e5" />
          </LinearGradient>
        </Defs>

        {/* Rotating Outer Hexagon */}
        <AnimatedG 
            style={{ transform: [{ rotate: spin }] }} 
            origin="50, 50"
        >
             <Path
                d="M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z"
                stroke="url(#nexusGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </AnimatedG>

        {/* Pulsing Center Circle */}
        <AnimatedCircle
          cx="50"
          cy="50"
          r="15"
          fill="url(#nexusGradient)"
          opacity={pulseValue}
        />

        {/* Static Inner Lines */}
        <Path
          d="M50 10 L50 35 M90 30 L65 42 M90 70 L65 58 M50 90 L50 65 M10 70 L35 58 M10 30 L35 42"
          stroke="url(#nexusGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.5"
        />
      </Svg>
    </View>
  );
}

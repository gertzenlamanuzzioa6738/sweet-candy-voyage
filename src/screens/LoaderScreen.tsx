import React, {useEffect, useRef} from 'react';
import {Animated, Easing, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {assets} from '../assets';
import {LOADER_DURATION_MS, SPRING_POP} from '../constants/config';
import {colors, gradients, radius} from '../constants/theme';
import {GardenBackdrop} from '../components/GardenBackdrop';

const BAR_W = 220;

/**
 * Brand card, not a menu duplicate: no PLAY button, no stat chips, a deep purple overlay
 * that puts it as far from the light blush Menu as the palette allows. The hold is driven
 * by the timer in App.tsx and nothing here can skip it.
 */
export function LoaderScreen() {
  const discScale = useRef(new Animated.Value(0.82)).current;
  const logoFade = useRef(new Animated.Value(0)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleRise = useRef(new Animated.Value(14)).current;
  const breathe = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const markerFade = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const intro = Animated.parallel([
      Animated.spring(discScale, {toValue: 1, useNativeDriver: true, ...SPRING_POP}),
      Animated.timing(logoFade, {toValue: 1, duration: 420, useNativeDriver: true}),
      Animated.sequence([
        Animated.delay(500),
        Animated.parallel([
          Animated.timing(titleFade, {toValue: 1, duration: 420, useNativeDriver: true}),
          Animated.timing(titleRise, {toValue: 0, duration: 420, useNativeDriver: true}),
        ]),
      ]),
    ]);

    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {toValue: 1, duration: 1300, useNativeDriver: true}),
        Animated.timing(breathe, {toValue: 0, duration: 1300, useNativeDriver: true}),
      ]),
    );

    // width is the one property that may never use the native driver
    const bar = Animated.timing(progress, {
      toValue: 1,
      duration: LOADER_DURATION_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    });

    const marker = Animated.loop(
      Animated.sequence([
        Animated.timing(markerFade, {toValue: 1, duration: 450, useNativeDriver: true}),
        Animated.timing(markerFade, {toValue: 0.45, duration: 450, useNativeDriver: true}),
      ]),
    );

    intro.start();
    breathing.start();
    bar.start();
    marker.start();

    return () => {
      intro.stop();
      breathing.stop();
      bar.stop();
      marker.stop();
    };
  }, [discScale, logoFade, titleFade, titleRise, breathe, progress, markerFade]);

  const breatheScale = breathe.interpolate({inputRange: [0, 1], outputRange: [1, 1.035]});
  const barWidth = progress.interpolate({inputRange: [0, 1], outputRange: [0, BAR_W]});

  return (
    <GardenBackdrop variant="loader">
      <View style={styles.root}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.disc,
            {transform: [{scale: Animated.multiply(discScale, breatheScale)}]},
          ]}>
          <View pointerEvents="none" style={styles.discLight} />
          <Animated.Image
            source={assets.logo}
            style={[styles.logo, {opacity: logoFade}]}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={{opacity: titleFade, transform: [{translateY: titleRise}]}}>
          <Text style={styles.title}>SWEET CANDY VOYAGE</Text>
          <Text style={styles.subtitle}>A CANDY CURRENT ADVENTURE</Text>
        </Animated.View>

        <View style={styles.barBlock}>
          <View style={styles.track}>
            <Animated.View pointerEvents="none" style={[styles.fillWrap, {width: barWidth}]}>
              <LinearGradient
                colors={gradients.loaderBar as unknown as string[]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.fill}
              />
            </Animated.View>
          </View>
          <Animated.Text style={[styles.marker, {opacity: markerFade}]}>
            LOADING...
          </Animated.Text>
        </View>
      </View>
    </GardenBackdrop>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 26},
  disc: {
    width: 176,
    height: 176,
    borderRadius: 88,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.22)',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  discLight: {
    position: 'absolute',
    left: 44,
    right: 44,
    top: 10,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  logo: {width: 148, height: 148},
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '900',
    letterSpacing: 1.6,
    color: colors.onDark,
    textAlign: 'center',
    textShadowColor: 'rgba(255,105,180,0.65)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 14,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 3.2,
    color: colors.onDarkSoft,
    opacity: 0.85,
    textAlign: 'center',
  },
  barBlock: {alignItems: 'center', gap: 12},
  track: {
    width: BAR_W,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },
  fillWrap: {height: 8, borderRadius: 4, overflow: 'hidden'},
  fill: {width: BAR_W, height: 8},
  marker: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
    letterSpacing: 2.4,
    color: colors.onDarkSoft,
  },
  spacer: {height: radius.sm},
});

export default LoaderScreen;

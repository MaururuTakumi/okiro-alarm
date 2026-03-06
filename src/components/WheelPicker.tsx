import React, { useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
} from 'react-native';

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 3;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface WheelPickerProps {
  items: { label: string; value: number }[];
  selectedValue: number;
  onValueChange: (value: number) => void;
  textColor?: string;
  selectedTextColor?: string;
  highlightColor?: string;
}

export default function WheelPicker({
  items,
  selectedValue,
  onValueChange,
  textColor = '#8E8E93',
  selectedTextColor = '#F5F5F7',
  highlightColor = 'rgba(255, 107, 53, 0.15)',
}: WheelPickerProps) {
  const scrollRef = useRef<ScrollView>(null);
  const selectedIndex = items.findIndex((i) => i.value === selectedValue);
  const isScrolling = useRef(false);

  useEffect(() => {
    const idx = items.findIndex((i) => i.value === selectedValue);
    if (idx >= 0 && scrollRef.current && !isScrolling.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: false });
      }, 50);
    }
  }, [selectedValue, items]);

  const onMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      isScrolling.current = false;
      const y = e.nativeEvent.contentOffset.y;
      const idx = Math.round(y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(idx, items.length - 1));
      if (items[clamped] && items[clamped].value !== selectedValue) {
        onValueChange(items[clamped].value);
      }
    },
    [items, onValueChange, selectedValue],
  );

  const onScrollBegin = useCallback(() => {
    isScrolling.current = true;
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.highlight, { backgroundColor: highlightColor }]} />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumEnd}
        onScrollBeginDrag={onScrollBegin}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT, // one item padding top/bottom
        }}
        style={styles.scroll}
      >
        {items.map((item, i) => (
          <View key={item.value} style={styles.item}>
            <Text
              style={[
                styles.itemText,
                {
                  color: i === selectedIndex ? selectedTextColor : textColor,
                  fontWeight: i === selectedIndex ? '600' : '400',
                  fontSize: i === selectedIndex ? 28 : 20,
                  opacity: i === selectedIndex ? 1 : 0.5,
                },
              ]}
            >
              {item.label}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: PICKER_HEIGHT,
    overflow: 'hidden',
    position: 'relative',
  },
  scroll: {
    height: PICKER_HEIGHT,
  },
  highlight: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderRadius: 12,
    zIndex: -1,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 22,
  },
});

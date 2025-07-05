// src/components/RatingStars.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RatingStarsProps {
  rating?: number;
  maxRating?: number;
  size?: number;
  onPress?: (rating: number) => void;
  readonly?: boolean;
  color?: string;
}

const RatingStars: React.FC<RatingStarsProps> = ({ 
  rating = 0, 
  maxRating = 5, 
  size = 20, 
  onPress = null, 
  readonly = false,
  color = '#FFD700' 
}) => {
  const handleStarPress = (selectedRating: number) => {
    if (!readonly && onPress) {
      onPress(selectedRating);
    }
  };

  return (
    <View style={styles.container}>
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;
        
        return (
          <TouchableOpacity
            key={index}
            onPress={() => handleStarPress(starValue)}
            disabled={readonly}
            style={styles.star}
          >
            <Ionicons
              name={isFilled ? 'star' : 'star-outline'}
              size={size}
              color={isFilled ? color : '#ccc'}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 2,
  },
});

export default RatingStars;
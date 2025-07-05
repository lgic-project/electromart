
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import RatingStars from './RatingStars';
import { useAddReview, useUpdateReview } from '../api/api';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  product_id: string;
}

interface ReviewFormProps {
  visible: boolean;
  onClose: () => void;
  productId: string;
  existingReview?: Review | null;
  onSuccess?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ 
  visible, 
  onClose, 
  productId, 
  existingReview = null, 
  onSuccess 
}) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  
  const addReviewMutation = useAddReview();
  const updateReviewMutation = useUpdateReview();
  
  const toast = useToast();

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || '');
    } else {
      setRating(0);
      setComment('');
    }
  }, [existingReview, visible]);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    try {
      if (existingReview) {
        await updateReviewMutation.mutateAsync({
          reviewId: existingReview.id,
          rating,
          comment,
          productId
        });
        toast.show('Review updated successfully', { 
          type: 'success', 
          placement: 'top', 
          duration: 1500 
        });
      } else {
        await addReviewMutation.mutateAsync({ productId, rating, comment });
        toast.show('Review added successfully', { 
          type: 'success', 
          placement: 'top', 
          duration: 1500 
        });
      }

      onSuccess && onSuccess();
      onClose();
      
    } catch (error: any) {
      toast.show('Error saving review: ' + error.message, {
        type: 'danger',
        placement: 'top',
        duration: 2000,
      });
    }
  };

  const isLoading = addReviewMutation.isPending || updateReviewMutation.isPending;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {existingReview ? 'Edit Review' : 'Write a Review'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.label}>Rating *</Text>
          <View style={styles.ratingContainer}>
            <RatingStars
              rating={rating}
              onPress={setRating}
              size={30}
            />
            <Text style={styles.ratingText}>
              {rating > 0 ? `${rating}/5` : 'Select rating'}
            </Text>
          </View>

          <Text style={styles.label}>Comment (Optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Share your experience with this product..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={styles.characterCount}>{comment.length}/500</Text>

          <TouchableOpacity
            style={[styles.submitButton, { opacity: isLoading ? 0.7 : 1 }]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Saving...' : (existingReview ? 'Update Review' : 'Submit Review')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#666',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 4,
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReviewForm;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { Ionicons } from '@expo/vector-icons';
import RatingStars from './RatingStars';
import { getProductReviews, useDeleteReview } from '../api/api';
import { supabase } from '../lib/supabase';
import { Review } from '../types/types'; // Import shared Review type

interface ReviewsListProps {
  productId: string;
  onEditReview: (review: Review) => void;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ productId, onEditReview }) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const toast = useToast();
  
  const { data: reviews = [], isLoading, error } = getProductReviews(productId);
  const deleteReviewMutation = useDeleteReview();

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const handleDeleteReview = (reviewId: string) => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReviewMutation.mutateAsync({ reviewId, productId });
              toast.show('Review deleted successfully', {
                type: 'success',
                placement: 'top',
                duration: 1500,
              });
            } catch (error: any) {
              toast.show('Error deleting review: ' + error.message, {
                type: 'danger',
                placement: 'top',
                duration: 2000,
              });
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderReviewItem = (item: Review) => {
    const isCurrentUser = currentUserId === item.user_id;
    
    return (
      <View key={item.id} style={styles.reviewItem}>
        <View style={styles.reviewHeader}>
          <View style={styles.userInfo}>
            <Image
              source={{
                uri: item.users?.avatar_url || 'https://via.placeholder.com/40',
              }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.userName}>
                {item.users?.full_name || 'Anonymous User'}
              </Text>
              <Text style={styles.reviewDate}>{formatDate(item.created_at)}</Text>
            </View>
          </View>
          
          {isCurrentUser && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => onEditReview(item)}
                style={styles.actionButton}
              >
                <Ionicons name="pencil" size={16} color="#007bff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteReview(item.id)}
                style={styles.actionButton}
              >
                <Ionicons name="trash" size={16} color="#dc3545" />
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <View style={styles.ratingRow}>
          <RatingStars rating={item.rating} readonly size={16} />
          <Text style={styles.ratingValue}>{item.rating}/5</Text>
        </View>
        
        {item.comment && (
          <Text style={styles.comment}>{item.comment}</Text>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading reviews...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Error loading reviews</Text>
      </View>
    );
  }

  if (reviews.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No reviews yet</Text>
        <Text style={styles.emptySubtext}>Be the first to review this product!</Text>
      </View>
    );
  }

  // Process reviews data
  const processedReviews = reviews.map((review) => ({
    ...review,
    comment: review.comment ?? '',
    created_at: review.created_at ?? '',
    updated_at: review.updated_at ?? '',
    users: review.users
      ? {
          full_name: review.users.full_name ?? '',
          avatar_url: review.users.avatar_url,
        }
      : null,
  }));

  // Option 1: Use ScrollView instead of FlatList (recommended for small lists)
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    >
      {processedReviews.map(renderReviewItem)}
    </ScrollView>
  );

  // Option 2: If you need to keep FlatList, use this instead:
  // return (
  //   <View style={styles.container}>
  //     <FlatList
  //       data={processedReviews}
  //       keyExtractor={(item) => item.id}
  //       renderItem={({ item }) => renderReviewItem(item)}
  //       showsVerticalScrollIndicator={false}
  //       contentContainerStyle={styles.listContainer}
  //       nestedScrollEnabled={true}
  //       scrollEnabled={false} // Disable internal scrolling
  //     />
  //   </View>
  // );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 16,
  },
  reviewItem: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingValue: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  comment: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
  },
});

export default ReviewsList;
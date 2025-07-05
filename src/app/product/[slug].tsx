import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { useCartStore } from '../../store/cart-store';
import { getProduct, getProductReviews } from '../../api/api';
import { supabase } from '../../lib/supabase';
import RatingStars from '../../components/RatingStars';
import ReviewForm from '../../components/ReviewForm';
import ReviewsList from '../../components/ReviewsList';
import { Review } from '../../types/types'; 



const ProductDetails = () => {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const toast = useToast();

  const { data: product, error, isLoading } = getProduct(slug);
  
  // Convert product.id to string for the reviews query
  const productIdString = product?.id?.toString() || '';
  const { data: reviews = [], isLoading: reviewsLoading } = getProductReviews(productIdString);

  const { items, addItem, incrementItem, decrementItem } = useCartStore();

  const cartItem = items.find(item => item.id === product?.id);
  const initialQuantity = cartItem ? cartItem.quantity : 0;

  const [quantity, setQuantity] = useState(initialQuantity);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  // Check if current user has already reviewed this product
  const userReview = reviews.find(review => review.user_id === currentUserId);

  if (isLoading) return <ActivityIndicator style={styles.loader} />;
  if (error) return <Text style={styles.errorMessage}>Error: {error.message}</Text>;
  if (!product) return <Redirect href='/404' />;

  const increaseQuantity = () => {
    if (quantity < product.maxQuantity) {
      setQuantity(prev => prev + 1);
      incrementItem(product.id);
    } else {
      toast.show('Cannot add more than maximum quantity', {
        type: 'warning',
        placement: 'top',
        duration: 1500,
      });
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
      decrementItem(product.id);
    }
  };

  const addToCart = () => {
    addItem({
      id: product.id,
      title: product.title,
      heroImage: product.heroImage,
      price: product.price,
      quantity,
      maxQuantity: product.maxQuantity,
    });
    toast.show('Added to cart', {
      type: 'success',
      placement: 'top',
      duration: 1500,
    });
  };

  const handleWriteReview = () => {
    if (!currentUserId) {
      toast.show('Please log in to write a review', {
        type: 'warning',
        placement: 'top',
        duration: 2000,
      });
      return;
    }
    setEditingReview(null);
    setShowReviewForm(true);
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleReviewSuccess = () => {
    // Reviews will be automatically refetched due to React Query
    setShowReviewForm(false);
    setEditingReview(null);
  };

  const totalPrice = (product.price * quantity).toFixed(2);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: product.title }} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: product.heroImage }} style={styles.heroImage} />

        <View style={styles.contentContainer}>
          {/* Product Info */}
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.slug}>Slug: {product.slug}</Text>
          
          {/* Rating Summary */}
          <View style={styles.ratingContainer}>
            <RatingStars rating={averageRating} readonly size={20} />
            <Text style={styles.ratingText}>
              {averageRating > 0 ? `${averageRating.toFixed(1)} (${reviews.length} review${reviews.length !== 1 ? 's' : ''})` : 'No reviews yet'}
            </Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              Unit Price: ${product.price.toFixed(2)}
            </Text>
            <Text style={styles.price}>Total Price: ${totalPrice}</Text>
          </View>

          {/* Product Images */}
          <FlatList
            data={product.imagesUrl}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.image} />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imagesContainer}
          />

          {/* Quantity and Add to Cart */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.quantityButton, { opacity: quantity <= 1 ? 0.5 : 1 }]}
              onPress={decreaseQuantity}
              disabled={quantity <= 1}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>

            <Text style={styles.quantity}>{quantity}</Text>

            <TouchableOpacity
              style={[styles.quantityButton, { opacity: quantity >= product.maxQuantity ? 0.5 : 1 }]}
              onPress={increaseQuantity}
              disabled={quantity >= product.maxQuantity}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.addToCartButton,
                { opacity: quantity === 0 ? 0.5 : 1 },
              ]}
              onPress={addToCart}
              disabled={quantity === 0}
            >
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.reviewsTitle}>Reviews ({reviews.length})</Text>
              <TouchableOpacity
                style={styles.writeReviewButton}
                onPress={handleWriteReview}
              >
                <Ionicons name="create-outline" size={16} color="#007bff" />
                <Text style={styles.writeReviewText}>
                  {userReview ? 'Edit Review' : 'Write Review'}
                </Text>
              </TouchableOpacity>
            </View>

            {reviewsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" />
                <Text style={styles.loadingText}>Loading reviews...</Text>
              </View>
            ) : (
              <ReviewsList
                productId={productIdString}
                onEditReview={handleEditReview}
              />
            )}
          </View>
        </View>
      </ScrollView>

      {/* Review Form Modal */}
      <ReviewForm
        visible={showReviewForm}
        onClose={() => {
          setShowReviewForm(false);
          setEditingReview(null);
        }}
        productId={productIdString}
        existingReview={editingReview}
        onSuccess={handleReviewSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  contentContainer: {
    padding: 16,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#333',
  },
  slug: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  imagesContainer: {
    marginBottom: 16,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 8,
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  quantityButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  quantity: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007bff',
  },
  writeReviewText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  errorMessage: {
    fontSize: 18,
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 20,
    padding: 20,
  },
});

export default ProductDetails;
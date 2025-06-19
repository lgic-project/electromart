import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { useState } from 'react';

import { useCartStore } from '../../store/cart-store';
import { getProduct } from '../../api/api';
import { ActivityIndicator } from 'react-native';

const ProductDetails = () => {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const toast = useToast();

  const { data: product, error, isLoading } = getProduct(slug);

  const { items, addItem, incrementItem, decrementItem } = useCartStore();

  const cartItem = items.find(item => item.id === product?.id);

  const initialQuantity = cartItem ? cartItem.quantity : 0;

  const [quantity, setQuantity] = useState(initialQuantity);

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error.message}</Text>;
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

  const totalPrice = (product.price * quantity).toFixed(2);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: product.title }} />

      <Image source={{ uri: product.heroImage }} style={styles.heroImage} />

      <View style={{ padding: 16, flex: 1 }}>
        <Text style={styles.title}>Title: {product.title}</Text>
        <Text style={styles.slug}>Slug: {product.slug}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            Unit Price: Rs{product.price.toFixed(2)}
          </Text>
          <Text style={styles.price}>Total Price: Rs{totalPrice}</Text>
        </View>

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
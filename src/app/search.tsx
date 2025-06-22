import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
} from 'react-native';
import { Link, useRouter } from 'expo-router';

import { getProductsAndCategories } from '../api/api';
import { Tables } from '../types/database.types';
import { ProductListItem } from '../components/product-list-item';

export default function Search() {
  const [query, setQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Tables<'product'>[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Tables<'category'>[]>([]);
  const { data } = getProductsAndCategories();
  const router = useRouter();

  useEffect(() => {
    if (!data || !query.trim()) {
      setFilteredProducts([]);
      setFilteredCategories([]);
      return;
    }

    const q = query.toLowerCase();

    const matchedProducts = data.products.filter(p =>
      p.title.toLowerCase().includes(q)
    );

    const matchedCategories = data.categories.filter(c =>
      c.name.toLowerCase().includes(q)
    );

    setFilteredProducts(matchedProducts);
    setFilteredCategories(matchedCategories);
  }, [query, data]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search products or categories"
        value={query}
        onChangeText={setQuery}
      />

      <Text style={styles.sectionTitle}>Categories</Text>
      <FlatList
        data={filteredCategories}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <Link href={`/categories/${item.slug}`} asChild>
            <Pressable style={styles.categoryItem}>
              <Image source={{ uri: item.imageUrl }} style={styles.categoryImage} />
              <Text style={styles.categoryName}>{item.name}</Text>
            </Pressable>
          </Link>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
      />

      <Text style={styles.sectionTitle}>Products</Text>
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => <ProductListItem product={item} />}
        numColumns={2}
        ListEmptyComponent={
          query ? (
            <Link href="/components/+not-found" asChild>
              <Pressable>
                <Text style={styles.noResultText}>No results found. Tap to return.</Text>
              </Pressable>
            </Link>
          ) : null
        }
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  categoryItem: {
    marginRight: 16,
    alignItems: 'center',
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  categoryName: {
    marginTop: 6,
    fontSize: 14,
  },
  noResultText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    color: 'gray',
  },
  listContent: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
});

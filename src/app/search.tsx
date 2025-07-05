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
import { Link, useRouter, useLocalSearchParams } from 'expo-router';

import { getProductsAndCategories } from '../api/api';
import { Tables } from '../types/database.types';
import { ProductListItem } from '../components/product-list-item';

export default function Search() {
  const [query, setQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Tables<'product'>[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Tables<'category'>[]>([]);
  const { data } = getProductsAndCategories();
  const router = useRouter();
  
  // Get the search query from route parameters
  const { query: routeQuery } = useLocalSearchParams<{ query: string }>();

  // Set initial query from route parameters when component mounts
  useEffect(() => {
    if (routeQuery && typeof routeQuery === 'string') {
      setQuery(routeQuery);
    }
  }, [routeQuery]);

  // Filter products and categories based on query
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

  // Update the route parameter when user types in the search box
  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    
    // Update the URL parameter to maintain consistency
    if (newQuery.trim()) {
      router.setParams({ query: newQuery });
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search products or categories"
        value={query}
        onChangeText={handleQueryChange}
      />

      {query.trim() && (
        <>
          {filteredCategories.length > 0 && (
            <>
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
                style={styles.categoriesList}
              />
            </>
          )}

          <Text style={styles.sectionTitle}>Products</Text>
          <FlatList
            data={filteredProducts}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => <ProductListItem product={item} />}
            numColumns={2}
            ListEmptyComponent={
              filteredProducts.length === 0 && filteredCategories.length === 0 ? (
                <View style={styles.noResultContainer}>
                  <Text style={styles.noResultText}>
                    No results found for "{query}"
                  </Text>
                  <Link href="/" asChild>
                    <Pressable style={styles.backButton}>
                      <Text style={styles.backButtonText}>Back to Home</Text>
                    </Pressable>
                  </Link>
                </View>
              ) : null
            }
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={filteredProducts.length > 1 ? styles.columnWrapper : undefined}
          />
        </>
      )}

      {!query.trim() && (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>
            Start typing to search for products and categories
          </Text>
        </View>
      )}
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
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  categoriesList: {
    marginBottom: 10,
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
    textAlign: 'center',
  },
  noResultContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  noResultText: {
    fontSize: 16,
    textAlign: 'center',
    color: 'gray',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#1BC464',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
});
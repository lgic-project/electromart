import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/auth-provider';
import { generateOrderSlug } from '../utils/utils';
import { Review, Product, Category } from '../types/types'; 

export const getProductsAndCategories = () => {
  return useQuery({
    queryKey: ['products', 'categories'],
    queryFn: async () => { 
      const [products, categories] = await Promise.all([
        supabase.from('product').select('*'),
        supabase.from('category').select('*'),
      ]);

      if (products.error || categories.error) {
        throw new Error('An error occurred while fetching data');
      }

      return { products: products.data, categories: categories.data };
    },
  });
};

// Fixed: Accept both string and number for productId, convert to string for query
export const getProductReviews = (productId: string | number) => {
  const productIdString = productId.toString();
  
  return useQuery({
    queryKey: ['reviews', productIdString],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          users (
            full_name,
            avatar_url
          )
        `)
        .eq('product_id', productIdString)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!productId, // Only run query if productId exists
  });
};

// Fixed: Accept both string and number for productId
export const getProductRating = (productId: string | number) => {
  const productIdString = productId.toString();
  
  return useQuery({
    queryKey: ['rating', productIdString],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', productIdString);

      if (error) throw error;

      const avgRating = data.length > 0 
        ? data.reduce((sum, review) => sum + review.rating, 0) / data.length 
        : 0;

      return { 
        averageRating: parseFloat(avgRating.toFixed(1)), 
        totalReviews: data.length,
      };
    },
    enabled: !!productId,
  });
};

export const useAddReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, rating, comment }: { 
      productId: string | number; 
      rating: number; 
      comment?: string; 
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const productIdString = productId.toString();

      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          product_id: productIdString,
          user_id: user.id,
          rating,
          comment
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      const productIdString = variables.productId.toString();
      // Invalidate and refetch reviews and rating for this product
      queryClient.invalidateQueries({ queryKey: ['reviews', productIdString] });
      queryClient.invalidateQueries({ queryKey: ['rating', productIdString] });
      queryClient.invalidateQueries({ queryKey: ['userReview', productIdString] });
    },
  });
};

// Update a review using React Query
export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, rating, comment, productId }: { 
      reviewId: string; 
      rating: number; 
      comment?: string;
      productId: string | number;
    }) => {
      const { data, error } = await supabase
        .from('reviews')
        .update({ rating, comment })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      const productIdString = variables.productId.toString();
      // Invalidate and refetch reviews and rating for this product
      queryClient.invalidateQueries({ queryKey: ['reviews', productIdString] });
      queryClient.invalidateQueries({ queryKey: ['rating', productIdString] });
      queryClient.invalidateQueries({ queryKey: ['userReview', productIdString] });
    },
  });
};

// Delete a review using React Query
export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, productId }: { 
      reviewId: string; 
      productId: string | number; 
    }) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      const productIdString = variables.productId.toString();
      // Invalidate and refetch reviews and rating for this product
      queryClient.invalidateQueries({ queryKey: ['reviews', productIdString] });
      queryClient.invalidateQueries({ queryKey: ['rating', productIdString] });
      queryClient.invalidateQueries({ queryKey: ['userReview', productIdString] });
    },
  });
};

// Check if user has already reviewed a product using React Query
export const getUserReview = (productId: string | number) => {
  const productIdString = productId.toString();
  
  return useQuery({
    queryKey: ['userReview', productIdString],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productIdString)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });
};

export const getProduct = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        throw new Error(
          'An error occurred while fetching data: ' + error?.message
        );
      }

      return data;
    },
    enabled: !!slug, // Only run query if slug exists
  });
};

export const getCategoryAndProducts = (categorySlug: string) => {
  return useQuery({
    queryKey: ['categoryAndProducts', categorySlug],
    queryFn: async () => {
      const { data: category, error: categoryError } = await supabase
        .from('category')
        .select('*')
        .eq('slug', categorySlug)
        .single();

      if (categoryError || !category) {
        throw new Error('An error occurred while fetching category data');
      }

      const { data: products, error: productsError } = await supabase
        .from('product')
        .select('*')
        .eq('category', category.id);

      if (productsError) {
        throw new Error('An error occurred while fetching products data');
      }

      return { category, products };
    },
    enabled: !!categorySlug,
  });
};

export const getMyOrders = () => {
  const {
    user: { id },
  } = useAuth();

  return useQuery({
    queryKey: ['orders', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order')
        .select('*')
        .order('created_at', { ascending: false })
        .eq('user', id);

      if (error)
        throw new Error(
          'An error occurred while fetching orders: ' + error.message
        );

      return data;
    },
  });
};

export const createOrder = () => {
  const {
    user: { id },
  } = useAuth();

  const slug = generateOrderSlug();

  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn({ totalPrice }: { totalPrice: number }) {
      const { data, error } = await supabase
        .from('order')
        .insert({
          totalPrice,
          slug,
          user: id,
          status: 'Pending',
        })
        .select('*')
        .single();

      if (error)
        throw new Error(
          'An error occurred while creating order: ' + error.message
        );

      return data;
    },

    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
};

export const createOrderItem = () => {
  return useMutation({
    async mutationFn(
      insertData: {
        orderId: number;
        productId: number;
        quantity: number;
      }[]
    ) {
      const { data, error } = await supabase
        .from('order_item')
        .insert(
          insertData.map(({ orderId, quantity, productId }) => ({
            order: orderId,
            product: productId,
            quantity,
          }))
        )
        .select('*');

      const productQuantities = insertData.reduce(
        (acc, { productId, quantity }) => {
          if (!acc[productId]) {
            acc[productId] = 0;
          }
          acc[productId] += quantity;
          return acc;
        },
        {} as Record<number, number>
      );

      await Promise.all(
        Object.entries(productQuantities).map(
          async ([productId, totalQuantity]) =>
            supabase.rpc('decrement_product_quantity', {
              product_id: Number(productId),
              quantity: totalQuantity,
            })
        )
      );

      if (error)
        throw new Error(
          'An error occurred while creating order item: ' + error.message
        );

      return data;
    },
  });
};

export const getMyOrder = (slug: string) => {
  const {
    user: { id },
  } = useAuth();

  return useQuery({
    queryKey: ['orders', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order')
        .select('*, order_items:order_item(*, products:product(*))')
        .eq('slug', slug)
        .eq('user', id)
        .single();

      if (error || !data)
        throw new Error(
          'An error occurred while fetching data: ' + error.message
        );

      return data;
    },
    enabled: !!slug,
  });
};
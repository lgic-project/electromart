import { create } from 'zustand';

type CartItemType = {
    id: number;
    title: string;
    heroImage: string;
    price: number;
    quantity: number;
    maxQuantity: number;
};

type CartState = {
    items: CartItemType[];
    addItem: (item: CartItemType) => void;
    removeItem: (id: number) => void;
    incrementItem: (id: number) => void;
    decrementItem: (id: number) => void;
    getTotalPrice: () => string;
    getItemCount: () => number;
    resetCart: () => void;
};

const initialCartItems: CartItemType[] = [];

export const useCartStore = create<CartState>((set, get) => ({
    items: initialCartItems,
    addItem: (item: CartItemType) => {
        if (!item) return;
        set(state => ({
            items: [...state.items, item],
        }));
    },
    removeItem: (id: number) => set(state => ({
        items: state.items.filter(item => item?.id !== id),
    })),
    incrementItem: (id: number) => set(state => ({
        items: state.items.map(item =>
            item?.id === id && item?.quantity < item?.maxQuantity
                ? { ...item, quantity: item.quantity + 1 }
                : item
        ),
    })),
    decrementItem: (id: number) => set(state => ({
        items: state.items.map(item =>
            item?.id === id && item?.quantity > 1
                ? { ...item, quantity: item.quantity - 1 }
                : item
        ),
    })),
    getTotalPrice: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2),
    getItemCount: () => get().items.reduce((count, item) => count + item.quantity, 0),
    resetCart: () => set({ items: initialCartItems }),
}));
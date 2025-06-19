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



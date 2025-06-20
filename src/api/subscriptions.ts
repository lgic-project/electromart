import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import {act} from 'react';

export const useOrderUpdateSubscription = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const subscriptionResponse = supabase
      .channel('custom-update-channel')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'order' },
        payload => {
          console.log('Change received!', payload);
          queryClient.invalidateQueries({
            queryKey: ['orders'],
            .queryKey: ['order', payload.new.id],
          });
        }
      )
      .subscribe();

    return () => {
      subscriptionResponse.unsubscribe();
    };
  }, []);
};
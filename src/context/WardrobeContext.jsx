import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from './UserContext';
import { DEMO_MODE, DEMO_USER_ID } from '../lib/demoMode';
import { loadLocal, saveLocal, genId } from '../lib/localStore';
import { SEED_WARDROBE, SEED_VERSION } from '../data/seedWardrobe';

const WardrobeContext = createContext(null);

const initialState = {
  items: [],
  outfits: [],
  shoppingList: [],
  loading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_ITEMS': return { ...state, items: action.payload };
    case 'ADD_ITEM': return { ...state, items: [action.payload, ...state.items] };
    case 'UPDATE_ITEM': return { ...state, items: state.items.map(i => i.id === action.payload.id ? action.payload : i) };
    case 'DELETE_ITEM': return { ...state, items: state.items.filter(i => i.id !== action.payload) };

    case 'SET_OUTFITS': return { ...state, outfits: action.payload };
    case 'ADD_OUTFIT': return { ...state, outfits: [action.payload, ...state.outfits] };
    case 'UPDATE_OUTFIT': return { ...state, outfits: state.outfits.map(o => o.id === action.payload.id ? action.payload : o) };
    case 'DELETE_OUTFIT': return { ...state, outfits: state.outfits.filter(o => o.id !== action.payload) };

    case 'SET_SHOPPING': return { ...state, shoppingList: action.payload };
    case 'ADD_SHOPPING': return { ...state, shoppingList: [action.payload, ...state.shoppingList] };
    case 'UPDATE_SHOPPING': return { ...state, shoppingList: state.shoppingList.map(s => s.id === action.payload.id ? action.payload : s) };
    case 'DELETE_SHOPPING': return { ...state, shoppingList: state.shoppingList.filter(s => s.id !== action.payload) };

    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'SET_ERROR': return { ...state, error: action.payload };
    default: return state;
  }
}

export function WardrobeProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { session } = useUser();

  const userId = session?.user?.id;

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    dispatch({ type: 'SET_LOADING', payload: true });

    if (DEMO_MODE) {
      let items = loadLocal('items', SEED_WARDROBE);
      const outfits = loadLocal('outfits', []);
      const shoppingList = loadLocal('shoppingList', []);

      // If the bundled seed data has been updated (e.g. new product photos)
      // since this browser first seeded, sync those fields onto any matching
      // seed items already in localStorage — without touching user edits
      // (status, times_worn, custom items, etc.).
      const storedSeedVersion = loadLocal('seedVersion', 0);
      if (storedSeedVersion < SEED_VERSION) {
        const seedMap = new Map(SEED_WARDROBE.map(s => [s.id, s]));
        items = items.map(item => {
          const fresh = seedMap.get(item.id);
          if (!fresh) return item;
          return { ...item, image_url: fresh.image_url, needs_photo: fresh.needs_photo, notes: fresh.notes, color_primary: fresh.color_primary };
        });
        // Seed items added in newer versions won't exist in older localStorage —
        // append them so the closet stays complete.
        const have = new Set(items.map(i => i.id));
        for (const fresh of SEED_WARDROBE) {
          if (!have.has(fresh.id)) items.push(fresh);
        }
        saveLocal('items', items);
        saveLocal('seedVersion', SEED_VERSION);
      }

      dispatch({ type: 'SET_ITEMS', payload: items });
      dispatch({ type: 'SET_OUTFITS', payload: outfits });
      dispatch({ type: 'SET_SHOPPING', payload: shoppingList });
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    const [itemsRes, outfitsRes, shoppingRes] = await Promise.all([
      supabase.from('wardrobe_items').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('outfits').select('*, outfit_items(*, wardrobe_items(*))').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('shopping_list').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    ]);

    if (itemsRes.data) dispatch({ type: 'SET_ITEMS', payload: itemsRes.data });
    if (outfitsRes.data) dispatch({ type: 'SET_OUTFITS', payload: outfitsRes.data });
    if (shoppingRes.data) dispatch({ type: 'SET_SHOPPING', payload: shoppingRes.data });
    dispatch({ type: 'SET_LOADING', payload: false });
  }, [userId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ---------- Wardrobe CRUD ----------
  async function addItem(item) {
    if (DEMO_MODE) {
      const newItem = { ...item, id: genId('item'), user_id: DEMO_USER_ID, created_at: new Date().toISOString() };
      const next = [newItem, ...state.items];
      dispatch({ type: 'ADD_ITEM', payload: newItem });
      saveLocal('items', next);
      return newItem;
    }
    const optimistic = { ...item, id: `temp-${Date.now()}`, user_id: userId, created_at: new Date().toISOString() };
    dispatch({ type: 'ADD_ITEM', payload: optimistic });
    const { data, error } = await supabase.from('wardrobe_items').insert({ ...item, user_id: userId }).select().single();
    if (error) { dispatch({ type: 'DELETE_ITEM', payload: optimistic.id }); throw error; }
    dispatch({ type: 'DELETE_ITEM', payload: optimistic.id });
    dispatch({ type: 'ADD_ITEM', payload: data });
    return data;
  }

  async function updateItem(id, updates) {
    const prev = state.items.find(i => i.id === id);
    const merged = { ...prev, ...updates };

    if (DEMO_MODE) {
      dispatch({ type: 'UPDATE_ITEM', payload: merged });
      saveLocal('items', state.items.map(i => i.id === id ? merged : i));
      return merged;
    }

    dispatch({ type: 'UPDATE_ITEM', payload: merged });
    const { data, error } = await supabase.from('wardrobe_items').update(updates).eq('id', id).select().single();
    if (error) { dispatch({ type: 'UPDATE_ITEM', payload: prev }); throw error; }
    dispatch({ type: 'UPDATE_ITEM', payload: data });
    return data;
  }

  async function deleteItem(id) {
    const prev = state.items.find(i => i.id === id);

    if (DEMO_MODE) {
      dispatch({ type: 'DELETE_ITEM', payload: id });
      saveLocal('items', state.items.filter(i => i.id !== id));
      return;
    }

    dispatch({ type: 'DELETE_ITEM', payload: id });
    const { error } = await supabase.from('wardrobe_items').delete().eq('id', id);
    if (error) { dispatch({ type: 'ADD_ITEM', payload: prev }); throw error; }
  }

  async function bulkAddItems(items) {
    if (DEMO_MODE) {
      const withIds = items.map(i => ({ ...i, id: genId('item'), user_id: DEMO_USER_ID, created_at: new Date().toISOString() }));
      const next = [...withIds, ...state.items];
      dispatch({ type: 'SET_ITEMS', payload: next });
      saveLocal('items', next);
      return withIds;
    }
    const withUser = items.map(i => ({ ...i, user_id: userId }));
    const { data, error } = await supabase.from('wardrobe_items').insert(withUser).select();
    if (error) throw error;
    dispatch({ type: 'SET_ITEMS', payload: [...data, ...state.items] });
    return data;
  }

  async function markWorn(id) {
    const item = state.items.find(i => i.id === id);
    if (!item) return;
    await updateItem(id, {
      status: 'Worn',
      times_worn: (item.times_worn || 0) + 1,
      last_worn_at: new Date().toISOString().split('T')[0],
    });
    if (DEMO_MODE) {
      const log = loadLocal('wearLog', []);
      saveLocal('wearLog', [{ id: genId('wear'), user_id: DEMO_USER_ID, wardrobe_item_id: id, worn_date: new Date().toISOString().split('T')[0] }, ...log]);
      return;
    }
    await supabase.from('wear_log').insert({ user_id: userId, wardrobe_item_id: id, worn_date: new Date().toISOString().split('T')[0] });
  }

  async function markClean(id) {
    await updateItem(id, { status: 'Clean' });
  }

  // ---------- Outfit CRUD ----------
  async function addOutfit(outfit, itemRoles) {
    if (DEMO_MODE) {
      const outfit_items = (itemRoles || []).map(r => ({
        id: genId('oi'),
        wardrobe_item_id: r.itemId,
        item_role: r.role,
        wardrobe_items: state.items.find(i => i.id === r.itemId) || null,
      }));
      const newOutfit = {
        ...outfit,
        id: genId('outfit'),
        user_id: DEMO_USER_ID,
        try_on_image_url: null,
        flatlay_image_url: null,
        times_worn: 0,
        last_worn_at: null,
        created_at: new Date().toISOString(),
        outfit_items,
      };
      const next = [newOutfit, ...state.outfits];
      dispatch({ type: 'ADD_OUTFIT', payload: newOutfit });
      saveLocal('outfits', next);
      return newOutfit;
    }

    const { data: outfitData, error } = await supabase
      .from('outfits')
      .insert({ ...outfit, user_id: userId })
      .select()
      .single();
    if (error) throw error;

    if (itemRoles?.length) {
      const items = itemRoles.map(r => ({ outfit_id: outfitData.id, wardrobe_item_id: r.itemId, item_role: r.role }));
      await supabase.from('outfit_items').insert(items);
    }

    const { data: full } = await supabase
      .from('outfits')
      .select('*, outfit_items(*, wardrobe_items(*))')
      .eq('id', outfitData.id)
      .single();

    dispatch({ type: 'ADD_OUTFIT', payload: full || outfitData });
    return full || outfitData;
  }

  async function deleteOutfit(id) {
    if (DEMO_MODE) {
      dispatch({ type: 'DELETE_OUTFIT', payload: id });
      saveLocal('outfits', state.outfits.filter(o => o.id !== id));
      return;
    }
    dispatch({ type: 'DELETE_OUTFIT', payload: id });
    await supabase.from('outfit_items').delete().eq('outfit_id', id);
    const { error } = await supabase.from('outfits').delete().eq('id', id);
    if (error) { await fetchAll(); throw error; }
  }

  async function updateOutfit(id, updates) {
    if (DEMO_MODE) {
      const merged = { ...state.outfits.find(o => o.id === id), ...updates };
      dispatch({ type: 'UPDATE_OUTFIT', payload: merged });
      saveLocal('outfits', state.outfits.map(o => o.id === id ? merged : o));
      return merged;
    }
    const { data, error } = await supabase.from('outfits').update(updates).eq('id', id).select().single();
    if (error) throw error;
    dispatch({ type: 'UPDATE_OUTFIT', payload: data });
    return data;
  }

  // ---------- Shopping CRUD ----------
  async function addShoppingItem(item) {
    if (DEMO_MODE) {
      const newItem = { ...item, id: genId('shop'), user_id: DEMO_USER_ID, created_at: new Date().toISOString() };
      const next = [newItem, ...state.shoppingList];
      dispatch({ type: 'ADD_SHOPPING', payload: newItem });
      saveLocal('shoppingList', next);
      return newItem;
    }
    const optimistic = { ...item, id: `temp-${Date.now()}`, user_id: userId, created_at: new Date().toISOString() };
    dispatch({ type: 'ADD_SHOPPING', payload: optimistic });
    const { data, error } = await supabase.from('shopping_list').insert({ ...item, user_id: userId }).select().single();
    if (error) { dispatch({ type: 'DELETE_SHOPPING', payload: optimistic.id }); throw error; }
    dispatch({ type: 'DELETE_SHOPPING', payload: optimistic.id });
    dispatch({ type: 'ADD_SHOPPING', payload: data });
    return data;
  }

  async function updateShoppingItem(id, updates) {
    const prev = state.shoppingList.find(s => s.id === id);
    const merged = { ...prev, ...updates };

    if (DEMO_MODE) {
      dispatch({ type: 'UPDATE_SHOPPING', payload: merged });
      saveLocal('shoppingList', state.shoppingList.map(s => s.id === id ? merged : s));
      return merged;
    }

    dispatch({ type: 'UPDATE_SHOPPING', payload: merged });
    const { data, error } = await supabase.from('shopping_list').update(updates).eq('id', id).select().single();
    if (error) { dispatch({ type: 'UPDATE_SHOPPING', payload: prev }); throw error; }
    dispatch({ type: 'UPDATE_SHOPPING', payload: data });
    return data;
  }

  async function deleteShoppingItem(id) {
    const prev = state.shoppingList.find(s => s.id === id);

    if (DEMO_MODE) {
      dispatch({ type: 'DELETE_SHOPPING', payload: id });
      saveLocal('shoppingList', state.shoppingList.filter(s => s.id !== id));
      return;
    }

    dispatch({ type: 'DELETE_SHOPPING', payload: id });
    const { error } = await supabase.from('shopping_list').delete().eq('id', id);
    if (error) { dispatch({ type: 'ADD_SHOPPING', payload: prev }); throw error; }
  }

  async function bulkAddShoppingItems(items) {
    if (DEMO_MODE) {
      const withIds = items.map(i => ({ ...i, id: genId('shop'), user_id: DEMO_USER_ID, created_at: new Date().toISOString() }));
      const next = [...withIds, ...state.shoppingList];
      dispatch({ type: 'SET_SHOPPING', payload: next });
      saveLocal('shoppingList', next);
      return withIds;
    }
    const withUser = items.map(i => ({ ...i, user_id: userId }));
    const { data, error } = await supabase.from('shopping_list').insert(withUser).select();
    if (error) throw error;
    dispatch({ type: 'SET_SHOPPING', payload: [...data, ...state.shoppingList] });
    return data;
  }

  return (
    <WardrobeContext.Provider value={{
      ...state,
      addItem, updateItem, deleteItem, bulkAddItems, markWorn, markClean,
      addOutfit, deleteOutfit, updateOutfit,
      addShoppingItem, updateShoppingItem, deleteShoppingItem, bulkAddShoppingItems,
      refetch: fetchAll,
    }}>
      {children}
    </WardrobeContext.Provider>
  );
}

export const useWardrobe = () => useContext(WardrobeContext);

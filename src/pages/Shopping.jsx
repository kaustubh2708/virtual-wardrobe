import { useState, useMemo, useEffect } from 'react';
import { useWardrobe } from '../context/WardrobeContext';
import BudgetBar from '../components/shopping/BudgetBar';
import ShoppingItem from '../components/shopping/ShoppingItem';
import AddShoppingModal from '../components/shopping/AddShoppingModal';
import FAB from '../components/ui/FAB';
import { RESET_SHOPPING_LIST, SHOPPING_STATUSES } from '../constants/categories';
import { useUser } from '../context/UserContext';

const STATUS_LABELS = { ToBuy: 'To Buy', Wishlist: 'Wishlist', Bought: 'Bought' };

export default function Shopping() {
  const { shoppingList, addShoppingItem, updateShoppingItem, deleteShoppingItem, bulkAddShoppingItems } = useWardrobe();
  const { profile } = useUser();
  const [addOpen, setAddOpen] = useState(false);
  const [filter, setFilter] = useState('ToBuy');
  const [seeded, setSeeded] = useState(false);

  // Seed shopping list on first load if empty
  useEffect(() => {
    if (!seeded && shoppingList.length === 0) {
      setSeeded(true);
      bulkAddShoppingItems(RESET_SHOPPING_LIST).catch(() => {});
    }
  }, [shoppingList.length, seeded, bulkAddShoppingItems]);

  const budget = profile?.budget_inr || 15000;
  const spent = useMemo(() =>
    shoppingList.filter(i => i.status === 'Bought').reduce((s, i) => s + (i.actual_price_inr || i.estimated_price_inr || 0), 0),
    [shoppingList]
  );
  const planned = useMemo(() =>
    shoppingList.filter(i => i.status === 'ToBuy').reduce((s, i) => s + (i.estimated_price_inr || 0), 0),
    [shoppingList]
  );

  const filtered = useMemo(() =>
    shoppingList.filter(i => i.status === filter),
    [shoppingList, filter]
  );

  async function handleToggle(id, newStatus) {
    const updates = { status: newStatus };
    if (newStatus === 'Bought') updates.bought_at = new Date().toISOString();
    await updateShoppingItem(id, updates);
  }

  async function handleDelete(id) {
    if (!window.confirm('Remove this item?')) return;
    await deleteShoppingItem(id);
  }

  return (
    <div className="flex flex-col min-h-screen lg:min-h-0 bg-bg lg:rounded-2xl lg:overflow-hidden lg:border lg:border-border lg:shadow-sm">
      <div className="bg-primary text-white px-5 pt-12 pb-4 lg:pt-8 lg:rounded-t-2xl">
        <h1 className="text-xl font-bold mb-1">Shopping</h1>
        <p className="text-white/60 text-xs">{shoppingList.filter(i => i.status !== 'Bought').length} items to buy</p>
      </div>

      <div className="px-4 pt-4">
        <BudgetBar total={budget} spent={spent} planned={planned} />
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-border bg-surface mx-4 mt-4 rounded-xl overflow-hidden">
        {SHOPPING_STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`flex-1 py-2.5 text-xs font-bold transition-colors ${
              filter === s ? 'text-primary bg-accent-light' : 'text-muted'
            }`}
          >
            {STATUS_LABELS[s]}
            <span className="ml-1 text-[10px] opacity-60">
              ({shoppingList.filter(i => i.status === s).length})
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 px-4 py-4 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-5xl mb-3">{filter === 'Bought' ? '🎉' : '🛍️'}</span>
            <p className="text-sm text-muted">
              {filter === 'Bought' ? 'Nothing bought yet.' : `No items in ${STATUS_LABELS[filter]}.`}
            </p>
          </div>
        ) : (
          filtered.map(item => (
            <ShoppingItem
              key={item.id}
              item={item}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      <FAB onClick={() => setAddOpen(true)} />
      <AddShoppingModal open={addOpen} onClose={() => setAddOpen(false)} onSave={addShoppingItem} />
    </div>
  );
}

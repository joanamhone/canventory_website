// src/pages/Inventory.tsx
import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash,
  Package,
  History,
  Info,
  X,
  Check,
  AlertTriangle
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { InventoryItem, InventoryTransaction, InventoryItemCategory, InventoryTransactionType, InventoryReferenceType } from '../types/inventory'; // Added specific type imports
import toast from 'react-hot-toast';
import { format } from 'date-fns';

// Initial data for adding/editing inventory items
const initialInventoryItemData = {
  name: '',
  category: '' as InventoryItemCategory, // Explicitly type category
  supplier: '',
  currentStock: '',
  unit: '',
  unitCost: '',
  reorderLevel: '',
  reorderQuantity: '',
  notes: '',
};

// Initial data for adding inventory transactions
const initialTransactionData = {
  type: 'addition' as InventoryTransactionType, // Explicitly type
  quantity: '',
  reason: '',
  referenceId: '', // For linking to treatments/purchases etc.
  referenceType: 'manual' as InventoryReferenceType, // 'manual', 'treatment', 'purchase'
};

const Inventory: React.FC = () => {
  const {
    inventoryItems,
    inventoryTransactions,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addInventoryTransaction,
    user, // Get current user for createdBy
  } = useAppContext();

  // State for controlling modals
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showItemDetails, setShowItemDetails] = useState(false);

  // State for search term
  const [searchTerm, setSearchTerm] = useState('');

  // State for item data when adding/editing
  const [itemData, setItemData] = useState(initialInventoryItemData);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // State for transaction data
  const [transactionData, setTransactionData] = useState(initialTransactionData);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);

  // Filtered inventory items based on search term
  const filteredInventoryItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.supplier ?? '').toLowerCase().includes(searchTerm.toLowerCase()) // Handle undefined/null supplier
  );

  // Handler for item form input changes
  const handleItemInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'category') {
      setItemData(prev => ({ ...prev, [name]: value as InventoryItemCategory }));
    } else {
      setItemData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handler for transaction form input changes
  const handleTransactionInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'type') {
      setTransactionData(prev => ({ ...prev, [name]: value as InventoryTransactionType }));
    } else if (name === 'referenceType') {
      setTransactionData(prev => ({ ...prev, [name]: value as InventoryReferenceType }));
    } else {
      setTransactionData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Submit handler for adding/editing inventory item
  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Authentication required.');
      return;
    }

    const formattedData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'> = {
      name: itemData.name,
      category: itemData.category,
      supplier: itemData.supplier === '' ? null : itemData.supplier, // Convert empty string to null
      currentStock: parseInt(itemData.currentStock, 10),
      unit: itemData.unit,
      unitCost: parseFloat(itemData.unitCost),
      reorderLevel: parseInt(itemData.reorderLevel, 10),
      reorderQuantity: parseInt(itemData.reorderQuantity, 10),
      notes: itemData.notes === '' ? null : itemData.notes,
      type: ''
    };

    if (editingItem) {
      const updatePayload: Partial<InventoryItem> = {
        name: formattedData.name,
        category: formattedData.category,
        supplier: formattedData.supplier,
        currentStock: formattedData.currentStock,
        unit: formattedData.unit,
        unitCost: formattedData.unitCost,
        reorderLevel: formattedData.reorderLevel,
        reorderQuantity: formattedData.reorderQuantity,
        notes: formattedData.notes,
      };
      await updateInventoryItem(editingItem.id, updatePayload);
      setEditingItem(null);
    } else {
      await addInventoryItem(formattedData);
    }
    setItemData(initialInventoryItemData);
    setShowAddItemForm(false);
  };

  // Submit handler for adding inventory transaction
  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedInventoryItem || !user) {
      toast.error('Please select an inventory item and ensure you are logged in.');
      return;
    }

    const quantity = parseInt(transactionData.quantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error('Please enter a valid quantity.');
      return;
    }

    const transactionToSubmit: Omit<InventoryTransaction, 'id' | 'createdAt' | 'balance'> = {
      inventoryItemId: selectedInventoryItem.id,
      type: transactionData.type,
      quantity: quantity,
      reason: transactionData.reason,
      referenceId: transactionData.referenceId || null, // Ensure it's string or null
      referenceType: transactionData.referenceType || 'manual',
      createdBy: user.id,
    };

    await addInventoryTransaction(transactionToSubmit);
    setTransactionData(initialTransactionData);
    setSelectedInventoryItem(null);
    setShowTransactionForm(false);
  };

  // Function to get transaction history for a specific item
  const getItemTransactions = (itemId: string) => {
    return inventoryTransactions
      .filter(transaction => transaction.inventoryItemId === itemId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by most recent
  };

  return (
    <div className="space-y-6">
      {/* Header and Buttons */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-black">Inventory</h1>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowTransactionForm(true);
              setSelectedInventoryItem(null); // Ensure no item is pre-selected
            }}
            className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary-700 transition-colors"
          >
            <History size={18} />
            <span>Add Transaction</span>
          </button>
          <button
            onClick={() => {
              setShowAddItemForm(true);
              setEditingItem(null); // Clear editing state
              setItemData(initialInventoryItemData); // Reset form
            }}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={18} />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search inventory by name, category, or supplier..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm"
        />
        <Search size={18} className="absolute left-3 top-2.5 text-gray-500" />
      </div>

      {/* Inventory List Table */}
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        {filteredInventoryItems.length === 0 ? (
          <div className="p-8 text-center">
            <Package size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb -1 ">No inventory items found</h3>
            <p className="text-gray-500 ">
              {searchTerm
                ? `No results for "${searchTerm}"`
                : "You haven't added any inventory items yet"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-3 text-primary hover:text-primary-700"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50 text-gray-700 text-sm">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Item Name</th>
                  <th className="px-6 py-3 text-left font-medium">Category</th>
                  <th className="px-6 py-3 text-left font-medium">Supplier</th>
                  <th className="px-6 py-3 text-left font-medium">Current Stock</th>
                  <th className="px-6 py-3 text-left font-medium">Unit Cost</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInventoryItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      {item.currentStock <= item.reorderLevel && (
                        <div className="flex items-center gap-1 text-xs text-error mt-1">
                          <AlertTriangle size={12} />
                          <span>Low Stock! Reorder Level: {item.reorderLevel}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 capitalize">{item.category}</td>
                    <td className="px-6 py-4 text-gray-500 ">{item.supplier || '-'}</td>
                    <td className="px-6 py-4 text-gray-500 ">{item.currentStock} {item.unit}</td>
                    {/* Fixed: Use nullish coalescing to ensure unitCost is a number before toFixed */}
                    <td className="px-6 py-4 text-gray-500 ">K{(item.unitCost ?? 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Add Transaction Button for specific item */}
                        <button
                          onClick={() => {
                            setSelectedInventoryItem(item);
                            setTransactionData(initialTransactionData); // Reset transaction form
                            setShowTransactionForm(true);
                          }}
                          className="p-1 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100"
                          title="Add Transaction"
                        >
                          <History size={18} />
                        </button>
                        {/* Edit Item Button */}
                        <button
                          className="p-1 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100"
                          onClick={() => {
                            setEditingItem(item);
                            setItemData({
                              name: item.name,
                              category: item.category,
                              supplier: item.supplier || '', // Ensure string for input
                              currentStock: item.currentStock.toString(),
                              unit: item.unit,
                              unitCost: item.unitCost.toString(),
                              reorderLevel: item.reorderLevel.toString(),
                              reorderQuantity: item.reorderQuantity.toString(),
                              notes: item.notes || '', // Ensure string for input
                            });
                            setShowAddItemForm(true);
                          }}
                          title="Edit Item"
                        >
                          <Edit size={18} />
                        </button>
                        {/* Delete Item Button */}
                        <button
                          onClick={() => deleteInventoryItem(item.id)}
                          className="p-1 text-gray-500 hover:text-error rounded-full hover:bg-gray-100"
                          title="Delete Item"
                        >
                          <Trash size={18} />
                        </button>
                        {/* View Details Button */}
                        <button
                          onClick={() => {
                            setSelectedInventoryItem(item);
                            setShowItemDetails(true);
                          }}
                          className="p-1 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100"
                          title="View Details"
                        >
                          <Info size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Item Modal */}
      {showAddItemForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          {/* Main modal content container with responsiveness */}
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md flex flex-col max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-800">
                {editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
              </h2>
              <button
                onClick={() => setShowAddItemForm(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form Content - now scrolls if needed */}
            <form onSubmit={handleItemSubmit} className="p-4 flex-grow overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={itemData.name}
                    onChange={handleItemInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={itemData.category}
                    onChange={handleItemInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="">-- Select Category --</option>
                    <option value="medication">Medication</option>
                    <option value="supply">Supply</option>
                    <option value="equipment">Equipment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier
                  </label>
                  <input
                    type="text"
                    name="supplier"
                    value={itemData.supplier}
                    onChange={handleItemInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Stock
                    </label>
                    <input
                      type="number"
                      name="currentStock"
                      value={itemData.currentStock}
                      onChange={handleItemInputChange}
                      required
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit
                    </label>
                    <input
                      type="text"
                      name="unit"
                      value={itemData.unit}
                      onChange={handleItemInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Cost (K)
                  </label>
                  <input
                    type="number"
                    name="unitCost"
                    value={itemData.unitCost}
                    onChange={handleItemInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reorder Level
                    </label>
                    <input
                      type="number"
                      name="reorderLevel"
                      value={itemData.reorderLevel}
                      onChange={handleItemInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reorder Quantity
                    </label>
                    <input
                      type="number"
                      name="reorderQuantity"
                      value={itemData.reorderQuantity}
                      onChange={handleItemInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={itemData.notes ?? ''} // Use nullish coalescing for notes
                    onChange={handleItemInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                  ></textarea>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddItemForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  <Check size={16} />
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
           {/* Add Transaction Modal */}
      {showTransactionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          {/* Main modal content container with responsiveness */}
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md flex flex-col max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-800">Add Inventory Transaction</h2>
              <button
                onClick={() => setShowTransactionForm(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form Content - now scrolls if needed */}
            <form onSubmit={handleTransactionSubmit} className="p-4 flex-grow overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Item
                  </label>
                  <select
                    name="inventoryItemId"
                    value={selectedInventoryItem?.id || ''}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setSelectedInventoryItem(inventoryItems.find(item => item.id === selectedId) || null);
                    }}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="">-- Select an item --</option>
                    {inventoryItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} (Current Stock: {item.currentStock} {item.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Type
                  </label>
                  <select
                    name="type"
                    value={transactionData.type}
                    onChange={handleTransactionInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="addition">Addition</option>
                    <option value="deduction">Deduction</option>
                    <option value="adjustment">Adjustment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={transactionData.quantity}
                    onChange={handleTransactionInputChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason
                  </label>
                  <textarea
                    name="reason"
                    value={transactionData.reason}
                    onChange={handleTransactionInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference ID (Optional)
                  </label>
                  <input
                    type="text"
                    name="referenceId"
                    value={transactionData.referenceId}
                    onChange={handleTransactionInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference Type
                  </label>
                  <select
                    name="referenceType"
                    value={transactionData.referenceType}
                    onChange={handleTransactionInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="manual">Manual</option>
                    <option value="treatment">Treatment</option>
                    <option value="purchase">Purchase</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowTransactionForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-700 transition-colors flex items-center gap-2"
                >
                  <Check size={16} />
                  Record Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


            {/* Item Details Modal */}
      {showItemDetails && selectedInventoryItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Item Details: {selectedInventoryItem.name}</h2>
              <button
                onClick={() => setShowItemDetails(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Item Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                <div>
                  <p className="font-medium">Category:</p>
                  <p className="capitalize">{selectedInventoryItem.category}</p>
                </div>
                <div>
                  <p className="font-medium">Supplier:</p>
                  <p>{selectedInventoryItem.supplier || '-'}</p>
                </div>
                <div>
                  <p className="font-medium">Current Stock:</p>
                  <p className={`${selectedInventoryItem.currentStock <= selectedInventoryItem.reorderLevel ? 'text-error font-semibold' : ''}`}>
                    {selectedInventoryItem.currentStock} {selectedInventoryItem.unit}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Unit Cost:</p>
                  <p>K{(selectedInventoryItem.unitCost ?? 0).toFixed(2)}</p> {/* Fixed here */}
                </div>
                <div>
                  <p className="font-medium">Reorder Level:</p>
                  <p>{selectedInventoryItem.reorderLevel} {selectedInventoryItem.unit}</p>
                </div>
                <div>
                  <p className="font-medium">Reorder Quantity:</p>
                  <p>{selectedInventoryItem.reorderQuantity} {selectedInventoryItem.unit}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="font-medium">Notes:</p>
                  <p>{selectedInventoryItem.notes || 'N/A'}</p>
                </div>
              </div>

              {/* Transaction History */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Transaction History</h3>
                {getItemTransactions(selectedInventoryItem.id).length === 0 ? (
                  <p className="text-gray-500">No transactions recorded for this item.</p>
                ) : (
                  <div className="space-y-3">
                    {getItemTransactions(selectedInventoryItem.id).map(transaction => (
                      <div key={transaction.id} className="bg-gray-50 p-3 rounded-md">
                        <div className="flex justify-between items-center mb-1">
                          <span className={`font-medium capitalize ${
                            transaction.type === 'addition' ? 'text-green-600' :
                            transaction.type === 'deduction' ? 'text-error' :
                            'text-yellow-700'
                          }`}>
                            {transaction.type}
                          </span>
                          <span className="text-sm text-gray-500">
                            {format(new Date(transaction.createdAt), 'PPP p')}
                          </span>
                        </div>
                        <p className="text-gray-700">
                          Quantity: {transaction.quantity} {selectedInventoryItem.unit}
                        </p>
                        <p className="text-gray-700">
                          New Balance: {transaction.balance} {selectedInventoryItem.unit}
                        </p>
                        <p className="text-gray-500 text-sm">Reason: {transaction.reason || 'N/A'}</p>
                        {transaction.referenceId && (
                          <p className="text-gray-500 text-sm">
                            Reference: {transaction.referenceType} ({transaction.referenceId})
                          </p>
                        )}
                        <p className="text-gray-500 text-sm">
                          Recorded by: {transaction.createdBy || 'N/A'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Inventory;

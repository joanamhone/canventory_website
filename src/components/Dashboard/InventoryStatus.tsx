import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Package, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const InventoryStatus: React.FC = () => {
  const { inventoryItems } = useAppContext();
  const navigate = useNavigate(); // Initialize useNavigate

  // Get low stock items
  const lowStockItems = inventoryItems.filter(
    item => item.currentStock <= item.reorderLevel
  );

  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Inventory Status</h3>
          <span className="text-xs text-gray-500">
            {lowStockItems.length} items need attention
          </span>
        </div>
      </div>

      <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
        {lowStockItems.length === 0 ? (
          <div className="p-6 text-center">
            <Package size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">All inventory items are at healthy levels</p>
          </div>
        ) : (
          lowStockItems.map(item => (
            <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-error/10 flex items-center justify-center mr-3">
                    <AlertTriangle size={18} className="text-error" />
                  </div>
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-500">
                      {item.currentStock} {item.unit} remaining
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-medium">
                    Reorder Level: {item.reorderLevel}
                  </div>
                  <button
                    onClick={() => navigate('/inventory')} // Navigate to the inventory page
                    className="text-xs text-primary hover:text-primary-700 font-medium"
                  >
                    Order Now
                  </button>
                </div>
              </div>

              {/* Progress bar showing stock level */}
              <div className="mt-2 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    item.currentStock <= item.reorderLevel / 2
                      ? 'bg-error'
                      : 'bg-warning'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      (item.currentStock / item.reorderLevel) * 100
                    )}%`
                  }}
                ></div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <button
          onClick={() => navigate('/inventory')} // Navigate to the inventory page
          className="text-sm text-primary hover:text-primary-700 font-medium"
        >
          View All Inventory
        </button>
      </div>
    </div>
  );
};

export default InventoryStatus;

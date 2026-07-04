import { Link } from 'react-router-dom'
import useCart from '../hooks/useCart'
import { HiX, HiMinus, HiPlus, HiTrash } from 'react-icons/hi'

export default function CartDrawer({ open, onClose }) {
  const { items, subtotal, shippingCost, discount, total, itemCount, update, remove } = useCart()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-heading text-xl">Cart ({itemCount})</h2>
          <button onClick={onClose}><HiX size={24} /></button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Your cart is empty</p>
          ) : (
            items.map((item, idx) => (
              <div key={`${item.product._id}-${item.size}-${idx}`} className="flex gap-4 border-b pb-4">
                <img src={item.product.images?.[0] || '/placeholder.png'} alt={item.product.name} className="w-20 h-20 object-cover rounded" />
                <div className="flex-1">
                  <Link to={`/product/${item.product._id}`} className="font-medium hover:text-primary-600">{item.product.name}</Link>
                  <p className="text-sm text-gray-500">Size: {item.size}</p>
                  <p className="font-semibold">₹{item.product.salePrice?.toLocaleString('en-IN')}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => item.quantity > 1 && update(item.product._id, item.size, item.quantity - 1)} className="p-1 border rounded hover:bg-gray-100"><HiMinus size={14} /></button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button onClick={() => update(item.product._id, item.size, item.quantity + 1)} className="p-1 border rounded hover:bg-gray-100"><HiPlus size={14} /></button>
                    <button onClick={() => remove(item.product._id, item.size)} className="ml-auto text-red-500 hover:text-red-700"><HiTrash size={16} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t p-4 space-y-2">
            <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
            {discount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span>-₹{discount.toLocaleString('en-IN')}</span></div>}
            <div className="flex justify-between text-sm"><span>Shipping</span><span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span></div>
            <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
            <Link to="/checkout" onClick={onClose} className="btn-primary block text-center mt-4">Checkout</Link>
          </div>
        )}
      </div>
    </div>
  )
}

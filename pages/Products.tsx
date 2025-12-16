
import React, { useEffect, useState, useMemo } from 'react';
import { Card } from '../components/Card';
import { Table, TableColumn } from '../components/Table';
import { Product } from '../types';
import { apiService } from '../services/apiService';
import { Button } from '../components/Button';
import { useNotifications } from '../context/NotificationContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const { showNotification } = useNotifications();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const fetchedProducts = await apiService.getProducts();
        setProducts(fetchedProducts);
      } catch (error) {
        showNotification('Failed to fetch products.', 'error');
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddProduct = () => {
    setCurrentProduct(null); // Clear current product for adding new
    setIsFormModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setIsFormModalOpen(true);
  };

  const handleSaveProduct = async (formData: Product) => {
    setIsSaving(true);
    try {
      if (formData.id) {
        await apiService.updateProduct(formData.id, formData);
        setProducts(prev => prev.map(p => (p.id === formData.id ? formData : p)));
        showNotification(`Product "${formData.name}" updated successfully!`, 'success');
      } else {
        const newProduct = await apiService.addProduct(formData);
        setProducts(prev => [...prev, newProduct]);
        showNotification(`Product "${formData.name}" added successfully!`, 'success');
      }
      setIsFormModalOpen(false);
    } catch (error) {
      showNotification(`Failed to save product.`, 'error');
      console.error('Error saving product:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirmation = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await apiService.deleteProduct(productToDelete.id);
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      showNotification(`Product "${productToDelete.name}" deleted successfully!`, 'success');
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      showNotification(`Failed to delete product "${productToDelete.name}".`, 'error');
      console.error('Error deleting product:', error);
    } finally {
      setIsDeleting(false);
    }
  };


  const availableCategories = useMemo(() => {
    const categories = new Set(products.map(p => p.category));
    return ['all', ...Array.from(categories)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (filterCategory !== 'all') {
      filtered = filtered.filter(product => product.category === filterCategory);
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        product.description.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
    return filtered;
  }, [products, filterCategory, searchTerm]);

  const columns: TableColumn<Product>[] = [
    {
      key: 'images',
      header: 'Image',
      render: (product) => (
        <img
          src={product.images[0] || 'https://picsum.photos/50/50'}
          alt={product.name}
          className="h-12 w-12 object-cover rounded-md"
        />
      ),
      className: 'w-16'
    },
    { key: 'name', header: 'Product Name', className: 'font-semibold' },
    { key: 'category', header: 'Category' },
    {
      key: 'price',
      header: 'Price',
      render: (product) => `$${product.price.toFixed(2)}`,
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (product) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            product.stock > 20 ? 'bg-green-100 text-green-800' :
            product.stock > 0 ? 'bg-orange-100 text-orange-800' :
            'bg-red-100 text-red-800'
          }`}
        >
          {product.stock}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (product) => (
        <div className="flex space-x-2">
          <Button onClick={() => handleEditProduct(product)} variant="secondary" size="sm">
            Edit
          </Button>
          <Button onClick={() => handleDeleteConfirmation(product)} variant="danger" size="sm">
            Delete
          </Button>
        </div>
      ),
      className: 'min-w-[150px]'
    },
  ];

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
        <input
          type="text"
          placeholder="Search products..."
          className="p-2 border border-gray-300 rounded-md w-full sm:w-auto flex-grow max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-2 border border-gray-300 rounded-md w-full sm:w-auto"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          {availableCategories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>
        <Button onClick={handleAddProduct} variant="primary">
          Add New Product
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <Table data={filteredProducts} columns={columns} emptyMessage="No products found." />
      )}

      {/* Product Add/Edit Modal */}
      {isFormModalOpen && (
        <ProductForm
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSave={handleSaveProduct}
          product={currentProduct}
          isSaving={isSaving}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirm Delete"
        >
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete product "<strong>{productToDelete?.name}</strong>"? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setIsDeleteModalOpen(false)} variant="outline" disabled={isDeleting}>
              Cancel
            </Button>
            <Button onClick={handleDeleteProduct} variant="danger" isLoading={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </Modal>
      )}
    </Card>
  );
};

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  product: Product | null;
  isSaving: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ isOpen, onClose, onSave, product, isSaving }) => {
  const [formData, setFormData] = useState<Product>(
    product || {
      id: '',
      name: '',
      description: '',
      price: 0,
      stock: 0,
      images: [],
      category: '',
    }
  );
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const { showNotification } = useNotifications();


  useEffect(() => {
    if (product) {
      setFormData(product);
      setImageFiles([]); // Clear file input when editing existing product
    } else {
      setFormData({
        id: '',
        name: '',
        description: '',
        price: 0,
        stock: 0,
        images: [],
        category: '',
      });
      setImageFiles([]);
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleImageUpload = async (): Promise<string[]> => {
    if (imageFiles.length === 0) {
      return formData.images; // If no new files, return existing images
    }

    const uploadedImageUrls: string[] = [];
    for (const file of imageFiles) {
      // Simulate image upload by creating a data URL or using a placeholder
      const reader = new FileReader();
      const promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          resolve(reader.result as string); // In a real app, this would be a URL from a server
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      uploadedImageUrls.push(await promise);
    }
    // For simplicity, replacing existing images with new ones or adding to them.
    // In a real app, you might distinguish between new uploads and existing images.
    return uploadedImageUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.price <= 0 || formData.stock < 0 || !formData.name || !formData.category) {
      showNotification('Please fill in all required fields and ensure price/stock are valid.', 'error');
      return;
    }

    // Fix: Remove setIsSaving(true) call. Parent `Products` component manages `isSaving` via `onSave`.
    try {
      const updatedImageUrls = await handleImageUpload();
      const productToSave: Product = { ...formData, images: updatedImageUrls };
      onSave(productToSave);
    } catch (error) {
      showNotification('Failed to upload images.', 'error');
      console.error('Error during image upload:', error);
    } finally {
      // Fix: Remove setIsSaving(false) call. Parent `Products` component manages `isSaving` via `onSave`.
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product ? 'Edit Product' : 'Add New Product'} className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            id="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price ($)</label>
            <input
              type="number"
              name="price"
              id="price"
              value={formData.price}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock</label>
            <input
              type="number"
              name="stock"
              id="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              name="category"
              id="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div>
          <label htmlFor="images" className="block text-sm font-medium text-gray-700">Product Images</label>
          <input
            type="file"
            name="images"
            id="images"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-md file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
          />
          {formData.images.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Product image ${index + 1}`}
                  className="h-20 w-20 object-cover rounded-md border border-gray-200"
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSaving}>
            {isSaving ? 'Saving...' : 'Save Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
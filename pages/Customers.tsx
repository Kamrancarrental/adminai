
import React, { useEffect, useState, useMemo } from 'react';
import { Card } from '../components/Card';
import { Table, TableColumn } from '../components/Table';
import { Customer } from '../types';
import { apiService } from '../services/apiService';
import { Button } from '../components/Button';
import { useNotifications } from '../context/NotificationContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { showNotification } = useNotifications();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const fetchedCustomers = await apiService.getCustomers();
        setCustomers(fetchedCustomers);
      } catch (error) {
        showNotification('Failed to fetch customers.', 'error');
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditCustomer = (customer: Customer) => {
    setCurrentCustomer(customer);
    setIsModalOpen(true);
  };

  const handleAddCustomer = () => {
    setCurrentCustomer(null); // Clear current customer for adding new
    setIsModalOpen(true);
  };

  const handleSaveCustomer = async (formData: Customer) => {
    setIsSaving(true);
    try {
      if (formData.id) {
        await apiService.updateCustomer(formData.id, formData);
        setCustomers(prev => prev.map(c => (c.id === formData.id ? formData : c)));
        showNotification(`Customer ${formData.name} updated successfully!`, 'success');
      } else {
        const newCustomer = await apiService.addCustomer(formData);
        setCustomers(prev => [...prev, newCustomer]);
        showNotification(`Customer ${formData.name} added successfully!`, 'success');
      }
      setIsModalOpen(false);
    } catch (error) {
      showNotification(`Failed to save customer.`, 'error');
      console.error('Error saving customer:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) {
      return customers;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      customer.email.toLowerCase().includes(lowerCaseSearchTerm) ||
      customer.phone.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [customers, searchTerm]);


  const columns: TableColumn<Customer>[] = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'totalOrders', header: 'Total Orders' },
    {
      key: 'totalSpent',
      header: 'Total Spent',
      render: (customer) => `$${customer.totalSpent.toFixed(2)}`,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (customer) => (
        <div className="flex space-x-2">
          <Button onClick={() => handleEditCustomer(customer)} variant="secondary" size="sm">
            Edit
          </Button>
          <Button variant="outline" size="sm">
            View Orders
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
          placeholder="Search customers..."
          className="p-2 border border-gray-300 rounded-md w-full sm:w-auto flex-grow max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button onClick={handleAddCustomer} variant="primary">
          Add New Customer
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <Table data={filteredCustomers} columns={columns} emptyMessage="No customers found." />
      )}

      {isModalOpen && (
        <CustomerForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCustomer}
          customer={currentCustomer}
          isSaving={isSaving}
        />
      )}
    </Card>
  );
};

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => void;
  customer: Customer | null;
  isSaving: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ isOpen, onClose, onSave, customer, isSaving }) => {
  const [formData, setFormData] = useState<Customer>(
    customer || {
      id: '',
      name: '',
      email: '',
      phone: '',
      address: '',
      totalOrders: 0,
      totalSpent: 0,
    }
  );

  useEffect(() => {
    if (customer) {
      setFormData(customer);
    } else {
      setFormData({
        id: '',
        name: '',
        email: '',
        phone: '',
        address: '',
        totalOrders: 0,
        totalSpent: 0,
      });
    }
  }, [customer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={customer ? 'Edit Customer' : 'Add New Customer'}>
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
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            name="phone"
            id="phone"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
          <textarea
            name="address"
            id="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSaving}>
            {isSaving ? 'Saving...' : 'Save Customer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

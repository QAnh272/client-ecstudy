'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { api } from '@/lib/api';
import { WalletOutlined, PlusOutlined, HistoryOutlined } from '@ant-design/icons';

interface Wallet {
  id: string;
  balance: number;
  user_id: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  created_at: string;
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [showDepositForm, setShowDepositForm] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const [walletRes, transactionsRes] = await Promise.all([
        api.get<{ success: boolean; data: Wallet }>('/api/wallet'),
        api.get<{ success: boolean; data: Transaction[] }>('/api/wallet/transactions')
      ]);

      if (walletRes.success) {
        setWallet(walletRes.data);
      }
      if (transactionsRes.success) {
        setTransactions(transactionsRes.data);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    try {
      await api.post('/api/wallet/deposit', { amount });
      setDepositAmount('');
      setShowDepositForm(false);
      await loadWalletData();
    } catch (error) {
      console.error('Error depositing:', error);
      alert('Có lỗi xảy ra khi nạp tiền');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + 'đ';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl text-black font-bold mb-6 md:mb-8">Ví của tôi</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Wallet Balance Card */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-lg p-5 md:p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <WalletOutlined style={{ fontSize: '28px' }} className="md:text-[32px]" />
                <h2 className="text-lg md:text-xl font-bold">Số dư ví</h2>
              </div>
              
              <div className="mb-6">
                <p className="text-sm opacity-90 mb-2">Số dư hiện tại</p>
                <p className="text-3xl md:text-4xl font-bold">
                  {wallet ? formatPrice(wallet.balance) : '0đ'}
                </p>
              </div>

              <button
                onClick={() => setShowDepositForm(!showDepositForm)}
                className="w-full bg-white text-blue-600 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm md:text-base"
              >
                <PlusOutlined /> Nạp tiền
              </button>
            </div>

            {/* Deposit Form */}
            {showDepositForm && (
              <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mt-4">
                <h3 className="font-bold text-black text-base md:text-lg mb-4">Nạp tiền vào ví</h3>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Nhập số tiền"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-black"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleDeposit}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Xác nhận
                  </button>
                  <button
                    onClick={() => {
                      setShowDepositForm(false);
                      setDepositAmount('');
                    }}
                    className="flex-1 border border-gray-300 text-black py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Transaction History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <div className="flex items-center gap-3">
                  <HistoryOutlined style={{ fontSize: '24px', color: '#000' }} />
                  <h2 className="font-bold text-black text-lg">Lịch sử giao dịch</h2>
                </div>
              </div>

              {transactions.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  Chưa có giao dịch nào
                </div>
              ) : (
                <div className="divide-y">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-black mb-1">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}
                          {formatPrice(transaction.amount)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {transaction.type === 'credit' ? 'Nạp tiền' : 'Thanh toán'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

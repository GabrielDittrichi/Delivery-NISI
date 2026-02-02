'use client'

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, CreditCard, Banknote, QrCode, Store, Bike } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

type PaymentMethod = 'PIX' | 'MONEY' | 'CREDIT' | 'DEBIT';
type DeliveryMethod = 'DELIVERY' | 'PICKUP';

import { createOrder } from '@/lib/analytics';

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('DELIVERY');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    paymentMethod: 'PIX' as PaymentMethod,
    observations: ''
  });

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; type: string; value: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponMessage(null);

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: couponCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setCouponMessage({ type: 'error', text: data.message });
        setDiscount(0);
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(data);
        
        // Calculate discount
        let discountValue = 0;
        if (data.type === 'PERCENTAGE') {
            discountValue = (cartTotal * data.value) / 100;
        } else {
            discountValue = data.value;
        }
        
        // Ensure discount doesn't exceed total
        discountValue = Math.min(discountValue, cartTotal);
        
        setDiscount(discountValue);
        setCouponMessage({ type: 'success', text: `Cupom ${data.code} aplicado com sucesso!` });
      }
    } catch (error) {
      setCouponMessage({ type: 'error', text: 'Erro ao validar cupom' });
      setDiscount(0);
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCepBlur = async () => {
    const cep = formData.cep.replace(/\D/g, '');
    if (cep.length !== 8) {
        return;
    }

    setCepLoading(true);
    setCepError('');
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (data.erro) {
            setCepError('CEP não encontrado');
        } else {
            setFormData(prev => ({
                ...prev,
                street: data.logradouro,
                neighborhood: data.bairro,
                city: data.localidade,
                state: data.uf
            }));
        }
    } catch (error) {
        setCepError('Erro ao buscar CEP');
    } finally {
        setCepLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
        alert('Seu carrinho está vazio');
        return;
    }

    setIsSubmitting(true);
    
    // Preparar dados do pedido
    const orderData = {
        ...formData,
        deliveryMethod,
        subtotal: cartTotal,
        deliveryFee: 0, // Taxa calculada no atendimento
        discount: discount,
        total: Math.max(0, cartTotal - discount),
        items: items
    };

    // Salvar no banco
    const result = await createOrder(orderData);
    
    if (result && result.success) {
        // Gerar mensagem para WhatsApp
        const addressText = deliveryMethod === 'DELIVERY' 
            ? `*Endereço de Entrega:*\n${formData.street}, ${formData.number}\n${formData.neighborhood}, ${formData.city} - ${formData.state}\n${formData.complement ? `Comp: ${formData.complement}` : ''}`
            : `*Retirada no Local*`;

        const message = `
*NOVO PEDIDO #${result.orderId?.slice(-6)}*
--------------------------------
*Cliente:* ${formData.name}
*Telefone:* ${formData.phone}
*Tipo:* ${deliveryMethod === 'DELIVERY' ? 'Entrega' : 'Retirada'}

${addressText}

*Itens:*
${items.map(item => `
${item.quantity}x ${item.name}
${item.selectedFlavor ? `Sabor: ${item.selectedFlavor}` : ''}
${item.selectedAddons && item.selectedAddons.length > 0 ? `Adicionais: ${item.selectedAddons.join(', ')}` : ''}
R$ ${(item.price * item.quantity).toFixed(2)}
`).join('')}

*Resumo:*
Subtotal: R$ ${cartTotal.toFixed(2)}
${deliveryMethod === 'DELIVERY' ? 'Entrega: A combinar' : ''}
${discount > 0 ? `Desconto: -R$ ${discount.toFixed(2)}\n` : ''}
*Total: R$ ${orderData.total.toFixed(2)}* ${deliveryMethod === 'DELIVERY' ? '(+ frete)' : ''}

*Pagamento:* ${formData.paymentMethod}
${formData.observations ? `\n*Obs:* ${formData.observations}` : ''}
        `.trim();

        const whatsappUrl = `https://wa.me/5599999999999?text=${encodeURIComponent(message)}`;
        
        clearCart();
        window.open(whatsappUrl, '_blank');
        router.push('/');
    } else {
        alert('Erro ao processar pedido. Tente novamente.');
    }
    setIsSubmitting(false);
  };

  if (items.length === 0) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center p-4">
              <p className="text-gray-600 mb-4">Seu carrinho está vazio.</p>
              <Link href="/" className="text-green-600 font-medium hover:underline">
                  Voltar para o cardápio
              </Link>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
         <div className="container mx-auto max-w-2xl flex items-center">
             <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
                 <ArrowLeft size={24} className="text-green-600" />
             </Link>
             <h1 className="ml-2 font-medium text-lg text-gray-800">Finalizar Pedido</h1>
         </div>
      </div>

      <div className="container mx-auto max-w-2xl p-4 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Personal Data */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-lg shadow-sm border space-y-4"
            >
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    Dados Pessoais
                </h2>
                <div className="space-y-3">
                    <input 
                        type="text" 
                        name="name"
                        placeholder="Nome Completo"
                        required
                        className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500"
                        value={formData.name}
                        onChange={handleInputChange}
                    />
                    <input 
                        type="tel" 
                        name="phone"
                        placeholder="Telefone / WhatsApp"
                        required
                        className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500"
                        value={formData.phone}
                        onChange={handleInputChange}
                    />
                </div>
            </motion.div>

            {/* Delivery Method Toggle */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-6 rounded-lg shadow-sm border space-y-4"
            >
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    Tipo de Entrega
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setDeliveryMethod('DELIVERY')}
                        className={clsx(
                            "p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors",
                            deliveryMethod === 'DELIVERY' ? "border-green-500 bg-green-50 text-green-700" : "hover:bg-gray-50"
                        )}
                    >
                        <Bike size={24} />
                        <span className="text-sm font-medium">Entrega</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setDeliveryMethod('PICKUP')}
                        className={clsx(
                            "p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors",
                            deliveryMethod === 'PICKUP' ? "border-green-500 bg-green-50 text-green-700" : "hover:bg-gray-50"
                        )}
                    >
                        <Store size={24} />
                        <span className="text-sm font-medium">Retirada</span>
                    </button>
                </div>
            </motion.div>

            {/* Address or Pickup Info */}
            <AnimatePresence mode="wait">
                {deliveryMethod === 'DELIVERY' ? (
                    <motion.div 
                        key="delivery-form"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white p-6 rounded-lg shadow-sm border space-y-4 overflow-hidden"
                    >
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <MapPin size={20} className="text-gray-500" />
                            Endereço de Entrega
                        </h2>
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    name="cep"
                                    placeholder="CEP"
                                    required={deliveryMethod === 'DELIVERY'}
                                    className={clsx("w-32 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500", cepError && "border-red-500")}
                                    value={formData.cep}
                                    onChange={handleInputChange}
                                    onBlur={handleCepBlur}
                                    maxLength={9}
                                />
                                {cepLoading && <span className="text-sm text-gray-500 self-center">Buscando...</span>}
                            </div>
                            {cepError && <p className="text-sm text-red-500">{cepError}</p>}
                            
                            <div className="grid grid-cols-[1fr_100px] gap-2">
                                <input 
                                    type="text" 
                                    name="street"
                                    placeholder="Rua"
                                    required={deliveryMethod === 'DELIVERY'}
                                    className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                                    value={formData.street}
                                    onChange={handleInputChange}
                                    readOnly
                                />
                                <input 
                                    type="text" 
                                    name="number"
                                    placeholder="Número"
                                    required={deliveryMethod === 'DELIVERY'}
                                    className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500"
                                    value={formData.number}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <input 
                                type="text" 
                                name="complement"
                                placeholder="Complemento (Opcional)"
                                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500"
                                value={formData.complement}
                                onChange={handleInputChange}
                            />

                            <div className="grid grid-cols-2 gap-2">
                                <input 
                                    type="text" 
                                    name="neighborhood"
                                    placeholder="Bairro"
                                    required={deliveryMethod === 'DELIVERY'}
                                    className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                                    value={formData.neighborhood}
                                    onChange={handleInputChange}
                                    readOnly
                                />
                                <input 
                                    type="text" 
                                    name="city"
                                    placeholder="Cidade"
                                    required={deliveryMethod === 'DELIVERY'}
                                    className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    readOnly
                                />
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="pickup-info"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white p-6 rounded-lg shadow-sm border space-y-4"
                    >
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Store size={20} className="text-gray-500" />
                            Local de Retirada
                        </h2>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <p className="font-medium text-gray-900">Endereço para retirada:</p>
                            <p className="text-gray-600 mt-1">Av. Abílio Machado, 1.928 - sala 01 - Alípio de Melo</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Payment */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-6 rounded-lg shadow-sm border space-y-4"
            >
                <h2 className="font-semibold text-gray-900">Forma de Pagamento</h2>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'PIX' }))}
                        className={clsx(
                            "p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors",
                            formData.paymentMethod === 'PIX' ? "border-green-500 bg-green-50 text-green-700" : "hover:bg-gray-50"
                        )}
                    >
                        <QrCode size={24} />
                        <span className="text-sm font-medium">PIX</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'MONEY' }))}
                        className={clsx(
                            "p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors",
                            formData.paymentMethod === 'MONEY' ? "border-green-500 bg-green-50 text-green-700" : "hover:bg-gray-50"
                        )}
                    >
                        <Banknote size={24} />
                        <span className="text-sm font-medium">Dinheiro</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'CREDIT' }))}
                        className={clsx(
                            "p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors",
                            formData.paymentMethod === 'CREDIT' ? "border-green-500 bg-green-50 text-green-700" : "hover:bg-gray-50"
                        )}
                    >
                        <CreditCard size={24} />
                        <span className="text-sm font-medium">Crédito</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'DEBIT' }))}
                        className={clsx(
                            "p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors",
                            formData.paymentMethod === 'DEBIT' ? "border-green-500 bg-green-50 text-green-700" : "hover:bg-gray-50"
                        )}
                    >
                        <CreditCard size={24} />
                        <span className="text-sm font-medium">Débito</span>
                    </button>
                </div>
            </motion.div>

            {/* Observations */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white p-6 rounded-lg shadow-sm border space-y-4"
            >
                 <h2 className="font-semibold text-gray-900">Observações do Pedido</h2>
                 <textarea 
                    name="observations"
                    className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none resize-none h-24"
                    placeholder="Ex: Campainha não funciona, deixar na portaria, tirar cebola do lanche X..."
                    value={formData.observations}
                    onChange={handleInputChange}
                 ></textarea>
            </motion.div>

            {/* Coupon */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white p-6 rounded-lg shadow-sm border space-y-4"
            >
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Banknote size={20} className="text-gray-500" />
                    Cupom de Desconto
                </h2>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Código do cupom"
                        className="flex-1 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500 uppercase"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        disabled={!!appliedCoupon}
                    />
                    {appliedCoupon ? (
                        <button
                            type="button"
                            onClick={() => {
                                setAppliedCoupon(null);
                                setDiscount(0);
                                setCouponCode('');
                                setCouponMessage(null);
                            }}
                            className="bg-red-100 text-red-700 font-medium px-4 rounded-lg hover:bg-red-200 transition-colors"
                        >
                            Remover
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleApplyCoupon}
                            disabled={couponLoading || !couponCode}
                            className="bg-gray-900 text-white font-medium px-6 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {couponLoading ? '...' : 'Aplicar'}
                        </button>
                    )}
                </div>
                {couponMessage && (
                    <p className={clsx("text-sm", couponMessage.type === 'success' ? "text-green-600" : "text-red-500")}>
                        {couponMessage.text}
                    </p>
                )}
            </motion.div>

            {/* Summary */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white p-6 rounded-lg shadow-sm border space-y-2"
            >
                <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                </div>
                {deliveryMethod === 'DELIVERY' && (
                    <div className="flex justify-between text-gray-600 items-center">
                        <span>Taxa de Entrega</span>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Calculado no atendimento</span>
                    </div>
                )}
                {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                        <span>Desconto</span>
                        <span>- R$ {discount.toFixed(2).replace('.', ',')}</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t">
                    <span>Total</span>
                    <span>R$ {Math.max(0, cartTotal - discount).toFixed(2).replace('.', ',')}</span>
                </div>
            </motion.div>

            <motion.button 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 text-white font-bold py-4 rounded-lg shadow-lg hover:bg-green-700 active:transform active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? 'Processando...' : 'Confirmar Pedido'}
            </motion.button>
        </form>
      </div>
    </div>
  );
}

'use client'

import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, CreditCard, Banknote, QrCode, Store, Bike, User, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { trackMarketingEvent } from '@/lib/tracking';

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

  useEffect(() => {
    if (items.length === 0) return;
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'checkout_started',
        metadata: {
          items: items.length,
          total: cartTotal,
        },
      }),
      keepalive: true,
    }).catch(() => {});
  }, [cartTotal, items.length]);

  const formatCep = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

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
        body: JSON.stringify({ code: couponCode, total: cartTotal }),
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
        trackMarketingEvent('ApplyCoupon', {
          coupon: data.code,
          discount: discountValue,
          currency: 'BRL',
        });
      }
    } catch {
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
    } catch {
        setCepError('Erro ao buscar CEP');
    } finally {
        setCepLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'cep') {
      setFormData(prev => ({ ...prev, cep: formatCep(value) }));
      return;
    }
    if (name === 'phone') {
      setFormData(prev => ({ ...prev, phone: formatPhone(value) }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
        alert('Seu carrinho está vazio');
        return;
    }
    const phoneDigits = formData.phone.replace(/\D/g, '');
    const cepDigits = formData.cep.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
        alert('Informe um telefone valido para o atendimento.');
        return;
    }
    if (deliveryMethod === 'DELIVERY' && (cepDigits.length !== 8 || !!cepError)) {
        alert('Informe um CEP valido para entrega.');
        return;
    }

    setIsSubmitting(true);
    trackMarketingEvent('InitiateCheckout', {
      currency: 'BRL',
      value: Math.max(0, cartTotal - discount),
      num_items: items.reduce((count, item) => count + item.quantity, 0),
    });
    
    // Preparar dados do pedido
    const orderData = {
        ...formData,
        deliveryMethod,
        subtotal: cartTotal,
        deliveryFee: 0, // Taxa calculada no atendimento
        discount: discount,
        total: Math.max(0, cartTotal - discount),
        couponCode: appliedCoupon?.code,
        items: items
    };

    // Salvar no banco
    const result = await createOrder(orderData);
    
    if (result && result.success) {
        trackMarketingEvent('Purchase', {
          transaction_id: result.orderId,
          currency: 'BRL',
          value: orderData.total,
          coupon: appliedCoupon?.code,
          items: items.map((item) => ({
            item_id: item.id,
            item_name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        });

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
${items.map(item => {
  const flavorName = item.selectedFlavor
    ? (item.flavors?.find(f => f.id === item.selectedFlavor)?.name || item.selectedFlavor)
    : '';
  const addonsText =
    item.selectedAddons && item.selectedAddons.length > 0
      ? item.selectedAddons
          .map(id => {
            const addon = item.addons?.find(a => a.id === id);
            if (!addon) return id;
            return addon.price > 0
              ? `${addon.name} (+R$ ${addon.price.toFixed(2).replace('.', ',')})`
              : addon.name;
          })
          .join(', ')
      : '';
  const addonsTotal =
    item.selectedAddons?.reduce((acc, id) => acc + (item.addons?.find(a => a.id === id)?.price || 0), 0) || 0;
  const lineTotal = (item.price + addonsTotal) * item.quantity;

  return `
${item.quantity}x ${item.name}
${flavorName ? `Sabor: ${flavorName}` : ''}
${addonsText ? `Adicionais: ${addonsText}` : ''}
R$ ${lineTotal.toFixed(2).replace('.', ',')}
`.trim();
}).join('\n\n')}

*Resumo:*
Subtotal: R$ ${cartTotal.toFixed(2).replace('.', ',')}
${deliveryMethod === 'DELIVERY' ? 'Entrega: A combinar' : ''}
${discount > 0 ? `Desconto: -R$ ${discount.toFixed(2).replace('.', ',')}\n` : ''}
*Total: R$ ${orderData.total.toFixed(2).replace('.', ',')}* ${deliveryMethod === 'DELIVERY' ? '(+ frete)' : ''}

*Pagamento:* ${formData.paymentMethod}
${formData.observations ? `\n*Obs:* ${formData.observations}` : ''}
        `.trim();

        const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5599999999999';
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        
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
              <Link href="/" className="font-medium hover:underline" style={{ color: 'var(--brand)' }}>
                  Voltar para o cardápio
              </Link>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-[#f8fbf8] pb-24">
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
         <div className="container mx-auto max-w-2xl flex items-center">
             <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
                 <ArrowLeft size={24} style={{ color: 'var(--brand)' }} />
             </Link>
             <h1 className="ml-2 font-medium text-lg text-gray-800">Finalizar no NISI</h1>
         </div>
      </div>

      <div className="container mx-auto max-w-2xl p-4 space-y-6">
        <div className="rounded-lg border bg-white p-4 shadow-sm" style={{ borderColor: 'var(--border)' }}>
          <p className="text-sm font-semibold text-gray-950">Vamos preparar seu pedido no NISI</p>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[11px] font-medium text-gray-600">
            {[
              { label: 'Dados', icon: User },
              { label: 'Entrega', icon: deliveryMethod === 'DELIVERY' ? Bike : Store },
              { label: 'Pagamento', icon: CreditCard },
              { label: 'Resumo', icon: ClipboardCheck },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className="flex flex-col items-center gap-1">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
                    <Icon size={15} />
                  </span>
                  {step.label}
                </div>
              );
            })}
          </div>
        </div>

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
	                        className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[var(--brand)]"
	                        value={formData.name}
	                        onChange={handleInputChange}
	                    />
	                    <input 
	                        type="tel" 
	                        name="phone"
	                        placeholder="Telefone / WhatsApp"
	                        required
	                        className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[var(--brand)]"
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
	                            deliveryMethod === 'DELIVERY' ? "hover:bg-gray-50" : "hover:bg-gray-50"
	                        )}
	                        style={deliveryMethod === 'DELIVERY' ? { borderColor: 'var(--brand)', backgroundColor: 'color-mix(in srgb, var(--brand) 10%, white)', color: 'var(--brand)' } : undefined}
	                    >
                        <Bike size={24} />
                        <span className="text-sm font-medium">Entrega</span>
                    </button>
	                    <button
	                        type="button"
	                        onClick={() => setDeliveryMethod('PICKUP')}
	                        className={clsx(
	                            "p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors",
	                            deliveryMethod === 'PICKUP' ? "hover:bg-gray-50" : "hover:bg-gray-50"
	                        )}
	                        style={deliveryMethod === 'PICKUP' ? { borderColor: 'var(--brand)', backgroundColor: 'color-mix(in srgb, var(--brand) 10%, white)', color: 'var(--brand)' } : undefined}
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
	                                    className={clsx("w-32 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[var(--brand)]", cepError && "border-emerald-600")}
	                                    value={formData.cep}
	                                    onChange={handleInputChange}
	                                    onBlur={handleCepBlur}
	                                    maxLength={9}
	                                />
                                {cepLoading && <span className="text-sm text-gray-500 self-center">Buscando...</span>}
                            </div>
                            {cepError && <p className="text-sm text-emerald-700">{cepError}</p>}
                            
                            <div className="grid grid-cols-[1fr_100px] gap-2">
	                                <input 
	                                    type="text" 
	                                    name="street"
	                                    placeholder="Rua"
	                                    required={deliveryMethod === 'DELIVERY'}
	                                    className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[var(--brand)] bg-gray-50"
	                                    value={formData.street}
	                                    onChange={handleInputChange}
	                                    readOnly
	                                />
	                                <input 
	                                    type="text" 
	                                    name="number"
	                                    placeholder="Número"
	                                    required={deliveryMethod === 'DELIVERY'}
	                                    className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[var(--brand)]"
	                                    value={formData.number}
	                                    onChange={handleInputChange}
	                                />
                            </div>

	                            <input 
	                                type="text" 
	                                name="complement"
	                                placeholder="Complemento (Opcional)"
	                                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[var(--brand)]"
	                                value={formData.complement}
	                                onChange={handleInputChange}
	                            />

	                            <div className="grid grid-cols-2 gap-2">
	                                <input 
	                                    type="text" 
	                                    name="neighborhood"
	                                    placeholder="Bairro"
	                                    required={deliveryMethod === 'DELIVERY'}
	                                    className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[var(--brand)] bg-gray-50"
	                                    value={formData.neighborhood}
	                                    onChange={handleInputChange}
	                                    readOnly
	                                />
	                                <input 
	                                    type="text" 
	                                    name="city"
	                                    placeholder="Cidade"
	                                    required={deliveryMethod === 'DELIVERY'}
	                                    className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[var(--brand)] bg-gray-50"
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
	                            formData.paymentMethod === 'PIX' ? "hover:bg-gray-50" : "hover:bg-gray-50"
	                        )}
	                        style={formData.paymentMethod === 'PIX' ? { borderColor: 'var(--brand)', backgroundColor: 'color-mix(in srgb, var(--brand) 10%, white)', color: 'var(--brand)' } : undefined}
	                    >
                        <QrCode size={24} />
                        <span className="text-sm font-medium">PIX</span>
                    </button>
	                    <button
	                        type="button"
	                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'MONEY' }))}
	                        className={clsx(
	                            "p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors",
	                            formData.paymentMethod === 'MONEY' ? "hover:bg-gray-50" : "hover:bg-gray-50"
	                        )}
	                        style={formData.paymentMethod === 'MONEY' ? { borderColor: 'var(--brand)', backgroundColor: 'color-mix(in srgb, var(--brand) 10%, white)', color: 'var(--brand)' } : undefined}
	                    >
                        <Banknote size={24} />
                        <span className="text-sm font-medium">Dinheiro</span>
                    </button>
	                    <button
	                        type="button"
	                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'CREDIT' }))}
	                        className={clsx(
	                            "p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors",
	                            formData.paymentMethod === 'CREDIT' ? "hover:bg-gray-50" : "hover:bg-gray-50"
	                        )}
	                        style={formData.paymentMethod === 'CREDIT' ? { borderColor: 'var(--brand)', backgroundColor: 'color-mix(in srgb, var(--brand) 10%, white)', color: 'var(--brand)' } : undefined}
	                    >
                        <CreditCard size={24} />
                        <span className="text-sm font-medium">Crédito</span>
                    </button>
	                    <button
	                        type="button"
	                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'DEBIT' }))}
	                        className={clsx(
	                            "p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors",
	                            formData.paymentMethod === 'DEBIT' ? "hover:bg-gray-50" : "hover:bg-gray-50"
	                        )}
	                        style={formData.paymentMethod === 'DEBIT' ? { borderColor: 'var(--brand)', backgroundColor: 'color-mix(in srgb, var(--brand) 10%, white)', color: 'var(--brand)' } : undefined}
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
	                 <h2 className="font-semibold text-gray-900">Observações do pedido</h2>
	                 <textarea 
	                    name="observations"
	                    className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-[var(--brand)] focus:outline-none resize-none h-24"
	                    placeholder="Ex: menos gelo, retirar algum ingrediente, ponto de referencia..."
	                    value={formData.observations}
	                    onChange={handleInputChange}
	                 ></textarea>
            </motion.div>

            {/* Summary */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white p-6 rounded-lg shadow-sm border space-y-4"
            >
                <h2 className="font-semibold text-gray-900 pb-2">Resumo do pedido</h2>
                <div className="space-y-2">
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
	                    <div className="flex justify-between" style={{ color: 'var(--brand)' }}>
	                        <span>Desconto</span>
	                        <span>- R$ {discount.toFixed(2).replace('.', ',')}</span>
		                    </div>
		                )}
	                <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t">
	                    <span>Total</span>
	                    <span>R$ {Math.max(0, cartTotal - discount).toFixed(2).replace('.', ',')}</span>
	                </div>
                </div>

                <div className="rounded-lg border bg-emerald-50/50 p-3" style={{ borderColor: 'var(--border)' }}>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <Banknote size={16} className="text-emerald-700" />
                    Cupom NISI
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Código"
                      className="min-w-0 flex-1 rounded-lg border bg-white p-3 uppercase outline-none focus:ring-2 focus:ring-[var(--brand)]"
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
                        className="rounded-lg bg-gray-100 px-4 font-medium text-gray-700 transition-colors hover:bg-gray-200"
                      >
                        Remover
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode}
                        className="rounded-lg bg-gray-900 px-5 font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
                      >
                        {couponLoading ? '...' : 'Aplicar'}
                      </button>
                    )}
                  </div>
                  {couponMessage && (
                    <p
                      className={clsx("mt-2 text-sm", couponMessage.type === 'success' ? "" : "text-emerald-700")}
                      style={couponMessage.type === 'success' ? { color: 'var(--brand)' } : undefined}
                    >
                      {couponMessage.text}
                    </p>
                  )}
                </div>
            </motion.div>

	            <motion.button 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
	                type="submit"
	                disabled={isSubmitting}
	                className="w-full text-white font-bold py-4 rounded-lg shadow-lg active:transform active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
	                style={{ backgroundColor: 'var(--brand)' }}
	            >
	                {isSubmitting ? 'Processando...' : 'Enviar pedido'}
            </motion.button>
        </form>
      </div>
    </div>
  );
}

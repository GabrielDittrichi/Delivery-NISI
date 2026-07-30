'use client'

import { useEffect, useRef, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, CreditCard, Banknote, QrCode, Store, Bike, User, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { trackMarketingEvent } from '@/lib/tracking';
import { trackPixelAndCapi } from '@/lib/track-unified';
import { getMetaUserData } from '@/lib/meta-client';

type PaymentMethod = 'PIX' | 'MONEY' | 'CREDIT' | 'DEBIT';
type DeliveryMethod = 'DELIVERY' | 'PICKUP';

import { createOrder } from '@/lib/analytics';

const inputClass = "w-full rounded-lg border border-emerald-100 bg-white px-4 py-3 text-sm text-gray-950 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";
const readonlyInputClass = `${inputClass} bg-emerald-50/40 text-gray-700`;
const sectionClass = "overflow-hidden rounded-lg border border-emerald-100 bg-white p-5 shadow-[0_18px_60px_rgba(16,128,60,0.08)]";
const optionClass = "rounded-lg border p-4 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50/70 hover:shadow-sm";

function money(value: number) {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function getItemAddonsTotal(item: {
  selectedAddons?: string[];
  addons?: { id: string; price: number }[];
}) {
  return item.selectedAddons?.reduce((acc, id) => acc + (item.addons?.find(a => a.id === id)?.price || 0), 0) || 0;
}

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const checkoutStartedRef = useRef(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
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
    if (items.length === 0 || checkoutStartedRef.current) return;
    checkoutStartedRef.current = true;
    const eventId = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const metadata = {
      content_ids: items.map(i => i.id),
      content_type: 'product',
      contents: items.map(i => ({ id: i.id, quantity: i.quantity, item_price: i.price + getItemAddonsTotal(i) })),
      currency: 'BRL',
      value: cartTotal,
      num_items: items.reduce((count, item) => count + item.quantity, 0),
    };
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'checkout_started',
        metadata,
      }),
      keepalive: true,
    }).catch(() => {});
    trackPixelAndCapi('InitiateCheckout', metadata, eventId);
  }, [cartTotal, items]);

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
        const eventId = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
        const metadata = {
          coupon: data.code,
          discount: discountValue,
          currency: 'BRL',
          value: Math.max(0, cartTotal - discountValue),
        };
        fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'coupon_applied', metadata }),
          keepalive: true,
        }).catch(() => {});
        trackPixelAndCapi('CouponApplied', metadata, eventId);
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
    setSubmitError('');
    if (items.length === 0) {
        setSubmitError('Seu carrinho está vazio');
        return;
    }
    const phoneDigits = formData.phone.replace(/\D/g, '');
    const cepDigits = formData.cep.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
        setSubmitError('Informe um telefone válido para o atendimento.');
        return;
    }
    if (deliveryMethod === 'DELIVERY' && (cepDigits.length !== 8 || !!cepError)) {
        setSubmitError('Informe um CEP válido para entrega.');
        return;
    }

    setIsSubmitting(true);
    try {
    const orderEventId = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const orderData = {
        name: formData.name,
        phone: formData.phone,
        cep: formData.cep,
        street: formData.street,
        number: formData.number,
        complement: formData.complement,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        paymentMethod: formData.paymentMethod,
        observations: formData.observations,
        deliveryMethod,
        subtotal: cartTotal,
        deliveryFee: 0,
        discount: discount,
        total: Math.max(0, cartTotal - discount),
        couponCode: appliedCoupon?.code,
        items: items,
        eventId: orderEventId,
        metaUserData: { ...getMetaUserData(), phone: formData.phone },
    };

    // Salvar no banco
    const result = await createOrder(orderData);
    
    if (result && result.success) {
        const confirmedTotals = result.totals || {
          subtotal: cartTotal,
          deliveryFee: 0,
          discount,
          total: orderData.total,
        };
        const confirmedItems = result.items || items.map((item) => {
          const addonsTotal = getItemAddonsTotal(item);
          return {
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price + addonsTotal,
            total: (item.price + addonsTotal) * item.quantity,
            selectedFlavor: item.selectedFlavor,
            selectedFlavorName: item.flavors?.find((flavor) => flavor.id === item.selectedFlavor)?.name,
            selectedAddons: item.selectedAddons || [],
            addonNames: (item.selectedAddons || [])
              .map((id) => item.addons?.find((addon) => addon.id === id)?.name)
              .filter(Boolean) as string[],
          };
        });
        const confirmedOrderItems = confirmedItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          item_price: item.price,
        }));

        trackMarketingEvent('Purchase', {
          transaction_id: result.orderId,
          content_ids: confirmedItems.map(i => i.id),
          content_name: confirmedItems.map(i => i.name).join(', '),
          content_type: 'product',
          currency: 'BRL',
          value: confirmedTotals.total,
          coupon: result.couponCode,
          contents: confirmedOrderItems,
          num_items: confirmedItems.reduce((count, item) => count + item.quantity, 0),
          eventID: orderEventId,
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
${confirmedItems.map(item => {
  const flavorName = item.selectedFlavor
    ? item.selectedFlavorName || item.selectedFlavor
    : '';
  const addonsText =
    item.addonNames && item.addonNames.length > 0
      ? item.addonNames.join(', ')
      : '';

  return `
${item.quantity}x ${item.name}
${flavorName ? `Sabor: ${flavorName}` : ''}
${addonsText ? `Adicionais: ${addonsText}` : ''}
R$ ${item.total.toFixed(2).replace('.', ',')}
`.trim();
}).join('\n\n')}

*Resumo:*
Subtotal: R$ ${confirmedTotals.subtotal.toFixed(2).replace('.', ',')}
${deliveryMethod === 'DELIVERY' ? 'Entrega: A combinar' : ''}
${confirmedTotals.discount > 0 ? `Desconto: -R$ ${confirmedTotals.discount.toFixed(2).replace('.', ',')}\n` : ''}
*Total: R$ ${confirmedTotals.total.toFixed(2).replace('.', ',')}* ${deliveryMethod === 'DELIVERY' ? '(+ frete)' : ''}

*Pagamento:* ${formData.paymentMethod}
${formData.observations ? `\n*Obs:* ${formData.observations}` : ''}
        `.trim();

        const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5599999999999';
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        const whatsappEventId = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
        const whatsappMetadata = {
          transaction_id: result.orderId,
          currency: 'BRL',
          value: confirmedTotals.total,
          content_ids: confirmedItems.map(i => i.id),
          contents: confirmedOrderItems,
          num_items: confirmedItems.reduce((count, item) => count + item.quantity, 0),
        };
        fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'whatsapp_click', metadata: whatsappMetadata }),
          keepalive: true,
        }).catch(() => {});
        trackPixelAndCapi('WhatsAppClick', whatsappMetadata, whatsappEventId, { phone: formData.phone });
        
        clearCart();
        window.open(whatsappUrl, '_blank');
        router.push('/');
    } else {
        setSubmitError('Erro ao processar pedido. Tente novamente.');
    }
    } catch (error) {
      setSubmitError('Erro ao processar pedido. Tente novamente.');
      console.error('Checkout error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
      return (
          <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8fbf8] p-4 text-center">
              <div className="rounded-lg border border-emerald-100 bg-white p-8 shadow-sm">
              <p className="mb-4 text-gray-600">Seu carrinho está vazio.</p>
              <Link href="/" className="inline-flex rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white transition-colors hover:bg-emerald-800">
                  Voltar para o cardápio
              </Link>
              </div>
          </div>
      )
  }

  const finalTotal = Math.max(0, cartTotal - discount);
  const checkoutSteps = [
    { label: 'Dados', icon: User },
    { label: deliveryMethod === 'DELIVERY' ? 'Entrega' : 'Retirada', icon: deliveryMethod === 'DELIVERY' ? Bike : Store },
    { label: 'Pagamento', icon: CreditCard },
    { label: 'Resumo', icon: ClipboardCheck },
  ];
  const paymentOptions = [
    { id: 'PIX' as PaymentMethod, label: 'PIX', icon: QrCode },
    { id: 'MONEY' as PaymentMethod, label: 'Dinheiro', icon: Banknote },
    { id: 'CREDIT' as PaymentMethod, label: 'Crédito', icon: CreditCard },
    { id: 'DEBIT' as PaymentMethod, label: 'Débito', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(187,247,208,0.45),transparent_32%),#f8fbf8] pb-28">
      <div className="sticky top-0 z-10 border-b border-emerald-100 bg-white/90 p-4 shadow-sm backdrop-blur">
         <div className="container mx-auto flex max-w-3xl items-center">
             <Link href="/" className="-ml-2 rounded-lg p-2 transition-colors hover:bg-emerald-50" aria-label="Voltar">
                 <ArrowLeft size={24} style={{ color: 'var(--brand)' }} />
             </Link>
             <div className="ml-2">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Checkout seguro</p>
              <h1 className="text-lg font-bold text-gray-950">Finalizar no NISI</h1>
             </div>
         </div>
      </div>

      <div className="container mx-auto max-w-3xl space-y-6 p-4">
        <div className="rounded-lg border border-emerald-100 bg-white p-4 shadow-[0_18px_60px_rgba(16,128,60,0.08)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-950">Vamos preparar seu pedido no NISI</p>
              <p className="mt-1 text-sm text-gray-500">Complete os dados e envie direto para o WhatsApp.</p>
            </div>
            <span className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800">{money(finalTotal)}</span>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2 text-center text-[11px] font-semibold text-gray-600">
            {checkoutSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className="flex flex-col items-center gap-1">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${index === 0 ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-800'}`}>
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
                className={`${sectionClass} space-y-4`}
            >
                <h2 className="flex items-center gap-2 font-bold text-gray-950">
                    <User size={18} className="text-emerald-700" />
                    Dados Pessoais
                </h2>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="checkout-name" className="sr-only">Nome Completo</label>
	                    <input 
	                        type="text" 
	                        name="name"
	                        id="checkout-name"
	                        placeholder="Nome Completo"
	                        required
	                        className={inputClass}
	                        value={formData.name}
	                        onChange={handleInputChange}
	                    />
                    </div>
                    <div>
                    <label htmlFor="checkout-phone" className="sr-only">Telefone / WhatsApp</label>
	                    <input 
	                        type="tel" 
	                        name="phone"
	                        id="checkout-phone"
	                        placeholder="Telefone / WhatsApp"
	                        required
	                        className={inputClass}
	                        value={formData.phone}
	                        onChange={handleInputChange}
	                    />
                    </div>
                </div>
            </motion.div>

            {/* Delivery Method Toggle */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`${sectionClass} space-y-4`}
            >
                <h2 className="flex items-center gap-2 font-bold text-gray-950">
                    {deliveryMethod === 'DELIVERY' ? <Bike size={18} className="text-emerald-700" /> : <Store size={18} className="text-emerald-700" />}
                    Tipo de Entrega
                </h2>
                <div className="grid grid-cols-2 gap-3">
	                    <button
	                        type="button"
	                        onClick={() => setDeliveryMethod('DELIVERY')}
	                        className={clsx(
	                            optionClass,
                              "flex flex-col items-center gap-2",
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
	                            optionClass,
                              "flex flex-col items-center gap-2",
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
                        className={`${sectionClass} space-y-4`}
                    >
                        <h2 className="flex items-center gap-2 font-bold text-gray-950">
                            <MapPin size={20} className="text-emerald-700" />
                            Endereço de Entrega
                        </h2>
                        <div className="space-y-3">
                            <div className="flex gap-2">
	                                <input 
	                                    type="text" 
	                                    name="cep"
	                                    placeholder="CEP"
	                                    required={deliveryMethod === 'DELIVERY'}
	                                    className={clsx("w-36", inputClass, cepError && "border-emerald-600")}
	                                    value={formData.cep}
	                                    onChange={handleInputChange}
	                                    onBlur={handleCepBlur}
	                                    maxLength={9}
	                                />
                                {cepLoading && <span className="self-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">Buscando...</span>}
                            </div>
                            {cepError && <p className="text-sm text-emerald-700">{cepError}</p>}
                            
                            <div className="grid grid-cols-[1fr_100px] gap-2">
	                                <input 
	                                    type="text" 
	                                    name="street"
	                                    placeholder="Rua"
	                                    required={deliveryMethod === 'DELIVERY'}
	                                    className={readonlyInputClass}
	                                    value={formData.street}
	                                    onChange={handleInputChange}
	                                    readOnly
	                                />
	                                <input 
	                                    type="text" 
	                                    name="number"
	                                    placeholder="Número"
	                                    required={deliveryMethod === 'DELIVERY'}
	                                    className={inputClass}
	                                    value={formData.number}
	                                    onChange={handleInputChange}
	                                />
                            </div>

	                            <input 
	                                type="text" 
	                                name="complement"
	                                placeholder="Complemento (Opcional)"
	                                className={inputClass}
	                                value={formData.complement}
	                                onChange={handleInputChange}
	                            />

	                            <div className="grid grid-cols-2 gap-2">
	                                <input 
	                                    type="text" 
	                                    name="neighborhood"
	                                    placeholder="Bairro"
	                                    required={deliveryMethod === 'DELIVERY'}
	                                    className={readonlyInputClass}
	                                    value={formData.neighborhood}
	                                    onChange={handleInputChange}
	                                    readOnly
	                                />
	                                <input 
	                                    type="text" 
	                                    name="city"
	                                    placeholder="Cidade"
	                                    required={deliveryMethod === 'DELIVERY'}
	                                    className={readonlyInputClass}
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
                        className={`${sectionClass} space-y-4`}
                    >
                        <h2 className="flex items-center gap-2 font-bold text-gray-950">
                            <Store size={20} className="text-emerald-700" />
                            Local de Retirada
                        </h2>
                        <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-4">
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
                className={`${sectionClass} space-y-4`}
            >
                <h2 className="flex items-center gap-2 font-bold text-gray-950">
                  <CreditCard size={18} className="text-emerald-700" />
                  Forma de Pagamento
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {paymentOptions.map((option) => {
                    const Icon = option.icon;
                    const selected = formData.paymentMethod === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, paymentMethod: option.id }));
                          const metadata = {
                            content_ids: items.map(i => i.id),
                            content_type: 'product',
                            contents: items.map(i => ({ id: i.id, quantity: i.quantity, item_price: i.price + getItemAddonsTotal(i) })),
                            currency: 'BRL',
                            value: Math.max(0, cartTotal - discount),
                            payment_method: option.id,
                          };
                          fetch('/api/events', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ type: 'add_payment_info', metadata }),
                            keepalive: true,
                          }).catch(() => {});
                          trackPixelAndCapi('AddPaymentInfo', metadata);
                        }}
                        className={clsx(
                          optionClass,
                          "flex flex-col items-center gap-2",
                          selected ? "border-emerald-700 bg-emerald-50 text-emerald-800 shadow-sm" : "border-emerald-100 bg-white text-gray-700"
                        )}
                      >
                        <Icon size={24} />
                        <span className="text-sm font-semibold">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
            </motion.div>

            {/* Observations */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`${sectionClass} space-y-4`}
            >
	                 <h2 className="font-bold text-gray-950">Observações do pedido</h2>
	                 <textarea 
	                    name="observations"
	                    className={`${inputClass} h-24 resize-none`}
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
                className={`${sectionClass} space-y-4`}
            >
                <h2 className="flex items-center gap-2 pb-1 font-bold text-gray-950">
                  <ClipboardCheck size={18} className="text-emerald-700" />
                  Resumo do pedido
                </h2>
                <div className="space-y-3 rounded-lg border border-emerald-100 bg-emerald-50/40 p-3">
                  {items.map((item) => {
                    const addonsTotal =
                      item.selectedAddons?.reduce((acc, id) => acc + (item.addons?.find(a => a.id === id)?.price || 0), 0) || 0;
                    const lineTotal = (item.price + addonsTotal) * item.quantity;
                    const flavorName = item.selectedFlavor
                      ? (item.flavors?.find(f => f.id === item.selectedFlavor)?.name || item.selectedFlavor)
                      : '';
                    return (
                      <div key={`${item.id}-${item.selectedFlavor || 'sem-sabor'}-${item.selectedAddons?.join('-') || 'sem-adicional'}`} className="flex items-start justify-between gap-3 rounded-lg bg-white p-3 shadow-sm">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-950">{item.quantity}x {item.name}</p>
                          {flavorName && <p className="mt-1 text-xs text-gray-500">Sabor: {flavorName}</p>}
                          {item.selectedAddons && item.selectedAddons.length > 0 && (
                            <p className="mt-1 text-xs text-emerald-700">
                              {item.selectedAddons.map(id => item.addons?.find(a => a.id === id)?.name || id).join(', ')}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 text-sm font-bold text-emerald-800">{money(lineTotal)}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2">
	                <div className="flex justify-between text-gray-600">
	                    <span>Subtotal</span>
	                    <span>{money(cartTotal)}</span>
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
	                        <span>- {money(discount)}</span>
		                    </div>
		                )}
	                <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t">
	                    <span>Total</span>
	                    <span>{money(finalTotal)}</span>
	                </div>
                </div>

                <div className="rounded-lg border border-emerald-100 bg-white p-3">
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <Banknote size={16} className="text-emerald-700" />
                    Cupom NISI
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Código"
                      className={`${inputClass} min-w-0 flex-1 uppercase`}
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
                        className="rounded-lg bg-emerald-700 px-5 font-semibold text-white transition-colors hover:bg-emerald-800 disabled:opacity-50"
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

              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800"
                >
                  {submitError}
                </motion.div>
              )}

	            <motion.button 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
	                type="submit"
	                disabled={isSubmitting}
	                className="w-full rounded-lg bg-emerald-700 py-4 font-bold text-white shadow-[0_16px_40px_rgba(22,128,60,0.24)] transition-all active:scale-[0.98] hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
	            >
	                {isSubmitting ? 'Processando...' : `Enviar pedido - ${money(finalTotal)}`}
            </motion.button>
        </form>
      </div>
    </div>
  );
}

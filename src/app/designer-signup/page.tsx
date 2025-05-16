"use client";
import { useState } from 'react';
import FileUploader from '../../components/ui/FileUploader';
import { BackgroundPaths } from "@/components/ui/background-paths";
import Image from "next/image";

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const INVENTORY_STATUS = ['ready', 'made_to_order', 'coming_soon'];
const SELLING_AS = ['PJ', 'PF'];

const FULFILLMENT = [
  { value: 'baguri', label: 'Baguri-fulfilled (we handle storage & shipping)' },
  { value: 'designer', label: 'Designer-fulfilled (you handle storage & shipping)' },
];

const emptyColorVariant = () => ({ color: '', image_url: '' });
const emptyProduct = () => ({
  image_url: '',
  price_min: '',
  price_max: '',
  sizes: [] as string[],
  inventory_status: '',
  color_variants: [emptyColorVariant()],
});

export default function DesignerSignup() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    brand_name: '',
    description: '',
    email: '',
    logo_url: '',
    secondary_logo_url: '',
    products: [emptyProduct()],
    instagram: '',
    tiktok: '',
    website: '',
    fulfillment: '',
    selling_as: '',
    iban: '',
    owns_rights: false,
    accept_terms: false,
    wants_ai_photos: false,
    hunter_id: '', // hidden
    invite_source: '', // hidden
  });
  const [errors, setErrors] = useState<string[]>([]);

  // Validation logic for each step
  const validateStep = () => {
    const errs: string[] = [];
    if (step === 1) {
      if (!form.brand_name) errs.push('Brand Name is required');
      if (!form.description) errs.push('Description is required');
      if (!form.email) errs.push('Email is required');
      if (!form.logo_url) errs.push('Logo is required');
    }
    if (step === 2) {
      form.products.forEach((p, idx) => {
        if (!p.image_url) errs.push(`Product ${idx + 1}: Image is required`);
        if (!p.price_min) errs.push(`Product ${idx + 1}: Price Min is required`);
        if (!p.price_max) errs.push(`Product ${idx + 1}: Price Max is required`);
        if (!p.inventory_status) errs.push(`Product ${idx + 1}: Inventory Status is required`);
        if (p.sizes.length === 0) errs.push(`Product ${idx + 1}: At least one size is required`);
        p.color_variants.forEach((cv, cidx) => {
          if (!cv.color) errs.push(`Product ${idx + 1} Color ${cidx + 1}: Color name is required`);
          if (!cv.image_url) errs.push(`Product ${idx + 1} Color ${cidx + 1}: Image is required`);
        });
      });
    }
    if (step === 3) {
      if (!form.instagram) errs.push('Instagram is required');
      if (!form.tiktok) errs.push('TikTok is required');
    }
    if (step === 4) {
      if (!form.selling_as) errs.push('Selling As is required');
      if (!form.owns_rights) errs.push('You must own the rights to all content');
      if (!form.accept_terms) errs.push('You must accept the terms and conditions');
      if (!form.fulfillment) errs.push('Fulfillment preference is required');
    }
    setErrors(errs);
    return errs.length === 0;
  };

  // Handlers
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };
  const handleProductChange = (idx: number, field: string, value: any) => {
    setForm(f => {
      const products = [...f.products];
      products[idx] = { ...products[idx], [field]: value };
      return { ...f, products };
    });
  };
  const handleProductSizeChange = (idx: number, size: string) => {
    setForm(f => {
      const products = [...f.products];
      const p = products[idx];
      products[idx] = {
        ...p,
        sizes: p.sizes.includes(size)
          ? p.sizes.filter(s => s !== size)
          : [...p.sizes, size],
      };
      return { ...f, products };
    });
  };
  const addProduct = () => {
    setForm(f => ({ ...f, products: [...f.products, emptyProduct()] }));
  };
  const removeProduct = (idx: number) => {
    setForm(f => {
      const products = [...f.products];
      products.splice(idx, 1);
      return { ...f, products };
    });
  };
  const addColorVariant = (pidx: number) => {
    setForm(f => {
      const products = [...f.products];
      products[pidx].color_variants = [...products[pidx].color_variants, emptyColorVariant()];
      return { ...f, products };
    });
  };
  const removeColorVariant = (pidx: number, cidx: number) => {
    setForm(f => {
      const products = [...f.products];
      products[pidx].color_variants.splice(cidx, 1);
      if (products[pidx].color_variants.length === 0) {
        products[pidx].color_variants.push(emptyColorVariant());
      }
      return { ...f, products };
    });
  };
  const handleColorVariantChange = (pidx: number, cidx: number, field: string, value: any) => {
    setForm(f => {
      const products = [...f.products];
      const cvs = [...products[pidx].color_variants];
      cvs[cidx] = { ...cvs[cidx], [field]: value };
      products[pidx].color_variants = cvs;
      return { ...f, products };
    });
  };

  // Section rendering
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950">
      <BackgroundPaths />
      <div className="flex flex-col items-center justify-center min-h-screen py-8 px-2">
        <Image
          src="/wlogo.png"
          alt="Baguri.ro written logo"
          width={240}
          height={60}
          className="mx-auto mb-6 w-full max-w-[220px] md:max-w-[320px] h-12 md:h-16 object-contain"
          style={{ filter: "invert(1) brightness(2)" }}
          priority
        />
        <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-8 flex flex-col z-10">
          {/* Progress Stepper */}
          <div className="flex items-center justify-center mb-8 gap-2">
            {["Brand Identity", "Product Showcase", "Socials", "Legal & Consent"].map((label, idx) => (
              <div key={label} className="flex items-center">
                <div className={`rounded-full w-8 h-8 flex items-center justify-center font-bold text-zinc-900 ${step === idx + 1 ? 'bg-white text-zinc-900' : 'bg-zinc-800 text-zinc-400'}`}>{idx + 1}</div>
                {idx < 3 && <div className="w-8 h-1 bg-zinc-800 mx-1 rounded-full" />}
              </div>
            ))}
          </div>
          <h1 className="text-2xl font-bold mb-6 text-center text-white flex items-center gap-2">
            {step === 1 && <span>🎨</span>}
            {step === 2 && <span>🛍️</span>}
            {step === 3 && <span>🌐</span>}
            {step === 4 && <span>✅</span>}
            <span>Step {step} of 4</span>
          </h1>
          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-900/80 text-red-200 rounded-xl">
              {errors.map((e, i) => <div key={i}>{e}</div>)}
            </div>
          )}
          {step === 1 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-neutral-200 flex items-center gap-2">🎨 Brand Identity</h2>
              <input name="brand_name" placeholder="Brand Name" value={form.brand_name} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-200 text-base mb-3" />
              <textarea name="description" placeholder="Short Description" maxLength={250} value={form.description} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-200 text-base mb-3" />
              <input name="email" placeholder="Email" type="email" value={form.email} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-200 text-base mb-3" />
              <FileUploader bucket="logos" userId={form.email || 'designer'} onUpload={url => setForm(f => ({ ...f, logo_url: url }))} label="Logo" />
              <div className="mb-3" />
              <FileUploader bucket="logos" userId={form.email || 'designer'} onUpload={url => setForm(f => ({ ...f, secondary_logo_url: url }))} label="Secondary Logo (optional)" />
              <div className="flex justify-end mt-6">
                <button type="button" className="rounded-full bg-white hover:bg-neutral-200 text-zinc-900 font-bold px-8 py-2 shadow-lg transition mb-2" onClick={() => { if (validateStep()) setStep(2); }}>Next</button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-neutral-200 flex items-center gap-2">🛍️ Product Showcase</h2>
              {form.products.map((p, i) => (
                <div key={i} className="border border-zinc-800 rounded-2xl p-4 mb-6 relative bg-zinc-950/70 shadow-md">
                  {form.products.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProduct(i)}
                      className="absolute top-2 right-2 text-red-400 font-bold text-xl bg-transparent border-none cursor-pointer"
                      aria-label="Remove product"
                    >
                      ×
                    </button>
                  )}
                  <FileUploader
                    bucket="product-images"
                    userId={form.email || 'designer'}
                    onUpload={url => handleProductChange(i, 'image_url', url)}
                    label={`Product Image`}
                  />
                  <div className="flex gap-4 mt-3">
                    <div className="flex items-center w-1/2">
                      <input
                        name="price_min"
                        placeholder="Price Min"
                        type="number"
                        value={p.price_min}
                        onChange={e => handleProductChange(i, 'price_min', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-200 text-base"
                      />
                    </div>
                    <div className="flex items-center w-1/2">
                      <input
                        name="price_max"
                        placeholder="Price Max"
                        type="number"
                        value={p.price_max}
                        onChange={e => handleProductChange(i, 'price_max', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-200 text-base"
                      />
                    </div>
                  </div>
                  <div className="mt-3 text-neutral-300">Sizes:</div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {SIZES.map(size => (
                      <label key={size} className="flex items-center gap-1 rounded-full px-2 py-1 bg-zinc-800 text-neutral-200 font-medium cursor-pointer">
                        <input type="checkbox" checked={p.sizes.includes(size)} onChange={() => handleProductSizeChange(i, size)} className="rounded-full accent-amber-200" /> {size}
                      </label>
                    ))}
                  </div>
                  <div className="mt-3">
                    <b className="text-neutral-200">Color Variants:</b>
                    <div className="mt-3">
                      {p.color_variants.map((cv, cidx) => (
                        <div key={cidx} className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-200 text-base"
                            placeholder="Color name"
                            value={cv.color}
                            onChange={e => handleColorVariantChange(i, cidx, 'color', e.target.value)}
                          />
                          {cidx === 0 && (
                            <span className="text-neutral-400">Uses main product image</span>
                          )}
                          {cidx > 0 && (
                            <FileUploader
                              bucket="product-images"
                              userId={form.email || 'designer'}
                              onUpload={url => handleColorVariantChange(i, cidx, 'image_url', url)}
                              label="Upload"
                            />
                          )}
                          {cv.image_url && (
                            <Image src={cv.image_url} alt={cv.color} width={32} height={32} className="h-8 w-8 rounded-full mt-1 border border-amber-200 object-cover" />
                          )}
                          {p.color_variants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeColorVariant(i, cidx)}
                              className="text-red-400 font-bold text-lg bg-transparent border-none cursor-pointer"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => addColorVariant(i)}
                      className="mt-2 px-3 py-1 bg-white text-zinc-900 rounded-full shadow hover:bg-neutral-200"
                    >
                      Add color variant
                    </button>
                  </div>
                  <div className="mt-3">
                    <select name="inventory_status" value={p.inventory_status} onChange={e => handleProductChange(i, 'inventory_status', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-200 text-base">
                      <option value="">Inventory Status</option>
                      {INVENTORY_STATUS.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addProduct} className="mb-4 px-4 py-2 bg-white text-zinc-900 rounded-full shadow hover:bg-neutral-200">Add another product</button>
              <div className="mb-4" />
              <div className="flex justify-between mt-6">
                <button type="button" className="rounded-full bg-zinc-800 hover:bg-zinc-700 text-neutral-200 font-bold px-8 py-2 shadow transition" onClick={() => setStep(1)}>Back</button>
                <button type="button" className="rounded-full bg-white hover:bg-neutral-200 text-zinc-900 font-bold px-8 py-2 shadow-lg transition" onClick={() => { if (validateStep()) setStep(3); }}>Next</button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-neutral-200 flex items-center gap-2">🌐 Socials</h2>
              <input name="instagram" placeholder="Instagram" value={form.instagram} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-200 text-base mb-3" />
              <input name="tiktok" placeholder="TikTok" value={form.tiktok} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-200 text-base mb-3" />
              <input name="website" placeholder="Website (optional)" value={form.website} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-200 text-base mb-3" />
              <div className="flex justify-between mt-6">
                <button type="button" className="rounded-full bg-zinc-800 hover:bg-zinc-700 text-neutral-200 font-bold px-8 py-2 shadow transition" onClick={() => setStep(2)}>Back</button>
                <button type="button" className="rounded-full bg-white hover:bg-neutral-200 text-zinc-900 font-bold px-8 py-2 shadow-lg transition" onClick={() => { if (validateStep()) setStep(4); }}>Next</button>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-neutral-200 flex items-center gap-2">✅ Legal & Consent</h2>
              <div className="mb-3 text-neutral-300">Selling As:</div>
              <div className="flex gap-4 mb-3">
                {SELLING_AS.map(s => (
                  <label key={s} className="flex items-center gap-2 rounded-full px-3 py-1 bg-zinc-800 text-neutral-200 font-medium cursor-pointer">
                    <input type="radio" name="selling_as" value={s} checked={form.selling_as === s} onChange={handleChange} className="rounded-full accent-amber-200" /> {s}
                  </label>
                ))}
              </div>
              <input name="iban" placeholder="IBAN (optional)" value={form.iban} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-200 text-base mb-3" />
              <label className="flex items-center gap-2 mb-2 text-neutral-300">
                <input type="checkbox" name="owns_rights" checked={form.owns_rights} onChange={handleChange} className="rounded-full accent-amber-200" /> I own the rights to all content
              </label>
              <label className="flex items-center gap-2 mb-4 text-neutral-300">
                <input type="checkbox" name="accept_terms" checked={form.accept_terms} onChange={handleChange} className="rounded-full accent-amber-200" /> I accept the terms and conditions
              </label>
              <div className="mb-4 p-3 bg-zinc-800 rounded-2xl">
                <b className="text-neutral-200">Fulfillment Preference:</b><br />
                {FULFILLMENT.map(f => (
                  <label key={f.value} className="block mb-2 rounded-full px-3 py-1 bg-zinc-900 text-neutral-200 font-medium cursor-pointer">
                    <input type="radio" name="fulfillment" value={f.value} checked={form.fulfillment === f.value} onChange={handleChange} className="mr-2 rounded-full accent-amber-200" /> {f.label}
                  </label>
                ))}
              </div>
              <div className="flex justify-between mt-6">
                <button type="button" className="rounded-full bg-zinc-800 hover:bg-zinc-700 text-neutral-200 font-bold px-8 py-2 shadow transition" onClick={() => setStep(3)}>Back</button>
                <button type="button" className="rounded-full bg-white hover:bg-neutral-200 text-zinc-900 font-bold px-8 py-2 shadow-lg transition" onClick={() => { if (validateStep()) alert(JSON.stringify(form, null, 2)); }}>Submit</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 
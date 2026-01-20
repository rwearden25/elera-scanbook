import React, { useState, useEffect, useRef, createContext, useContext } from 'react';

// Dark Mode Context
const DarkModeContext = createContext();

const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) throw new Error('useDarkMode must be used within DarkModeProvider');
  return context;
};

const DarkModeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('elera_darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('elera_darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <DarkModeContext.Provider value={{ darkMode, setDarkMode, toggleDarkMode: () => setDarkMode(d => !d) }}>
      {children}
    </DarkModeContext.Provider>
  );
};

// Copy Button Component
const CopyButton = ({ text, label = "Copy" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`text-xs px-2 py-1 rounded transition cursor-pointer ${
        copied 
          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
          : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300'
      }`}
    >
      {copied ? '✓ Copied!' : label}
    </button>
  );
};

// Dark Mode Toggle Button
const DarkModeToggle = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition cursor-pointer"
      title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {darkMode ? '☀️' : '🌙'}
    </button>
  );
};

// Barcode component using canvas (1D linear barcode)
const Barcode = ({ value, height = 60 }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!canvasRef.current || !value) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const code = String(value).replace(/[^0-9]/g, '');
    const barWidth = 2;
    const width = code.length * 11 * barWidth + 40;
    canvas.width = width;
    canvas.height = height + 20;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height + 20);
    ctx.fillStyle = '#000000';
    
    let x = 20;
    const patterns = {
      '0': '1110010', '1': '1100110', '2': '1101100', '3': '1000010',
      '4': '1011100', '5': '1001110', '6': '1010000', '7': '1000100',
      '8': '1001000', '9': '1110100'
    };
    
    ctx.fillRect(x, 0, barWidth, height); x += barWidth * 2;
    ctx.fillRect(x, 0, barWidth, height); x += barWidth * 2;
    
    for (const digit of code) {
      const pattern = patterns[digit] || patterns['0'];
      for (const bit of pattern) {
        if (bit === '1') ctx.fillRect(x, 0, barWidth, height);
        x += barWidth;
      }
      x += barWidth;
    }
    
    ctx.fillRect(x, 0, barWidth, height); x += barWidth * 2;
    ctx.fillRect(x, 0, barWidth, height);
    
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(value, width / 2, height + 15);
  }, [value, height]);
  
  return <canvas ref={canvasRef} style={{ maxWidth: '100%' }} />;
};

// GS1 DataMatrix 2D barcode component using bwip-js
const DataMatrixBarcode = ({ value, gs1Data, size = 150 }) => {
  const canvasRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Load bwip-js from CDN if not already loaded
    if (!window.bwipjs) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/bwip-js/4.1.2/bwip-js.min.js';
      script.onload = () => setLoaded(true);
      script.onerror = () => setError(true);
      document.head.appendChild(script);
    } else {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded || !canvasRef.current || !window.bwipjs) return;
    
    try {
      // Format GS1 data - bwip-js expects the data without parentheses for encoding
      // but with FNC1 separators. The parentheses format works with parse option.
      const barcodeData = gs1Data || `(01)${value}`;
      
      window.bwipjs.toCanvas(canvasRef.current, {
        bcid: 'datamatrix',
        text: barcodeData,
        scale: 4,
        padding: 5,
        parsefnc: true,
      });
      setError(false);
    } catch (e) {
      console.error('Barcode generation error:', e);
      // Try simpler datamatrix without GS1 formatting
      try {
        const simpleData = value.replace(/[^0-9]/g, '');
        window.bwipjs.toCanvas(canvasRef.current, {
          bcid: 'datamatrix',
          text: simpleData,
          scale: 4,
          padding: 5,
        });
        setError(false);
      } catch (e2) {
        console.error('Fallback barcode error:', e2);
        setError(true);
      }
    }
  }, [loaded, value, gs1Data, size]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border-2 border-dashed border-purple-300 dark:border-purple-700" style={{ width: 140, minHeight: 140 }}>
        <span className="text-3xl mb-2">📊</span>
        <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 text-center">GS1 2D DataMatrix</span>
        <span className="text-xs font-mono text-purple-600 dark:text-purple-400 mt-1 text-center break-all px-2">{value}</span>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse" style={{ width: 140, height: 140 }}>
        <span className="text-slate-400 dark:text-slate-500 text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} style={{ maxWidth: '100%' }} />
    </div>
  );
};

// Code 128 barcode component for alphanumeric codes (like Rx prescriptions)
const Code128Barcode = ({ value, height = 60 }) => {
  const canvasRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!window.bwipjs) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/bwip-js/4.1.2/bwip-js.min.js';
      script.onload = () => setLoaded(true);
      script.onerror = () => setError(true);
      document.head.appendChild(script);
    } else {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded || !canvasRef.current || !window.bwipjs) return;
    
    try {
      window.bwipjs.toCanvas(canvasRef.current, {
        bcid: 'code128',
        text: value,
        scale: 2,
        height: 12,
        includetext: true,
        textxalign: 'center',
        textsize: 10,
        padding: 5,
      });
      setError(false);
    } catch (e) {
      console.error('Code128 barcode error:', e);
      setError(true);
    }
  }, [loaded, value, height]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border-2 border-dashed border-indigo-300 dark:border-indigo-700" style={{ minWidth: 150 }}>
        <span className="text-2xl mb-1">📋</span>
        <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Code 128</span>
        <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mt-1">{value}</span>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse" style={{ width: 150, height: 80 }}>
        <span className="text-slate-400 dark:text-slate-500 text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} style={{ maxWidth: '100%' }} />
    </div>
  );
};

// Grocery Scanbook Data
const groceryData = {
  title: "Grocery and General Merchandise POS Test Script",
  loyaltyAccounts: [
    { name: "Leo Anders", email: "leo.anders@yemail.com", phone: "(919) 555-2222", address: "1457 Oak Grove Lane, Cary, NC" },
    { name: "Anna Schmidt", email: "anna.schmidt@myemail.com", phone: "(919) 555-1111", address: "1746 Willow Creek Road" },
    { name: "Elana Rossi", email: "e.rossi@myemail.com", phone: "(919) 555-3333", address: "3892 Pine Meadow Drive" },
    { name: "John Smith", email: "laura.hernandez@myemail.com", phone: "(919) 555-4444", address: "3050 Elmwood Drive" }
  ],
  tests: [
    { id: 1, name: "Basic Transaction", type: "AMOUNT_OFF", promotion: "Tiered Promo Fresca", valid: "Jul 23, 2025 - Jul 30, 2099", discount: "Buy 1-4 Save $0.05; Buy 5-9 Save $0.10; Buy 10+ Save $0.15", steps: "Scan Campbell's HR Cream of Mushroom, Spaghetti Sauce, Fresca. Complete cash payment.", notes: null, items: [{ name: "Campbell's HR Cream of Mushroom", sku: "5100006007", barcode: "05100006007" }, { name: "Spaghetti Sauce", sku: "3620001375", barcode: "03620001375" }, { name: "Fresca", sku: "4900005028", barcode: "04900005028" }] },
    { id: 2, name: "Age Verification", type: "PERCENT_OFF", promotion: "10% Off 4+ Vinos", valid: "Jul 23, 2025 - Jul 30, 2099", discount: "10% OFF when buying 4+ bottles", steps: "Scan Wine bottles, verify ID check prompt appears (21+).", notes: "Age: 21+", items: [{ name: "Casa Donoso Carmenere 2023", sku: "7804309004249", barcode: "7804309004249" }, { name: "Red Wine", sku: "9705400233", barcode: "897054002339" }, { name: "White Wine", sku: "8858600636", barcode: "088586006364" }] },
    { id: 3, name: "Weight Entry", type: "PERCENT_OFF", promotion: "Promo Frutas y Verduras 30% cliente Diamante", valid: "Jul 23, 2025 - Jul 30, 2099", discount: "30% OFF for Diamond Customers", steps: "Scan Bananas (4011), verify scale prompt for weight entry.", notes: "Days: Tuesday, Wednesday only • Segment: Diamond Customers", items: [{ name: "Bananas / Platanos (PLU)", sku: "4011", barcode: "4011" }] },
    { id: 4, name: "BOGO Promotion", type: "PERCENT_OFF / FINAL_PRICE", promotion: "BOGO 50% Ibuprofen / BOGO Gratis Chocolate", valid: "Jul 23, 2025 - Jul 30, 2099", discount: "50% OFF second item / Buy One Get One Free", steps: "Scan 2x Pocky Chocolate, verify BOGO discount applies.", notes: null, items: [{ name: "Pocky Chocolate", sku: "7314111081", barcode: "07314111081" }, { name: "Pocky Chocolate", sku: "7314115233", barcode: "073141152334" }, { name: "Ibuprofen tablets 200mg", sku: "5042830876", barcode: "050428308769" }] },
    { id: 5, name: "Multi-Buy Deal", type: "AMOUNT_OFF", promotion: "Buy 3 Candy Bars, Save $1", valid: "Jul 23, 2025 - Jul 30, 2099", discount: "$1 OFF when buying 3 candy bars", steps: "Scan 3x Candy Bars, verify $1 savings combo price.", notes: null, items: [{ name: "Mounds Bar", sku: "3400000031", barcode: "03403109" }, { name: "Reese's Peanut Butter Cups", sku: "3400000480", barcode: "03448005" }, { name: "PayDay King Size", sku: "1070080727", barcode: "010700807274" }, { name: "Hershey's King Milk Chocolate", sku: "3400000220", barcode: "03422007" }, { name: "Hershey's Milk Chocolate Bar", sku: "3400000240", barcode: "034000002405" }] },
    { id: 6, name: "Loyalty Points", type: "POINTS", promotion: "Loyalty Points Program", valid: "Jul 23, 2025 - Jul 30, 2099", discount: "Earn 500 Loyalty Points on qualifying purchases", steps: "Scan Coffee with loyalty card, verify 500 points earned.", notes: "Points: 500 points per purchase", items: [{ name: "Coffee Beans", sku: "79849310320", barcode: "79849310320" }, { name: "365 Coffee Pleasant Morning Buzz", sku: "9948243520", barcode: "099482435202" }] },
    { id: 7, name: "Quantity Entry", type: "QTY_REQUIRED", promotion: "Produce Quantity Item", valid: "Jul 23, 2025 - Jul 30, 2099", discount: "Enter quantity at prompt", steps: "Scan Lemons (4033), verify quantity prompt appears.", notes: "Quantity entry required", items: [{ name: "Lemons / Limon (PLU)", sku: "4033", barcode: "4033" }, { name: "Lime (PLU)", sku: "4048", barcode: "4048" }] },
    { id: 8, name: "Continuity Promotion", type: "CONTINUITY / FREE_ITEM", promotion: "Continuity: Buy 10, Get 1 Free", valid: "Jul 23, 2025 - Jul 30, 2099", discount: "Buy 10 over multiple visits, get 11th FREE", steps: "Buy 10 coffees over multiple visits, get 1 FREE. Scan Coffee items with loyalty card.", notes: "Loyalty card required to track visits • Progress tracked across transactions", items: [{ name: "365 Coffee Pleasant Morning Buzz", sku: "9948243520", barcode: "099482435202" }, { name: "Coffee Beans", sku: "79849310320", barcode: "79849310320" }, { name: "Frederik's MI Cherry Ground Coffee", sku: "76023614994", barcode: "760236149941" }, { name: "Frederik's Mackinac Island Fudge", sku: "76023615016", barcode: "760236150169" }] }
  ]
};

// Convenience / Fuel Scanbook Data
const convenienceData = {
  title: "Convenience and Fuel POS Test Script",
  loyaltyAccounts: groceryData.loyaltyAccounts,
  tests: [
    { id: 1, name: "Bundle Meal Deal", type: "BUNDLE_PRICE", promotion: "Spaghetti Night $5 Meal Deal", valid: "Jul 23, 2025 - Jul 30, 2099", discount: "$5 Bundle Price for all 3 items", steps: "Scan Spaghetti Noodles, Spaghetti Sauce, and Parmesan Cheese. Verify bundle price of $5 applies.", notes: null, items: [{ name: "Spaghetti Noodles", sku: "2920090794", barcode: "02920090794" }, { name: "Spaghetti Sauce", sku: "3620001375", barcode: "03620001375" }, { name: "Parmesan Cheese", sku: "2100061531", barcode: "02100061531" }] },
    { id: 2, name: "King Size Candy Deal", type: "PERCENT_OFF", promotion: "2KingSizePB", valid: "Sep 12, 2025 - Sep 19, 2099", discount: "20% OFF when buying 2", steps: "Scan 2x King Size Reese's Peanut Butter Cups. Verify 20% discount applies to both items.", notes: null, items: [{ name: "King Size Reese's PB Cups", sku: "3400000480", barcode: "03400000480" }] },
    { id: 3, name: "Clearance Sale", type: "FINAL_PRICE", promotion: "PayDayKingCloseout", valid: "Sep 12, 2025 - Sep 19, 2099", discount: "Final Price: $0.50", steps: "Scan PayDay King Size candy bar. Verify clearance price of $0.50 applies regardless of original price.", notes: null, items: [{ name: "PayDay King Size", sku: "1070080727", barcode: "01070080727" }] },
    { id: 4, name: "Cross-Category Deal", type: "PERCENT_OFF", promotion: "Buy 2 Dove Products Get 50% Off Razors", valid: "Jul 31, 2025 - Aug 7, 2099", discount: "50% OFF Razors", steps: "Scan 2 Dove products (Body Wash or Soap), then scan Razor pack. Verify 50% discount on razors.", notes: "Requires 2 Dove products to trigger discount on razors", items: [{ name: "Dove Body Wash", sku: "1111101845", barcode: "01111101845" }, { name: "Dove Soap Bar", sku: "7940061203", barcode: "07940061203" }, { name: "Razor Pack", sku: "88867009863", barcode: "88867009863" }] },
    { id: 5, name: "S'mores Bundle", type: "AMOUNT_OFF", promotion: "Save $1 On Smores Ingredients", valid: "Jul 31, 2025 - Aug 7, 2099", discount: "$1 OFF when buying all 3 items", steps: "Scan Chocolate Bars, Graham Crackers, and Marshmallows. Verify $1 discount applies to basket.", notes: "All 3 items required to trigger discount", items: [{ name: "Hershey's Chocolate Bars", sku: "3400029005", barcode: "03400029005" }, { name: "Graham Crackers", sku: "4400000463", barcode: "04400000463" }, { name: "Marshmallows", sku: "60069900328", barcode: "60069900328" }] },
    { id: 6, name: "Toys Threshold Deal", type: "AMOUNT_OFF", promotion: "Spend $50 on Toys Save $15 on Plush", valid: "Oct 23, 2025 - Oct 30, 2025", discount: "$15 OFF Plush toys", steps: "Add $50+ of toy items to cart, then scan Plush toy. Verify $15 discount applies to plush item.", notes: "Must spend $50 on toys before plush discount triggers", items: [{ name: "Toy Item 1", sku: "195464719176", barcode: "195464719176" }, { name: "Toy Item 2", sku: "195464731161", barcode: "195464731161" }, { name: "Plush Toy", sku: "19190845753", barcode: "19190845753" }] },
    { id: 7, name: "Closeout Sale", type: "PERCENT_OFF", promotion: "MixedNutCloseout", valid: "Oct 22, 2025 - Oct 24, 2025", discount: "50% OFF (Clearance)", steps: "Scan Mixed Nuts can. Verify 50% clearance discount applies automatically.", notes: "Limited time closeout - 3 days only", items: [{ name: "Mixed Nuts Can", sku: "2900001665", barcode: "02900001665" }] },
    { id: 8, name: "Loyalty Segment Deal", type: "AMOUNT_OFF", promotion: "Customer Segment Promotion", valid: "Dec 1, 2025 - Dec 9, 2042", discount: "$3 OFF per item", steps: "Scan loyalty card (must be in target segment), then scan CeraVe product. Verify $3 discount per item.", notes: "Requires customer to be in specific loyalty segment", items: [{ name: "CeraVe Moisturizing Cream", sku: "3606000537750", barcode: "3606000537750" }] }
  ]
};

// Pharmacy Section Data with nested categories and promotions
const pharmacyData = {
  title: "Pharmacy",
  categories: [
    {
      id: "pharmacy",
      name: "Pharmacy",
      icon: "💊",
      items: [
        { name: "Allergy Cetirizine Hydrochloride", sku: "31191716320", uom: "EA" },
        { name: "Bacitracin", sku: "5042835827", uom: "EA" },
        { name: "Calcium/D3 600mg", sku: "5042834903", uom: "EA" },
        { name: "Famotidine Complete Berry 50 ct", sku: "71373364851", uom: "EA" },
        { name: "Ibuprofen tablets 200mg", sku: "5042830876", uom: "EA" },
        { name: "NB Hair, Skin, Nails Gummies", sku: "7431253545", uom: "EA" },
        { name: "Neutrogena Sun SPF 55 3 pack", sku: "88517181403", uom: "EA" },
        { name: "Sudafed", sku: "90003000000", uom: "EA" }
      ]
    },
    {
      id: "beauty",
      name: "Beauty / Personal Care",
      icon: "✨",
      items: [
        { name: "CeraVe Foaming Facial Cleanser", sku: "3606000537750", uom: "EACH" },
        { name: "Cinnamon Crest", sku: "3700042729", uom: "EA" },
        { name: "Colgate Optic White Toothpaste", sku: "3500045836", uom: "EA" },
        { name: "Colgate Optic White Toothpaste Icy Fresh", sku: "3500097159", uom: "EA" },
        { name: "Crest Gum Detoxify Toothpaste", sku: "3700075421", uom: "EA" },
        { name: "Dove Mens Bar", sku: "1111101845", uom: "EA" },
        { name: "Dove Mens Shampoo/Conditioner", sku: "7940061203", uom: "EA" },
        { name: "GUM Toothbrush", sku: "7094212310", uom: "EA" },
        { name: "Glowing Vitamin C Sheet Mask", sku: "10266", uom: "EA" },
        { name: "Rejuv Niacinamide Sheet Mask", sku: "10271", uom: "EA" },
        { name: "SS 3 piece Nail Files", sku: "71789710131", uom: "EA" },
        { name: "SS Hand Lotion Peppermint", sku: "71789710033", uom: "EA" },
        { name: "SS Hand Lotion Winter Berry", sku: "71789710032", uom: "EA" },
        { name: "SS Lip Balm Sugar Cookie", sku: "71789710037", uom: "EA" },
        { name: "Speed Stick", sku: "2220000490", uom: "EA" },
        { name: "Toms Luminous White", sku: "7732647014", uom: "EA" },
        { name: "Toms Unscented Deoderant", sku: "7732661425", uom: "EA" },
        { name: "Triple Blade Razors", sku: "88867009863", uom: "EA" }
      ]
    }
  ]
};

// GS1 2D DataMatrix Items
const gs1DataItems = {
  title: "GS1-2D DataMatrix Barcodes",
  subtitle: "Barcodes with embedded GS1 Application Identifiers for compliance validation",
  categories: [
    {
      id: "compliance",
      name: "Compliance Validation",
      icon: "✅",
      description: "Items with AI 01 (GTIN) and AI 16 (Sell-By Date) for demonstrating compliance validation.",
      items: [
        { name: "Milk - EXPIRED", sku: "00049000000443", gtin: "00049000000443", gs1String: "0100049000000443162512", gs1Display: "(01)00049000000443(16)251215", barcodeType: "GS1 2D", note: "AI 16: Sell-by 2025-12-15 (PAST) - Will trigger compliance block", status: "expired" },
        { name: "Milk - FRESH", sku: "00049000000443", gtin: "00049000000443", gs1String: "0100049000000443162603", gs1Display: "(01)00049000000443(16)260315", barcodeType: "GS1 2D", note: "AI 16: Sell-by 2026-03-15 (VALID) - Will pass compliance check", status: "valid" },
        { name: "Beer", sku: "00018017220018", gtin: "00018017220018", gs1String: "0100018017220018", gs1Display: "(01)00018017220018", barcodeType: "GS1 2D", note: "Age verification required (21+) - Will prompt for ID check", status: "age-verify" }
      ]
    },
    {
      id: "allergy",
      name: "Allergy Products",
      icon: "💊",
      description: "$5 OFF promotion when 2+ allergy products are purchased together.",
      items: [
        { name: "Zyrtec Allergy Relief", sku: "31191716320", gtin: "03119171632008", gs1String: "0103119171632008", gs1Display: "(01)03119171632008", barcodeType: "GS1 2D", note: "Allergy promotion item" },
        { name: "Sudafed Decongestant", sku: "90003000000", gtin: "09000300000004", gs1String: "0109000300000004", gs1Display: "(01)09000300000004", barcodeType: "GS1 2D", note: "Allergy promotion item" }
      ]
    },
    {
      id: "loyalty",
      name: "Loyalty Discount Items",
      icon: "🎁",
      description: "Items for demonstrating loyalty card discount application at front-end checkout.",
      items: [
        { name: "Winter Gloves", sku: "88888000001", gtin: "08888800000109", gs1String: "0108888800000109", gs1Display: "(01)08888800000109", barcodeType: "GS1 2D", note: "Loyalty discount item" }
      ]
    },
    {
      id: "pharmacy",
      name: "Pharmacy / Rx",
      icon: "💉",
      description: "Sample prescription barcode for pharmacy pickup demonstration.",
      items: [
        { name: "Prescription (Rx)", sku: "RX123456789", barcode: "RX123456789", barcodeType: "Code 128", note: "McKesson integration demo - verify format with ELERA pharmacy team" }
      ]
    }
  ]
};

// Items Data - Department catalog
const itemsData = {
  title: "Item Catalog Browser",
  groups: [
    { id: "Dept_100_Entree", name: "100 Entree", items: [
        { name: "Cheeseburger", sku: "917001", uom: "EA" },
        { name: "Chicken Biscuit", sku: "917101", uom: "EA" },
        { name: "Chicken Sandwich", sku: "917100", uom: "EA" },
        { name: "Chicken Tenders", sku: "917102", uom: "EA" },
        { name: "Hamburger", sku: "917000", uom: "EA" },
        { name: "Hot Dog", sku: "917002", uom: "EA" },
        { name: "Pizza Slice", sku: "917200", uom: "EA" }
      ] },
    { id: "Dept_101_Sides", name: "101 Sides", items: [
        { name: "Fries Large", sku: "917502", uom: "EA" },
        { name: "Fries Medium", sku: "917501", uom: "EA" },
        { name: "Fries Small ", sku: "917500", uom: "EA" }
      ] },
    { id: "Dept_102_Drinks", name: "102 Drinks", items: [
        { name: "Drink Large", sku: "917802", uom: "EA" },
        { name: "Drink Medium", sku: "917801", uom: "EA" },
        { name: "Drink Small", sku: "917800", uom: "EA" },
        { name: "Olipop", sku: "850027702889", uom: "EACH" },
        { name: "Water", sku: "917810", uom: "EA" }
      ] },
    { id: "Dept_5_Candy", name: "5 Candy", items: [
        { name: "Almond Joy", sku: "3400000320", uom: "EA" },
        { name: "Hershey's Milk Chocolate Bar", sku: "3400000240", uom: "EA" },
        { name: "KitKat", sku: "3400000246", uom: "EA" },
        { name: "M&Ms", sku: "4000000031", uom: "EACH" },
        { name: "Reese's Peanut Butter Cups", sku: "3400000440", uom: "EA" },
        { name: "Snickers", sku: "4000000021", uom: "EA" }
      ] },
    { id: "Dept_6_Snacks", name: "6 Snacks", items: [
        { name: "Cheetos", sku: "28400040112", uom: "EACH" },
        { name: "Doritos", sku: "2840009089", uom: "EACH" },
        { name: "Pringles Original", sku: "3800013841", uom: "EA" },
        { name: "SmartFood Popcorn", sku: "2840031413", uom: "EA" }
      ] },
    { id: "Dept_2B_Weighed", name: "2B Weighed Produce", items: [
        { name: "Banana", sku: "4011", uom: "LB" },
        { name: "Broccoli", sku: "4060", uom: "LB" },
        { name: "Fuji Apple", sku: "4131", uom: "LB" },
        { name: "Granny Smith Apple", sku: "4018", uom: "LB" }
      ] },
    { id: "Dept_2A_QtyRequired", name: "2A Qty Required", items: [
        { name: "Lemons", sku: "4033", uom: "EACH" },
        { name: "Lime", sku: "4048", uom: "EA" },
        { name: "Hass Avocado", sku: "4046", uom: "EA" }
      ] }
  ]
};

const typeColors = {
  'AMOUNT_OFF': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'PERCENT_OFF': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'PERCENT_OFF / FINAL_PRICE': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  'POINTS': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'QTY_REQUIRED': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  'CONTINUITY / FREE_ITEM': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  'BUNDLE_PRICE': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  'FINAL_PRICE': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

// Add Item Modal Component
const AddItemModal = ({ isOpen, onClose, onSave, editItem, departments }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    uom: 'EA',
    department: 'Custom_Items'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editItem) {
      setFormData({
        name: editItem.name,
        sku: editItem.sku,
        uom: editItem.uom,
        department: editItem.department || 'Custom_Items'
      });
    } else {
      setFormData({ name: '', sku: '', uom: 'EA', department: 'Custom_Items' });
    }
    setErrors({});
  }, [editItem, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Item name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (formData.sku.length > 20) newErrors.sku = 'SKU must be 20 characters or less';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        ...formData,
        id: editItem?.id || Date.now().toString()
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {editItem ? 'Edit Item' : 'Add New Item'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Item Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${errors.name ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
              placeholder="e.g., Organic Milk"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SKU / Barcode *</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono ${errors.sku ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
              placeholder="e.g., 123456789012"
            />
            {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unit of Measure</label>
              <select
                value={formData.uom}
                onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="EA">EA (Each)</option>
                <option value="EACH">EACH</option>
                <option value="LB">LB (Pound)</option>
                <option value="KG">KG (Kilogram)</option>
                <option value="OZ">OZ (Ounce)</option>
                <option value="GAL">GAL (Gallon)</option>
                <option value="PK">PK (Pack)</option>
                <option value="CS">CS (Case)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Custom_Items">Custom Items</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition cursor-pointer"
            >
              {editItem ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">🗑️</div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Delete Item?</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Are you sure you want to delete "<strong>{itemName}</strong>"? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Login Component
const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (username === 'admin' && password === 'elera2025') {
      onLogin(username);
    } else if (username === 'demo' && password === 'demo') {
      onLogin(username);
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">TOSHIBA</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 tracking-widest">GLOBAL COMMERCE SOLUTIONS</p>
          <div className="mt-4 h-1 w-20 bg-red-600 mx-auto rounded"></div>
          <h2 className="mt-4 text-xl font-semibold text-slate-700 dark:text-slate-200">ELERA Scanbook Portal</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={handleKeyDown} className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white dark:bg-slate-700 text-slate-900 dark:text-white" placeholder="Enter username" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white dark:bg-slate-700 text-slate-900 dark:text-white" placeholder="Enter password" />
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">{error}</p>}
          <button type="button" onClick={handleLogin} className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition duration-200 cursor-pointer">Sign In</button>
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">Version 2.1 • United States Edition 2026</p>
      </div>
    </div>
  );
};

// Category Card Component
const CategoryCard = ({ title, icon, description, itemCount, onClick, available }) => (
  <div onClick={available ? onClick : null} className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 transition duration-300 ${available ? 'cursor-pointer hover:shadow-xl hover:scale-105 border-2 border-transparent hover:border-red-500' : 'opacity-60 cursor-not-allowed'}`}>
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{description}</p>
    <div className="flex items-center justify-between">
      <span className={`text-xs font-medium px-3 py-1 rounded-full ${available ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
        {available ? `${itemCount} ${itemCount === 1 ? 'Item' : 'Items'}` : 'Coming Soon'}
      </span>
      {available && <span className="text-red-600 dark:text-red-400 font-medium text-sm">View →</span>}
    </div>
  </div>
);

// Dashboard Component
const Dashboard = ({ user, onSelectCategory, onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customItems] = useState(() => {
    const saved = localStorage.getItem('elera_customItems');
    return saved ? JSON.parse(saved) : [];
  });
  const totalItems = itemsData.groups.reduce((sum, g) => sum + g.items.length, 0) + customItems.length;
  const pharmacyItems = pharmacyData.categories.reduce((sum, c) => sum + c.items.length, 0);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      onSelectCategory('items', searchTerm.trim());
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">TOSHIBA</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 tracking-wider">ELERA SCANBOOK PORTAL</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search items..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                onKeyDown={handleSearch}
                className="px-4 py-2 pl-9 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent w-48 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" 
              />
              <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <DarkModeToggle />
            <span className="text-sm text-slate-600 dark:text-slate-300">Welcome, <strong>{user}</strong></span>
            <button onClick={onLogout} className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 font-medium cursor-pointer">Sign Out</button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Select Retail Vertical</h2>
          <p className="text-slate-600 dark:text-slate-400">Choose a category to access POS test scenarios and scannable barcodes</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CategoryCard title="Grocery and General Merchandise" icon="🛒" description="Full-service grocery POS testing with produce, promotions, and loyalty programs." itemCount={8} onClick={() => onSelectCategory('grocery')} available={true} />
          <CategoryCard title="Convenience and Fuel" icon="⛽" description="C-store and fuel station POS scenarios including bundles, clearance, and loyalty segments." itemCount={8} onClick={() => onSelectCategory('convenience')} available={true} />
          <CategoryCard title="Items" icon="📦" description="Browse the complete item catalog with SKUs, barcodes, and department groupings." itemCount={totalItems} onClick={() => onSelectCategory('items')} available={true} />
          <CategoryCard title="Pharmacy" icon="💊" description="Pharmacy and beauty items with OTC medications, skincare, and personal care products." itemCount={pharmacyItems} onClick={() => onSelectCategory('pharmacy')} available={true} />
          <CategoryCard title="GS1-2D Barcodes" icon="📊" description="GS1 2D DataMatrix barcodes with embedded Application Identifiers for compliance validation." itemCount={7} onClick={() => onSelectCategory('gs1')} available={true} />
        </div>
      </main>
    </div>
  );
};

// Test Card Component
const TestCard = ({ test, onSelect, isSelected }) => (
  <div onClick={() => onSelect(test.id)} className={`p-4 rounded-lg cursor-pointer transition ${isSelected ? 'bg-red-50 dark:bg-red-900/30 border-2 border-red-500' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-600'}`}>
    <div className="flex items-start justify-between mb-2">
      <span className="text-xs font-bold text-slate-400 dark:text-slate-500">TEST {test.id}</span>
      <span className={`text-xs px-2 py-1 rounded-full ${typeColors[test.type] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>{test.type}</span>
    </div>
    <h4 className="font-semibold text-slate-800 dark:text-white">{test.name}</h4>
    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{test.items.length} items</p>
  </div>
);

// Scanbook View Component
const ScanBookView = ({ category, onBack }) => {
  const [selectedTest, setSelectedTest] = useState(1);
  const [showAccounts, setShowAccounts] = useState(false);
  const data = category === 'convenience' ? convenienceData : groceryData;
  const currentTest = data.tests.find(t => t.id === selectedTest);
  const headerGradient = category === 'convenience' ? 'from-amber-600 to-orange-700' : 'from-red-600 to-red-700';

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
      <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white cursor-pointer">← Back</button>
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 hidden sm:block"></div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-white">{data.title}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">United States Edition 2026 • Version 2.1</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DarkModeToggle />
            <button onClick={() => setShowAccounts(!showAccounts)} className="text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg transition cursor-pointer">{showAccounts ? 'Hide' : 'Show'} Test Accounts</button>
          </div>
        </div>
      </header>
      {showAccounts && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">Test Loyalty Accounts</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {data.loyaltyAccounts.map((account, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-3 text-sm">
                  <p className="font-semibold text-slate-800 dark:text-white">{account.name}</p>
                  <p className="text-slate-600 dark:text-slate-400 text-xs">{account.email}</p>
                  <p className="text-slate-500 dark:text-slate-500 text-xs">{account.phone}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-72 flex-shrink-0">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Test Scenarios</h3>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {data.tests.map(test => (<TestCard key={test.id} test={test} onSelect={setSelectedTest} isSelected={selectedTest === test.id} />))}
            </div>
          </div>
          <div className="flex-1">
            {currentTest && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                <div className={`bg-gradient-to-r ${headerGradient} text-white p-6`}>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">TEST {currentTest.id}</span>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{currentTest.type}</span>
                  </div>
                  <h2 className="text-2xl font-bold">{currentTest.name}</h2>
                </div>
                <div className="p-6">
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-6">
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div><span className="text-slate-500 dark:text-slate-400">Promotion:</span><p className="font-semibold text-slate-800 dark:text-white">{currentTest.promotion}</p></div>
                      <div><span className="text-slate-500 dark:text-slate-400">Valid:</span><p className="font-semibold text-slate-800 dark:text-white">{currentTest.valid}</p></div>
                      <div className="sm:col-span-2"><span className="text-slate-500 dark:text-slate-400">Discount:</span><p className="font-semibold text-green-700 dark:text-green-400">{currentTest.discount}</p></div>
                    </div>
                  </div>
                  <div className="mb-6">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Test Steps</h3>
                    <p className="text-slate-600 dark:text-slate-300 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">{currentTest.steps}</p>
                  </div>
                  {currentTest.notes && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                        <span className="text-lg">⚠️</span>
                        <span className="font-medium">{currentTest.notes}</span>
                      </div>
                    </div>
                  )}
                  <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Test Items</h3>
                  <div className="space-y-3">
                    {currentTest.items.map((item, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800 dark:text-white">{item.name}</h4>
                          <div className="flex flex-wrap gap-3 mt-1">
                            <span className="text-sm text-slate-500 dark:text-slate-400">SKU: <span className="font-mono text-slate-700 dark:text-slate-300">{item.sku}</span></span>
                            <CopyButton text={item.sku} label="Copy SKU" />
                          </div>
                        </div>
                        <div className="bg-white dark:bg-slate-600 rounded-lg p-2">
                          <Barcode value={item.barcode} height={50} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Items View Component with enhanced search and Add Items feature
const ItemsView = ({ onBack, initialSearch = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  
  // Custom items from localStorage
  const [customItems, setCustomItems] = useState(() => {
    const saved = localStorage.getItem('elera_customItems');
    return saved ? JSON.parse(saved) : [];
  });

  // Save custom items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('elera_customItems', JSON.stringify(customItems));
  }, [customItems]);

  // Build groups including custom items
  const allGroups = [...itemsData.groups];
  
  // Group custom items by department
  const customItemsByDept = customItems.reduce((acc, item) => {
    const dept = item.department || 'Custom_Items';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(item);
    return acc;
  }, {});

  // Add custom items group if there are any custom items with "Custom_Items" department
  if (customItemsByDept['Custom_Items']?.length > 0) {
    allGroups.unshift({
      id: 'Custom_Items',
      name: '⭐ Custom Items',
      items: customItemsByDept['Custom_Items'],
      isCustom: true
    });
  }

  // Merge custom items into existing departments
  const mergedGroups = allGroups.map(group => {
    if (group.id !== 'Custom_Items' && customItemsByDept[group.id]) {
      return {
        ...group,
        items: [...group.items, ...customItemsByDept[group.id].map(i => ({ ...i, isCustom: true }))]
      };
    }
    return group;
  });

  const filteredGroups = mergedGroups.map(group => ({
    ...group,
    items: group.items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  const totalFiltered = filteredGroups.reduce((sum, g) => sum + g.items.length, 0);

  const handleSaveItem = (item) => {
    if (editItem) {
      setCustomItems(prev => prev.map(i => i.id === item.id ? item : i));
    } else {
      setCustomItems(prev => [...prev, item]);
    }
    setEditItem(null);
  };

  const handleEditItem = (item) => {
    setEditItem(item);
    setShowAddModal(true);
  };

  const handleDeleteItem = () => {
    if (deleteItem) {
      setCustomItems(prev => prev.filter(i => i.id !== deleteItem.id));
      setDeleteItem(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
      <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white cursor-pointer">← Back</button>
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 hidden sm:block"></div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-white">{itemsData.title}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">{totalFiltered} items {searchTerm && `matching "${searchTerm}"`}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <input 
                type="text" 
                placeholder="Search by name or SKU..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 pl-9 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent w-full sm:w-64 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" 
              />
              <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">✕</button>
              )}
            </div>
            <DarkModeToggle />
          </div>
        </div>
      </header>
      
      {/* Action Bar - Add Item */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-white">
            <span className="font-medium">Manage Your Items</span>
            <span className="text-red-200 text-sm ml-2">• Add custom items with barcodes</span>
          </div>
          <button
            onClick={() => { setEditItem(null); setShowAddModal(true); }}
            className="px-5 py-2.5 bg-white hover:bg-slate-100 text-red-600 font-semibold rounded-lg transition cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Item
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-64 flex-shrink-0">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Departments</h3>
            <div className="space-y-1 max-h-96 lg:max-h-[calc(100vh-200px)] overflow-y-auto">
              <div onClick={() => setSelectedGroup(null)} className={`p-3 rounded-lg cursor-pointer transition text-sm ${!selectedGroup ? 'bg-red-50 dark:bg-red-900/30 border-2 border-red-500' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-red-300'}`}>
                <span className="font-medium text-slate-800 dark:text-white">All Departments</span>
                <span className="text-slate-500 dark:text-slate-400 ml-2">({totalFiltered})</span>
              </div>
              {filteredGroups.map(group => (
                <div key={group.id} onClick={() => setSelectedGroup(group.id)} className={`p-3 rounded-lg cursor-pointer transition text-sm ${selectedGroup === group.id ? 'bg-red-50 dark:bg-red-900/30 border-2 border-red-500' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-red-300'}`}>
                  <span className="font-medium text-slate-800 dark:text-white">{group.name}</span>
                  <span className="text-slate-500 dark:text-slate-400 ml-2">({group.items.length})</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <div className="grid gap-3">
              {(selectedGroup ? filteredGroups.filter(g => g.id === selectedGroup) : filteredGroups).map(group => (
                <div key={group.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                  <div className={`px-4 py-3 border-b border-slate-200 dark:border-slate-600 ${group.isCustom ? 'bg-amber-50 dark:bg-amber-900/30' : 'bg-slate-50 dark:bg-slate-700'}`}>
                    <h3 className="font-semibold text-slate-800 dark:text-white">{group.name}</h3>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {group.items.map((item, i) => (
                      <div key={item.id || i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-slate-800 dark:text-white truncate">{item.name}</h4>
                            {item.isCustom && (
                              <span className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded">Custom</span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-sm text-slate-500 dark:text-slate-400">SKU: <span className="font-mono text-slate-700 dark:text-slate-300">{item.sku}</span></span>
                            <span className="text-xs bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">{item.uom}</span>
                            <CopyButton text={item.sku} label="Copy" />
                            {item.isCustom && (
                              <>
                                <button
                                  onClick={() => handleEditItem(item)}
                                  className="text-xs px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-300 transition cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => setDeleteItem(item)}
                                  className="text-xs px-2 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-300 transition cursor-pointer"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg p-2 flex-shrink-0">
                          <Barcode value={item.sku} height={40} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {filteredGroups.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl">
                  <p className="text-slate-500 dark:text-slate-400">No items found matching "{searchTerm}"</p>
                  <button onClick={() => setSearchTerm('')} className="mt-2 text-red-600 dark:text-red-400 hover:underline cursor-pointer">Clear search</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add/Edit Item Modal */}
      <AddItemModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditItem(null); }}
        onSave={handleSaveItem}
        editItem={editItem}
        departments={itemsData.groups}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDeleteItem}
        itemName={deleteItem?.name}
      />

      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => { setEditItem(null); setShowAddModal(true); }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg hover:shadow-xl transition cursor-pointer flex items-center justify-center z-20 lg:hidden"
        title="Add New Item"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};

// Pharmacy View Component
const PharmacyView = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState(pharmacyData.categories[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const currentCategory = pharmacyData.categories.find(c => c.id === selectedCategory);
  
  const filteredItems = currentCategory?.items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
      <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white cursor-pointer">← Back</button>
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 hidden sm:block"></div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-white">{pharmacyData.title}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">{filteredItems.length} items</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 pl-9 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent w-full sm:w-48 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" 
              />
              <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <DarkModeToggle />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-72 flex-shrink-0">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Categories</h3>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {pharmacyData.categories.map(category => (
                <div key={category.id} onClick={() => setSelectedCategory(category.id)} className={`p-4 rounded-lg cursor-pointer transition ${selectedCategory === category.id ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-white text-sm">{category.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{category.items.length} items</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1">
            {currentCategory && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{currentCategory.icon}</span>
                  </div>
                  <h2 className="text-2xl font-bold">{currentCategory.name}</h2>
                </div>
                <div className="p-6">
                  <div className="grid gap-3">
                    {filteredItems.map((item, i) => (
                      <div key={i} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800 dark:text-white">{item.name}</h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-sm text-slate-500 dark:text-slate-400">SKU: <span className="font-mono text-slate-700 dark:text-slate-300">{item.sku}</span></span>
                            <span className="text-xs bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">{item.uom}</span>
                            <CopyButton text={item.sku} label="Copy" />
                          </div>
                        </div>
                        <div className="bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg p-2">
                          <Barcode value={item.sku} height={50} />
                        </div>
                      </div>
                    ))}
                    {filteredItems.length === 0 && (
                      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        No items found matching "{searchTerm}"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// GS1-2D View Component
const GS1View = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState(gs1DataItems.categories[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const currentCategory = gs1DataItems.categories.find(c => c.id === selectedCategory);
  const totalItems = gs1DataItems.categories.reduce((sum, c) => sum + c.items.length, 0);

  const filteredItems = currentCategory?.items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.gs1Display && item.gs1Display.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'expired': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800';
      case 'valid': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800';
      case 'age-verify': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800';
      default: return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600';
    }
  };

  const getBarcodeTypeBadge = (type) => {
    switch(type) {
      case 'GS1 2D': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'EAN-13': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Code 128': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
      <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white cursor-pointer">← Back</button>
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 hidden sm:block"></div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-white">{gs1DataItems.title}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">{totalItems} items • {gs1DataItems.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 pl-9 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-48 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" 
              />
              <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <DarkModeToggle />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-72 flex-shrink-0">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Categories</h3>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {gs1DataItems.categories.map(category => (
                <div key={category.id} onClick={() => setSelectedCategory(category.id)} className={`p-4 rounded-lg cursor-pointer transition ${selectedCategory === category.id ? 'bg-purple-50 dark:bg-purple-900/30 border-2 border-purple-500' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-300'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-white text-sm">{category.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{category.items.length} items</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1">
            {currentCategory && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{currentCategory.icon}</span>
                  </div>
                  <h2 className="text-2xl font-bold">{currentCategory.name}</h2>
                  <p className="mt-2 text-purple-100 text-sm">{currentCategory.description}</p>
                </div>
                <div className="p-6">
                  <div className="grid gap-4">
                    {filteredItems.map((item, i) => (
                      <div key={i} className={`border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-4 ${item.status ? getStatusBadge(item.status) : 'border-slate-200 dark:border-slate-700'}`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="font-semibold text-slate-800 dark:text-white">{item.name}</h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getBarcodeTypeBadge(item.barcodeType)}`}>{item.barcodeType}</span>
                          </div>
                          <div className="flex gap-4 mt-1 text-sm flex-wrap">
                            <span className="text-slate-500 dark:text-slate-400">SKU: <span className="font-mono text-slate-700 dark:text-slate-300">{item.sku}</span></span>
                            {item.gtin && <span className="text-slate-500 dark:text-slate-400">GTIN: <span className="font-mono text-slate-700 dark:text-slate-300">{item.gtin}</span></span>}
                          </div>
                          {item.gs1Display && (
                            <div className="mt-1 text-sm flex items-center gap-2 flex-wrap">
                              <span className="text-slate-500 dark:text-slate-400">GS1: <span className="font-mono text-purple-700 dark:text-purple-400">{item.gs1Display}</span></span>
                              <CopyButton text={item.gs1String || item.gs1Display} label="Copy GS1" />
                            </div>
                          )}
                          {item.note && (
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 italic">{item.note}</p>
                          )}
                        </div>
                        <div className="bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg p-3">
                          {item.barcodeType === 'GS1 2D' ? (
                            <DataMatrixBarcode value={item.gtin || item.sku} gs1Data={item.gs1String} size={120} />
                          ) : item.barcodeType === 'Code 128' ? (
                            <Code128Barcode value={item.barcode || item.sku} height={60} />
                          ) : (
                            <Barcode value={item.barcode || item.sku} height={50} />
                          )}
                        </div>
                      </div>
                    ))}
                    {filteredItems.length === 0 && (
                      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        No items found matching "{searchTerm}"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Main App Component
function AppContent() {
  const [user, setUser] = useState(() => localStorage.getItem('elera_user'));
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [initialSearch, setInitialSearch] = useState('');

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (e) => {
      // Always check localStorage to ensure we stay logged in
      const storedUser = localStorage.getItem('elera_user');
      if (storedUser && !user) {
        setUser(storedUser);
      }
      
      if (e.state && e.state.view) {
        setCurrentView(e.state.view);
        setSelectedCategory(e.state.category || null);
        setInitialSearch(e.state.search || '');
      } else {
        // No valid state - stay on dashboard if logged in
        setCurrentView('dashboard');
        setSelectedCategory(null);
        setInitialSearch('');
        // Replace with valid state to prevent further back issues
        window.history.replaceState({ view: 'dashboard', category: null, search: '' }, '');
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Set initial state on mount
    window.history.replaceState({ view: currentView, category: selectedCategory, search: initialSearch }, '');

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync user state with localStorage on mount and changes
  useEffect(() => {
    const storedUser = localStorage.getItem('elera_user');
    if (storedUser && !user) {
      setUser(storedUser);
    }
  }, [user]);

  const handleLogin = (username) => {
    localStorage.setItem('elera_user', username);
    setUser(username);
    window.history.replaceState({ view: 'dashboard', category: null, search: '' }, '');
  };
  const handleLogout = () => {
    localStorage.removeItem('elera_user');
    setUser(null);
    setCurrentView('dashboard');
    setSelectedCategory(null);
    setInitialSearch('');
    window.history.replaceState({ view: 'dashboard', category: null, search: '' }, '');
  };
  const handleSelectCategory = (category, search = '') => {
    setSelectedCategory(category);
    setCurrentView('scanbook');
    setInitialSearch(search);
    window.history.pushState({ view: 'scanbook', category, search }, '');
  };
  const handleBack = () => {
    window.history.back();
  };

  // Double-check localStorage before showing login
  const storedUser = localStorage.getItem('elera_user');
  if (!user && !storedUser) return <Login onLogin={handleLogin} />;
  
  // If localStorage has user but state doesn't, update state
  if (!user && storedUser) {
    setUser(storedUser);
    return null; // Will re-render with correct user
  }

  if (currentView === 'scanbook' && selectedCategory === 'items') return <ItemsView onBack={handleBack} initialSearch={initialSearch} />;
  if (currentView === 'scanbook' && selectedCategory === 'pharmacy') return <PharmacyView onBack={handleBack} />;
  if (currentView === 'scanbook' && selectedCategory === 'gs1') return <GS1View onBack={handleBack} />;
  if (currentView === 'scanbook' && selectedCategory) return <ScanBookView category={selectedCategory} onBack={handleBack} />;
  return <Dashboard user={user} onSelectCategory={handleSelectCategory} onLogout={handleLogout} />;
}

// Wrap with DarkModeProvider
export default function App() {
  return (
    <DarkModeProvider>
      <AppContent />
    </DarkModeProvider>
  );
}

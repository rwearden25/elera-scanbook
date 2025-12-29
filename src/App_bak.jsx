import React, { useState, useEffect, useRef } from 'react';

// Barcode component using canvas
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

// Grocery Scanbook Data
const groceryData = {
  title: "Grocery POS Test Script",
  loyaltyAccounts: [
    { name: "Leo Anders", email: "leo.anders@yemail.com", phone: "(919) 555-2222", address: "1457 Oak Grove Lane, Cary, NC" },
    { name: "Anna Schmidt", email: "anna.schmidt@myemail.com", phone: "(919) 555-1111", address: "1746 Willow Creek Road" },
    { name: "Elana Rossi", email: "e.rossi@myemail.com", phone: "(919) 555-3333", address: "3892 Pine Meadow Drive" },
    { name: "John Smith", email: "laura.hernandez@myemail.com", phone: "(919) 555-4444", address: "3050 Elmwood Drive" }
  ],
  tests: [
    {
      id: 1,
      name: "Basic Transaction",
      type: "AMOUNT_OFF",
      promotion: "Tiered Promo Fresca",
      valid: "Jul 23, 2025 - Jul 30, 2099",
      discount: "Buy 1-4 Save $0.05; Buy 5-9 Save $0.10; Buy 10+ Save $0.15",
      steps: "Scan Campbell's HR Cream of Mushroom, Spaghetti Sauce, Fresca. Complete cash payment.",
      notes: null,
      items: [
        { name: "Campbell's HR Cream of Mushroom", sku: "5100006007", barcode: "05100006007" },
        { name: "Spaghetti Sauce", sku: "3620001375", barcode: "03620001375" },
        { name: "Fresca", sku: "4900005028", barcode: "04900005028" }
      ]
    },
    {
      id: 2,
      name: "Age Verification",
      type: "PERCENT_OFF",
      promotion: "10% Off 4+ Vinos",
      valid: "Jul 23, 2025 - Jul 30, 2099",
      discount: "10% OFF when buying 4+ bottles",
      steps: "Scan Wine bottles, verify ID check prompt appears (21+).",
      notes: "Age: 21+",
      items: [
        { name: "Casa Donoso Carmenere 2023", sku: "7804309004249", barcode: "7804309004249" },
        { name: "Red Wine", sku: "9705400233", barcode: "897054002339" },
        { name: "White Wine", sku: "8858600636", barcode: "088586006364" }
      ]
    },
    {
      id: 3,
      name: "Weight Entry",
      type: "PERCENT_OFF",
      promotion: "Promo Frutas y Verduras 30% cliente Diamante",
      valid: "Jul 23, 2025 - Jul 30, 2099",
      discount: "30% OFF for Diamond Customers",
      steps: "Scan Bananas (4011), verify scale prompt for weight entry.",
      notes: "Days: Tuesday, Wednesday only • Segment: Diamond Customers",
      items: [
        { name: "Bananas / Platanos (PLU)", sku: "4011", barcode: "4011" }
      ]
    },
    {
      id: 4,
      name: "BOGO Promotion",
      type: "PERCENT_OFF / FINAL_PRICE",
      promotion: "BOGO 50% Ibuprofen / BOGO Gratis Chocolate",
      valid: "Jul 23, 2025 - Jul 30, 2099",
      discount: "50% OFF second item / Buy One Get One Free",
      steps: "Scan 2x Pocky Chocolate, verify BOGO discount applies.",
      notes: null,
      items: [
        { name: "Pocky Chocolate", sku: "7314111081", barcode: "07314111081" },
        { name: "Pocky Chocolate", sku: "7314115233", barcode: "073141152334" },
        { name: "Ibuprofen tablets 200mg", sku: "5042830876", barcode: "050428308769" }
      ]
    },
    {
      id: 5,
      name: "Multi-Buy Deal",
      type: "AMOUNT_OFF",
      promotion: "Buy 3 Candy Bars, Save $1",
      valid: "Jul 23, 2025 - Jul 30, 2099",
      discount: "$1 OFF when buying 3 candy bars",
      steps: "Scan 3x Candy Bars, verify $1 savings combo price.",
      notes: null,
      items: [
        { name: "Mounds Bar", sku: "3400000031", barcode: "03403109" },
        { name: "Reese's Peanut Butter Cups", sku: "3400000480", barcode: "03448005" },
        { name: "PayDay King Size", sku: "1070080727", barcode: "010700807274" },
        { name: "Hershey's King Milk Chocolate", sku: "3400000220", barcode: "03422007" },
        { name: "Hershey's Milk Chocolate Bar", sku: "3400000240", barcode: "034000002405" }
      ]
    },
    {
      id: 6,
      name: "Loyalty Points",
      type: "POINTS",
      promotion: "Loyalty Points Program",
      valid: "Jul 23, 2025 - Jul 30, 2099",
      discount: "Earn 500 Loyalty Points on qualifying purchases",
      steps: "Scan Coffee with loyalty card, verify 500 points earned.",
      notes: "Points: 500 points per purchase",
      items: [
        { name: "Coffee Beans", sku: "79849310320", barcode: "79849310320" },
        { name: "365 Coffee Pleasant Morning Buzz", sku: "9948243520", barcode: "099482435202" }
      ]
    },
    {
      id: 7,
      name: "Quantity Entry",
      type: "QTY_REQUIRED",
      promotion: "Produce Quantity Item",
      valid: "Jul 23, 2025 - Jul 30, 2099",
      discount: "Enter quantity at prompt",
      steps: "Scan Lemons (4033), verify quantity prompt appears.",
      notes: "Quantity entry required",
      items: [
        { name: "Lemons / Limon (PLU)", sku: "4033", barcode: "4033" },
        { name: "Lime (PLU)", sku: "4048", barcode: "4048" }
      ]
    },
    {
      id: 8,
      name: "Continuity Promotion",
      type: "CONTINUITY / FREE_ITEM",
      promotion: "Continuity: Buy 10, Get 1 Free",
      valid: "Jul 23, 2025 - Jul 30, 2099",
      discount: "Buy 10 over multiple visits, get 11th FREE",
      steps: "Buy 10 coffees over multiple visits, get 1 FREE. Scan Coffee items with loyalty card.",
      notes: "Loyalty card required to track visits • Progress tracked across transactions",
      items: [
        { name: "365 Coffee Pleasant Morning Buzz", sku: "9948243520", barcode: "099482435202" },
        { name: "Coffee Beans", sku: "79849310320", barcode: "79849310320" },
        { name: "Frederik's MI Cherry Ground Coffee", sku: "76023614994", barcode: "760236149941" },
        { name: "Frederik's Mackinac Island Fudge", sku: "76023615016", barcode: "760236150169" }
      ]
    }
  ]
};

// Convenience / Fuel Scanbook Data (from ELERA_Additional_Scanbook_Final)
const convenienceData = {
  title: "Convenience / Fuel POS Test Script",
  loyaltyAccounts: [
    { name: "Leo Anders", email: "leo.anders@yemail.com", phone: "(919) 555-2222", address: "1457 Oak Grove Lane, Cary, NC" },
    { name: "Anna Schmidt", email: "anna.schmidt@myemail.com", phone: "(919) 555-1111", address: "1746 Willow Creek Road" },
    { name: "Elana Rossi", email: "e.rossi@myemail.com", phone: "(919) 555-3333", address: "3892 Pine Meadow Drive" },
    { name: "John Smith", email: "laura.hernandez@myemail.com", phone: "(919) 555-4444", address: "3050 Elmwood Drive" }
  ],
  tests: [
    {
      id: 1,
      name: "Bundle Meal Deal",
      type: "BUNDLE_PRICE",
      promotion: "Spaghetti Night $5 Meal Deal",
      valid: "Jul 23, 2025 - Jul 30, 2099",
      discount: "$5 Bundle Price for all 3 items",
      steps: "Scan Spaghetti Noodles, Spaghetti Sauce, and Parmesan Cheese. Verify bundle price of $5 applies.",
      notes: null,
      items: [
        { name: "Spaghetti Noodles", sku: "2920090794", barcode: "02920090794" },
        { name: "Spaghetti Sauce", sku: "3620001375", barcode: "03620001375" },
        { name: "Parmesan Cheese", sku: "2100061531", barcode: "02100061531" }
      ]
    },
    {
      id: 2,
      name: "King Size Candy Deal",
      type: "PERCENT_OFF",
      promotion: "2KingSizePB",
      valid: "Sep 12, 2025 - Sep 19, 2099",
      discount: "20% OFF when buying 2",
      steps: "Scan 2x King Size Reese's Peanut Butter Cups. Verify 20% discount applies to both items.",
      notes: null,
      items: [
        { name: "King Size Reese's PB Cups", sku: "3400000480", barcode: "03400000480" }
      ]
    },
    {
      id: 3,
      name: "Clearance Sale",
      type: "FINAL_PRICE",
      promotion: "PayDayKingCloseout",
      valid: "Sep 12, 2025 - Sep 19, 2099",
      discount: "Final Price: $0.50",
      steps: "Scan PayDay King Size candy bar. Verify clearance price of $0.50 applies regardless of original price.",
      notes: null,
      items: [
        { name: "PayDay King Size", sku: "1070080727", barcode: "01070080727" }
      ]
    },
    {
      id: 4,
      name: "Cross-Category Deal",
      type: "PERCENT_OFF",
      promotion: "Buy 2 Dove Products Get 50% Off Razors",
      valid: "Jul 31, 2025 - Aug 7, 2099",
      discount: "50% OFF Razors",
      steps: "Scan 2 Dove products (Body Wash or Soap), then scan Razor pack. Verify 50% discount on razors.",
      notes: "Requires 2 Dove products to trigger discount on razors",
      items: [
        { name: "Dove Body Wash", sku: "1111101845", barcode: "01111101845" },
        { name: "Dove Soap Bar", sku: "7940061203", barcode: "07940061203" },
        { name: "Razor Pack", sku: "88867009863", barcode: "88867009863" }
      ]
    },
    {
      id: 5,
      name: "S'mores Bundle",
      type: "AMOUNT_OFF",
      promotion: "Save $1 On Smores Ingredients",
      valid: "Jul 31, 2025 - Aug 7, 2099",
      discount: "$1 OFF when buying all 3 items",
      steps: "Scan Chocolate Bars, Graham Crackers, and Marshmallows. Verify $1 discount applies to basket.",
      notes: "All 3 items required to trigger discount",
      items: [
        { name: "Hershey's Chocolate Bars", sku: "3400029005", barcode: "03400029005" },
        { name: "Graham Crackers", sku: "4400000463", barcode: "04400000463" },
        { name: "Marshmallows", sku: "60069900328", barcode: "60069900328" }
      ]
    },
    {
      id: 6,
      name: "Toys Threshold Deal",
      type: "AMOUNT_OFF",
      promotion: "Spend $50 on Toys Save $15 on Plush",
      valid: "Oct 23, 2025 - Oct 30, 2025",
      discount: "$15 OFF Plush toys",
      steps: "Add $50+ of toy items to cart, then scan Plush toy. Verify $15 discount applies to plush item.",
      notes: "Must spend $50 on toys before plush discount triggers",
      items: [
        { name: "Toy Item 1", sku: "195464719176", barcode: "195464719176" },
        { name: "Toy Item 2", sku: "195464731161", barcode: "195464731161" },
        { name: "Plush Toy", sku: "19190845753", barcode: "19190845753" }
      ]
    },
    {
      id: 7,
      name: "Closeout Sale",
      type: "PERCENT_OFF",
      promotion: "MixedNutCloseout",
      valid: "Oct 22, 2025 - Oct 24, 2025",
      discount: "50% OFF (Clearance)",
      steps: "Scan Mixed Nuts can. Verify 50% clearance discount applies automatically.",
      notes: "Limited time closeout - 3 days only",
      items: [
        { name: "Mixed Nuts Can", sku: "2900001665", barcode: "02900001665" }
      ]
    },
    {
      id: 8,
      name: "Loyalty Segment Deal",
      type: "AMOUNT_OFF",
      promotion: "Customer Segment Promotion",
      valid: "Dec 1, 2025 - Dec 9, 2042",
      discount: "$3 OFF per item",
      steps: "Scan loyalty card (must be in target segment), then scan CeraVe product. Verify $3 discount per item.",
      notes: "Requires customer to be in specific loyalty segment",
      items: [
        { name: "CeraVe Moisturizing Cream", sku: "3606000537750", barcode: "3606000537750" }
      ]
    }
  ]
};

const typeColors = {
  'AMOUNT_OFF': 'bg-green-100 text-green-800',
  'PERCENT_OFF': 'bg-blue-100 text-blue-800',
  'PERCENT_OFF / FINAL_PRICE': 'bg-purple-100 text-purple-800',
  'POINTS': 'bg-yellow-100 text-yellow-800',
  'QTY_REQUIRED': 'bg-orange-100 text-orange-800',
  'CONTINUITY / FREE_ITEM': 'bg-pink-100 text-pink-800',
  'BUNDLE_PRICE': 'bg-indigo-100 text-indigo-800',
  'FINAL_PRICE': 'bg-red-100 text-red-800'
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
      setError('Invalid credentials. Try admin/elera2025 or demo/demo');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">TOSHIBA</h1>
          <p className="text-sm text-slate-500 tracking-widest">GLOBAL COMMERCE SOLUTIONS</p>
          <div className="mt-4 h-1 w-20 bg-red-600 mx-auto rounded"></div>
          <h2 className="mt-4 text-xl font-semibold text-slate-700">ELERA Scanbook Portal</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter password"
            />
          </div>
          
          {error && (
            <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>
          )}
          
          <button
            type="button"
            onClick={handleLogin}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition duration-200 cursor-pointer"
          >
            Sign In
          </button>
        </div>
        
        <div className="mt-6 p-3 bg-slate-50 rounded-lg text-center">
          <p className="text-xs text-slate-500 mb-1">Test Credentials:</p>
          <p className="text-sm font-mono text-slate-700">admin / elera2025</p>
        </div>
        
        <p className="mt-4 text-center text-xs text-slate-400">
          Version 2.0 • United States Edition 2026
        </p>
      </div>
    </div>
  );
};

// Category Card Component
const CategoryCard = ({ title, icon, description, itemCount, onClick, available }) => (
  <div
    onClick={available ? onClick : null}
    className={`bg-white rounded-xl shadow-lg p-6 transition duration-300 ${
      available 
        ? 'cursor-pointer hover:shadow-xl hover:scale-105 border-2 border-transparent hover:border-red-500' 
        : 'opacity-60 cursor-not-allowed'
    }`}
  >
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-600 text-sm mb-4">{description}</p>
    <div className="flex items-center justify-between">
      <span className={`text-xs font-medium px-3 py-1 rounded-full ${available ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
        {available ? `${itemCount} Test Scenarios` : 'Coming Soon'}
      </span>
      {available && (
        <span className="text-red-600 font-medium text-sm">View →</span>
      )}
    </div>
  </div>
);

// Dashboard Component
const Dashboard = ({ user, onSelectCategory, onLogout }) => (
  <div className="min-h-screen bg-slate-100">
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">TOSHIBA</h1>
            <p className="text-xs text-slate-500 tracking-wider">ELERA SCANBOOK PORTAL</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">Welcome, <strong>{user}</strong></span>
          <button
            onClick={onLogout}
            className="text-sm text-red-600 hover:text-red-700 font-medium cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
    
    <main className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Select Retail Vertical</h2>
        <p className="text-slate-600">Choose a category to access POS test scenarios and scannable barcodes</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <CategoryCard
          title="Grocery"
          icon="🛒"
          description="Full-service grocery POS testing with produce, promotions, and loyalty programs."
          itemCount={8}
          onClick={() => onSelectCategory('grocery')}
          available={true}
        />
        <CategoryCard
          title="Convenience / Fuel"
          icon="⛽"
          description="C-store and fuel station POS scenarios including bundles, clearance, and loyalty segments."
          itemCount={8}
          onClick={() => onSelectCategory('convenience')}
          available={true}
        />
        <CategoryCard
          title="Pharmacy"
          icon="💊"
          description="Pharmacy retail testing with prescription workflows and controlled substances."
          itemCount={0}
          onClick={() => onSelectCategory('pharmacy')}
          available={false}
        />
      </div>
    </main>
  </div>
);

// Test Card Component
const TestCard = ({ test, onSelect, isSelected }) => (
  <div
    onClick={() => onSelect(test.id)}
    className={`p-4 rounded-lg cursor-pointer transition ${
      isSelected 
        ? 'bg-red-50 border-2 border-red-500' 
        : 'bg-white border border-slate-200 hover:border-red-300'
    }`}
  >
    <div className="flex items-start justify-between mb-2">
      <span className="text-xs font-bold text-slate-400">TEST {test.id}</span>
      <span className={`text-xs px-2 py-1 rounded-full ${typeColors[test.type] || 'bg-slate-100 text-slate-600'}`}>
        {test.type}
      </span>
    </div>
    <h4 className="font-semibold text-slate-800">{test.name}</h4>
    <p className="text-xs text-slate-500 mt-1">{test.items.length} items</p>
  </div>
);

// Scanbook View Component
const ScanBookView = ({ category, onBack }) => {
  const [selectedTest, setSelectedTest] = useState(1);
  const [showAccounts, setShowAccounts] = useState(false);
  
  // Select the correct data based on category
  const data = category === 'convenience' ? convenienceData : groceryData;
  const currentTest = data.tests.find(t => t.id === selectedTest);
  
  // Determine header color based on category
  const headerGradient = category === 'convenience' 
    ? 'from-amber-600 to-orange-700' 
    : 'from-red-600 to-red-700';

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-slate-600 hover:text-slate-800 cursor-pointer">
              ← Back
            </button>
            <div className="h-6 w-px bg-slate-300"></div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">{data.title}</h1>
              <p className="text-xs text-slate-500">United States Edition 2026 • Version 2.0</p>
            </div>
          </div>
          <button
            onClick={() => setShowAccounts(!showAccounts)}
            className="text-sm bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition cursor-pointer"
          >
            {showAccounts ? 'Hide' : 'Show'} Test Accounts
          </button>
        </div>
      </header>

      {showAccounts && (
        <div className="bg-blue-50 border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h3 className="font-semibold text-blue-800 mb-3">Loyalty Program Test Accounts</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {data.loyaltyAccounts.map((account, i) => (
                <div key={i} className="bg-white rounded-lg p-3 text-sm">
                  <p className="font-semibold text-slate-800">{account.name}</p>
                  <p className="text-slate-600 text-xs">{account.email}</p>
                  <p className="text-slate-500 text-xs">{account.phone}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <div className="w-72 flex-shrink-0">
            <h3 className="font-semibold text-slate-700 mb-3">Test Scenarios</h3>
            <div className="space-y-2">
              {data.tests.map(test => (
                <TestCard
                  key={test.id}
                  test={test}
                  onSelect={setSelectedTest}
                  isSelected={selectedTest === test.id}
                />
              ))}
            </div>
          </div>

          <div className="flex-1">
            {currentTest && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className={`bg-gradient-to-r ${headerGradient} text-white p-6`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                      TEST {currentTest.id}
                    </span>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                      {currentTest.type}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold">{currentTest.name}</h2>
                </div>

                <div className="p-6">
                  <div className="bg-slate-50 rounded-lg p-4 mb-6">
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Promotion:</span>
                        <p className="font-semibold text-slate-800">{currentTest.promotion}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Valid:</span>
                        <p className="font-semibold text-slate-800">{currentTest.valid}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-500">Discount:</span>
                        <p className="font-semibold text-green-700">{currentTest.discount}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-slate-700 mb-2">Test Steps</h3>
                    <p className="text-slate-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      {currentTest.steps}
                    </p>
                  </div>

                  {currentTest.notes && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <span className="text-lg">⚠️</span>
                        <span className="font-medium">{currentTest.notes}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-slate-700 mb-4">Scan Items</h3>
                    <div className="space-y-4">
                      {currentTest.items.map((item, i) => (
                        <div key={i} className="border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800">{item.name}</h4>
                            <div className="flex gap-4 mt-1 text-sm">
                              <span className="text-slate-500">SKU: <span className="font-mono text-slate-700">{item.sku}</span></span>
                              <span className="text-slate-500">Barcode: <span className="font-mono text-slate-700">{item.barcode}</span></span>
                            </div>
                          </div>
                          <div className="bg-white border border-slate-200 rounded-lg p-2">
                            <Barcode value={item.barcode} height={50} />
                          </div>
                        </div>
                      ))}
                    </div>
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
export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleLogin = (username) => {
    setUser(username);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('dashboard');
    setSelectedCategory(null);
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setCurrentView('scanbook');
  };

  const handleBack = () => {
    setCurrentView('dashboard');
    setSelectedCategory(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (currentView === 'scanbook' && selectedCategory) {
    return <ScanBookView category={selectedCategory} onBack={handleBack} />;
  }

  return (
    <Dashboard
      user={user}
      onSelectCategory={handleSelectCategory}
      onLogout={handleLogout}
    />
  );
}

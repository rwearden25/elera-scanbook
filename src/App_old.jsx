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
  title: "Convenience / Fuel POS Test Script",
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
    { id: "Dept_10_H&B", name: "10 H&B", items: [
        { name: "Allergy Cetirizine Hydrochloride", sku: "31191716320", uom: "EA" },
        { name: "Bacitracin", sku: "5042835827", uom: "EA" },
        { name: "Calcium/D3 600mg", sku: "5042834903", uom: "EA" },
        { name: "CeraVe Foaming Facial Cleanser", sku: "3606000537750", uom: "EACH" },
        { name: "Cinnamon Crest", sku: "3700042729", uom: "EA" },
        { name: "Colgate Optic White Toothpaste", sku: "3500045836", uom: "EA" },
        { name: "Colgate Optic White Toothpaste Icy Fresh", sku: "3500097159", uom: "EA" },
        { name: "Crest Gum Detoxify Toothpaste", sku: "3700075421", uom: "EA" },
        { name: "Dove Mens Bar", sku: "1111101845", uom: "EA" },
        { name: "Dove Mens Shampoo/Conditioner", sku: "7940061203", uom: "EA" },
        { name: "Famotidine Complete Berry 50 ct", sku: "71373364851", uom: "EA" },
        { name: "GUM Toothbrush", sku: "7094212310", uom: "EA" },
        { name: "Glowing Vitamin C Sheet Mask", sku: "10266", uom: "EA" },
        { name: "Ibuprofen tablets 200mg", sku: "5042830876", uom: "EA" },
        { name: "NB Hair, Skin, Nails Gummies", sku: "7431253545", uom: "EA" },
        { name: "Neutrogena Sun SPF 55 3 pack", sku: "88517181403", uom: "EA" },
        { name: "Rejuv Niacinamide Sheet Mask", sku: "10271", uom: "EA" },
        { name: "SS 3 piece Nail Files", sku: "71789710131", uom: "EA" },
        { name: "SS Hand Lotion Peppermint", sku: "71789710033", uom: "EA" },
        { name: "SS Hand Lotion Winter Berry", sku: "71789710032", uom: "EA" },
        { name: "SS Lip Balm Sugar Cookie", sku: "71789710037", uom: "EA" },
        { name: "Speed Stick", sku: "2220000490", uom: "EA" },
        { name: "Sudafed", sku: "90003000000", uom: "EA" },
        { name: "Toms Luminous White", sku: "7732647014", uom: "EA" },
        { name: "Toms Unscented Deoderant", sku: "7732661425", uom: "EA" },
        { name: "Triple Blade Razors", sku: "88867009863", uom: "EA" }
      ] },
    { id: "Dept_11_HomeGoods", name: "11 HomeGoods", items: [
        { name: "100th Anniversary Small Reusable Bag", sku: "77515340242", uom: "EA" },
        { name: "Adjustable Chair", sku: "710014", uom: "EA" },
        { name: "Adult Poncho", sku: "8281503100", uom: "EA" },
        { name: "Bear Storage Basket", sku: "72753202173", uom: "EA" },
        { name: "Black LED Desk Lamp", sku: "710031", uom: "EA" },
        { name: "Black Management Chair", sku: "710011", uom: "EA" },
        { name: "Blue Swivel Armchair", sku: "710002", uom: "EA" },
        { name: "Blue Tall Back Chair", sku: "710010", uom: "EA" },
        { name: "Brass Swing Arm LED Lamp", sku: "710032", uom: "EA" },
        { name: "Chair with Neck Rest", sku: "710013", uom: "EA" },
        { name: "Desk", sku: "710050", uom: "EA" },
        { name: "Diffuser", sku: "77777724041", uom: "EA" },
        { name: "Ergonomic Chair", sku: "710012", uom: "EA" },
        { name: "Espresso Machine", sku: "72527291991", uom: "EA" },
        { name: "Filing Cabinet", sku: "710020", uom: "EA" },
        { name: "Flora Bunda", sku: "710060", uom: "EA" },
        { name: "Green Swivel Armchair", sku: "710003", uom: "EA" },
        { name: "Grey Pillow", sku: "19071450319", uom: "EA" },
        { name: "Grey Swivel Armchair", sku: "710001", uom: "EA" },
        { name: "Holiday basket", sku: "73116104880", uom: "EA" },
        { name: "Inflatable Gnome", sku: "19546408628", uom: "EA" },
        { name: "Julia Gash Tote", sku: "24089133", uom: "EA" },
        { name: "Kitchen Shears", sku: "7931978010601", uom: "EA" },
        { name: "LED HDD TV", sku: "84008057050", uom: "EA" },
        { name: "Low-cost Chair", sku: "710015", uom: "EA" },
        { name: "Luncheon Napkins 150 ct", sku: "88867012096", uom: "EA" },
        { name: "Mini Umbrella", sku: "8281580394", uom: "EA" },
        { name: "Off White Swivel Armchair", sku: "710004", uom: "EA" },
        { name: "Orange Swivel Armchair", sku: "710005", uom: "EA" },
        { name: "Party Tub", sku: "4122656061", uom: "EA" },
        { name: "Pendulum Clock", sku: "75864730645", uom: "EA" },
        { name: "Red Desk Lamp", sku: "710030", uom: "EA" },
        { name: "Red Napkins", sku: "430421812841", uom: "EA" },
        { name: "Reusable Bag", sku: "1111177710", uom: "EA" },
        { name: "Round Pink Pillow", sku: "19190845753", uom: "EA" },
        { name: "Sea Salt Candle", sku: "64765811572", uom: "EA" },
        { name: "Shopping Bag, Reusable", sku: "7789027332", uom: "EA" },
        { name: "Silver Wire Frame", sku: "82161412314", uom: "EA" },
        { name: "Sky Blue Swivel Armchair", sku: "710006", uom: "EA" },
        { name: "TWinCraft Toronto Maple Leafs 5-Pack Key Ring and Fridge Magnet Set", sku: "19416688259", uom: "EACH" },
        { name: "Tablecloth Black", sku: "63927770261", uom: "EA" },
        { name: "Tablecloth Red", sku: "63927768385", uom: "EA" },
        { name: "Tervis Toronto Maple Leafs 24oz. Tradition Classic Water Bottle", sku: "19335526039", uom: "EACH" },
        { name: "Toy Box Plush Fox and Unicorn", sku: "195464719176", uom: "EACH" },
        { name: "Toy Box Plush Fox and Unicorn", sku: "19546471917", uom: "EACH" },
        { name: "Toy Box Plush Woodland Friend", sku: "19546473116", uom: "EACH" },
        { name: "Toy Box Plush Woodland Friend", sku: "195464731161", uom: "EACH" },
        { name: "Turquoise Pillow", sku: "710100", uom: "EA" },
        { name: "Vanilla Birch Candle", sku: "75487041308", uom: "EA" },
        { name: "Wooden Bookcase", sku: "710040", uom: "EA" },
        { name: "Yellow Swivel Armchair", sku: "710007", uom: "EA" }
      ] },
    { id: "Dept_121_Wine", name: "121 Wine", items: [
        { name: "19 Crimes Cali Red “Snoop Dog�?", sku: "920631", uom: "EACH" },
        { name: "19 Crimes Pinot Noir The Punishment", sku: "920632", uom: "EACH" },
        { name: "19 Crimes Red Blend", sku: "920633", uom: "EACH" }
      ] },
    { id: "Dept_12_Alcohol", name: "12 Alcohol", items: [
        { name: " Dragon Fire Blueberry", sku: "164853", uom: "EACH" },
        { name: "A to Z Wineworks Oregon Rose 750ml", sku: "168256", uom: "EACH" },
        { name: "Brut Champagne - 750.0 ml Veuve Clicquot Yellow Label ", sku: "05020", uom: "EA" },
        { name: "Corona Light", sku: "21", uom: "EA" },
        { name: "Dragon Fire Grape", sku: "167070", uom: "EACH" },
        { name: "Dragon Fire Green Apple", sku: "167062", uom: "EACH" },
        { name: "Dragon Fire Mango", sku: "167069", uom: "EACH" },
        { name: "Dragon Fire Peach", sku: "167067", uom: "EACH" },
        { name: "Dragon Fire Pink Lemonade", sku: "167077", uom: "EACH" },
        { name: "Dragon Fire Strawberry", sku: "167066", uom: "EACH" },
        { name: "Glen Ellen Chardonnay", sku: "807200000", uom: "EACH" },
        { name: "Keg Heineken 1/2 Barrel", sku: "keghein12", uom: "EACH" },
        { name: "Keg Heineken 1/4 Barrel", sku: "keghein14", uom: "EACH" },
        { name: "Keg Heineken 1/6 Barrel", sku: "keghein16", uom: "EACH" },
        { name: "Keg Miller Genuine Draft 1/2 Barrel", sku: "kegmgd12", uom: "EACH" },
        { name: "Keg Miller Genuine Draft 1/4 Barrel", sku: "kegmgd14", uom: "EACH" },
        { name: "Keg Miller Genuine Draft 1/6 Barrel", sku: "kegmgd16", uom: "EACH" },
        { name: "Keg Miller High Life 1/2 Barrel", sku: "kegmhl12", uom: "EACH" },
        { name: "Keg Miller High Life 1/4 Barrel", sku: "kegmhl14", uom: "EACH" },
        { name: "Keg Miller High Life 1/6 Barrel", sku: "kegmhl16", uom: "EACH" },
        { name: "Keg Miller Lite 1/2 Barrel", sku: "kegml12", uom: "EACH" },
        { name: "Keg Miller Lite 1/4 Barrel", sku: "kegml14", uom: "EACH" },
        { name: "Keg Miller Lite 1/6 Barrel", sku: "kegml16", uom: "EACH" },
        { name: "Keg Rental Deposit", sku: "kegrental", uom: "EACH" },
        { name: "Lagunitas A Little Sumpin' Sumpin'", sku: "723830014190", uom: "EACH" },
        { name: "Long  Cranberry 6PK", sku: "130293", uom: "EACH" },
        { name: "Long  Peach 6PK", sku: "163513", uom: "EACH" },
        { name: "Long Midnight Sun 8PK", sku: "167282", uom: "EACH" },
        { name: "Long Original 6PK", sku: "129028", uom: "EACH" },
        { name: "Long Strong 6PK", sku: "130295", uom: "EACH" },
        { name: "Long Variety Pack 8PK", sku: "144822", uom: "EACH" },
        { name: "Long Zero Sugar 6PK", sku: "130296", uom: "EACH" },
        { name: "Modelo Can 24 FL OZ", sku: "8066095721", uom: "EA" },
        { name: "Modelo Chelada Fresa Picante", sku: "033544002315", uom: "EACH" },
        { name: "Plastic Keg Tub", sku: "kegtub", uom: "EACH" },
        { name: "Red Wine", sku: "9705400233", uom: "EA" },
        { name: "Robert Mondavi Winery Cabernet Sauvignon", sku: "920634", uom: "EACH" },
        { name: "Seagram's Escapes Jamaican Me Happy", sku: "070310012512", uom: "EACH" },
        { name: "Specialty Keg Tap", sku: "speckegtap", uom: "EACH" },
        { name: "Standard Keg Tap", sku: "stdkegtap", uom: "EACH" },
        { name: "Tito’s Vodka 750ml ", sku: "920629", uom: "EACH" },
        { name: "White Wine", sku: "8858600636", uom: "EA" }
      ] },
    { id: "Dept_13_Household", name: "13 Household", items: [
        { name: "365 Cleaner Citrus Scent", sku: "9948248664", uom: "EA" },
        { name: "365 Snack Bags", sku: "9948246392", uom: "EA" },
        { name: "Aluminum Foil", sku: "63927771620", uom: "EA" },
        { name: "Disinfectant", sku: "84960703877", uom: "EA" },
        { name: "Disinfecting Wipes", sku: "88867018005", uom: "EA" },
        { name: "Foil Pan", sku: "63927785379", uom: "EA" },
        { name: "Gain Flings Original Scent, 42 Ct", sku: "3700086749", uom: "EA" },
        { name: "In-Wash Scent Booster", sku: "88867008082", uom: "EA" },
        { name: "Lysol Disinfecting Wipes", sku: "1920081145", uom: "EA" },
        { name: "Tech Wipes Peppermint", sku: "71789710040", uom: "EA" },
        { name: "Tide Pods", sku: "3700091613", uom: "EA" },
        { name: "Toilet Paper", sku: "5400010183", uom: "EA" }
      ] },
    { id: "Dept_1_Grocery", name: "1 Grocery", items: [
        { name: "12oz 50 Pack", sku: "12x50Pack", uom: "EACH" },
        { name: "14oz 50 Pack", sku: "14x50Pack", uom: "EACH" },
        { name: "16oz 50 Pack", sku: "16x50Pack", uom: "EACH" },
        { name: "1836 Beef Rub", sku: "85434800629", uom: "EACH" },
        { name: "20oz 50 Pack", sku: "20x50Pack", uom: "EACH" },
        { name: "22 lb. bag", sku: "22lbice", uom: "EACH" },
        { name: "365 Coffee Pleasant Morning Buzz", sku: "9948243520", uom: "EA" },
        { name: "365 Organic Macaroni and Cheese", sku: "9948249387", uom: "EA" },
        { name: "Alpen Jodsalz", sku: "10560", uom: "EA" },
        { name: "Annie's Shells & White Cheddar", sku: "013562000043", uom: "EACH" },
        { name: "Arizona Green Tea", sku: "61300871526", uom: "EA" },
        { name: "Barilla Farfalle", sku: "7680850108", uom: "EA" },
        { name: "Barilla Non-GMO Thin Spaghetti", sku: "7680828009", uom: "EA" },
        { name: "Bottle Deposit - 6 bottles at 5¢", sku: "1111177790", uom: "EACH" },
        { name: "Bottled Coke 6-pack", sku: "4900001834", uom: "EA" },
        { name: "Bread", sku: "7874206797", uom: "EA" },
        { name: "Bush’s Black Beans", sku: "3940001883", uom: "EA" },
        { name: "Butter Cookies", sku: "401710011471", uom: "EA" },
        { name: "Campbell’s HR Cream of Mushroom", sku: "5100006007", uom: "EA" },
        { name: "Celestial Seasonings Chamomile Herbal Tea", sku: "070734000102", uom: "EACH" },
        { name: "Chessmen Cookies", sku: "1410007952", uom: "EA" },
        { name: "Coffee Beans", sku: "79849310320", uom: "EA" },
        { name: "Coke", sku: "04963406", uom: "EACH" },
        { name: "Coke 10 pack", sku: "4900006721", uom: "EA" },
        { name: "Cookie Crisp", sku: "1600027296", uom: "EA" },
        { name: "Corn Flakes", sku: "81200", uom: "EA" },
        { name: "Del Monte Cut Green Beans", sku: "2400016286", uom: "EA" },
        { name: "Del Monte Kernel Corn", sku: "2400056669", uom: "EA" },
        { name: "Del Monte Sliced Peaches", sku: "2400016719", uom: "EA" },
        { name: "Dog Treats", sku: "7910052004", uom: "EA" },
        { name: "Eagle Brand Condensed Milk", sku: "65272910113", uom: "EA" },
        { name: "Frederik’s MI Cherry Ground Coffee", sku: "76023614994", uom: "EA" },
        { name: "Frederik’s Mackinac Island Fudge Ground Coffee", sku: "76023615016", uom: "EA" },
        { name: "French's Classic Yellow Mustard", sku: "4150000700", uom: "EA" },
        { name: "Fresca", sku: "4900005028", uom: "EA" },
        { name: "Fresca Grapefruit Citrus 12oz", sku: "4900000248", uom: "EA" },
        { name: "Froot Loops", sku: "3800028186", uom: "EACH" },
        { name: "GM Fiber One", sku: "1600040768", uom: "EA" },
        { name: "Gerber Oatmeal", sku: "1500000702", uom: "EA" },
        { name: "Hallmark Card", sku: "929962627", uom: "EA" },
        { name: "Healthy Choice Chicken Noodle Soup", sku: "5010040260", uom: "EA" },
        { name: "Hibiscus Tea", sku: "2070080014", uom: "EA" },
        { name: "Honey Maid Graham Crackers", sku: "4400000463", uom: "EA" },
        { name: "Hot Dog Buns", sku: "7432300228", uom: "EA" },
        { name: "Hot Dog/Bun Bundle", sku: "1111177701", uom: "EA" },
        { name: "Hunt’s Petite Diced Tomatoes", sku: "2700037831", uom: "EA" },
        { name: "Jet-puffed Mashmallows", sku: "60069900328", uom: "EA" },
        { name: "Kellogg’s Corn Flakes", sku: "3800000120", uom: "EA" },
        { name: "Kemps Ittibitz", sku: "4148303426", uom: "EA" },
        { name: "Kraft Mac & Cheese Dinner", sku: "2100065883", uom: "EA" },
        { name: "Langers Lemonade", sku: "920630", uom: "EACH" },
        { name: "Lay's Barbecue Chips", sku: "76970", uom: "EACH" },
        { name: "Luzianne Tea 48 Family Size", sku: "4790030329", uom: "EA" },
        { name: "Mahatma Long Grain Rice", sku: "1740010550", uom: "EA" },
        { name: "Mariani Cherries", sku: "7102231553", uom: "EA" },
        { name: "McCormick Taco Seasoning", sku: "5210003491", uom: "EA" },
        { name: "Mini Moon Pies", sku: "7210822101", uom: "EA" },
        { name: "Nature Valley 6 pack", sku: "1600027855", uom: "EA" },
        { name: "Nature Valley Wafer", sku: "1600014943", uom: "EA" },
        { name: "Oh Puree! Mashed Potatoes", sku: "029700071479", uom: "EACH" },
        { name: "Olipop", sku: "850027702872", uom: "EACH" },
        { name: "Orange Gatorade", sku: "5200033876", uom: "EA" },
        { name: "Oreo Golden Cookies", sku: "4400003324", uom: "EA" },
        { name: "PAM Cooking Spray", sku: "6414403031", uom: "EA" },
        { name: "Parmesan & Romano Cheese", sku: "2100061541", uom: "EA" },
        { name: "Parmesan Cheese", sku: "2100061531", uom: "EA" },
        { name: "Pasta", sku: "2920090794", uom: "EA" },
        { name: "Pirouline Pumpkin Spice Wafers", sku: "4245610787", uom: "EA" },
        { name: "Pizza Sauce", sku: "74747900061", uom: "EA" },
        { name: "Potato Salad", sku: "21707600000", uom: "EA" },
        { name: "RAWCOLOGY Granola Snack Bites Apple Cinnamon", sku: "628504873168", uom: "EACH" },
        { name: "RAWCOLOGY Granola Snack Bites Berry Burst", sku: "628504873151", uom: "EACH" },
        { name: "Reusable Bag", sku: "039010277034", uom: "EACH" },
        { name: "Ritz Crackers", sku: "4400003111", uom: "EACH" },
        { name: "Ritz Crackers Fresh Stacks", sku: "4400003113", uom: "EA" },
        { name: "SF Purified Water 16.9 FL OZ 6 pack", sku: "3225142354", uom: "EA" },
        { name: "Smucker’s Strawberry Jam", sku: "5150001229", uom: "EA" },
        { name: "Spaghetti Sauce", sku: "3620001375", uom: "EA" },
        { name: "Spec’s Maple Pecan Pie", sku: "846160", uom: "EACH" },
        { name: "Tortilla Chips Restaurant Style", sku: "71373346649", uom: "EA" },
        { name: "Totinos Party Pizza", sku: "4280010800", uom: "EA" },
        { name: "WF Spinach Feta Orzo Salad", sku: "wfs", uom: "EA" },
        { name: "Whole Wheat Ritz", sku: "4400004815", uom: "EA" }
      ] },
    { id: "Dept_20_Clothing", name: "20 Clothing", items: [
        { name: "Accessories L/60 Beige", sku: "0470361", uom: "EA" },
        { name: "Blazer", sku: "77777724051", uom: "EA" },
        { name: "Blouse S White", sku: "1060060", uom: "EA" },
        { name: "Champion Boys Socks 12-pack Ankle Socks", sku: "4529908430", uom: "EA" },
        { name: "Champion C9 Girls 6-pack Ankle Socks", sku: "3825712836", uom: "EA" },
        { name: "Champion C9 Womens 4-pack Ankle Socks - Black", sku: "3825712956", uom: "EA" },
        { name: "Champion C9 Womens Cushion Socks 3-pack", sku: "3825709605", uom: "EA" },
        { name: "Champion Kids Sock Multipacks", sku: "4529905603", uom: "EA" },
        { name: "Champion Mens 3-pack Extra Low Cut Socks Black", sku: "69655063303", uom: "EA" },
        { name: "Champion Mens 6-pack Ankle Socks", sku: "3825710096", uom: "EA" },
        { name: "Champion Unisex Crew Socks 6-pack", sku: "4529908079", uom: "EA" },
        { name: "Cloud 9 Long Sleeve Girls Nightshirt", sku: "69611428353", uom: "EA" },
        { name: "Crew Neck", sku: "77777724031", uom: "EA" },
        { name: "Hair Accessories NOSIZE Red", sku: "0696625", uom: "EA" },
        { name: "Infant Pinstriped Onesie", sku: "23013037", uom: "EA" },
        { name: "JF Pocket Square", sku: "4755612134", uom: "EA" },
        { name: "Joe Boxer Boys Pajama Tank Top & Shorts", sku: "10876", uom: "EA" },
        { name: "Joe Boxer Mens Black Smiley Face Microfleece Bottoms", sku: "73608083221", uom: "EA" },
        { name: "Joe Fresh Womens Chemise Nightshirt", sku: "4136061902", uom: "EA" },
        { name: "Low Cut Navy Socks", sku: "18786390", uom: "EA" },
        { name: "Luiryare Mens Nightshirt", sku: "77390766752", uom: "EA" },
        { name: "M Crew Neck Indigo", sku: "700001", uom: "EA" },
        { name: "M Crew Neck Mountain", sku: "700002", uom: "EA" },
        { name: "M Crew Neck Red", sku: "700004", uom: "EA" },
        { name: "M Crew Neck Turquoise", sku: "700003", uom: "EA" },
        { name: "Men's Crew Neck Black - Large", sku: "19145597925", uom: "EA" },
        { name: "Men's Crew Neck Black - Medium", sku: "19145597924", uom: "EA" },
        { name: "Men's Crew Neck Black - Small", sku: "19145597923", uom: "EA" },
        { name: "Men's Crew Neck Black - XL", sku: "19145597926", uom: "EA" },
        { name: "Men's Crew Neck Black - XXL", sku: "19145597927", uom: "EA" },
        { name: "Men's Crew Neck Blue - Large", sku: "19145597930", uom: "EA" },
        { name: "Men's Crew Neck Blue - Medium", sku: "19145597929", uom: "EA" },
        { name: "Men's Crew Neck Blue - Small", sku: "19145597928", uom: "EA" },
        { name: "Men's Crew Neck Blue - XL", sku: "19145597931", uom: "EA" },
        { name: "Men's Crew Neck Blue - XXL", sku: "19145597932", uom: "EA" },
        { name: "Men's Crew Neck Boulder - Large", sku: "19145597940", uom: "EA" },
        { name: "Men's Crew Neck Boulder - Medium", sku: "19145597939", uom: "EA" },
        { name: "Men's Crew Neck Boulder - Small", sku: "19145597938", uom: "EA" },
        { name: "Men's Crew Neck Boulder - XL", sku: "19145597941", uom: "EA" },
        { name: "Men's Crew Neck Boulder - XXL", sku: "19145597942", uom: "EA" },
        { name: "Men's Crew Neck Grey - Large", sku: "19145597920", uom: "EA" },
        { name: "Men's Crew Neck Grey - Medium", sku: "19145597919", uom: "EA" },
        { name: "Men's Crew Neck Grey - Small", sku: "19145597918", uom: "EA" },
        { name: "Men's Crew Neck Grey - XL", sku: "19145597921", uom: "EA" },
        { name: "Men's Crew Neck Grey - XXL", sku: "19145597922", uom: "EA" },
        { name: "Men's Crew Neck Iceberg - Large", sku: "19145597943", uom: "EA" },
        { name: "Men's Crew Neck Iceberg - Medium", sku: "19145597944", uom: "EA" },
        { name: "Men's Crew Neck Iceberg - XL", sku: "19145597946", uom: "EA" },
        { name: "Men's Crew Neck Iceberg - XXL", sku: "19145597947", uom: "EA" },
        { name: "Men's Crew Neck Red - Large", sku: "19145597935", uom: "EA" },
        { name: "Men's Crew Neck Red - Medium", sku: "19145597934", uom: "EA" },
        { name: "Men's Crew Neck Red - Small", sku: "19145597933", uom: "EA" },
        { name: "Men's Crew Neck Red - XL", sku: "19145597936", uom: "EA" },
        { name: "Men's Crew Neck Red - XXL", sku: "19145597937", uom: "EA" },
        { name: "Muk Luks Womens Floral Nightshirt", sku: "88983518201", uom: "EA" },
        { name: "NCAA Navy T-shirt", sku: "27145033", uom: "EA" },
        { name: "Nike WM Court Legacy Black/White-Platinum", sku: "19450224201", uom: "EA" },
        { name: "Noble Mount Mens Flannel Nightshirt", sku: "71580289038", uom: "EA" },
        { name: "Outerwear M Black", sku: "0995203", uom: "EA" },
        { name: "Pacific End on End Cotton Nightshirt", sku: "06609", uom: "EA" },
        { name: "Ron Jon Black Trucker Cap", sku: "cap", uom: "EA" },
        { name: "Satin Skirt", sku: "77777724071", uom: "EA" },
        { name: "Selvedge Denim", sku: "77777724021", uom: "EA" },
        { name: "Socks Bin 10-11 Red", sku: "1037466", uom: "EA" },
        { name: "Suede Blazer", sku: "77777724011", uom: "EA" },
        { name: "Toshiba ELERA Socks", sku: "77777723012", uom: "EA" },
        { name: "Toshiba Golf Polo (Large)", sku: "66600314286", uom: "EA" },
        { name: "Toshiba Golf Polo (XXL)", sku: "66600314288", uom: "EA" },
        { name: "Toshiba Men Polo Red - Large", sku: "77777723003", uom: "EA" },
        { name: "Toshiba Men Polo Red - Medium", sku: "77777723002", uom: "EA" },
        { name: "Toshiba Men Polo Red - Small", sku: "77777723001", uom: "EA" },
        { name: "Toshiba Men Polo Red - XL", sku: "77777723004", uom: "EA" },
        { name: "Toshiba Men Polo Red - XXL", sku: "77777723005", uom: "EA" },
        { name: "Toshiba Men Polo Tidal Blue - Large", sku: "19523801563", uom: "EA" },
        { name: "Toshiba Men Polo Tidal Blue - Medium", sku: "19523801562", uom: "EA" },
        { name: "Toshiba Men Polo Tidal Blue - Small", sku: "19523801561", uom: "EA" },
        { name: "Toshiba Men Polo Tidal Blue - XL", sku: "19523801564", uom: "EA" },
        { name: "Toshiba Men Polo Tidal Blue - XXL", sku: "19523801565", uom: "EA" },
        { name: "Toshiba Red Socks", sku: "77777723015", uom: "EA" },
        { name: "Toshiba Retail Socks", sku: "77777723014", uom: "EA" },
        { name: "Toshiba Tools Socks", sku: "77777723011", uom: "EA" },
        { name: "Toshiba Women Polo Red - Large", sku: "77777723008", uom: "EA" },
        { name: "Toshiba Women Polo Red - Medium", sku: "77777723007", uom: "EA" },
        { name: "Toshiba Women Polo Red - Small", sku: "77777723006", uom: "EA" },
        { name: "Toshiba Women Polo Red - XL", sku: "77777723009", uom: "EA" },
        { name: "Toshiba Women Polo Red - XXL", sku: "77777723010", uom: "EA" },
        { name: "Toshiba Women Polo Tidal Blue - Large", sku: "19523801617", uom: "EA" },
        { name: "Toshiba Women Polo Tidal Blue - Medium", sku: "19523801616", uom: "EA" },
        { name: "Toshiba Women Polo Tidal Blue - Small", sku: "19523801615", uom: "EA" },
        { name: "Toshiba Women Polo Tidal Blue - XL", sku: "19523801618", uom: "EA" },
        { name: "Toshiba Women Polo Tidal Blue - XXL", sku: "19523801619", uom: "EA" },
        { name: "Toshiba XCS Socks", sku: "77777723013", uom: "EA" },
        { name: "Unisex Starter Toronto Maple Leafs Team Color Two-Stripe Crew Socks", sku: "19608237272", uom: "EACH" },
        { name: "Women's Polo Blue - Large", sku: "88653515764", uom: "EA" },
        { name: "Women's Polo Blue - Medium", sku: "88653515763", uom: "EA" },
        { name: "Women's Polo Blue - Small", sku: "88653515762", uom: "EA" },
        { name: "Women's Polo Blue - XL", sku: "88653515765", uom: "EA" },
        { name: "Women's Polo Blue - XXL", sku: "88653515766", uom: "EA" },
        { name: "Women's Polo Green - Large", sku: "88653515759", uom: "EA" },
        { name: "Women's Polo Green - Medium", sku: "88653515758", uom: "EA" },
        { name: "Women's Polo Green - Small", sku: "88653515757", uom: "EA" },
        { name: "Women's Polo Green - XL", sku: "88653515760", uom: "EA" },
        { name: "Women's Polo Green - XXL", sku: "88653515761", uom: "EA" },
        { name: "Women's Polo Orange - Large", sku: "88653515769", uom: "EA" },
        { name: "Women's Polo Orange - Medium", sku: "88653515768", uom: "EA" },
        { name: "Women's Polo Orange - Small", sku: "88653515767", uom: "EA" },
        { name: "Women's Polo Orange - XL", sku: "88653515770", uom: "EA" },
        { name: "Women's Polo Orange - XXL", sku: "88653515771", uom: "EA" },
        { name: "Womens Bermuda Shorts Black", sku: "700051", uom: "EA" },
        { name: "Womens Bermuda Shorts Navy", sku: "700054", uom: "EA" },
        { name: "Womens Bermuda Shorts Red", sku: "700052", uom: "EA" },
        { name: "Womens Bermuda Shorts White", sku: "700053", uom: "EA" },
        { name: "Womens Long Henley Nightshirt - Green", sku: "873395273", uom: "EA" }
      ] },
    { id: "Dept_21_Sport", name: "21 Sport", items: [
        { name: "Backpacker Small Compression Sack", sku: "43702", uom: "EA" },
        { name: "Bicycle LED Light Set", sku: "66349300326", uom: "EA" },
        { name: "Wilson A1010 HS1 Baseball", sku: "2638828770", uom: "EA" }
      ] },
    { id: "Dept_22_Tools", name: "22 Tools", items: [
        { name: "Basic Stud Finder", sku: "70535", uom: "EA" },
        { name: "Magnetic Pocket Level", sku: "64882475629", uom: "EA" },
        { name: "Pigskin Leather Work Gloves", sku: "30026", uom: "EA" },
        { name: "Pistol-grip Blow Gun", sku: "82009", uom: "EA" }
      ] },
    { id: "Dept_23_Toys", name: "23 Toys", items: [
        { name: "", sku: "62755519833", uom: "EA" }
      ] },
    { id: "Dept_24_Yard", name: "24 Yard", items: [
        { name: "Bale of Hay", sku: "6421", uom: "EA" },
        { name: "Charcoal", sku: "6456", uom: "EA" },
        { name: "Gravel", sku: "6585", uom: "EA" },
        { name: "Grill", sku: "6085", uom: "EA" },
        { name: "Ladder", sku: "6473", uom: "EA" },
        { name: "Leaf Bags", sku: "6797", uom: "EA" },
        { name: "Mulch", sku: "6711", uom: "EA" },
        { name: "Penn Smart Patch 10lb Tall Fescue", sku: "2149602410", uom: "EACH" },
        { name: "Pine Straw", sku: "6422", uom: "EA" },
        { name: "Propane Refill", sku: "6985", uom: "EA" },
        { name: "Propane Tank", sku: "6498", uom: "EA" },
        { name: "Stone", sku: "6614", uom: "EA" },
        { name: "Wheel Barrow", sku: "6013", uom: "EA" },
        { name: "Wood Chips", sku: "6955", uom: "EA" }
      ] },
    { id: "Dept_25_Electronics", name: "25 Electronics", items: [
        { name: "7ft Ethernet Cat6 Purple", sku: "3722971587", uom: "EA" },
        { name: "APC Surge Protector", sku: "73130433602", uom: "EA" },
        { name: "AirPods Max", sku: "19425224503", uom: "EA" },
        { name: "Bluetooth Speaker", sku: "77777724001", uom: "EA" },
        { name: "Boltune Earbuds", sku: "eb", uom: "EA" },
        { name: "HS1 Bone Conduction Headphones", sku: "bc", uom: "EA" },
        { name: "OREI 4X4 HDMI Matrix Switch/Splitter", sku: "85000895673", uom: "EA" },
        { name: "Soundcore Earbuds", sku: "eb2", uom: "EA" },
        { name: "USB 2.0 8GB Flash Drive", sku: "2226534740", uom: "EA" },
        { name: "Youth Whisper Bone Conduction Headphones", sku: "bc2", uom: "EA" }
      ] },
    { id: "Dept_26_Automotive", name: "26 Automotive", items: [
        { name: "Antifreeze/Coolant Tester", sku: "81739901498", uom: "EA" },
        { name: "Battery Hydrometer", sku: "30369", uom: "EA" },
        { name: "Marine Lower Pump Unit", sku: "64882483050", uom: "EA" }
      ] },
    { id: "Dept_2A_QtyRequired", name: "2A QtyRequired", items: [
        { name: "Blood Orange", sku: "4381", uom: "EA" },
        { name: "Cara Cara Orange", sku: "3110", uom: "EA" },
        { name: "Garlic", sku: "4608", uom: "EA" },
        { name: "Hass Avocado", sku: "4046", uom: "EA" },
        { name: "Lemons", sku: "4033", uom: "EACH" },
        { name: "Lime", sku: "4048", uom: "EA" },
        { name: "Midknight Orange", sku: "3036", uom: "EA" },
        { name: "Minneola Tangelo", sku: "4383", uom: "EA" },
        { name: "Navel Orange", sku: "3107", uom: "EA" },
        { name: "Red Grapefruit", sku: "4289", uom: "EA" },
        { name: "Valencia Orange", sku: "3108", uom: "EA" },
        { name: "White GrapeFruit", sku: "4294", uom: "EA" }
      ] },
    { id: "Dept_2B_Weighed", name: "2B Weighed", items: [
        { name: "Acorn Squash", sku: "4750", uom: "LB" },
        { name: "Armenian Cucumber", sku: "4592", uom: "LB" },
        { name: "Baby Eggplant", sku: "4599", uom: "LB" },
        { name: "Baby Summer Squash", sku: "4755", uom: "LB" },
        { name: "Baby Zucchini Squash", sku: "4756", uom: "LB" },
        { name: "Banana", sku: "4011", uom: "LB" },
        { name: "Banana Pepper", sku: "4678", uom: "LB" },
        { name: "Beefsteak Tomato", sku: "3061", uom: "LB" },
        { name: "Broccoli", sku: "4060", uom: "LB" },
        { name: "Brussel Sprouts", sku: "4550", uom: "LB" },
        { name: "Butternut Squash", sku: "4759", uom: "LB" },
        { name: "Cauliflower", sku: "4079", uom: "LB" },
        { name: "Cortland Apple", sku: "4106", uom: "LB" },
        { name: "Cucumber", sku: "4062", uom: "LB" },
        { name: "Delicata Squash", sku: "4763", uom: "LB" },
        { name: "Eggplant", sku: "4081", uom: "LB" },
        { name: "Empire Apple", sku: "4126", uom: "LB" },
        { name: "English Cucumber", sku: "4593", uom: "LB" },
        { name: "Fennel", sku: "4515", uom: "LB" },
        { name: "Fuji Apple", sku: "4131", uom: "LB" },
        { name: "Gala Apple", sku: "4134", uom: "LB" },
        { name: "Golden Delicious Apple", sku: "4137", uom: "LB" },
        { name: "Granny Smith Apple", sku: "4018", uom: "LB" },
        { name: "Green Asparagus", sku: "4080", uom: "LB" },
        { name: "Green Beans", sku: "4066", uom: "LB" },
        { name: "Green Bell Pepper", sku: "4065", uom: "LB" },
        { name: "Home Grown Tomato", sku: "4800", uom: "LB" },
        { name: "Honeycrisp Apple", sku: "3283", uom: "LB" },
        { name: "Jalapeno Pepper", sku: "4693", uom: "LB" },
        { name: "Kale", sku: "4627", uom: "LB" },
        { name: "Leeks", sku: "4629", uom: "LB" },
        { name: "Minneiska Apple", sku: "3603", uom: "LB" },
        { name: "Napa Cabbage", sku: "4552", uom: "LB" },
        { name: "Orange Bell Pepper", sku: "4682", uom: "LB" },
        { name: "Pasilla Pepper", sku: "4702", uom: "LB" },
        { name: "Pinklady Apple", sku: "4130", uom: "LB" },
        { name: "Plum Tomato", sku: "4087", uom: "LB" },
        { name: "Poblano Pepper", sku: "4705", uom: "LB" },
        { name: "Purple Top Turnip", sku: "4811", uom: "LB" },
        { name: "Radishes", sku: "4089", uom: "LB" },
        { name: "Red Bell Pepper", sku: "4088", uom: "LB" },
        { name: "Red Cabbage", sku: "4554", uom: "LB" },
        { name: "Red Delicious Apple", sku: "4167", uom: "LB" },
        { name: "Red Jalapeno Pepper", sku: "4694", uom: "LB" },
        { name: "Red Tomato", sku: "4063", uom: "LB" },
        { name: "Serrano Pepper", sku: "4709", uom: "LB" },
        { name: "Snapdragon Apple", sku: "3442", uom: "LB" },
        { name: "Spaghetti Squash", sku: "4776", uom: "LB" },
        { name: "Spartan Apple", sku: "4179", uom: "LB" },
        { name: "Sugar Bee Apple", sku: "3486", uom: "LB" },
        { name: "Sweet Potato", sku: "4074", uom: "LB" },
        { name: "Sweet Potatoes", sku: "4816", uom: "LB" },
        { name: "Test_Weighted_Organic", sku: "99999", uom: "LB" },
        { name: "Tets Weighted Item", sku: "9999", uom: "LB" },
        { name: "Tomatoes on the Vine", sku: "4664", uom: "LB" },
        { name: "Yellow Bell Pepper", sku: "4680", uom: "LB" },
        { name: "Yellow Squash", sku: "4766", uom: "LB" },
        { name: "Yukon Gold Potato", sku: "4727", uom: "LB" },
        { name: "Zucchini Squash", sku: "4067", uom: "LB" }
      ] },
    { id: "Dept_2_Produce", name: "2 Produce", items: [
        { name: "Cantaloupe", sku: "4050", uom: "EA" },
        { name: "Celery", sku: "4070", uom: "EA" },
        { name: "Cilantro", sku: "4889", uom: "EA" },
        { name: "Dill Weed", sku: "4891", uom: "EA" },
        { name: "Green Avocado", sku: "4221", uom: "EA" },
        { name: "Green Cabbage", sku: "4069", uom: "EA" },
        { name: "Green Scallion", sku: "4068", uom: "EA" },
        { name: "Honeydew Melon", sku: "4034", uom: "EA" },
        { name: "Italian Parsley", sku: "4901", uom: "EA" },
        { name: "Parsley", sku: "4899", uom: "EA" },
        { name: "Pineapple", sku: "4431", uom: "EA" },
        { name: "Pomegranate", sku: "3127", uom: "EA" },
        { name: "Watermelon", sku: "4031", uom: "EA" }
      ] },
    { id: "Dept_30_Deposit", name: "30 Deposit", items: [
        { name: "Bottle Deposit Return", sku: "1111177791", uom: "EACH" }
      ] },
    { id: "Dept_31_USPS", name: "31 USPS", items: [
        { name: "Book of stamps", sku: "720005", uom: "EA" },
        { name: "USPS Large box", sku: "720004", uom: "EA" },
        { name: "USPS Medium box", sku: "720003", uom: "EA" },
        { name: "USPS Priority Mail", sku: "720000", uom: "EA" },
        { name: "USPS Priority Mail Express", sku: "720001", uom: "EA" },
        { name: "USPS Small box", sku: "720002", uom: "EA" }
      ] },
    { id: "Dept_32_Misc", name: "32 Misc", items: [
        { name: "$25 Gift Card", sku: "07675004690", uom: "EA" },
        { name: "10 LB Bag Ice", sku: "6185", uom: "EA" },
        { name: "20 LB Bag Ice", sku: "6657", uom: "EA" },
        { name: "5 LB Bag Ice", sku: "6138", uom: "EA" },
        { name: "Charity Donation", sku: "9991", uom: "EA" },
        { name: "Christmas Tree", sku: "6457", uom: "EA" },
        { name: "Christmas Tree", sku: "72001", uom: "EA" },
        { name: "Default Template Item", sku: "DEFAULT_TEMPLATE_ITEM", uom: "EA" },
        { name: "Food Donation", sku: "1111177702", uom: "EACH" },
        { name: "Freshman Starter Loyalty Program", sku: "8883", uom: "EA" },
        { name: "GS1 Digital Link Item", sku: "12340123456789", uom: "EACH" },
        { name: "Gorilla Clear Glue", sku: "5242700546", uom: "EACH" },
        { name: "Helium Balloons", sku: "1111177700", uom: "EA" },
        { name: "Inner Circle Membership", sku: "8881", uom: "EA" },
        { name: "Perks Rewards Membership", sku: "8882", uom: "EA" },
        { name: "Poinsettias", sku: "6004", uom: "EA" },
        { name: "TSC Reusable Bag", sku: "84898403343", uom: "EACH" }
      ] },
    { id: "Dept_3_Dairy", name: "3 Dairy", items: [
        { name: "Borden Milk", sku: "1400000104", uom: "EA" },
        { name: "Free Range Eggs", sku: "1", uom: "EA" }
      ] },
    { id: "Dept_40_Jewelry", name: "40 Jewelry", items: [
        { name: "18\" Freshwater Cultured Pearl Strand with 14K Yellow Gold Clasp", sku: "72521307545", uom: "EA" },
        { name: "3-Piece Created Opal Stud Earring Set in Sterling Silver", sku: "72522287688", uom: "EA" },
        { name: "40mm Ladies' Bulova Rubaiyat Watch with a White Dial and Silver-tone Bracelet", sku: "72522489359", uom: "EA" },
        { name: "8-in Adjustable Fashion Bangle Bracelet by Rembrandt in Sterling Silver", sku: "72521976463", uom: "EA" },
        { name: "Gold Chain", sku: "77777724003", uom: "EA" },
        { name: "Rose Gold Earrings", sku: "77777724043", uom: "EA" }
      ] },
    { id: "Dept_41_Fragrance", name: "41 Fragrance", items: [
        { name: "Cologne", sku: "77777724002", uom: "EA" }
      ] },
    { id: "Dept_42_Handbags", name: "42 Handbags", items: [
        { name: "Leather Bag", sku: "77777724042", uom: "EA" },
        { name: "Postina Small Leather Bag", sku: "50370", uom: "EA" }
      ] },
    { id: "Dept_43_Shoes", name: "43 Shoes", items: [
        { name: "Suede Flats", sku: "77777724061", uom: "EA" }
      ] },
    { id: "Dept_4_Meat", name: "4 Meat", items: [
        { name: "Hot Dogs", sku: "78391908512", uom: "EA" },
        { name: "Whole Turkey", sku: "85240900736", uom: "EA" }
      ] },
    { id: "Dept_50_Pharmacy", name: "50 Pharmacy", items: [
        { name: "Pharmacy Item", sku: "rx", uom: "EACH" },
        { name: "rx Item mock", sku: "4700000020000062000125", uom: "EACH" }
      ] },
    { id: "Dept_5_Candy", name: "5 Candy", items: [
        { name: "Almond Joy", sku: "3400000320", uom: "EA" },
        { name: "Almond Joy King Size", sku: "3400000522", uom: "EA" },
        { name: "BreathSavers Peppermint", sku: "44810", uom: "EA" },
        { name: "BreathSavers Spearmint", sku: "3400000337", uom: "EA" },
        { name: "Feastables MrBeast Dark Chocolate", sku: "85002788000", uom: "EA" },
        { name: "Heath Bar", sku: "1070006080", uom: "EA" },
        { name: "Hershey's Almond Chocolate Bar 6 pack", sku: "3400029105", uom: "EA" },
        { name: "Hershey's Milk Chocolate Bar 6 pack", sku: "3400029005", uom: "EA" },
        { name: "Hershey’s Chocolate Almond", sku: "42410", uom: "EA" },
        { name: "Hershey’s Cookies ‘n’ Cream", sku: "42390", uom: "EA" },
        { name: "Hershey’s King Milk Chocolate", sku: "3400000220", uom: "EA" },
        { name: "Hershey’s King Size Chocolate Almond Bar", sku: "3400000241", uom: "EA" },
        { name: "Hershey’s Milk Chocolate Bar", sku: "3400000240", uom: "EA" },
        { name: "Ice Breakers Cool Mint", sku: "3400000007", uom: "EA" },
        { name: "Ice Breakers Duo Raspberry", sku: "46660", uom: "EA" },
        { name: "Ice Breakers Duo Strawberry", sku: "3400000665", uom: "EA" },
        { name: "Ice Breakers Sours", sku: "3400000098", uom: "EA" },
        { name: "Ice Breakers Spearmint", sku: "3400000006", uom: "EA" },
        { name: "Ice Breakers Wintergreen", sku: "3400000009", uom: "EA" },
        { name: "Ice Cubes Artic Grape", sku: "3400000545", uom: "EA" },
        { name: "Ice Cubes Cinnamon", sku: "3400000811", uom: "EA" },
        { name: "Ice Cubes Peppermint Gum", sku: "3400000843", uom: "EA" },
        { name: "Ice Cubes Raspberry Sorbet", sku: "3400000848", uom: "EA" },
        { name: "Ice Cubes Spearmint Gum", sku: "3400000847", uom: "EA" },
        { name: "Ice Cubes Wintergreen", sku: "3400000529", uom: "EA" },
        { name: "KitKat", sku: "3400000246", uom: "EA" },
        { name: "KitKat Duos", sku: "3400031828", uom: "EA" },
        { name: "KitKat King Size", sku: "3400000229", uom: "EA" },
        { name: "M&Ms", sku: "4000000031", uom: "EACH" },
        { name: "Mounds Bar", sku: "3400000031", uom: "EA" },
        { name: "PayDay Bar", sku: "1070080722", uom: "EA" },
        { name: "PayDay King Size", sku: "1070080727", uom: "EA" },
        { name: "PayDayDataMatrix", sku: "00010700807229", uom: "EACH" },
        { name: "Peanut M&Ms", sku: "4000000032", uom: "EACH" },
        { name: "Peppermint Altoids", sku: "2200015933", uom: "EA" },
        { name: "Pocky Chocolate", sku: "7314115233", uom: "EA" },
        { name: "Pocky Chocolate", sku: "7314111081", uom: "EA" },
        { name: "Reese's Peanut Butter Cups - 2", sku: "3400000440", uom: "EA" },
        { name: "Reese’s Peanut Butter Cups - 4", sku: "3400000480", uom: "EA" },
        { name: "Reese’s Sticks", sku: "340000014", uom: "EA" },
        { name: "Rolo", sku: "3400000244", uom: "EA" },
        { name: "Sour Patch Kids", sku: "UG20252", uom: "EACH" },
        { name: "Trident Island Berry Lime", sku: "07339005525", uom: "EACH" },
        { name: "Trident Tropical Twist", sku: "UG20253", uom: "EACH" },
        { name: "Trident Watermelon Twist", sku: "07339005518", uom: "EACH" },
        { name: "Twix", sku: "UG20251", uom: "EACH" },
        { name: "Twizzlers", sku: "3400053104", uom: "EA" },
        { name: "Whitman's Sampler", sku: "7674007012", uom: "EA" },
        { name: "York Peppermint Patty", sku: "3400000330", uom: "EA" }
      ] },
    { id: "Dept_60_Tobacco", name: "60 Tobacco", items: [
        { name: "Nicorette Gum", sku: "30766776054", uom: "EACH" }
      ] },
    { id: "Dept_6_Snacks", name: "6 Snacks", items: [
        { name: "Almonds", sku: "4902204244", uom: "EA" },
        { name: "Cheetos", sku: "28400040112", uom: "EACH" },
        { name: "Cherry Slices", sku: "9843724507", uom: "EACH" },
        { name: "Doritos", sku: "2840009089", uom: "EACH" },
        { name: "Honey Roasted Cashews", sku: "9843724196", uom: "EACH" },
        { name: "Jack Links Beef Jerky Sweet & Hot", sku: "1708287633", uom: "EA" },
        { name: "Jack Links Beef Jerky Teriyaki", sku: "1708287635", uom: "EA" },
        { name: "Jalapeno Peanuts", sku: "9843721025", uom: "EACH" },
        { name: "Orville Redenbacher’s Mini Bags", sku: "2700062317", uom: "EA" },
        { name: "Planters Mixed Nuts", sku: "2900001665", uom: "EA" },
        { name: "Pringles Lightly Salted", sku: "3800013881", uom: "EA" },
        { name: "Pringles Original", sku: "3800013841", uom: "EA" },
        { name: "Protein Trail Mix", sku: "4902265916", uom: "EA" },
        { name: "Quaker Chewy Chocolate Chip", sku: "0307750", uom: "EACH" },
        { name: "Quaker ChewyPB Chip", sku: "0307760", uom: "EACH" },
        { name: "Sahale ", sku: "89386900032", uom: "EA" },
        { name: "Sahale Maple Pecans", sku: "89386900033", uom: "EA" },
        { name: "SmartFood Popcorn", sku: "2840031413", uom: "EA" },
        { name: "Smartfood Popcorn", sku: "2840001423", uom: "EACH" },
        { name: "Stax Buffalo Wings", sku: "2840009251", uom: "EA" },
        { name: "Stax Flaming Hot", sku: "2840059670", uom: "EA" },
        { name: "Sun Chips Minis Garden Salsa", sku: "2840070014", uom: "EA" },
        { name: "Sunflower Kernels", sku: "4902204239", uom: "EA" },
        { name: "Unsalted Mixed Nuts", sku: "88867012670", uom: "EA" },
        { name: "Watermelon Rings", sku: "9843724511", uom: "EACH" },
        { name: "Whole Cashews", sku: "4902204260", uom: "EA" }
      ] },
    { id: "Dept_7_Deli", name: "7 Deli", items: [
        { name: "1 lb Deli Ham", sku: "905001", uom: "EA" },
        { name: "1 lb Deli Roast Beef", sku: "905002", uom: "EA" },
        { name: "1 lb Deli Swiss Cheese", sku: "905003", uom: "EA" },
        { name: "1 lb Deli Turkey", sku: "905000", uom: "EA" },
        { name: "1 lb Deli White Cheddar Cheese", sku: "905005", uom: "EA" },
        { name: "Apple Slices", sku: "7015", uom: "EACH" },
        { name: "Baby Carrots", sku: "7012", uom: "EACH" },
        { name: "Caesar Salad", sku: "7014", uom: "EACH" },
        { name: "California Bowl", sku: "7013", uom: "EACH" },
        { name: "Chicken Panini", sku: "7004", uom: "EACH" },
        { name: "Chips", sku: "7011", uom: "EACH" },
        { name: "Deli Cheddar Cheese", sku: "905004", uom: "LB" },
        { name: "French Bread", sku: "906000", uom: "EA" },
        { name: "Fries", sku: "7010", uom: "EACH" },
        { name: "Greek Salad", sku: "7008", uom: "EACH" },
        { name: "Grilled Cheese", sku: "7009", uom: "EACH" },
        { name: "Ham Sandwich", sku: "7007", uom: "EACH" },
        { name: "Ham Sandwich - Eat In", sku: "907001", uom: "EA" },
        { name: "Ham Sandwich - Optional", sku: "907002", uom: "EA" },
        { name: "Ham Sandwich - Take Out", sku: "907000", uom: "EA" },
        { name: "Kale Salad", sku: "7006", uom: "EACH" },
        { name: "Onion Rings", sku: "7005", uom: "EACH" },
        { name: "PB&J", sku: "7003", uom: "EACH" },
        { name: "Power Bowl", sku: "7002", uom: "EACH" },
        { name: "Turkey on Wheat", sku: "7001", uom: "EACH" }
      ] },
    { id: "Dept_8_Floral", name: "8 Floral", items: [
        { name: "Daisy Bunch", sku: "7948784013", uom: "EA" },
        { name: "Green Mini Pumpkin", sku: "70801685047", uom: "EA" },
        { name: "Medium Orange Pumpkin", sku: "19151827369", uom: "EA" },
        { name: "Medium White Pumpkin", sku: "19151827370", uom: "EA" },
        { name: "Mini Galvanized French Bucket", sku: "19515852666", uom: "EA" },
        { name: "Orange Speckle Mini Pumpkin", sku: "70801685251", uom: "EA" },
        { name: "Orange Sunflowers", sku: "19515891472", uom: "EA" },
        { name: "Small Black Pumpkin", sku: "19151827367", uom: "EA" },
        { name: "Sunflowers", sku: "19515891362", uom: "EA" },
        { name: "Yellow Daisies", sku: "19515891573", uom: "EA" }
      ] },
    { id: "MEIJER_ITEMS", name: "MEIJER ITEMS", items: [
        { name: "FT Ultra LT Rain Poncho", sku: "64748404010", uom: "EACH" },
        { name: "Frederik's Bronze Cut Cavatelli", sku: "70882017012", uom: "EACH" },
        { name: "Frederik's Bronze Cut Orzo", sku: "71373313109", uom: "EACH" },
        { name: "Frederik's Bronze Cut Penne Rigate", sku: "70882016993", uom: "EACH" },
        { name: "Frederik's Four Cheese Risotto", sku: "70882002009", uom: "EACH" },
        { name: "Frederik's Roasted Garlic Risotto", sku: "70882002010", uom: "EACH" },
        { name: "Frederik's Tomato Risotto", sku: "70882002011", uom: "EACH" },
        { name: "LS Crew Tee Snow Htr", sku: "71928322063", uom: "EACH" },
        { name: "Lamb Chop Cat Toy", sku: "71373358709", uom: "EACH" },
        { name: "Meijer Original Potato Chips", sku: "71373346708", uom: "EACH" },
        { name: "Meijer Peanut Butter Trail Mix", sku: "71373353871", uom: "EACH" },
        { name: "Meijer Sweet & Salty Trail Mix", sku: "70882000506", uom: "EACH" },
        { name: "Meijer Whole Roasted Almonds", sku: "71373353850", uom: "EACH" },
        { name: "Moisturizing Sunscreen", sku: "70882036833", uom: "EACH" },
        { name: "Peanut, Drk Choco Almond Protien Bars", sku: "71373312016", uom: "EACH" },
        { name: "True Goodness Dlx Mixed Nuts", sku: "71928380896", uom: "EACH" },
        { name: "Umbrella", sku: "95486321785", uom: "EACH" }
      ] },
    { id: "NO_TAX", name: "NO TAX", items: [
        { name: "Water", sku: "082657500690", uom: "EACH" }
      ] },
    { id: "VAT_TAX", name: "VAT TAX", items: [
        { name: "Kong HandiPOD Mini Starter Kit", sku: "035585800219", uom: "EACH" },
        { name: "McVities Digestives ChocTopsMilkChoc100g", sku: "5000168010311", uom: "EACH" },
        { name: "Oscar Orsen Elastic Thin Lrge Brown 30pk", sku: "1845678901001", uom: "EACH" }
      ] }
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
    if (e.key === 'Enter') handleLogin();
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
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={handleKeyDown} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="Enter username" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="Enter password" />
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
          <button type="button" onClick={handleLogin} className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition duration-200 cursor-pointer">Sign In</button>
        </div>
        <div className="mt-6 p-3 bg-slate-50 rounded-lg text-center">
          <p className="text-xs text-slate-500 mb-1">Test Credentials:</p>
          <p className="text-sm font-mono text-slate-700">admin / elera2025</p>
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">Version 2.0 • United States Edition 2026</p>
      </div>
    </div>
  );
};

// Category Card Component
const CategoryCard = ({ title, icon, description, itemCount, onClick, available }) => (
  <div onClick={available ? onClick : null} className={`bg-white rounded-xl shadow-lg p-6 transition duration-300 ${available ? 'cursor-pointer hover:shadow-xl hover:scale-105 border-2 border-transparent hover:border-red-500' : 'opacity-60 cursor-not-allowed'}`}>
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-600 text-sm mb-4">{description}</p>
    <div className="flex items-center justify-between">
      <span className={`text-xs font-medium px-3 py-1 rounded-full ${available ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
        {available ? `${itemCount} ${itemCount === 1 ? 'Item' : 'Items'}` : 'Coming Soon'}
      </span>
      {available && <span className="text-red-600 font-medium text-sm">View →</span>}
    </div>
  </div>
);

// Dashboard Component
const Dashboard = ({ user, onSelectCategory, onLogout }) => {
  const totalItems = itemsData.groups.reduce((sum, g) => sum + g.items.length, 0);
  
  return (
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
            <button onClick={onLogout} className="text-sm text-red-600 hover:text-red-700 font-medium cursor-pointer">Sign Out</button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Select Retail Vertical</h2>
          <p className="text-slate-600">Choose a category to access POS test scenarios and scannable barcodes</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CategoryCard title="Grocery" icon="🛒" description="Full-service grocery POS testing with produce, promotions, and loyalty programs." itemCount={8} onClick={() => onSelectCategory('grocery')} available={true} />
          <CategoryCard title="Convenience / Fuel" icon="⛽" description="C-store and fuel station POS scenarios including bundles, clearance, and loyalty segments." itemCount={8} onClick={() => onSelectCategory('convenience')} available={true} />
          <CategoryCard title="Items" icon="📦" description="Browse the complete item catalog with SKUs, barcodes, and department groupings." itemCount={totalItems} onClick={() => onSelectCategory('items')} available={true} />
          <CategoryCard title="Pharmacy" icon="💊" description="Pharmacy retail testing with prescription workflows and controlled substances." itemCount={0} onClick={() => onSelectCategory('pharmacy')} available={false} />
        </div>
      </main>
    </div>
  );
};

// Test Card Component
const TestCard = ({ test, onSelect, isSelected }) => (
  <div onClick={() => onSelect(test.id)} className={`p-4 rounded-lg cursor-pointer transition ${isSelected ? 'bg-red-50 border-2 border-red-500' : 'bg-white border border-slate-200 hover:border-red-300'}`}>
    <div className="flex items-start justify-between mb-2">
      <span className="text-xs font-bold text-slate-400">TEST {test.id}</span>
      <span className={`text-xs px-2 py-1 rounded-full ${typeColors[test.type] || 'bg-slate-100 text-slate-600'}`}>{test.type}</span>
    </div>
    <h4 className="font-semibold text-slate-800">{test.name}</h4>
    <p className="text-xs text-slate-500 mt-1">{test.items.length} items</p>
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
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-slate-600 hover:text-slate-800 cursor-pointer">← Back</button>
            <div className="h-6 w-px bg-slate-300"></div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">{data.title}</h1>
              <p className="text-xs text-slate-500">United States Edition 2026 • Version 2.0</p>
            </div>
          </div>
          <button onClick={() => setShowAccounts(!showAccounts)} className="text-sm bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition cursor-pointer">{showAccounts ? 'Hide' : 'Show'} Test Accounts</button>
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
              {data.tests.map(test => (<TestCard key={test.id} test={test} onSelect={setSelectedTest} isSelected={selectedTest === test.id} />))}
            </div>
          </div>
          <div className="flex-1">
            {currentTest && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className={`bg-gradient-to-r ${headerGradient} text-white p-6`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">TEST {currentTest.id}</span>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{currentTest.type}</span>
                  </div>
                  <h2 className="text-2xl font-bold">{currentTest.name}</h2>
                </div>
                <div className="p-6">
                  <div className="bg-slate-50 rounded-lg p-4 mb-6">
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div><span className="text-slate-500">Promotion:</span><p className="font-semibold text-slate-800">{currentTest.promotion}</p></div>
                      <div><span className="text-slate-500">Valid:</span><p className="font-semibold text-slate-800">{currentTest.valid}</p></div>
                      <div className="sm:col-span-2"><span className="text-slate-500">Discount:</span><p className="font-semibold text-green-700">{currentTest.discount}</p></div>
                    </div>
                  </div>
                  <div className="mb-6">
                    <h3 className="font-semibold text-slate-700 mb-2">Test Steps</h3>
                    <p className="text-slate-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">{currentTest.steps}</p>
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

// Items View Component
const ItemsView = ({ onBack }) => {
  const [selectedGroup, setSelectedGroup] = useState(itemsData.groups[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  
  const currentGroup = itemsData.groups.find(g => g.id === selectedGroup);
  
  const filteredItems = currentGroup?.items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-slate-600 hover:text-slate-800 cursor-pointer">← Back</button>
            <div className="h-6 w-px bg-slate-300"></div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Item Catalog Browser</h1>
              <p className="text-xs text-slate-500">{itemsData.groups.reduce((sum, g) => sum + g.items.length, 0)} items across {itemsData.groups.length} departments</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="text" placeholder="Search items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64" />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <div className="w-64 flex-shrink-0">
            <h3 className="font-semibold text-slate-700 mb-3">Departments</h3>
            <div className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
              {itemsData.groups.map(group => (
                <div key={group.id} onClick={() => { setSelectedGroup(group.id); setSearchTerm(''); }} className={`p-3 rounded-lg cursor-pointer transition text-sm ${selectedGroup === group.id ? 'bg-blue-50 border-2 border-blue-500' : 'bg-white border border-slate-200 hover:border-blue-300'}`}>
                  <div className="font-medium text-slate-800">{group.name}</div>
                  <div className="text-xs text-slate-500">{group.items.length} items</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                <h2 className="text-2xl font-bold">{currentGroup?.name || 'Select a Department'}</h2>
                <p className="text-blue-100 mt-1">{filteredItems.length} items {searchTerm && `matching "${searchTerm}"`}</p>
              </div>
              <div className="p-6">
                <div className="grid gap-4">
                  {filteredItems.map((item, i) => (
                    <div key={i} className="border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800">{item.name}</h4>
                        <div className="flex gap-4 mt-1 text-sm">
                          <span className="text-slate-500">SKU: <span className="font-mono text-slate-700">{item.sku}</span></span>
                          <span className="text-slate-500">UOM: <span className="font-mono text-slate-700">{item.uom}</span></span>
                        </div>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-lg p-2">
                        <Barcode value={item.sku} height={50} />
                      </div>
                    </div>
                  ))}
                  {filteredItems.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <p className="text-lg">No items found</p>
                      <p className="text-sm">Try a different search term</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
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

  const handleLogin = (username) => setUser(username);
  const handleLogout = () => { setUser(null); setCurrentView('dashboard'); setSelectedCategory(null); };
  const handleSelectCategory = (category) => { setSelectedCategory(category); setCurrentView('scanbook'); };
  const handleBack = () => { setCurrentView('dashboard'); setSelectedCategory(null); };

  if (!user) return <Login onLogin={handleLogin} />;
  if (currentView === 'scanbook' && selectedCategory === 'items') return <ItemsView onBack={handleBack} />;
  if (currentView === 'scanbook' && selectedCategory) return <ScanBookView category={selectedCategory} onBack={handleBack} />;
  return <Dashboard user={user} onSelectCategory={handleSelectCategory} onLogout={handleLogout} />;
}

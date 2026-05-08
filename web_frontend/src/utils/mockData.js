const MOCK_USERS_KEY = "pb_mock_users";
const MOCK_SESSION_KEY = "pb_mock_session";
const MOCK_LISTINGS_KEY = "pb_mock_listings";
const MOCK_TRADES_KEY = "pb_mock_trade_requests";

const readJson = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getMockUsers = () => readJson(MOCK_USERS_KEY, {});
export const saveMockUsers = (users) => writeJson(MOCK_USERS_KEY, users);

export const getMockSessionUser = () => readJson(MOCK_SESSION_KEY, null);
export const saveMockSessionUser = (user) => writeJson(MOCK_SESSION_KEY, user);

export const getMockUserId = (user) => user?.id || user?._id || user?.email || "guest";

const getUserByIdOrEmail = (user) => {
  const users = getMockUsers();
  const id = getMockUserId(user);
  return Object.values(users).find(
    item => item.id === id || item._id === id || item.email === user?.email
  );
};

const seedSeller = {
  id: "u_demo",
  email: "demo@protibi.com",
  name: "Rafiul Hasan",
  phone: "01712345678",
  role: "seller",
  location: "Dhanmondi, Dhaka",
  rating: 4.8,
  reviews: 12,
  totalReviews: 12,
  verified: true,
  isVerified: true,
};

const seedBuyer = {
  id: "u_test",
  email: "test@example.com",
  name: "Test User",
  phone: "01812345678",
  role: "buyer",
  location: "Mirpur, Dhaka",
  rating: 4.6,
  reviews: 7,
  totalReviews: 7,
  verified: true,
  isVerified: true,
};

const makeListing = (overrides) => ({
  _id: overrides._id,
  title: overrides.title,
  description: overrides.description,
  price: overrides.price,
  category: overrides.category,
  condition: overrides.condition,
  images: overrides.images || [],
  location: { city: overrides.location || "Dhaka", address: overrides.location || "Dhaka" },
  seller: overrides.seller || seedSeller,
  status: overrides.status || "active",
  tradeOffer: overrides.tradeOffer ?? "open",
  negotiable: overrides.negotiable ?? true,
  tags: overrides.tags || [],
  createdAt: overrides.createdAt || new Date().toISOString(),
});

export const seedMockData = () => {
  const users = getMockUsers();
  users[seedSeller.email] = { ...seedSeller, ...(users[seedSeller.email] || {}) };
  users[seedBuyer.email] = { ...seedBuyer, ...(users[seedBuyer.email] || {}) };
  saveMockUsers(users);

  const listings = readJson(MOCK_LISTINGS_KEY, []);
  if (listings.length > 0) return;

  writeJson(MOCK_LISTINGS_KEY, [
    makeListing({
      _id: "mock_listing_camera",
      title: "Canon EOS 700D DSLR Camera",
      description: "Well-kept DSLR camera with kit lens, charger, strap, and camera bag. Great for students and hobby photography.",
      price: 28500,
      category: "Electronics",
      condition: "Like New",
      location: "Dhanmondi, Dhaka",
      tags: ["canon", "camera", "dslr"],
      createdAt: "2026-04-28T10:00:00.000Z",
    }),
    makeListing({
      _id: "mock_listing_chair",
      title: "Ergonomic Study Chair",
      description: "Comfortable mesh-back chair with adjustable height. Lightly used and perfect for home office or study setup.",
      price: 5200,
      category: "Furniture",
      condition: "Used",
      location: "Banani, Dhaka",
      tags: ["chair", "office", "study"],
      createdAt: "2026-05-01T15:30:00.000Z",
    }),
    makeListing({
      _id: "mock_listing_cycle",
      title: "Mountain Bike 26 inch",
      description: "Durable mountain bike with working gears and brakes. Open to trade with a good smartphone or accessories.",
      price: 14000,
      category: "Sports",
      condition: "Good",
      location: "Mirpur, Dhaka",
      tags: ["bike", "cycle", "sports"],
      createdAt: "2026-05-03T09:20:00.000Z",
    }),
    makeListing({
      _id: "mock_listing_books",
      title: "CSE Textbook Bundle",
      description: "Bundle of data structures, algorithms, database, and software engineering books. Some notes inside.",
      price: 1800,
      category: "Books",
      condition: "Used",
      location: "Uttara, Dhaka",
      tradeOffer: "no",
      tags: ["cse", "books", "university"],
      createdAt: "2026-05-05T12:15:00.000Z",
    }),
  ]);
};

export const getMockListings = () => {
  seedMockData();
  return readJson(MOCK_LISTINGS_KEY, []);
};

export const saveMockListings = (listings) => writeJson(MOCK_LISTINGS_KEY, listings);

export const createMockListing = (form, authUser = {}) => {
  seedMockData();
  const seller = getUserByIdOrEmail(authUser) || getMockSessionUser() || authUser || seedSeller;
  const listing = makeListing({
    _id: `mock_listing_${Date.now()}`,
    title: form.title?.trim() || "Untitled listing",
    description: form.description?.trim() || "",
    price: Number(form.price) || 0,
    category: form.category || "Other",
    condition: form.condition || "Used",
    images: (form.photos || form.images || [])
      .map(photo => photo.preview || (typeof photo === "string" ? photo : ""))
      .filter(Boolean),
    location: form.location?.city || form.location?.address || form.location || seller.location || "Dhaka",
    seller,
    tradeOffer: form.tradeOffer === true || form.tradeOffer === "open" ? "open" : "no",
    negotiable: Boolean(form.negotiable),
    tags: form.tags || [],
  });
  const listings = getMockListings();
  saveMockListings([listing, ...listings]);
  return listing;
};

export const getMockListingsForUser = (user) => {
  const userId = getMockUserId(user);
  return getMockListings().filter(listing => {
    const seller = listing.seller || {};
    return seller.id === userId || seller._id === userId || seller.email === user?.email;
  });
};

const savedKey = (user) => `pb_mock_saved_${getMockUserId(user)}`;

export const getMockSavedListingIds = (user) => readJson(savedKey(user), []);

export const toggleMockSavedListing = (user, listingId) => {
  const saved = new Set(getMockSavedListingIds(user));
  if (saved.has(listingId)) saved.delete(listingId);
  else saved.add(listingId);
  const next = [...saved];
  writeJson(savedKey(user), next);
  return next;
};

export const getMockSavedListings = (user) => {
  const ids = new Set(getMockSavedListingIds(user));
  return getMockListings().filter(listing => ids.has(listing._id || listing.id));
};

export const getMockProfile = (authUser) => {
  seedMockData();
  const sessionUser = getMockSessionUser();
  return getUserByIdOrEmail(authUser) || sessionUser || authUser || null;
};

export const updateMockProfile = (authUser, payload) => {
  const users = getMockUsers();
  const existing = getMockProfile(authUser) || {};
  const emailKey = existing.email || authUser?.email;
  const nextUser = {
    ...existing,
    ...payload,
    id: existing.id || authUser?.id || authUser?._id || `u_${Date.now()}`,
    email: emailKey,
    location: payload.location?.city || payload.location || existing.location || "",
  };
  if (emailKey) {
    users[emailKey.toLowerCase()] = nextUser;
    saveMockUsers(users);
  }
  saveMockSessionUser(nextUser);
  return nextUser;
};

export const getMockTradeRequestsForSeller = (sellerUser) => {
  const sellerId = getMockUserId(sellerUser);
  return readJson(MOCK_TRADES_KEY, []).filter(req => {
    const listing = req.requestedProduct || req.listing || {};
    const seller = listing.seller || {};
    return seller.id === sellerId || seller._id === sellerId || seller.email === sellerUser?.email;
  });
};

export const getMockTradeRequestsForBuyer = (buyerUser) => {
  const buyerId = getMockUserId(buyerUser);
  return readJson(MOCK_TRADES_KEY, []).filter(req => {
    const buyer = req.buyer || {};
    return buyer.id === buyerId || buyer._id === buyerId || buyer.email === buyerUser?.email;
  });
};

export const addMockTradeRequest = ({ item, form, authUser }) => {
  const requests = readJson(MOCK_TRADES_KEY, []);
  const request = {
    _id: `mock_trade_${Date.now()}`,
    status: "pending",
    createdAt: new Date().toISOString(),
    buyer: {
      id: getMockUserId(authUser),
      name: authUser?.name || "Mock Buyer",
      email: authUser?.email || "",
      profilePicture: authUser?.profilePicture || authUser?.avatar || "",
    },
    requestedProduct: {
      _id: item.id,
      title: item.title,
      price: item.price,
      images: item.image ? [item.image] : [],
      seller: item.seller,
    },
    offeredTitle: form.title,
    offeredCategory: form.category || item.category,
    offeredCondition: form.condition,
    offeredEstimatedValue: Number(form.estimatedValue) || 0,
    offeredDescription: form.description,
    message: form.message,
    offeredImages: (form.photos || []).map(photo => photo.preview).filter(Boolean),
  };
  writeJson(MOCK_TRADES_KEY, [request, ...requests]);
  return request;
};

export const updateMockTradeRequestStatus = (tradeId, status) => {
  const requests = readJson(MOCK_TRADES_KEY, []);
  const next = requests.map(req => req._id === tradeId || req.id === tradeId ? { ...req, status } : req);
  writeJson(MOCK_TRADES_KEY, next);
  return next.find(req => req._id === tradeId || req.id === tradeId);
};

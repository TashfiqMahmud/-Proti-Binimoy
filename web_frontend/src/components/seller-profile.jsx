import React from "react";

const SellerProfileView = ({
  components,
  navigate,
  pendingOrderCount,
  pendingTradeCount,
  savedListings,
  sellerPanel,
  setSellerPanel,
  updateProfile,
  user,
  userListings,
}) => {
  const {
    AddProductBanner,
    EditProfileTab,
    IncomingOrdersPage,
    IncomingTradeRequestsPage,
    ListingsTab,
    SecurityTab,
    SellerHubSidebar,
    TradeTrackingPage,
  } = components;

  return (
    <>
      <AddProductBanner onAddProduct={() => navigate("/post-item")} />

      <div className="sh-wrap">
        <SellerHubSidebar
          activePanel={sellerPanel}
          onSelect={setSellerPanel}
          pendingOrders={pendingOrderCount}
          pendingTrades={pendingTradeCount}
        />
        <div>
          {sellerPanel === "orders" && (
            <div className="up-card up-fade up-d2">
              <IncomingOrdersPage />
            </div>
          )}
          {sellerPanel === "trades" && (
            <div className="up-card up-fade up-d2">
              <IncomingTradeRequestsPage />
            </div>
          )}
          {sellerPanel === "tracking" && (
            <div className="up-card up-fade up-d2">
              <TradeTrackingPage />
            </div>
          )}
          {sellerPanel === "profile" && (
            <div className="up-card up-fade up-d2" style={{ minHeight: 360 }}>
              <EditProfileTab user={user} onSave={updateProfile} />
            </div>
          )}
          {sellerPanel === "saved" && (
            <div className="up-card up-fade up-d2" style={{ minHeight: 360 }}>
              <ListingsTab listings={savedListings} view="saved" />
            </div>
          )}
          {sellerPanel === "mylistings" && (
            <div className="up-card up-fade up-d2" style={{ minHeight: 360 }}>
              <ListingsTab listings={userListings} view="all" />
            </div>
          )}
          {sellerPanel === "settings" && (
            <div className="up-card up-fade up-d2" style={{ minHeight: 360 }}>
              <SecurityTab user={user} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SellerProfileView;

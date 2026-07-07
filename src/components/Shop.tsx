import { useState } from "react";
import { PRODUCTS } from "../lib/purchases";
import { useToast } from "./ui/Toast";
import { useAuth } from "../lib/useAuth";
import "./Shop.css";

const PRODUCT_ICONS: Record<string, string> = {
  tmf_premium_lifetime: "👑",
  tmf_cosmetic_gold_avatar: "🥇",
  tmf_theme_night_lab: "🌙",
  tmf_theme_marble: "🏛️",
};

export function Shop() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [owned] = useState<string[]>([]);

  const handleBuy = (productId: string) => {
    void productId;
    void user;
    showToast("Boutique bientôt disponible — en cours d'intégration App Store", "info");
  };

  return (
    <div className="shop-panel">
      <div className="shop-header">
        <div className="shop-title">Boutique du Laboratoire</div>
        <div className="shop-subtitle">Cosmétiques & améliorations permanentes</div>
      </div>

      <div className="shop-grid">
        {PRODUCTS.map((product) => {
          const isOwned = owned.includes(product.id);
          return (
            <div key={product.id} className={`shop-card${isOwned ? " shop-card--owned" : ""}`}>
              <div className="shop-card-icon" aria-hidden="true">
                {PRODUCT_ICONS[product.id] ?? "📦"}
              </div>
              <div className="shop-card-body">
                <div className="shop-card-title">{product.title}</div>
                <div className="shop-card-desc">{product.description}</div>
              </div>
              <div className="shop-card-footer">
                {isOwned ? (
                  <span className="shop-owned-badge">Acquis</span>
                ) : (
                  <button className="shop-buy-btn" onClick={() => handleBuy(product.id)}>
                    {product.price}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="shop-legal">
        Les achats sont définitifs et non remboursables sauf obligation légale.
        Contactez support@tunemyfart.app pour toute question.
      </p>
    </div>
  );
}

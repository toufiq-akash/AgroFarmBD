import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewEligibility, setReviewEligibility] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [existingReview, setExistingReview] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/get-product/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
        alert("Product not found");
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  useEffect(() => {
    fetchReviews();
    if (user && user.role === "Customer") {
      checkReviewEligibility();
    }
  }, [id, user]);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/get-reviews/${id}`);
      setReviews(res.data);
      // Check if current user has a review
      if (user && user.role === "Customer") {
        const userReview = res.data.find((r) => r.customer_id === user.id);
        if (userReview) {
          setExistingReview(userReview);
        }
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    }
  };

  const checkReviewEligibility = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/check-review-eligibility/${id}/${user.id}`);
      setReviewEligibility(res.data);
    } catch (err) {
      console.error("Failed to check review eligibility:", err);
    }
  };

  const handleOrder = () => {
    if (!user) {
      alert("You must log in first to order!");
      navigate("/login");
      return;
    }
    setShowOrderModal(true);
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>Product not found</p>
        <button onClick={() => navigate("/products")}>Back to Products</button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <button style={backBtnStyle} onClick={() => navigate("/products")}>
        ← Back to Products
      </button>

      <div style={detailContainer}>
        <div style={imageSection}>
          <img
            src={`http://localhost:5000${product.image}`}
            alt={product.name}
            style={imageStyle}
          />
        </div>

        <div style={infoSection}>
          <h1 style={titleStyle}>{product.name}</h1>
          <div style={priceStyle}>৳{product.price} per KG</div>
          <div style={ownerStyle}>Seller: {product.ownerName || "Unknown"}</div>
          {product.ownerEmail && (
            <div style={emailStyle}>Email: {product.ownerEmail}</div>
          )}

          <div style={descriptionBox}>
            <h3 style={descTitle}>Description</h3>
            <p style={descText}>{product.description || "No description available"}</p>
          </div>

          <div style={buttonGroup}>
            {user?.role !== "farmowner" && (
              <>
                <button style={orderBtnStyle} onClick={handleOrder}>
                  Order Now
                </button>
                <button
                  style={cartBtnStyle}
                  onClick={() => {
                    const cart = JSON.parse(localStorage.getItem(`cart_user_${user?.id}`) || "[]");
                    const existing = cart.find((item) => item.id === product.id);
                    let newCart;
                    if (existing) {
                      newCart = cart.map((item) =>
                        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                      );
                    } else {
                      newCart = [...cart, { ...product, quantity: 1 }];
                    }
                    localStorage.setItem(`cart_user_${user?.id}`, JSON.stringify(newCart));
                    alert("Added to cart!");
                  }}
                >
                  Add to Cart
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div style={reviewsSectionStyle}>
        <h2 style={reviewsTitleStyle}>Customer Reviews</h2>

        {/* Review Eligibility Message */}
        {user && user.role === "Customer" && reviewEligibility && !reviewEligibility.eligible && (
          <div style={eligibilityMessageStyle}>
            <p>{reviewEligibility.reason || "You can review this product after it is delivered."}</p>
          </div>
        )}

        {/* Review Form - Only shown when eligible */}
        {user && user.role === "Customer" && reviewEligibility?.eligible && (
          <div style={reviewFormContainerStyle}>
            {!showReviewForm ? (
              <button style={writeReviewBtnStyle} onClick={() => setShowReviewForm(true)}>
                {existingReview ? "Edit Your Review" : "Write a Review"}
              </button>
            ) : (
              <ReviewForm
                productId={id}
                customerId={user.id}
                existingReview={existingReview}
                onSuccess={() => {
                  setShowReviewForm(false);
                  fetchReviews();
                  checkReviewEligibility();
                }}
                onCancel={() => setShowReviewForm(false)}
              />
            )}
          </div>
        )}

        {/* Reviews List */}
        <div style={reviewsListStyle}>
          {reviews.length === 0 ? (
            <p style={noReviewsStyle}>No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} style={reviewItemStyle}>
                <div style={reviewHeaderStyle}>
                  <div style={reviewCustomerStyle}>
                    <strong>{review.customer_name}</strong>
                    {review.customer_id === user?.id && <span style={yourReviewBadgeStyle}>Your Review</span>}
                  </div>
                  <div style={reviewRatingStyle}>
                    {[...Array(5)].map((_, i) => (
                      <span key={i} style={i < review.rating ? starFilledStyle : starEmptyStyle}>
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
                {review.comment && <p style={reviewCommentStyle}>{review.comment}</p>}
                <div style={reviewDateStyle}>
                  {new Date(review.created_at).toLocaleDateString()}
                  {review.updated_at !== review.created_at && " (Updated)"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showOrderModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div style={modalHeader}>
              <h3>Complete your order</h3>
              <button style={closeBtn} onClick={() => setShowOrderModal(false)}>✕</button>
            </div>
            <OrderForm
              product={product}
              user={user}
              onClose={() => setShowOrderModal(false)}
              onOrderSuccess={() => {
                setShowOrderModal(false);
                alert("Order placed successfully!");
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Order Form Component
function OrderForm({ product, user, onClose, onOrderSuccess }) {
  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const unitPrice = Number(product?.price || 0);
  const subtotal = +(unitPrice * quantity).toFixed(2);
  const shipping = subtotal > 1000 ? 0 : 50;
  const total = +(subtotal + shipping).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim() || !address.trim()) {
      return setError("Phone and address are required");
    }

    const payload = {
      userId: user.id,
      items: [
        {
          productId: product.id,
          quantity: quantity,
          unitPrice: unitPrice,
          subtotal: subtotal,
        },
      ],
      shipping: shipping,
      totalCost: total,
      phone: phone,
      address: address,
      paymentMethod: paymentMethod,
      note: note,
    };

    try {
      setLoading(true);
      await axios.post("http://localhost:5000/place-order", payload);
      onOrderSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <img
          src={`http://localhost:5000${product.image}`}
          alt={product.name}
          style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 10 }}
        />
        <div>
          <h4>{product.name}</h4>
          <div>৳{unitPrice} per KG</div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
            <span style={{ padding: "4px 12px" }}>{quantity}</span>
            <button type="button" onClick={() => setQuantity((q) => q + 1)}>+</button>
          </div>
        </div>
      </div>

      <input
        type="text"
        placeholder="Phone *"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
        style={inputStyle}
      />
      <textarea
        placeholder="Shipping Address *"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        required
        rows={3}
        style={inputStyle}
      />
      <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={inputStyle}>
        <option value="cod">Cash on Delivery</option>
        <option value="bkash">bKash</option>
        <option value="card">Credit / Debit Card</option>
      </select>
      <input
        type="text"
        placeholder="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={inputStyle}
      />

      <div style={summaryBox}>
        <div style={summaryRow}><span>Subtotal</span><b>৳{subtotal}</b></div>
        <div style={summaryRow}><span>Shipping</span><b>৳{shipping}</b></div>
        <div style={{ ...summaryRow, fontSize: 18 }}><span>Total</span><b>৳{total}</b></div>
      </div>

      {error && <div style={{ color: "red" }}>{error}</div>}

      <div style={{ display: "flex", gap: 10 }}>
        <button type="submit" disabled={loading} style={submitBtn}>
          {loading ? "Placing..." : `Place Order • ৳${total}`}
        </button>
        <button type="button" onClick={onClose} style={cancelBtn}>Cancel</button>
      </div>
    </form>
  );
}

// Styles
const containerStyle = {
  padding: "40px",
  fontFamily: "Arial, sans-serif",
  maxWidth: "1200px",
  margin: "0 auto",
};

const backBtnStyle = {
  padding: "10px 20px",
  background: "#666",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  marginBottom: "20px",
};

const detailContainer = {
  display: "flex",
  gap: "40px",
  flexWrap: "wrap",
};

const imageSection = {
  flex: "1",
  minWidth: "300px",
};

const imageStyle = {
  width: "100%",
  maxWidth: "500px",
  height: "auto",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

const infoSection = {
  flex: "1",
  minWidth: "300px",
};

const titleStyle = {
  fontSize: "32px",
  color: "#1b5e20",
  marginBottom: "10px",
};

const priceStyle = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#2e7d32",
  marginBottom: "10px",
};

const ownerStyle = {
  fontSize: "16px",
  color: "#666",
  marginBottom: "5px",
};

const emailStyle = {
  fontSize: "14px",
  color: "#888",
  marginBottom: "20px",
};

const descriptionBox = {
  background: "#f5f5f5",
  padding: "20px",
  borderRadius: "8px",
  marginTop: "20px",
  marginBottom: "20px",
};

const descTitle = {
  margin: "0 0 10px",
  color: "#333",
};

const descText = {
  margin: 0,
  lineHeight: "1.6",
  color: "#555",
};

const buttonGroup = {
  display: "flex",
  gap: "10px",
  marginTop: "20px",
};

const orderBtnStyle = {
  padding: "12px 24px",
  background: "#04880dff",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "600",
};

const cartBtnStyle = {
  padding: "12px 24px",
  background: "#f57f17",
  color: "#000",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "600",
};

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modalStyle = {
  background: "#fff",
  borderRadius: "12px",
  padding: "30px",
  maxWidth: "600px",
  width: "90%",
  maxHeight: "90vh",
  overflowY: "auto",
};

const modalHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
};

const closeBtn = {
  background: "transparent",
  border: "none",
  fontSize: "24px",
  cursor: "pointer",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "14px",
  boxSizing: "border-box",
};

const summaryBox = {
  borderTop: "1px solid #ccc",
  paddingTop: "10px",
  marginTop: "10px",
};

const summaryRow = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "8px",
};

const submitBtn = {
  padding: "12px 24px",
  background: "#1b5e20",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "600",
};

const cancelBtn = {
  padding: "12px 24px",
  background: "#ccc",
  color: "#333",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px",
};

// Review Form Component
function ReviewForm({ productId, customerId, existingReview, onSuccess, onCancel }) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      return setError("Please select a rating");
    }

    try {
      setLoading(true);
      setError("");
      await axios.post("http://localhost:5000/submit-review", {
        productId: parseInt(productId),
        customerId: parseInt(customerId),
        rating: parseInt(rating),
        comment: comment.trim() || null,
      });
      alert(existingReview ? "Review updated successfully!" : "Review submitted successfully!");
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={reviewFormStyle}>
      <h3 style={reviewFormTitleStyle}>{existingReview ? "Edit Your Review" : "Write a Review"}</h3>
      
      <div style={ratingInputStyle}>
        <label style={ratingLabelStyle}>Rating *</label>
        <div style={starSelectorStyle}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              style={starButtonStyle}
              onMouseEnter={(e) => {
                const stars = e.currentTarget.parentElement.children;
                for (let i = 0; i < star; i++) {
                  stars[i].style.opacity = "1";
                }
              }}
              onMouseLeave={(e) => {
                const stars = e.currentTarget.parentElement.children;
                for (let i = 0; i < 5; i++) {
                  stars[i].style.opacity = i < rating ? "1" : "0.3";
                }
              }}
            >
              <span style={{ fontSize: "28px", opacity: star <= rating ? "1" : "0.3" }}>⭐</span>
            </button>
          ))}
        </div>
        {rating > 0 && <span style={ratingTextStyle}>{rating} out of 5 stars</span>}
      </div>

      <div>
        <label style={commentLabelStyle}>Comment (optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={4}
          style={commentTextareaStyle}
        />
      </div>

      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

      <div style={{ display: "flex", gap: "10px" }}>
        <button type="submit" disabled={loading || rating < 1} style={submitReviewBtnStyle}>
          {loading ? "Submitting..." : existingReview ? "Update Review" : "Submit Review"}
        </button>
        <button type="button" onClick={onCancel} style={cancelBtn}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// Review Styles
const reviewsSectionStyle = {
  marginTop: "40px",
  padding: "30px",
  background: "#f9f9f9",
  borderRadius: "12px",
};

const reviewsTitleStyle = {
  fontSize: "24px",
  color: "#1b5e20",
  marginBottom: "20px",
};

const eligibilityMessageStyle = {
  padding: "15px",
  background: "#fff3cd",
  border: "1px solid #ffc107",
  borderRadius: "8px",
  marginBottom: "20px",
  color: "#856404",
};

const reviewFormContainerStyle = {
  marginBottom: "30px",
};

const writeReviewBtnStyle = {
  padding: "12px 24px",
  background: "#04880dff",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "600",
};

const reviewFormStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "8px",
  border: "1px solid #ddd",
};

const reviewFormTitleStyle = {
  marginTop: 0,
  marginBottom: "20px",
  color: "#333",
};

const ratingInputStyle = {
  marginBottom: "20px",
};

const ratingLabelStyle = {
  display: "block",
  marginBottom: "10px",
  fontWeight: "600",
  color: "#333",
};

const starSelectorStyle = {
  display: "flex",
  gap: "5px",
  marginBottom: "10px",
};

const starButtonStyle = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: "5px",
};

const ratingTextStyle = {
  fontSize: "14px",
  color: "#666",
  marginLeft: "10px",
};

const commentLabelStyle = {
  display: "block",
  marginBottom: "10px",
  fontWeight: "600",
  color: "#333",
};

const commentTextareaStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "14px",
  fontFamily: "inherit",
  resize: "vertical",
  boxSizing: "border-box",
};

const submitReviewBtnStyle = {
  padding: "12px 24px",
  background: "#1b5e20",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "600",
};

const reviewsListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const reviewItemStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "8px",
  border: "1px solid #e0e0e0",
};

const reviewHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "10px",
};

const reviewCustomerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const yourReviewBadgeStyle = {
  background: "#4caf50",
  color: "#fff",
  padding: "2px 8px",
  borderRadius: "4px",
  fontSize: "12px",
};

const reviewRatingStyle = {
  display: "flex",
  gap: "2px",
};

const starFilledStyle = {
  fontSize: "18px",
};

const starEmptyStyle = {
  fontSize: "18px",
  opacity: "0.3",
};

const reviewCommentStyle = {
  margin: "10px 0",
  lineHeight: "1.6",
  color: "#555",
};

const reviewDateStyle = {
  fontSize: "12px",
  color: "#999",
};

const noReviewsStyle = {
  textAlign: "center",
  color: "#999",
  padding: "40px",
  fontStyle: "italic",
};


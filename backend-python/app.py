from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional
from difflib import SequenceMatcher
from math import log1p
import heapq
import re

app = FastAPI(
    title="Tech Store Python AI Service",
    version="4.0.0",
    description="Advanced AI service for Tech Store: recommendations, smart search, chatbot, sentiment, trend analysis, BFS, A star, product DNA and decision intelligence.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5050",
        "http://127.0.0.1:5050",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Product(BaseModel):
    id: str = ""
    productId: Optional[str] = ""
    title: str = ""
    category: str = "Technology"
    rawCategory: Optional[str] = ""
    brand: str = "Tech Brand"
    price: float = 0
    rating: float = 0
    reviewCount: int = 0
    stock: int = 25
    description: str = ""
    availability: str = "In stock"
    discountPercentage: Optional[float] = 0


class RecommendationRequest(BaseModel):
    products: List[Product] = []
    query: str = ""
    usage: str = "study"
    budget: float = 1000
    preferredBrand: Optional[str] = ""
    category: Optional[str] = ""
    userInterests: List[str] = []


class SuggestRequest(BaseModel):
    query: str = ""
    history: List[str] = []


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    products: List[Product] = []


class SentimentRequest(BaseModel):
    reviews: List[str] = []


class TrendingRequest(BaseModel):
    products: List[Product] = []


class GraphSearchRequest(BaseModel):
    query: str = ""
    products: List[Product] = []
    usage: str = "study"
    budget: float = 1000


USAGE_KEYWORDS: Dict[str, List[str]] = {
    "study": ["laptop", "student", "battery", "portable", "ssd", "notebook", "office", "keyboard"],
    "gaming": ["gaming", "rtx", "gpu", "graphics", "playstation", "xbox", "mouse", "keyboard", "refresh"],
    "office": ["office", "business", "monitor", "keyboard", "mouse", "laptop", "desktop", "reliable"],
    "creator": ["creator", "editing", "oled", "display", "camera", "gpu", "ram", "ssd", "pro"],
    "mobile": ["iphone", "samsung", "galaxy", "phone", "mobile", "camera", "battery", "storage"],
    "accessories": ["headphone", "keyboard", "mouse", "charger", "case", "watch", "accessory", "wireless"],
}

POPULAR_SEARCHES = [
    "best gaming laptop",
    "best phone under 1000",
    "iphone",
    "samsung smartphone",
    "wireless headphones",
    "smart watch",
    "gaming mouse",
    "professional laptop",
    "camera phone",
    "student laptop",
    "creator laptop",
    "computer monitor",
    "budget laptop",
    "gaming accessories",
]

POSITIVE_WORDS = {
    "good", "great", "excellent", "fast", "best", "amazing", "clear", "reliable",
    "smooth", "premium", "beautiful", "strong", "perfect", "love", "recommended",
    "value", "durable", "comfortable", "powerful", "quality",
}

NEGATIVE_WORDS = {
    "bad", "slow", "poor", "broken", "late", "expensive", "weak", "problem",
    "faulty", "worst", "issue", "return", "damaged", "overheat", "lag", "cheap",
}


def clean_text(value: str) -> str:
    return re.sub(r"[^a-zA-Z0-9\s]", " ", str(value or "").lower()).strip()


def similarity(a: str, b: str) -> float:
    a_clean = clean_text(a)
    b_clean = clean_text(b)

    if not a_clean or not b_clean:
        return 0.0

    return SequenceMatcher(None, a_clean, b_clean).ratio()


def product_text(product: Product) -> str:
    return clean_text(
        f"{product.title} {product.category} {product.rawCategory or ''} "
        f"{product.brand} {product.description}"
    )


def clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def content_score(product: Product, query: str, usage: str, interests: List[str]) -> float:
    text = product_text(product)
    score = 0.0

    if query:
        score += similarity(query, text) * 0.45
        for token in clean_text(query).split():
            if token in text:
                score += 0.05

    keywords = USAGE_KEYWORDS.get(clean_text(usage), USAGE_KEYWORDS["study"])
    keyword_hits = sum(1 for word in keywords if word in text)
    score += min(0.35, keyword_hits / max(len(keywords), 1))

    for interest in interests:
        if clean_text(interest) and clean_text(interest) in text:
            score += 0.06

    return clamp(score)


def budget_score(price: float, budget: float) -> float:
    if price <= 0 or budget <= 0:
        return 0.55

    if price <= budget:
        closeness = 1 - abs(budget - price) / max(budget, 1)
        return clamp(0.75 + closeness * 0.25)

    over_ratio = (price - budget) / max(budget, 1)
    return clamp(1.0 - over_ratio)


def rating_score(rating: float) -> float:
    if rating <= 0:
        return 0.55

    return clamp(rating / 5.0)


def popularity_score(review_count: int) -> float:
    return clamp(log1p(max(review_count, 0)) / 7.0)


def stock_score(product: Product) -> float:
    if product.stock > 0 or "stock" in clean_text(product.availability):
        return 1.0

    return 0.2


def brand_score(product: Product, preferred: str) -> float:
    preferred_clean = clean_text(preferred)

    if not preferred_clean:
        return 0.65

    return 1.0 if preferred_clean in clean_text(product.brand) else 0.35


def discount_score(product: Product) -> float:
    return clamp(max(product.discountPercentage or 0, 0) / 30.0)


def final_recommendation_score(product: Product, payload: RecommendationRequest) -> Dict[str, float]:
    components = {
        "contentMatch": content_score(product, payload.query, payload.usage, payload.userInterests),
        "budgetFit": budget_score(product.price, payload.budget),
        "ratingStrength": rating_score(product.rating),
        "popularity": popularity_score(product.reviewCount),
        "stockConfidence": stock_score(product),
        "brandFit": brand_score(product, payload.preferredBrand or ""),
        "discountValue": discount_score(product),
    }

    score = (
        0.28 * components["contentMatch"]
        + 0.18 * components["budgetFit"]
        + 0.17 * components["ratingStrength"]
        + 0.12 * components["popularity"]
        + 0.10 * components["stockConfidence"]
        + 0.08 * components["brandFit"]
        + 0.07 * components["discountValue"]
    )

    components["finalScore"] = round(clamp(score), 4)
    return components


def recommendation_reason(product: Product, payload: RecommendationRequest, components: Dict[str, float]) -> str:
    reasons = []

    if components["contentMatch"] > 0.42:
        reasons.append(f"matches {payload.usage} usage")

    if components["budgetFit"] >= 0.8:
        reasons.append("strong budget fit")

    if components["ratingStrength"] >= 0.85:
        reasons.append("high customer rating")

    if components["stockConfidence"] >= 1:
        reasons.append("available in stock")

    if components["brandFit"] >= 0.95:
        reasons.append("preferred brand match")

    if components["discountValue"] >= 0.3:
        reasons.append("good discount value")

    if not reasons:
        reasons.append("balanced AI match")

    return f"{', '.join(reasons)} · AI score {round(components['finalScore'] * 100)}%"


def sentiment_label(review: str) -> str:
    words = set(clean_text(review).split())
    positive = len(words.intersection(POSITIVE_WORDS))
    negative = len(words.intersection(NEGATIVE_WORDS))

    if positive > negative:
        return "positive"

    if negative > positive:
        return "negative"

    return "neutral"


def trend_score(product: Product) -> Dict[str, float]:
    rating_component = rating_score(product.rating)
    popularity_component = popularity_score(product.reviewCount)
    stock_component = stock_score(product)
    discount_component = discount_score(product)
    category_heat = 0.85 if clean_text(product.category) in ["laptops", "mobiles", "gaming", "technology"] else 0.65

    score = (
        0.30 * rating_component
        + 0.25 * popularity_component
        + 0.18 * stock_component
        + 0.15 * discount_component
        + 0.12 * category_heat
    )

    return {
        "ratingTrend": round(rating_component, 4),
        "reviewMomentum": round(popularity_component, 4),
        "stockMomentum": round(stock_component, 4),
        "discountHeat": round(discount_component, 4),
        "categoryHeat": round(category_heat, 4),
        "trendScore": round(clamp(score), 4),
    }


def generate_persona(payload: RecommendationRequest) -> Dict[str, Any]:
    usage = clean_text(payload.usage) or "study"
    budget = payload.budget

    if usage == "gaming":
        persona = "Performance Gamer"
        priorities = ["graphics performance", "rating", "cooling", "accessories compatibility"]
    elif usage == "creator":
        persona = "Creative Professional"
        priorities = ["display quality", "performance", "storage", "camera or GPU capability"]
    elif usage == "mobile":
        persona = "Smartphone Power User"
        priorities = ["camera", "battery", "brand trust", "storage"]
    elif usage == "office":
        persona = "Productivity Buyer"
        priorities = ["reliability", "keyboard comfort", "battery life", "price stability"]
    elif usage == "accessories":
        persona = "Tech Accessory Optimizer"
        priorities = ["compatibility", "comfort", "price", "ratings"]
    else:
        persona = "Student Value Seeker"
        priorities = ["budget fit", "portability", "rating", "warranty"]

    budget_label = "budget friendly" if budget <= 500 else "balanced" if budget <= 1200 else "premium"

    return {
        "persona": persona,
        "budgetBand": budget_label,
        "priorities": priorities,
        "summary": f"{persona} profile detected with a {budget_label} budget strategy.",
    }


def product_dna(product: Product, payload: RecommendationRequest) -> Dict[str, Any]:
    components = final_recommendation_score(product, payload)
    trend = trend_score(product)

    strengths = []
    weaknesses = []

    if components["contentMatch"] >= 0.55:
        strengths.append("Strong need match")
    else:
        weaknesses.append("Need match can be improved")

    if components["budgetFit"] >= 0.80:
        strengths.append("Good budget fit")
    else:
        weaknesses.append("Above ideal budget")

    if components["ratingStrength"] >= 0.85:
        strengths.append("High rating strength")

    if trend["trendScore"] >= 0.75:
        strengths.append("Trending product potential")

    if components["stockConfidence"] >= 1:
        strengths.append("Available in stock")

    if not weaknesses:
        weaknesses.append("No major weakness detected")

    return {
        "id": product.id or product.productId,
        "title": product.title,
        "brand": product.brand,
        "category": product.category,
        "components": {key: round(value * 100, 2) for key, value in components.items()},
        "trend": {key: round(value * 100, 2) for key, value in trend.items()},
        "strengths": strengths,
        "weaknesses": weaknesses,
    }


def bfs_demo(query: str, products: List[Product]) -> List[str]:
    query_node = f"Need: {query or 'technology product'}"
    category_nodes = []
    brand_nodes = []
    product_nodes = []

    for product in products[:8]:
        if product.category and product.category not in category_nodes:
            category_nodes.append(product.category)

        if product.brand and product.brand not in brand_nodes:
            brand_nodes.append(product.brand)

        product_nodes.append(product.title)

    path = [query_node]

    if category_nodes:
        path.append(f"Category: {category_nodes[0]}")

    if brand_nodes:
        path.append(f"Brand: {brand_nodes[0]}")

    if product_nodes:
        path.append(f"Product: {product_nodes[0]}")

    return path


def astar_demo(payload: GraphSearchRequest) -> List[Dict[str, Any]]:
    heap = []

    for product in payload.products:
        mock_payload = RecommendationRequest(
            products=[],
            query=payload.query,
            usage=payload.usage,
            budget=payload.budget,
            preferredBrand="",
            userInterests=[],
        )
        components = final_recommendation_score(product, mock_payload)
        score = components["finalScore"]
        cost = round(1.0 - score, 4)

        heapq.heappush(
            heap,
            (
                cost,
                {
                    "id": product.id or product.productId,
                    "title": product.title,
                    "estimatedCost": cost,
                    "heuristicScore": score,
                    "explanation": "A star selected this product because it has lower mismatch with the user query.",
                },
            ),
        )

    return [heapq.heappop(heap)[1] for _ in range(min(8, len(heap)))]


@app.get("/")
def root():
    return {
        "success": True,
        "service": "Tech Store Python AI Service",
        "version": "4.0.0",
        "features": [
            "hybrid recommendations",
            "product DNA",
            "buyer persona",
            "budget optimizer",
            "smart search",
            "chatbot",
            "sentiment analysis",
            "trend analysis",
            "BFS demo",
            "A star demo",
        ],
    }


@app.get("/health")
def health():
    return {
        "success": True,
        "status": "ok",
        "aiEngine": "advanced-lightweight-python-ai",
    }


@app.post("/recommend")
def recommend(payload: RecommendationRequest):
    ranked = []

    for product in payload.products:
        components = final_recommendation_score(product, payload)
        ranked.append(
            {
                "product": product.model_dump(),
                "score": components["finalScore"],
                "aiScore": round(components["finalScore"] * 100, 2),
                "reason": recommendation_reason(product, payload, components),
                "dna": product_dna(product, payload),
            }
        )

    ranked.sort(key=lambda item: item["score"], reverse=True)

    return {
        "success": True,
        "query": payload.query,
        "usage": payload.usage,
        "persona": generate_persona(payload),
        "recommendations": ranked[:12],
        "model": "hybrid content, budget, rating, stock, brand, discount and popularity scoring",
    }


@app.post("/intelligence-lab")
def intelligence_lab(payload: RecommendationRequest):
    ranked = []

    for product in payload.products:
        components = final_recommendation_score(product, payload)
        ranked.append(
            {
                "product": product.model_dump(),
                "score": components["finalScore"],
                "aiScore": round(components["finalScore"] * 100, 2),
                "reason": recommendation_reason(product, payload, components),
                "dna": product_dna(product, payload),
            }
        )

    ranked.sort(key=lambda item: item["score"], reverse=True)

    best = ranked[0] if ranked else None
    budget_safe = [
        item for item in ranked
        if item["product"].get("price", 0) <= payload.budget
    ]

    best_value = budget_safe[0] if budget_safe else best

    graph_payload = GraphSearchRequest(
        query=payload.query,
        usage=payload.usage,
        budget=payload.budget,
        products=payload.products,
    )

    return {
        "success": True,
        "persona": generate_persona(payload),
        "topPick": best,
        "bestValue": best_value,
        "ranked": ranked[:12],
        "productDNA": [item["dna"] for item in ranked[:6]],
        "bfsPath": bfs_demo(payload.query, payload.products),
        "astarRankedNodes": astar_demo(graph_payload),
        "explainability": {
            "initialState": payload.query or "user product need",
            "goalState": "best matched product",
            "actions": [
                "read user query",
                "match category and brand",
                "evaluate budget",
                "evaluate rating and reviews",
                "rank with heuristic score",
            ],
            "heuristic": "1 minus hybrid AI recommendation score",
        },
    }


@app.post("/suggest")
def suggest(payload: SuggestRequest):
    query = clean_text(payload.query)
    history = [clean_text(item) for item in payload.history]

    candidates = POPULAR_SEARCHES + history + [
        f"{query} under budget",
        f"best {query}",
        f"{query} accessories",
        f"{query} for gaming",
        f"{query} for students",
        f"{query} for office",
        f"compare {query}",
    ]

    unique_candidates = []
    for item in candidates:
        if item and item not in unique_candidates:
            unique_candidates.append(item)

    ranked = sorted(
        unique_candidates,
        key=lambda item: similarity(query, item),
        reverse=True,
    )

    return {
        "success": True,
        "query": payload.query,
        "suggestions": ranked[:10],
    }


@app.post("/chat")
def chat(payload: ChatRequest):
    text = clean_text(payload.message)

    if "track" in text or "order" in text:
        reply = "You can track your order from the Order Tracking page using your order ID. Example: TS-2026-0042."
    elif "gaming" in text:
        reply = "For gaming, I recommend checking products with high rating, good stock, performance keywords and strong trend score."
    elif "under" in text or "budget" in text or "cheap" in text:
        reply = "I can rank products by budget fit, rating, relevance and stock. Try a query like best phone under 1000."
    elif "apple" in text or "iphone" in text:
        reply = "For Apple or iPhone style products, compare camera quality, storage, battery, price, warranty and review sentiment."
    elif "camera" in text and "phone" in text:
        reply = "For camera phones, check rating, review sentiment, image quality descriptions, brand trust and storage."
    elif "accessor" in text or "headphone" in text or "mouse" in text:
        reply = "For accessories, compare compatibility, comfort, rating, warranty, price and stock."
    elif "recommend" in text or "best" in text:
        reply = "Tell me your use case and budget. I can rank products with hybrid AI scoring and show explainable reasons."
    else:
        reply = "I can help with smart search, product recommendations, review sentiment, trend analysis, BFS and A star based product discovery."

    suggestions = [
        "Show gaming laptops",
        "Best phone under $1000",
        "Show Apple products",
        "Recommend accessories",
    ]

    return {
        "success": True,
        "reply": reply,
        "suggestions": suggestions,
    }


@app.post("/sentiment")
def sentiment(payload: SentimentRequest):
    labels = [sentiment_label(review) for review in payload.reviews if review.strip()]

    if not labels:
        return {
            "success": True,
            "positive": 82,
            "neutral": 14,
            "negative": 4,
            "dominant": "positive",
            "summary": "No review text was provided, so a positive demo sentiment summary is shown.",
        }

    total = len(labels)
    positive = round(labels.count("positive") / total * 100, 2)
    neutral = round(labels.count("neutral") / total * 100, 2)
    negative = round(labels.count("negative") / total * 100, 2)

    dominant = max(
        {"positive": positive, "neutral": neutral, "negative": negative},
        key={"positive": positive, "neutral": neutral, "negative": negative}.get,
    )

    return {
        "success": True,
        "positive": positive,
        "neutral": neutral,
        "negative": negative,
        "dominant": dominant,
        "summary": f"Review sentiment is mostly {dominant}.",
    }


@app.post("/trending-analysis")
def trending_analysis(payload: TrendingRequest):
    ranked = []

    for product in payload.products:
        score = trend_score(product)
        ranked.append(
            {
                "product": product.model_dump(),
                "trendScore": round(score["trendScore"] * 100, 2),
                "components": {key: round(value * 100, 2) for key, value in score.items()},
                "reason": "Trend score calculated from rating, reviews, stock, category heat and discount strength.",
            }
        )

    ranked.sort(key=lambda item: item["trendScore"], reverse=True)

    return {
        "success": True,
        "trending": ranked[:10],
    }


@app.post("/graph-search")
def graph_search(payload: GraphSearchRequest):
    return {
        "success": True,
        "initialState": payload.query or "user product need",
        "goalState": "ranked product recommendation",
        "actions": [
            "search product",
            "match category",
            "compare brand",
            "evaluate price",
            "rank product",
        ],
        "bfsPath": bfs_demo(payload.query, payload.products),
        "astarRankedNodes": astar_demo(payload),
        "heuristic": "normalized mismatch between user need and product attributes",
    }
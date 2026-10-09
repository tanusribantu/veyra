# VEYRA — Complete Project Context & Prototype Blueprint

Project vision • Product requirements • Architecture • Tech stack • APIs • AI/ML • Data strategy • Development roadmap

Veyra is not just another fashion recommendation application. The objective is to build a personalized style intelligence system that understands a user's wardrobe, preferences, context, and feedback to help them make better clothing decisions.

Since the previous three attempts did not get us to the result we wanted, this document takes a different approach: preserve the long-term vision, but build the smallest working version first. This is the complete working context to use as the foundation when starting the Veyra prototype.

One important distinction throughout this blueprint:

- Established project direction: the core vision, personalized outfit recommendations, wardrobe understanding, explainability, and gradual introduction of AI.
- Proposed implementation: the specific API contracts, database schema, folder structure, scoring formulas, and development sequence below. These provide a concrete starting point; they are not claims that every component has already been implemented.

# 1. Veyra's identity: the core meaning

## What is Veyra?

Veyra is a personal style intelligence platform that helps people discover what works for them, rather than merely following what is fashionable.

Most fashion applications help users browse products, discover trends, shop for clothing, or copy pre-existing outfits. Veyra's central direction is different: it starts with the individual.

It should eventually understand:

- Who the user is in terms of their style preferences.
- What clothes the user already owns.
- Which colors, patterns, fits, and combinations they prefer.
- What occasion they are dressing for.
- Why a particular combination might work.
- How the user's choices and feedback should influence future recommendations.

The goal is not to declare that one outfit is universally perfect. It is to find outfits that make sense for a particular person, wardrobe, and situation.

## The deeper meaning behind Veyra

I would express the product philosophy through three principles.

1\. Personal, not universal

Fashion recommendations should reflect individual preferences instead of assuming everyone should follow the same trends or standards.

2\. Explainable, not mysterious

Veyra should explain the factors behind its recommendations. Users should understand why an outfit was suggested rather than blindly trusting an AI score.

3\. Adaptive, not static

Over time, Veyra should learn from the outfits users like, dislike, select, and actually wear—gradually becoming more relevant to each individual.

These principles form the product's foundation. Computer vision, recommendation models, language models, and databases are tools used to achieve this goal; they are not the goal themselves.

## The core product promise

> Veyra helps you understand your wardrobe, discover combinations that suit your personal style, and understand why those combinations work—while learning what works best for you over time.

# 2. The complete product journey

This is the intended long-term user experience, not a list of features to implement all at once.

User profile

Style preferences, favorite colors, fit, formality and preferences

Digital wardrobe

Clothing items, categories, colors, attributes and images

Context

Casual, work, college, formal events and other occasions

Veyra intelligence

Candidate generation, compatibility scoring and personalization

Outfit recommendation

Suggested outfit, compatibility score, explanation and alternatives

Feedback loop

Like, dislike, choose, skip and eventually record what was worn

Feedback informs future personalization.

## Example of Veyra in action

A user adds these items:

- White solid shirt
- Black T-shirt
- Blue jeans
- Beige chinos
- White sneakers
- Black sneakers

The user selects Casual.

Veyra might recommend:

[5 Simple Outfits For Men - LIFESTYLE BY PS](https://images.openai.com/static-rsc-4/AfmFLQKrPx2t0GfzTjALDMu6TDDe7ZpShoq1W7F_GoVhpUgJJ4qzWwWr-IAL-A-IIwgxMwXPsEomV3jbtkJJj3AR9BZDTkOqXJejsbaJDn6B10iOMoFxgzKD_YV5JBR-Tzid_eN8nW2tg8pK9jFTc_YThRAHVvn0-ysLKRsdhYs?purpose=inline)

## Casual minimal outfit

# 87/100

Illustrative score, not a trained model prediction

Why it works

- Matches the user's minimal style preference.
- Combines neutral colors with a familiar casual silhouette.
- Fits the selected occasion.
- Uses clothes the user already owns.

Potential trade-off: The outfit may be too casual for a formal setting.

This example captures an important requirement: Veyra should not just output clothing items. It should produce a recommendation that is understandable, context-aware, and eventually personalized.

# 3. Product scope: what we are actually building

We need three distinct product stages.

Stage 1 — Prototype

Start here

Goal: prove that Veyra can generate sensible outfits.

- React UI
- Flask backend
- Small manually entered wardrobe
- Rule-based recommendation engine
- Explainable scores and reasons
- Sample data; SQLite or even in-memory data initially

No custom ML training is required.

Stage 2 — MVP

Goal: make the core journey usable by real people.

- Persistent PostgreSQL database
- Authentication and user-specific data
- Wardrobe CRUD and image storage
- Recommendation history and feedback
- Better ranking and validation
- Deployment, automated tests and error handling

Stage 3 — Veyra Intelligence

Goal: improve perception, compatibility and personalization.

- Pretrained clothing detection and attribute models
- Learned outfit compatibility
- Image embeddings and semantic search where useful
- Feedback-based recommendation ranking
- LLM-based explanations
- More advanced contextual recommendations

Important: These are capability stages, not promises that every stage needs a separate model. A pretrained model, deterministic algorithm, or external API may be sufficient for a capability.

## Features by priority

| Feature                    | Prototype        | MVP                         | Later                                      |
| -------------------------- | ---------------- | --------------------------- | ------------------------------------------ |
| Style profile              | Simple form      | Persistent profile          | Adaptive preferences                       |
| Digital wardrobe           | Manual entry     | Images and CRUD             | Automatic image recognition                |
| Outfit generation          | Rules            | Improved ranking            | Learned compatibility                      |
| Explanation                | Rule-generated   | More detailed               | Optional LLM                               |
| Feedback                   | Basic buttons    | Saved to database           | Personalization model                      |
| Authentication             | Optional locally | Required for multi-user use | Stronger security                          |
| Face/body analysis         | Excluded         | Excluded                    | Only if justified and responsibly designed |
| Shopping/product discovery | Excluded         | Excluded                    | Separate product direction                 |
| Weather/trends             | Excluded         | Excluded                    | Add only if the use case needs it          |

The first prototype should solve one problem very well: recommend a sensible outfit from the user's own wardrobe for a selected occasion and explain why.

# 4. Technology stack

This is the proposed baseline for the rebuild, taking into account the existing Veyra work with Flask, Gunicorn, PostgreSQL migration and Docker.

[React Logo, Interactive, JavaScript, Web Development, Library PNG](https://images.openai.com/static-rsc-4/Fl2k_M2MV9G60-G7WybCJohvSsz5vwqQsQppvr32F68EV081GHJtW9RJC9qzUmIyqYoKRib8QukYMDHeoi9S68vPmo6QWCkUSZ04wokMQon4iVyQtTjASZavNLZps_OHoxGIXYHG61QQxMlUTbtbDTcfPlPzUqtZndtSvw9CQCM?purpose=inline)

Frontend — React

JavaScript, HTML5, CSS3, React components and API integration.

Build the profile, wardrobe, occasion selector, recommendation result and feedback screens.

[Python logo Icons, Logos, Symbols – Free Download PNG, SVG](https://images.openai.com/static-rsc-4/DmsB8FS-GP7uphH6D36okAKArZlBuv18j7laB7MGQztxtnElBP3iuvRtFFsgJN3_CMjTR795lNP5nkz0C0O5HRM_6vUhOfMDScUzQErc9yfIrgdVyj38VLAdNtbsn3vWhJAUhRcvYx9LUssqXM5zJvcGr4rSiP0dNojMqKdTlnc?purpose=inline)

Backend — Python + Flask

REST APIs, request validation, business logic and recommendation services.

Use Flask rather than adding another backend framework during the initial rebuild.

[Docker Hub Container Image Library | App Containerization](https://images.openai.com/static-rsc-4/Pole4xk5FkyhFJxxWDBh3yHjF1pQlxteoZyEQA0ykJQSPxLpLcdTrKWhkIQ2-SeCQp9ObINiyVMBFzoUkAM9P9RUAWW761nUuSEzxGOPsF9Keb0OX7HGw8IiQD84tSEoRfxnWrmYPSxGM1Bq9IBWZrT-EGb7Ta0uoZ1t6-qsVoY?purpose=inline)

Database — SQLite → PostgreSQL

SQLite for the smallest local prototype; PostgreSQL for the MVP.

Store users, style profiles, clothing items, recommendations and feedback.

[Intro to PyTorch: Part 1. A brief introduction to the PyTorch… | by Tony Flores | TDS Archive | Medium](https://images.openai.com/static-rsc-4/95LFP4nKYN43tfIte_2ZxS5PUGUTopOOh4ub4ZKXoI9XCo4k8OnCOqJvYOkF0XYs0H3bZhdiSXswaWqxMnkbjCttNZwIlu7DEHzoLHmB7dfEFwcfyXMpMjJ509EO6opJyvynbjQyKcP5QwUXmT-vA5Cj8niIZef0-hKJC1DMfS0?purpose=inline)

AI/ML — Python ecosystem

Pandas, NumPy, scikit-learn, PyTorch and OpenCV as needed.

Begin with Python rules and tests. Introduce ML libraries when an actual feature needs them.

[docker Logo PNG Vector (SVG) Free Download](https://images.openai.com/static-rsc-4/R3tE02yQDDdrIl6Y80p2egXN6vwiSR9hKiNlew9xJDHhHCd8CZixMDiOe_pHIFhQZOscJaB4FYXNP06W9P60nxIT5jsSVnyIMRI3Gj2fry6bJ-Z1UcJzVLjvbHqfUZXJNpiT7V7Yl9VplHUBGs4QsgfSbR35dVUxWHcDx7_FPyg?purpose=inline)

Packaging — Docker

Dockerfile, Docker Compose and Gunicorn.

Containerize the working backend and later the complete application. Don't let infrastructure delay the prototype.

## Supporting tools

| Purpose                      | Proposed tool                                                  |
| ---------------------------- | -------------------------------------------------------------- |
| API testing                  | Postman                                                        |
| Version control              | Git + GitHub                                                   |
| Python dependency management | `venv` + `requirements.txt`                                    |
| Frontend dependencies        | npm                                                            |
| Database schema changes      | Flask-Migrate / Alembic when needed                            |
| Input validation             | Pydantic or Marshmallow; select one approach                   |
| Testing                      | pytest, React Testing Library                                  |
| Image processing             | Pillow, OpenCV                                                 |
| Model training               | PyTorch or scikit-learn, depending on the model                |
| Image storage                | Local files in development; object storage in deployment       |
| Deployment                   | Simple frontend hosting + backend hosting + managed PostgreSQL |
| Monitoring                   | Application logs and health checks initially                   |

Do not introduce Kubernetes, Kafka, Redis, microservices or a vector database just because they appear in modern AI architectures. None is necessary for the first Veyra prototype.

## Why Flask instead of Spring Boot?

Veyra already had work involving Flask, Gunicorn, Docker and a PostgreSQL migration. Flask also makes it straightforward to build the Python-based recommendation and ML pipeline.

Using React + Flask keeps the initial architecture small and avoids maintaining two backend implementations. If there is a strong existing reason to retain another backend, we should settle that before implementation—not run two competing backends unnecessarily.

# 5. System architecture

The proposed MVP architecture is a modular monolith: one backend application, with clear internal modules.

\#chatgpt-mermaid-\_r_1e4\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_1e4\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_1e4\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_1e4\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_1e4\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1e4\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_1e4\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_1e4\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_1e4\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_1e4\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_1e4\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_1e4\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_1e4\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_1e4\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_1e4\_ p{margin:0;}#chatgpt-mermaid-\_r_1e4\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1e4\_ .cluster-label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1e4\_ .cluster-label span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1e4\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_1e4\_ .label text,#chatgpt-mermaid-\_r_1e4\_ span{fill:rgb(13, 13, 13);color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1e4\_ .node rect,#chatgpt-mermaid-\_r_1e4\_ .node circle,#chatgpt-mermaid-\_r_1e4\_ .node ellipse,#chatgpt-mermaid-\_r_1e4\_ .node polygon,#chatgpt-mermaid-\_r_1e4\_ .node path{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_1e4\_ .rough-node .label text,#chatgpt-mermaid-\_r_1e4\_ .node .label text,#chatgpt-mermaid-\_r_1e4\_ .image-shape .label,#chatgpt-mermaid-\_r_1e4\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_1e4\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_1e4\_ .rough-node .label,#chatgpt-mermaid-\_r_1e4\_ .node .label,#chatgpt-mermaid-\_r_1e4\_ .image-shape .label,#chatgpt-mermaid-\_r_1e4\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_1e4\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_1e4\_ .root .anchor path{fill:rgb(143, 143, 143)!important;stroke-width:0;stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_1e4\_ .arrowheadPath{fill:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_1e4\_ .edgePath .path{stroke:rgb(143, 143, 143);stroke-width:1px;}#chatgpt-mermaid-\_r_1e4\_ .flowchart-link{stroke:rgb(143, 143, 143);fill:none;}#chatgpt-mermaid-\_r_1e4\_ .edgeLabel{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_1e4\_ .edgeLabel p{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_1e4\_ .edgeLabel rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_1e4\_ .labelBkg{background-color:rgba(252, 252, 252, 0.5);}#chatgpt-mermaid-\_r_1e4\_ .cluster rect{fill:rgb(243, 243, 243);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_1e4\_ .cluster text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1e4\_ .cluster span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1e4\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(243, 243, 243);border:1px solid rgba(0, 0, 0, 0.1);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_1e4\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1e4\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_1e4\_ .icon-shape,#chatgpt-mermaid-\_r_1e4\_ .image-shape{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_1e4\_ .icon-shape p,#chatgpt-mermaid-\_r_1e4\_ .image-shape p{background-color:rgb(252, 252, 252);padding:2px;}#chatgpt-mermaid-\_r_1e4\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_1e4\_ .image-shape .label rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_1e4\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_1e4\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_1e4\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_1e4\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_1e4\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_1e4\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_1e4\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1e4\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_1e4\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_1e4\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_1e4\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1e4\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_1e4\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_1e4\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1e4\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_1e4\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_1e4\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1e4\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_1e4\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1e4\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_1e4\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_1e4\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_1e4\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_1e4\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-width:1px;}#chatgpt-mermaid-\_r_1e4\_ .node rect,#chatgpt-mermaid-\_r_1e4\_ .node circle,#chatgpt-mermaid-\_r_1e4\_ .node ellipse,#chatgpt-mermaid-\_r_1e4\_ .node polygon,#chatgpt-mermaid-\_r_1e4\_ .node path{fill:rgb(229, 243, 255);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_1e4\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_1e4\_ .node.mermaid-decision .label-container{fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-dasharray:2,2;}#chatgpt-mermaid-\_r_1e4\_ .edgePaths .flowchart-link{stroke:rgb(143, 143, 143);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_1e4\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_1e4\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}UserReact FrontendFlask REST APIAuthentication and ProfileWardrobe ServiceRecommendation ServiceCompatibility and ScoringRulesRanking and PersonalizationPostgreSQLImage StorageExplanation Builder

The prototype can omit authentication, image storage, ranking models and PostgreSQL until they are needed. The diagram describes where the application can grow without requiring those components immediately.

## Responsibilities of each layer

React frontend

- Collect user preferences.
- Display wardrobe items.
- Let the user select an occasion.
- Render recommended outfits, scores and reasons.
- Capture feedback.

Flask API

- Validate incoming requests.
- Enforce user-level access when authentication is introduced.
- Call the relevant services.
- Return consistent JSON responses.

Recommendation service

- Retrieve eligible wardrobe items.
- Generate possible outfit combinations.
- Score compatibility, occasion fit and user preferences.
- Return ranked candidates with reasons.

Database

- Persist the source data and recommendation history.
- Keep each user's information isolated.
- Store feedback for future personalization.

AI/ML layer

- Eventually recognize garments from images.
- Estimate visual attributes.
- Improve outfit ranking.
- Provide language explanations when appropriate.

The API should not contain the recommendation algorithm itself. Routes should call services, and services should call reusable scoring and ranking modules.

# 6. API design — the proposed Veyra REST contract

The API is the communication layer between React and Flask. We should establish the contract before building all the screens, so frontend and backend work can proceed without guessing.

For the prototype, implement only the first two or three endpoints. The complete list below is the proposed API roadmap.

Base URL for local development:

```
http://localhost:5000/api/v1
```

## A. Health and system

| Method | Endpoint  | Purpose                                            |
| ------ | --------- | -------------------------------------------------- |
| `GET`  | `/health` | Check whether the backend is running               |
| `GET`  | `/meta`   | Return supported occasions and clothing categories |

Example health response:

```
{
  "status": "ok",
  "service": "veyra-api",
  "version": "0.1.0"
}
```

Health checks should not expose secrets or internal infrastructure details.

## B. User profile and preferences

| Method | Endpoint               | Purpose                             |
| ------ | ---------------------- | ----------------------------------- |
| `POST` | `/auth/register`       | Register a user — MVP               |
| `POST` | `/auth/login`          | Authenticate a user — MVP           |
| `GET`  | `/profile`             | Retrieve the current user's profile |
| `PUT`  | `/profile`             | Update style preferences            |
| `GET`  | `/profile/preferences` | Read preference settings            |
| `PUT`  | `/profile/preferences` | Update preference settings          |

A proposed profile object:

```
{
  "preferred_styles": ["minimal", "casual"],
  "favorite_colors": ["navy", "white", "black"],
  "avoided_colors": ["neon-green"],
  "fit_preference": "regular",
  "pattern_preference": "low",
  "formality_preference": 3
}
```

These are illustrative properties, not a final validated schema. Avoid collecting personal information that is unnecessary for the recommendation.

## C. Wardrobe management

| Method   | Endpoint                  | Purpose                        |
| -------- | ------------------------- | ------------------------------ |
| `GET`    | `/wardrobe`               | List wardrobe items            |
| `POST`   | `/wardrobe`               | Add an item manually           |
| `GET`    | `/wardrobe/{item_id}`     | Retrieve an item               |
| `PATCH`  | `/wardrobe/{item_id}`     | Edit item attributes           |
| `DELETE` | `/wardrobe/{item_id}`     | Delete an item                 |
| `POST`   | `/wardrobe/analyze-image` | Future clothing image analysis |

Example `POST /wardrobe` request:

```
{
  "name": "White shirt",
  "category": "shirt",
  "color": "white",
  "pattern": "solid",
  "fit": "regular",
  "formality": 3
}
```

Example response:

```
{
  "id": "item_001",
  "name": "White shirt",
  "category": "shirt",
  "color": "white",
  "pattern": "solid",
  "fit": "regular",
  "formality": 3
}
```

The item ID above is an example. In the actual API, the server generates unique identifiers.

## D. Outfit recommendations — the core API

| Method | Endpoint                                        | Purpose                            |
| ------ | ----------------------------------------------- | ---------------------------------- |
| `POST` | `/recommendations`                              | Generate and rank outfits          |
| `GET`  | `/recommendations`                              | Retrieve previous recommendations  |
| `GET`  | `/recommendations/{recommendation_id}`          | Retrieve a specific recommendation |
| `POST` | `/recommendations/{recommendation_id}/feedback` | Submit feedback                    |

Example request:

```
{
  "occasion": "casual",
  "wardrobe_item_ids": [
    "item_001",
    "item_002",
    "item_003"
  ],
  "result_limit": 3
}
```

The optional `wardrobe_item_ids` field lets the user request recommendations from a chosen subset of clothes. If it is omitted, the service can use the entire eligible wardrobe.

Example response:

```
{
  "recommendations": [
    {
      "id": "rec_001",
      "score": 87,
      "items": [
        {
          "id": "item_001",
          "category": "shirt"
        },
        {
          "id": "item_002",
          "category": "trousers"
        },
        {
          "id": "item_003",
          "category": "shoes"
        }
      ],
      "reasons": [
        {
          "factor": "color_compatibility",
          "message": "The selected colors work well together."
        },
        {
          "factor": "occasion_match",
          "message": "The combination is suitable for a casual occasion."
        }
      ]
    }
  ]
}
```

The example score is illustrative. The prototype's scoring function will calculate the actual value. We should not present the score as a probability or a scientifically validated measure of attractiveness.

## E. Feedback

Example request to:

`POST /recommendations/rec_001/feedback`

```
{
  "feedback_type": "like",
  "reason": "matches_my_style"
}
```

Initially, feedback types can include `like`, `dislike` and `skip`. Recording `worn` should be a separate action if we later need to distinguish an outfit the user liked from one they actually wore.

Feedback is crucial because it creates the first source of Veyra-specific preference data.

## API conventions

Use these rules consistently:

- Validate request bodies and return clear `400` responses for invalid inputs.
- Return `404` for unknown resources.
- Use `401` for unauthenticated access and `403` for unauthorized access once authentication exists.
- Use `500` for unexpected server errors, without exposing stack traces to clients.
- Keep response shapes consistent.
- Do not trust a user ID supplied by the client to authorize access to someone else's wardrobe.
- Keep model inference behind a service interface so the model can change without changing the public API.

# 7. Database design

For the prototype, data can be hardcoded or stored in SQLite. The MVP should move to PostgreSQL once the core workflow has been proven.

The following is a proposed logical schema, not a requirement to create every table on day one.

\#chatgpt-mermaid-\_r_1g8\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_1g8\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_1g8\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_1g8\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_1g8\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1g8\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_1g8\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_1g8\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_1g8\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_1g8\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_1g8\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_1g8\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_1g8\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_1g8\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_1g8\_ p{margin:0;}#chatgpt-mermaid-\_r_1g8\_ .entityBox{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_1g8\_ .relationshipLabelBox{fill:rgb(243, 243, 243);opacity:0.7;background-color:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_1g8\_ .relationshipLabelBox rect{opacity:0.5;}#chatgpt-mermaid-\_r_1g8\_ .labelBkg{background-color:rgba(243, 243, 243, 0.5);}#chatgpt-mermaid-\_r_1g8\_ .edgeLabel{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_1g8\_ .edgeLabel .label rect{fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_1g8\_ .edgeLabel .label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1g8\_ .edgeLabel .label{fill:rgb(83, 154, 248);font-size:14px;}#chatgpt-mermaid-\_r_1g8\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_1g8\_ .edge-pattern-dashed{stroke-dasharray:8,8;}#chatgpt-mermaid-\_r_1g8\_ .node rect,#chatgpt-mermaid-\_r_1g8\_ .node circle,#chatgpt-mermaid-\_r_1g8\_ .node ellipse,#chatgpt-mermaid-\_r_1g8\_ .node polygon{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_1g8\_ .relationshipLine{stroke:rgb(143, 143, 143);stroke-width:1px;fill:none;}#chatgpt-mermaid-\_r_1g8\_ .marker{fill:none!important;stroke:rgb(143, 143, 143)!important;stroke-width:1;}#chatgpt-mermaid-\_r_1g8\_ [data-look=neo].labelBkg{background-color:rgba(243, 243, 243, 0.5);}#chatgpt-mermaid-\_r_1g8\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_1g8\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_1g8\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_1g8\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_1g8\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1g8\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_1g8\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_1g8\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_1g8\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1g8\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_1g8\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_1g8\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1g8\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_1g8\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_1g8\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1g8\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_1g8\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1g8\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}USERSuuididPKstringemailstringpassword_hashdatetimecreated_atSTYLE_PROFILESuuididPKuuiduser_idFKjsonpreferencesWARDROBE_ITEMSuuididPKuuiduser_idFKstringcategorystringcolorstringpatternstringfitintformalitystringimage_urlRECOMMENDATIONSuuididPKuuiduser_idFKstringoccasionfloatscoredatetimecreated_atRECOMMENDATION_ITEMSuuidrecommendation_idFKuuidwardrobe_item_idFKFEEDBACKuuididPKuuiduser_idFKuuidrecommendation_idFKstringfeedback_typehasownsreceivescontainsselected_insubmitsreceives

## Database principles

1. Each wardrobe item belongs to one user.
2. A recommendation records which clothing items were selected.
3. Feedback links to a recommendation so we can evaluate what users prefer.
4. Store structured attributes where they are useful for filtering and scoring.
5. Use database migrations when schemas become persistent.
6. Store image files in file/object storage rather than inserting large raw image blobs into PostgreSQL.
7. Store only the user data required to operate the product, with appropriate access controls and deletion support.

The initial prototype may use only a wardrobe data structure and a recommendation function. We should not spend days designing a perfect schema before the first outfit can be generated.

# 8. The recommendation engine — Veyra's heart

This is the first module I would build and test independently.

A recommendation engine must answer four questions:

1. Which combinations can be formed from the available clothes?
2. Which combinations fit the selected occasion?
3. Which combinations match the user's preferences?
4. Why did the engine rank one outfit above another?

## Step 1: Normalize clothing attributes

A clothing item should have consistent attributes.

```
{
  "id": "item_001",
  "category": "shirt",
  "color": "white",
  "pattern": "solid",
  "fit": "regular",
  "formality": 3,
  "style_tags": ["minimal", "casual"]
}
```

We should define allowed category and attribute values rather than letting every user or model invent new spellings.

## Step 2: Generate candidate outfits

For a simple prototype, define a supported outfit template:

```
Top + Bottom + Footwear
```

Later, we can support additional templates for dresses, outerwear, accessories and different use cases.

The candidate generator combines eligible wardrobe items. It must reject impossible combinations, such as two alternative pairs of shoes being treated as one footwear choice.

## Step 3: Score the candidates

An initial scoring formula could be:

\\[ S = 0.30C + 0.25O + 0.20P + 0.15F + 0.10V \\]

Where:

- \\(C\\): color compatibility
- \\(O\\): occasion suitability
- \\(P\\): personal style preference match
- \\(F\\): formality compatibility
- \\(V\\): other user preference matches

Each component is normalized to a scale of 0–100. The weights are initial design choices, not research-validated constants. We should tune them using examples and user feedback.

Example Python implementation:

```
def score_outfit(    color_score,    occasion_score,    style_score,    formality_score,    preference_score,):    scores = [        color_score,        occasion_score,        style_score,        formality_score,        preference_score,    ]    if any(not 0 <= score <= 100 for score in scores):        raise ValueError("All component scores must be between 0 and 100")    return round(        0.30 * color_score        + 0.25 * occasion_score        + 0.20 * style_score        + 0.15 * formality_score        + 0.10 * preference_score,        2,    )
```

This is a starting point, not a complete fashion-scoring algorithm. Each component must have an explicit, testable implementation.

## Step 4: Return the score and evidence together

The engine should return structured reasons with the score:

```
{    "score": 87,    "reasons": [        "Matches the selected occasion",        "Uses preferred neutral colors",        "Fits the user's minimal style"    ]}
```

The reasons should be generated from the actual scoring results. We must not invent an explanation that contradicts the factors used.

## Step 5: Rank and return alternatives

Generate valid candidates, score them, rank them and return the top few unique outfits.

Critical limitation: rule-based compatibility is not learned fashion intelligence. It is a transparent baseline that lets us validate the product and establish evaluation tests before training a model.

# 9. AI/ML architecture and dataset strategy

The long-term vision requires several distinct capabilities. We should not treat them as one giant AI model.

[Clothing Detection Solution - Folio3 AI Clothing Detection System | Folio3 AI](https://images.openai.com/static-rsc-4/z7_uPpH1OZzyJmvBnqrF5d5CaIOqiLuy0LO-MVzlX3cDbKmqX0rhwgTN7S2D-QZFed6iA7xZ9bYSJL52wtpNq9oM98052C3zKrXDQwqOJ_J1_jRzj3cp6HWWO67z5Jx4ZUsOwWEjHL-QTNTFo-R3uBYcWXvrFQw3loag0HoxfQ4?purpose=inline)

Model A — Clothing detection

Detect individual garments in an uploaded image and locate them using bounding boxes or segmentation masks.

Candidate data: DeepFashion2, subject to access and licensing. Output: detected clothing regions.

[Fashionpedia](https://images.openai.com/static-rsc-4/1Ck7FNV78eWcOrJMVjE0SYJEsG1gZlbgLkWUm1mG5PaTyPBaNQ6YYL5kCWNh-s8DmnqF9YtlBx0Yimr_ByZ6zKREmf-k3Qm1PY2qLIVemSdTctvmxIllPN-WWd7Icn5jK8TfKqV4lALtk-R1YNGCLPRpTUZ_utz17g96rYp48MY?purpose=inline)

Model B — Clothing attributes

Identify properties such as category, sleeve type, pattern and garment attributes.

Candidate data: Fashionpedia and DeepFashion2. Output: structured attributes.

[Erkek Tarz Giyim Kombinleri | Klass Kombin](https://images.openai.com/static-rsc-4/3iJWiW2SQ9M96N3HCqapTUxqrBY8Zg8YhKLxhBX0nnMi29Ziy0XUDKUIzhLVlkXoM-7N1KPs0AZCxdhllhtmKCLU-wC_BzSPTo-c7ndpPWMY88fntCy6bA12jDsNPPTlKYXhV9BlaL2oetjrKxzVSubenf3jUSW3AWe4H6PyWPg?purpose=inline)

Model C — Outfit compatibility

Estimate how well items work together as an outfit, rather than just classifying each item independently.

Candidate data: Polyvore outfit datasets. Output: compatibility score or ranking.

[Personalized Style App UI for Modern Shoppers by reloadux on Dribbble](https://images.openai.com/static-rsc-4/CI-qRNqfCoHcXr2iuX_UZ6bOGuTWj1Znev12a9AAhFU1bNvPELtWM--qwSRXc1doDOkiV6XBD0FUgxWu6pRhn23FopWlr27kFiig11wzvtA7foF-sBh0fWUwJKsjwNZvd8TmlfHAH_NJfwQZKGfF2ydSXZ_X1Esq1GzHUjo83Vg?purpose=inline)

Model D — Personalization

Adjust rankings to reflect an individual user's preferences and observed feedback.

Data: Veyra's own consented interactions and feedback, collected over time.

These are four separate problems. A model that detects shirts does not automatically know whether a shirt matches a particular person's style.

## Dataset 1 — DeepFashion2

Official resources: [DeepFashion2 GitHub repository](https://github.com/switchablenorms/DeepFashion2).

Intended use:

- Clothing detection.
- Garment localization.
- Clothing segmentation.
- Category and instance-related attributes.

The dataset has a large image and annotation collection. It may require significant disk space, processing and setup.

Prototype decision: do not download the full dataset. Use manual wardrobe entry first.

## Dataset 2 — Fashionpedia

Official resources: [Fashionpedia dataset and downloads](https://fashionpedia.github.io/home/Fashionpedia_download.html).

Intended use:

- Fashion item detection and segmentation.
- Fine-grained fashion categories.
- Clothing attributes.

It overlaps with DeepFashion2 in some capabilities. We should compare the annotations and the requirements of our chosen pretrained model before deciding whether we need both datasets.

## Dataset 3 — Polyvore Outfits

Resources: [Polyvore dataset repository](https://github.com/xthan/polyvore-dataset).

Intended use:

- Outfit compatibility.
- Outfit completion.
- Candidate ranking.
- Training or evaluating compatibility models.

This is closer to Veyra's core recommendation problem than a dataset containing only individual clothing images.

However, dataset versions differ in size, annotations, image availability and licensing. Before downloading or training, inspect the actual files, documentation, split definitions and permitted uses.

## Dataset 4 — Veyra's own feedback data

This is the most strategically important dataset to develop over time.

A simplified record might be:

```
{
  "recommendation_id": "rec_001",
  "occasion": "casual",
  "selected": true,
  "feedback": "like",
  "reason": "matches_my_style"
}
```

Over time, this could help Veyra learn that a user prefers certain silhouettes, colors or combinations.

Do not start collecting unnecessary personal attributes. Start with product-relevant preferences and transparent feedback.

## What about color detection?

Color detection does not require training a new neural network in the first version.

Use:

```
Image
  ↓
Garment region / mask
  ↓
OpenCV color analysis
  ↓
Dominant color
  ↓
Normalized color label
```

Without a garment mask, background pixels can distort the result. Lighting, shadows and camera white balance also make color classification imperfect.

## What about the LLM?

Do not train an LLM for the prototype.

Use a template-based explanation initially. Later, an LLM can turn verified recommendation factors into natural language.

```
Recommendation engine
       ↓
Score + evidence
       ↓
Optional LLM
       ↓
Readable explanation
```

The LLM should not invent clothing attributes or override hard constraints. It explains the result rather than replacing the recommendation engine.

## The recommended training order

1. Validate rule-based outfit scoring.
2. Evaluate a pretrained compatibility model or a small experiment using Polyvore.
3. Add clothing image understanding when wardrobe entry needs automation.
4. Add feedback-based personalization after meaningful interaction data exists.

We should not train all models simultaneously. Each model needs a defined input, output, evaluation metric and reason to exist.

# 10. Exact proposed repository structure

This is a target structure that allows the prototype to stay small while leaving room for later AI/ML work.

```
veyra/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── StyleProfile.jsx
│   │   │   ├── Wardrobe.jsx
│   │   │   └── Recommendations.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── routes/
│   │   │   ├── health.py
│   │   │   ├── profile.py
│   │   │   ├── wardrobe.py
│   │   │   └── recommendations.py
│   │   ├── services/
│   │   │   ├── profile_service.py
│   │   │   ├── wardrobe_service.py
│   │   │   └── recommendation_service.py
│   │   ├── recommendation/
│   │   │   ├── candidate_generator.py
│   │   │   ├── color_rules.py
│   │   │   ├── occasion_rules.py
│   │   │   └── scorer.py
│   │   ├── models/
│   │   ├── schemas/
│   │   └── config.py
│   ├── tests/
│   ├── requirements.txt
│   └── run.py
│
├── ml/
│   ├── experiments/
│   ├── evaluation/
│   └── training/
│
├── data/
│   ├── sample/
│   ├── raw/
│   └── processed/
│
├── models/
│   └── README.md
│
├── docs/
│   ├── PRODUCT_REQUIREMENTS.md
│   ├── API_CONTRACT.md
│   ├── DATASET_LICENSES.md
│   └── ARCHITECTURE.md
│
├── .gitignore
├── docker-compose.yml
└── README.md
```

You do not need to create every directory immediately. Start with the frontend, backend recommendation module, a sample data file and tests. Add folders when there is code that belongs in them.

## Important repository rules

- Keep raw and processed datasets out of Git.
- Keep model weights out of Git unless a model is deliberately small and permitted to be distributed that way.
- Record the source, version and license of each dataset and pretrained model.
- Keep credentials in environment variables, not source code.
- Pin dependency versions once the environment works.
- Keep a small, reproducible test dataset in the repository.
- Version trained models and record their evaluation results.

A useful initial `.gitignore`:

```
node_modules/
.venv/
venv/
__pycache__/
.env
*.py[cod]

data/raw/
data/processed/
models/*.pt
models/*.pth
models/*.pkl

instance/
*.sqlite
*.db
```

The rules for model files can be refined when we decide which models need to be versioned and how we will store artifacts.

# 11. The step-by-step implementation plan

This is the order I would follow for the rebuild. We should not move to the next milestone just because the code exists; we move when the current milestone works.

## 01

Build the recommendation engine independently

First deliverable

- Define clothing categories and attributes.
- Create 10–20 sample clothing items.
- Define supported outfit templates.
- Generate combinations and score them.
- Return the best outfits with reasons.

Done when: test inputs produce sensible, deterministic outputs, including empty wardrobes and impossible combinations.

## 02

Wrap the engine in Flask

- Implement `GET /api/v1/health`.
- Implement `GET /api/v1/meta`.
- Implement `POST /api/v1/recommendations`.
- Validate request bodies.
- Test all endpoints in Postman.

Done when: a valid API request returns ranked outfits and explanations without relying on the frontend.

## 03

Build the React prototype

- Create the wardrobe form.
- Add an occasion selector.
- Connect React to Flask.
- Display outfit results, scores and explanations.
- Add like/dislike interactions.

Done when: someone can use the application from beginning to end without manually editing files or API responses.

## 04

Add persistence

- Introduce SQLite if needed for the local prototype.
- Move to PostgreSQL for the MVP.
- Save profiles, wardrobe items, recommendations and feedback.
- Add migrations and data validation.

Done when: data remains available after restarting the application, and users cannot access each other's private data.

## 05

Harden and deploy the MVP

- Add authentication and authorization.
- Add automated tests.
- Containerize the working application.
- Configure Gunicorn and environment variables.
- Deploy the frontend, backend and database.
- Add logging, health checks and backups.

Done when: a real user can use the application reliably, and failures can be diagnosed without guessing.

## 06

Introduce AI/ML one capability at a time

- Evaluate a compatibility model.
- Add clothing image recognition.
- Compare model outputs against the rule-based baseline.
- Measure performance and latency.
- Introduce personalization after enough relevant feedback is collected.

Done when: each model measurably improves a defined feature and can be removed or replaced without breaking the rest of Veyra.

# 12. How we prevent a fourth failed attempt

I would enforce five engineering rules from the first day.

Rule 1 — One working vertical slice. Build a complete journey, not ten disconnected features.

Rule 2 — Test each layer independently. Test the recommendation function, API, database and UI before integrating everything.

Rule 3 — No premature infrastructure. No custom model training, microservices, Kubernetes or complex AI pipelines until the product justifies them.

Rule 4 — Define acceptance criteria before coding. Every task needs a clear definition of what working means.

Rule 5 — Keep the system reproducible. Use version control, a documented setup, pinned dependencies, sample data, tests and a known-good version before major changes.

A useful rule for AI-generated code, especially when building through a coding agent, is: never accept a large change without inspecting the files changed and running the relevant tests. Build in small increments so a failed change can be isolated and reversed.

## What success means at each stage

| Stage                 | Proof of success                                                     |
| --------------------- | -------------------------------------------------------------------- |
| Prototype             | A sensible outfit can be generated from sample wardrobe items        |
| Interactive prototype | A user can enter clothes and receive recommendations through the UI  |
| MVP                   | Data persists, users are isolated, and the main workflow is reliable |
| Intelligence V1       | A measured improvement over the baseline recommendation engine       |
| Personalized V2       | Feedback demonstrably improves recommendations for individual users  |

Do not judge the prototype by the number of features. Judge it by whether the central user journey works.

# 13. Storage and model lifecycle

We previously discussed laptop storage, training datasets and deleting datasets after training. Here is the approach I would use for Veyra.

| Resource                         | During development                               | After training                                                 |
| -------------------------------- | ------------------------------------------------ | -------------------------------------------------------------- |
| DeepFashion2 images              | Download only when needed                        | Archive or remove local copy after validation                  |
| Fashionpedia images/annotations  | Use only for relevant tasks                      | Archive or remove if no longer needed                          |
| Polyvore data                    | Keep the required training and evaluation splits | Archive or remove after evaluation and artifact verification   |
| Trained model weights            | Keep the selected checkpoint                     | Keep versioned weights for deployment and rollback             |
| Evaluation metrics/configuration | Save every experiment                            | Retain with the model                                          |
| Veyra user feedback              | Store securely with consent and access controls  | Retain according to the product's privacy and retention policy |

For storage planning, aim for roughly 100 GB of free disk space if you intend to experiment with larger image datasets locally. You can begin the rule-based prototype with much less. RAM and GPU requirements depend on the chosen model and training procedure.

Before deleting a dataset, verify the trained model on held-out data, retain its evaluation results and configuration, and ensure you can reproduce the required workflow. Training data is not normally required for inference, but it is valuable for retraining and debugging.

# 14. What the first prototype should actually contain

Let's make the scope unambiguous.

## Veyra Prototype V0.1

The first build target

0 of 9 tasks complete

0%

Define clothing categories and attribute values

Create a sample wardrobe of 10–20 items

Implement candidate outfit generation

Implement deterministic scoring and explanation

Test the recommendation engine independently

Create Flask health and recommendation endpoints

Create the React wardrobe and occasion screens

Display recommendations, scores and reasons

Test the complete user journey

Copy checklist

The prototype does not need authentication, cloud deployment, an LLM, a trained compatibility model or computer vision to demonstrate the core value. Those can be added when the underlying workflow is proven.

# 15. The final architectural principle

The long-term Veyra architecture should be modular, but the first version should remain small.

```
Veyra
│
├── User & Style Profile
│
├── Digital Wardrobe
│
├── Recommendation Engine
│   ├── Candidate Generation
│   ├── Compatibility Scoring
│   ├── Occasion Rules
│   └── Personalization
│
├── Explanation Layer
│
├── Feedback System
│
└── Future Intelligence
    ├── Clothing Computer Vision
    ├── Learned Compatibility
    ├── Recommendation Models
    └── Optional LLM
```

The first six areas describe the product's functional direction. The future intelligence components should be introduced incrementally, based on evidence that they improve the experience.

## My recommendation before you start coding

Create a clean Veyra repository and begin with the recommendation engine as an isolated Python module. Define its inputs, outputs and test cases first. Then expose it through Flask and connect React.

Do not start by downloading all datasets, training several models or generating the entire application through one large coding-agent prompt.

The guiding principle for this rebuild is:

Veyra must first demonstrate useful, explainable outfit recommendations. It can become more intelligent only after we have a working product to improve.
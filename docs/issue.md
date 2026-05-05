ROLE:
You are a senior frontend engineer specializing in Next.js (App Router), Tailwind CSS, and scalable UI architecture.

TASK:
Refactor and fix specific UI and data-handling issues in an admin + public-facing product comparison web application.

CONTEXT:
- Framework: Next.js (App Router)
- Styling: Tailwind CSS
- Architecture: Component-based (modular, reusable)
- Scope: Admin dashboard + public user pages
- Priority: Clean UI, correct data flow, maintainability, scalability

---

FEATURE 1: selected product compare looks hover or different  (/filter?compare=2%2C3%2C1)

PROBLEM:
- user dont know the product selected and the product that not selected

Goal:
use shadow or design to make it different

FEATURE 2: i want user can compare 3 products with the same product but different sku  (/compare?products=2,3,1)

PROBLEM:
- user didnt compare skus in same product

Goal:
user can compare 3 or more products with the same product but different sku, for example if user click product A then product B, product A with sku A1 then product A with sku A2 then product B with sku B1 


FEATURE 3: images product must be same size  (/compare?products=2,3,1)

PROBLEM:
- different product or sku have different images size

Goal:
- use the same images size for all product or sku
- if the images size is different, it will be cropped to the same size
-  



---

CONSTRAINTS:
- Do NOT rewrite entire pages
- Only modify relevant components/modules
- Keep logic modular and reusable
- Follow Next.js best practices:
  - Server Components where possible
  - Minimal client-side state
- Maintain clean Tailwind usage (no cluttered classNames)

---

EXPECTED OUTPUT:
- Focused code snippets (not full files)
- Clear explanation of what was fixed and why
- Highlight best practices applied
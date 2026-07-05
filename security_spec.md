# Security Specification: Luxury Watch Enterprise ERP

## Data Invariants
1. **Products Invariant**: A Product must always have a valid `sku`, `name`, `category`, and non-negative `stock`, `purchasePrice`, and `sellingPrice`.
2. **Sales Invariant**: A Sale transaction record must contain valid references to a `productId` and have calculated prices satisfying: `totalSelling = sellingPrice * quantity` and `totalCost = purchaseCost * quantity` to prevent cost spoofing.
3. **Expenses Invariant**: Operational expenses must have a positive, bounded `amount` and specify a valid Category and author.
4. **Team Member Invariant**: Staff must have a registered role of either `Owner` or `Admin` and non-negative salary.
5. **Logs Invariant**: System logs must contain an ID, user, action details, and valid temporal timestamps.
6. **Shop settings Invariant**: Shop branding can only be defined in the `branding` document within `shopSettings` to prevent arbitrary configuration corruption.

---

## The "Dirty Dozen" Payloads
These payloads represent malicious attempts to inject poisoned data or bypass business invariants directly from client-side Firestore access.

### 1. Product with Negative Stock
```json
{
  "id": "prod-1",
  "name": "Luxury Rolex",
  "sku": "RLX-101",
  "category": "Watches",
  "stock": -10,
  "purchasePrice": 5000,
  "sellingPrice": 7000
}
```

### 2. Product costing more than its Selling Price (Negative margin risk)
```json
{
  "id": "prod-2",
  "name": "Luxury Rolex",
  "sku": "RLX-102",
  "category": "Watches",
  "stock": 10,
  "purchasePrice": 8000,
  "sellingPrice": 6000
}
```

### 3. Product with Missing Critical Keys (e.g., Name/SKU)
```json
{
  "id": "prod-3",
  "category": "Watches",
  "stock": 50,
  "purchasePrice": 100,
  "sellingPrice": 200
}
```

### 4. Sale with Negative Price
```json
{
  "id": "sale-1",
  "productId": "prod-1",
  "productName": "Rolex Submariner",
  "quantity": 1,
  "sellingPrice": -500,
  "totalSelling": -500,
  "totalCost": 4000,
  "date": "2026-06-21T06:45:00Z",
  "handledBy": "Attacker"
}
```

### 5. Sale with Spoofed Math (Negative Quantity)
```json
{
  "id": "sale-2",
  "productId": "prod-1",
  "productName": "Rolex Submariner",
  "quantity": -2,
  "sellingPrice": 5000,
  "totalSelling": -10000,
  "totalCost": -8000,
  "date": "2026-06-21T06:45:00Z",
  "handledBy": "Attacker"
}
```

### 6. Operational Expense with Giant/Infinity Amount
```json
{
  "id": "exp-1",
  "category": "Rent",
  "title": "Malicious Rent",
  "amount": 999999999999,
  "recordedBy": "Attacker",
  "date": "2026-06-21T06:45:00Z"
}
```

### 7. Staff Member with Bogus/Unlisted Role
```json
{
  "id": "team-1",
  "name": "Intruder",
  "role": "SuperUser",
  "status": "Active",
  "email": "intruder@malicious.com",
  "salary": 5000
}
```

### 8. Staff Member with Negative Salary
```json
{
  "id": "team-2",
  "name": "Malicious",
  "role": "Admin",
  "status": "Active",
  "email": "malicious@malicious.com",
  "salary": -100
}
```

### 9. Log Injection with Massive Size Attack (Resource Exhaustion)
```json
{
  "id": "log-1",
  "user": "A",
  "role": "Admin",
  "action": "Massive Payload Injection",
  "details": "A".repeat(1000000), // Huge detail text
  "timestamp": "2026-06-21T06:45:00Z"
}
```

### 10. Shop Branding with Poisoned Document ID prefix
Document attempted to be saved as `custom-unlisted-id-malicious` instead of the rigid `branding` ID.
```json
{
  "id": "custom-unlisted-id-malicious",
  "nameKm": "Fake Shop",
  "nameEn": "Fake Shop",
  "logoType": "icon",
  "logoIcon": "Watch",
  "logoColor": "rose"
}
```

### 11. Immutability Violation: Attempting to rewrite ID of Product on update
```json
{
  "id": "modified-prod-id",
  "name": "Luxury Rolex",
  "sku": "RLX-101",
  "category": "Watches",
  "stock": 5,
  "purchasePrice": 5000,
  "sellingPrice": 7000
}
```

### 12. Poisoned Path ID attack on Product Creation
Creating a document with a weird ID targeting root references or control characters:
`products/../../configs/appConfig`

---

## The Test Runner (firestore.rules.test.ts)

```typescript
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  doc,
  setDoc,
  getDoc,
  collection,
} from "firebase/firestore";
import * as fs from "fs";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "luxury-watch-erp-test",
    firestore: {
      rules: fs.readFileSync("firestore.rules", "utf8"),
      host: "localhost",
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

test("deny out-of-bounds/malicious payloads", async () => {
  const unauthedDb = testEnv.unauthenticatedContext().firestore();

  // Test 1: Negative stock (should fail)
  await expect(
    setDoc(doc(unauthedDb, "products/prod-1"), {
      id: "prod-1",
      name: "Luxury Rolex",
      sku: "RLX-101",
      category: "Watches",
      stock: -10,
      purchasePrice: 5000,
      sellingPrice: 7000,
      updatedAt: "2026-06-21T06:45:00Z",
      updatedBy: "Attacker"
    })
  ).rejects.toThrow();

  // Test 2: Missing required attributes (should fail)
  await expect(
    setDoc(doc(unauthedDb, "products/prod-2"), {
      id: "prod-2",
      category: "Watches",
      stock: 5,
      purchasePrice: 5000
    })
  ).rejects.toThrow();

  // Test 3: Bypassing Branding single doc requirement (should fail)
  await expect(
    setDoc(doc(unauthedDb, "shopSettings/illegal"), {
      id: "illegal",
      nameKm: "Malicious Shop",
      nameEn: "Malicious Shop",
      logoType: "icon",
      logoIcon: "Watch",
      logoColor: "indigo"
    })
  ).rejects.toThrow();
});

# Print Specifications (인쇄 사양서)

**Document Type**: Production Specification
**Status**: Active
**Last Updated**: 2025-11-30
**Target Audience**: Card Manufacturers, Print Vendors, Quality Assurance, Packaging Teams

---

## 1. Overview

This document defines all specifications for manufacturing, printing, packaging, and shipping the Jujutsu Kaisen Card Battle game in physical format. These specifications ensure consistency across all print runs and meet quality standards for trading card games.

## 2. Card Specifications

### 2.1 Card Dimensions

- **Card Size**: 63.5mm × 88.9mm (2.5" × 3.5")
  - Standard TCG card format (identical to Magic: The Gathering, Pokémon TCG)
  - Allows compatibility with standard card sleeves and binders

- **Card Thickness**: 0.30mm ± 0.02mm
  - Cardstock: 280 GSM (grams per square meter)
  - Provides durability for shuffling and handling
  - Not too thick to cause bending issues

- **Card Cut Tolerance**: ±0.5mm on all edges
  - Ensures clean, consistent edges for sleeving
  - Critical quality metric for tournament play

### 2.2 Card Stock and Finish

**Material**:
- **Type**: Cardboard with plastic coating on both sides
- **Composition**: 100% virgin wood fiber (no recycled content)
- **Weight**: 280 GSM (grams per square meter)
- **Caliper**: 0.28-0.32mm

**Surface Finish**:
- **Front Side**: Gloss finish with protective UV coating
  - Provides vibrant color reproduction
  - Reduces reflections for better gameplay visibility
  - Protects against wear and tear

- **Back Side**: Matte finish with protective coating
  - Standard TCG format (consistent with other major TCGs)
  - White backing (not colored)
  - Allows players to distinguish cards during shuffling

**Foil Treatment (for Rare/Legendary cards)**:
- **Type**: Hot stamp holographic foil (optional for special cards)
- **Coverage**: Full card (if used) or partial (frame only)
- **Finish**: Rainbow holographic (RGB spectrum shift)
- **Durability**: Resists peeling for 5+ years of gameplay

### 2.3 Card Design Template

**Bleeds and Safety Zones**:
```
┌──────────────────────────────────────────┐
│ 2mm Safety Zone (critical content only)  │
│ ┌────────────────────────────────────┐   │
│ │ 3mm Bleed Area (will be cut)       │   │
│ │ ┌──────────────────────────────┐   │   │
│ │ │ ACTUAL CARD CONTENT (63.5×88.9) │   │
│ │ │ (Design artwork here)          │   │
│ │ └──────────────────────────────┘   │   │
│ │ (Bleed to edge) 69.5×94.9mm       │   │
│ └────────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

**Design Guidelines**:
- **Safe Zone**: All critical text and logo must fit within 57.5mm × 82.9mm
- **Bleed Area**: All background artwork extends to edge (69.5mm × 94.9mm)
- **QR Code Position** (if applicable): Bottom right, 10mm × 10mm, white background
- **Card ID Position**: Bottom left corner, 6pt font, white text
- **Set Symbol**: Top right corner, 8mm diameter

### 2.4 Color Standards

**Color Profiles**:
- **Print Profile**: ISO 12647-2:2004 (standard offset printing)
- **Color Space**: CMYK (4-color process)
- **Color Gamut**: 90% Adobe RGB coverage minimum
- **Pantone Reference**: Provided for all solid colors

**Specific Colors**:
| Element | Color | Pantone | CMYK |
|---------|-------|---------|------|
| White Background | | 501 | 0/0/0/0 |
| Black Text | | Black 6 | 100/100/100/100 |
| Gold Accent | | 871 | 0/21/100/0 |
| Red Accent | | 186 | 0/100/95/5 |
| Blue Accent | | 279 | 100/60/0/0 |

**Print Accuracy**:
- Color deviation: ΔE < 2.0 (perceptually undetectable)
- All Pantone colors must match within ±5% ink density

### 2.5 Text Specifications

**Font Standards**:
- **Card Name**: Arial Bold, 12-18pt, centered at top
- **Card Type**: Arial, 9pt, left-aligned below name
- **Cost Display**: Arial Bold, 16pt, top-right corner
- **Rules Text**: Arial, 8pt, justified, dark text on light background
- **Flavor Text**: Arial Italic, 7pt, light text color, bottom of card

**Text Rendering**:
- Minimum font size: 7pt (for readability)
- Line spacing: 1.2× font size
- Anti-aliasing: Enabled for smooth edges
- No dropout text (no text below 5pt that can't be read at arm's length)

## 3. Printing Process

### 3.1 Print Method

**Offset Lithography** (standard for TCG production):
- **Press Type**: 4-color offset press
- **Sheet Size**: 76cm × 106cm (allowing multiple cards per sheet)
- **Cards per Sheet**: 90 cards (9 × 10 grid)
- **Run Length**: Minimum 10,000 sheets (900,000 cards per print run)

**Quality Control During Printing**:
- **Color Proofs**: 5 color proofs per print run (checked against Pantone standards)
- **Registration Check**: Every 500 sheets
- **Substrate Check**: Every 1000 sheets
- **Density Check**: Densitometer readings every 250 sheets

### 3.2 Cutting and Die-Cutting

**Card Cutting**:
- **Guillotine Cutter**: Precision +/-0.5mm tolerance
- **Cut Speed**: 100 cuts per minute
- **Blade Sharpness**: Replaced every 50,000 cuts
- **Quality Check**: Random sampling of 1:1000 cards

**Die-Cutting** (for special shapes, if applicable):
- **Die Press**: Automatically indexed press
- **Pressure**: Calibrated to prevent paper tearing
- **Registration**: Verified with color registration marks

### 3.3 Lamination and Coating

**Protective Coating**:
- **Type**: Aqueous dispersion coating (water-based, eco-friendly)
- **Thickness**: 1-2 microns per side
- **UV Coating**: Applied to gloss side for extra protection
- **Drying**: Heat tunnel at 60-80°C

**Thickness Verification**:
- Micrometer measurements: Every 1000 cards
- Target thickness: 0.28-0.32mm final

## 4. Card Set Composition

### 4.1 Set Contents

**Standard Booster Pack**:
- **Cards per Pack**: 11 cards
- **Distribution**:
  - 9 Common/Uncommon cards
  - 1 Rare or higher card
  - 1 Foil card (random rarity)

- **Pack Weight**: 15-20 grams (prevents weighting detection)

**Set Composition** (200-card set):
| Rarity | Count | Percentage | Pull Rate |
|--------|-------|-----------|-----------|
| Common | 100 | 50% | 7-8 per pack |
| Uncommon | 50 | 25% | 1-2 per pack |
| Rare | 40 | 20% | 1 per pack |
| Legendary | 10 | 5% | 1 per 2-3 packs |

### 4.2 Booster Box Composition

**Box Contents**:
- **Pack Count**: 24 booster packs per box
- **Box Dimensions**: 12.5cm × 9.5cm × 10cm
- **Box Weight**: 400-450 grams (loaded)
- **Sealed Status**: Wrapped in protective film with hologram seal

**Expected Pull Rates** (per 24 packs):
- Common cards: ~180 cards
- Uncommon: ~30 cards
- Rare: ~24 cards
- Legendary: ~8-12 cards

## 5. Packaging Specifications

### 5.1 Booster Pack Design

**Outer Package**:
- **Material**: Kraft paper with glossy finish (eco-friendly)
- **Dimensions**: 9.5cm × 6.5cm × 2.5cm (when loaded)
- **Printing**: Full-color 4-color process printing on front and back
- **Finish**: Gloss coating for durability

**Pack Assembly**:
- **Folding**: Wrapped around card stack with glued spine
- **Seal**: 2cm hologram foil seal with "Authentic JK Card Battle" text
- **Interior Insert**: Printed advertisement or rule summary sheet

**Weight Distribution**:
- Standard packs: ~15-20 grams (prevents weighing)
- Should feel consistent regardless of card rarity
- Random foil card positioning (prevents light and dark pack detection)

### 5.2 Booster Box Design

**Box Construction**:
- **Material**: Corrugated cardboard (C-flute)
- **Dimensions**: 12.5cm × 9.5cm × 10cm (internal)
- **Printing**: Full-color 4-color on all faces
- **Die-Cut**: Auto-opening flap design for easy access

**Box Graphics**:
- **Front**: Large card artwork (featured card from set)
- **Back**: Set information, expansion symbol, edition number
- **Sides**: Set name and logo
- **Bottom**: Product code (UPC), barcode, manufacturer info

**Interior Assembly**:
- **Dividers**: Cardboard dividers separate packs into 3 columns
- **Insert**: Rules sheet and set checklist
- **Desiccant**: Silica packet to prevent moisture
- **Weight**: 24 booster packs = ~360-400 grams total

### 5.3 Display Box (for Retailers)

**Box Composition**:
- **Contents**: 12 booster boxes (288 booster packs total)
- **Dimensions**: 36cm × 20cm × 32cm
- **Printing**: Full-color with large card artwork
- **Access**: Top open design for retail display

**Retail Display Features**:
- **Preprint**: Price guide card on exterior ($120 USD suggested retail)
- **Tear Strips**: Easy tear strips for individual pack access
- **Branding**: Prominent JK Card Battle branding and set logo
- **Warning Labels**: Age recommendation (14+), choking hazard label

## 6. Manufacturing Timeline

### 6.1 Pre-Production (Months 1-2)

**Week 1-2**: Design Approval
- Final card artwork approval
- Color profile creation
- Die-cutting dies manufactured

**Week 3-4**: Printing Plate Creation
- Separate CMYK plates created
- Color proofs generated
- Density standards established

**Week 5-8**: Paper/Cardstock Sourcing
- 50+ metric tons of cardstock ordered
- Supplier quality verification
- Stock arrival and QC inspection

### 6.2 Production (Months 2-3)

**Week 1-4**: Card Printing
- 10,000+ sheets printed (900,000+ cards)
- 5 color proofs per batch
- Continuous quality monitoring

**Week 5-6**: Cutting and Lamination
- Die-cutting of all cards
- Protective coating application
- Drying and quality inspection

**Week 7-8**: Collation and Sorting
- Random booster pack assembly
- Quality spot-checks
- Statistical sampling (1:1000)

### 6.3 Packaging (Month 3)

**Week 1-2**: Booster Pack Assembly
- Cards inserted into pack sleeves
- Packs sealed with hologram stickers
- ~48,000 packs per week

**Week 3-4**: Box Assembly and Shipping
- Packs boxed (24 per booster box)
- Display boxes assembled (12 per display box)
- QC inspection before shipment

## 7. Quality Assurance

### 7.1 Inspection Points

| Stage | Inspection | Frequency | Reject Criteria |
|-------|-----------|-----------|-----------------|
| Raw Cardstock | GSM, thickness, finish | Every delivery | >±2mm thickness |
| After Printing | Color density, registration | Every 250 sheets | ΔE > 2.0 color |
| After Cutting | Edge quality, dimensions | Every 1000 cards | >±1mm deviation |
| After Lamination | Coating uniformity | Every 500 cards | Bubbles or streaks |
| Booster Packs | Weight, seal integrity | Random 1:100 | >±3 grams weight |
| Booster Boxes | Pack count, sealing | Random 1:50 | <24 packs or broken seal |

### 7.2 Sampling Plan

**Acceptance Sampling** (AQL = 1.0):
- **Lot Size**: 900,000 cards (per print run)
- **Sample Size**: 200 cards
- **Acceptance Number**: 4 defects maximum
- **Rejection Number**: 5+ defects (entire lot rejected)

**Defect Categories**:
- **Critical**: Illegible text, wrong cardstock, color >ΔE 3.0
- **Major**: Misalignment >1mm, visible bubbles, torn edges
- **Minor**: Print smudges, slight color variation, minor scratches

## 8. Sustainability and Environmental Standards

### 8.1 Material Selection

**Eco-Friendly Components**:
- **Cardstock**: 100% virgin fiber (strong) OR 30% recycled content
- **Coating**: Water-based aqueous (not solvent-based)
- **Inks**: Vegetable-based or soy-based (CMYK standard)
- **Packaging**: 100% recyclable cardboard (no plastic except seal)

**Certifications**:
- **FSC Certified**: Paper sourced from responsibly managed forests
- **PEFC Certified**: Chain of custody verified
- **Eco-Label**: Qualified for EU environmental label

### 8.2 Waste Reduction

**Recycling Program**:
- Manufacturing waste: Sent to paper recycler
- Old cards: Trade-in program for credit toward new sets
- Packaging: Designed for standard recycling streams

**Carbon Footprint**:
- Target: <2kg CO2 per 1000 cards (through local production)
- Shipping: Ocean freight (lower emissions) vs. air freight

## 9. Distribution and Logistics

### 9.1 Shipping Standards

**Booster Box Shipping**:
- **Case Quantity**: 12 booster boxes per display case
- **Cases per Pallet**: 20 cases (240 booster boxes)
- **Total Weight per Pallet**: ~180kg
- **Dimensions per Pallet**: 100cm × 120cm × 150cm

**Shipping Container**:
- **Type**: 20ft container (full load)
- **Capacity**: 100 pallets (24,000 booster boxes)
- **Transit Time**: 2-4 weeks (ocean) or 1-2 weeks (air)

### 9.2 Storage and Handling

**Storage Conditions**:
- **Temperature**: 15-25°C (ideal 20°C)
- **Humidity**: 40-60% (ideal 50%)
- **Light**: Protected from direct sunlight
- **Duration**: Up to 6 months without degradation

**Handling Requirements**:
- Pallets stacked maximum 3 high
- Forklift handling (avoid dropping)
- Sealed packaging to prevent moisture infiltration

## 10. Grading and Authentication

### 10.1 Card Grading Scale

**Professional Grading** (optional, for premium/collectible cards):
- **Gem Mint (10)**: Perfect or near-perfect
- **Mint (9)**: No visible wear, slight imperfections under close inspection
- **Near Mint (8)**: Very light wear visible only under inspection
- **Excellent Mint (7)**: Light handling wear
- **Excellent (6)**: Visible wear but well-centered
- **Very Good (5)**: Significant handling wear
- **Good (4)**: Heavy wear
- **Fair (3)**: Major visible damage
- **Poor (2)**: Heavily damaged
- **Very Poor (1)**: Severely damaged but still recognizable

### 10.2 Authenticity Protection

**Anti-Counterfeiting Measures**:

1. **Hologram Seal**:
   - Sequential numbering on each seal
   - Color-shifting hologram with JK logo
   - Tamper-evident (cannot be removed and reapplied)

2. **Card Microprinting**:
   - Hidden text on card (only visible with 10× magnification)
   - "JUJUTSU KAISEN" repeated at card edges
   - Position: Along card border (1mm height)

3. **Card Stock Composition**:
   - Specific 280 GSM cardstock (not available to counterfeits)
   - Unique coating formula
   - Color profile variations difficult to replicate

4. **QR Code** (if included):
   - Links to official card database for verification
   - Unique code per card
   - Scans to verify rarity and edition

## 11. Compliance and Regulations

### 11.1 Safety Standards

**Choking Hazard Warnings**:
- Label for products not suitable for children <3 years
- Warning: "Contains small parts. Not for children under 3 years"
- Placement: Visible on package front and back

**Material Safety**:
- **Testing**: Tested to EN71-3 (safety of toys)
- **Heavy Metals**: <100 ppm (parts per million) for all metals
- **Chemicals**: SVOC and VOC compliance

### 11.2 Regulatory Compliance

**Regional Requirements**:
- **North America**: Complies with CPSC (Consumer Product Safety Commission)
- **Europe**: CE marking for product safety
- **Asia**: Complies with local toy safety standards

**Labeling Requirements**:
- Age recommendation: 14+
- Manufacturer: Japanese brand/distributor
- Product warnings (choking hazard)
- Instructions in local languages

## 12. Supplier Management

### 12.1 Printer Selection Criteria

**Evaluation Criteria**:
- **Experience**: 5+ years manufacturing TCG cards
- **Certifications**: ISO 9001:2015 quality management
- **Equipment**: Modern 4-color offset presses
- **Capacity**: Minimum 1M cards/month
- **References**: At least 3 major TCG references

**Preferred Suppliers**:
- **Primary**: Cartamundi (Belgium) - Major TCG manufacturer
- **Secondary**: JinJing Packaging (China) - Cost-effective option
- **Tertiary**: Cartridge World (USA) - Local backup

### 12.2 Quality Agreements

**Service Level Agreement (SLA)**:
- Color accuracy: ΔE < 2.0
- Cut tolerance: ±0.5mm
- On-time delivery: 95% of shipments
- Defect rate: <0.5% critical defects
- Penalties: Rebates for missed targets

## 13. Cost Analysis

### 13.1 Per-Unit Manufacturing Costs

| Component | Cost (USD) |
|-----------|-----------|
| Cardstock & Coating | $0.015 |
| Printing (4-color) | $0.012 |
| Cutting & Lamination | $0.008 |
| Foil (rare cards, 5%) | $0.002 |
| Booster Pack Sleeve | $0.02 |
| Booster Box | $0.15 |
| **Total per Card** | **$0.067** |

### 13.2 Set Economics

**Per Booster Pack** ($4 MSRP):
- Manufacturing: $0.74 (11 cards × $0.067)
- Distribution: $0.30
- Marketing: $0.50
- Retailer margin: $1.50
- Publisher margin: $0.96

**Per Booster Box** ($120 MSRP):
- Manufacturing: ~$17.80
- Distribution: $6.00
- Marketing: $6.00
- Retailer margin: $45.00
- Publisher margin: $45.20

---

**Related Documents**:
- SDD 06: Art Direction
- DESIGN: Master Data Spec

**Next Steps**:
1. Select manufacturing partner
2. Create detailed design templates
3. Produce color proofs
4. Test production run (1000 cards)
5. Approve and begin full production

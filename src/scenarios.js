const SCENARIOS = [

// == RETAIL (8 original + 1 new) ==========================================
  { id:"RET-01", name:"Inventory Accuracy — Cycle Count Labor",
    theme:"Labor & Human Capacity", verticalKey:"retail",
    facilityKeys:["Store / Branch"], techKeys:["RFID Core","Handheld RFID","Fixed RFID Infrastructure"],
    themeKeys:["Labor & Human Capacity"], evidence:"Strong", annualBenefit:312000, rampType:"hard_labor",
    oneLiner:"Cut cycle-count labor 75–90% — from 3 min/item to 12 sec with handheld RFID",
    evidenceIds:["EV-RET-LABOR-01","EV-RET-ACC-01"],
    challenge:"When the customer questions headcount reduction: these are hours recovered and redirected to growth or higher-value tasks — not necessarily elimination. Finance counts schedulable labor hours at 100% credit.",
    discoveryQuestions:["How many SKU-location combinations exist across all stores?","How often is each location counted per year?","What is your fully-loaded hourly rate for store associates?"],
    inputs:{
      total_sku_locations:{label:"Total SKU Locations",unit:"count",value:50000,hint:"GS1: typical apparel store 20K–80K"},
      hours_per_sku_manual:{label:"Manual Count Time/SKU (hrs)",unit:"hrs",value:0.05,hint:"GS1: 2–5 min; use 3 min = 0.05 hr"},
      hours_per_sku_rfid:{label:"RFID Count Time/SKU (hrs)",unit:"hrs",value:0.0033,hint:"GS1/Auburn: 10–15 sec; use 12 sec"},
      loaded_rate:{label:"Loaded Labor Rate ($/hr)",unit:"$/hr",value:24,hint:"BLS retail median + 30% burden"},
      annual_count_cycles:{label:"Annual Count Cycles",unit:"count",value:12,hint:"Monthly=12; Weekly=52"}
    }
  },
  { id:"RET-02", name:"On-Shelf Availability — Stockout Recovery",
    theme:"Revenue / Margin", verticalKey:"retail",
    facilityKeys:["Store / Branch"], techKeys:["RFID Core","Fixed RFID Infrastructure"],
    themeKeys:["Revenue / Margin","Operational Efficiency"], evidence:"Strong", annualBenefit:500000, rampType:"revenue",
    oneLiner:"Recover 50% of stockout losses through RFID-triggered automated replenishment alerts",
    evidenceIds:["EV-RET-OSA-01"],
    challenge:"When revenue uplift is questioned: ECR benchmarks a 5% out-of-stock rate globally. We use the customer's own gross margin — the only variable we ask them to confirm is their current OOS frequency.",
    discoveryQuestions:["What % of sales do you estimate you lose to out-of-stocks?","What is your average gross margin across categories?","Do you have any item-level OOS data from your planning system?"],
    inputs:{
      annual_store_revenue:{label:"Annual Revenue in Scope ($)",unit:"$",value:5000000,hint:"Total revenue for sites in scope — apparel avg $3M–$10M per store"},
      out_of_stock_baseline_pct:{label:"OOS Baseline (% of sales)",unit:"%",value:0.05,hint:"ECR: 4–8%; use 5% conservative"},
      osa_improvement_pct:{label:"OSA Improvement from RFID",unit:"%",value:0.50,hint:"ECR/GS1: 50–80%; use 50%"},
      gross_margin_pct:{label:"Gross Margin %",unit:"%",value:0.40,hint:"Apparel: 40–60%; use 40%"}
    }
  },
  { id:"RET-03", name:"Shrink Reduction — Loss Prevention",
    theme:"Direct Cost & Spend", verticalKey:"retail",
    facilityKeys:["Store / Branch"], techKeys:["RFID Core","Fixed RFID Infrastructure"],
    themeKeys:["Direct Cost & Spend"], evidence:"Strong", annualBenefit:350000, rampType:"hard_cost",
    oneLiner:"Item-level visibility deters internal theft and sharpens LP exception reporting — 20–40% shrink reduction",
    evidenceIds:["EV-RET-SHRINK-01"],
    challenge:"When shrink attribution is challenged: NRF documents 1.4% average. The customer's actual shrink rate is already a line item in their P&L — we use their own number, not a benchmark.",
    discoveryQuestions:["What is your current annual shrink rate as % of revenue?","Which product categories carry the highest shrink exposure?","Does your LP team currently use exception-based reporting?"],
    inputs:{
      annual_store_revenue:{label:"Annual Revenue in Scope ($)",unit:"$",value:5000000,hint:"Total revenue for sites in scope — NRF 2023: avg retail store $3M–$10M"},
      shrink_pct_baseline:{label:"Shrink Baseline (% of revenue)",unit:"%",value:0.014,hint:"NRF 2023: 1.4–1.6% avg; use 1.4%"},
      shrink_reduction_pct:{label:"Shrink Reduction from RFID",unit:"%",value:0.20,hint:"NRF 2023: 20–40%; use 20%"}
    }
  },
  { id:"RET-04", name:"Markdown Reduction — Better Sell-Through",
    theme:"Revenue / Margin", verticalKey:"retail",
    facilityKeys:["Store / Branch"], techKeys:["RFID Core"],
    themeKeys:["Revenue / Margin","Operational Efficiency"], evidence:"Medium-Strong", annualBenefit:150000, rampType:"revenue",
    oneLiner:"Accurate inventory eliminates phantom overstock — 10% markdown reduction in apparel",
    evidenceIds:["EV-RET-MARKDOWN-01"],
    challenge:"When markdown savings are seen as aspirational: Accenture tracked this across 8 retailers. We model only 10% — their study showed up to 20%. Size and color accuracy is the mechanism, not demand forecasting.",
    discoveryQuestions:["What is your total annual markdown spend?","What fraction of markdowns are size/color-driven vs. seasonal?","Do you currently track phantom vs. actual inventory gaps?"],
    inputs:{
      annual_markdown_spend:{label:"Annual Markdown Spend ($)",unit:"$",value:750000,hint:"Typical apparel: 10–20% of revenue"},
      markdown_reduction_pct:{label:"Markdown Reduction from RFID",unit:"%",value:0.10,hint:"Accenture 2022: 10–20%; use 10%"},
      gm_recovery_pct:{label:"GM Recovery per Avoided Markdown",unit:"%",value:0.20,hint:"Accenture: 15–25 pts; use 20%"}
    }
  },
  { id:"RET-05", name:"Receiving Accuracy & Vendor Compliance",
    theme:"Labor & Human Capacity", verticalKey:"retail",
    facilityKeys:["Store / Branch","Warehouse / DC"], techKeys:["RFID Core","Fixed RFID Infrastructure"],
    themeKeys:["Labor & Human Capacity"], evidence:"Medium-Strong", annualBenefit:96000, rampType:"hard_labor",
    oneLiner:"Inbound accuracy 85% → 99%+ — eliminate manual scan-each and cut receiving labor 40%",
    evidenceIds:["EV-RET-RECV-01"],
    challenge:"When receiving labor seems minor: this is hard labor hours at a real rate, plus vendor chargeback avoidance which is a direct P&L line. Both are independently verifiable from AP records.",
    discoveryQuestions:["How many hours per year does your team spend on inbound receiving verification?","How many vendor disputes or chargebacks do you process annually?","What does it cost in labor and admin to resolve one vendor dispute?"],
    inputs:{
      annual_receiving_labor_hours:{label:"Annual Receiving Labor Hours",unit:"hrs",value:8000,hint:"~5 hrs/event × 4 events/wk × 52 wks"},
      labor_reduction_pct:{label:"Receiving Labor Reduction",unit:"%",value:0.40,hint:"GS1 US: 40–60%; use 40%"},
      loaded_rate:{label:"Loaded Labor Rate ($/hr)",unit:"$/hr",value:24,hint:"BLS retail median + 30%"},
      annual_vendor_disputes:{label:"Annual Vendor Disputes",unit:"count",value:120,hint:"Estimate from AP team"},
      avg_dispute_resolution_cost:{label:"Avg Dispute Resolution Cost ($)",unit:"$",value:250,hint:"$200–500 per case"}
    }
  },
  { id:"RET-06", name:"Associate Productivity — Recovered Hours",
    theme:"Labor & Human Capacity", verticalKey:"retail",
    facilityKeys:["Store / Branch"], techKeys:["RFID Core","Handheld RFID"],
    themeKeys:["Labor & Human Capacity"], evidence:"Medium-Strong", annualBenefit:187200, rampType:"soft",
    oneLiner:"Recover 2–5 hrs/week per associate — redirect from inventory search to customer-facing work",
    evidenceIds:["EV-RET-LABOR-01"],
    challenge:"When soft productivity savings are questioned: these hours are real but not automatically cashable. Position as capacity to absorb growth or improve NPS without adding headcount — not a direct cost reduction.",
    discoveryQuestions:["How many hours per week do associates spend on inventory tasks (counting, searching, resolving discrepancies)?","Is associate time currently the constraint on floor coverage or customer service?","How many associates per store are regularly involved in inventory work?"],
    inputs:{
      num_stores:{label:"Sites / Locations in Scope",unit:"count",value:50,hint:"From engagement setup — Step 1"},
      associates_per_store:{label:"Associates Affected per Store",unit:"count",value:3,hint:"Conservative: 3 of typical 8–12"},
      hours_recovered_per_week:{label:"Hours Recovered per Associate/Week",unit:"hrs",value:2,hint:"GS1 lower bound: 2 hrs/wk"},
      weeks_per_year:{label:"Working Weeks per Year",unit:"count",value:50,hint:"Standard 50-week retail year"},
      loaded_rate:{label:"Loaded Labor Rate ($/hr)",unit:"$/hr",value:24,hint:"BLS retail median + 30%"}
    }
  },
  { id:"RET-07", name:"Omnichannel Fulfillment — BOPIS Accuracy",
    theme:"Revenue / Margin", verticalKey:"retail",
    facilityKeys:["Store / Branch"], techKeys:["RFID Core","Fixed RFID Infrastructure"],
    themeKeys:["Revenue / Margin","Operational Efficiency"], evidence:"Strong", annualBenefit:162000, rampType:"working_cap",
    oneLiner:"Reduce BOPIS cancellations 60% and improve pick accuracy to 99%+ — protect omnichannel margin",
    evidenceIds:["EV-RET-ACC-01","EV-RET-OSA-01"],
    challenge:"When omnichannel performance is seen as a systems issue: the root cause of order cancellation is inventory inaccuracy. RFID is the data layer that fixes the signal your OMS relies on — not an OMS replacement.",
    discoveryQuestions:["What % of BOPIS or ship-from-store orders are cancelled due to item unavailability?","What is your average omnichannel order value?","Do you track NPS or LTV impact from order cancellations?"],
    inputs:{
      annual_omni_orders:{label:"Annual Omnichannel Orders",unit:"count",value:180000,hint:"BOPIS + ship-from-store combined"},
      cancellation_rate_baseline:{label:"Cancellation Rate Baseline",unit:"%",value:0.09,hint:"Customer-specific: confirm from OMS data"},
      cancellation_reduction_pct:{label:"Cancellation Reduction from RFID",unit:"%",value:0.60,hint:"Conservative: 60%"},
      avg_order_value:{label:"Avg Order Value ($)",unit:"$",value:75,hint:"Retailer to confirm"},
      gm_pct:{label:"Gross Margin %",unit:"%",value:0.40,hint:"Apparel: 40% conservative"}
    }
  },
  { id:"RET-08", name:"Safety Stock Reduction — Carrying Cost",
    theme:"Working Capital", verticalKey:"retail",
    facilityKeys:["Store / Branch","Warehouse / DC"], techKeys:["RFID Core"],
    themeKeys:["Working Capital","Operational Efficiency"], evidence:"Medium-Strong", annualBenefit:100000, rampType:"working_cap",
    oneLiner:"5–15% safety stock reduction without stockout risk — enabled by perpetual accurate inventory",
    evidenceIds:["EV-RET-ACC-01"],
    challenge:"When inventory reduction risks service levels: RFID accuracy is precisely why you can carry less — you always know exactly what is available. The reduction is driven by data confidence, not optimism.",
    discoveryQuestions:["What is your average total inventory value across sites in scope?","Do you calculate your inventory carrying cost rate?","Has your planning team previously attempted safety stock optimization?"],
    inputs:{
      total_inventory_value:{label:"Total Inventory Value ($)",unit:"$",value:10000000,hint:"Across all sites in scope"},
      safety_stock_reduction_pct:{label:"Safety Stock Reduction %",unit:"%",value:0.05,hint:"Conservative: 5%"},
      carrying_cost_pct:{label:"Annual Carrying Cost Rate",unit:"%",value:0.20,hint:"Financing + insurance + obsolescence: 20%"}
    }
  },
  // WAREHOUSE
  { id:"WH-01", name:"Cycle Count Labor — Perpetual DC Accuracy",
    theme:"Labor & Human Capacity", verticalKey:"warehouse",
    facilityKeys:["Warehouse / DC"], techKeys:["RFID Core","Fixed RFID Infrastructure"],
    themeKeys:["Labor & Human Capacity"], evidence:"Strong", annualBenefit:480000, rampType:"hard_labor",
    oneLiner:"DC cycle-count labor down 75–85% — 3 min/position to 20 sec per pallet position",
    evidenceIds:["EV-WH-LABOR-01"],
    challenge:"When headcount reduction is the objection: hours recovered from manual counting redeploy to value-add tasks or absorb volume growth without additional FTE. Finance counts schedulable hours at 100%.",
    discoveryQuestions:["How many pallet positions are in scope?","How many times per year is each position counted?","What is your loaded DC labor rate?"],
    inputs:{
      total_pallet_positions:{label:"Total Pallet Positions",unit:"count",value:25000,hint:"DC positions in scope"},
      count_cycles_per_year:{label:"Count Cycles per Year",unit:"count",value:12,hint:"Monthly=12; Weekly=52"},
      time_per_position_manual_min:{label:"Manual Count Time/Position (min)",unit:"count",value:3,hint:"Zebra lower bound: 3 min"},
      time_per_position_rfid_sec:{label:"RFID Count Time/Position (sec)",unit:"count",value:20,hint:"Zebra: 15–25 sec; use 20"},
      loaded_rate:{label:"Loaded Labor Rate ($/hr)",unit:"$/hr",value:24,hint:"DC warehouse rate"}
    }
  },
  { id:"WH-02", name:"Receiving Throughput & Dock-to-Stock",
    theme:"Labor & Human Capacity", verticalKey:"warehouse",
    facilityKeys:["Warehouse / DC"], techKeys:["RFID Core","Fixed RFID Infrastructure"],
    themeKeys:["Labor & Human Capacity","Operational Efficiency"], evidence:"Strong", annualBenefit:210000, rampType:"hard_labor",
    oneLiner:"Inbound throughput up 30–50% — eliminate manual scan-each confirmation at dock doors",
    evidenceIds:["EV-WH-RECV-01"],
    challenge:"When receiving speed is dismissed: dock-to-stock time directly affects same-day SLA compliance. Missed SLAs convert directly to chargeback exposure — a verifiable P&L line.",
    discoveryQuestions:["How many inbound pallets do you process per year?","What is your current dock-to-stock cycle time?","How many dock doors are in scope?"],
    inputs:{
      annual_inbound_pallets:{label:"Annual Inbound Pallets",unit:"count",value:150000,hint:"Total pallets received per year"},
      hours_per_pallet_manual:{label:"Manual Hours per Pallet",unit:"hrs",value:0.133,hint:"GS1: 8 min = 0.133 hr"},
      hours_per_pallet_rfid:{label:"RFID Hours per Pallet",unit:"hrs",value:0.083,hint:"GS1: 5 min = 0.083 hr"},
      loaded_rate:{label:"Loaded Labor Rate ($/hr)",unit:"$/hr",value:24,hint:"DC warehouse rate"}
    }
  },
  { id:"WH-03", name:"Pick Accuracy & Returns Reduction",
    theme:"Operational Efficiency", verticalKey:"warehouse",
    facilityKeys:["Warehouse / DC"], techKeys:["RFID Core","Handheld RFID"],
    themeKeys:["Operational Efficiency","Direct Cost & Spend"], evidence:"Medium-Strong", annualBenefit:160000, rampType:"hard_cost",
    oneLiner:"Pick errors from 0.5% to under 0.1% — prevent thousands of costly re-picks and returns annually",
    evidenceIds:["EV-WH-PICK-01"],
    challenge:"When per-error costs seem small: at 2M annual orders and 0.5% error rate that is 10,000 errors at $20+ each — compounding with return shipping, customer service, and chargeback exposure.",
    discoveryQuestions:["How many orders do you pick per year?","What is your current documented pick error rate?","What does one pick error cost — re-pick, returns processing, customer service?"],
    inputs:{
      annual_orders_picked:{label:"Annual Orders Picked",unit:"count",value:2000000,hint:"Total pick events per year"},
      error_rate_baseline_pct:{label:"Pick Error Rate Baseline",unit:"%",value:0.005,hint:"Zebra: 0.5–1% manual; use 0.5%"},
      error_reduction_pct:{label:"Error Reduction from RFID",unit:"%",value:0.80,hint:"Conservative: 80% reduction"},
      cost_per_error:{label:"Cost per Pick Error ($)",unit:"$",value:20,hint:"Re-pick labor only — excludes return shipping"}
    }
  },
  // HEALTHCARE
  { id:"HC-01", name:"Equipment Rental Reduction & Asset Utilization",
    theme:"Direct Cost & Spend", verticalKey:"healthcare",
    facilityKeys:["Hospital / Clinic"], techKeys:["RFID Core","RTLS / Location"],
    themeKeys:["Direct Cost & Spend","Labor & Human Capacity"], evidence:"Strong", annualBenefit:325000, rampType:"hard_cost",
    oneLiner:"15–25% equipment rental reduction + 40–70% nursing search time elimination",
    evidenceIds:["EV-HC-ASSET-01"],
    challenge:"When asset tracking is dismissed as a cost-reduction play: GE Healthcare and ECRI documented 15–25% rental reduction. The mechanism is visibility into owned assets sitting idle — not purchasing fewer assets.",
    discoveryQuestions:["What is your annual spend on rental equipment — IV pumps, ventilators, specialty beds?","How many hours per shift do nurses spend searching for mobile equipment?","What is your current utilization rate for high-value mobile assets?"],
    inputs:{
      annual_rental_spend:{label:"Annual Equipment Rental Spend ($)",unit:"$",value:1200000,hint:"IV pumps, vents, specialty equipment"},
      rental_reduction_pct:{label:"Rental Reduction from RFID",unit:"%",value:0.15,hint:"GE/ECRI lower bound: 15%"},
      num_nursing_staff:{label:"Nursing Staff in Scope",unit:"count",value:200,hint:"Staff affected by equipment search"},
      nursing_search_hours_per_shift:{label:"Search Hours/Nurse/Shift",unit:"hrs",value:0.5,hint:"ECRI: 40–70% reduction baseline"},
      shifts_per_year:{label:"Shifts per Year",unit:"count",value:365,hint:"Daily shifts × 365"},
      loaded_nursing_rate:{label:"Loaded Nursing Rate ($/hr)",unit:"$/hr",value:48,hint:"Conservative: $48/hr loaded"}
    }
  },
  { id:"HC-02", name:"Surgical Instrument Tracking — OR Throughput",
    theme:"Operational Efficiency", verticalKey:"healthcare",
    facilityKeys:["Hospital / Clinic"], techKeys:["RFID Core"],
    themeKeys:["Operational Efficiency","Regulatory & Compliance"], evidence:"Strong", annualBenefit:280000, rampType:"hard_cost",
    oneLiner:"25–35% reduction in lost/late instruments — protect OR throughput at $100–180/minute of delay",
    evidenceIds:["EV-HC-SURG-01"],
    challenge:"When OR delays are framed as a clinical management issue: Auburn University and AORN documented 25–35% instrument delay reduction with RFID tracking. The data separates the technology problem from the management problem.",
    discoveryQuestions:["How many surgical cases do you run per year?","What % of cases experience delays due to instrument availability?","What is your fully-loaded OR cost per hour of delay?"],
    inputs:{
      annual_or_cases:{label:"Annual Surgical Cases",unit:"count",value:8000,hint:"Total OR cases per year"},
      instrument_delay_rate_pct:{label:"Cases with Instrument Delays",unit:"%",value:0.05,hint:"5% conservative baseline"},
      delay_reduction_pct:{label:"Delay Reduction from RFID",unit:"%",value:0.25,hint:"Auburn lower bound: 25%"},
      avg_delay_duration_hr:{label:"Avg Delay Duration (hrs)",unit:"hrs",value:0.5,hint:"Conservative: 30 min"},
      or_delay_cost_per_hour:{label:"OR Cost per Hour of Delay ($)",unit:"$",value:6000,hint:"Auburn: $100/min = $6,000/hr conservative"}
    }
  },
  // GOVERNMENT
  { id:"GOV-01", name:"Audit Readiness — Property NFR & CAP Reduction",
    theme:"Regulatory & Compliance", verticalKey:"government",
    facilityKeys:["Government Facility","Depot / MRO"], techKeys:["RFID Core","Fixed RFID Infrastructure"],
    themeKeys:["Regulatory & Compliance"], evidence:"Strong", annualBenefit:1200000, rampType:"hard_cost",
    oneLiner:"7 consecutive audit disclaimers. RFID closes the asset existence-and-completeness gap — NDAA 2028 mandate.",
    evidenceIds:["EV-FED-AUDIT-01"],
    challenge:"When RFID's connection to audit findings is questioned: GAO-25-107427 names asset accountability as the primary driver of DoD's disclaimer opinion. NDAA 2028 mandates a clean opinion — RFID is the data foundation required to get there.",
    discoveryQuestions:["How many property-related NFRs did your command receive in the last audit cycle?","What is your annual audit readiness consulting and remediation spend?","How many FTE-hours per year are dedicated to audit CAP activities?"],
    inputs:{
      annual_nfrs_property_related:{label:"Property-Related NFRs (annual)",unit:"count",value:85,hint:"From last audit cycle"},
      avg_remediation_hours_per_nfr:{label:"Remediation Hours per NFR",unit:"hrs",value:120,hint:"Conservative estimate"},
      loaded_rate:{label:"Loaded Labor Rate ($/hr)",unit:"$/hr",value:75,hint:"Federal civilian / contractor rate"},
      annual_cap_consulting_spend:{label:"Annual CAP Consulting Spend ($)",unit:"$",value:800000,hint:"Audit readiness contractors"},
      nfr_reduction_pct:{label:"NFR Reduction from RFID",unit:"%",value:0.35,hint:"Conservative: 35%"}
    }
  },
  // MANUFACTURING
  { id:"MTL-01", name:"Tool & Asset Loss Reduction",
    theme:"Direct Cost & Spend", verticalKey:"manufacturing",
    facilityKeys:["Plant / Factory","Depot / MRO","Warehouse / DC"], techKeys:["RFID Core"],
    themeKeys:["Direct Cost & Spend","Labor & Human Capacity"], evidence:"Medium-Strong", annualBenefit:220000, rampType:"hard_cost",
    oneLiner:"Manufacturing plants lose 15–20% of tool value annually — RFID cuts that loss 60–80% within the first year",
    evidenceIds:["EV-MTL-TOOL-01"],
    challenge:"When tool loss is accepted as a cost of doing business: Aberdeen Group documented 15–20% annual tool value loss across manufacturing. The first-year ROI on tracking is typically 6–12 months based on replacement cost alone.",
    discoveryQuestions:["What is your total tool and portable asset inventory value?","What is your estimated annual loss or write-off rate for tools?","How much time do technicians spend searching for tools per shift?"],
    inputs:{
      total_tool_value:{label:"Total Tool Inventory Value ($)",unit:"$",value:1500000,hint:"All tracked portable assets"},
      annual_loss_rate:{label:"Annual Loss Rate",unit:"%",value:0.15,hint:"Aberdeen: 15–20%; use 15%"},
      tool_loss_reduction_pct:{label:"Loss Reduction from RFID",unit:"%",value:0.65,hint:"Aberdeen lower bound: 60–80%; use 65%"}
    }
  },
  // CARRIERS
  { id:"CAR-01", name:"Trailer Utilization & Yard Visibility",
    theme:"Operational Efficiency", verticalKey:"carriers",
    facilityKeys:["Terminal / Port","Warehouse / DC"], techKeys:["RFID Core","Fixed RFID Infrastructure"],
    themeKeys:["Operational Efficiency","Revenue / Margin"], evidence:"Medium-Strong", annualBenefit:380000, rampType:"revenue",
    oneLiner:"10–20% trailer utilization improvement — eliminate manual yard checks and convert idle assets into revenue capacity",
    evidenceIds:["EV-TL-ASSET-01"],
    challenge:"When trailer utilization upside is questioned: ATA documents 10–20% improvement. We model 10%. The mechanism is eliminating ghost trailers — assets that appear available but can't be located in the yard.",
    discoveryQuestions:["How many trailers and yard assets are in your fleet?","What % of trailers are typically unavailable due to unknown location or status?","What is your average revenue per trailer per day?"],
    inputs:{
      total_trailers:{label:"Total Trailers in Fleet",unit:"count",value:500,hint:"Trailers and yard assets"},
      utilization_improvement_pct:{label:"Utilization Improvement",unit:"%",value:0.10,hint:"ATA lower bound: 10%"},
      revenue_per_trailer_per_day:{label:"Revenue per Trailer per Day ($)",unit:"$",value:150,hint:"Conservative: $150/day"},
      operating_days:{label:"Operating Days per Year",unit:"count",value:250,hint:"Typical carrier operating calendar"}
    }
  },
  // TRANSPORT & LOGISTICS
  { id:"TL-01", name:"Detention & Dwell Cost Reduction",
    theme:"Direct Cost & Spend", verticalKey:"carriers",
    facilityKeys:["Terminal / Port","Warehouse / DC","Depot / MRO"], techKeys:["RFID Core"],
    themeKeys:["Direct Cost & Spend","Operational Efficiency"], evidence:"Medium-Strong", annualBenefit:290000, rampType:"hard_cost",
    oneLiner:"Carriers experience detention on 20–35% of loads — RFID dock visibility cuts excess dwell 30–50%",
    evidenceIds:["EV-TL-DWELL-01"],
    challenge:"When detention costs seem like a shipper problem: detention directly erodes driver productivity and asset yield. Reducing it improves on-time performance which protects rate and relationship with shipper accounts.",
    discoveryQuestions:["What % of your loads experience detention charges?","What is your average detention rate per hour?","How many hours of excess dwell does a typical detained load accumulate?"],
    inputs:{
      annual_loads:{label:"Annual Loads",unit:"count",value:50000,hint:"Total loads per year"},
      detention_rate_pct:{label:"Detention Rate (% of loads)",unit:"%",value:0.25,hint:"Gartner: 20–35%; use 25%"},
      avg_excess_dwell_hrs:{label:"Avg Excess Dwell (hrs)",unit:"hrs",value:1.5,hint:"Conservative: 1.5 hrs"},
      detention_rate_per_hour:{label:"Detention Rate ($/hr)",unit:"$/hr",value:50,hint:"Gartner: $50–85/hr; use $50"},
      dwell_reduction_pct:{label:"Dwell Reduction from RFID",unit:"%",value:0.30,hint:"Conservative: 30%"}
    }
  },

// == WAREHOUSE (4 new additions) ==========================================
  { id:"WH-04", name:"SLA Compliance — 3PL Chargeback Reduction",
    theme:"Revenue / Margin", verticalKey:"warehouse",
    facilityKeys:["Warehouse / DC"], themeKeys:["Revenue / Margin","Direct Cost & Spend"],
    annualBenefit:210000, rampType:"hard_cost",
    oneLiner:"3PLs average 2–5% SLA miss rate — RFID reduces chargebacks 60–80% through real-time load verification",
    evidenceIds:["EV-WH-LABOR-01"],
    challenge:"Chargebacks are a direct P&L line item — pull from AP or the customer's contract summary to anchor the number.",
    discoveryQuestions:["What % of shipments result in retailer chargebacks?","What is your total annual chargeback expense?","What fraction are due to count/label errors vs. timing?"],
    inputs:{
      annual_contracted_revenue:{label:"Annual Contracted Revenue ($)",unit:"$",value:15000000,hint:"Total 3PL contract value"},
      chargeback_rate_pct:{label:"Chargeback Rate (% of revenue)",unit:"%",value:0.02,hint:"Gartner: 1–3%; use 2%"},
      chargeback_reduction_pct:{label:"Reduction from RFID",unit:"%",value:0.60,hint:"Lower bound: 60%"}
    }
  },
  { id:"WH-05", name:"Safety Stock Reduction — Carrying Cost Savings",
    theme:"Working Capital", verticalKey:"warehouse",
    facilityKeys:["Warehouse / DC"], themeKeys:["Working Capital","Operational Efficiency"],
    annualBenefit:175000, rampType:"working_cap",
    oneLiner:"RFID accuracy enables 10–20% safety stock reduction without increasing stockout risk",
    evidenceIds:["EV-WH-LABOR-01"],
    challenge:"Model as working capital release + annual carrying cost — both are creditable to finance.",
    discoveryQuestions:["What is your total inventory value on hand?","What % do you estimate is safety stock?","What is your carrying cost rate (typically 20–30%)?"],
    inputs:{
      total_inventory_value:{label:"Total Inventory Value ($)",unit:"$",value:8000000,hint:"Average on-hand"},
      safety_stock_pct:{label:"Safety Stock as % of Inventory",unit:"%",value:0.20,hint:"Typical: 15–25%"},
      safety_stock_reduction_pct:{label:"Reduction from RFID",unit:"%",value:0.10,hint:"Conservative: 10%"},
      carrying_cost_rate:{label:"Annual Carrying Cost Rate",unit:"%",value:0.25,hint:"Industry: 20–30%; use 25%"}
    }
  },
  { id:"WH-06", name:"Cross-Dock & Outbound Verification Labor",
    theme:"Labor & Human Capacity", verticalKey:"warehouse",
    facilityKeys:["Warehouse / DC"], themeKeys:["Labor & Human Capacity"],
    annualBenefit:165000, rampType:"hard_labor",
    oneLiner:"Eliminate manual scan-each at outbound — 30–50% dock labor reduction with RFID tunnel/gate reads",
    evidenceIds:["EV-WH-RECV-01"],
    challenge:"This is a pure labor math argument — hours × rate × reduction %. Easy to verify from time-and-motion studies.",
    discoveryQuestions:["How many outbound verification labor hours per year across all docks?","What is your fully-loaded dock labor rate?","What % of outbound errors result in re-work or carrier claims?"],
    inputs:{
      outbound_labor_hours:{label:"Annual Outbound Verification Hours",unit:"hrs",value:10000,hint:"All dock lanes combined"},
      labor_reduction_pct:{label:"Labor Reduction from RFID",unit:"%",value:0.35,hint:"GS1: 30–50%; use 35%"},
      loaded_rate:{label:"Loaded Labor Rate ($/hr)",unit:"$/hr",value:26,hint:"DC rate + 30% burden"}
    }
  },

// == HEALTHCARE (5 new additions) ========================================
  { id:"HC-03", name:"Patient Flow — ED Length of Stay Reduction",
    theme:"Operational Efficiency", verticalKey:"healthcare",
    facilityKeys:["Hospital / Clinic"], themeKeys:["Operational Efficiency","Revenue / Margin"],
    annualBenefit:420000, rampType:"revenue",
    oneLiner:"RTLS bed tracking reduces ED LOS 10–20% — each hour recovered has direct margin and capacity value",
    evidenceIds:["EV-HC-ASSET-01"],
    challenge:"LOS reduction is both a margin and a capacity argument — recovering throughput avoids capital expansion. CFOs respond to both angles.",
    discoveryQuestions:["What is your current average ED length of stay?","What is your annual ED visit volume?","What is your net revenue per ED visit?"],
    inputs:{
      annual_ed_visits:{label:"Annual ED Visits",unit:"count",value:40000,hint:"Total annual volume"},
      avg_los_hrs:{label:"Average ED LOS (hrs)",unit:"hrs",value:4.5,hint:"National avg: 4–5 hrs"},
      los_reduction_pct:{label:"LOS Reduction from RFID",unit:"%",value:0.10,hint:"Conservative: 10%"},
      net_revenue_per_visit:{label:"Net Revenue per ED Visit ($)",unit:"$",value:800,hint:"Varies by payer mix"}
    }
  },
  { id:"HC-04", name:"Medication Tracking — Dispensing Error Reduction",
    theme:"Regulatory & Compliance", verticalKey:"healthcare",
    facilityKeys:["Hospital / Clinic"], themeKeys:["Regulatory & Compliance","Direct Cost & Spend"],
    annualBenefit:280000, rampType:"hard_cost",
    oneLiner:"Medication errors affect 1–3% of admissions — RFID chain-of-custody reduces dispensing errors 20–30%",
    evidenceIds:["EV-HC-ASSET-01"],
    challenge:"Frame as risk cost + labor cost. Each error event carries investigation, reporting, and potential liability cost beyond the medication itself.",
    discoveryQuestions:["How many medication error events are reported annually?","What is your average cost per error event including investigation?","How many hours does pharmacy staff spend on audit prep and reconciliation?"],
    inputs:{
      annual_admissions:{label:"Annual Admissions",unit:"count",value:25000,hint:"Total inpatient admissions"},
      error_rate_pct:{label:"Medication Error Rate",unit:"%",value:0.02,hint:"Conservative: 2% of admissions"},
      avg_cost_per_error:{label:"Avg Cost per Error Event ($)",unit:"$",value:5000,hint:"Includes investigation labor"},
      error_reduction_pct:{label:"Reduction from RFID",unit:"%",value:0.25,hint:"Conservative: 25%"}
    }
  },
  { id:"HC-05", name:"Joint Commission Audit — Compliance Labor Reduction",
    theme:"Regulatory & Compliance", verticalKey:"healthcare",
    facilityKeys:["Hospital / Clinic"], themeKeys:["Regulatory & Compliance","Labor & Human Capacity"],
    annualBenefit:195000, rampType:"hard_labor",
    oneLiner:"Manual Joint Commission prep is 8–15% of clinical support labor — RFID reduces audit prep 40–65%",
    evidenceIds:["EV-HC-ASSET-01"],
    challenge:"This is a pure labor cost recovery with a compliance risk kicker. Anchor to actual hours spent in last audit cycle.",
    discoveryQuestions:["How many FTE-hours were spent on last Joint Commission preparation?","What is your loaded clinical support rate?","How many compliance deficiencies were cited in the last inspection?"],
    inputs:{
      annual_audit_prep_hours:{label:"Annual Audit Prep Hours (FTE)",unit:"hrs",value:4000,hint:"All staff across departments"},
      labor_reduction_pct:{label:"Reduction from RFID",unit:"%",value:0.40,hint:"Conservative: 40%"},
      loaded_rate:{label:"Loaded Clinical Support Rate ($/hr)",unit:"$/hr",value:45,hint:"Clinical support avg"}
    }
  },
  { id:"HC-06", name:"Supply Stockout & Expiry Reduction",
    theme:"Direct Cost & Spend", verticalKey:"healthcare",
    facilityKeys:["Hospital / Clinic"], themeKeys:["Direct Cost & Spend","Working Capital"],
    annualBenefit:160000, rampType:"hard_cost",
    oneLiner:"Supply stockouts at 2–5% of PAR locations weekly — RFID reduces stockouts 20–30% and expired write-offs 15–20%",
    evidenceIds:["EV-HC-ASSET-01"],
    challenge:"Pull from supply chain or materials management — expired write-offs are already a tracked line item.",
    discoveryQuestions:["What is your annual supply expired write-off expense?","How many stockout events per week across all PAR locations?","What is your average cost per stockout event?"],
    inputs:{
      annual_expired_writeoffs:{label:"Annual Expired Write-offs ($)",unit:"$",value:400000,hint:"From supply chain records"},
      expiry_reduction_pct:{label:"Expiry Reduction from RFID",unit:"%",value:0.15,hint:"Conservative: 15%"},
      annual_stockout_cost:{label:"Annual Stockout Cost ($)",unit:"$",value:200000,hint:"Emergency procurement + delay costs"},
      stockout_reduction_pct:{label:"Stockout Reduction from RFID",unit:"%",value:0.20,hint:"Conservative: 20%"}
    }
  },
  { id:"HC-07", name:"Controlled Substance Diversion Prevention",
    theme:"Direct Cost & Spend", verticalKey:"healthcare",
    facilityKeys:["Hospital / Clinic"], themeKeys:["Direct Cost & Spend","Regulatory & Compliance"],
    annualBenefit:230000, rampType:"hard_cost",
    oneLiner:"Controlled substance diversion drives write-offs and DEA investigations — RFID chain-of-custody reduces loss 15–30%",
    evidenceIds:["EV-HC-ASSET-01"],
    challenge:"This is a risk argument as much as a cost argument — DEA investigation costs and potential liability dwarf the medication value.",
    discoveryQuestions:["What is your annual controlled substance write-off or discrepancy volume?","How many DEA or internal investigations were initiated last year?","What is your estimated investigation labor cost per incident?"],
    inputs:{
      annual_cs_writeoffs:{label:"Annual Controlled Substance Write-offs ($)",unit:"$",value:500000,hint:"Pharmacy records"},
      loss_reduction_pct:{label:"Loss Reduction from RFID",unit:"%",value:0.20,hint:"Conservative: 20%"},
      annual_investigation_cost:{label:"Annual Investigation Labor ($)",unit:"$",value:150000,hint:"HR + pharmacy + compliance"}
    }
  },

// == GOVERNMENT (4 new additions) ========================================
  { id:"GOV-02", name:"Annual Physical Inventory Labor Reduction",
    theme:"Labor & Human Capacity", verticalKey:"government",
    facilityKeys:["Government Facility","Depot / MRO"], themeKeys:["Labor & Human Capacity"],
    annualBenefit:480000, rampType:"hard_labor",
    oneLiner:"Federal agencies must certify annual physical inventories by Sep 30 — RFID reduces count time 75–85% vs. manual",
    evidenceIds:["EV-FED-AUDIT-01"],
    challenge:"Annual inventory is mandated — the labor cost is non-discretionary. RFID doesn't eliminate the requirement; it fulfills it at a fraction of the labor cost.",
    discoveryQuestions:["How many accountable property items are tracked?","How many labor hours per year are spent on the annual physical inventory?","What is your loaded rate for property accountability staff?"],
    inputs:{
      total_accountable_items:{label:"Total Accountable Property Items",unit:"count",value:50000,hint:"From APSR system"},
      manual_hours_per_1000:{label:"Manual Hours per 1,000 Items",unit:"hrs",value:40,hint:"Typical: 35–50 hrs/1K"},
      rfid_hours_per_1000:{label:"RFID Hours per 1,000 Items",unit:"hrs",value:6,hint:"RFID: 5–8 hrs/1K"},
      loaded_rate:{label:"Loaded Labor Rate ($/hr)",unit:"$/hr",value:75,hint:"Federal civilian/contractor"}
    }
  },
  { id:"GOV-03", name:"Ghost Asset Elimination — Procurement Avoidance",
    theme:"Operational Efficiency", verticalKey:"government",
    facilityKeys:["Government Facility","Depot / MRO"], themeKeys:["Operational Efficiency","Direct Cost & Spend"],
    annualBenefit:650000, rampType:"hard_cost",
    oneLiner:"Ghost assets and unrecorded inventory cause agencies to procure items they already own — RFID closes the gap",
    evidenceIds:["EV-FED-AUDIT-01"],
    challenge:"Procurement avoidance is a hard dollar save — pull from budget vs. actuals and connect to specific equipment categories.",
    discoveryQuestions:["What % of your property records cannot be physically located?","What was your last capital equipment procurement budget?","How many items were identified as duplicate or redundant in the last reconciliation?"],
    inputs:{
      annual_equipment_budget:{label:"Annual Capital Equipment Budget ($)",unit:"$",value:5000000,hint:"From budget submission"},
      ghost_asset_pct:{label:"Estimated Ghost/Unrecorded Asset Rate",unit:"%",value:0.08,hint:"GAO: 5–15%; use 8%"},
      reutilization_recovery_pct:{label:"Procurement Avoidance from Reutilization",unit:"%",value:0.30,hint:"Conservative: 30% of found assets reutilized"}
    }
  },
  { id:"GOV-04", name:"Property Accountability Staff Overhead Reduction",
    theme:"Labor & Human Capacity", verticalKey:"government",
    facilityKeys:["Government Facility","Depot / MRO"], themeKeys:["Labor & Human Capacity"],
    annualBenefit:320000, rampType:"hard_labor",
    oneLiner:"PBOs and ECOs spend significant time on manual reconciliation and APSR data entry — RFID automates location capture",
    evidenceIds:["EV-FED-AUDIT-01"],
    challenge:"This labor is already funded — the question is how it's being used. RFID redirects it from reconciliation to mission-critical property management.",
    discoveryQuestions:["How many property accountability FTEs does your command have?","What % of their time is spent on manual reconciliation vs. mission support?","What is the fully-loaded rate for these positions?"],
    inputs:{
      property_ftes:{label:"Property Accountability FTEs",unit:"count",value:12,hint:"PBOs, ECOs, hand receipt holders"},
      pct_time_manual_recon:{label:"% Time on Manual Reconciliation",unit:"%",value:0.40,hint:"Conservative: 40%"},
      reduction_from_rfid:{label:"Reconciliation Time Reduction",unit:"%",value:0.60,hint:"Conservative: 60%"},
      loaded_rate:{label:"Loaded Rate ($/hr)",unit:"$/hr",value:75,hint:"Federal civilian/contractor"}
    }
  },
  { id:"GOV-05", name:"Sensitive Item Loss Prevention",
    theme:"Direct Cost & Spend", verticalKey:"government",
    facilityKeys:["Government Facility","Depot / MRO"], themeKeys:["Direct Cost & Spend","Regulatory & Compliance"],
    annualBenefit:900000, rampType:"hard_cost",
    oneLiner:"Loss of controlled items triggers FLIPL and security investigations — RFID provides continuous custody chain",
    evidenceIds:["EV-FED-AUDIT-01"],
    challenge:"The cost of a FLIPL investigation far exceeds the replacement value of the lost item — that's the number to anchor to.",
    discoveryQuestions:["How many FLIPL investigations were initiated last fiscal year?","What is your average FLIPL investigation cost including labor and legal?","What categories of sensitive items carry the highest loss risk?"],
    inputs:{
      annual_flipl_count:{label:"Annual FLIPL Investigations",unit:"count",value:25,hint:"From IG or legal records"},
      avg_flipl_cost:{label:"Avg FLIPL Cost (investigation + remediation)",unit:"$",value:25000,hint:"Labor + legal + security review"},
      flipl_reduction_pct:{label:"Reduction from RFID",unit:"%",value:0.40,hint:"Conservative: 40%"},
      annual_sensitive_item_losses:{label:"Annual Sensitive Item Write-offs ($)",unit:"$",value:500000,hint:"From property book"}
    }
  },

// == MANUFACTURING (7 new additions) ====================================
  { id:"MTL-02", name:"WIP Inventory — Cycle Time & Carrying Cost Reduction",
    theme:"Working Capital", verticalKey:"manufacturing",
    facilityKeys:["Plant / Factory"], themeKeys:["Working Capital","Operational Efficiency"],
    annualBenefit:380000, rampType:"working_cap",
    oneLiner:"RFID eliminates lost work orders between stations — 10–25% cycle time reduction, 15–30% WIP reduction",
    evidenceIds:["EV-MTL-TOOL-01"],
    challenge:"WIP reduction is a working capital argument — model as one-time release plus annual carrying cost. Both are creditable.",
    discoveryQuestions:["What is your total WIP inventory value?","What is your average manufacturing cycle time today?","What carrying cost rate does finance use for inventory?"],
    inputs:{
      total_wip_value:{label:"Total WIP Inventory Value ($)",unit:"$",value:5000000,hint:"Average on-hand WIP"},
      wip_reduction_pct:{label:"WIP Reduction from RFID",unit:"%",value:0.15,hint:"Conservative: 15%"},
      carrying_cost_rate:{label:"Annual Carrying Cost Rate",unit:"%",value:0.25,hint:"Typical: 20–30%"}
    }
  },
  { id:"MTL-03", name:"Compliance & Traceability Documentation Labor",
    theme:"Regulatory & Compliance", verticalKey:"manufacturing",
    facilityKeys:["Plant / Factory","Depot / MRO"], themeKeys:["Regulatory & Compliance","Labor & Human Capacity"],
    annualBenefit:290000, rampType:"hard_labor",
    oneLiner:"FDA, ITAR, AS9100 compliance costs 3–8% of revenue — RFID automated traceability cuts documentation labor 40–70%",
    evidenceIds:["EV-MTL-TOOL-01"],
    challenge:"Regulatory compliance labor is non-discretionary — the question is the cost of fulfilling it manually vs. automatically.",
    discoveryQuestions:["What standards drive your traceability requirements (FDA, ITAR, AS9100)?","How many FTE-hours per year are spent on compliance documentation?","What is your loaded rate for quality/compliance staff?"],
    inputs:{
      compliance_labor_hours:{label:"Annual Compliance Documentation Hours",unit:"hrs",value:6000,hint:"QA + production staff combined"},
      labor_reduction_pct:{label:"Reduction from RFID",unit:"%",value:0.40,hint:"Conservative: 40%"},
      loaded_rate:{label:"Loaded Compliance Staff Rate ($/hr)",unit:"$/hr",value:55,hint:"QA/engineering avg"}
    }
  },
  { id:"MTL-04", name:"Recall Scope Reduction — Targeted Traceability",
    theme:"Direct Cost & Spend", verticalKey:"manufacturing",
    facilityKeys:["Plant / Factory"], themeKeys:["Direct Cost & Spend","Regulatory & Compliance"],
    annualBenefit:500000, rampType:"hard_cost",
    oneLiner:"Without RFID, recall scope is the full lot — serialization limits exposure to specific units, reducing recall cost 60–90%",
    evidenceIds:["EV-MTL-TOOL-01"],
    challenge:"Frame as risk-adjusted expected value — even a low probability of recall with a large scope creates a quantifiable expected cost that RFID reduces.",
    discoveryQuestions:["Has your organization experienced a product recall in the past 5 years?","What was the total cost including logistics, labor, and customer impact?","What is your annual recall insurance or reserve?"],
    inputs:{
      expected_annual_recall_cost:{label:"Expected Annual Recall Cost ($)",unit:"$",value:1500000,hint:"Historical cost × probability"},
      scope_reduction_pct:{label:"Scope Reduction from RFID Serialization",unit:"%",value:0.60,hint:"Conservative: 60% scope reduction"},
      cost_reduction_pct:{label:"Cost Reduction from Scope Reduction",unit:"%",value:0.60,hint:"Linear with scope reduction"}
    }
  },
  { id:"MTL-05", name:"MRO Inventory Optimization — Carrying Cost Reduction",
    theme:"Working Capital", verticalKey:"manufacturing",
    facilityKeys:["Plant / Factory","Depot / MRO"], themeKeys:["Working Capital","Direct Cost & Spend"],
    annualBenefit:245000, rampType:"working_cap",
    oneLiner:"MRO carrying costs 20–30% of value — RFID reduces excess MRO 10–25% and emergency procurement 30–50%",
    evidenceIds:["EV-MTL-TOOL-01"],
    challenge:"Pull MRO inventory value and carrying cost rate from finance — these are already tracked. Emergency procurement is usually visible in AP.",
    discoveryQuestions:["What is your total MRO inventory value?","What is your annual emergency/unplanned procurement spend?","What carrying cost rate does finance apply to MRO?"],
    inputs:{
      total_mro_value:{label:"Total MRO Inventory Value ($)",unit:"$",value:3000000,hint:"Spare parts + consumables"},
      excess_reduction_pct:{label:"Excess MRO Reduction from RFID",unit:"%",value:0.12,hint:"Conservative: 12%"},
      carrying_cost_rate:{label:"Annual Carrying Cost Rate",unit:"%",value:0.25,hint:"Industry: 20–30%"},
      annual_emergency_procurement:{label:"Annual Emergency Procurement ($)",unit:"$",value:300000,hint:"From AP records"},
      emergency_reduction_pct:{label:"Emergency Procurement Reduction",unit:"%",value:0.30,hint:"Conservative: 30%"}
    }
  },
  { id:"MTL-06", name:"Finished Goods Shipment Accuracy — Chargeback Reduction",
    theme:"Direct Cost & Spend", verticalKey:"manufacturing",
    facilityKeys:["Plant / Factory","Warehouse / DC"], themeKeys:["Direct Cost & Spend","Operational Efficiency"],
    annualBenefit:180000, rampType:"hard_cost",
    oneLiner:"Manual finished goods tracking yields 0.5–2% shipment errors — RFID reduces to under 0.1%",
    evidenceIds:["EV-MTL-TOOL-01"],
    challenge:"Chargeback data is in AP — anchor the baseline from actual records, not benchmarks.",
    discoveryQuestions:["What is your annual shipment chargeback expense?","What % of outbound shipments result in customer disputes?","What is your average cost per shipment error resolution?"],
    inputs:{
      annual_revenue:{label:"Annual Revenue in Scope ($)",unit:"$",value:20000000,hint:"Revenue from affected shipments"},
      error_rate_pct:{label:"Shipment Error Rate",unit:"%",value:0.01,hint:"Conservative: 1%"},
      avg_error_cost:{label:"Average Cost per Error ($)",unit:"$",value:800,hint:"Rework + chargeback + credit"},
      error_reduction_pct:{label:"Reduction from RFID",unit:"%",value:0.80,hint:"Conservative: 80%"}
    }
  },
  { id:"MTL-07", name:"Asset & Fixture Tracking — Utilization & Procurement Avoidance",
    theme:"Operational Efficiency", verticalKey:"manufacturing",
    facilityKeys:["Plant / Factory","Depot / MRO"], themeKeys:["Operational Efficiency","Direct Cost & Spend"],
    annualBenefit:165000, rampType:"hard_cost",
    oneLiner:"Reusable fixtures and production assets are over-procured when unlocatable — RFID prevents phantom replacements",
    evidenceIds:["EV-MTL-TOOL-01"],
    challenge:"This is procurement avoidance — pull from capex or asset replacement budgets to anchor.",
    discoveryQuestions:["What is the total value of tracked reusable fixtures and production assets?","What is your annual write-off or replacement rate for these assets?","How much time do technicians spend locating fixtures between production runs?"],
    inputs:{
      total_asset_value:{label:"Total Reusable Asset Value ($)",unit:"$",value:2000000,hint:"Fixtures, tooling, containers"},
      annual_replacement_rate:{label:"Annual Replacement Rate",unit:"%",value:0.10,hint:"10% of asset base"},
      reduction_from_rfid:{label:"Replacement Reduction from RFID",unit:"%",value:0.40,hint:"Conservative: 40%"}
    }
  },

// == CARRIERS & LOGISTICS (5 new additions) ==============================
  { id:"CAR-02", name:"OS&D Claim Reduction — Load Verification Accuracy",
    theme:"Direct Cost & Spend", verticalKey:"carriers",
    facilityKeys:["Terminal / Port","Warehouse / DC"], themeKeys:["Direct Cost & Spend","Operational Efficiency"],
    annualBenefit:210000, rampType:"hard_cost",
    oneLiner:"Manual load verification yields 0.3–0.8% OS&D rate — RFID reduces to under 0.05% before shipment departs",
    evidenceIds:["EV-TL-DWELL-01"],
    challenge:"OS&D claims are tracked in claims management — pull actual data, not benchmarks.",
    discoveryQuestions:["What is your annual OS&D claim expense?","What % of shipments result in OS&D claims?","What is your average cost per claim including investigation?"],
    inputs:{
      annual_shipments:{label:"Annual Shipments",unit:"count",value:200000,hint:"Total outbound shipments"},
      osd_rate_pct:{label:"OS&D Rate (% of shipments)",unit:"%",value:0.005,hint:"Industry avg: 0.3–0.8%; use 0.5%"},
      avg_claim_cost:{label:"Average Claim Cost ($)",unit:"$",value:350,hint:"Includes labor + freight + credit"},
      claim_reduction_pct:{label:"Reduction from RFID",unit:"%",value:0.85,hint:"Conservative: 85%"}
    }
  },
  { id:"CAR-03", name:"Hub Sortation Labor — Barcode to RFID Throughput",
    theme:"Labor & Human Capacity", verticalKey:"carriers",
    facilityKeys:["Terminal / Port"], themeKeys:["Labor & Human Capacity","Operational Efficiency"],
    annualBenefit:320000, rampType:"hard_labor",
    oneLiner:"RFID read-while-moving eliminates manual divert lanes — hub labor efficiency improves 20–35%",
    evidenceIds:["EV-TL-ASSET-01"],
    challenge:"This is an operations efficiency argument — model hours eliminated at the divert lanes plus reduction in manual scan events.",
    discoveryQuestions:["What is your current hub barcode scan success rate?","How many manual divert lane FTEs do you staff per shift?","What is your loaded labor rate for hub operations?"],
    inputs:{
      manual_divert_ftes:{label:"Manual Divert Lane FTEs",unit:"count",value:8,hint:"Per shift × shifts"},
      shifts_per_year:{label:"Annual Operating Shifts",unit:"count",value:730,hint:"2 shifts × 365 days"},
      hours_per_shift:{label:"Hours per Shift",unit:"hrs",value:8,hint:"Standard shift"},
      loaded_rate:{label:"Loaded Hub Labor Rate ($/hr)",unit:"$/hr",value:26,hint:"Sortation + 30% burden"},
      efficiency_improvement_pct:{label:"FTE Reduction from RFID",unit:"%",value:0.30,hint:"Conservative: 30%"}
    }
  },
  { id:"CAR-04", name:"Misroute Reduction — Package Recovery Cost Avoidance",
    theme:"Operational Efficiency", verticalKey:"carriers",
    facilityKeys:["Terminal / Port"], themeKeys:["Operational Efficiency","Direct Cost & Spend"],
    annualBenefit:195000, rampType:"hard_cost",
    oneLiner:"Misroute rate 0.5–1.5% at $8–25 per incident — RFID real-time location enables recovery before departure",
    evidenceIds:["EV-TL-ASSET-01"],
    challenge:"Pull misroute data from operations — this is a tracked KPI at most carriers.",
    discoveryQuestions:["What is your current misroute rate?","What does it cost per misrouted package including re-delivery and customer credits?","What % of misroutes are caught before departure today?"],
    inputs:{
      annual_package_volume:{label:"Annual Package Volume",unit:"count",value:5000000,hint:"Total parcels through hub"},
      misroute_rate_pct:{label:"Misroute Rate",unit:"%",value:0.008,hint:"Avg: 0.5–1.5%; use 0.8%"},
      cost_per_misroute:{label:"Cost per Misroute ($)",unit:"$",value:18,hint:"Re-delivery + credit + labor"},
      misroute_reduction_pct:{label:"Reduction from RFID",unit:"%",value:0.60,hint:"Conservative: 60%"}
    }
  },
  { id:"CAR-05", name:"Trailer Search Time & Yard Labor Elimination",
    theme:"Labor & Human Capacity", verticalKey:"carriers",
    facilityKeys:["Terminal / Port","Warehouse / DC"], themeKeys:["Labor & Human Capacity","Operational Efficiency"],
    annualBenefit:145000, rampType:"hard_labor",
    oneLiner:"Without RFID, yard jockeys spend 15–30% of shift time locating trailers — RFID reduces search time 80–90%",
    evidenceIds:["EV-TL-ASSET-01"],
    challenge:"Time-and-motion study data is the best anchor — ask how much of yard jockey shift time is pure search.",
    discoveryQuestions:["How many yard jockeys or spotters do you staff?","What % of their shift time is spent locating trailers?","What is your loaded yard labor rate?"],
    inputs:{
      yard_jockeys:{label:"Yard Jockeys / Spotters (FTEs)",unit:"count",value:6,hint:"Total across all shifts"},
      pct_time_searching:{label:"% Shift Time Spent Searching",unit:"%",value:0.20,hint:"Conservative: 20%"},
      search_reduction_pct:{label:"Search Time Reduction from RFID",unit:"%",value:0.80,hint:"Conservative: 80%"},
      loaded_rate:{label:"Loaded Yard Labor Rate ($/hr)",unit:"$/hr",value:28,hint:"Yard ops + 30% burden"},
      annual_hours_per_fte:{label:"Annual Hours per FTE",unit:"hrs",value:2080,hint:"Standard: 2,080 hrs"}
    }
  },

// == AVIATION / MRO (7 new scenarios) ====================================
  { id:"AVN-01", name:"Baggage Mishandling Reduction — Claims & Re-delivery",
    theme:"Direct Cost & Spend", verticalKey:"aviation",
    facilityKeys:["Terminal / Port","Warehouse / DC"], themeKeys:["Direct Cost & Spend","Operational Efficiency"],
    annualBenefit:480000, rampType:"hard_cost",
    oneLiner:"IATA: 4.35 mishandled bags per 1K passengers — RFID 99%+ read rate reduces mishandling 20–25%",
    evidenceIds:["EV-TL-ASSET-01"],
    challenge:"Delta reported 25% mishandling reduction at enterprise scale — use as a Tier 1 reference alongside IATA data.",
    discoveryQuestions:["What is your annual mishandled baggage volume?","What is your average cost per mishandled bag including re-delivery and claims?","What is your current baggage read rate?"],
    inputs:{
      annual_passengers:{label:"Annual Passengers",unit:"count",value:5000000,hint:"Total enplaned passengers"},
      mishandle_rate_per_1k:{label:"Mishandle Rate (per 1,000 pax)",unit:"count",value:4.35,hint:"IATA avg: 4.35"},
      avg_cost_per_incident:{label:"Avg Cost per Mishandled Bag ($)",unit:"$",value:60,hint:"Claims + re-delivery: $25–100"},
      mishandle_reduction_pct:{label:"Reduction from RFID",unit:"%",value:0.22,hint:"Conservative: 22%"}
    }
  },
  { id:"AVN-02", name:"MRO Tool Control — Search Time & FOD Risk Reduction",
    theme:"Labor & Human Capacity", verticalKey:"aviation",
    facilityKeys:["Terminal / Port","Depot / MRO"], themeKeys:["Labor & Human Capacity","Direct Cost & Spend"],
    annualBenefit:310000, rampType:"hard_labor",
    oneLiner:"Missing tools halt maintenance and create FOD risk — Airbus reports 90% reduction in missing tool incidents",
    evidenceIds:["EV-MTL-TOOL-01"],
    challenge:"FOD risk has both a cost and a safety/regulatory angle — both resonate with MRO leadership.",
    discoveryQuestions:["How many tool search events occur per month in your MRO facility?","What is the average duration and cost of each tool search event?","How many AOG events per year are attributable to tool or part unavailability?"],
    inputs:{
      monthly_tool_search_events:{label:"Monthly Tool Search Events",unit:"count",value:200,hint:"Estimate from floor supervisors"},
      avg_search_duration_hrs:{label:"Avg Search Duration (hrs)",unit:"hrs",value:0.5,hint:"Conservative: 30 min"},
      technician_rate:{label:"Loaded Technician Rate ($/hr)",unit:"$/hr",value:65,hint:"MRO tech avg + 30% burden"},
      search_reduction_pct:{label:"Search Event Reduction from RFID",unit:"%",value:0.75,hint:"Conservative: 75%"}
    }
  },
  { id:"AVN-03", name:"MRO Turnaround Time — Aircraft Utilization Improvement",
    theme:"Revenue / Margin", verticalKey:"aviation",
    facilityKeys:["Terminal / Port","Depot / MRO"], themeKeys:["Revenue / Margin","Operational Efficiency"],
    annualBenefit:520000, rampType:"revenue",
    oneLiner:"RFID part and tool visibility reduces MRO turnaround 10–15% — each hour of AOG reduction has direct revenue impact",
    evidenceIds:["EV-TL-ASSET-01"],
    challenge:"AOG cost varies significantly — get the customer's actual aircraft lease or lost revenue rate. Even conservative estimates yield large values.",
    discoveryQuestions:["How many aircraft does your MRO operation handle annually?","What is your average MRO turnaround time?","What is your estimated cost per AOG hour?"],
    inputs:{
      annual_aircraft_through:{label:"Aircraft Processed Annually",unit:"count",value:120,hint:"Total MRO throughput"},
      avg_tat_days:{label:"Average Turnaround Time (days)",unit:"days",value:21,hint:"Typical heavy check"},
      tat_reduction_pct:{label:"TAT Reduction from RFID",unit:"%",value:0.10,hint:"Conservative: 10%"},
      daily_aog_cost:{label:"Cost per AOG Day ($)",unit:"$",value:50000,hint:"Lease + lost revenue: $30K–$150K"}
    }
  },
  { id:"AVN-04", name:"Component Traceability — Compliance Labor & Grounding Risk",
    theme:"Regulatory & Compliance", verticalKey:"aviation",
    facilityKeys:["Terminal / Port","Depot / MRO"], themeKeys:["Regulatory & Compliance","Labor & Human Capacity"],
    annualBenefit:275000, rampType:"hard_labor",
    oneLiner:"FAA/EASA require full lifecycle traceability — manual documentation is 40–60% of maintenance admin labor",
    evidenceIds:["EV-MTL-TOOL-01"],
    challenge:"Regulatory compliance labor is mandatory — frame as fulfilling an existing obligation at lower cost with lower error risk.",
    discoveryQuestions:["How many FTE-hours per year are spent on traceability documentation?","How many grounding events in the past year were related to missing or incomplete records?","What is your average cost per grounding event?"],
    inputs:{
      annual_compliance_hours:{label:"Annual Traceability Documentation Hours",unit:"hrs",value:8000,hint:"Maintenance admin + QA"},
      labor_reduction_pct:{label:"Reduction from RFID",unit:"%",value:0.40,hint:"Conservative: 40%"},
      loaded_rate:{label:"Loaded Maintenance Admin Rate ($/hr)",unit:"$/hr",value:55,hint:"Avg maintenance admin"},
      annual_grounding_events:{label:"Annual Grounding Events (record-related)",unit:"count",value:3,hint:"From ops records"},
      avg_grounding_cost:{label:"Avg Grounding Event Cost ($)",unit:"$",value:25000,hint:"Re-inspection + delays"}
    }
  },
  { id:"AVN-05", name:"Safety Equipment Inspection Labor Reduction",
    theme:"Labor & Human Capacity", verticalKey:"aviation",
    facilityKeys:["Terminal / Port","Depot / MRO"], themeKeys:["Labor & Human Capacity","Regulatory & Compliance"],
    annualBenefit:185000, rampType:"hard_labor",
    oneLiner:"Manual safety equipment checks take 4–8 hrs per aircraft — RFID reduces to under 30 min",
    evidenceIds:["EV-MTL-TOOL-01"],
    challenge:"Time-and-motion data is available for most carriers — anchor to actual current inspection duration and fleet size.",
    discoveryQuestions:["How many aircraft in your managed fleet?","How many hours per aircraft per cycle are spent on safety equipment inspection?","How many inspection cycles per aircraft per year?"],
    inputs:{
      fleet_size:{label:"Managed Fleet Size (aircraft)",unit:"count",value:80,hint:"Aircraft in scope"},
      inspection_hours_manual:{label:"Manual Inspection Hours per Aircraft",unit:"hrs",value:6,hint:"Conservative: 4–8 hrs"},
      inspection_hours_rfid:{label:"RFID Inspection Hours per Aircraft",unit:"hrs",value:0.5,hint:"Under 30 min"},
      inspections_per_year:{label:"Inspections per Aircraft per Year",unit:"count",value:12,hint:"Monthly cycles"},
      loaded_rate:{label:"Loaded Technician Rate ($/hr)",unit:"$/hr",value:60,hint:"Aviation tech avg"}
    }
  },
  { id:"AVN-06", name:"Boarding Time Reduction — Passenger Throughput",
    theme:"Operational Efficiency", verticalKey:"aviation",
    facilityKeys:["Terminal / Port"], themeKeys:["Operational Efficiency","Revenue / Margin"],
    annualBenefit:220000, rampType:"revenue",
    oneLiner:"Airport RFID pilots show 20% boarding time reduction — fewer missed connections, reduced voucher spend",
    evidenceIds:["EV-TL-ASSET-01"],
    challenge:"This argument leads with cost avoidance (vouchers, rebooking) and builds to throughput capacity unlock.",
    discoveryQuestions:["What is your annual rebooking and voucher spend due to missed connections?","What is your average boarding time today?","How many gates operate simultaneously at peak?"],
    inputs:{
      annual_rebooking_spend:{label:"Annual Rebooking & Voucher Spend ($)",unit:"$",value:1500000,hint:"From customer relations or ops"},
      reduction_pct:{label:"Reduction from RFID-enabled Boarding",unit:"%",value:0.15,hint:"Conservative: 15%"}
    }
  },

// == HOSPITALITY (vertical: "hospitality" — new) =========================
  { id:"HOS-01", name:"Linen Lifecycle — Loss Reduction & Laundry Efficiency",
    theme:"Direct Cost & Spend", verticalKey:"hospitality",
    facilityKeys:["Store / Branch"], themeKeys:["Direct Cost & Spend","Operational Efficiency"],
    annualBenefit:195000, rampType:"hard_cost",
    oneLiner:"Hotels lose 10–25% of linen annually — RFID tracking reduces linen loss 15–20% and over-processing 10–15%",
    evidenceIds:["EV-MTL-TOOL-01"],
    challenge:"Annual linen replacement cost is a clear P&L line — pull from housekeeping or purchasing budget.",
    discoveryQuestions:["What is your annual linen replacement spend?","What % of linen loss is attributable to misclassification vs. theft?","How many wash cycles per item does your laundry currently process?"],
    inputs:{
      annual_linen_spend:{label:"Annual Linen Replacement Spend ($)",unit:"$",value:400000,hint:"From purchasing records"},
      loss_reduction_pct:{label:"Loss Reduction from RFID",unit:"%",value:0.15,hint:"Conservative: 15%"},
      laundry_cost_annual:{label:"Annual Laundry Cost ($)",unit:"$",value:600000,hint:"Including over-processing"},
      laundry_efficiency_gain:{label:"Laundry Efficiency Improvement",unit:"%",value:0.10,hint:"Conservative: 10%"}
    }
  },
  { id:"HOS-02", name:"F&B Inventory — Counting Labor & Shrink Control",
    theme:"Labor & Human Capacity", verticalKey:"hospitality",
    facilityKeys:["Store / Branch"], themeKeys:["Labor & Human Capacity","Direct Cost & Spend"],
    annualBenefit:145000, rampType:"hard_labor",
    oneLiner:"F&B shrink 4–8% in high-value categories — RFID reduces counting labor 40–70% and shrink 15–25%",
    evidenceIds:["EV-MTL-TOOL-01"],
    challenge:"High-value category shrink (proteins, alcohol) is immediately quantifiable from purchasing vs. sales reconciliation.",
    discoveryQuestions:["What are your highest-value F&B categories by shrink exposure?","How many hours per week does BOH staff spend on manual inventory counting?","What is your estimated annual F&B shrink value?"],
    inputs:{
      annual_fb_shrink:{label:"Annual F&B Shrink ($)",unit:"$",value:200000,hint:"High-value category shrink"},
      shrink_reduction_pct:{label:"Shrink Reduction from RFID",unit:"%",value:0.20,hint:"Conservative: 20%"},
      counting_labor_hours:{label:"Annual F&B Counting Labor Hours",unit:"hrs",value:3000,hint:"All BOH counting combined"},
      labor_reduction_pct:{label:"Labor Reduction from RFID",unit:"%",value:0.40,hint:"Conservative: 40%"},
      loaded_rate:{label:"Loaded BOH Rate ($/hr)",unit:"$/hr",value:22,hint:"BOH labor + 30%"}
    }
  },

// == DATA CENTER (vertical: "datacenter" — new) ==========================
  { id:"DC-01", name:"Physical Audit Acceleration — CMDB Accuracy",
    theme:"Operational Efficiency", verticalKey:"datacenter",
    facilityKeys:["Warehouse / DC"], themeKeys:["Operational Efficiency","Labor & Human Capacity"],
    annualBenefit:280000, rampType:"hard_labor",
    oneLiner:"Manual data center audits: 2–5 days per 1,000 assets at 85–95% match — RFID cuts audit time 75–85%",
    evidenceIds:["EV-MTL-TOOL-01"],
    challenge:"CMDB accuracy is a business continuity issue — frame as labor cost plus risk reduction from asset configuration errors.",
    discoveryQuestions:["How many IT assets are in scope for physical audit?","How many FTE-hours does each audit cycle consume?","What is your current CMDB match rate?"],
    inputs:{
      total_assets:{label:"Total IT Assets in Scope",unit:"count",value:5000,hint:"Servers, switches, storage"},
      manual_hours_per_1000:{label:"Manual Audit Hours per 1,000 Assets",unit:"hrs",value:80,hint:"Conservative: 80 hrs/1K"},
      rfid_hours_per_1000:{label:"RFID Audit Hours per 1,000 Assets",unit:"hrs",value:12,hint:"Conservative: 12 hrs/1K"},
      audit_cycles_per_year:{label:"Audit Cycles per Year",unit:"count",value:4,hint:"Quarterly"},
      loaded_rate:{label:"Loaded IT Ops Rate ($/hr)",unit:"$/hr",value:75,hint:"IT ops + 30%"}
    }
  },
  { id:"DC-02", name:"Stranded Asset Recovery — Capital Deferral",
    theme:"Operational Efficiency", verticalKey:"datacenter",
    facilityKeys:["Warehouse / DC"], themeKeys:["Operational Efficiency","Direct Cost & Spend"],
    annualBenefit:350000, rampType:"hard_cost",
    oneLiner:"5–15% of data center assets are stranded — RFID sweeps identify orphaned assets for redeployment before new procurement",
    evidenceIds:["EV-MTL-TOOL-01"],
    challenge:"This is a capex avoidance argument — model as % of annual IT procurement budget deferred by reutilization.",
    discoveryQuestions:["What is your annual IT capital equipment budget?","What % of assets do you estimate are stranded or orphaned?","What is the average age of stranded assets vs. procurement threshold?"],
    inputs:{
      annual_it_capex:{label:"Annual IT Capital Budget ($)",unit:"$",value:3000000,hint:"From IT budget"},
      stranded_pct:{label:"Estimated Stranded Asset Rate",unit:"%",value:0.08,hint:"Conservative: 8%"},
      reutilization_pct:{label:"% Reutilized After Discovery",unit:"%",value:0.35,hint:"Conservative: 35% redeployed"}
    }
  },

// == ENERGY / INDUSTRIAL (vertical: "energy" — new) ======================
  { id:"IE-01", name:"Tool, Vehicle & Equipment Tracking — Search & Loss",
    theme:"Direct Cost & Spend", verticalKey:"energy",
    facilityKeys:["Plant / Factory","Depot / MRO","Warehouse / DC"], themeKeys:["Direct Cost & Spend","Labor & Human Capacity"],
    annualBenefit:380000, rampType:"hard_cost",
    oneLiner:"Energy/construction projects lose 20–30% of tool value annually — RFID cuts loss 30–50% and search time 65–80%",
    evidenceIds:["EV-MTL-TOOL-01"],
    challenge:"Tool loss is already tracked in project accounting — pull replacement cost data and rental overages from AP.",
    discoveryQuestions:["What is your total portable tool and equipment inventory value?","What is your estimated annual loss or write-off rate?","What is your annual rental spend for equipment that may already be owned?"],
    inputs:{
      total_tool_value:{label:"Total Tool & Equipment Value ($)",unit:"$",value:5000000,hint:"All tracked portable assets"},
      annual_loss_rate:{label:"Annual Loss Rate",unit:"%",value:0.20,hint:"Conservative: 20%"},
      loss_reduction_pct:{label:"Loss Reduction from RFID",unit:"%",value:0.35,hint:"Conservative: 35%"},
      annual_rental_overage:{label:"Annual Rental Overage Spend ($)",unit:"$",value:300000,hint:"Rentals for items already owned"},
      rental_reduction_pct:{label:"Rental Reduction from RFID",unit:"%",value:0.20,hint:"Conservative: 20%"}
    }
  },
  { id:"IE-02", name:"PPE Compliance & Safety Audit Automation",
    theme:"Regulatory & Compliance", verticalKey:"energy",
    facilityKeys:["Plant / Factory","Depot / MRO"], themeKeys:["Regulatory & Compliance","Labor & Human Capacity"],
    annualBenefit:220000, rampType:"hard_cost",
    oneLiner:"OSHA PPE violations average $5K–$15K per citation — RFID automated zone access validation reduces fines 20–50%",
    evidenceIds:["EV-FED-AUDIT-01"],
    challenge:"OSHA violation history is public record — anchor to actual citation history and HSE audit labor.",
    discoveryQuestions:["How many OSHA citations related to PPE were received in the past 3 years?","How many FTE-hours per year are spent on HSE compliance documentation?","What is your annual safety audit and inspection labor cost?"],
    inputs:{
      annual_osha_fines:{label:"Annual OSHA/Safety Fine Exposure ($)",unit:"$",value:150000,hint:"From legal or HSE records"},
      fine_reduction_pct:{label:"Fine Reduction from RFID",unit:"%",value:0.30,hint:"Conservative: 30%"},
      annual_hse_labor_hours:{label:"Annual HSE Compliance Labor Hours",unit:"hrs",value:5000,hint:"HSE + ops staff"},
      labor_reduction_pct:{label:"Labor Reduction from RFID",unit:"%",value:0.35,hint:"Conservative: 35%"},
      loaded_rate:{label:"Loaded HSE Rate ($/hr)",unit:"$/hr",value:60,hint:"HSE specialist avg"}
    }
  },
  { id:"IE-03", name:"MRO Spare Parts — Carrying Cost & NPT Reduction",
    theme:"Working Capital", verticalKey:"energy",
    facilityKeys:["Plant / Factory","Depot / MRO"], themeKeys:["Working Capital","Direct Cost & Spend"],
    annualBenefit:420000, rampType:"working_cap",
    oneLiner:"Critical spare stockouts cause NPT at $50K–$500K/hr offshore — RFID reduces excess inventory and emergency buys",
    evidenceIds:["EV-MTL-TOOL-01"],
    challenge:"NPT cost is the big number — anchor to actual NPT events and their duration before building the MRO efficiency case.",
    discoveryQuestions:["What is your total MRO spare parts inventory value?","How many NPT events per year were attributable to parts unavailability?","What is your cost per hour of NPT?"],
    inputs:{
      total_mro_value:{label:"Total MRO Inventory Value ($)",unit:"$",value:10000000,hint:"Spare parts + consumables"},
      excess_reduction_pct:{label:"Excess MRO Reduction",unit:"%",value:0.10,hint:"Conservative: 10%"},
      carrying_cost_rate:{label:"Annual Carrying Cost Rate",unit:"%",value:0.27,hint:"Energy industry: 25–30%"},
      annual_npt_events:{label:"Annual NPT Events (parts-related)",unit:"count",value:4,hint:"From ops records"},
      avg_npt_cost:{label:"Avg NPT Event Cost ($)",unit:"$",value:50000,hint:"Conservative — offshore can be much higher"}
    }
  },

// == FOOD SERVICE / CPG (vertical: "foodservice" — new) ==================
  { id:"FS-01", name:"Food Waste Reduction — FEFO Management",
    theme:"Direct Cost & Spend", verticalKey:"foodservice",
    facilityKeys:["Warehouse / DC","Store / Branch"], themeKeys:["Direct Cost & Spend","Operational Efficiency"],
    annualBenefit:240000, rampType:"hard_cost",
    oneLiner:"Food service operators lose 4–10% of food purchased to pre-consumer waste — RFID FEFO reduces this 20–30%",
    evidenceIds:["EV-MTL-TOOL-01"],
    challenge:"Food waste is tracked in most food service operations — pull from purchasing vs. sales reconciliation or waste logs.",
    discoveryQuestions:["What is your annual food purchase spend?","What % is lost to pre-consumer waste?","How is FEFO currently managed in your operation?"],
    inputs:{
      annual_food_spend:{label:"Annual Food Purchase Spend ($)",unit:"$",value:3000000,hint:"Total food procurement"},
      waste_rate_pct:{label:"Pre-Consumer Waste Rate",unit:"%",value:0.06,hint:"Conservative: 6%"},
      waste_reduction_pct:{label:"Waste Reduction from RFID FEFO",unit:"%",value:0.25,hint:"Conservative: 25%"}
    }
  },
  { id:"FS-02", name:"Food Recall Traceability — Scope & Response Time",
    theme:"Regulatory & Compliance", verticalKey:"foodservice",
    facilityKeys:["Warehouse / DC"], themeKeys:["Regulatory & Compliance","Direct Cost & Spend"],
    annualBenefit:500000, rampType:"hard_cost",
    oneLiner:"Average food recall costs $10–30M — RFID lot-level traceability reduces scope 60–85% and response time 80–90%",
    evidenceIds:["EV-FED-AUDIT-01"],
    challenge:"FSMA Section 204 compliance deadline creates regulatory urgency on top of the cost argument.",
    discoveryQuestions:["Has your organization experienced a product recall in the past 5 years?","What was the total cost including logistics, labor, and customer impact?","What is your current traceability resolution time for a recall query?"],
    inputs:{
      expected_recall_cost:{label:"Expected Annual Recall Cost ($)",unit:"$",value:2000000,hint:"Historical × probability"},
      scope_reduction_pct:{label:"Scope Reduction from RFID",unit:"%",value:0.65,hint:"Conservative: 65%"},
      cost_reduction_pct:{label:"Cost Reduction from Scope Reduction",unit:"%",value:0.65,hint:"Linear with scope"}
    }
  },
  { id:"FS-03", name:"Cold Chain Compliance — Spoilage & HACCP Documentation",
    theme:"Regulatory & Compliance", verticalKey:"foodservice",
    facilityKeys:["Warehouse / DC"], themeKeys:["Regulatory & Compliance","Direct Cost & Spend"],
    annualBenefit:185000, rampType:"hard_cost",
    oneLiner:"Manual temp logs: 60–75% HACCP compliance — RFID automated logging reaches 99%+ with real-time excursion alerts",
    evidenceIds:["EV-FED-AUDIT-01"],
    challenge:"Spoilage from temperature excursions is a direct cost — pull from QA rejection logs. HACCP audit labor is separately recoverable.",
    discoveryQuestions:["What is your annual spoilage/rejection cost from temperature excursions?","How many HACCP citations or non-conformances in the last audit cycle?","How many FTE-hours per year are spent on temperature log documentation?"],
    inputs:{
      annual_spoilage_cost:{label:"Annual Spoilage from Temp Excursions ($)",unit:"$",value:250000,hint:"From QA rejection records"},
      spoilage_reduction_pct:{label:"Spoilage Reduction from RFID",unit:"%",value:0.15,hint:"Conservative: 15%"},
      annual_haccp_labor_hours:{label:"Annual HACCP Documentation Hours",unit:"hrs",value:2000,hint:"QA + ops staff"},
      labor_reduction_pct:{label:"Labor Reduction from RFID",unit:"%",value:0.40,hint:"Conservative: 40%"},
      loaded_rate:{label:"Loaded QA Rate ($/hr)",unit:"$/hr",value:35,hint:"QA technician avg"}
    }
  },

// == REMAINING ENGINE SCENARIOS — filling to 84 ===========================

  // RETAIL
  { id:"RET-09", name:"RFID Data Foundation for Retail AI & Analytics",
    theme:"Strategic / AI / Data", verticalKey:"retail",
    facilityKeys:["Store / Branch"], themeKeys:["Strategic / AI / Data","Operational Efficiency"],
    annualBenefit:120000, rampType:"strategic",
    oneLiner:"Item-level RFID data enables demand forecasting, automated replenishment, planogram compliance, and customer analytics",
    evidenceIds:["EV-RET-ACC-01"],
    challenge:"Position as the data infrastructure investment that unlocks AI ROI — the sensor layer existing analytics platforms need but can't buy.",
    discoveryQuestions:["What AI or analytics investments are planned or stalled due to data quality?","What is your current replenishment trigger mechanism?","How is planogram compliance measured today?"],
    inputs:{
      annual_analytics_budget:{label:"Annual Analytics / AI Budget ($)",unit:"$",value:500000,hint:"Data science + tools"},
      data_quality_uplift_pct:{label:"Analytics Effectiveness Improvement",unit:"%",value:0.15,hint:"Conservative: 15% improvement in model accuracy"}
    }
  },

  // WAREHOUSE
  { id:"WH-07", name:"RFID Data Foundation for Warehouse AI & Automation",
    theme:"Strategic / AI / Data", verticalKey:"warehouse",
    facilityKeys:["Warehouse / DC"], themeKeys:["Strategic / AI / Data","Operational Efficiency"],
    annualBenefit:140000, rampType:"strategic",
    oneLiner:"Real-time location data enables AMR navigation, dynamic slotting, predictive labor scheduling, and AI-driven demand flow",
    evidenceIds:["EV-WH-LABOR-01"],
    challenge:"Frame as infrastructure that unlocks automation ROI — AMR and WMS investments underperform without real-time location data.",
    discoveryQuestions:["Are AMRs or warehouse automation planned or already deployed?","What is the current accuracy of your WMS location data?","What AI-driven scheduling or slotting tools are in use?"],
    inputs:{
      annual_automation_spend:{label:"Annual Automation Investment ($)",unit:"$",value:1000000,hint:"AMR + WMS + automation tools"},
      rfid_uplift_pct:{label:"Automation Effectiveness Uplift from RFID",unit:"%",value:0.12,hint:"Conservative: 12%"}
    }
  },

  // HEALTHCARE
  { id:"HC-08", name:"RFID Data Foundation for Healthcare AI & Predictive Ops",
    theme:"Strategic / AI / Data", verticalKey:"healthcare",
    facilityKeys:["Hospital / Clinic"], themeKeys:["Strategic / AI / Data","Operational Efficiency"],
    annualBenefit:160000, rampType:"strategic",
    oneLiner:"Real-time asset, patient, and supply data creates the sensor layer for LOS prediction, demand forecasting, and automated compliance",
    evidenceIds:["EV-HC-ASSET-01"],
    challenge:"Healthcare AI initiatives consistently fail on data quality — RFID is the real-time sensor infrastructure that makes predictive ops viable.",
    discoveryQuestions:["What AI or predictive analytics initiatives are planned for operations?","What data gaps are blocking current analytics projects?","What is the annual investment in healthcare informatics or AI?"],
    inputs:{
      annual_ai_investment:{label:"Annual Healthcare AI/Analytics Investment ($)",unit:"$",value:750000,hint:"Informatics + AI tools"},
      rfid_uplift_pct:{label:"Analytics ROI Uplift from RFID Data",unit:"%",value:0.15,hint:"Conservative: 15%"}
    }
  },

  // GOVERNMENT
  { id:"GOV-06", name:"Excess & Redundant Procurement Reduction",
    theme:"Operational Efficiency", verticalKey:"government",
    facilityKeys:["Government Facility","Depot / MRO"], themeKeys:["Operational Efficiency","Direct Cost & Spend"],
    annualBenefit:750000, rampType:"hard_cost",
    oneLiner:"Without asset visibility, agencies procure items already in inventory — DoD GAO-05-277 documented $400M+ in duplicate procurement",
    evidenceIds:["EV-FED-AUDIT-01"],
    challenge:"Procurement avoidance requires asset visibility data to defend — RFID creates the evidence trail for reutilization program participation.",
    discoveryQuestions:["What was last year's capital equipment procurement budget?","How many items were procured that were later found to exist in inventory?","Does the command participate in DLA reutilization programs?"],
    inputs:{
      annual_procurement_budget:{label:"Annual Equipment Procurement Budget ($)",unit:"$",value:8000000,hint:"Capital equipment spend"},
      duplicate_procurement_pct:{label:"Estimated Duplicate/Avoidable Procurement",unit:"%",value:0.06,hint:"GAO: demonstrable 5–10%; use 6%"},
      avoidance_from_rfid:{label:"Procurement Avoidance from RFID Visibility",unit:"%",value:0.40,hint:"Conservative: 40% of identified duplicates avoided"}
    }
  },

  // MANUFACTURING — AI
  { id:"MTL-08", name:"RFID Data Foundation for Manufacturing AI & Digital Twin",
    theme:"Strategic / AI / Data", verticalKey:"manufacturing",
    facilityKeys:["Plant / Factory"], themeKeys:["Strategic / AI / Data","Operational Efficiency"],
    annualBenefit:180000, rampType:"strategic",
    oneLiner:"Real-time item, WIP, and asset location data enables digital twin modeling, AI-driven scheduling, and predictive quality",
    evidenceIds:["EV-MTL-TOOL-01"],
    challenge:"Digital twin and Industry 4.0 investments stall without real-time physical data — RFID is the sensor layer that makes them viable.",
    discoveryQuestions:["What Industry 4.0 or digital twin initiatives are planned or underway?","What is the current data refresh rate for production scheduling systems?","What AI-driven quality or OEE tools are in use?"],
    inputs:{
      annual_industry40_investment:{label:"Annual Industry 4.0 / Digital Twin Investment ($)",unit:"$",value:1500000,hint:"MES + AI + digital twin tools"},
      rfid_uplift_pct:{label:"ROI Uplift from Real-Time RFID Data",unit:"%",value:0.12,hint:"Conservative: 12%"}
    }
  },

  // HOSPITALITY — remaining 4
  { id:"HOS-03", name:"Guest Experience & Cashless Revenue — RFID Wristbands",
    theme:"Revenue / Margin", verticalKey:"hospitality",
    facilityKeys:["Store / Branch"], themeKeys:["Revenue / Margin","Operational Efficiency"],
    annualBenefit:320000, rampType:"revenue",
    oneLiner:"RFID/NFC wristbands increase per-capita ancillary spend 10–20% and improve entry throughput 20–30%",
    evidenceIds:["EV-TL-ASSET-01"],
    challenge:"Theme parks and resorts have documented this at scale — frame as friction reduction that unlocks spend already intended by guests.",
    discoveryQuestions:["What is your current per-capita ancillary spend?","How many gate or entry lanes do you operate?","What % of transactions are currently cash vs. cashless?"],
    inputs:{
      annual_visitors:{label:"Annual Visitors",unit:"count",value:500000,hint:"Total gate attendance"},
      current_ancillary_per_cap:{label:"Current Ancillary Spend per Visitor ($)",unit:"$",value:35,hint:"Food + retail + extras"},
      spend_uplift_pct:{label:"Ancillary Spend Uplift from RFID",unit:"%",value:0.12,hint:"Conservative: 12%"}
    }
  },
  { id:"HOS-04", name:"Event & Venue Asset Management — Loss & Overtime",
    theme:"Direct Cost & Spend", verticalKey:"hospitality",
    facilityKeys:["Store / Branch"], themeKeys:["Direct Cost & Spend","Labor & Human Capacity"],
    annualBenefit:155000, rampType:"hard_cost",
    oneLiner:"AV and event assets experience 20–35% annual loss — RFID kit tracking cuts loss 25–35% and setup overtime 20–30%",
    evidenceIds:["EV-MTL-TOOL-01"],
    challenge:"Event asset loss is tracked in venue ops — pull from annual equipment replacement and overtime budgets.",
    discoveryQuestions:["What is your annual AV/event equipment replacement budget?","How much overtime is logged for setup/teardown per event?","What % of event delays are attributable to missing equipment?"],
    inputs:{
      annual_asset_replacement:{label:"Annual AV/Event Asset Replacement ($)",unit:"$",value:300000,hint:"From capex or ops budget"},
      loss_reduction_pct:{label:"Loss Reduction from RFID",unit:"%",value:0.25,hint:"Conservative: 25%"},
      annual_setup_overtime:{label:"Annual Setup/Teardown Overtime ($)",unit:"$",value:150000,hint:"From payroll records"},
      overtime_reduction_pct:{label:"Overtime Reduction from RFID",unit:"%",value:0.20,hint:"Conservative: 20%"}
    }
  },
  { id:"HOS-05", name:"Security & Access Control — Unauthorized Entry Reduction",
    theme:"Regulatory & Compliance", verticalKey:"hospitality",
    facilityKeys:["Store / Branch"], themeKeys:["Regulatory & Compliance","Labor & Human Capacity"],
    annualBenefit:120000, rampType:"hard_cost",
    oneLiner:"2–5% unauthorized entry rates — RFID anti-passback reduces violations 20–30% and improves security labor efficiency",
    evidenceIds:["EV-MTL-TOOL-01"],
    challenge:"Unauthorized entry has both revenue leakage and liability dimensions — frame both.",
    discoveryQuestions:["What is your estimated revenue leakage from unauthorized entry?","How many security staff are dedicated to access verification?","How many access compliance incidents were logged last year?"],
    inputs:{
      annual_gate_revenue:{label:"Annual Gate Revenue ($)",unit:"$",value:5000000,hint:"Total ticket/admission revenue"},
      unauthorized_entry_rate:{label:"Unauthorized Entry Rate",unit:"%",value:0.03,hint:"Conservative: 3%"},
      reduction_from_rfid:{label:"Reduction from RFID Anti-Passback",unit:"%",value:0.25,hint:"Conservative: 25%"},
      security_labor_annual:{label:"Annual Security Labor Cost ($)",unit:"$",value:800000,hint:"Access verification staff"},
      security_efficiency_gain:{label:"Security Labor Efficiency Gain",unit:"%",value:0.12,hint:"Conservative: 12%"}
    }
  },
  { id:"HOS-06", name:"Hospitality AI & Guest Personalization Data Foundation",
    theme:"Strategic / AI / Data", verticalKey:"hospitality",
    facilityKeys:["Store / Branch"], themeKeys:["Strategic / AI / Data","Operational Efficiency"],
    annualBenefit:100000, rampType:"strategic",
    oneLiner:"Real-time linen, F&B, and guest journey data enables predictive demand, personalized offers, and automated inventory management",
    evidenceIds:["EV-MTL-TOOL-01"],
    challenge:"Hospitality AI platforms need real-time operational data — RFID creates the sensor layer that makes personalization and predictive ops viable.",
    discoveryQuestions:["What guest analytics or personalization tools are in use or planned?","What operational data gaps are limiting current AI initiatives?"],
    inputs:{
      annual_guest_tech_investment:{label:"Annual Guest Technology Investment ($)",unit:"$",value:400000,hint:"CRM + analytics + AI"},
      rfid_uplift_pct:{label:"Analytics Effectiveness Uplift",unit:"%",value:0.12,hint:"Conservative: 12%"}
    }
  },

  // DATA CENTER — remaining 5
  { id:"DC-03", name:"Stranded Asset Recovery — Capital Deferral & Capacity",
    theme:"Operational Efficiency", verticalKey:"datacenter",
    facilityKeys:["Warehouse / DC"], themeKeys:["Operational Efficiency","Direct Cost & Spend"],
    annualBenefit:350000, rampType:"hard_cost",
    oneLiner:"5–15% of data center assets are stranded — RFID sweeps identify orphaned assets for redeployment before new procurement",
    evidenceIds:["EV-MTL-TOOL-01"],
    challenge:"Stranded asset recovery is pure capex avoidance — model as % of annual IT procurement budget.",
    discoveryQuestions:["What is your annual IT capital equipment budget?","What % of assets do you estimate are stranded or orphaned?","What is your typical asset redeployment vs. retirement split?"],
    inputs:{
      annual_it_capex:{label:"Annual IT Capital Budget ($)",unit:"$",value:3000000,hint:"From IT budget"},
      stranded_pct:{label:"Estimated Stranded Asset Rate",unit:"%",value:0.08,hint:"Conservative: 8%"},
      reutilization_pct:{label:"% Reutilized After Discovery",unit:"%",value:0.35,hint:"Conservative: 35%"}
    }
  },
  { id:"DC-04", name:"Compliance Audit Burden — SOC2, PCI, ISO 27001",
    theme:"Regulatory & Compliance", verticalKey:"datacenter",
    facilityKeys:["Warehouse / DC"], themeKeys:["Regulatory & Compliance","Labor & Human Capacity"],
    annualBenefit:195000, rampType:"hard_labor",
    oneLiner:"Audit evidence prep takes 40–120 hrs per cycle — RFID digital chain-of-custody cuts prep labor 30–60%",
    evidenceIds:["EV-MTL-TOOL-01"],
    challenge:"Compliance labor is non-discretionary — the question is whether it's fulfilled manually or automatically.",
    discoveryQuestions:["Which compliance frameworks require IT asset evidence (SOC2, PCI, ISO 27001)?","How many FTE-hours per audit cycle are spent on asset evidence collection?","What is your external assessor fee per audit cycle?"],
    inputs:{
      annual_audit_prep_hours:{label:"Annual Audit Prep Hours (IT Asset Evidence)",unit:"hrs",value:500,hint:"All audit cycles combined"},
      labor_reduction_pct:{label:"Labor Reduction from RFID",unit:"%",value:0.40,hint:"Conservative: 40%"},
      loaded_rate:{label:"Loaded IT Compliance Rate ($/hr)",unit:"$/hr",value:90,hint:"IT security + compliance avg"},
      annual_assessor_fees:{label:"Annual External Assessor Fees ($)",unit:"$",value:150000,hint:"SOC2 + PCI assessors"},
      assessor_fee_reduction:{label:"Assessor Fee Reduction from Self-Service Evidence",unit:"%",value:0.15,hint:"Conservative: 15%"}
    }
  },
  { id:"DC-05", name:"Asset Loss & Data Security Risk Reduction",
    theme:"Direct Cost & Spend", verticalKey:"datacenter",
    facilityKeys:["Warehouse / DC"], themeKeys:["Direct Cost & Spend","Regulatory & Compliance"],
    annualBenefit:280000, rampType:"hard_cost",
    oneLiner:"Missing storage devices are the #2 source of physical data breach — RFID chain-of-custody reduces loss 20–40%",
    evidenceIds:["EV-MTL-TOOL-01"],
    challenge:"Average cost per missing storage device: $100K–$1M including notification, investigation, and regulatory exposure. Anchor to breach cost calculator.",
    discoveryQuestions:["How many asset loss or missing device events occurred in the last 12 months?","What was the total investigation and remediation cost?","What is your current physical chain-of-custody documentation process?"],
    inputs:{
      annual_device_loss_events:{label:"Annual Device Loss Events",unit:"count",value:5,hint:"From IT security records"},
      avg_cost_per_loss:{label:"Avg Cost per Loss Event ($)",unit:"$",value:50000,hint:"Investigation + notification + exposure"},
      loss_reduction_pct:{label:"Loss Reduction from RFID",unit:"%",value:0.35,hint:"Conservative: 35%"},
      annual_investigation_labor:{label:"Annual Investigation Labor ($)",unit:"$",value:100000,hint:"IT security + HR + legal"}
    }
  },
  { id:"DC-06", name:"Incident Response — Asset Locate Time & MTTR Reduction",
    theme:"Operational Efficiency", verticalKey:"datacenter",
    facilityKeys:["Warehouse / DC"], themeKeys:["Operational Efficiency","Labor & Human Capacity"],
    annualBenefit:140000, rampType:"soft",
    oneLiner:"Locating hardware during incidents extends MTTR — RFID last-seen zone data reduces locate time 20–40%",
    evidenceIds:["EV-MTL-TOOL-01"],
    challenge:"MTTR reduction has a direct SLA and business continuity value — connect to downtime cost or SLA penalty exposure.",
    discoveryQuestions:["What is your average hardware-related MTTR?","How many hardware incidents per year require physical asset location?","What is your cost per hour of system downtime?"],
    inputs:{
      annual_hardware_incidents:{label:"Annual Hardware-Related Incidents",unit:"count",value:50,hint:"From ITSM records"},
      avg_locate_time_hrs:{label:"Avg Time to Locate Asset (hrs)",unit:"hrs",value:0.75,hint:"Conservative: 45 min"},
      locate_reduction_pct:{label:"Locate Time Reduction from RFID",unit:"%",value:0.30,hint:"Conservative: 30%"},
      cost_per_incident_hr:{label:"Cost per Incident Hour ($)",unit:"$",value:5000,hint:"Downtime + labor + SLA risk"}
    }
  },
  { id:"DC-07", name:"RFID Data Foundation for DCIM & Capacity Planning",
    theme:"Strategic / AI / Data", verticalKey:"datacenter",
    facilityKeys:["Warehouse / DC"], themeKeys:["Strategic / AI / Data","Operational Efficiency"],
    annualBenefit:120000, rampType:"strategic",
    oneLiner:"Real-time asset location and utilization data enables accurate capacity heatmaps, automated CMDB sync, and procurement deferral analytics",
    evidenceIds:["EV-MTL-TOOL-01"],
    challenge:"DCIM platforms are only as good as their real-time data — RFID is the physical layer that makes capacity planning accurate.",
    discoveryQuestions:["What DCIM platform is in use?","How frequently is asset location data refreshed in the CMDB?","What is the annual investment in capacity planning tools?"],
    inputs:{
      annual_dcim_investment:{label:"Annual DCIM/Capacity Planning Investment ($)",unit:"$",value:300000,hint:"Platform + services"},
      rfid_uplift_pct:{label:"Planning Accuracy Uplift from RFID",unit:"%",value:0.15,hint:"Conservative: 15%"}
    }
  },

  // CARRIERS — remaining 3
  { id:"CAR-06", name:"Last-Mile Visibility — WISMO Contact Deflection",
    theme:"Operational Efficiency", verticalKey:"carriers",
    facilityKeys:["Terminal / Port"], themeKeys:["Operational Efficiency","Direct Cost & Spend"],
    annualBenefit:175000, rampType:"hard_cost",
    oneLiner:"RFID real-time last-mile location reduces WISMO contacts 15–30% — at $3–8 per deflected contact",
    evidenceIds:["EV-TL-DWELL-01"],
    challenge:"WISMO contact volume and cost are tracked in customer service — pull from CRM or contact center data.",
    discoveryQuestions:["How many 'where is my order' contacts per month does your team handle?","What is your cost per contact including agent time?","What % are attributable to last-mile location uncertainty?"],
    inputs:{
      annual_wismo_contacts:{label:"Annual WISMO Contacts",unit:"count",value:500000,hint:"From contact center records"},
      cost_per_contact:{label:"Cost per Contact ($)",unit:"$",value:5,hint:"Agent time + overhead: $3–8"},
      wismo_reduction_pct:{label:"Reduction from RFID Real-Time Visibility",unit:"%",value:0.20,hint:"Conservative: 20%"}
    }
  },
  { id:"CAR-07", name:"Regulated Mail & High-Value Parcel Compliance",
    theme:"Regulatory & Compliance", verticalKey:"carriers",
    facilityKeys:["Terminal / Port"], themeKeys:["Regulatory & Compliance","Labor & Human Capacity"],
    annualBenefit:145000, rampType:"hard_labor",
    oneLiner:"RFID reduces compliance documentation labor 40–60% for regulated mail and responds to regulatory inquiries in minutes vs. days",
    evidenceIds:["EV-TL-DWELL-01"],
    challenge:"Regulated mail compliance is mandatory — frame as fulfilling an existing obligation at lower labor cost with faster response.",
    discoveryQuestions:["What volume of registered or regulated mail do you process annually?","How many FTE-hours per year are spent on compliance documentation?","How many regulatory inquiries or investigations per year?"],
    inputs:{
      annual_regulated_volume:{label:"Annual Regulated Mail Volume",unit:"count",value:100000,hint:"Registered + certified + high-value"},
      compliance_labor_hours:{label:"Annual Compliance Documentation Hours",unit:"hrs",value:3000,hint:"Per item logging + reconciliation"},
      labor_reduction_pct:{label:"Labor Reduction from RFID",unit:"%",value:0.45,hint:"Conservative: 45%"},
      loaded_rate:{label:"Loaded Compliance Rate ($/hr)",unit:"$/hr",value:28,hint:"Postal/carrier ops avg"}
    }
  },
  { id:"CAR-08", name:"RFID Data Foundation for Carrier AI & Network Optimization",
    theme:"Strategic / AI / Data", verticalKey:"carriers",
    facilityKeys:["Terminal / Port"], themeKeys:["Strategic / AI / Data","Operational Efficiency"],
    annualBenefit:130000, rampType:"strategic",
    oneLiner:"Real-time package location enables AI-driven sortation sequencing, predictive misroute detection, and dynamic route optimization",
    evidenceIds:["EV-TL-ASSET-01"],
    challenge:"Carrier AI investments require real-time shipment location data — RFID creates the sensor layer that activates them.",
    discoveryQuestions:["What AI or route optimization tools are in use or planned?","What is the current data latency for package location updates?","What is the annual investment in network optimization technology?"],
    inputs:{
      annual_network_opt_investment:{label:"Annual Network Optimization Investment ($)",unit:"$",value:1000000,hint:"AI + routing + analytics tools"},
      rfid_uplift_pct:{label:"Optimization Effectiveness Uplift from RFID",unit:"%",value:0.10,hint:"Conservative: 10%"}
    }
  },

  // TRANSPORT & LOGISTICS — remaining 2
  { id:"TL-02", name:"Routing Guide Compliance — Shipper-Side Visibility",
    theme:"Regulatory & Compliance", verticalKey:"carriers",
    facilityKeys:["Terminal / Port","Warehouse / DC"], themeKeys:["Regulatory & Compliance","Direct Cost & Spend"],
    annualBenefit:185000, rampType:"hard_cost",
    oneLiner:"RFID improves routing guide compliance 10–20% and reduces carrier chargebacks 20–40% through better load tendering",
    evidenceIds:["EV-TL-DWELL-01"],
    challenge:"Routing guide compliance violations result in chargebacks that are tracked in AP — anchor to actual chargeback data.",
    discoveryQuestions:["What is your annual routing guide chargeback expense?","What % of shipments are out-of-compliance with customer routing guides?","What is your average cost per chargeback resolution?"],
    inputs:{
      annual_routing_chargebacks:{label:"Annual Routing Guide Chargebacks ($)",unit:"$",value:400000,hint:"From AP records"},
      chargeback_reduction_pct:{label:"Reduction from RFID Visibility",unit:"%",value:0.25,hint:"Conservative: 25%"},
      compliance_labor_hours:{label:"Annual Compliance Resolution Labor Hours",unit:"hrs",value:2000,hint:"Ops + admin + disputes"},
      loaded_rate:{label:"Loaded Ops Rate ($/hr)",unit:"$/hr",value:35,hint:"Transport ops avg"}
    }
  },
  { id:"TL-03", name:"RFID Data Foundation for Logistics AI & Network Optimization",
    theme:"Strategic / AI / Data", verticalKey:"carriers",
    facilityKeys:["Terminal / Port","Warehouse / DC"], themeKeys:["Strategic / AI / Data","Operational Efficiency"],
    annualBenefit:140000, rampType:"strategic",
    oneLiner:"Real-time trailer and shipment location data enables predictive ETAs, AI-driven load matching, and dynamic lane pricing",
    evidenceIds:["EV-TL-ASSET-01"],
    challenge:"Logistics AI requires real-time asset location data — without RFID, models rely on stale EDI pings that miss actual yard and dock status.",
    discoveryQuestions:["What TMS or AI-driven load matching tools are in use?","What is the data latency for trailer location updates today?","What is the annual investment in logistics technology?"],
    inputs:{
      annual_logistics_tech_investment:{label:"Annual Logistics Technology Investment ($)",unit:"$",value:1200000,hint:"TMS + AI + visibility platforms"},
      rfid_uplift_pct:{label:"Platform Effectiveness Uplift from RFID",unit:"%",value:0.10,hint:"Conservative: 10%"}
    }
  },

  // ENERGY / INDUSTRIAL — remaining 4
  { id:"IE-04", name:"Oil & Gas Field Materials Management — Shrink & NPT",
    theme:"Direct Cost & Spend", verticalKey:"energy",
    facilityKeys:["Plant / Factory","Depot / MRO"], themeKeys:["Direct Cost & Spend","Labor & Human Capacity"],
    annualBenefit:480000, rampType:"hard_cost",
    oneLiner:"Field material shrink 8–15% of value — RFID reduces material loss 10–12% and NPT from unavailability 5–12%",
    evidenceIds:["EV-MTL-TOOL-01"],
    challenge:"NPT cost dwarfs material value — anchor to actual NPT events and hourly rate first, then build the material shrink case.",
    discoveryQuestions:["What is your field material inventory value (pipes, valves, assemblies)?","How many NPT events per year are attributable to material unavailability?","What is your cost per hour of NPT?"],
    inputs:{
      field_material_value:{label:"Field Material Inventory Value ($)",unit:"$",value:10000000,hint:"All tracked field materials"},
      shrink_rate_pct:{label:"Annual Shrink Rate",unit:"%",value:0.10,hint:"Conservative: 10%"},
      shrink_reduction_pct:{label:"Shrink Reduction from RFID",unit:"%",value:0.10,hint:"Conservative: 10%"},
      annual_npt_events:{label:"NPT Events from Material Unavailability",unit:"count",value:6,hint:"From ops records"},
      npt_cost_per_hr:{label:"NPT Cost per Hour ($)",unit:"$",value:50000,hint:"Conservative — offshore much higher"},
      avg_npt_duration:{label:"Avg NPT Event Duration (hrs)",unit:"hrs",value:4,hint:"Conservative: 4 hrs"}
    }
  },
  { id:"IE-05", name:"Asset Integrity Inspection — Documentation & Compliance",
    theme:"Regulatory & Compliance", verticalKey:"energy",
    facilityKeys:["Plant / Factory","Depot / MRO"], themeKeys:["Regulatory & Compliance","Labor & Human Capacity"],
    annualBenefit:260000, rampType:"hard_labor",
    oneLiner:"Inspection programs spend 30–50% of budget on documentation — RFID reduces documentation labor 35–45% and compliance exceptions 25–35%",
    evidenceIds:["EV-FED-AUDIT-01"],
    challenge:"Regulatory inspection compliance is mandatory — the labor cost is non-discretionary. RFID reduces it while improving accuracy.",
    discoveryQuestions:["What regulatory inspection programs apply (API, OSHA PSM, EPA RMP)?","How many FTE-hours per year are spent on inspection documentation?","How many compliance exceptions or citations last year?"],
    inputs:{
      annual_inspection_labor_hours:{label:"Annual Inspection Documentation Hours",unit:"hrs",value:8000,hint:"All inspection types combined"},
      labor_reduction_pct:{label:"Labor Reduction from RFID",unit:"%",value:0.35,hint:"Conservative: 35%"},
      loaded_rate:{label:"Loaded Inspection Staff Rate ($/hr)",unit:"$/hr",value:75,hint:"Inspection technician + burden"},
      annual_compliance_exceptions:{label:"Annual Compliance Exceptions/Citations",unit:"count",value:12,hint:"From HSE records"},
      avg_exception_cost:{label:"Avg Cost per Compliance Exception ($)",unit:"$",value:8000,hint:"Fine + remediation + legal"}
    }
  },
  { id:"IE-06", name:"Rental & High-Value Equipment — Billing Dispute Reduction",
    theme:"Direct Cost & Spend", verticalKey:"energy",
    facilityKeys:["Plant / Factory","Depot / MRO"], themeKeys:["Direct Cost & Spend","Operational Efficiency"],
    annualBenefit:310000, rampType:"hard_cost",
    oneLiner:"Subsea and rental asset billing disputes reduced ~80% with RFID custody transfer records — rental overages down 10–25%",
    evidenceIds:["EV-MTL-TOOL-01"],
    challenge:"Rental overages and disputes are tracked in AP and vendor management — pull actuals to anchor the model.",
    discoveryQuestions:["What is your annual rental spend for high-value equipment?","How many billing disputes per year with rental vendors?","What % of rental charges do you estimate are overages for equipment sitting idle?"],
    inputs:{
      annual_rental_spend:{label:"Annual High-Value Equipment Rental Spend ($)",unit:"$",value:3000000,hint:"All rental categories in scope"},
      overage_pct:{label:"Rental Overage Rate (idle/unused)",unit:"%",value:0.15,hint:"Conservative: 15%"},
      overage_reduction_pct:{label:"Overage Reduction from RFID",unit:"%",value:0.20,hint:"Conservative: 20%"},
      annual_billing_disputes:{label:"Annual Billing Disputes",unit:"count",value:30,hint:"From AP/vendor management"},
      avg_dispute_cost:{label:"Avg Cost per Dispute ($)",unit:"$",value:3000,hint:"Admin + legal + resolution time"}
    }
  },
  { id:"IE-07", name:"RFID Data Foundation for Energy & Construction AI",
    theme:"Strategic / AI / Data", verticalKey:"energy",
    facilityKeys:["Plant / Factory","Depot / MRO"], themeKeys:["Strategic / AI / Data","Regulatory & Compliance"],
    annualBenefit:150000, rampType:"strategic",
    oneLiner:"Real-time asset, material, and compliance data enables predictive failure analytics, automated inspection reporting, and AI-driven procurement optimization",
    evidenceIds:["EV-MTL-TOOL-01"],
    challenge:"Predictive maintenance and AI-driven procurement require real-time physical asset data — RFID is the sensor layer.",
    discoveryQuestions:["What predictive maintenance or AI tools are planned or in use?","What is the current data latency for asset condition and location updates?","What is the annual investment in digital operations technology?"],
    inputs:{
      annual_digital_ops_investment:{label:"Annual Digital Operations Investment ($)",unit:"$",value:2000000,hint:"Predictive maintenance + AI + IoT"},
      rfid_uplift_pct:{label:"Technology ROI Uplift from RFID Data",unit:"%",value:0.10,hint:"Conservative: 10%"}
    }
  },

  // FOOD SERVICE — remaining 5
  { id:"FS-04", name:"Food Recall Traceability — Scope & Response Time",
    theme:"Regulatory & Compliance", verticalKey:"foodservice",
    facilityKeys:["Warehouse / DC"], themeKeys:["Regulatory & Compliance","Direct Cost & Spend"],
    annualBenefit:500000, rampType:"hard_cost",
    oneLiner:"Average food recall costs $10–30M — RFID lot traceability reduces scope 60–85% and response time 80–90%. FSMA 204 deadline: Jan 2026.",
    evidenceIds:["EV-FED-AUDIT-01"],
    challenge:"FSMA Section 204 creates regulatory urgency independent of ROI — anchor to that compliance deadline, then build the cost avoidance case.",
    discoveryQuestions:["Has your organization experienced a recall in the past 5 years?","What was the total cost including logistics, labor, and customer impact?","What is your current lot traceability resolution time?"],
    inputs:{
      expected_recall_cost:{label:"Expected Annual Recall Cost ($)",unit:"$",value:2000000,hint:"Historical × probability"},
      scope_reduction_pct:{label:"Scope Reduction from RFID Lot Traceability",unit:"%",value:0.65,hint:"Conservative: 65%"},
      cost_reduction_pct:{label:"Cost Reduction from Scope Reduction",unit:"%",value:0.65,hint:"Linear with scope"}
    }
  },
  { id:"FS-05", name:"High-Value Inventory Shrink — Proteins, Alcohol, Premiums",
    theme:"Direct Cost & Spend", verticalKey:"foodservice",
    facilityKeys:["Warehouse / DC","Store / Branch"], themeKeys:["Direct Cost & Spend"],
    annualBenefit:195000, rampType:"hard_cost",
    oneLiner:"Food service shrink 4–8% in high-value categories — RFID chain-of-custody in high-risk zones reduces shrink 15–25%",
    evidenceIds:["EV-RET-SHRINK-01"],
    challenge:"High-value category shrink is already tracked in purchasing vs. sales reconciliation — anchor to the customer's own data.",
    discoveryQuestions:["What is your annual shrink value in proteins, alcohol, and premium ingredients?","Which zones or stations carry the highest shrink concentration?","Do you currently have exception-based reporting for high-value items?"],
    inputs:{
      annual_hv_shrink:{label:"Annual High-Value Category Shrink ($)",unit:"$",value:500000,hint:"Proteins + alcohol + premiums"},
      shrink_reduction_pct:{label:"Shrink Reduction from RFID",unit:"%",value:0.18,hint:"Conservative: 18%"}
    }
  },
  { id:"FS-06", name:"Demand Planning & Forecast Accuracy — Prep Waste Reduction",
    theme:"Operational Efficiency", verticalKey:"foodservice",
    facilityKeys:["Warehouse / DC","Store / Branch"], themeKeys:["Operational Efficiency","Direct Cost & Spend"],
    annualBenefit:170000, rampType:"soft",
    oneLiner:"RFID consumption signals improve forecast accuracy 10–15%, reducing over-prep waste and stockout events",
    evidenceIds:["EV-MTL-TOOL-01"],
    challenge:"Over-prep waste and stockouts both have cost and guest experience dimensions — model the cost side conservatively.",
    discoveryQuestions:["What is your current forecast accuracy rate for high-velocity items?","What is your weekly over-prep waste cost?","How many stockout events per week result in customer experience issues?"],
    inputs:{
      annual_food_spend:{label:"Annual Food Purchase Spend ($)",unit:"$",value:3000000,hint:"Total food procurement"},
      overprep_waste_pct:{label:"Over-Prep Waste Rate",unit:"%",value:0.04,hint:"Conservative: 4% of food spend"},
      forecast_improvement_pct:{label:"Forecast Improvement from RFID Signals",unit:"%",value:0.12,hint:"Conservative: 12%"}
    }
  },
  { id:"FS-07", name:"Order Accuracy & Customer Refund Reduction",
    theme:"Operational Efficiency", verticalKey:"foodservice",
    facilityKeys:["Store / Branch"], themeKeys:["Operational Efficiency","Direct Cost & Spend"],
    annualBenefit:140000, rampType:"hard_cost",
    oneLiner:"QSR RFID order validation reduces refund and credit events 15–30% through kit completeness checks at the pass",
    evidenceIds:["EV-MTL-TOOL-01"],
    challenge:"Refund and credit data is tracked in POS — pull actuals and build directly from customer's own numbers.",
    discoveryQuestions:["What is your annual refund and customer credit expense?","What % of refunds are attributable to order completeness errors?","How many transactions per day pass through your busiest location?"],
    inputs:{
      annual_refunds_credits:{label:"Annual Refunds & Customer Credits ($)",unit:"$",value:400000,hint:"From POS or customer service records"},
      completeness_error_pct:{label:"% of Refunds from Order Completeness Errors",unit:"%",value:0.40,hint:"Conservative: 40%"},
      reduction_from_rfid:{label:"Reduction from RFID Kit Validation",unit:"%",value:0.20,hint:"Conservative: 20%"}
    }
  },
  { id:"FS-08", name:"ESG & Sustainability Reporting Automation",
    theme:"Regulatory & Compliance", verticalKey:"foodservice",
    facilityKeys:["Warehouse / DC"], themeKeys:["Regulatory & Compliance","Labor & Human Capacity"],
    annualBenefit:120000, rampType:"hard_labor",
    oneLiner:"RFID-automated waste, donation, and cold chain logs reduce ESG audit labor 20–40% and create verifiable sustainability data",
    evidenceIds:["EV-FED-AUDIT-01"],
    challenge:"ESG reporting requirements are expanding — RFID creates audit-ready records that manual processes cannot reliably produce.",
    discoveryQuestions:["What ESG or sustainability reporting obligations do you have (SEC, investor, customer)?","How many FTE-hours per year are spent on sustainability data collection?","What is the cost of external ESG audit or assurance?"],
    inputs:{
      annual_esg_labor_hours:{label:"Annual ESG Reporting Labor Hours",unit:"hrs",value:1500,hint:"Data collection + audit prep"},
      labor_reduction_pct:{label:"Labor Reduction from RFID Automation",unit:"%",value:0.30,hint:"Conservative: 30%"},
      loaded_rate:{label:"Loaded Sustainability/Compliance Rate ($/hr)",unit:"$/hr",value:50,hint:"Compliance staff avg"},
      annual_esg_audit_fees:{label:"Annual External ESG Audit Fees ($)",unit:"$",value:80000,hint:"Third-party assurance"},
      audit_fee_reduction:{label:"Audit Fee Reduction from Self-Service Evidence",unit:"%",value:0.15,hint:"Conservative: 15%"}
    }
  },

];


// ── EVIDENCE ──

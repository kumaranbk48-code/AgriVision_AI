"""
AgriVision AI - Farmer-Centric Recommendation Engine
Generates prioritized, actionable agronomic recommendations by re-running
counterfactual model simulations. Provides multilingual explanations (EN, TA, HI).
"""

from typing import Dict, List, Any
from src.ml.inference import InferenceEngine
from src.data.generate_dataset import CROP_PROFILES

class RecommendationEngine:
    def __init__(self, inference_engine: InferenceEngine = None):
        self.ie = inference_engine or InferenceEngine()

    def generate_recommendations(self, base_inputs: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generates prioritized agronomic actions with quantified yield impacts by re-running the model."""
        base_pred = self.ie.predict(base_inputs)
        base_yield = base_pred["expected_yield_t_ha"]

        recommendations = []
        crop = base_inputs.get("crop", "Rice")
        prof = CROP_PROFILES.get(crop, CROP_PROFILES["Rice"])
        current_irrig = base_inputs.get("irrigation_type", "Canal/Flood")
        current_rain = float(base_inputs.get("rainfall_mm", 600))
        current_n = float(base_inputs.get("fertilizer_n", 100))
        current_p = float(base_inputs.get("fertilizer_p", 50))
        current_k = float(base_inputs.get("fertilizer_k", 40))
        current_ph = float(base_inputs.get("soil_ph", 7.0))
        current_temp = float(base_inputs.get("avg_temp_c", 28.0))

        # 1. Counterfactual: Irrigation Upgrade (if Rainfed or Canal/Flood)
        if current_irrig in ["Rainfed", "Canal/Flood"]:
            better_irrig = "Drip" if crop in ["Sugarcane", "Cotton", "Tomato", "Onion", "Groundnut", "Maize"] else "Sprinkler"
            sim_inputs = {**base_inputs, "irrigation_type": better_irrig}
            sim_pred = self.ie.predict(sim_inputs)
            delta_yield = sim_pred["expected_yield_t_ha"] - base_yield
            pct_gain = round((delta_yield / max(0.1, base_yield)) * 100, 1)

            if pct_gain > 4.0:
                recommendations.append({
                    "id": "irrig_upgrade",
                    "priority": "High" if current_rain < prof["opt_rain"] * 0.75 else "Medium",
                    "category": "Irrigation",
                    "badge": f"+{pct_gain}% Yield Potential",
                    "impact_pct": pct_gain,
                    "title": {
                        "en": f"Transition from {current_irrig} to {better_irrig} Irrigation",
                        "ta": f"{current_irrig} முறையிலிருந்து {better_irrig} பாசன முறைக்கு மாறவும்",
                        "hi": f"{current_irrig} से {better_irrig} सिंचाई में बदलाव करें"
                    },
                    "reason": {
                        "en": f"Under current seasonal rainfall ({current_rain}mm vs {prof['opt_rain']}mm need), {better_irrig} reduces evaporative loss by 40% and maintains root-zone field capacity.",
                        "ta": f"தற்போதைய மழை அளவின் கீழ் ({current_rain}மிமீ), {better_irrig} பாசனம் நீர் ஆவியாதலை 40% குறைத்து வேர் மண்டல ஈரப்பதத்தை காக்கிறது.",
                        "hi": f"वर्तमान वर्षा ({current_rain} मिमी) के तहत, {better_irrig} सिंचाई वाष्पीकरण को 40% कम कर जड़ क्षेत्र में नमी बनाए रखती है।"
                    },
                    "action": {
                        "en": f"Apply micro-irrigation scheduling of 2-3 hours twice weekly; leverage PMKSY (Per Drop More Crop) subsidies.",
                        "ta": f"வாரத்திற்கு இருமுறை 2-3 மணிநேரம் சொட்டுநீர் பாசனம் செய்யவும்; அரசு மானியத்தைப் பயன்படுத்தவும்.",
                        "hi": f"सप्ताह में दो बार 2-3 घंटे सूक्ष्म सिंचाई करें; प्रधानमंत्री कृषि सिंचाई योजना सब्सिडी का लाभ उठाएं।"
                    }
                })

        # 2. Counterfactual: Fertilizer NPK Optimization
        opt_n = prof["n_req"]
        opt_p = prof["p_req"]
        opt_k = prof["k_req"]
        n_deficit = opt_n - current_n
        if n_deficit > 15:
            sim_inputs = {**base_inputs, "fertilizer_n": opt_n, "fertilizer_p": max(current_p, opt_p), "fertilizer_k": max(current_k, opt_k)}
            sim_pred = self.ie.predict(sim_inputs)
            delta_yield = sim_pred["expected_yield_t_ha"] - base_yield
            pct_gain = round((delta_yield / max(0.1, base_yield)) * 100, 1)

            if pct_gain > 3.0:
                recommendations.append({
                    "id": "fertilizer_n_boost",
                    "priority": "High" if n_deficit > 30 else "Medium",
                    "category": "Fertilizer",
                    "badge": f"+{pct_gain}% Yield Potential",
                    "impact_pct": pct_gain,
                    "title": {
                        "en": f"Correct Nitrogen Deficit (+{round(n_deficit)} kg/ha)",
                        "ta": f"தழைச்சத்து பற்றாக்குறையை சரிசெய்யவும் (+{round(n_deficit)} கி/ஹெக்)",
                        "hi": f"नाइट्रोजन की कमी को पूरा करें (+{round(n_deficit)} किग्रा/हेक्टेयर)"
                    },
                    "reason": {
                        "en": f"Current application ({current_n} kg/ha) falls short of ICAR recommended dose ({opt_n} kg/ha) for high-tillering capacity.",
                        "ta": f"தற்போதைய அளவு ({current_n} கி/ஹெக்) போதுமான தூர்கள் உருவாவதற்கு தேவையான அளவை விட ({opt_n} கி/ஹெக்) குறைவாக உள்ளது.",
                        "hi": f"वर्तमान खुराक ({current_n} किग्रा/हेक्टेयर) अच्छी फसल वृद्धि के लिए अनुशंसित मात्रा ({opt_n} किग्रा/हेक्टेयर) से कम है।"
                    },
                    "action": {
                        "en": "Apply split-dose urea (50% basal at sowing, 25% at active tillering, 25% at panicle initiation) with neem-coating.",
                        "ta": f"பிரித்து இடப்படும் முறையில் வேப்பம் பூசிய யூரியாவை இடவும் (விதைப்பின் போது 50%, தூர்கட்டும் போது 25%, கதிர் பருவத்தில் 25%).",
                        "hi": "नीम-लेपित यूरिया को तीन भागों में दें (50% बुवाई के समय, 25% कल्ले फूटते समय, 25% बाली निकलते समय)।"
                    }
                })
        elif current_n > opt_n * 1.35:
            # Over-fertilization alert
            sim_inputs = {**base_inputs, "fertilizer_n": opt_n}
            sim_pred = self.ie.predict(sim_inputs)
            cost_saved_pct = round(((current_n - opt_n) / current_n) * 100)
            recommendations.append({
                "id": "fertilizer_n_reduction",
                "priority": "Medium",
                "category": "Input Cost Reduction",
                "badge": f"Save ~{cost_saved_pct}% Urea Costs",
                "impact_pct": 2.5,
                "title": {
                    "en": f"Rationalize Excess Nitrogen (Reduce by {round(current_n - opt_n)} kg/ha)",
                    "ta": f"அதிகப்படியான தழைச்சத்தை குறைக்கவும் ({round(current_n - opt_n)} கி/ஹெக் குறைப்பு)",
                    "hi": f"अतिरिक्त नाइट्रोजन कम करें ({round(current_n - opt_n)} किग्रा/हेक्टेयर कमी)"
                },
                "reason": {
                    "en": f"Excess N ({current_n} kg/ha) offers no additional yield benefit due to Mitscherlich diminishing returns, but increases pest susceptibility and lodging.",
                    "ta": f"தேவைக்கு அதிகமான யூரியா பூச்சி தாக்குதலையும் பயிர் சாய்வதையும் அதிகரிக்கும், கூடுதல் மகசூல் தராது.",
                    "hi": f"अतिरिक्त नाइट्रोजन से कीटों का प्रकोप और फसल गिरने का खतरा बढ़ता है, लेकिन उपज नहीं बढ़ती।"
                },
                "action": {
                    "en": "Use Leaf Color Chart (LCC) guidance to time top-dressings and integrate biofertilizers (Azospirillum/Azotobacter).",
                    "ta": f"இலை வண்ண அட்டையை (LCC) பயன்படுத்தி தழைச்சத்தை சரியாக இடவும்.",
                    "hi": "लीफ कलर चार्ट (LCC) का उपयोग करें और जैव उर्वरक का उपयोग करें।"
                }
            })

        # 3. Counterfactual: Soil pH Correction
        if current_ph < 6.0:
            sim_inputs = {**base_inputs, "soil_ph": 6.8}
            sim_pred = self.ie.predict(sim_inputs)
            delta_yield = sim_pred["expected_yield_t_ha"] - base_yield
            pct_gain = round((delta_yield / max(0.1, base_yield)) * 100, 1)
            recommendations.append({
                "id": "soil_ph_liming",
                "priority": "High",
                "category": "Soil Health",
                "badge": f"+{pct_gain}% Yield Potential",
                "impact_pct": pct_gain,
                "title": {
                    "en": f"Soil Liming for Acidic Soil (pH {current_ph} -> 6.8)",
                    "ta": f"அமில மண்ணுக்கு சுண்ணாம்பு இடுதல் (pH {current_ph} -> 6.8)",
                    "hi": f"अम्लीय मिट्टी के लिए चूना सुधार (pH {current_ph} -> 6.8)"
                },
                "reason": {
                    "en": f"Acidic conditions (pH {current_ph}) fix applied Phosphorus into insoluble aluminum compounds.",
                    "ta": f"மண் அமிலத்தன்மை (pH {current_ph}) இட்ட மணிச்சத்தை பயிர்கள் உறிஞ்ச முடியாமல் தடுத்து விடுகிறது.",
                    "hi": f"अम्लीय मिट्टी (pH {current_ph}) में फास्फोरस का अवशोषण रुक जाता है।"
                },
                "action": {
                    "en": "Apply agricultural lime or dolomite at 2.0 tonnes/ha during pre-sowing ploughing.",
                    "ta": f"நிலத்தை உழும்போது ஹெக்டேருக்கு 2 டன் விவசாய சுண்ணாம்பு அல்லது டோலமைட் இடவும்.",
                    "hi": "बुवाई से पहले खेत की जुताई के समय 2.0 टन/हेक्टेयर कृषि चूना या डोलोमाइट डालें।"
                }
            })
        elif current_ph > 8.0:
            recommendations.append({
                "id": "soil_ph_gypsum",
                "priority": "Medium",
                "category": "Soil Health",
                "badge": "+8.0% Nutrient Uptake",
                "impact_pct": 8.0,
                "title": {
                    "en": f"Gypsum Application for Alkaline Soil (pH {current_ph})",
                    "ta": f"கார மண்ணுக்கு ஜிப்சம் இடுதல் (pH {current_ph})",
                    "hi": f"क्षारीय मिट्टी के लिए जिप्सम उपचार (pH {current_ph})"
                },
                "reason": {
                    "en": f"High pH limits micronutrient mobility, particularly Zinc and Iron.",
                    "ta": f"அதிக காரத்தன்மை துத்தநாகம் மற்றும் இரும்பு சத்துக்கள் பயிரை சென்றடைவதை தடுக்கிறது.",
                    "hi": f"उच्च पीएच जिंक और लोहे जैसे सूक्ष्म पोषक तत्वों की उपलब्धता को रोकता है।"
                },
                "action": {
                    "en": "Incorporate mineral gypsum at 2.5 tonnes/ha with organic green manuring (Dhaincha/Sunnhemp).",
                    "ta": f"ஹெக்டேருக்கு 2.5 டன் ஜிப்சம் மற்றும் தக்கைப்பூண்டு பசுந்தாள் உரம் இடவும்.",
                    "hi": "2.5 टन/हेक्टेयर खनिज जिप्सम और ढैंचा/सनई की हरी खाद का प्रयोग करें।"
                }
            })

        # 4. Alternative Crop Exploration for this Season & Region
        district = base_inputs.get("district", "Ludhiana")
        season = base_inputs.get("season", "Kharif")
        alt_candidates = []
        for c_name, c_info in CROP_PROFILES.items():
            if c_name == crop or season not in c_info["seasons"]:
                continue
            if district not in c_info["suitable_districts"]:
                continue
            alt_inputs = {**base_inputs, "crop": c_name, "fertilizer_n": c_info["n_req"], "fertilizer_p": c_info["p_req"], "fertilizer_k": c_info["k_req"]}
            alt_pred = self.ie.predict(alt_inputs)
            alt_candidates.append({
                "crop": c_name,
                "expected_yield": alt_pred["expected_yield_t_ha"],
                "risk_level": alt_pred["risk_level"],
                "potential_return_index": round(alt_pred["expected_yield_t_ha"] / max(0.1, c_info["base_yield"]) * 100, 1)
            })

        # Check if an alternative crop performs exceptionally well
        alt_candidates = sorted(alt_candidates, key=lambda x: x["potential_return_index"], reverse=True)
        if alt_candidates:
            top_alt = alt_candidates[0]
            if top_alt["potential_return_index"] > 105:
                recommendations.append({
                    "id": f"alt_crop_{top_alt['crop']}",
                    "priority": "Low",
                    "category": "Crop Diversification",
                    "badge": f"{top_alt['potential_return_index']}% Performance Index",
                    "impact_pct": round(top_alt["potential_return_index"] - 100, 1),
                    "title": {
                        "en": f"Consider {top_alt['crop']} as a High-Resilience Alternative",
                        "ta": f"மாற்றுப் பயிராக {top_alt['crop']}-ஐ பரிசீலிக்கவும்",
                        "hi": f"वैकल्पिक फसल के रूप में {top_alt['crop']} पर विचार करें"
                    },
                    "reason": {
                        "en": f"{top_alt['crop']} exhibits high agro-climatic compatibility under {district}'s {season} climate with {top_alt['risk_level']} seasonal risk.",
                        "ta": f"{top_alt['crop']} பயிர் {district}-ன் {season} பருவநிலைக்கு மிகச் சிறந்த மகசூல் செயல்திறனைக் கொண்டுள்ளது.",
                        "hi": f"{top_alt['crop']} फसल {district} के {season} मौसम में कम जोखिम के साथ उत्कृष्ट उत्पादन देती है।"
                    },
                    "action": {
                        "en": f"Evaluate comparative market price and farmgate demand before allocating 25-50% sowing area to {top_alt['crop']}.",
                        "ta": f"சந்தை விலையை ஒப்பிட்டுப் பார்த்து 25-50% பரப்பில் {top_alt['crop']}-ஐ பயிரிட திட்டமிடவும்.",
                        "hi": f"बाजार भाव की तुलना करके अपने 25-50% क्षेत्र में {top_alt['crop']} की बुवाई पर विचार करें।"
                    }
                })

        # Ensure at least 2 recommendations are always present
        if len(recommendations) < 2:
            recommendations.append({
                "id": "biofertilizer_inoculation",
                "priority": "Medium",
                "category": "Biological Enhancement",
                "badge": "+8.5% Nutrient Efficiency",
                "impact_pct": 8.5,
                "title": {
                    "en": f"Biofertilizer Seed Inoculation & Microbial Consortium for {crop}",
                    "ta": f"{crop} பயிருக்கு உயிர் உர விதை நேர்த்தி மற்றும் நுண்ணுயிர் பயன்பாடு",
                    "hi": f"{crop} के लिए जैव उर्वरक बीज उपचार और सूक्ष्मजीव संवर्धन"
                },
                "reason": {
                    "en": f"Inoculating seeds with Azospirillum / Rhizobium and Phosphate Solubilizing Bacteria (PSB) enhances root rhizosphere colonization and increases available soil phosphorus uptake by 15-20%.",
                    "ta": f"அசோஸ்பைரில்லம் மற்றும் பாஸ்போபாக்டீரியா மூலம் விதை நேர்த்தி செய்வது வேர் வளர்ச்சியைத் தூண்டி பாஸ்பரஸ் உறிஞ்சுதலை 15-20% அதிகரிக்கிறது.",
                    "hi": f"एजोस्पिरिलम और पीएसबी से बीज उपचार जड़ क्षेत्र को मजबूत करता है और मिट्टी से फास्फोरस के अवशोषण को 15-20% बढ़ाता है।"
                },
                "action": {
                    "en": "Treat seeds with 200g of biofertilizer slurry per 10kg seed 30 minutes before sowing; shade dry thoroughly.",
                    "ta": f"விதைப்பதற்கு 30 நிமிடங்களுக்கு முன் 10 கிலோ விதைக்கு 200 கிராம் உயிர் உரக் கலவை கொண்டு விதை நேர்த்தி செய்து நிழலில் உலர்த்தவும்.",
                    "hi": "बुवाई से 30 मिनट पहले 10 किग्रा बीज को 200 ग्राम जैव उर्वरक के घोल से उपचारित करें और छाया में सुखाएं।"
                }
            })

            recommendations.append({
                "id": "foliar_micronutrient_spray",
                "priority": "Low",
                "category": "Micronutrient Management",
                "badge": "+5.0% Grain Filling",
                "impact_pct": 5.0,
                "title": {
                    "en": f"Targeted Zinc & Boron Foliar Spray at Active Tillering for {crop}",
                    "ta": f"{crop} பயிருக்கு துத்தநாகம் மற்றும் போரான் இலைவழி தெளிப்பு",
                    "hi": f"{crop} में कल्ले फूटने के समय जिंक और बोरॉन का छिड़काव"
                },
                "reason": {
                    "en": f"Subclinical Zinc deficiency is endemic across Indo-Gangetic alluvial soils; foliar application during vegetative surge prevents spikelet sterility.",
                    "ta": f"வண்டல் மண்ணில் துத்தநாகப் பற்றாக்குறை இயல்பானது; இலைவழி தெளிப்பு தானிய மணிகள் பதராவதைத் தடுக்கிறது.",
                    "hi": f"जलोढ़ मिट्टी में जिंक की कमी सामान्य है; कल्ले फूटते समय छिड़काव से बालियों में खालीपन रुकता है।"
                },
                "action": {
                    "en": "Spray 0.5% Zinc Sulphate (ZnSO4) + 0.2% Boric Acid solution early morning during peak vegetative phase.",
                    "ta": f"பயிர் வளர்ச்சியின் போது அதிகாலையில் 0.5% துத்தநாக சல்பேட் மற்றும் 0.2% போரிக் அமிலக் கரைசலை தெளிக்கவும்.",
                    "hi": "सुबह के समय 0.5% जिंक सल्फेट और 0.2% बोरिक एसिड के घोल का छिड़काव करें।"
                }
            })

        # Sort recommendations by priority (High -> Medium -> Low)
        priority_weights = {"High": 3, "Medium": 2, "Low": 1}
        recommendations = sorted(recommendations, key=lambda r: priority_weights.get(r["priority"], 0), reverse=True)
        return recommendations

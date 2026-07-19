import ai from "../config/config.js";

export const extractStructuredData = async (context, filename) => {

    const prompt = `
You are an expert financial disclosure extraction engine.

Your task is to extract ONLY the information explicitly present in the provided document context.

Rules:

- Return ONLY valid JSON.
- Do NOT wrap the JSON inside markdown.
- Do NOT include explanations, comments or notes.
- Do NOT guess or infer missing values.
- If a value is unavailable, return null.
- Use only information present in the context.

Allowed values:

event_category:
- dividend_declaration
- credit_rating_action
- financial_results
- board_composition_change
- other

extraction_confidence:
- high
- medium
- low

Return JSON in EXACTLY the following schema:

{
  "extractions": [
    {
      "source_filename": "${filename}",
      "company_name": "",
      "stock_ticker": null,
      "disclosure_date": null,
      "event_category": "other",
      "figures": {
        "dividend_per_share_inr": null,
        "dividend_type": null,
        "credit_rating_before": null,
        "credit_rating_after": null,
        "credit_rating_agency": null,
        "revenue_inr_crore": null,
        "profit_after_tax_inr_crore": null,
        "financial_period": null,
        "board_change_count": null
      },
      "extraction_confidence": "medium"
    }
  ],
  "summary": {
    "total_documents_processed": 1,
    "documents_by_category": {
      "dividend_declaration": 0,
      "credit_rating_action": 0,
      "financial_results": 0,
      "board_composition_change": 0,
      "other": 0
    },
    "documents_that_failed_processing": []
  }
}

Document Context:

${context}
`;

    //didnt call ai directly from controller because that would ruin the architecture, since controller is for specific work only
    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
    });

    console.log("Gemini Response:", response);

    if (!response) {
        throw new Error("No response received from Gemini.");
    }

    return response.text;

};
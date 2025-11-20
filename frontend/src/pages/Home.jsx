import { useState, useRef } from "react";

export default function Home() {
  const [pdf, setPdf] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [rules, setRules] = useState(["", "", ""]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const fileInputRef = useRef(null);

  // Predefined rules for quick selection
  const predefinedRules = [
    "The document must have a purpose section.",
    "The document must mention at least one date.",
    "The document must define at least one term.",
    "The document must mention who is responsible.",
    "The document must list any requirements."
  ];

  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdf(file);
      setPdfUrl(URL.createObjectURL(file));
      setActiveTab("preview");
    }
  };

  const handleRuleChange = (index, value) => {
    const updated = [...rules];
    updated[index] = value;
    setRules(updated);
  };

  const addPredefinedRule = (rule) => {
    const emptyIndex = rules.findIndex(r => r.trim() === "");
    if (emptyIndex !== -1) {
      handleRuleChange(emptyIndex, rule);
    } else {
      setRules([...rules, rule]);
    }
  };

  const removeRule = (index) => {
    const updated = rules.filter((_, i) => i !== index);
    setRules([...updated, ""]); // Keep 3 inputs but remove the specific one
  };

  const clearAllRules = () => {
    setRules(["", "", ""]);
  };

  const handleSubmit = async () => {
    if (!pdf) return alert("Please upload a PDF");
    const activeRules = rules.filter(r => r.trim() !== "");
    if (activeRules.length === 0) return alert("Please add at least one rule");

    setLoading(true);
    setResults([]);

    const formData = new FormData();
    formData.append("pdf", pdf);
    formData.append("rules", JSON.stringify(activeRules));

    try {
      const res = await fetch("http://localhost:5000/api/check", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResults(data.results || []);
      setActiveTab("results");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            NIYAMR AI
          </h1>
          <p className="text-gray-600 text-lg">Intelligent PDF Compliance Checker</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Upload & Rules */}
          <div className="space-y-6">
            {/* PDF Upload Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Document</h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors duration-200">
                {!pdf ? (
                  <div>
                    <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-gray-600 mb-2">Drag & drop your PDF here</p>
                    <p className="text-sm text-gray-500 mb-4">or</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                      Browse Files
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-red-500 font-bold text-sm">PDF</span>
                      </div>
                      <div>
                        <p className="text-gray-800 font-medium text-sm">{pdf.name}</p>
                        <p className="text-gray-500 text-xs">{(pdf.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setPdf(null);
                        setPdfUrl(null);
                        setActiveTab("upload");
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Rules Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Define Rules</h2>
                <button
                  onClick={clearAllRules}
                  className="text-sm text-gray-500 hover:text-red-500 transition-colors duration-200"
                >
                  Clear All
                </button>
              </div>

              {/* Custom Rules Input */}
              <div className="space-y-3  mb-5">
                <h3 className="text-sm font-medium text-gray-700">Custom Rules</h3>
                {rules.map((rule, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`Rule ${i + 1}`}
                      value={rule}
                      onChange={(e) => handleRuleChange(i, e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    {rule.trim() && (
                      <button
                        onClick={() => removeRule(i)}
                        className="px-3 text-gray-400 hover:text-red-500 transition-colors duration-200"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Predefined Rules */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Rules</h3>
                <div className="grid grid-cols-1 gap-2">
                  {predefinedRules.map((rule, index) => (
                    <button
                      key={index}
                      onClick={() => addPredefinedRule(rule)}
                      className="text-left p-3 text-sm bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200"
                    >
                      {rule}
                    </button>
                  ))}
                </div>
              </div>

              
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading || !pdf}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Analyzing Document...
                </div>
              ) : (
                "Check Compliance"
              )}
            </button>
          </div>

          {/* Right Column - Preview & Results */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab("preview")}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors duration-200 ${
                  activeTab === "preview"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                PDF Preview
              </button>
              <button
                onClick={() => setActiveTab("results")}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors duration-200 ${
                  activeTab === "results"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Results
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "preview" && (
              <div>
              <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                {pdfUrl ? (
                  <iframe
                    src={pdfUrl}
                    className="w-full h-full rounded-lg"
                    title="PDF Preview"
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>Upload a PDF to preview</p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading || !pdf}
              className="w-full mt-10 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Analyzing Document...
                </div>
              ) : (
                "Check Compliance"
              )}
            </button>

              </div>
              
            )}
            

            {activeTab === "results" && (
              <div>
                {results.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-800">Compliance Results</h3>
                      <div className="text-sm text-gray-600">
                        {results.filter(r => r.status === "pass").length} of {results.length} rules passed
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {results.map((r, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800 text-sm mb-1">{r.rule}</h4>
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  r.status === "pass" 
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}>
                                  {r.status.toUpperCase()}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Confidence: {r.confidence}%
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {r.evidence && (
                            <div className="mb-2">
                              <p className="text-xs text-gray-600 mb-1">Evidence:</p>
                              <p className="text-sm bg-gray-50 rounded-lg p-3">{r.evidence}</p>
                            </div>
                          )}
                          
                          {r.reasoning && (
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Reasoning:</p>
                              <p className="text-sm text-gray-700">{r.reasoning}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>No results yet. Upload a PDF and check compliance to see results.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
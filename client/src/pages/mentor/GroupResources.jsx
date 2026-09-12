import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import API_URL from "../../config";

export default function GroupResources() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [filterQuery, setFilterQuery] = useState("");

  const userRole = localStorage.getItem("userRole")?.toUpperCase() || "USER";
  const isMentor = userRole === "MENTOR";

  const loadGroup = async () => {
    try {
      const res = await fetch(`${API_URL}/api/groups/${groupId}`);
      const data = await res.json();
      if (res.ok) setGroup(data);
    } catch (err) {
      console.error("Failed to load group resources", err);
    }
  };

  useEffect(() => {
    loadGroup();
  }, [groupId]);

  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!resourceTitle.trim() || !resourceUrl.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/groups/add-resource`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          title: resourceTitle.trim(),
          url: resourceUrl.trim(),
        }),
      });

      if (res.ok) {
        setResourceTitle("");
        setResourceUrl("");
        loadGroup();
      } else {
        alert("Failed to add resource");
      }
    } catch (err) {
      alert("Error adding resource");
    }
  };

  if (!group) return <div style={{ padding: "40px" }}>Loading Resources...</div>;

  const resources = group.resources || [];
  const filteredResources = resources.filter((r) =>
    r.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
    r.url.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <Navbar />

      <div style={{ padding: "40px", maxWidth: "1000px", margin: "0 auto" }}>
        {/* Navigation Breadcrumb */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
          <button
            onClick={() => navigate(/group/)}
            style={{
              padding: "8px 16px",
              cursor: "pointer",
              border: "1px solid #ccc",
              borderRadius: "6px",
              background: "#fff",
              fontWeight: "bold",
            }}
          >
            &larr; Back to Group Space
          </button>
        </div>

        <div style={{ background: "white", padding: "30px", borderRadius: "12px", border: "1px solid #e1e4e8", marginBottom: "30px" }}>
          <h1 style={{ margin: "0 0 8px 0" }}>📚 Resource Library</h1>
          <p style={{ color: "#666", marginTop: 0 }}>
            Curated study materials, Google Drive links, PDF documents, and recordings for <strong>{group.name}</strong>.
          </p>

          <input
            type="text"
            placeholder="🔍 Search resources by title or URL..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              boxSizing: "border-box",
              fontSize: "14px",
              marginTop: "10px",
            }}
          />
        </div>

        {/* Mentor Add Resource Box */}
        {isMentor && (
          <div style={{ background: "white", padding: "25px", borderRadius: "12px", border: "1px solid #e1e4e8", marginBottom: "30px" }}>
            <h3 style={{ marginTop: 0 }}>+ Upload New Resource or Link</h3>
            <form onSubmit={handleAddResource} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <input
                type="text"
                placeholder="Resource Title (e.g., Week 1 React Notes / Drive Folder)"
                value={resourceTitle}
                onChange={(e) => setResourceTitle(e.target.value)}
                required
                style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
              />
              <input
                type="url"
                placeholder="Link URL (https://drive.google.com/... or docs link)"
                value={resourceUrl}
                onChange={(e) => setResourceUrl(e.target.value)}
                required
                style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
              />
              <button
                type="submit"
                style={{
                  padding: "10px 20px",
                  background: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  alignSelf: "flex-start",
                }}
              >
                Upload Resource
              </button>
            </form>
          </div>
        )}

        {/* Resource List Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {filteredResources.length > 0 ? (
            filteredResources.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "10px",
                  border: "1px solid #e1e4e8",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                }}
              >
                <div>
                  <h4 style={{ margin: "0 0 5px 0", fontSize: "16px", color: "#333" }}>{item.title}</h4>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#007bff", fontSize: "14px", textDecoration: "none", wordBreak: "break-all" }}
                  >
                    {item.url}
                  </a>
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: "8px 16px",
                    background: "#007bff",
                    color: "white",
                    borderRadius: "6px",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "13px",
                    whiteSpace: "nowrap",
                    marginLeft: "20px",
                  }}
                >
                  Open Resource &rarr;
                </a>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "50px", background: "white", borderRadius: "10px", color: "#888" }}>
              No resources found. {isMentor ? "Add one using the form above!" : "Check back later when your mentor shares materials."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

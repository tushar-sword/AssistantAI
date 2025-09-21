import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../../src/components/Navbar/Navbar";
import Footer from "../../src/components/Footer/Footer";
import { FiCopy } from "react-icons/fi";
import { fetchContentByProductId } from "../../src/Redux/contentSlice";
import "./ContentGenerationPage.css";

const ContentGenerationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedContent, isLoading, isError, message } = useSelector(
    (state) => state.content
  );

  const [copied, setCopied] = useState("");

  useEffect(() => {
    if (id) dispatch(fetchContentByProductId(id));
  }, [dispatch, id]);

  const handleCopy = async (text, label) => {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="content-gen-page">
          <p>Loading generated content...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <Navbar />
        <div className="content-gen-page">
          <p className="error">{message}</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!selectedContent) {
    return (
      <>
        <Navbar />
        <div className="content-gen-page">
          <p>No content found for this product.</p>
        </div>
        <Footer />
      </>
    );
  }

  //Defensive: sometimes only rawText is available - will update this
  const { content, rawText } = selectedContent;
  const platforms =
    content && typeof content === "object" ? Object.keys(content) : [];

  return (
    <>
      <Navbar />
      <div className="content-gen-page">
        <div className="gen-header">
          <button className="btn-back" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h2>Generated Content</h2>
          <p className="small">
            Use the items below to post on each platform
          </p>
        </div>

        {platforms.length === 0 ? (
          <div className="raw-text-fallback">
            <h3>Raw AI Output</h3>
            <pre className="raw-text-block">
              {rawText || "No structured content yet."}
            </pre>
          </div>
        ) : (
          platforms.map((platform) => {
            const data = content[platform];
            return (
              <section className="platform-section" key={platform}>
                <h3>{platform}</h3>

                <div className="section-grid">
                  <div className="media-column">
                    <h4>Posters</h4>
                    <div className="poster-grid">
                      {Array.isArray(data?.posters) && data.posters.length > 0 ? (
                        data.posters.map((src, idx) => (
                          <div key={idx} className="poster-item">
                            <img
                              src={src}
                              alt={`${platform} poster ${idx + 1}`}
                            />
                            <div className="poster-actions">
                              <a
                                href={src}
                                download={`${id}-${platform}-poster-${idx + 1}.jpg`}
                                className="btn-outline"
                              >
                                Download
                              </a>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="muted">No posters generated.</p>
                      )}
                    </div>

                    <h4 style={{ marginTop: 12 }}>Reels / Videos</h4>
                    <div className="reel-grid">
                      {Array.isArray(data?.reels) && data.reels.length > 0 ? (
                        data.reels.map((src, idx) => (
                          <video key={idx} src={src} controls width="320" />
                        ))
                      ) : (
                        <p className="muted">No reels generated.</p>
                      )}
                    </div>
                  </div>

                  <div className="text-column">
                    <h4>Suggested Text / Captions</h4>
                    {Array.isArray(data?.descriptions) &&
                    data.descriptions.length > 0 ? (
                      <ul className="desc-list">
                        {data.descriptions.map((d, i) => (
                          <li key={i} className="desc-item">
                            <p>{d}</p>
                            <div className="desc-actions">
                              <button
                                className="icon-btn"
                                onClick={() =>
                                  handleCopy(d, `${platform}-desc-${i}`)
                                }
                                aria-label="Copy text"
                              >
                                <FiCopy size={16} />
                              </button>
                              {copied === `${platform}-desc-${i}` && (
                                <span className="copied">Copied!</span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="muted">No text generated.</p>
                    )}
                  </div>
                </div>
              </section>
            );
          })
        )}
      </div>
      <Footer />
    </>
  );
};

export default ContentGenerationPage;

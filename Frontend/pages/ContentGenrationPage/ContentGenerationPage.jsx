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

  if (isLoading) return (
    <>
      <Navbar />
      <div className="content-gen-page">
        <p>Loading generated captions...</p>
      </div>
      <Footer />
    </>
  );

  if (isError) return (
    <>
      <Navbar />
      <div className="content-gen-page">
        <p className="error">{message}</p>
      </div>
      <Footer />
    </>
  );

  if (!selectedContent) return (
    <>
      <Navbar />
      <div className="content-gen-page">
        <p>No content found for this product.</p>
      </div>
      <Footer />
    </>
  );

  const { captions } = selectedContent;

  return (
    <>
      <Navbar />
      <div className="content-gen-page">
        <div className="gen-header">
          <button className="btn-back" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h2>Generated Captions</h2>
          <p className="small">
            Copy suggested captions for each platform
          </p>
        </div>

        {captions ? (
          Object.entries(captions).map(([platform, texts]) => (
            <section className="platform-section" key={platform}>
              <h3>{platform.charAt(0).toUpperCase() + platform.slice(1)}</h3>
              {texts?.length > 0 ? (
                <ul className="caption-list">
                  {texts.map((text, idx) => (
                    <li key={idx} className="caption-item">
                      <p>{text}</p>
                      <button
                        className="icon-btn"
                        onClick={() => handleCopy(text, `${platform}-${idx}`)}
                        aria-label="Copy caption"
                      >
                        <FiCopy size={16} />
                      </button>
                      {copied === `${platform}-${idx}` && (
                        <span className="copied">Copied!</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No captions generated.</p>
              )}
            </section>
          ))
        ) : (
          <p className="muted">No captions found.</p>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ContentGenerationPage;

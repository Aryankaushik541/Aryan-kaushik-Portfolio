import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

import {
  streamAiChat,
  clearToken,
  getToken,
} from "../utils/api";

import SEO from "../components/SEO";
import "./AIChat.css";


function AsteriskMark({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 2v20M4.5 6l15 12M19.5 6l-15 12"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}


function greeting() {
  const hour = new Date().getHours();

  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";

  return "Working late";
}


let idCounter = 0;

function nextId() {
  idCounter += 1;
  return `m_${Date.now()}_${idCounter}`;
}


const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 5;


export default function AIChat() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState([]);

  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");

  const textareaRef = useRef(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  const abortRef = useRef(null);
  const frameRef = useRef(null);


  /*
   * ------------------------------------------------------------------
   * AUTH CHECK
   * ------------------------------------------------------------------
   */

  useEffect(() => {
    const token = getToken();

    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);


  /*
   * ------------------------------------------------------------------
   * TEXTAREA AUTO HEIGHT
   * ------------------------------------------------------------------
   */

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";

    const height = Math.min(
      textarea.scrollHeight,
      200
    );

    textarea.style.height = `${height}px`;
  }, [input]);


  /*
   * ------------------------------------------------------------------
   * AUTO SCROLL
   * ------------------------------------------------------------------
   */

  useEffect(() => {
    const container = scrollRef.current;

    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);


  /*
   * ------------------------------------------------------------------
   * CLEANUP
   * ------------------------------------------------------------------
   */

  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);


  /*
   * ------------------------------------------------------------------
   * SIGN OUT
   * ------------------------------------------------------------------
   */

  const handleSignOut = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    clearToken();

    setStreaming(false);
    setError("");

    navigate("/login", { replace: true });
  }, [navigate]);


  /*
   * ------------------------------------------------------------------
   * NEW CHAT
   * ------------------------------------------------------------------
   */

  const handleNewChat = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    setMessages([]);
    setInput("");
    setFiles([]);
    setError("");
    setStreaming(false);

    textareaRef.current?.focus();
  }, []);


  /*
   * ------------------------------------------------------------------
   * FILE SELECTION
   * ------------------------------------------------------------------
   */

  const handleFiles = useCallback((event) => {
    const selected = Array.from(
      event.target.files || []
    );

    event.target.value = "";

    if (!selected.length) return;

    const validFiles = [];
    const rejectedFiles = [];

    for (const file of selected) {
      if (validFiles.length >= MAX_FILES) {
        rejectedFiles.push(file);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        rejectedFiles.push(file);
        continue;
      }

      validFiles.push(file);
    }

    setFiles(validFiles);

    if (rejectedFiles.length > 0) {
      setError(
        `You can attach up to ${MAX_FILES} files, with a maximum size of 5 MB per file.`
      );
    } else {
      setError("");
    }
  }, []);


  /*
   * ------------------------------------------------------------------
   * REMOVE FILE
   * ------------------------------------------------------------------
   */

  const removeFile = useCallback((index) => {
    setFiles((previous) =>
      previous.filter(
        (_, fileIndex) => fileIndex !== index
      )
    );
  }, []);


  /*
   * ------------------------------------------------------------------
   * SEND MESSAGE
   * ------------------------------------------------------------------
   */

  const sendMessage = useCallback(
    async (value) => {
      if (streaming) return;

      const selectedFiles = [...files];

      const text = value.trim();

      const finalMessage =
        text ||
        (
          selectedFiles.length
            ? "Please analyze the attached file(s)."
            : ""
        );

      if (!finalMessage) return;


      /*
       * Clear previous error.
       */

      setError("");


      /*
       * User message.
       */

      const attachmentText =
        selectedFiles.length > 0
          ? `\n\nAttached: ${selectedFiles
              .map((file) => file.name)
              .join(", ")}`
          : "";


      const userMessage = {
        id: nextId(),
        role: "user",
        content: `${finalMessage}${attachmentText}`,
      };


      /*
       * Assistant placeholder.
       */

      const assistantId = nextId();

      const assistantMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
      };


      /*
       * Send clean history to backend.
       */

      const history = [
        ...messages,
        userMessage,
      ].map(({ role, content }) => ({
        role,
        content,
      }));


      /*
       * Immediately update UI.
       */

      setMessages((previous) => [
        ...previous,
        userMessage,
        assistantMessage,
      ]);

      setInput("");
      setFiles([]);
      setStreaming(true);


      /*
       * Abort controller.
       */

      const controller = new AbortController();

      abortRef.current = controller;


      /*
       * Buffer streaming tokens before updating React.
       * This prevents excessive re-renders.
       */

      let deltaBuffer = "";


      const flushDeltas = () => {
        if (!deltaBuffer) return;

        const delta = deltaBuffer;

        deltaBuffer = "";

        setMessages((previous) =>
          previous.map((message) => {
            if (message.id !== assistantId) {
              return message;
            }

            return {
              ...message,
              content:
                message.content + delta,
            };
          })
        );
      };


      const scheduleFlush = () => {
        if (frameRef.current !== null) {
          return;
        }

        frameRef.current =
          requestAnimationFrame(() => {
            frameRef.current = null;
            flushDeltas();
          });
      };


      try {
        await streamAiChat(history, {
          files: selectedFiles,
          signal: controller.signal,


          /*
           * OpenAI text delta
           */

          onDelta: (text) => {
            if (
              typeof text !== "string" ||
              !text
            ) {
              return;
            }

            deltaBuffer += text;

            scheduleFlush();
          },


          /*
           * Stream completed
           */

          onDone: () => {
            if (frameRef.current !== null) {
              cancelAnimationFrame(
                frameRef.current
              );

              frameRef.current = null;
            }

            flushDeltas();

            setStreaming(false);

            abortRef.current = null;
          },


          /*
           * Stream error
           */

          onError: (message) => {
            if (frameRef.current !== null) {
              cancelAnimationFrame(
                frameRef.current
              );

              frameRef.current = null;
            }

            flushDeltas();

            setStreaming(false);

            abortRef.current = null;

            const readableError =
              typeof message === "string" &&
              message.trim()
                ? message.trim()
                : "The AI service could not complete the response.";

            setError(readableError);
          },
        });
      } catch (err) {
        if (
          err?.name === "AbortError" ||
          controller.signal.aborted
        ) {
          return;
        }

        if (frameRef.current !== null) {
          cancelAnimationFrame(
            frameRef.current
          );

          frameRef.current = null;
        }

        flushDeltas();

        setStreaming(false);

        abortRef.current = null;

        setError(
          err?.message ||
            "The AI service could not complete the response."
        );
      } finally {
        if (!controller.signal.aborted) {
          setStreaming(false);
        }

        if (
          abortRef.current === controller
        ) {
          abortRef.current = null;
        }
      }
    },
    [
      files,
      messages,
      streaming,
    ]
  );


  /*
   * ------------------------------------------------------------------
   * FORM SUBMIT
   * ------------------------------------------------------------------
   */

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      sendMessage(input);
    },
    [input, sendMessage]
  );


  /*
   * ------------------------------------------------------------------
   * KEYBOARD
   * ------------------------------------------------------------------
   */

  const handleKeyDown = useCallback(
    (event) => {
      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();

        sendMessage(input);
      }
    },
    [input, sendMessage]
  );


  /*
   * ------------------------------------------------------------------
   * STOP GENERATION
   * ------------------------------------------------------------------
   */

  const handleStop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    if (frameRef.current !== null) {
      cancelAnimationFrame(
        frameRef.current
      );

      frameRef.current = null;
    }

    setStreaming(false);
  }, []);


  /*
   * ------------------------------------------------------------------
   * UI HELPERS
   * ------------------------------------------------------------------
   */

  const isEmpty = messages.length === 0;

  const canSend =
    !streaming &&
    (
      input.trim().length > 0 ||
      files.length > 0
    );


  /*
   * ------------------------------------------------------------------
   * RENDER
   * ------------------------------------------------------------------
   */

  return (
    <div className="aic-shell">

      <SEO
        title="AI Assistant"
        description="Chat with the AI assistant."
        path="/ai"
      />


      {/* ============================================================
          SIDEBAR
      ============================================================ */}

      <aside className="aic-sidebar">

        <div className="aic-sidebar-top">

          <div className="aic-brand">

            <span className="aic-brand-mark">
              <AsteriskMark size={18} />
            </span>

            <span className="aic-brand-name">
              Assistant
            </span>

          </div>


          <button
            className="aic-new-chat"
            onClick={handleNewChat}
            type="button"
            disabled={streaming}
          >
            <span className="aic-new-chat-icon">
              ＋
            </span>

            New chat
          </button>

        </div>


        <div className="aic-sidebar-bottom">

          <button
            className="aic-sidebar-link"
            onClick={() => navigate("/admin")}
            type="button"
          >
            ← Back to dashboard
          </button>


          <button
            className="aic-sidebar-link aic-signout"
            onClick={handleSignOut}
            type="button"
          >
            Sign out
          </button>

        </div>

      </aside>


      {/* ============================================================
          MAIN
      ============================================================ */}

      <main className="aic-main">


        {/* ==========================================================
            EMPTY STATE
        ========================================================== */}

        {isEmpty ? (

          <div className="aic-empty">

            <span className="aic-empty-mark">
              <AsteriskMark size={34} />
            </span>


            <h1 className="aic-empty-title">
              {greeting()}.
              <br />
              What can I help with?
            </h1>


            <form
              className="aic-composer aic-composer-center"
              onSubmit={handleSubmit}
            >

              <textarea
                ref={textareaRef}
                className="aic-textarea"
                placeholder="How can I help you today?"
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                onKeyDown={handleKeyDown}
                rows={1}
                autoFocus
                disabled={streaming}
              />


              <input
                ref={fileInputRef}
                className="aic-file-input"
                type="file"
                multiple
                accept=".txt,.md,.markdown,.csv,.json,.pdf,image/*"
                onChange={handleFiles}
              />


              <button
                className="aic-attach"
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={streaming}
                aria-label="Attach files"
              >
                &#128206;
              </button>


              <button
                className="aic-send"
                type="submit"
                disabled={!canSend}
                aria-label="Send message"
              >
                ↑
              </button>

            </form>


            {/* Files */}

            {files.length > 0 && (

              <div className="aic-file-list">

                {files.map((file, index) => (

                  <div
                    key={`${file.name}-${file.size}-${index}`}
                    className="aic-file-item"
                  >

                    <span>
                      {file.name}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        removeFile(index)
                      }
                      aria-label={`Remove ${file.name}`}
                    >
                      ×
                    </button>

                  </div>

                ))}

              </div>

            )}


            {/* Error */}

            {error && (

              <p
                className="aic-error"
                role="alert"
              >
                {error}
              </p>

            )}

          </div>

        ) : (

          <>
            {/* ======================================================
                MESSAGES
            ====================================================== */}

            <div
              className="aic-messages"
              ref={scrollRef}
            >

              <div className="aic-messages-inner">

                {messages.map((message) => (

                  <div
                    key={message.id}
                    className={`aic-msg aic-msg-${message.role}`}
                  >

                    {message.role === "assistant" && (

                      <span className="aic-msg-avatar">
                        <AsteriskMark size={14} />
                      </span>

                    )}


                    <div className="aic-msg-bubble">

                      {message.role === "assistant" ? (

                        message.content ? (

                          <ReactMarkdown>
                            {message.content}
                          </ReactMarkdown>

                        ) : (

                          <span
                            className="aic-typing"
                            aria-label="Assistant is typing"
                          >
                            <span />
                            <span />
                            <span />
                          </span>

                        )

                      ) : (

                        <p>
                          {message.content}
                        </p>

                      )}

                    </div>

                  </div>

                ))}


                {error && (

                  <p
                    className="aic-error aic-error-inline"
                    role="alert"
                  >
                    {error}
                  </p>

                )}

              </div>

            </div>


            {/* ======================================================
                BOTTOM COMPOSER
            ====================================================== */}

            <div className="aic-composer-wrap">

              <form
                className="aic-composer"
                onSubmit={handleSubmit}
              >

                <textarea
                  ref={textareaRef}
                  className="aic-textarea"
                  placeholder={
                    streaming
                      ? "Generating response..."
                      : "Reply…"
                  }
                  value={input}
                  onChange={(event) =>
                    setInput(event.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  rows={1}
                  disabled={streaming}
                />


                <input
                  ref={fileInputRef}
                  className="aic-file-input"
                  type="file"
                  multiple
                  accept=".txt,.md,.markdown,.csv,.json,.pdf,image/*"
                  onChange={handleFiles}
                />


                <button
                  className="aic-attach"
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  disabled={streaming}
                  aria-label="Attach files"
                >
                  &#128206;
                </button>


                {streaming ? (

                  <button
                    className="aic-send aic-stop"
                    type="button"
                    onClick={handleStop}
                    aria-label="Stop generating"
                  >
                    ■
                  </button>

                ) : (

                  <button
                    className="aic-send"
                    type="submit"
                    disabled={!canSend}
                    aria-label="Send message"
                  >
                    ↑
                  </button>

                )}

              </form>


              {/* Attached files */}

              {files.length > 0 && (

                <div className="aic-file-list">

                  {files.map((file, index) => (

                    <div
                      key={`${file.name}-${file.size}-${index}`}
                      className="aic-file-item"
                    >

                      <span>
                        {file.name}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          removeFile(index)
                        }
                        disabled={streaming}
                        aria-label={`Remove ${file.name}`}
                      >
                        ×
                      </button>

                    </div>

                  ))}

                </div>

              )}


              <p className="aic-disclaimer">
                AI can make mistakes. Please double-check responses.
              </p>

            </div>

          </>

        )}

      </main>

    </div>
  );
}

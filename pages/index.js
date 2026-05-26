import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";

function extractLovableUrl(text) {
  const match = text.match(/```lovable-url\s*([\s\S]*?)```/);
  if (!match) return null;
  try {
    const { prompt } = JSON.parse(match[1].trim());
    return `https://lovable.dev/create?prompt=${encodeURIComponent(prompt)}`;
  } catch {
    return null;
  }
}

function cleanMessage(text) {
  return text.replace(/```lovable-url[\s\S]*?```/g, "").trim();
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const lovableUrl = !isUser ? extractLovableUrl(message.content) : null;
  const displayText = !isUser ? cleanMessage(message.content) : message.content;

  return (
    <div className={`${styles.messageBubble} ${isUser ? styles.userBubble : styles.assistantBubble}`}>
      {!isUser && (
        <div className={styles.avatar}>C2S</div>
      )}
      <div className={styles.bubbleContent}>
        <div
          className={styles.bubbleText}
          dangerouslySetInnerHTML={{
            __html: displayText
              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
              .replace(/\*(.*?)\*/g, "<em>$1</em>")
              .replace(/\n/g, "<br/>")
              .replace(/- (.*?)(<br\/>|$)/g, "<li>$1</li>")
          }}
        />
        {lovableUrl && (
          <a
            href={lovableUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.lovableButton}
          >
            🚀 Build My Website Now
          </a>
        )}
      </div>
      {isUser && (
        <div className={`${styles.avatar} ${styles.userAvatar}`}>You</div>
      )}
    </div>
  );
}

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      sendMessage("", true);
    }
  }, []);

  async function sendMessage(userText, isInit = false) {
    const newMessages = isInit
      ? [{ role: "user", content: "Hello! I need a website." }]
      : [...messages, { role: "user", content: userText }];

    if (!isInit) {
      setMessages(newMessages);
      setInput("");
    }

    setIsLoading(true);
    setStreamingText("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error("API request failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullText += parsed.text;
                setStreamingText(fullText);
              }
            } catch {}
          }
        }
      }

      const assistantMessage = { role: "assistant", content: fullText };
      const updatedMessages = isInit
        ? [assistantMessage]
        : [...newMessages, assistantMessage];

      setMessages(updatedMessages);
      setStreamingText("");
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Oops! Something went wrong. Please try again.",
        },
      ]);
      setStreamingText("");
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <>
      <Head>
        <title>Chat2Site — Build your website in minutes</title>
        <meta name="description" content="Chat2Site by Brand Evangelist — get a professional website in under 5 minutes through conversation." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>C2S</span>
            <span className={styles.logoText}>Chat2Site</span>
          </div>
          <span className={styles.badge}>by Brand Evangelist™</span>
        </header>

        <div className={styles.chatContainer}>
          <div className={styles.messageList}>
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}

            {streamingText && (
              <div className={`${styles.messageBubble} ${styles.assistantBubble}`}>
                <div className={styles.avatar}>C2S</div>
                <div className={styles.bubbleContent}>
                  <div
                    className={styles.bubbleText}
                    dangerouslySetInnerHTML={{
                      __html: streamingText
                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                        .replace(/\*(.*?)\*/g, "<em>$1</em>")
                        .replace(/\n/g, "<br/>")
                    }}
                  />
                  <span className={styles.cursor}>▌</span>
                </div>
              </div>
            )}

            {isLoading && !streamingText && (
              <div className={`${styles.messageBubble} ${styles.assistantBubble}`}>
                <div className={styles.avatar}>C2S</div>
                <div className={styles.bubbleContent}>
                  <div className={styles.typing}>
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className={styles.inputForm} onSubmit={handleSubmit}>
            <textarea
              ref={inputRef}
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer here..."
              rows={1}
              disabled={isLoading}
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              →
            </button>
          </form>
        </div>

        <footer className={styles.footer}>
          Powered by <a href="https://brandevangelist.io" target="_blank" rel="noopener noreferrer">Brand Evangelist™</a> &amp; Claude AI
        </footer>
      </main>
    </>
  );
}

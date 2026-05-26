import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";

const STARTERS = [
  { emoji: "🚀", text: "Landing page for my business" },
  { emoji: "💡", text: "Build a working SaaS prototype" },
  { emoji: "🏆", text: "Design my blog or portfolio site" },
  { emoji: "🎯", text: "Create an internal dashboard" },
];

function extractLovableUrl(text) {
  const match = text.match(/```lovable-url\s*([\s\S]*?)```/);
  if (!match) return null;
  try {
    const { prompt } = JSON.parse(match[1].trim());
    return `https://lovable.dev/create?prompt=${encodeURIComponent(prompt)}`;
  } catch { return null; }
}

function cleanMessage(text) {
  return text.replace(/```lovable-url[\s\S]*?```/g, "").trim();
}

function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const lovableUrl = !isUser ? extractLovableUrl(message.content) : null;
  const displayText = !isUser ? cleanMessage(message.content) : message.content;

  return (
    <div className={`${styles.messageBubble} ${isUser ? styles.userBubble : ""}`}>
      {!isUser ? (
        <div className={styles.avatar}>
          <img src="/avatar.png" alt="Chat2Site" />
        </div>
      ) : (
        <div className={`${styles.avatar} ${styles.userAvatar}`}>You</div>
      )}
      <div className={styles.bubbleContent}>
        <div
          className={styles.bubbleText}
          dangerouslySetInnerHTML={{ __html: formatText(displayText) }}
        />
        {lovableUrl && (
          <a href={lovableUrl} target="_blank" rel="noopener noreferrer" className={styles.lovableButton}>
            🚀 Build My Website Now
          </a>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [theme, setTheme] = useState("light");
  const [started, setStarted] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  async function sendMessage(userText) {
    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setInput("");
    setStarted(true);
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
        for (const line of chunk.split("\n")) {
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

      setMessages([...newMessages, { role: "assistant", content: fullText }]);
      setStreamingText("");
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Something went wrong. Please try again!" }]);
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
        <meta name="description" content="5 questions, zero guesswork. Get a premium website instantly." />
      </Head>

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.logoMark}>C2S</span>
            <span className={styles.logoText}>Chat2Site</span>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.badge}>by Brand Evangelist™</span>
            <button
              className={styles.toggleButton}
              onClick={() => setTheme(t => t === "light" ? "dark" : "light")}
              aria-label="Toggle theme"
            >
              {theme === "light" ? "🌙 Dark" : "☀️ Light"}
            </button>
          </div>
        </header>

        {!started ? (
          <div className={styles.welcome}>
            <div className={styles.avatarWrap}>
              <img src="/avatar.png" alt="Chat2Site" />
            </div>
            <h1 className={styles.welcomeTitle}>Chat2Site</h1>
            <p className={styles.welcomeSubtitle}>
              Co-work your idea with our CMO-AI, choose features, and deploy to Lovable in minutes. 5 questions, zero guesswork — get a premium site with no hiring and no tech skills required.
            </p>
            <div className={styles.starters}>
              {STARTERS.map((s) => (
                <button
                  key={s.text}
                  className={styles.starterBtn}
                  onClick={() => sendMessage(s.text)}
                >
                  <span className={styles.starterEmoji}>{s.emoji}</span>
                  {s.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.chatContainer}>
            <div className={styles.messageList}>
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}
              {streamingText && (
                <div className={styles.messageBubble}>
                  <div className={styles.avatar}>
                    <img src="/avatar.png" alt="Chat2Site" />
                  </div>
                  <div className={styles.bubbleContent}>
                    <div
                      className={styles.bubbleText}
                      dangerouslySetInnerHTML={{ __html: formatText(streamingText) }}
                    />
                    <span className={styles.cursor}>▌</span>
                  </div>
                </div>
              )}
              {isLoading && !streamingText && (
                <div className={styles.messageBubble}>
                  <div className={styles.avatar}>
                    <img src="/avatar.png" alt="Chat2Site" />
                  </div>
                  <div className={styles.bubbleContent}>
                    <div className={styles.typing}>
                      <span /><span /><span />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

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
          <button type="submit" className={styles.sendButton} disabled={isLoading || !input.trim()} aria-label="Send">
            →
          </button>
        </form>

        <footer className={styles.footer}>
          Powered by <a href="https://brandevangelist.io" target="_blank" rel="noopener noreferrer">Brand Evangelist™</a> &amp; Claude AI
        </footer>
      </main>
    </>
  );
}

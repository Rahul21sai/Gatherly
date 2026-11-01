import { useState } from "react";
import Image from "next/image";
import { Heart, Lightbulb, Plus, Sparkles } from "lucide-react";
import type { EditablePlanProps } from "./props";

export function InspirationPanel({ plan, onUpdate }: EditablePlanProps) {
  const [savedOnly, setSavedOnly] = useState(false);
  const ideas = plan.ideas.filter(
    (existingIdea) => !savedOnly || existingIdea.saved,
  );
  return (
    <div className="tab-content">
      <div className="section-title">
        <span className="soft-icon">
          <Lightbulb size={23} />
        </span>
        <div>
          <h2>Make it unmistakably yours.</h2>
          <p>Little ideas inspired by your {plan.input.style.toLowerCase()}.</p>
        </div>
      </div>
      <div className="tab-toolbar">
        <div className="segmented">
          <button
            className={!savedOnly ? "active" : ""}
            aria-pressed={!savedOnly}
            onClick={() => setSavedOnly(false)}
          >
            All ideas
          </button>
          <button
            className={savedOnly ? "active" : ""}
            aria-pressed={savedOnly}
            onClick={() => setSavedOnly(true)}
          >
            Saved ideas (
            {plan.ideas.filter((existingIdea) => existingIdea.saved).length})
          </button>
        </div>
        <span className="source-badge">
          <Sparkles size={13} />
          {plan.source === "gemini"
            ? "Personalized with Gemini"
            : "Curated planning ideas"}
        </span>
      </div>
      <div className="idea-grid">
        {ideas.map((idea, index) => (
          <article className="panel idea-card" key={idea.id}>
            <div className={`idea-image idea-tone-${index % 3}`}>
              <Image
                src={index % 2 ? "/images/party.jpg" : "/images/table.jpg"}
                alt=""
                fill
                sizes="(max-width: 700px) 100vw, 400px"
              />
              <button
                className={`save-idea ${idea.saved ? "saved" : ""}`}
                aria-label={`${idea.saved ? "Unsave" : "Save"} idea: ${idea.title}`}
                aria-pressed={idea.saved}
                onClick={() =>
                  onUpdate({
                    ...plan,
                    ideas: plan.ideas.map((existingIdea) =>
                      existingIdea.id === idea.id
                        ? { ...existingIdea, saved: !existingIdea.saved }
                        : existingIdea,
                    ),
                  })
                }
              >
                <Heart size={19} fill={idea.saved ? "currentColor" : "none"} />
              </button>
            </div>
            <div className="idea-copy">
              <span className="idea-tag">{idea.tag}</span>
              <h3>{idea.title}</h3>
              <p>{idea.description}</p>
            </div>
          </article>
        ))}
      </div>
      {!ideas.length && (
        <div className="panel empty-state">
          <Heart size={30} />
          <h3>A place for your favorite ideas.</h3>
          <p>Tap the heart on an idea to keep it here.</p>
        </div>
      )}
      <div className="subtle-tip">
        <Plus size={17} />
        <p>
          Want a different direction? Tell your planning partner about a theme,
          tradition, or personal touch you’d love.
        </p>
      </div>
    </div>
  );
}

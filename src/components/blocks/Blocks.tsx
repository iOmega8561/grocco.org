import type { Block } from "../../content/types";
import { diagrams } from "../diagrams";
import { highlight } from "./highlight";
import { Picture } from "./Picture";
import { Video } from "./VideoBlock";

/** Renders a project page, block by block. Each block type has exactly one look. */
export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="blocks">
      {blocks.map((block, index) => (
        <BlockView key={index} block={block} />
      ))}
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "statement":
      return (
        <section className="b-statement page">
          <p className="b-statement__text">{block.text}</p>
          {block.detail && <p className="b-statement__detail">{block.detail}</p>}
        </section>
      );

    case "prose":
      return (
        <section className="b-prose page">
          {block.title && <h2 className="b-heading">{block.title}</h2>}
          <div className="b-prose__body">
            {block.paragraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </section>
      );

    case "features":
      return (
        <section className="b-features page">
          {block.title && <h2 className="b-heading">{block.title}</h2>}
          <div className="b-features__grid" data-count={block.items.length}>
            {block.items.map((item) => (
              <div key={item.title} className="b-features__item">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      );

    case "facts":
      return (
        <section className="b-facts page">
          <dl className="b-facts__list">
            {block.items.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      );

    case "code":
      return (
        <section className="b-code page">
          {block.title && <h2 className="b-heading">{block.title}</h2>}
          <figure className="b-code__figure">
            <div className="b-code__window">
              <p className="b-code__file">{block.file}</p>
              <pre tabIndex={0}>
                <code>{highlight(block.code, block.language)}</code>
              </pre>
            </div>
            {block.caption && <figcaption>{block.caption}</figcaption>}
          </figure>
        </section>
      );

    case "table":
      return (
        <section className="b-table page">
          {block.title && <h2 className="b-heading">{block.title}</h2>}
          <div className="b-table__scroll" tabIndex={0}>
            <table>
              <thead>
                <tr>
                  {block.columns.map((column, i) => (
                    <th key={i} scope="col">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) =>
                      c === 0 ? (
                        <th key={c} scope="row">
                          {cell}
                        </th>
                      ) : (
                        <td key={c}>{cell}</td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.caption && <p className="b-caption">{block.caption}</p>}
        </section>
      );

    case "media":
      return (
        <figure className={`b-media page b-media--${block.frame ?? "bare"}`}>
          <Picture src={block.src} srcDark={block.srcDark} alt={block.alt} />
          {block.caption && <figcaption className="b-caption">{block.caption}</figcaption>}
        </figure>
      );

    case "video":
      return (
        <figure className={`b-media page b-media--${block.frame ?? "bare"}`}>
          <Video src={block.src} poster={block.poster} srcDark={block.srcDark} posterDark={block.posterDark} alt={block.alt} />
          {block.caption && <figcaption className="b-caption">{block.caption}</figcaption>}
        </figure>
      );

    case "gallery":
      return (
        <section className="b-gallery page">
          {block.title && <h2 className="b-heading">{block.title}</h2>}
          <div className="b-gallery__grid" data-count={block.items.length}>
            {block.items.map((item) => (
              <figure key={item.src} className="b-gallery__item">
                <Picture src={item.src} srcDark={item.srcDark} alt={item.alt} />
                {item.caption && <figcaption>{item.caption}</figcaption>}
              </figure>
            ))}
          </div>
          {block.caption && <p className="b-caption">{block.caption}</p>}
        </section>
      );

    case "pipeline":
      return (
        <section className="b-pipeline page">
          {block.title && <h2 className="b-heading">{block.title}</h2>}
          <ol className="b-pipeline__steps" data-count={block.steps.length}>
            {block.steps.map((step, i) => (
              <li key={step.title}>
                <span className="b-pipeline__n" aria-hidden="true">
                  {i + 1}
                </span>
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
              </li>
            ))}
          </ol>
          {block.caption && <p className="b-caption">{block.caption}</p>}
        </section>
      );

    case "diagram": {
      const Diagram = diagrams[block.name];
      return (
        <figure className="b-diagram page">
          <Diagram />
          {block.caption && <figcaption className="b-caption">{block.caption}</figcaption>}
        </figure>
      );
    }
  }
}

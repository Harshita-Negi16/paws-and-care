import './Articles.css'

const articlesData = [
  {
    id: 1,
    category: 'General Pet Care',
    title: 'The Essentials of Pet Care',
    source: 'American Veterinary Medical Association (AVMA)',
    excerpt:
      'A helpful overview of everyday pet care habits, from preventive checkups to nutrition, exercise and healthy routines for long-term wellbeing.',
    image:
      'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Dog staring calmly in a sunny outdoor setting',
    link: 'https://avma.org/resources-tools/pet-owners/petcare'
  },
  {
    id: 2,
    category: 'Nutrition',
    title: 'Dog Nutrition Tips',
    source: 'ASPCA',
    excerpt:
      'Practical guidance on choosing balanced nutrition, understanding portion sizes and supporting your dog with healthy feeding habits.',
    image:
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Happy dog receiving gentle care during a veterinary visit',
    link: 'https://www.aspca.org/pet-care/dog-care/dog-nutrition-tips'
  },
  {
    id: 3,
    category: 'Pet Wellness',
    title: 'Understanding Your Pet\'s Dental Health',
    source: 'American Veterinary Medical Association (AVMA)',
    excerpt:
      'Simple tips for noticing early signs of oral issues, maintaining healthy gums and protecting your pet from preventable dental problems.',
    image:
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Two dogs enjoying a calm, social outdoor environment',
    link: 'https://avma.org/PetDental'
  }
]

function Articles() {
  return (
    <section id="articles" className="articles-section">
      <div className="container">
        <div className="articles-header">
          <span className="articles-badge">Pet Health Insights</span>
          <h2 className="articles-title">Helpful Articles</h2>
          <p className="articles-intro">
            Practical guidance to help you support your pet&apos;s health, comfort and happiness at every life stage.
          </p>
        </div>

        <div className="articles-grid">
          {articlesData.map(article => (
            <article key={article.id} className="article-card">
              <div className="article-image-wrapper">
                <img src={article.image} alt={article.imageAlt} className="article-image" loading="lazy" />
                <span className="article-category">{article.category}</span>
              </div>

              <div className="article-body">
                <p className="article-meta">{article.source}</p>
                <h3 className="article-title">{article.title}</h3>
                <p className="article-excerpt">{article.excerpt}</p>

                <div className="article-footer">
                  <a
                    href={article.link}
                    className="article-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Read Article
                    <svg
                      className="article-link-arrow"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      width="16"
                      height="16"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Articles

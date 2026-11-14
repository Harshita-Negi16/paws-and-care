import './Reviews.css'

const reviewsData = [
  {
    id: 1,
    name: 'Maya',
    pet: 'Luna',
    review:
      'The team was thoughtful, calm and incredibly reassuring from the moment we arrived. Luna felt safe, and we left feeling informed and supported.',
    rating: 5
  },
  {
    id: 2,
    name: 'Oliver',
    pet: 'Teddy',
    review:
      'Every part of the visit felt organised and gentle. The staff explained everything clearly, and Teddy was looked after with so much care.',
    rating: 5
  },
  {
    id: 3,
    name: 'Sofia',
    pet: 'Bruno',
    review:
      'We appreciated how patient and kind everyone was. The advice they gave us helped us feel more confident about Bruno’s health and routine care.',
    rating: 5
  }
]

function Reviews() {
  return (
    <section id="reviews" className="reviews-section">
      <div className="container">
        <div className="reviews-header">
          <span className="reviews-badge">Kind Words From Pet Parents</span>
          <h2 className="reviews-title">The trust of pet parents means everything.</h2>
        </div>

        <div className="reviews-grid">
          {reviewsData.map(review => (
            <article key={review.id} className="review-card">
              <div className="review-stars" aria-label="Five out of five stars">
                {Array.from({ length: review.rating }, (_, index) => (
                  <span key={`${review.id}-star-${index}`} aria-hidden="true">
                    ★
                  </span>
                ))}
              </div>

              <p className="review-text">“{review.review}”</p>

              <div className="review-footer">
                <span className="review-name">{review.name}</span>
                <span className="review-pet">{review.pet}</span>
              </div>
            </article>
          ))}
        </div>

        <p className="reviews-note">Sample reviews for demonstration purposes</p>
      </div>
    </section>
  )
}

export default Reviews
